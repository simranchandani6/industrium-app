"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";

import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

type AuthFormProps = {
  mode: "login" | "register";
};

export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsPending(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "").trim();
    const password = String(formData.get("password") ?? "");
    const fullName = String(formData.get("fullName") ?? "").trim();

    try {
      const supabase = createSupabaseBrowserClient();

      if (mode === "register") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
            },
          },
        });

        if (error) {
          throw error;
        }

        if (!data.session) {
          setSuccessMessage("Account created. Check your email to confirm your address, then sign in.");
          event.currentTarget.reset();
          return;
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          throw error;
        }
      }

      router.replace("/dashboard");
      router.refresh();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Authentication failed.");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {mode === "register" ? (
        <label className="block">
          <span className="mb-2 block text-sm text-steel">Full name</span>
          <input
            required
            type="text"
            name="fullName"
            className="w-full rounded-2xl border border-ink/10 bg-white px-4 py-3 outline-none transition focus:border-teal"
            placeholder="Your full name"
          />
        </label>
      ) : null}

      <label className="block">
        <span className="mb-2 block text-sm text-steel">Work email</span>
        <input
          required
          type="email"
          name="email"
          className="w-full rounded-2xl border border-ink/10 bg-white px-4 py-3 outline-none transition focus:border-teal"
          placeholder="you@company.com"
        />
      </label>

      <label className="block">
        <span className="mb-2 block text-sm text-steel">Password</span>
        <input
          required
          minLength={8}
          type="password"
          name="password"
          className="w-full rounded-2xl border border-ink/10 bg-white px-4 py-3 outline-none transition focus:border-teal"
          placeholder="Minimum 8 characters"
        />
      </label>

      {errorMessage ? <p className="text-sm text-signal">{errorMessage}</p> : null}
      {successMessage ? <p className="text-sm text-teal">{successMessage}</p> : null}

      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-2xl bg-ink px-4 py-3 text-sm font-medium text-white transition hover:bg-ink/90 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isPending
          ? mode === "login"
            ? "Signing in..."
            : "Creating account..."
          : mode === "login"
            ? "Sign in"
            : "Create account"}
      </button>

      <p className="text-sm text-steel">
        {mode === "login" ? "Need an account?" : "Already have an account?"}{" "}
        <Link
          href={mode === "login" ? "/register" : "/login"}
          className="font-medium text-teal underline-offset-4 hover:underline"
        >
          {mode === "login" ? "Register here" : "Sign in here"}
        </Link>
      </p>
    </form>
  );
}
