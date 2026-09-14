import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Nosotros - Cenote San Isidro",
  description: "Conoce nuestra historia y cómo llegar a Cenote San Isidro",
};

export default function NosotrosPage() {
  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-[#0a3d2f] to-[#1a5c3a] text-white py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#D4A843] mb-3">Cenote San Isidro</p>
          <h1 className="text-4xl sm:text-5xl font-bold">Nosotros</h1>
        </div>
      </section>

      {/* About */}
      <section className="py-16 bg-white">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <p className="text-lg text-gray-600 leading-relaxed">
            A lo largo de nuestro camino, hemos creado experiencias que nos han llevado a posicionarnos como un referente en el sector. En Cabañas San Isidro, estamos listos para ser parte de tu próximo gran capítulo. Nos apasiona acompañarte en momentos únicos y hacer de tu estancia una experiencia inolvidable, rodeado de la belleza natural que nos distingue.
          </p>
        </div>
      </section>

      {/* Cómo llegar */}
      <section id="llegar" className="py-16 bg-gray-50">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">¿Cómo llegar?</h2>
          <div className="rounded-2xl bg-white p-8 shadow-sm border border-gray-200">
            <p className="text-gray-600 mb-6">
              Cenote San Isidro se encuentra en Homún, Yucatán, a solo 30 minutos de Mérida.
            </p>
            <a
              href="https://maps.google.com/?q=Cenote+San+Isidro+Homun+Yucatan"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center rounded-xl bg-[#0a3d2f] px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-[#0d5a3f]"
            >
              Click para saber cómo llegar
            </a>
          </div>
        </div>
      </section>

      {/* Contact */}
      <section id="contacto" className="py-16 bg-white">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-3">¿Alguna duda?</h2>
          <p className="text-gray-600 mb-8">
            Envíanos mensaje y te responderemos lo antes posible.
          </p>
          <div className="grid sm:grid-cols-2 gap-4">
            <a
              href="tel:+529991234567"
              className="flex items-center justify-center gap-3 rounded-xl border-2 border-gray-200 bg-white px-6 py-4 text-sm font-semibold text-gray-700 transition-all hover:border-[#8B6914] hover:text-[#8B6914]"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
              </svg>
              Llámanos
            </a>
            <a
              href="https://wa.me/529991234567"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-3 rounded-xl border-2 border-[#25D366] bg-[#25D366] px-6 py-4 text-sm font-semibold text-white transition-all hover:bg-[#20bd5a]"
            >
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              WhatsApp
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
