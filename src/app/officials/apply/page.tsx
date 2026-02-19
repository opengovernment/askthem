import { ResponderApplicationForm } from "@/components/ResponderApplicationForm";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Apply for Verified Responder Status - AskThem",
  description:
    "Elected officials can apply to become verified responders on AskThem, committing to answer constituent questions directly on the platform.",
};

export default function ResponderApplyPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <ResponderApplicationForm />
    </div>
  );
}
