import { GroupApplicationForm } from "@/components/GroupApplicationForm";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Apply for Group Verification - AskThem",
  description: "Apply to become a verified group on AskThem. Advocacy organizations, think tanks, and nonprofits can ask questions on behalf of their organization.",
};

export default async function GroupApplyPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/auth/signin");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <GroupApplicationForm />
    </div>
  );
}
