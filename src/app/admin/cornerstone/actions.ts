"use server";

import { revalidatePath } from "next/cache";
import {
  describeDbError,
  getSession,
  writeAuditLog,
} from "@/lib/faithproof/session";
import {
  PHASE_STATUSES,
  type PhaseStatus,
} from "@/lib/faithproof/cornerstone";

type Result = { error?: string; ok?: boolean; id?: string };

const str = (fd: FormData, k: string) => String(fd.get(k) ?? "").trim();
const orNull = (v: string) => (v ? v : null);

function readProject(formData: FormData):
  | { error: string }
  | { values: Record<string, unknown> } {
  const name = str(formData, "name");
  if (!name) return { error: "Enter the project name." };

  const phase = Number(str(formData, "phase") || "1");
  if (!Number.isInteger(phase) || phase < 1 || phase > 4) {
    return { error: "Choose a phase between 1 and 4." };
  }

  const status = str(formData, "phase_status") || "not_started";
  if (!PHASE_STATUSES.includes(status as PhaseStatus)) {
    return { error: "Choose a valid phase status." };
  }

  const targetRaw = str(formData, "target_homes");
  let target_homes: number | null = null;
  if (targetRaw) {
    const n = Number(targetRaw);
    if (!Number.isInteger(n) || n <= 0) {
      return { error: "Target homes must be a whole number above zero, or blank." };
    }
    target_homes = n;
  }

  const placedRaw = str(formData, "homes_placed");
  let homes_placed = 0;
  if (placedRaw) {
    const n = Number(placedRaw);
    if (!Number.isInteger(n) || n < 0) {
      return { error: "Homes placed must be zero or a whole number." };
    }
    homes_placed = n;
  }

  return {
    values: {
      name,
      location: orNull(str(formData, "location")),
      phase,
      phase_status: status as PhaseStatus,
      land_acquired: formData.get("land_acquired") === "on",
      land_source: orNull(str(formData, "land_source")),
      site_address: orNull(str(formData, "site_address")),
      target_homes,
      homes_placed,
      public_notes: orNull(str(formData, "public_notes")),
      internal_notes: orNull(str(formData, "internal_notes")),
    },
  };
}

export async function createCornerstoneProject(
  formData: FormData
): Promise<Result> {
  const session = await getSession();
  if (!session) return { error: "Your session has expired. Sign in again." };

  const parsed = readProject(formData);
  if ("error" in parsed) return { error: parsed.error };

  const { data, error } = await session.supabase
    .from("cornerstone_projects")
    .insert({ ...parsed.values, created_by: session.userId })
    .select("id")
    .single();

  if (error) return { error: describeDbError(error, "create this project") };

  await writeAuditLog(session.supabase, {
    actorId: session.userId,
    action: "cornerstone_project.created",
    entityType: "cornerstone_projects",
    entityId: data.id,
    newValue: { name: parsed.values.name, phase: parsed.values.phase },
  });

  revalidatePath("/admin/cornerstone");
  revalidatePath("/cornerstone");
  return { ok: true, id: data.id };
}

export async function updateCornerstoneProject(
  id: string,
  formData: FormData
): Promise<Result> {
  const session = await getSession();
  if (!session) return { error: "Your session has expired. Sign in again." };

  const parsed = readProject(formData);
  if ("error" in parsed) return { error: parsed.error };

  const { error } = await session.supabase
    .from("cornerstone_projects")
    .update(parsed.values)
    .eq("id", id);

  if (error) return { error: describeDbError(error, "update this project") };

  await writeAuditLog(session.supabase, {
    actorId: session.userId,
    action: "cornerstone_project.updated",
    entityType: "cornerstone_projects",
    entityId: id,
    newValue: parsed.values,
  });

  revalidatePath(`/admin/cornerstone/${id}`);
  revalidatePath("/admin/cornerstone");
  revalidatePath("/cornerstone");
  return { ok: true, id };
}

/**
 * Move a project to a different phase.
 *
 * Advancing resets phase_status to in_progress: the new phase has started, not
 * finished. Marking the current phase complete is a separate action, because
 * "we finished phase 2" and "we started phase 3" are different claims and the
 * public page reports both.
 */
export async function setProjectPhase(
  id: string,
  phase: number
): Promise<Result> {
  if (!Number.isInteger(phase) || phase < 1 || phase > 4) {
    return { error: "That is not a valid phase." };
  }

  const session = await getSession();
  if (!session) return { error: "Your session has expired. Sign in again." };

  const { error } = await session.supabase
    .from("cornerstone_projects")
    .update({ phase, phase_status: "in_progress" })
    .eq("id", id);

  if (error) return { error: describeDbError(error, "advance this project") };

  await writeAuditLog(session.supabase, {
    actorId: session.userId,
    action: "cornerstone_project.phase_changed",
    entityType: "cornerstone_projects",
    entityId: id,
    newValue: { phase, phase_status: "in_progress" },
  });

  revalidatePath(`/admin/cornerstone/${id}`);
  revalidatePath("/admin/cornerstone");
  revalidatePath("/cornerstone");
  return { ok: true };
}

export async function setPhaseStatus(
  id: string,
  status: PhaseStatus
): Promise<Result> {
  if (!PHASE_STATUSES.includes(status)) return { error: "Invalid status." };

  const session = await getSession();
  if (!session) return { error: "Your session has expired. Sign in again." };

  const { error } = await session.supabase
    .from("cornerstone_projects")
    .update({ phase_status: status })
    .eq("id", id);

  if (error) return { error: describeDbError(error, "update this project") };

  await writeAuditLog(session.supabase, {
    actorId: session.userId,
    action: `cornerstone_project.${status}`,
    entityType: "cornerstone_projects",
    entityId: id,
    newValue: { phase_status: status },
  });

  revalidatePath(`/admin/cornerstone/${id}`);
  revalidatePath("/admin/cornerstone");
  revalidatePath("/cornerstone");
  return { ok: true };
}

export async function addMilestone(
  projectId: string,
  formData: FormData
): Promise<Result> {
  const session = await getSession();
  if (!session) return { error: "Your session has expired. Sign in again." };

  const title = str(formData, "title");
  if (!title) return { error: "Enter the milestone title." };

  const { error } = await session.supabase.from("cornerstone_milestones").insert({
    project_id: projectId,
    title,
    description: orNull(str(formData, "description")),
    target_date: orNull(str(formData, "target_date")),
    completed_date: orNull(str(formData, "completed_date")),
    is_public: formData.get("is_public") === "on",
  });

  if (error) return { error: describeDbError(error, "add this milestone") };

  await writeAuditLog(session.supabase, {
    actorId: session.userId,
    action: "cornerstone_milestone.created",
    entityType: "cornerstone_milestones",
    entityId: projectId,
    newValue: { title },
  });

  revalidatePath(`/admin/cornerstone/${projectId}`);
  revalidatePath("/cornerstone");
  return { ok: true };
}

export async function completeMilestone(
  projectId: string,
  milestoneId: string
): Promise<Result> {
  const session = await getSession();
  if (!session) return { error: "Your session has expired. Sign in again." };

  const today = new Date().toISOString().slice(0, 10);

  const { error } = await session.supabase
    .from("cornerstone_milestones")
    .update({ completed_date: today })
    .eq("id", milestoneId);

  if (error) return { error: describeDbError(error, "complete this milestone") };

  await writeAuditLog(session.supabase, {
    actorId: session.userId,
    action: "cornerstone_milestone.completed",
    entityType: "cornerstone_milestones",
    entityId: milestoneId,
    newValue: { completed_date: today },
  });

  revalidatePath(`/admin/cornerstone/${projectId}`);
  revalidatePath("/cornerstone");
  return { ok: true };
}
