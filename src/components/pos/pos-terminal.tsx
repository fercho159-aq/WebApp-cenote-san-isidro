'use client'

import { useState, useTransition } from 'react'
import {
  ShoppingCart,
  Minus,
  Plus,
  Trash2,
  CreditCard,
  Banknote,
  ArrowLeftRight,
  MoreHorizontal,
  CheckCircle,
  XCircle,
  Receipt,
  BedDouble,
} from 'lucide-react'
import { createSale } from '@/actions/pos'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatCurrency } from '@/lib/formatters'
import { formatDateTime } from '@/lib/formatters'
import { TAX_RATE, PAYMENT_METHODS } from '@/lib/constants'
import type { Product, ProductCategory, PosSale } from '@/types'

interface CartItem {
  productId: string
  name: string
  unitPrice: number
  quantity: number
}

interface PosTerminalProps {
  products: Product[]
  categories: ProductCategory[]
  reservations: {
    id: string
    reservation_number: string
    guest_name: string
    room_name: string
  }[]
  recentSales: PosSale[]
}

const PAYMENT_ICONS: Record<string, typeof Banknote> = {
  cash: Banknote,
  card: CreditCard,
  transfer: ArrowLeftRight,
  other: MoreHorizontal,
}

export function PosTerminal({
  products,
  categories,
  reservations,
  recentSales,
}: PosTerminalProps) {
  const [cart, setCart] = useState<CartItem[]>([])
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [paymentMethod, setPaymentMethod] = useState<string>('cash')
  const [reservationId, setReservationId] = useState<string>('')
  const [notes, setNotes] = useState('')
  const [isPending, startTransition] = useTransition()
  const [lastSale, setLastSale] = useState<{ saleNumber: string; total: number } | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [showHistory, setShowHistory] = useState(false)

  // Filter products by active category
  const displayProducts = activeCategory
    ? products.filter((p) => p.category_id === activeCategory)
    : products

  // Cart calculations
  const subtotal = cart.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0)
  const taxAmount = Math.round(subtotal * TAX_RATE * 100) / 100
  const total = Math.round((subtotal + taxAmount) * 100) / 100

  function addToCart(product: Product) {
    setCart((prev) => {
      const existing = prev.find((item) => item.productId === product.id)
      if (existing) {
        return prev.map((item) =>
          item.productId === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      }
      return [
        ...prev,
        {
          productId: product.id,
          name: product.name,
          unitPrice: Number(product.price),
          quantity: 1,
        },
      ]
    })
    setLastSale(null)
    setError(null)
  }

  function updateQuantity(productId: string, delta: number) {
    setCart((prev) =>
      prev
        .map((item) =>
          item.productId === productId
            ? { ...item, quantity: Math.max(0, item.quantity + delta) }
            : item
        )
        .filter((item) => item.quantity > 0)
    )
  }

  function removeFromCart(productId: string) {
    setCart((prev) => prev.filter((item) => item.productId !== productId))
  }

  function clearCart() {
    setCart([])
    setNotes('')
    setReservationId('')
    setError(null)
  }

  function handleCharge() {
    if (cart.length === 0) return

    setError(null)
    startTransition(async () => {
      const result = await createSale({
        items: cart.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
        })),
        paymentMethod,
        reservationId: reservationId || undefined,
        notes: notes || undefined,
      })

      if (result && 'error' in result) {
        setError(result.error ?? 'Error desconocido')
      } else if (result && 'success' in result) {
        setLastSale({
          saleNumber: (result as { saleNumber: string }).saleNumber,
          total,
        })
        setCart([])
        setNotes('')
        setReservationId('')
      }
    })
  }

  return (
    <div className="flex h-[calc(100vh-7rem)] flex-col gap-4 lg:flex-row">
      {/* LEFT: Product grid */}
      <div className="flex flex-1 flex-col overflow-hidden rounded-xl border border-border bg-card">
        {/* Header with tabs */}
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <h1 className="text-lg font-bold text-foreground">Punto de venta</h1>
          <Button
            variant={showHistory ? 'default' : 'outline'}
            size="sm"
            onClick={() => setShowHistory(!showHistory)}
          >
            <Receipt className="h-4 w-4" />
            Ventas
          </Button>
        </div>

        {showHistory ? (
          /* Sales history */
          <div className="flex-1 overflow-y-auto p-4">
            <h2 className="mb-3 text-sm font-semibold text-muted-foreground uppercase">
              Ventas recientes
            </h2>
            {recentSales.length > 0 ? (
              <div className="space-y-2">
                {recentSales.slice(0, 20).map((sale) => (
                  <div
                    key={sale.id}
                    className="flex items-center justify-between rounded-lg border border-border p-3"
                  >
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {sale.sale_number}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDateTime(sale.created_at)} &middot;{' '}
                        {PAYMENT_METHODS[sale.payment_method as keyof typeof PAYMENT_METHODS] ??
                          sale.payment_method}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {sale.status === 'voided' ? (
                        <Badge variant="destructive">Anulada</Badge>
                      ) : (
                        <Badge variant="success">Completada</Badge>
                      )}
                      <span className="text-sm font-semibold text-foreground">
                        {formatCurrency(Number(sale.total))}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No hay ventas registradas.</p>
            )}
          </div>
        ) : (
          <>
            {/* Category tabs */}
            <div className="flex gap-1 overflow-x-auto border-b border-border px-4 py-2">
              <button
                onClick={() => setActiveCategory(null)}
                className={`whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                  activeCategory === null
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                Todos
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                    activeCategory === cat.id
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>

            {/* Product grid */}
            <div className="flex-1 overflow-y-auto p-4">
              {displayProducts.length > 0 ? (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
                  {displayProducts.map((product) => (
                    <button
                      key={product.id}
                      onClick={() => addToCart(product)}
                      className="flex flex-col items-start rounded-xl border border-border bg-surface p-3 text-left transition-all hover:border-primary hover:shadow-md active:scale-[0.98]"
                    >
                      <span className="text-sm font-medium text-foreground line-clamp-2">
                        {product.name}
                      </span>
                      <span className="mt-auto pt-2 text-sm font-bold text-primary">
                        {formatCurrency(Number(product.price))}
                      </span>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="flex h-full items-center justify-center">
                  <p className="text-sm text-muted-foreground">
                    No hay productos en esta categoria.
                  </p>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* RIGHT: Cart / Ticket */}
      <div className="flex w-full flex-col rounded-xl border border-border bg-card lg:w-96">
        {/* Cart header */}
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <div className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5 text-primary" />
            <h2 className="font-semibold text-foreground">Ticket</h2>
            {cart.length > 0 && (
              <Badge variant="default">{cart.reduce((s, i) => s + i.quantity, 0)}</Badge>
            )}
          </div>
          {cart.length > 0 && (
            <button
              onClick={clearCart}
              className="text-xs text-muted-foreground hover:text-destructive transition-colors"
            >
              Limpiar
            </button>
          )}
        </div>

        {/* Success message */}
        {lastSale && (
          <div className="mx-4 mt-3 flex items-center gap-2 rounded-lg bg-status-confirmed-bg p-3 text-sm text-status-confirmed">
            <CheckCircle className="h-5 w-5 shrink-0" />
            <div>
              <p className="font-semibold">Venta registrada</p>
              <p className="text-xs">
                {lastSale.saleNumber} &middot; {formatCurrency(lastSale.total)}
              </p>
            </div>
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="mx-4 mt-3 flex items-center gap-2 rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
            <XCircle className="h-5 w-5 shrink-0" />
            <p>{error}</p>
          </div>
        )}

        {/* Cart items */}
        <div className="flex-1 overflow-y-auto px-4 py-3">
          {cart.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <ShoppingCart className="h-10 w-10 text-muted-foreground/40" />
              <p className="mt-2 text-sm text-muted-foreground">
                Selecciona productos para agregar al ticket
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {cart.map((item) => (
                <div
                  key={item.productId}
                  className="flex items-center gap-2 rounded-lg bg-muted/50 p-2"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {item.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatCurrency(item.unitPrice)} c/u
                    </p>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => updateQuantity(item.productId, -1)}
                      className="flex h-7 w-7 items-center justify-center rounded-md bg-surface border border-border text-foreground hover:bg-muted transition-colors"
                    >
                      <Minus className="h-3 w-3" />
                    </button>
                    <span className="w-8 text-center text-sm font-medium text-foreground">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.productId, 1)}
                      className="flex h-7 w-7 items-center justify-center rounded-md bg-surface border border-border text-foreground hover:bg-muted transition-colors"
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>

                  <div className="w-20 text-right">
                    <p className="text-sm font-semibold text-foreground">
                      {formatCurrency(item.unitPrice * item.quantity)}
                    </p>
                  </div>

                  <button
                    onClick={() => removeFromCart(item.productId)}
                    className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:text-destructive transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Totals & payment */}
        <div className="border-t border-border px-4 py-3 space-y-3">
          {/* Totals */}
          <div className="space-y-1 text-sm">
            <div className="flex justify-between text-muted-foreground">
              <span>Subtotal</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>IVA (16%)</span>
              <span>{formatCurrency(taxAmount)}</span>
            </div>
            <div className="flex justify-between text-lg font-bold text-foreground">
              <span>Total</span>
              <span>{formatCurrency(total)}</span>
            </div>
          </div>

          {/* Payment method */}
          <div>
            <p className="mb-1.5 text-xs font-medium text-muted-foreground uppercase">
              Metodo de pago
            </p>
            <div className="grid grid-cols-4 gap-1.5">
              {(Object.keys(PAYMENT_METHODS) as Array<keyof typeof PAYMENT_METHODS>).map(
                (method) => {
                  const Icon = PAYMENT_ICONS[method] ?? MoreHorizontal
                  return (
                    <button
                      key={method}
                      onClick={() => setPaymentMethod(method)}
                      className={`flex flex-col items-center gap-1 rounded-lg border p-2 text-xs font-medium transition-colors ${
                        paymentMethod === method
                          ? 'border-primary bg-accent text-primary'
                          : 'border-border bg-surface text-muted-foreground hover:bg-muted'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      <span className="truncate">{PAYMENT_METHODS[method]}</span>
                    </button>
                  )
                }
              )}
            </div>
          </div>

          {/* Room charge (optional) */}
          {reservations.length > 0 && (
            <div>
              <p className="mb-1.5 text-xs font-medium text-muted-foreground uppercase flex items-center gap-1">
                <BedDouble className="h-3.5 w-3.5" />
                Cargo a habitacion
              </p>
              <select
                value={reservationId}
                onChange={(e) => setReservationId(e.target.value)}
                className="flex h-9 w-full rounded-lg border border-border bg-surface px-3 py-1 text-sm text-foreground ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <option value="">Sin cargo a habitacion</option>
                {reservations.map((res) => (
                  <option key={res.id} value={res.id}>
                    {res.room_name} - {res.guest_name} ({res.reservation_number})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Notes */}
          <div>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Notas (opcional)"
              className="flex h-9 w-full rounded-lg border border-border bg-surface px-3 py-1 text-sm text-foreground ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            />
          </div>

          {/* Charge button */}
          <Button
            onClick={handleCharge}
            disabled={cart.length === 0 || isPending}
            className="w-full h-12 text-base font-bold"
          >
            {isPending ? (
              'Procesando...'
            ) : (
              <>
                <CheckCircle className="h-5 w-5" />
                Cobrar {cart.length > 0 && formatCurrency(total)}
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
