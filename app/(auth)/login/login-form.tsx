"use client";

import { useActionState } from "react";
import { Icon } from "@/components/ui-icons";
import { loginAction, type LoginState } from "./actions";

const initialState: LoginState = {};

export default function LoginForm({ callbackUrl }: { callbackUrl?: string }) {
  const [state, formAction, pending] = useActionState(loginAction, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input type="hidden" name="callbackUrl" value={callbackUrl ?? ""} />
      <div className="flex flex-col gap-1">
        <label htmlFor="email" className="ui-label flex items-center gap-2">
          <Icon name="mail" className="h-3.5 w-3.5" />
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          className="ui-input"
        />
      </div>
      <div className="flex flex-col gap-1">
        <label htmlFor="password" className="ui-label flex items-center gap-2">
          <Icon name="shield" className="h-3.5 w-3.5" />
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className="ui-input"
        />
      </div>
      {state.error ? <p className="rounded-xl bg-[var(--danger-soft)] px-3 py-2 text-sm font-semibold text-[var(--danger)]">{state.error}</p> : null}
      <button
        type="submit"
        disabled={pending}
        className="ui-button ui-button-solid mt-2 w-full"
      >
        <Icon name="logOut" className="h-4 w-4 rotate-180" />
        {pending ? "Signing in..." : "Sign in"}
      </button>
    </form>
  );
}
