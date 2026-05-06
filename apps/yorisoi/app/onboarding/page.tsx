import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { OnboardingForm } from "@/components/OnboardingForm";

export const metadata = {
  title: "はじめまして — よりそい",
  robots: { index: false, follow: false },
};

export default async function OnboardingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // 既に profile があれば /feed へ
  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", user.id)
    .maybeSingle();

  if (profile) {
    redirect("/feed");
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-16">
      <h1 className="font-display text-4xl text-ink">はじめまして</h1>
      <p className="mt-3 text-sm leading-relaxed text-sumi">
        あなたのことを、少しだけ教えてください。
        <br />
        いつでもあとで変更できます。
      </p>

      <OnboardingForm userId={user.id} email={user.email ?? ""} />
    </main>
  );
}
