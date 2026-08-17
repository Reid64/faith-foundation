import fs from "node:fs";
import path from "node:path";
import { test, expect, type Page } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";

/**
 * Board meeting room — WebRTC rebuild (Phase 21).
 *
 * Asserts the surfaces the rebuild exists to provide: the branded pre-join
 * screen with device selection, the custom participant GRID, and the control
 * bar. With the Jitsi iframe there was no grid to assert — the video lived in
 * a third party's DOM.
 *
 * WHAT THIS CANNOT PROVE. One browser cannot demonstrate a peer connection.
 * Everything here is single-participant: the local tile, the controls, the
 * teardown. Offer/answer exchange, ICE negotiation, the six-participant cap and
 * the ICE-restart path need two real browsers in one room and are listed as
 * unverified in governance rather than implied here.
 *
 * RUN:
 *   pnpm run build; pnpm start -p 3200
 *   $env:AUDIT_BASE_URL = "http://localhost:3200"
 *   npx playwright test scripts/meeting-room.spec.ts
 *
 * Needs SUPABASE_SERVICE_ROLE_KEY in .env.local to create the throwaway board
 * account. Without it the whole file skips rather than failing for the wrong
 * reason.
 */

function readEnvLocal(): Record<string, string> {
  const file = path.join(process.cwd(), ".env.local");
  if (!fs.existsSync(file)) return {};
  const out: Record<string, string> = {};
  for (const line of fs.readFileSync(file, "utf8").split(/\r?\n/)) {
    const match = /^([A-Z0-9_]+)\s*=\s*(.*)$/.exec(line.trim());
    if (match) out[match[1]] = match[2].replace(/^["']|["']$/g, "");
  }
  return out;
}

const env = readEnvLocal();
const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const SERVICE_KEY = env.SUPABASE_SERVICE_ROLE_KEY ?? "";
const CONFIGURED = Boolean(SUPABASE_URL && SERVICE_KEY);

const EMAIL = `p21-room-${Date.now().toString(36)}@faithproof.invalid`;
const PASSWORD = "Sm0ke-Test-P21room";

let userId: string | null = null;
let meetingId: string | null = null;

const admin = CONFIGURED
  ? createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false } })
  : null;

/**
 * The synthetic camera lives in playwright.config.ts, not here: launchOptions
 * set through test.use() were silently ignored in this setup (the browser is
 * already launched for the worker), and the symptom was a Join button that
 * never enabled. The permission grant still belongs at file scope.
 */
test.use({ permissions: ["camera", "microphone"] });

test.beforeAll(async () => {
  test.skip(!CONFIGURED, "needs SUPABASE_SERVICE_ROLE_KEY in .env.local");
  if (!admin) return;

  const { data: created, error } = await admin.auth.admin.createUser({
    email: EMAIL,
    password: PASSWORD,
    email_confirm: true,
    user_metadata: { full_name: "Phase 21 Room Test" },
  });
  if (error) throw new Error("createUser: " + error.message);
  userId = created.user.id;

  // The room is board-only, so the throwaway account is promoted.
  await admin.from("profiles").update({ role: "board" }).eq("id", userId);

  const { data: meeting, error: mErr } = await admin
    .from("board_meetings")
    .insert({
      meeting_date: "2026-09-01",
      type: "regular",
      agenda: "P21 ROOM TEST - delete me",
    })
    .select("id")
    .single();
  if (mErr) throw new Error("meeting: " + mErr.message);
  meetingId = meeting.id;
});

test.afterAll(async () => {
  if (!admin) return;
  if (meetingId) await admin.from("board_meetings").delete().eq("id", meetingId);
  if (userId) {
    const del = await admin.auth.admin.deleteUser(userId);
    // audit_log.actor_id references profiles with no cascade, on purpose.
    if (del.error) {
      await admin.from("profiles").update({ role: "public" }).eq("id", userId);
    }
  }
});

async function signIn(page: Page) {
  await page.goto("/login/", { waitUntil: "domcontentloaded" });
  await page.fill("#email", EMAIL);
  await page.fill("#password", PASSWORD);
  await page.getByRole("button", { name: /sign in/i }).click();
  await page.waitForURL(/\/admin/, { timeout: 30_000 });
}

/**
 * Make ONE kind of device fail, the way a real machine does.
 *
 * Chromium cannot be persuaded to deny a single device here: without
 * `--use-fake-ui-for-media-stream` it provides no media at all
 * (NotSupportedError), and with it every prompt is auto-accepted regardless of
 * which permissions the context granted — both measured, not assumed. So the
 * failure is injected at `getUserMedia` itself, wrapping the real one so the
 * kind that should succeed still returns a genuine track.
 *
 * WHAT THIS PROVES: this codebase's branching — independent acquisition, the
 * per-device message, and the Join gating. WHAT IT DOES NOT PROVE: that Chrome
 * raises those errors in those situations. That is specified behaviour, and the
 * operator already demonstrated it live on a webcam with no microphone.
 */
async function failDevice(
  page: Page,
  which: "video" | "audio" | "both",
  errorName = "NotFoundError"
) {
  await page.addInitScript(
    ([kind, name]) => {
      const media = navigator.mediaDevices;
      const original = media.getUserMedia.bind(media);
      media.getUserMedia = (constraints?: MediaStreamConstraints) => {
        const wantsVideo = Boolean(constraints?.video);
        const wantsAudio = Boolean(constraints?.audio);
        const blocked =
          kind === "both" ||
          (kind === "video" && wantsVideo) ||
          (kind === "audio" && wantsAudio);
        if (blocked) {
          return Promise.reject(
            new DOMException(`${name} (injected by the test)`, name)
          );
        }
        return original(constraints);
      };
    },
    [which, errorName] as const
  );
}

test.describe("BOARD MEETING ROOM — WebRTC", () => {
  test("pre-join screen renders with preview and device selection", async ({
    page,
  }) => {
    await signIn(page);
    await page.goto(`/admin/board/meetings/${meetingId}/room/`, {
      waitUntil: "domcontentloaded",
    });

    await expect(page.getByTestId("room-prejoin")).toBeVisible();
    await expect(page.getByTestId("room-preview")).toBeVisible();
    await expect(page.getByTestId("room-camera-select")).toBeVisible();
    await expect(page.getByTestId("room-mic-select")).toBeVisible();
    await expect(page.getByTestId("room-join")).toBeVisible();

    // Branding, and the meeting it belongs to.
    await expect(page.getByText("FAITH Foundation").first()).toBeVisible();
    await expect(
      page.getByRole("heading", { name: /board meeting/i })
    ).toBeVisible();
  });

  test("the grid and control bar render after joining", async ({ page }) => {
    await signIn(page);
    await page.goto(`/admin/board/meetings/${meetingId}/room/`, {
      waitUntil: "domcontentloaded",
    });

    // Join is disabled until the local stream exists, so this also proves the
    // fake camera was acquired.
    const join = page.getByTestId("room-join");
    await expect(join).toBeEnabled({ timeout: 20_000 });
    await join.click();

    await expect(page.getByTestId("room-shell")).toBeVisible();
    await expect(page.getByTestId("room-grid")).toBeVisible();
    await expect(page.getByTestId("room-controls")).toBeVisible();
    await expect(page.getByTestId("room-sidebar")).toBeVisible();

    // Own tile, with a video element inside it.
    const tiles = page.getByTestId("room-tile");
    await expect(tiles).toHaveCount(1);
    await expect(tiles.first().locator("video")).toBeAttached();

    // Every control the rebuild is required to keep.
    await expect(page.getByTestId("room-mic")).toBeVisible();
    await expect(page.getByTestId("room-cam")).toBeVisible();
    await expect(page.getByTestId("room-share")).toBeVisible();
    await expect(page.getByRole("button", { name: /leave meeting/i })).toBeVisible();
  });

  test("mute and camera controls change state", async ({ page }) => {
    await signIn(page);
    await page.goto(`/admin/board/meetings/${meetingId}/room/`, {
      waitUntil: "domcontentloaded",
    });
    await page.getByTestId("room-join").click();
    await expect(page.getByTestId("room-controls")).toBeVisible();

    const mic = page.getByTestId("room-mic");
    await expect(mic).toHaveAttribute("aria-label", /mute microphone/i);
    await mic.click();
    await expect(mic).toHaveAttribute("aria-label", /unmute microphone/i);

    const cam = page.getByTestId("room-cam");
    await expect(cam).toHaveAttribute("aria-label", /turn camera off/i);
    await cam.click();
    await expect(cam).toHaveAttribute("aria-label", /turn camera on/i);
  });

  test("leaving returns to the meeting record", async ({ page }) => {
    await signIn(page);
    await page.goto(`/admin/board/meetings/${meetingId}/room/`, {
      waitUntil: "domcontentloaded",
    });
    await page.getByTestId("room-join").click();
    await expect(page.getByTestId("room-shell")).toBeVisible();

    await page.getByRole("button", { name: /leave meeting/i }).click();
    await page.waitForURL(new RegExp(`/admin/board/meetings/${meetingId}`), {
      timeout: 20_000,
    });
    await expect(page.getByTestId("room-shell")).toHaveCount(0);
  });

  test("no Jitsi anywhere in the room", async ({ page }) => {
    await signIn(page);
    await page.goto(`/admin/board/meetings/${meetingId}/room/`, {
      waitUntil: "domcontentloaded",
    });

    const html = await page.content();
    expect(html).not.toMatch(/jitsi/i);
    expect(html).not.toContain("meet.jit.si");
    await expect(page.locator('iframe[src*="jit.si"]')).toHaveCount(0);
  });

  test("the room is closed to a user who is not board or admin", async ({
    page,
  }) => {
    test.skip(!admin, "needs service role");
    // Demote mid-suite, then restore: proves the gate, not just the happy path.
    await admin!.from("profiles").update({ role: "staff" }).eq("id", userId!);
    try {
      await signIn(page);
      await page.goto(`/admin/board/meetings/${meetingId}/room/`, {
        waitUntil: "domcontentloaded",
      });
      await page.waitForLoadState("networkidle");
      expect(page.url()).not.toContain("/room");
      await expect(page.getByTestId("room-prejoin")).toHaveCount(0);
    } finally {
      await admin!.from("profiles").update({ role: "board" }).eq("id", userId!);
    }
  });

  test("a missing MICROPHONE still lets you join with video", async ({ page }) => {
    await failDevice(page, "audio", "NotFoundError");
    await signIn(page);
    await page.goto(`/admin/board/meetings/${meetingId}/room/`, {
      waitUntil: "domcontentloaded",
    });

    // The exact defect the operator hit: camera fine, no microphone, locked out.
    const join = page.getByTestId("room-join");
    await expect(join).toBeEnabled({ timeout: 20_000 });
    await expect(join).toHaveText(/join meeting/i);

    // The notice names the microphone and nothing else.
    const notice = page.getByTestId("room-audio-notice");
    await expect(notice).toBeVisible();
    await expect(notice).toContainText(/no microphone was found/i);
    await expect(page.getByTestId("room-video-notice")).toHaveCount(0);

    // The mic control says what is true rather than pretending.
    await expect(page.getByTestId("prejoin-mic")).toBeDisabled();
    await expect(page.getByTestId("prejoin-mic")).toHaveText(/no microphone/i);
    await expect(page.getByTestId("prejoin-cam")).toBeEnabled();

    await join.click();
    await expect(page.getByTestId("room-grid")).toBeVisible();
    await expect(page.getByTestId("room-tile")).toHaveCount(1);
  });

  test("a missing CAMERA still lets you join with audio", async ({ page }) => {
    await failDevice(page, "video", "NotFoundError");
    await signIn(page);
    await page.goto(`/admin/board/meetings/${meetingId}/room/`, {
      waitUntil: "domcontentloaded",
    });

    const join = page.getByTestId("room-join");
    await expect(join).toBeEnabled({ timeout: 20_000 });
    await expect(join).toHaveText(/join meeting/i);

    const notice = page.getByTestId("room-video-notice");
    await expect(notice).toBeVisible();
    await expect(notice).toContainText(/no camera was found/i);
    await expect(page.getByTestId("room-audio-notice")).toHaveCount(0);

    await expect(page.getByTestId("prejoin-cam")).toBeDisabled();
    await expect(page.getByTestId("prejoin-mic")).toBeEnabled();

    await join.click();
    await expect(page.getByTestId("room-grid")).toBeVisible();
  });

  test("neither device still allows observer entry", async ({ page }) => {
    await failDevice(page, "both", "NotFoundError");
    await signIn(page);
    await page.goto(`/admin/board/meetings/${meetingId}/room/`, {
      waitUntil: "domcontentloaded",
    });

    const join = page.getByTestId("room-join");
    await expect(join).toBeEnabled({ timeout: 20_000 });
    await expect(join).toHaveText(/join as observer/i);
    await expect(page.getByTestId("room-observer-note")).toBeVisible();
    await expect(page.getByTestId("room-video-notice")).toBeVisible();
    await expect(page.getByTestId("room-audio-notice")).toBeVisible();

    // The point of observer mode: you get in.
    await join.click();
    await expect(page.getByTestId("room-shell")).toBeVisible();
    await expect(page.getByTestId("room-grid")).toBeVisible();
    await expect(page.getByTestId("room-controls")).toBeVisible();
  });

  test("a BLOCKED microphone reads differently from a missing one", async ({
    page,
  }) => {
    await failDevice(page, "audio", "NotAllowedError");
    await signIn(page);
    await page.goto(`/admin/board/meetings/${meetingId}/room/`, {
      waitUntil: "domcontentloaded",
    });

    const notice = page.getByTestId("room-audio-notice");
    await expect(notice).toBeVisible();
    // Permission wording, not "not found" — the remedy is different.
    await expect(notice).toContainText(/blocked for this site/i);
    await expect(notice).toContainText(/padlock/i);
    await expect(page.getByTestId("room-join")).toBeEnabled();
  });

  test("a microphone held by another app reads differently again", async ({
    page,
  }) => {
    await failDevice(page, "audio", "NotReadableError");
    await signIn(page);
    await page.goto(`/admin/board/meetings/${meetingId}/room/`, {
      waitUntil: "domcontentloaded",
    });

    const notice = page.getByTestId("room-audio-notice");
    await expect(notice).toBeVisible();
    await expect(notice).toContainText(/already in use by another application/i);
    await expect(page.getByTestId("room-join")).toBeEnabled();
  });

  test("the meeting detail page links to the room without typing a URL", async ({
    page,
  }) => {
    await signIn(page);
    await page.goto(`/admin/board/meetings/${meetingId}/`, {
      waitUntil: "domcontentloaded",
    });

    const join = page.getByTestId("join-video-meeting");
    await expect(join).toBeVisible();
    await expect(join).toHaveText(/join video meeting/i);

    // Reachable by clicking only — the defect was that this did not exist.
    await join.click();
    await page.waitForURL(/\/room\/?$/, { timeout: 20_000 });
    await expect(page.getByTestId("room-prejoin")).toBeVisible();
  });

  test("the meeting detail page also links to the minutes", async ({ page }) => {
    await signIn(page);
    await page.goto(`/admin/board/meetings/${meetingId}/`, {
      waitUntil: "domcontentloaded",
    });

    const minutes = page.getByTestId("open-minutes");
    await expect(minutes).toBeVisible();
    await minutes.click();
    await page.waitForURL(/\/minutes\/?$/, { timeout: 20_000 });
  });
});
