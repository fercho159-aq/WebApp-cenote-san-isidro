"use client";

import { useActionState } from "react";
import { signIn } from "@/actions/auth";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(signIn, null);

  return (
    <Card className="shadow-lg w-full max-w-sm">
      <CardHeader className="space-y-3 text-center pb-2">
        <div className="mx-auto mb-1 flex h-14 w-14 items-center justify-center rounded-xl bg-primary text-lg font-bold text-primary-foreground">
          CS
        </div>
        <CardTitle className="text-xl font-bold">Cenote San Isidro</CardTitle>
        <CardDescription className="text-sm">
          Inicia sesión para administrar tu propiedad
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-4">
          {state?.error && (
            <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-600">
              {state.error}
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="email">Correo electrónico</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="tu@correo.com"
              required
              autoComplete="email"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Contraseña</Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="••••••••"
              required
              autoComplete="current-password"
            />
          </div>
          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? "Ingresando..." : "Ingresar"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
