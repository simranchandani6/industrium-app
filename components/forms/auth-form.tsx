"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent, useRef, useState } from "react";

import { DEMO_EMAIL, DEMO_PASSWORD, isDemoCredentials } from "@/lib/demo-auth-shared";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

type AuthFormProps = {
  mode: "login" | "register";
};

function getAuthErrorMessage(error: unknown) {
  const fallback = "Authentication failed.";

  if (!(error instanceof Error)) {
    return fallback;
  }

  if (/Database error querying schema|Database error finding users/i.test(error.message)) {
    return "Supabase Auth is misconfigured for this project. Run the demo auth repair SQL, then try signing in again.";
  }

  return error.message || fallback;
}

export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement | null>(null);
  const [isPending, setIsPending] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsPending(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    const form = event.currentTarget;
    formRef.current = form;
    const formData = new FormData(form);
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
          formRef.current?.reset();
          return;
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          if (isDemoCredentials(email, password)) {
            const demoResponse = await fetch("/api/auth/demo-login", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ email, password }),
            });

            if (demoResponse.ok) {
              router.replace("/dashboard");
              router.refresh();
              return;
            }
          }

          throw error;
        }
      }

      router.replace("/dashboard");
      router.refresh();
    } catch (error) {
      setErrorMessage(getAuthErrorMessage(error));
    } finally {
      setIsPending(false);
    }
  };

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
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

      {mode === "login" ? (
        <p className="text-xs text-steel">
          Demo login: <span className="font-medium text-ink">{DEMO_EMAIL}</span> /{" "}
          <span className="font-medium text-ink">{DEMO_PASSWORD}</span>
        </p>
      ) : null}

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
