import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Cabañas - Cenote San Isidro",
  description: "Reserva tu cabaña en Cenote San Isidro. 12 cabañas rodeadas de naturaleza.",
};

const cabanas = [
  { name: "Casa del Árbol", capacity: 3, beds: "1 cama matrimonial, 1 cama individual", category: "Deluxe" },
  { name: "Beek", capacity: 4, beds: "2 camas individuales", category: "Superior" },
  { name: "Kaanlol", capacity: 5, beds: "2 camas matrimoniales", category: "Superior" },
  { name: "Lolbe", capacity: 7, beds: "2 camas matrimoniales, 2 camas individuales", category: "Deluxe" },
  { name: "Naluum", capacity: 4, beds: "1 cama matrimonial, 1 cama individual", category: "Estándar" },
  { name: "Quetzalli", capacity: 4, beds: "2 camas matrimoniales", category: "Estándar" },
  { name: "Kiim", capacity: 4, beds: "1 cama matrimonial, 1 cama individual", category: "Estándar" },
  { name: "Lolha", capacity: 4, beds: "2 camas matrimoniales", category: "Estándar" },
  { name: "Mestiza", capacity: 5, beds: "2 camas matrimoniales", category: "Superior" },
  { name: "Yatzil", capacity: 4, beds: "1 cama matrimonial, 1 cama individual", category: "Superior" },
  { name: "Itzel", capacity: 4, beds: "2 camas individuales", category: "Superior" },
  { name: "Zach", capacity: 4, beds: "2 camas individuales", category: "Superior" },
];

const categoryColors: Record<string, string> = {
  "Estándar": "bg-gray-100 text-gray-700",
  "Superior": "bg-[#0a3d2f]/10 text-[#0a3d2f]",
  "Deluxe": "bg-[#8B6914]/10 text-[#8B6914]",
};

export default function CabanasPage() {
  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-[#0a3d2f] to-[#1a5c3a] text-white py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#D4A843] mb-3">Cenote San Isidro</p>
          <h1 className="text-4xl sm:text-5xl font-bold">Cabañas</h1>
          <p className="mt-4 text-lg text-white/70 max-w-2xl">
            Nuestras cabañas son el refugio perfecto para desconectar del estrés y disfrutar de una experiencia única. ¡Relájate y recarga energías en un entorno diseñado para tu bienestar!
          </p>
        </div>
      </section>

      {/* Notice */}
      <section className="bg-[#D4A843]/10 border-b border-[#D4A843]/20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4">
          <p className="text-center text-sm font-medium text-[#8B6914]">
            RECUERDA QUE DURANTE TU ESTADÍA PODRÁS TENER ACCESO AL CENOTE SAN ISIDRO
          </p>
        </div>
      </section>

      {/* Cabañas Grid */}
      <section className="py-16 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {cabanas.map((cab) => (
              <div key={cab.name} className="group rounded-2xl border border-gray-200 bg-white overflow-hidden transition-all hover:shadow-lg hover:border-[#0a3d2f]/30">
                {/* Image placeholder */}
                <div className="aspect-[16/10] bg-gradient-to-br from-gray-100 to-gray-50 flex items-center justify-center relative">
                  <div className="text-center">
                    <svg className="mx-auto h-10 w-10 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z" />
                    </svg>
                    <p className="text-xs text-gray-400 mt-1">Galería</p>
                  </div>
                  <span className={`absolute top-3 right-3 rounded-full px-3 py-1 text-xs font-semibold ${categoryColors[cab.category]}`}>
                    {cab.category}
                  </span>
                </div>

                {/* Info */}
                <div className="p-5">
                  <h3 className="text-lg font-bold text-gray-900 mb-2 uppercase">{cab.name}</h3>
                  <div className="space-y-1 mb-4">
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Capacidad máxima:</span> {cab.capacity} personas
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Camas:</span> {cab.beds}
                    </p>
                  </div>
                  <Link
                    href="/reservar"
                    className="inline-flex w-full items-center justify-center rounded-xl bg-[#0a3d2f] px-4 py-2.5 text-sm font-semibold text-white transition-all hover:bg-[#0d5a3f]"
                  >
                    ¡RESERVA!
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
