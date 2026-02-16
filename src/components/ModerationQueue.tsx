"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AnswerForm } from "@/components/AnswerForm";
import { QuestionVideo } from "@/components/QuestionVideo";

interface Question {
  id: string;
  text: string;
  videoUrl: string | null;
  status: string;
  upvoteCount: number;
  districtTag: string;
  createdAt: Date;
  author: { name: string; city: string | null; state: string | null };
  official: {
    id: string;
    name: string;
    title: string;
    deliveryThreshold: number | null;
    deliveryThresholdType: string;
  };
  categoryTags: { tag: string }[];
}

interface ModerationQueueProps {
  questions: Question[];
  activeTab: string;
  /** Map of questionId → constituent signature count, used for threshold progress on the "published" tab */
  constituentCounts?: Record<string, number>;
}

export function ModerationQueue({ questions, activeTab, constituentCounts }: ModerationQueueProps) {
  return (
    <div className="space-y-4">
      {questions.map((q) => (
        <ModerationCard
          key={q.id}
          question={q}
          activeTab={activeTab}
          constituentCount={constituentCounts?.[q.id]}
        />
      ))}
    </div>
  );
}

const DEFAULT_THRESHOLD = 5;

function ModerationCard({
  question,
  activeTab,
  constituentCount,
}: {
  question: Question;
  activeTab: string;
  constituentCount?: number;
}) {
  const router = useRouter();
  const [isActing, setIsActing] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  async function handleAction(action: "publish" | "reject" | "deliver") {
    setIsActing(true);
    try {
      const res = await fetch("/api/moderate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questionId: question.id, action }),
      });

      if (res.ok) {
        await res.json();
        setResult(
          action === "publish"
            ? "Published"
            : action === "reject"
              ? "Rejected"
              : "Delivered",
        );
        // Refresh server data after a brief pause so user sees the result
        setTimeout(() => router.refresh(), 800);
      } else {
        const errData = await res.json();
        setResult(`Error: ${errData.error}`);
      }
    } catch {
      setResult("Network error");
    } finally {
      setIsActing(false);
    }
  }

  return (
    <div
      className={`rounded-lg border bg-white p-5 shadow-sm transition-opacity ${
        result ? "opacity-60" : ""
      }`}
    >
      <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          {question.categoryTags.map((ct) => (
            <span
              key={ct.tag}
              className="rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-600"
            >
              {ct.tag}
            </span>
          ))}
          <span className="rounded bg-indigo-50 px-2 py-0.5 text-xs text-indigo-600">
            {question.districtTag}
          </span>
        </div>
        <span className="text-xs text-gray-400">
          {new Date(question.createdAt).toLocaleDateString()}
        </span>
      </div>

      <p className="mb-2 text-lg font-medium text-gray-900">{question.text}</p>

      {question.videoUrl && (
        <div className="mb-3">
          <QuestionVideo url={question.videoUrl} />
        </div>
      )}

      <div className="mb-4 flex flex-wrap items-center gap-3 text-sm text-gray-500">
        <span>
          By {question.author.name}
          {question.author.city && question.author.state
            ? ` (${question.author.city}, ${question.author.state})`
            : ""}
        </span>
        <span>&middot;</span>
        <span>
          To: {question.official.name} ({question.official.title})
        </span>
        <span>&middot;</span>
        <span>{question.upvoteCount} upvotes</span>
      </div>

      {/* Threshold progress for published questions */}
      {activeTab === "published" && !result && (() => {
        const threshold = question.official.deliveryThreshold ?? DEFAULT_THRESHOLD;
        const isSupporter = question.official.deliveryThresholdType === "supporter";
        const current = isSupporter ? question.upvoteCount : (constituentCount ?? 0);
        const progress = Math.min(current / threshold, 1);
        const reached = current >= threshold;
        const label = isSupporter ? "total" : "constituent";

        return (
          <div className="mb-4">
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>
                {reached
                  ? <span className="font-semibold text-green-700">Threshold reached</span>
                  : `${current} / ${threshold} ${label} signatures`}
              </span>
            </div>
            <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-gray-100">
              <div
                className={`h-full rounded-full transition-all ${reached ? "bg-green-500" : "bg-indigo-600"}`}
                style={{ width: `${progress * 100}%` }}
              />
            </div>
          </div>
        );
      })()}

      {/* Action buttons based on current status */}
      {result ? (
        <div
          className={`rounded px-3 py-2 text-sm font-medium ${
            result.startsWith("Error")
              ? "bg-red-50 text-red-700"
              : "bg-green-50 text-green-700"
          }`}
        >
          {result}
        </div>
      ) : (
        <div className="flex gap-2">
          {activeTab === "pending_review" && (
            <>
              <button
                onClick={() => handleAction("publish")}
                disabled={isActing}
                className="rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
              >
                Approve &amp; Publish
              </button>
              <button
                onClick={() => handleAction("reject")}
                disabled={isActing}
                className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
              >
                Reject
              </button>
            </>
          )}
          {activeTab === "published" && (
            <button
              onClick={() => handleAction("deliver")}
              disabled={isActing}
              className="rounded-md bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700 disabled:opacity-50"
            >
              Mark as Delivered
            </button>
          )}
          {activeTab === "answered" && (
            <span className="text-sm text-gray-400 italic">Answered</span>
          )}
        </div>
      )}

      {/* Inline answer form for delivered questions */}
      {activeTab === "delivered" && !result && (
        <AnswerForm
          questionId={question.id}
          officialName={question.official.name}
          compact
        />
      )}
    </div>
  );
}
