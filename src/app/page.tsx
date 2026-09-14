import Link from "next/link";
import { Navbar } from "@/components/public/navbar";
import { Footer } from "@/components/public/footer";
import { WhatsAppButton } from "@/components/public/whatsapp-button";

const mediaLogos = [
  { name: "México Desconocido", href: "https://www.mexicodesconocido.com.mx/cenote-san-isidro-la-mini-riviera-maya-de-yucatan.html" },
  { name: "Descubro MX", href: "https://descubro.mx/cenote-san-isidro-homun/" },
  { name: "Por Esto!", href: "https://www.poresto.net/yucatan/2022/11/2/asi-es-el-cenote-artificial-que-esta-muy-cerca-de-merida-fotos.html" },
  { name: "Top Adventure", href: "https://topadventure.com/experiencias/La-mini-Riviera-Maya-de-Yucatan-que-es-mas-barata-20221029-0005.html" },
  { name: "Escapadah", href: "https://www.escapadah.com/destinos/2022/11/4/el-cenote-artificial-que-puedes-conocer-solo-media-hora-de-merida-asi-luce-5807.html" },
];

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col bg-white text-gray-900">
      <Navbar />

      <main className="flex-1 pt-20">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-br from-[#0a3d2f] via-[#1a5c3a] to-[#2d7a4a] text-white">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImEiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMSIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjAzKSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3QgZmlsbD0idXJsKCNhKSIgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIvPjwvc3ZnPg==')] opacity-50" />
          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24 sm:py-32 lg:py-40">
            <div className="max-w-2xl">
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#D4A843] mb-4">
                Cenote San Isidro
              </p>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6">
                La Mini <br />Rivera Maya
              </h1>
              <p className="text-lg text-white/80 leading-relaxed mb-8 max-w-xl">
                Disfruta un día increíble en nuestro cenote natural y artificial, rodeado de piscinas espectaculares y una selección de comida deliciosa. Vive la experiencia, relájate y captura momentos únicos.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link
                  href="/entradas"
                  className="inline-flex items-center justify-center rounded-xl bg-[#D4A843] px-8 py-3.5 text-sm font-semibold text-white shadow-lg transition-all hover:bg-[#c49a3a] hover:shadow-xl"
                >
                  ENTRADAS
                </Link>
                <Link
                  href="/nuestras-cabanas"
                  className="inline-flex items-center justify-center rounded-xl border-2 border-white/30 bg-white/10 px-8 py-3.5 text-sm font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/20"
                >
                  RESERVA TU CABAÑA
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Cenote Section */}
        <section className="py-20 bg-white">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#8B6914] mb-3">Cenote San Isidro</p>
                <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
                  Una experiencia única en la naturaleza
                </h2>
                <p className="text-gray-600 leading-relaxed mb-6">
                  Disfruta un día increíble en nuestro cenote natural y artificial, rodeado de piscinas espectaculares y una selección de comida deliciosa. Vive la experiencia, relájate y captura momentos únicos en nuestros spots diseñados para que tus fotos luzcan increíbles.
                </p>
                <Link
                  href="/entradas"
                  className="inline-flex items-center justify-center rounded-xl bg-[#0a3d2f] px-8 py-3 text-sm font-semibold text-white transition-all hover:bg-[#0d5a3f]"
                >
                  VER ENTRADAS
                </Link>
              </div>
              <div className="relative">
                <div className="aspect-[4/3] rounded-2xl bg-gradient-to-br from-[#0a3d2f]/10 to-[#2d7a4a]/10 flex items-center justify-center">
                  <div className="text-center p-8">
                    <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-[#0a3d2f]/10">
                      <svg className="h-10 w-10 text-[#0a3d2f]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z" />
                      </svg>
                    </div>
                    <p className="text-sm text-gray-500">Imagen del cenote</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Cabañas Section */}
        <section className="py-20 bg-gray-50">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="order-2 lg:order-1">
                <div className="aspect-[4/3] rounded-2xl bg-gradient-to-br from-[#8B6914]/10 to-[#D4A843]/10 flex items-center justify-center">
                  <div className="text-center p-8">
                    <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-[#8B6914]/10">
                      <svg className="h-10 w-10 text-[#8B6914]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 21v-4.875c0-.621.504-1.125 1.125-1.125h5.25c.621 0 1.125.504 1.125 1.125V21m0 0h4.5V3.545M12.75 21h7.5V10.75M2.25 21h1.5m18 0h-18M2.25 9l4.5-1.636M18.75 3l-1.5.545m0 6.205l3 1m1.5.5l-1.5-.5M6.75 7.364V3h-3v18m3-13.636l10.5-3.819" />
                      </svg>
                    </div>
                    <p className="text-sm text-gray-500">Imagen de cabañas</p>
                  </div>
                </div>
              </div>
              <div className="order-1 lg:order-2">
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#8B6914] mb-3">Cabañas</p>
                <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
                  Tu refugio en la naturaleza
                </h2>
                <p className="text-gray-600 leading-relaxed mb-6">
                  Descubre la magia de hospedarte en Cabañas San Isidro, ubicadas en destinos naturales increíbles. Vive una experiencia única de confort y tranquilidad, rodeado de paisajes espectaculares. Desconéctate, relájate y haz de tu escapada algo inolvidable.
                </p>
                <Link
                  href="/nuestras-cabanas"
                  className="inline-flex items-center justify-center rounded-xl bg-[#8B6914] px-8 py-3 text-sm font-semibold text-white transition-all hover:bg-[#7a5c12]"
                >
                  RESERVA
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Media Section */}
        <section className="py-16 bg-white">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h2 className="text-center text-xl font-semibold text-gray-900 mb-10">
              Los medios más importantes de México nos recomiendan
            </h2>
            <div className="flex flex-wrap items-center justify-center gap-8">
              {mediaLogos.map((media) => (
                <a
                  key={media.name}
                  href={media.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-lg border border-gray-200 bg-gray-50 px-6 py-3 text-sm font-medium text-gray-600 transition-all hover:border-[#8B6914] hover:text-[#8B6914] hover:shadow-sm"
                >
                  {media.name}
                </a>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
      <WhatsAppButton />
    </div>
  );
}
