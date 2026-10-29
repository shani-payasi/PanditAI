import React from "react";
import { Bot, User } from "lucide-react";

export default function MessageItem({ message, user }) {
  const isUser = message.role === "user";

  const userInitial =
    user?.fullName?.firstName?.[0]?.toUpperCase() ||
    user?.email?.[0]?.toUpperCase() ||
    "U";

  return (
    <div
      className={`py-4 px-4 md:px-8 transition-colors ${
        isUser ? "bg-transparent" : "bg-[var(--bg-secondary)]/30 border-y border-[var(--border-color)]/30"
      }`}
    >
      <div className="mx-auto flex max-w-3xl gap-4">
        {/* Avatar */}
        <div className="shrink-0 pt-0.5">
          {isUser ? (
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--border-color)] text-xs font-semibold text-[var(--text-primary)]">
              {userInitial}
            </div>
          ) : (
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[var(--accent-primary)] text-white shadow-sm">
              <Bot size={16} />
            </div>
          )}
        </div>

        {/* Message Content */}
        <div className="min-w-0 flex-1 space-y-1">
          <div className="text-xs font-semibold text-[var(--text-primary)]">
            {isUser ? "You" : "ChatGPT"}
          </div>
          <div className="whitespace-pre-wrap break-words text-sm leading-relaxed text-[var(--text-primary)] font-normal">
            {message.content}
          </div>
        </div>
      </div>
    </div>
  );
}

