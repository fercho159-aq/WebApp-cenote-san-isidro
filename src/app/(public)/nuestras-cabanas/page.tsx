import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { getPublicCabanas } from "@/actions/public-rooms";
import { formatCurrency } from "@/lib/formatters";

export const metadata: Metadata = {
  title: "Cabañas - Cenote San Isidro",
  description: "Reserva tu cabaña en Cenote San Isidro. 12 cabañas rodeadas de naturaleza.",
};

const cabanaImages: Record<string, string> = {
  "Casa del Arbol": "https://cenotesanisidro.com/wp-content/uploads/2026/06/casa-arbol-1024x768.jpg",
  "Casa del Árbol": "https://cenotesanisidro.com/wp-content/uploads/2026/06/casa-arbol-1024x768.jpg",
  "Beek": "https://cenotesanisidro.com/wp-content/uploads/2026/06/beek-1024x768.jpg",
  "Kanlol": "https://cenotesanisidro.com/wp-content/uploads/2026/06/kanlool-1024x768.png",
  "Kaanlol": "https://cenotesanisidro.com/wp-content/uploads/2026/06/kanlool-1024x768.png",
  "Lolbe": "https://cenotesanisidro.com/wp-content/uploads/2026/08/lolbee-1024x768.png",
};

const DEFAULT_IMAGE = "https://cenotesanisidro.com/wp-content/uploads/2024/09/Captura-de-pantalla-2024-09-01-a-las-10.10.37%E2%80%AFp.m.png";

const categoryColors: Record<string, string> = {
  "Estándar": "bg-gray-100 text-gray-700",
  "Superior": "bg-[#0a3d2f]/10 text-[#0a3d2f]",
  "Deluxe": "bg-[#8B6914]/10 text-[#8B6914]",
};

export default async function CabanasPage() {
  const cabanas = await getPublicCabanas();

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-[#0a3d2f] to-[#1a5c3a] text-white py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#D4A843] mb-3 font-body">Cenote San Isidro</p>
          <h1 className="text-4xl sm:text-5xl font-bold font-display">Cabañas</h1>
          <p className="mt-4 text-lg text-white/70 max-w-2xl font-body">
            Nuestras cabañas son el refugio perfecto para desconectar del estrés y disfrutar de una experiencia única. ¡Relájate y recarga energías en un entorno diseñado para tu bienestar!
          </p>
        </div>
      </section>

      {/* Notice */}
      <section className="bg-[#D4A843]/10 border-b border-[#D4A843]/20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4">
          <p className="text-center text-sm font-medium text-[#8B6914] font-body">
            RECUERDA QUE DURANTE TU ESTADÍA PODRÁS TENER ACCESO AL CENOTE SAN ISIDRO
          </p>
        </div>
      </section>

      {/* Cabañas Grid */}
      <section className="py-16 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {cabanas.length === 0 ? (
            <p className="text-center text-gray-500 py-12 font-body">
              No hay cabañas disponibles en este momento. Por favor, vuelve pronto.
            </p>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {cabanas.map((cab) => {
                const imageUrl = cabanaImages[cab.name] ?? DEFAULT_IMAGE;
                const category = cab.category_name ?? "Estándar";
                const maxAdults = cab.max_adults ?? 2;
                const maxChildren = cab.max_children ?? 0;
                const totalCapacity = maxAdults + maxChildren;
                const price = cab.base_price ? Number(cab.base_price) : null;

                return (
                  <div key={cab.id} className="group rounded-2xl border border-gray-200 bg-white overflow-hidden transition-all hover:shadow-lg hover:border-[#0a3d2f]/30">
                    {/* Image */}
                    <div className="aspect-[16/10] relative overflow-hidden">
                      <Image
                        src={imageUrl}
                        alt={`Cabaña ${cab.name}`}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      {category && (
                        <span className={`absolute top-3 right-3 rounded-full px-3 py-1 text-xs font-semibold backdrop-blur-sm ${categoryColors[category] ?? "bg-gray-100 text-gray-700"}`}>
                          {category}
                        </span>
                      )}
                    </div>

                    {/* Info */}
                    <div className="p-5">
                      <h3 className="text-lg font-bold text-gray-900 mb-2 uppercase font-display">{cab.name}</h3>
                      <div className="space-y-1 mb-4 font-body">
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Capacidad:</span> {maxAdults} adultos{maxChildren > 0 ? ` + ${maxChildren} niños` : ""}
                        </p>
                        {cab.category_description && (
                          <p className="text-sm text-gray-500">{cab.category_description}</p>
                        )}
                        {price !== null && price > 0 && (
                          <p className="text-base font-semibold text-[#0a3d2f] mt-2">
                            Desde {formatCurrency(price)} <span className="text-xs font-normal text-gray-500">/ noche</span>
                          </p>
                        )}
                      </div>
                      <Link
                        href="/reservar"
                        className="inline-flex w-full items-center justify-center rounded-xl bg-[#0a3d2f] px-4 py-2.5 text-sm font-semibold text-white transition-all hover:bg-[#0d5a3f] font-body"
                      >
                        ¡RESERVA!
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
