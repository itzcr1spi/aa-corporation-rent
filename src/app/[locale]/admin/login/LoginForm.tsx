"use client";

import { useActionState } from "react";
import { loginAction, type LoginState } from "./actions";

const inputCls =
  "w-full rounded-none border border-line bg-surface-1 px-3 py-2.5 text-sm text-white outline-none transition-colors focus:border-line-strong";

export function LoginForm() {
  const [state, action, pending] = useActionState<LoginState, FormData>(
    loginAction,
    {},
  );

  return (
    <form action={action} className="space-y-4">
      <label className="block">
        <span className="label-tight text-[10px] text-ink-faint">E-mail</span>
        <input
          name="email"
          type="email"
          required
          autoComplete="username"
          className={`${inputCls} mt-2`}
        />
      </label>
      <label className="block">
        <span className="label-tight text-[10px] text-ink-faint">Hasło</span>
        <input
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className={`${inputCls} mt-2`}
        />
      </label>

      {state.error && (
        <p className="text-xs text-red">Nieprawidłowy e-mail lub hasło.</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="label mt-2 inline-flex h-12 w-full items-center justify-center bg-red text-sm text-white transition-colors hover:bg-red-hover disabled:opacity-50"
      >
        {pending ? "Logowanie…" : "Zaloguj się"}
      </button>
    </form>
  );
}
