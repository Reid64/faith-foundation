"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { BTN_PRIMARY, BTN_SECONDARY, CONTROL } from "../_components/theme";
import { Badge } from "../_components/ui";

/**
 * Two-factor authentication — ENROLLMENT ONLY.
 *
 * WHAT THIS DOES NOT DO, stated first because it is the thing most easily
 * misread: enrolling here does NOT make a second factor required at sign-in.
 * Supabase issues an `aal1` session for a password login and only steps up to
 * `aal2` if the application asks it to. Nothing in this codebase asks —
 * middleware is untouched and the login page is unchanged — so a user who
 * enrols can still sign in with a password alone.
 *
 * That is deliberate. Enforcement is a separate, operator-run decision with a
 * lockout risk attached (see OPERATOR_ACTIONS.md), and switching it on
 * unattended could lock four directors out of their own board portal. So the UI
 * says plainly that the factor is registered but not yet required, rather than
 * implying a protection that is not in force.
 *
 * TOTP only. Supabase's phone/SMS factor is a paid add-on ($75/month plus
 * per-message fees); TOTP is free on every project.
 *
 * RECOVERY. Supabase does not issue one-time recovery codes. The documented
 * recovery path is a SECOND enrolled factor, which is why this screen pushes
 * for one rather than burying it.
 */

type Factor = {
  id: string;
  friendly_name?: string | null;
  factor_type: string;
  status: string;
  created_at?: string;
};

type Enrolling = {
  factorId: string;
  qr: string;
  secret: string;
};

/**
 * Supabase refuses `enroll` and `unenroll` from an `aal1` session once the
 * account already holds a verified factor — it answers "AAL2 required to enroll
 * a new factor". That is sensible (otherwise anyone with a stolen password
 * could quietly add their own authenticator) but it means the backup factor,
 * which is the ONLY recovery path here, cannot be added by someone who just
 * signed in with a password.
 *
 * So this screen steps the session up on demand: prove the authenticator you
 * already have, then add or remove one. This is voluntary and local to this
 * page — it does not make anything required at sign-in.
 */
type StepUp = {
  factorId: string;
  challengeId: string;
  /** What to do once the session reaches aal2. */
  action: { kind: "enroll" } | { kind: "remove"; factor: Factor };
};

const APPS = "Google Authenticator, Authy, 1Password, or Microsoft Authenticator";

export function MfaSection() {
  const [factors, setFactors] = useState<Factor[]>([]);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState<Enrolling | null>(null);
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [showSecret, setShowSecret] = useState(false);
  const [stepUp, setStepUp] = useState<StepUp | null>(null);
  const [stepUpCode, setStepUpCode] = useState("");
  const [aal, setAal] = useState<string | null>(null);

  const supabase = createClient();

  const refresh = useCallback(async () => {
    const { data: aalData } =
      await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
    setAal(aalData?.currentLevel ?? null);

    const { data, error: listError } = await supabase.auth.mfa.listFactors();
    if (listError) {
      setError(listError.message);
      setLoading(false);
      return;
    }
    // `totp` holds verified factors; `all` includes unverified ones left behind
    // by an abandoned enrolment, which would otherwise be invisible and
    // un-removable from this screen.
    const all = (data?.all ?? data?.totp ?? []) as Factor[];
    setFactors(all.filter((f) => f.factor_type === "totp"));
    setLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const verified = factors.filter((f) => f.status === "verified");
  const pending = factors.filter((f) => f.status !== "verified");

  /**
   * True when Supabase will refuse a change because the session is only aal1.
   * Nothing to prove if there is no verified factor yet — the first enrolment
   * works straight from a password session, which is what makes opting in
   * possible at all.
   */
  const needsStepUp = verified.length > 0 && aal !== "aal2";

  /** Challenge the authenticator the user already has, then run `action`. */
  async function beginStepUp(action: StepUp["action"]) {
    const target = verified[0];
    if (!target) return;
    setBusy(true);
    setError(null);
    setNotice(null);

    const { data, error: challengeError } = await supabase.auth.mfa.challenge({
      factorId: target.id,
    });
    if (challengeError || !data) {
      setError(
        challengeError?.message ??
          "Could not start verification with your existing authenticator."
      );
      setBusy(false);
      return;
    }

    setStepUp({ factorId: target.id, challengeId: data.id, action });
    setStepUpCode("");
    setBusy(false);
  }

  async function confirmStepUp(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!stepUp || busy) return;

    const entered = stepUpCode.replace(/\s/g, "");
    if (!/^\d{6}$/.test(entered)) {
      setError("Enter the six digit code from the authenticator you already have.");
      return;
    }

    setBusy(true);
    setError(null);

    const { error: verifyError } = await supabase.auth.mfa.verify({
      factorId: stepUp.factorId,
      challengeId: stepUp.challengeId,
      code: entered,
    });

    if (verifyError) {
      setError(
        `${verifyError.message}. If the code looks right, check that the time on your phone is set automatically — TOTP codes depend on the clock.`
      );
      setBusy(false);
      return;
    }

    const action = stepUp.action;
    setStepUp(null);
    setStepUpCode("");
    setAal("aal2");
    setBusy(false);

    if (action.kind === "enroll") {
      await startEnrollment(true);
    } else {
      await doRemove(action.factor);
    }
  }

  function cancelStepUp() {
    setStepUp(null);
    setStepUpCode("");
    setError(null);
  }

  async function startEnrollment(stepped = false) {
    if (busy) return;

    // Adding a backup needs the first one proved. Ask for it rather than
    // letting Supabase answer with a raw "AAL2 required" string.
    if (!stepped && needsStepUp) {
      await beginStepUp({ kind: "enroll" });
      return;
    }

    setBusy(true);
    setError(null);
    setNotice(null);

    // A friendly name must be unique PER USER or Supabase refuses the enrolment.
    // Minute precision was not enough: adding a backup factor immediately after
    // the first one — the exact flow this screen encourages — collided.
    const stamp = new Date().toISOString().slice(0, 19).replace("T", " ");
    const friendlyName = `Authenticator ${stamp} ${Math.random()
      .toString(36)
      .slice(2, 6)}`;

    const { data, error: enrollError } = await supabase.auth.mfa.enroll({
      factorType: "totp",
      friendlyName,
    });

    if (enrollError || !data) {
      setError(
        enrollError?.message ??
          "That authenticator could not be registered. Try again."
      );
      setBusy(false);
      return;
    }

    setEnrolling({
      factorId: data.id,
      qr: data.totp.qr_code,
      secret: data.totp.secret,
    });
    setCode("");
    setShowSecret(false);
    setBusy(false);
  }

  async function confirmEnrollment(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!enrolling || busy) return;

    const entered = code.replace(/\s/g, "");
    if (!/^\d{6}$/.test(entered)) {
      setError("Enter the six digit code shown in your authenticator app.");
      return;
    }

    setBusy(true);
    setError(null);

    const { data: challenge, error: challengeError } =
      await supabase.auth.mfa.challenge({ factorId: enrolling.factorId });

    if (challengeError || !challenge) {
      setError(challengeError?.message ?? "Could not start verification.");
      setBusy(false);
      return;
    }

    const { error: verifyError } = await supabase.auth.mfa.verify({
      factorId: enrolling.factorId,
      challengeId: challenge.id,
      code: entered,
    });

    if (verifyError) {
      // The commonest cause by far is clock drift on the phone, and the message
      // says so rather than just "invalid".
      setError(
        `${verifyError.message}. If the code looks right, check that the time on your phone is set automatically — TOTP codes depend on the clock.`
      );
      setBusy(false);
      return;
    }

    setEnrolling(null);
    setCode("");
    setNotice(
      "Authenticator registered. It is not required at sign-in yet — see the note below."
    );
    setBusy(false);
    await refresh();
  }

  async function cancelEnrollment() {
    if (!enrolling) return;
    setBusy(true);
    // Remove the half-finished factor rather than leaving an unverified one
    // cluttering the account.
    await supabase.auth.mfa.unenroll({ factorId: enrolling.factorId });
    setEnrolling(null);
    setCode("");
    setBusy(false);
    await refresh();
  }

  async function remove(factor: Factor) {
    if (busy) return;
    const last = verified.length <= 1 && factor.status === "verified";
    const message = last
      ? "Remove your only authenticator? You will have no second factor registered at all."
      : "Remove this authenticator?";
    if (!window.confirm(message)) return;

    // Removing a factor is exactly what an attacker with a stolen password
    // would try first, so Supabase requires aal2 here too.
    if (needsStepUp) {
      await beginStepUp({ kind: "remove", factor });
      return;
    }

    await doRemove(factor);
  }

  async function doRemove(factor: Factor) {
    setBusy(true);
    setError(null);
    const { error: removeError } = await supabase.auth.mfa.unenroll({
      factorId: factor.id,
    });
    if (removeError) {
      setError(removeError.message);
      setBusy(false);
      return;
    }
    setNotice("Authenticator removed.");
    setBusy(false);
    await refresh();
  }

  return (
    <div data-testid="mfa-section">
      {/* ── What is registered ─────────────────────────────────────────── */}
      {loading ? (
        <p className="text-sm" style={{ color: "#6b7280" }}>
          Checking your authenticators…
        </p>
      ) : (
        <>
          <div className="flex flex-wrap items-center gap-3 pb-3">
            <Badge tone={verified.length > 0 ? "green" : "gray"}>
              {verified.length === 0
                ? "No authenticator"
                : `${verified.length} registered`}
            </Badge>
            {verified.length === 1 ? (
              <span className="text-sm" style={{ color: "#d97706" }}>
                No backup — see below.
              </span>
            ) : null}
          </div>

          {verified.length === 0 ? (
            <p className="text-sm leading-relaxed" style={{ color: "#374151" }}>
              You have not registered an authenticator app. Two-factor
              authentication is optional today.
            </p>
          ) : (
            <ul className="divide-y divide-[#f0f0ef]">
              {verified.map((factor) => (
                <li
                  key={factor.id}
                  className="flex flex-wrap items-center justify-between gap-3 py-3"
                >
                  <span>
                    <span
                      className="block text-sm font-medium"
                      style={{ color: "#111827" }}
                    >
                      {factor.friendly_name || "Authenticator"}
                    </span>
                    <span className="block text-xs" style={{ color: "#9ca3af" }}>
                      Registered
                      {factor.created_at
                        ? ` ${new Date(factor.created_at).toLocaleDateString("en-US")}`
                        : ""}
                    </span>
                  </span>
                  <button
                    type="button"
                    onClick={() => void remove(factor)}
                    disabled={busy}
                    className="text-sm font-semibold"
                    style={{ color: "#dc2626" }}
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          )}

          {pending.length > 0 ? (
            <p className="mt-3 text-xs" style={{ color: "#9ca3af" }}>
              {pending.length} unfinished registration
              {pending.length === 1 ? "" : "s"} left over from a cancelled
              attempt. Starting again replaces
              {pending.length === 1 ? " it" : " them"}.
            </p>
          ) : null}
        </>
      )}

      {/* ── The backup-factor warning, deliberately prominent ───────────── */}
      {!loading && verified.length === 1 ? (
        <div
          className="mt-4 rounded-lg px-4 py-3"
          data-testid="mfa-backup-warning"
          style={{
            backgroundColor: "#fffbeb",
            border: "1px solid #fde68a",
          }}
        >
          <p className="text-sm font-semibold" style={{ color: "#92400e" }}>
            Register a second authenticator
          </p>
          <p className="mt-1 text-sm leading-relaxed" style={{ color: "#92400e" }}>
            Supabase does not issue printable recovery codes. A second
            authenticator — on a tablet, a spare phone, or a desktop password
            manager — is the only self-service way back in if you lose the first
            device. With one factor and a lost phone, an administrator has to
            remove the factor for you.
          </p>
        </div>
      ) : null}

      {/* Which apps work — visible BEFORE enrolling, because that is when a
          director needs to know what to install. It used to appear only once
          the QR code was on screen, which is too late to be guidance. */}
      <p
        className="mt-4 text-sm leading-relaxed"
        data-testid="mfa-apps"
        style={{ color: "#6b7280" }}
      >
        Works with {APPS}. Any app that supports standard TOTP codes will do —
        there is nothing to buy and no account to create with us.
      </p>

      {/* ── Step-up: prove the authenticator you already have ───────────── */}
      {stepUp ? (
        <form onSubmit={confirmStepUp} className="mt-5" data-testid="mfa-stepup">
          <p className="text-sm leading-relaxed" style={{ color: "#374151" }}>
            {stepUp.action.kind === "enroll"
              ? "Before adding another authenticator, confirm the one you already have."
              : "Before removing an authenticator, confirm the one you already have."}{" "}
            Enter the six digit code it is showing now.
          </p>

          <label
            htmlFor="mfa-stepup-code"
            className="mt-4 block text-sm font-medium"
            style={{ color: "#374151" }}
          >
            Six digit code
          </label>
          <input
            id="mfa-stepup-code"
            data-testid="mfa-stepup-code"
            value={stepUpCode}
            onChange={(e) => setStepUpCode(e.target.value)}
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={7}
            placeholder="123456"
            className={`${CONTROL} mt-1.5 max-w-[10rem] tracking-[0.3em]`}
          />

          <div className="mt-5 flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={busy}
              data-testid="mfa-stepup-verify"
              className={BTN_PRIMARY}
            >
              {busy ? "Confirming…" : "Confirm"}
            </button>
            <button
              type="button"
              onClick={cancelStepUp}
              disabled={busy}
              className={BTN_SECONDARY}
            >
              Cancel
            </button>
          </div>

          <p className="mt-3 text-xs leading-relaxed" style={{ color: "#6b7280" }}>
            Lost the device this code comes from? You cannot get past this step
            on your own — an administrator has to remove the factor for you. That
            is the reason for the backup above.
          </p>
        </form>
      ) : /* ── Enrolment ────────────────────────────────────────────────── */
      enrolling ? (
        <form onSubmit={confirmEnrollment} className="mt-5">
          <p className="text-sm leading-relaxed" style={{ color: "#374151" }}>
            Scan this with {APPS}, then enter the six digit code it shows.
          </p>

          <div className="mt-4 flex flex-wrap items-start gap-6">
            <div
              className="rounded-xl bg-white p-3"
              style={{ border: "1px solid #e5e7eb" }}
            >
              {/* Supabase returns the QR as an SVG data URI. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={enrolling.qr}
                alt="QR code for your authenticator app"
                data-testid="mfa-qr"
                width={180}
                height={180}
              />
            </div>

            <div className="min-w-[16rem] flex-1">
              <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "#6b7280" }}>
                Cannot scan?
              </p>
              <p className="mt-1 text-sm" style={{ color: "#374151" }}>
                Type this key into your app instead.
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <code
                  data-testid="mfa-secret"
                  className="select-all break-all rounded px-2 py-1 text-sm"
                  style={{ backgroundColor: "#f3f4f6", color: "#111827" }}
                >
                  {showSecret ? enrolling.secret : "•".repeat(32)}
                </code>
                <button
                  type="button"
                  onClick={() => setShowSecret((v) => !v)}
                  className="text-sm font-semibold"
                  style={{ color: "#013e37" }}
                >
                  {showSecret ? "Hide" : "Show"}
                </button>
              </div>

              <label
                htmlFor="mfa-code"
                className="mt-4 block text-sm font-medium"
                style={{ color: "#374151" }}
              >
                Six digit code
              </label>
              <input
                id="mfa-code"
                data-testid="mfa-code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={7}
                placeholder="123456"
                className={`${CONTROL} mt-1.5 max-w-[10rem] tracking-[0.3em]`}
              />
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={busy}
              data-testid="mfa-verify"
              className={BTN_PRIMARY}
            >
              {busy ? "Verifying…" : "Verify and register"}
            </button>
            <button
              type="button"
              onClick={() => void cancelEnrollment()}
              disabled={busy}
              className={BTN_SECONDARY}
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <>
          <button
            type="button"
            onClick={() => void startEnrollment()}
            disabled={busy || loading}
            data-testid="mfa-enroll"
            className={`${BTN_PRIMARY} mt-5`}
          >
            {verified.length === 0
              ? "Set up an authenticator app"
              : "Add a backup authenticator"}
          </button>
          {needsStepUp ? (
            <p className="mt-2 text-xs" style={{ color: "#6b7280" }}>
              You will be asked for a code from your existing authenticator
              first.
            </p>
          ) : null}
        </>
      )}

      {error ? (
        <p
          role="alert"
          className="mt-4 rounded-lg px-3 py-2 text-sm"
          style={{
            backgroundColor: "#fef2f2",
            color: "#dc2626",
            border: "1px solid #fecaca",
          }}
        >
          {error}
        </p>
      ) : null}

      {notice ? (
        <p
          role="status"
          className="mt-4 rounded-lg px-3 py-2 text-sm"
          style={{
            backgroundColor: "#f0fdf4",
            color: "#16a34a",
            border: "1px solid #bbf7d0",
          }}
        >
          {notice}
        </p>
      ) : null}

      {/* ── The honest caveat ──────────────────────────────────────────── */}
      <p
        className="mt-5 text-xs leading-relaxed"
        data-testid="mfa-not-enforced"
        style={{ color: "#6b7280" }}
      >
        <strong>Not required at sign-in yet.</strong> Registering an
        authenticator records it against your account, but this site still
        accepts a password on its own. Turning that into a requirement is a
        separate change an administrator makes deliberately, because it can lock
        someone out — the steps are written up in
        <code className="mx-1">governance/OPERATOR_ACTIONS.md</code>. Until then,
        treat this as getting ready rather than as protection.
      </p>
    </div>
  );
}
