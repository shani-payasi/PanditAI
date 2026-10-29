import React from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  createChat,
  setCurrentChat,
  fetchMessages,
} from "../store/slices/chatSlice";
import { logoutUser } from "../store/slices/authSlice";
import {
  Plus,
  MessageSquare,
  LogOut,
  User,
  Bot,
  PanelLeftClose,
  PanelLeft,
} from "lucide-react";

export default function Sidebar({ isOpen, setIsOpen }) {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { chats, currentChat, loadingChats } = useSelector(
    (state) => state.chat
  );

  const handleNewChat = () => {
    dispatch(createChat("New Chat"));
  };

  const handleSelectChat = (chat) => {
    dispatch(setCurrentChat(chat));
    dispatch(fetchMessages(chat._id));
  };

  const handleLogout = () => {
    dispatch(logoutUser());
  };

  const userInitial =
    user?.fullName?.firstName?.[0]?.toUpperCase() ||
    user?.email?.[0]?.toUpperCase() ||
    "U";

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 z-30 bg-black/60 md:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-[var(--border-color)] bg-[var(--bg-sidebar)] transition-transform duration-200 md:static md:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Top Header: Brand + New Chat */}
        <div className="flex flex-col gap-3 p-3">
          <div className="flex items-center justify-between px-2 pt-1">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[var(--accent-primary)] text-white">
                <Bot size={18} />
              </div>
              <span className="font-semibold text-sm tracking-tight text-[var(--text-primary)]">
                ChatGPT RAG
              </span>
            </div>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] md:hidden"
            >
              <PanelLeftClose size={18} />
            </button>
          </div>

          <button
            onClick={handleNewChat}
            className="flex items-center justify-between rounded-lg border border-[var(--border-color)] bg-[var(--bg-secondary)] px-3 py-2.5 text-xs font-medium text-[var(--text-primary)] transition-colors hover:bg-[var(--border-color)]/40"
          >
            <div className="flex items-center gap-2">
              <Plus size={16} />
              <span>New chat</span>
            </div>
          </button>
        </div>

        {/* Chat History List */}
        <div className="flex-1 overflow-y-auto px-2 py-1">
          <div className="px-2 py-1.5 text-[11px] font-medium uppercase tracking-wider text-[var(--text-secondary)]">
            Recent Conversations
          </div>

          {loadingChats ? (
            <div className="px-3 py-4 text-xs text-[var(--text-secondary)]">
              Loading chats...
            </div>
          ) : chats.length === 0 ? (
            <div className="px-3 py-4 text-xs text-[var(--text-secondary)]">
              No conversations yet. Start one!
            </div>
          ) : (
            <div className="space-y-0.5">
              {chats.map((chat) => {
                const isActive = currentChat?._id === chat._id;
                return (
                  <button
                    key={chat._id}
                    onClick={() => handleSelectChat(chat)}
                    className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-xs transition-colors ${
                      isActive
                        ? "bg-[var(--bg-secondary)] text-[var(--text-primary)] font-medium"
                        : "text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)]/50 hover:text-[var(--text-primary)]"
                    }`}
                  >
                    <MessageSquare size={14} className="shrink-0" />
                    <span className="truncate">
                      {chat.tittle || "Untitled Chat"}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* User Profile & Logout Footer */}
        <div className="border-t border-[var(--border-color)] p-3">
          <div className="flex items-center justify-between rounded-lg bg-[var(--bg-secondary)]/60 p-2">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--border-color)] text-xs font-semibold text-[var(--text-primary)]">
                {userInitial}
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-xs font-medium text-[var(--text-primary)]">
                  {user?.fullName?.firstName
                    ? `${user.fullName.firstName} ${user.fullName.lastName || ""}`
                    : user?.email}
                </div>
                <div className="truncate text-[11px] text-[var(--text-secondary)]">
                  {user?.email}
                </div>
              </div>
            </div>

            <button
              onClick={handleLogout}
              title="Sign out"
              className="rounded p-1.5 text-[var(--text-secondary)] transition-colors hover:bg-[var(--border-color)] hover:text-[var(--danger)]"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}

