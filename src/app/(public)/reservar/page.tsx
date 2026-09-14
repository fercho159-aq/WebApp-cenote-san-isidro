import type { Metadata } from "next";
import { BookingEngine } from "@/components/public/booking-engine";

export const metadata: Metadata = {
  title: "Reservar - Cenote San Isidro",
  description: "Reserva tu cabaña en Cenote San Isidro. Agrega paquetes de comida y acceso al parque.",
};

export default function ReservarPage() {
  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-[#0a3d2f] to-[#1a5c3a] text-white py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#D4A843] mb-3">Cenote San Isidro</p>
          <h1 className="text-4xl sm:text-5xl font-bold">Reservar Cabaña</h1>
          <p className="mt-4 text-lg text-white/70">
            Selecciona tus fechas, elige tu cabaña y agrega paquetes extras
          </p>
        </div>
      </section>

      {/* Booking Engine */}
      <section className="py-12 bg-gray-50">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <BookingEngine />
        </div>
      </section>
    </div>
  );
}
