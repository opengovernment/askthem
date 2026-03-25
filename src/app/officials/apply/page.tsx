import { ResponderApplicationForm } from "@/components/ResponderApplicationForm";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Get Verified on AskThem",
  description:
    "Verified officials on AskThem agree to publicly respond to at least one question per month from among their top-signed questions.",
};

export default function ResponderApplyPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <ResponderApplicationForm />
    </div>
  );
}
