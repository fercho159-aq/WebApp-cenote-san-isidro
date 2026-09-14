import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Entradas - Cenote San Isidro",
  description: "Precios de entradas al Cenote San Isidro. Adultos $200, Niños $150.",
};

const amenities = [
  "Cenote natural",
  "Cenote artificial con toboganes",
  "Túnel de agua",
  "2 áreas de albercas",
  "Áreas comunes",
  "Sillas y mesas",
  "Palapas",
  "Baños y vestidores",
  "Regaderas",
];

export default function EntradasPage() {
  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-[#0a3d2f] to-[#1a5c3a] text-white py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#D4A843] mb-3">Cenote San Isidro</p>
          <h1 className="text-4xl sm:text-5xl font-bold">Entradas</h1>
          <p className="mt-4 text-lg text-white/70">ABRIMOS TODOS LOS DÍAS</p>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-16 bg-white">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="grid sm:grid-cols-2 gap-8">
            {/* Adults */}
            <div className="rounded-2xl border-2 border-[#0a3d2f] bg-white p-8 text-center shadow-sm">
              <p className="text-sm font-semibold uppercase tracking-wide text-[#0a3d2f] mb-4">Adultos</p>
              <div className="mb-2">
                <span className="text-5xl font-bold text-gray-900">$200</span>
              </div>
              <p className="text-sm text-gray-500 mb-6">PESOS</p>
              <p className="text-xs text-gray-400">(Descuento INAPAM con credencial)</p>
            </div>

            {/* Kids */}
            <div className="rounded-2xl border-2 border-[#D4A843] bg-white p-8 text-center shadow-sm">
              <p className="text-sm font-semibold uppercase tracking-wide text-[#D4A843] mb-4">Niños</p>
              <div className="mb-2">
                <span className="text-5xl font-bold text-gray-900">$150</span>
              </div>
              <p className="text-sm text-gray-500 mb-6">PESOS</p>
              <p className="text-xs text-gray-400">(Niños menores de 4 años no pagan)</p>
            </div>
          </div>
        </div>
      </section>

      {/* Amenities */}
      <section className="py-16 bg-gray-50">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-3">
            Con tu acceso, podrás disfrutar de todas nuestras amenidades
          </h2>
          <p className="text-gray-600 leading-relaxed mb-8">
            Déjate sorprender por un lugar único donde la naturaleza y la diversión se unen. Vive la magia de nuestro cenote natural, el verdadero corazón de este paraíso, y sumérgete en una experiencia refrescante e inolvidable.
          </p>
          <p className="text-gray-600 leading-relaxed mb-8">
            La aventura continúa en nuestro cenote artificial, donde encontrarás emocionantes toboganes y un divertido túnel de agua, perfectos para disfrutar en familia o con amigos. Además, tendrás acceso a 2 de nuestras 3 increíbles áreas de albercas.
          </p>

          <div className="grid sm:grid-cols-3 gap-3">
            {amenities.map((a) => (
              <div key={a} className="flex items-center gap-2 rounded-lg bg-white px-4 py-3 border border-gray-200">
                <svg className="h-4 w-4 text-[#0a3d2f] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
                <span className="text-sm text-gray-700">{a}</span>
              </div>
            ))}
          </div>

          <p className="mt-8 text-center text-gray-500 text-sm italic">
            Aquí, cada rincón está pensado para que vivas momentos inolvidables.
          </p>
        </div>
      </section>
    </div>
  );
}
