"use client";

import { useState, useEffect } from "react";
import { checkAvailability, getPublicPackages, createPublicReservation, recordBookingPayment } from "@/actions/public-booking";

type Step = "dates" | "room" | "packages" | "guest" | "confirm" | "payment" | "success";

interface AvailableRoom {
  id: string;
  name: string;
  sort_order: number;
  category: {
    id: string;
    name: string;
    description: string;
    base_price: number;
    max_occupancy: number;
  } | null;
}

interface PackageItem {
  id: string;
  category_id: string;
  name: string;
  description: string;
  price: number;
  price_type: string;
  sort_order: number;
}

interface PackageCategory {
  id: string;
  name: string;
  description: string;
}

interface SelectedPackage {
  packageId: string;
  quantity: number;
}

export function BookingEngine() {
  const [step, setStep] = useState<Step>("dates");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Step 1: Dates
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);

  // Step 2: Room
  const [availableRooms, setAvailableRooms] = useState<AvailableRoom[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<AvailableRoom | null>(null);

  // Step 3: Packages
  const [pkgCategories, setPkgCategories] = useState<PackageCategory[]>([]);
  const [pkgItems, setPkgItems] = useState<PackageItem[]>([]);
  const [selectedPackages, setSelectedPackages] = useState<SelectedPackage[]>([]);

  // Step 4: Guest info
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");

  // Result
  const [result, setResult] = useState<{
    reservationNumber: string;
    reservationId: string;
    total: number;
    nights: number;
    nightlyRate: number;
    packagesTotal: number;
  } | null>(null);

  // Payment
  const [paymentMethod, setPaymentMethod] = useState<"card" | "transfer" | "cash" | null>(null);
  const [cardNumber, setCardNumber] = useState("");
  const [paymentCompleted, setPaymentCompleted] = useState(false);
  const [paymentMethodUsed, setPaymentMethodUsed] = useState<string | null>(null);

  const today = new Date().toISOString().split("T")[0];
  const nights = checkIn && checkOut
    ? Math.ceil((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  async function handleSearchRooms() {
    if (!checkIn || !checkOut || nights <= 0) {
      setError("Selecciona fechas válidas.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const rooms = await checkAvailability(checkIn, checkOut);
      setAvailableRooms(rooms as AvailableRoom[]);
      if (rooms.length === 0) {
        setError("No hay cabañas disponibles para las fechas seleccionadas.");
      } else {
        setStep("room");
      }
    } catch {
      setError("Error al buscar disponibilidad.");
    }
    setLoading(false);
  }

  async function handleSelectRoom(room: AvailableRoom) {
    setSelectedRoom(room);
    setLoading(true);
    try {
      const { categories, packages } = await getPublicPackages();
      setPkgCategories(categories as PackageCategory[]);
      setPkgItems(packages as PackageItem[]);
    } catch {
      // Packages are optional
    }
    setLoading(false);
    setStep("packages");
  }

  function togglePackage(pkgId: string) {
    setSelectedPackages((prev) => {
      const existing = prev.find((p) => p.packageId === pkgId);
      if (existing) {
        return prev.filter((p) => p.packageId !== pkgId);
      }
      return [...prev, { packageId: pkgId, quantity: 1 }];
    });
  }

  function updatePackageQuantity(pkgId: string, qty: number) {
    if (qty < 1) return;
    setSelectedPackages((prev) =>
      prev.map((p) => (p.packageId === pkgId ? { ...p, quantity: qty } : p))
    );
  }

  async function handleSubmit() {
    if (!firstName || !lastName || !email || !phone) {
      setError("Todos los campos son obligatorios.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await createPublicReservation({
        checkIn,
        checkOut,
        roomId: selectedRoom!.id,
        adults,
        children,
        guestFirstName: firstName,
        guestLastName: lastName,
        guestEmail: email,
        guestPhone: phone,
        notes: notes || undefined,
        packages: selectedPackages.length > 0 ? selectedPackages : undefined,
      });
      if (res.error) {
        setError(res.error);
      } else {
        setResult({
          reservationNumber: res.reservationNumber!,
          reservationId: res.reservationId!,
          total: res.total!,
          nights: res.nights!,
          nightlyRate: res.nightlyRate!,
          packagesTotal: res.packagesTotal!,
        });
        setStep("payment");
      }
    } catch {
      setError("Error al crear la reservación.");
    }
    setLoading(false);
  }

  const roomRate = selectedRoom?.category?.base_price ?? 0;
  const roomSubtotal = roomRate * nights;

  function formatMXN(n: number) {
    return new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(n);
  }

  function getPriceLabel(p: PackageItem) {
    switch (p.price_type) {
      case "per_person": return `${formatMXN(p.price)} / persona`;
      case "per_night": return `${formatMXN(p.price)} / noche`;
      case "per_person_per_night": return `${formatMXN(p.price)} / persona / noche`;
      default: return formatMXN(p.price);
    }
  }

  async function handlePayment() {
    if (!result) return;
    setError("");

    if (paymentMethod === "card") {
      const digits = cardNumber.replace(/\s/g, "");
      if (!/^\d{16}$/.test(digits)) {
        setError("Ingresa un número de tarjeta válido (16 dígitos).");
        return;
      }
    }

    setLoading(true);
    try {
      if (paymentMethod === "cash") {
        // "Pagar al llegar" - record a $0 payment, status stays pending
        const res = await recordBookingPayment({
          reservationId: result.reservationId,
          amount: 0,
          method: "cash",
          reference: "Pago al llegar",
        });
        if (res.error) {
          setError(res.error);
        } else {
          setPaymentCompleted(false);
          setPaymentMethodUsed("cash");
          setStep("success");
        }
      } else {
        // card or transfer - simulate full payment
        const reference = paymentMethod === "card"
          ? `CARD-****${cardNumber.replace(/\s/g, "").slice(-4)}`
          : `TRANSF-${Date.now()}`;
        const res = await recordBookingPayment({
          reservationId: result.reservationId,
          amount: result.total,
          method: paymentMethod!,
          reference,
        });
        if (res.error) {
          setError(res.error);
        } else {
          setPaymentCompleted(true);
          setPaymentMethodUsed(paymentMethod);
          setStep("success");
        }
      }
    } catch {
      setError("Error al procesar el pago.");
    }
    setLoading(false);
  }

  return (
    <div>
      {/* Progress Steps */}
      <div className="flex items-center justify-center gap-2 mb-8 flex-wrap">
        {[
          { key: "dates", label: "1. Fechas" },
          { key: "room", label: "2. Cabaña" },
          { key: "packages", label: "3. Paquetes" },
          { key: "guest", label: "4. Datos" },
          { key: "payment", label: "5. Pago" },
        ].map((s, i) => {
          const steps: Step[] = ["dates", "room", "packages", "guest", "payment"];
          const mappedStep = step === "confirm" ? "guest" : step === "success" ? "payment" : step;
          const currentIdx = steps.indexOf(mappedStep as Step);
          const stepIdx = i;
          const isActive = stepIdx <= currentIdx;
          return (
            <div key={s.key} className="flex items-center gap-2">
              {i > 0 && (
                <div className={`h-px w-4 sm:w-8 ${isActive ? "bg-[#0a3d2f]" : "bg-gray-300"}`} />
              )}
              <div className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${
                isActive ? "bg-[#0a3d2f] text-white" : "bg-gray-200 text-gray-500"
              }`}>
                {s.label}
              </div>
            </div>
          );
        })}
      </div>

      {error && (
        <div className="mb-6 rounded-lg bg-red-50 border border-red-200 p-4 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Step 1: Dates */}
      {step === "dates" && (
        <div className="rounded-2xl bg-white p-8 shadow-sm border border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Selecciona tus fechas</h2>
          <div className="grid sm:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de llegada</label>
              <input
                type="date"
                value={checkIn}
                min={today}
                onChange={(e) => { setCheckIn(e.target.value); setError(""); }}
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-[#0a3d2f] focus:ring-1 focus:ring-[#0a3d2f] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de salida</label>
              <input
                type="date"
                value={checkOut}
                min={checkIn || today}
                onChange={(e) => { setCheckOut(e.target.value); setError(""); }}
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-[#0a3d2f] focus:ring-1 focus:ring-[#0a3d2f] focus:outline-none"
              />
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Adultos</label>
              <select
                value={adults}
                onChange={(e) => setAdults(Number(e.target.value))}
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-[#0a3d2f] focus:ring-1 focus:ring-[#0a3d2f] focus:outline-none"
              >
                {[1,2,3,4,5,6,7,8].map(n => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Niños</label>
              <select
                value={children}
                onChange={(e) => setChildren(Number(e.target.value))}
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-[#0a3d2f] focus:ring-1 focus:ring-[#0a3d2f] focus:outline-none"
              >
                {[0,1,2,3,4,5].map(n => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>
          </div>
          {nights > 0 && (
            <p className="text-sm text-gray-500 mb-4">{nights} noche{nights > 1 ? "s" : ""}</p>
          )}
          <button
            onClick={handleSearchRooms}
            disabled={loading}
            className="w-full rounded-xl bg-[#0a3d2f] px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-[#0d5a3f] disabled:opacity-50"
          >
            {loading ? "Buscando..." : "Buscar disponibilidad"}
          </button>
        </div>
      )}

      {/* Step 2: Select Room */}
      {step === "room" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xl font-bold text-gray-900">Cabañas disponibles</h2>
            <button onClick={() => setStep("dates")} className="text-sm text-[#0a3d2f] hover:underline">
              ← Cambiar fechas
            </button>
          </div>
          <p className="text-sm text-gray-500 mb-4">{nights} noche{nights > 1 ? "s" : ""} · {checkIn} al {checkOut}</p>
          {availableRooms.map((room) => (
            <div
              key={room.id}
              className="rounded-xl bg-white p-6 shadow-sm border border-gray-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 hover:border-[#0a3d2f]/30 transition-colors"
            >
              <div>
                <h3 className="text-lg font-bold text-gray-900">{room.name}</h3>
                <p className="text-sm text-gray-500">{room.category?.name ?? "Sin categoría"}</p>
                {room.category?.max_occupancy && (
                  <p className="text-xs text-gray-400">Hasta {room.category.max_occupancy} personas</p>
                )}
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-gray-900">
                  {formatMXN(Number(room.category?.base_price ?? 0))}
                </p>
                <p className="text-xs text-gray-500">por noche</p>
                <p className="text-sm font-semibold text-[#0a3d2f] mt-1">
                  Total: {formatMXN(Number(room.category?.base_price ?? 0) * nights)}
                </p>
                <button
                  onClick={() => handleSelectRoom(room)}
                  disabled={loading}
                  className="mt-3 rounded-xl bg-[#0a3d2f] px-6 py-2 text-sm font-semibold text-white transition-all hover:bg-[#0d5a3f]"
                >
                  Seleccionar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Step 3: Packages */}
      {step === "packages" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xl font-bold text-gray-900">Agrega paquetes (opcional)</h2>
            <button onClick={() => setStep("room")} className="text-sm text-[#0a3d2f] hover:underline">
              ← Cambiar cabaña
            </button>
          </div>
          <div className="rounded-lg bg-[#0a3d2f]/5 border border-[#0a3d2f]/10 p-4 mb-4">
            <p className="text-sm text-gray-700">
              <span className="font-semibold">{selectedRoom?.name}</span> · {nights} noche{nights > 1 ? "s" : ""} · {formatMXN(roomSubtotal)}
            </p>
          </div>

          {pkgCategories.length === 0 ? (
            <p className="text-sm text-gray-500">No hay paquetes disponibles por el momento.</p>
          ) : (
            pkgCategories.map((cat) => {
              const items = pkgItems.filter((p) => p.category_id === cat.id);
              if (items.length === 0) return null;
              return (
                <div key={cat.id}>
                  <h3 className="text-base font-semibold text-gray-900 mb-3">{cat.name}</h3>
                  <div className="space-y-2">
                    {items.map((pkg) => {
                      const selected = selectedPackages.find((sp) => sp.packageId === pkg.id);
                      return (
                        <div
                          key={pkg.id}
                          className={`rounded-xl border p-4 cursor-pointer transition-all ${
                            selected
                              ? "border-[#0a3d2f] bg-[#0a3d2f]/5"
                              : "border-gray-200 bg-white hover:border-gray-300"
                          }`}
                          onClick={() => togglePackage(pkg.id)}
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex items-start gap-3">
                              <div className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border ${
                                selected ? "border-[#0a3d2f] bg-[#0a3d2f]" : "border-gray-300"
                              }`}>
                                {selected && (
                                  <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                                  </svg>
                                )}
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-900">{pkg.name}</p>
                                {pkg.description && <p className="text-xs text-gray-500 mt-0.5">{pkg.description}</p>}
                              </div>
                            </div>
                            <p className="text-sm font-semibold text-gray-900 whitespace-nowrap">{getPriceLabel(pkg)}</p>
                          </div>
                          {selected && (
                            <div className="mt-3 flex items-center gap-3 ml-8" onClick={(e) => e.stopPropagation()}>
                              <label className="text-xs text-gray-600">Cantidad:</label>
                              <div className="flex items-center rounded-lg border border-gray-300">
                                <button
                                  onClick={() => updatePackageQuantity(pkg.id, selected.quantity - 1)}
                                  className="px-2 py-1 text-gray-600 hover:bg-gray-50"
                                >−</button>
                                <span className="px-3 py-1 text-sm font-medium border-x border-gray-300">{selected.quantity}</span>
                                <button
                                  onClick={() => updatePackageQuantity(pkg.id, selected.quantity + 1)}
                                  className="px-2 py-1 text-gray-600 hover:bg-gray-50"
                                >+</button>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })
          )}

          <button
            onClick={() => setStep("guest")}
            className="w-full rounded-xl bg-[#0a3d2f] px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-[#0d5a3f]"
          >
            {selectedPackages.length > 0 ? "Continuar con paquetes" : "Continuar sin paquetes"}
          </button>
        </div>
      )}

      {/* Step 4: Guest Info */}
      {step === "guest" && (
        <div className="rounded-2xl bg-white p-8 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Tus datos</h2>
            <button onClick={() => setStep("packages")} className="text-sm text-[#0a3d2f] hover:underline">
              ← Paquetes
            </button>
          </div>
          <div className="grid sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => { setFirstName(e.target.value); setError(""); }}
                placeholder="Tu nombre"
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-[#0a3d2f] focus:ring-1 focus:ring-[#0a3d2f] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Apellido *</label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => { setLastName(e.target.value); setError(""); }}
                placeholder="Tu apellido"
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-[#0a3d2f] focus:ring-1 focus:ring-[#0a3d2f] focus:outline-none"
              />
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Correo electrónico *</label>
              <input
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(""); }}
                placeholder="tu@correo.com"
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-[#0a3d2f] focus:ring-1 focus:ring-[#0a3d2f] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono *</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => { setPhone(e.target.value); setError(""); }}
                placeholder="+52 999 123 4567"
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-[#0a3d2f] focus:ring-1 focus:ring-[#0a3d2f] focus:outline-none"
              />
            </div>
          </div>
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">Notas (opcional)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Algún requerimiento especial..."
              rows={3}
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-[#0a3d2f] focus:ring-1 focus:ring-[#0a3d2f] focus:outline-none resize-none"
            />
          </div>

          {/* Summary */}
          <div className="rounded-lg bg-gray-50 border border-gray-200 p-4 mb-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Resumen</h3>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">{selectedRoom?.name} × {nights} noche{nights > 1 ? "s" : ""}</span>
                <span className="font-medium">{formatMXN(roomSubtotal)}</span>
              </div>
              {selectedPackages.map((sp) => {
                const pkg = pkgItems.find((p) => p.id === sp.packageId);
                if (!pkg) return null;
                return (
                  <div key={sp.packageId} className="flex justify-between">
                    <span className="text-gray-600">{pkg.name} × {sp.quantity}</span>
                    <span className="font-medium">{getPriceLabel(pkg)}</span>
                  </div>
                );
              })}
              <div className="flex justify-between pt-2 border-t border-gray-200 mt-2">
                <span className="text-gray-600">IVA (16%)</span>
                <span className="font-medium">{formatMXN(roomSubtotal * 0.16)}</span>
              </div>
            </div>
          </div>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full rounded-xl bg-[#D4A843] px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-[#c49a3a] disabled:opacity-50"
          >
            {loading ? "Procesando..." : "Confirmar Reservación"}
          </button>
        </div>
      )}

      {/* Step 5: Payment */}
      {step === "payment" && result && (
        <div className="rounded-2xl bg-white p-8 shadow-sm border border-gray-200">
          <h2 className="text-xl font-bold font-display text-gray-900 mb-2">Método de pago</h2>
          <p className="text-sm font-body text-gray-500 mb-6">
            Reservación <span className="font-semibold text-[#0a3d2f]">{result.reservationNumber}</span> — Total a pagar: <span className="font-bold text-gray-900">{formatMXN(result.total)}</span>
          </p>

          {/* Payment method cards */}
          <div className="grid gap-3 mb-6">
            {/* Card option */}
            <button
              type="button"
              onClick={() => { setPaymentMethod("card"); setError(""); }}
              className={`flex items-center gap-4 rounded-xl border-2 p-4 text-left transition-all ${
                paymentMethod === "card"
                  ? "border-[#D4A843] bg-[#D4A843]/5"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
                paymentMethod === "card" ? "bg-[#D4A843] text-white" : "bg-gray-100 text-gray-500"
              }`}>
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-semibold font-body text-gray-900">Tarjeta de crédito/débito</p>
                <p className="text-xs text-gray-500">Pago inmediato simulado</p>
              </div>
            </button>

            {/* Transfer option */}
            <button
              type="button"
              onClick={() => { setPaymentMethod("transfer"); setError(""); }}
              className={`flex items-center gap-4 rounded-xl border-2 p-4 text-left transition-all ${
                paymentMethod === "transfer"
                  ? "border-[#D4A843] bg-[#D4A843]/5"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
                paymentMethod === "transfer" ? "bg-[#D4A843] text-white" : "bg-gray-100 text-gray-500"
              }`}>
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0012 9.75c-2.551 0-5.056.2-7.5.582V21" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-semibold font-body text-gray-900">Transferencia bancaria</p>
                <p className="text-xs text-gray-500">Pago por SPEI o transferencia</p>
              </div>
            </button>

            {/* Cash / pay on arrival option */}
            <button
              type="button"
              onClick={() => { setPaymentMethod("cash"); setError(""); }}
              className={`flex items-center gap-4 rounded-xl border-2 p-4 text-left transition-all ${
                paymentMethod === "cash"
                  ? "border-[#D4A843] bg-[#D4A843]/5"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
                paymentMethod === "cash" ? "bg-[#D4A843] text-white" : "bg-gray-100 text-gray-500"
              }`}>
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-semibold font-body text-gray-900">Pagar al llegar</p>
                <p className="text-xs text-gray-500">La reservación queda pendiente de pago</p>
              </div>
            </button>
          </div>

          {/* Card form (simulated) */}
          {paymentMethod === "card" && (
            <div className="rounded-xl border border-gray-200 bg-gray-50 p-5 mb-6">
              <h3 className="text-sm font-semibold font-body text-gray-900 mb-4">Datos de tarjeta (simulado)</h3>
              <div>
                <label className="block text-sm font-medium font-body text-gray-700 mb-1">Número de tarjeta</label>
                <input
                  type="text"
                  value={cardNumber}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, "").slice(0, 16);
                    const formatted = val.replace(/(\d{4})(?=\d)/g, "$1 ");
                    setCardNumber(formatted);
                    setError("");
                  }}
                  placeholder="0000 0000 0000 0000"
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-mono tracking-wider focus:border-[#0a3d2f] focus:ring-1 focus:ring-[#0a3d2f] focus:outline-none"
                  maxLength={19}
                />
                <p className="text-xs text-gray-400 mt-1">Ingresa cualquier número de 16 dígitos (simulación)</p>
              </div>
            </div>
          )}

          {/* Transfer details */}
          {paymentMethod === "transfer" && (
            <div className="rounded-xl border border-[#0a3d2f]/20 bg-[#0a3d2f]/5 p-5 mb-6">
              <h3 className="text-sm font-semibold font-body text-gray-900 mb-3">Datos para transferencia</h3>
              <div className="space-y-2 text-sm font-body">
                <div className="flex justify-between">
                  <span className="text-gray-600">CLABE:</span>
                  <span className="font-mono font-medium text-gray-900">012345678901234567</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Banco:</span>
                  <span className="font-medium text-gray-900">BBVA</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Beneficiario:</span>
                  <span className="font-medium text-gray-900">Cenote San Isidro</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Monto:</span>
                  <span className="font-bold text-[#0a3d2f]">{formatMXN(result.total)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Referencia:</span>
                  <span className="font-medium text-gray-900">{result.reservationNumber}</span>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-3">Al hacer clic en "Pagar" se registrará el pago como realizado (simulación).</p>
            </div>
          )}

          {/* Cash info */}
          {paymentMethod === "cash" && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-5 mb-6">
              <p className="text-sm font-body text-amber-800">
                Tu reservación quedará en estado <span className="font-semibold">pendiente de pago</span>. Podrás realizar el pago al momento de tu llegada al Cenote San Isidro.
              </p>
            </div>
          )}

          {paymentMethod && (
            <button
              onClick={handlePayment}
              disabled={loading}
              className="w-full rounded-xl bg-[#D4A843] px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-[#c49a3a] disabled:opacity-50"
            >
              {loading
                ? "Procesando..."
                : paymentMethod === "cash"
                  ? "Confirmar sin pago"
                  : `Pagar ${formatMXN(result.total)}`
              }
            </button>
          )}
        </div>
      )}

      {/* Step 6: Success */}
      {step === "success" && result && (
        <div className="rounded-2xl bg-white p-8 shadow-sm border border-gray-200 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold font-display text-gray-900 mb-2">
            {paymentCompleted ? "¡Reservación confirmada y pagada!" : "¡Reservación registrada!"}
          </h2>
          <p className="text-gray-600 font-body mb-6">Tu número de reservación es:</p>
          <p className="text-3xl font-bold font-display text-[#0a3d2f] mb-6">{result.reservationNumber}</p>

          {/* Payment status badge */}
          {paymentMethodUsed && (
            <div className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold font-body mb-6 ${
              paymentCompleted
                ? "bg-green-100 text-green-800"
                : "bg-amber-100 text-amber-800"
            }`}>
              {paymentCompleted ? (
                <>
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {paymentMethodUsed === "card" ? "Pagado con tarjeta" : "Pagado por transferencia"}
                </>
              ) : (
                <>
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Pendiente de pago — pagar al llegar
                </>
              )}
            </div>
          )}

          <div className="rounded-lg bg-gray-50 border border-gray-200 p-4 text-left mb-6">
            <div className="space-y-2 text-sm font-body">
              <div className="flex justify-between">
                <span className="text-gray-600">{selectedRoom?.name} x {result.nights} noche{result.nights > 1 ? "s" : ""}</span>
                <span className="font-medium">{formatMXN(result.nightlyRate * result.nights)}</span>
              </div>
              {result.packagesTotal > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Paquetes</span>
                  <span className="font-medium">{formatMXN(result.packagesTotal)}</span>
                </div>
              )}
              <div className="flex justify-between pt-2 border-t border-gray-200 font-bold text-base">
                <span>Total</span>
                <span className="text-[#0a3d2f]">{formatMXN(result.total)}</span>
              </div>
              {paymentCompleted && (
                <div className="flex justify-between pt-2 border-t border-gray-200 text-green-700 font-semibold">
                  <span>Pagado</span>
                  <span>{formatMXN(result.total)}</span>
                </div>
              )}
            </div>
          </div>
          <p className="text-sm font-body text-gray-500">
            {paymentCompleted
              ? "Te enviaremos los detalles y tu comprobante de pago a tu correo electrónico. Para cualquier duda, contáctanos por WhatsApp."
              : "Te enviaremos los detalles a tu correo electrónico. Recuerda realizar tu pago al llegar al Cenote San Isidro."}
          </p>
        </div>
      )}
    </div>
  );
}
