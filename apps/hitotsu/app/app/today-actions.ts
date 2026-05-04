"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getProfile } from "@/lib/profile";
import {
  completeTodayTask,
  generateTodayTask,
  uncompleteTodayTask,
} from "@/lib/today";

export async function generateTodayAction() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const profile = await getProfile(user.id);
  if (!profile) redirect("/onboarding");

  const result = await generateTodayTask(user.id, profile);

  if (result.error) {
    redirect(`/app?error=${encodeURIComponent(result.error)}`);
  }

  revalidatePath("/app");
}

export async function completeTaskAction(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const taskId = String(formData.get("task_id") ?? "");
  if (!taskId) redirect("/app");

  const result = await completeTodayTask(user.id, taskId);
  if (result.error) {
    redirect(`/app?error=${encodeURIComponent(result.error)}`);
  }
  revalidatePath("/app");
}

export async function uncompleteTaskAction(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const taskId = String(formData.get("task_id") ?? "");
  if (!taskId) redirect("/app");

  const result = await uncompleteTodayTask(user.id, taskId);
  if (result.error) {
    redirect(`/app?error=${encodeURIComponent(result.error)}`);
  }
  revalidatePath("/app");
}
