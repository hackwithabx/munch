"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient, hasValidSupabaseBrowserEnv } from "@/lib/supabase/client";

type AuthMode = "login" | "signup";

type AuthFormProps = {
  mode: AuthMode;
  initialUsername?: string;
  redirectTo?: string;
};

export default function AuthForm({ mode, initialUsername = "", redirectTo = "/dashboard" }: AuthFormProps) {
  const supabase = createClient();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState(initialUsername);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      if (!hasValidSupabaseBrowserEnv()) {
        throw new Error(
          "Supabase is not configured. Update NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local with real project values.",
        );
      }

      if (mode === "signup") {
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

        if (data.user && username.trim().length >= 3) {
          await supabase
            .from("profiles")
            .update({ username: username.trim().toLowerCase(), display_name: fullName || null })
            .eq("id", data.user.id);
        }

        setMessage("Signup successful. If email confirmation is enabled, verify your inbox first.");
        router.push("/dashboard");
        router.refresh();
        return;
      }

      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      router.push(redirectTo);
      router.refresh();
    } catch (error) {
      if (error instanceof TypeError && error.message.includes("fetch")) {
        setMessage(
          "Cannot reach Supabase. Verify NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local, then restart dev server.",
        );
      } else {
        setMessage(error instanceof Error ? error.message : "Authentication failed.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md items-center px-4 py-10 sm:px-0">
      <section className="w-full rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <h1 className="text-2xl font-bold text-slate-900">{mode === "signup" ? "Create your Munch card" : "Welcome back"}</h1>
        <p className="mt-1 text-sm text-slate-600">
          {mode === "signup"
            ? "Set up your searchable identity card in under a minute."
            : "Login to edit your profile and analytics."}
        </p>

        <form onSubmit={onSubmit} className="mt-5 space-y-4">
          {mode === "signup" ? (
            <label className="block space-y-1 text-sm">
              <span className="font-medium text-slate-700">Full Name</span>
              <input
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
                required
                className="w-full rounded-xl border border-slate-300 px-3 py-2 outline-none focus:border-blue-300"
              />
            </label>
          ) : null}

          {mode === "signup" ? (
            <label className="block space-y-1 text-sm">
              <span className="font-medium text-slate-700">Username</span>
              <input
                value={username}
                onChange={(event) => setUsername(event.target.value.toLowerCase())}
                placeholder="your_name"
                className="w-full rounded-xl border border-slate-300 px-3 py-2 outline-none focus:border-blue-300"
              />
            </label>
          ) : null}

          <label className="block space-y-1 text-sm">
            <span className="font-medium text-slate-700">Email</span>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              className="w-full rounded-xl border border-slate-300 px-3 py-2 outline-none focus:border-blue-300"
            />
          </label>

          <label className="block space-y-1 text-sm">
            <span className="font-medium text-slate-700">Password</span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              minLength={6}
              className="w-full rounded-xl border border-slate-300 px-3 py-2 outline-none focus:border-blue-300"
            />
          </label>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-60"
          >
            {loading ? "Please wait..." : mode === "signup" ? "Create Account" : "Login"}
          </button>

          {message ? <p className="text-sm text-slate-600">{message}</p> : null}
        </form>

        <p className="mt-4 text-sm text-slate-600">
          {mode === "signup" ? "Already have an account? " : "Need an account? "}
          <Link href={mode === "signup" ? "/login" : "/signup"} className="font-semibold text-blue-600 hover:text-blue-700">
            {mode === "signup" ? "Login" : "Sign up"}
          </Link>
        </p>
      </section>
    </main>
  );
}
