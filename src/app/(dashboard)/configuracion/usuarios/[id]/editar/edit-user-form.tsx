'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { updateUser, resetUserPassword } from '@/actions/settings'
import { Save, Loader2, Key } from 'lucide-react'

interface User {
  id: string
  email: string
  fullName: string
  role: string
  isActive: boolean
}

export function EditUserForm({ user }: { user: User }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // Password reset state
  const [showPasswordReset, setShowPasswordReset] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const [passwordPending, startPasswordTransition] = useTransition()
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null)

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    const formData = new FormData(e.currentTarget)
    const fullName = formData.get('full_name') as string
    const role = formData.get('role') as string

    startTransition(async () => {
      const result = await updateUser(user.id, { fullName, role })
      if (result?.error) {
        setError(result.error)
      } else {
        setSuccess('Usuario actualizado correctamente')
        router.refresh()
      }
    })
  }

  function handlePasswordReset(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setPasswordError(null)
    setPasswordSuccess(null)

    startPasswordTransition(async () => {
      const result = await resetUserPassword(user.id, newPassword)
      if (result.error) {
        setPasswordError(result.error)
      } else {
        setPasswordSuccess('Contraseña actualizada correctamente')
        setNewPassword('')
        setShowPasswordReset(false)
      }
    })
  }

  return (
    <div className="max-w-lg space-y-6">
      {/* Edit user info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Datos del usuario</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-400">
                {error}
              </div>
            )}
            {success && (
              <div className="rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400">
                {success}
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-foreground mb-1">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={user.email}
                disabled
                className="w-full rounded-lg border border-border bg-muted px-3 py-2 text-sm text-muted-foreground cursor-not-allowed"
              />
              <p className="mt-1 text-xs text-muted-foreground">El email no se puede modificar</p>
            </div>

            <div>
              <label htmlFor="full_name" className="block text-sm font-medium text-foreground mb-1">
                Nombre completo *
              </label>
              <input
                id="full_name"
                name="full_name"
                type="text"
                required
                defaultValue={user.fullName}
                className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label htmlFor="role" className="block text-sm font-medium text-foreground mb-1">
                Rol *
              </label>
              <select
                id="role"
                name="role"
                required
                defaultValue={user.role}
                className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="employee">Empleado</option>
                <option value="admin">Administrador</option>
              </select>
            </div>

            <div className="flex gap-3 pt-2">
              <Button type="submit" disabled={isPending}>
                {isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                Guardar cambios
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Password reset */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Contraseña</CardTitle>
        </CardHeader>
        <CardContent>
          {passwordSuccess && (
            <div className="mb-4 rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400">
              {passwordSuccess}
            </div>
          )}

          {!showPasswordReset ? (
            <Button
              variant="outline"
              onClick={() => setShowPasswordReset(true)}
            >
              <Key className="h-4 w-4" />
              Cambiar contraseña
            </Button>
          ) : (
            <form onSubmit={handlePasswordReset} className="space-y-4">
              {passwordError && (
                <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-400">
                  {passwordError}
                </div>
              )}

              <div>
                <label htmlFor="new_password" className="block text-sm font-medium text-foreground mb-1">
                  Nueva contraseña *
                </label>
                <input
                  id="new_password"
                  type="password"
                  required
                  minLength={6}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Mínimo 6 caracteres"
                />
              </div>

              <div className="flex gap-3">
                <Button type="submit" disabled={passwordPending}>
                  {passwordPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Key className="h-4 w-4" />
                  )}
                  Actualizar contraseña
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowPasswordReset(false)
                    setNewPassword('')
                    setPasswordError(null)
                  }}
                >
                  Cancelar
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
