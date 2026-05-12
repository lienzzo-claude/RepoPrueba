"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useMutation } from "@tanstack/react-query";
import { z } from "zod";

import { signIn } from "@/lib/auth-client";
import { signInSchema, type SignInInput } from "@/lib/validations/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState<SignInInput>({ email: "", password: "" });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const mutation = useMutation({
    mutationFn: async (input: SignInInput) => {
      const parsed = signInSchema.parse(input);
      const result = await signIn.email({
        email: parsed.email,
        password: parsed.password,
      });
      if (result.error) {
        throw new Error(result.error.message ?? "No se pudo iniciar sesión");
      }
      return result.data;
    },
    onSuccess: () => {
      router.push("/");
      router.refresh();
    },
  });

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFieldErrors({});
    const parsed = signInSchema.safeParse(form);
    if (!parsed.success) {
      const errors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0]?.toString();
        if (key) errors[key] = issue.message;
      }
      setFieldErrors(errors);
      return;
    }
    mutation.mutate(parsed.data);
  };

  return (
    <div className="flex min-h-svh items-center justify-center p-6">
      <Card className="w-full max-w-sm p-6">
        <h1 className="mb-1 text-xl font-semibold">Iniciar sesión</h1>
        <p className="mb-6 text-sm text-muted-foreground">
          Accede con tu correo y contraseña
        </p>

        <form onSubmit={onSubmit} className="flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-sm" htmlFor="email">
              Email
            </label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
            {fieldErrors.email && (
              <span className="text-xs text-red-500">{fieldErrors.email}</span>
            )}
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm" htmlFor="password">
              Contraseña
            </label>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
            />
            {fieldErrors.password && (
              <span className="text-xs text-red-500">
                {fieldErrors.password}
              </span>
            )}
          </div>

          {mutation.error && (
            <div className="rounded-md bg-red-500/10 px-3 py-2 text-sm text-red-500">
              {mutation.error.message}
            </div>
          )}

          <Button type="submit" disabled={mutation.isPending} className="mt-2">
            {mutation.isPending ? "Entrando…" : "Entrar"}
          </Button>
        </form>

        <p className="mt-4 text-center text-sm text-muted-foreground">
          ¿No tienes cuenta?{" "}
          <Link href="/signup" className="underline">
            Regístrate
          </Link>
        </p>
      </Card>
    </div>
  );
}
