import { ImageResponse } from "next/og";
import { getQuestionById } from "@/lib/queries";

export const runtime = "nodejs";
export const alt = "AskThem Question";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const question = await getQuestionById(id);

  if (!question) {
    return new ImageResponse(
      (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "100%",
            height: "100%",
            backgroundColor: "#4f46e5",
            color: "white",
            fontSize: 48,
            fontWeight: "bold",
          }}
        >
          AskThem
        </div>
      ),
      { ...size },
    );
  }

  const statusLabel =
    question.status === "answered"
      ? "ANSWERED"
      : question.status === "delivered"
        ? "DELIVERED"
        : "OPEN";

  const statusColor =
    question.status === "answered"
      ? "#16a34a"
      : question.status === "delivered"
        ? "#9333ea"
        : "#2563eb";

  // Truncate question text for the card
  const displayText =
    question.text.length > 160 ? question.text.slice(0, 157) + "..." : question.text;

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          width: "100%",
          height: "100%",
          backgroundColor: "#f9fafb",
          padding: "48px 56px",
        }}
      >
        {/* Header bar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "32px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div
              style={{
                fontSize: 32,
                fontWeight: "bold",
                color: "#4f46e5",
              }}
            >
              AskThem
            </div>
          </div>
          <div
            style={{
              display: "flex",
              backgroundColor: statusColor,
              color: "white",
              padding: "8px 20px",
              borderRadius: "999px",
              fontSize: 18,
              fontWeight: "bold",
            }}
          >
            {statusLabel}
          </div>
        </div>

        {/* Question text */}
        <div
          style={{
            display: "flex",
            flex: 1,
            fontSize: 36,
            fontWeight: "bold",
            color: "#111827",
            lineHeight: 1.3,
          }}
        >
          {displayText}
        </div>

        {/* Footer */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginTop: "24px",
            paddingTop: "24px",
            borderTop: "2px solid #e5e7eb",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", fontSize: 20, color: "#6b7280" }}>
              To: {question.official.name}
            </div>
            <div style={{ display: "flex", fontSize: 16, color: "#9ca3af" }}>
              {question.official.title}
            </div>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              fontSize: 24,
              fontWeight: "bold",
              color: "#4f46e5",
            }}
          >
            {question.upvoteCount.toLocaleString()} upvotes
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
