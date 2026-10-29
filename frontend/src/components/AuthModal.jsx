import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { loginUser, registerUser, clearAuthError } from "../store/slices/authSlice";
import { Bot, Mail, Lock, User, AlertCircle, Loader2 } from "lucide-react";

export default function AuthModal() {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.auth);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isRegister) {
      if (!firstName.trim() || !lastName.trim()) return;
      dispatch(
        registerUser({
          fullName: { firstName: firstName.trim(), lastName: lastName.trim() },
          email: email.trim(),
          password,
        })
      );
    } else {
      dispatch(loginUser({ email: email.trim(), password }));
    }
  };

  const switchTab = (registerMode) => {
    setIsRegister(registerMode);
    dispatch(clearAuthError());
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 px-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border border-[var(--border-color)] bg-[var(--bg-secondary)] p-8 shadow-2xl">
        {/* Brand Header */}
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--accent-primary)] text-white shadow-md">
            <Bot size={26} />
          </div>
          <h2 className="text-2xl font-semibold tracking-tight text-[var(--text-primary)]">
            {isRegister ? "Create your account" : "Welcome back"}
          </h2>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            Conversational AI with Short-Term and Long-Term Memory
          </p>
        </div>

        {/* Mode Toggle Tabs */}
        <div className="mb-6 flex rounded-lg border border-[var(--border-color)] bg-[var(--bg-tertiary)] p-1">
          <button
            type="button"
            onClick={() => switchTab(false)}
            className={`flex-1 rounded-md py-2 text-xs font-medium transition-colors ${
              !isRegister
                ? "bg-[var(--bg-secondary)] text-[var(--text-primary)] shadow-sm"
                : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => switchTab(true)}
            className={`flex-1 rounded-md py-2 text-xs font-medium transition-colors ${
              isRegister
                ? "bg-[var(--bg-secondary)] text-[var(--text-primary)] shadow-sm"
                : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            }`}
          >
            Sign Up
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-4 flex items-center gap-2 rounded-lg border border-[var(--danger)]/30 bg-[var(--danger)]/10 p-3 text-xs text-[var(--danger)]">
            <AlertCircle size={16} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Auth Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-[var(--text-secondary)]">
                  First Name
                </label>
                <div className="relative">
                  <User
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]"
                  />
                  <input
                    type="text"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="John"
                    className="w-full rounded-lg border border-[var(--border-color)] bg-[var(--bg-tertiary)] py-2.5 pl-9 pr-3 text-sm text-[var(--text-primary)] placeholder-[var(--text-secondary)]/50 focus:border-[var(--accent-primary)] focus:outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-[var(--text-secondary)]">
                  Last Name
                </label>
                <input
                  type="text"
                  required
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Doe"
                  className="w-full rounded-lg border border-[var(--border-color)] bg-[var(--bg-tertiary)] py-2.5 px-3 text-sm text-[var(--text-primary)] placeholder-[var(--text-secondary)]/50 focus:border-[var(--accent-primary)] focus:outline-none"
                />
              </div>
            </div>
          )}

          <div>
            <label className="mb-1 block text-xs font-medium text-[var(--text-secondary)]">
              Email Address
            </label>
            <div className="relative">
              <Mail
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]"
              />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-lg border border-[var(--border-color)] bg-[var(--bg-tertiary)] py-2.5 pl-9 pr-3 text-sm text-[var(--text-primary)] placeholder-[var(--text-secondary)]/50 focus:border-[var(--accent-primary)] focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-[var(--text-secondary)]">
              Password
            </label>
            <div className="relative">
              <Lock
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]"
              />
              <input
                type="password"
                required
                minLength={4}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-lg border border-[var(--border-color)] bg-[var(--bg-tertiary)] py-2.5 pl-9 pr-3 text-sm text-[var(--text-primary)] placeholder-[var(--text-secondary)]/50 focus:border-[var(--accent-primary)] focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--accent-primary)] py-2.5 text-sm font-medium text-white transition-colors hover:bg-[var(--accent-hover)] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>Processing...</span>
              </>
            ) : isRegister ? (
              "Sign Up"
            ) : (
              "Sign In"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

