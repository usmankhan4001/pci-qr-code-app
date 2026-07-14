"use client";

import { useActionState } from "react";
import { Alert, Button, PasswordInput, Stack, TextInput } from "@mantine/core";
import { Icon } from "@/components/ui-icons";
import { loginAction, type LoginState } from "./actions";

const initialState: LoginState = {};

export default function LoginForm({ callbackUrl }: { callbackUrl?: string }) {
  const [state, formAction, pending] = useActionState(loginAction, initialState);

  return (
    <form action={formAction}>
      <input type="hidden" name="callbackUrl" value={callbackUrl ?? ""} />
      <Stack gap="md">
        <TextInput
          id="email"
          name="email"
          label="Email"
          type="email"
          required
          autoComplete="email"
          leftSection={<Icon name="mail" className="h-4 w-4" />}
        />
        <PasswordInput
          id="password"
          name="password"
          label="Password"
          required
          autoComplete="current-password"
          leftSection={<Icon name="shield" className="h-4 w-4" />}
        />
        {state.error ? <Alert color="red">{state.error}</Alert> : null}
        <Button type="submit" loading={pending} fullWidth leftSection={<Icon name="logOut" className="h-4 w-4 rotate-180" />}>
          Sign in
        </Button>
      </Stack>
    </form>
  );
}
