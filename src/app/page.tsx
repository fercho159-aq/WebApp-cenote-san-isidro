import Image from "next/image";
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

const galleryImages = [
  {
    src: "https://cenotesanisidro.com/wp-content/uploads/2026/06/beek-1024x768.jpg",
    alt: "Cabaña Beek en Cenote San Isidro",
  },
  {
    src: "https://cenotesanisidro.com/wp-content/uploads/2026/06/casa-arbol-1024x768.jpg",
    alt: "Casa del Árbol en Cenote San Isidro",
  },
  {
    src: "https://cenotesanisidro.com/wp-content/uploads/2026/06/casa_arbol_3-1024x1024.jpeg",
    alt: "Interior de cabaña en Cenote San Isidro",
  },
  {
    src: "https://cenotesanisidro.com/wp-content/uploads/2026/06/casa_arbol_7-1024x954.jpeg",
    alt: "Detalle interior de cabaña en Cenote San Isidro",
  },
];

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col bg-white text-gray-900">
      <Navbar />

      <main className="flex-1 pt-20">
        {/* ── Hero Section ── */}
        <section className="relative h-[90vh] min-h-[600px] overflow-hidden">
          <Image
            src="https://cenotesanisidro.com/wp-content/uploads/2024/09/292937695_178863241185634_2238902714629269391_n.jpg"
            alt="Vista panorámica del Cenote San Isidro"
            fill
            priority
            className="object-cover"
            sizes="100vw"
          />
          {/* dark overlay */}
          <div className="absolute inset-0 bg-black/50" />

          <div className="relative z-10 flex h-full flex-col items-center justify-center px-4 text-center text-white">
            <p className="font-body mb-4 text-sm uppercase tracking-[0.35em] text-[#D4A843] sm:text-base">
              Homún, Yucatán
            </p>
            <h1 className="font-display text-5xl font-bold leading-tight sm:text-6xl lg:text-8xl">
              CENOTE<br />SAN ISIDRO
            </h1>
            <p className="font-display mt-4 text-xl italic text-white/90 sm:text-2xl lg:text-3xl">
              La Mini Rivera Maya
            </p>
            <div className="mt-10 flex flex-wrap justify-center gap-4">
              <Link
                href="/entradas"
                className="font-body inline-flex items-center justify-center rounded-full bg-[#D4A843] px-10 py-4 text-sm font-semibold uppercase tracking-widest text-white shadow-lg transition-all hover:bg-[#c49a3a] hover:shadow-xl"
              >
                Entradas
              </Link>
              <Link
                href="/reservar"
                className="font-body inline-flex items-center justify-center rounded-full border-2 border-white/40 bg-white/10 px-10 py-4 text-sm font-semibold uppercase tracking-widest text-white backdrop-blur-sm transition-all hover:bg-white/20"
              >
                Reserva tu Cabaña
              </Link>
            </div>
          </div>
        </section>

        {/* ── Cenote Section ── */}
        <section className="py-20 bg-white lg:py-28">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
              {/* text */}
              <div>
                <p className="font-body mb-3 text-sm font-semibold uppercase tracking-[0.25em] text-[#8B6914]">
                  Cenote San Isidro
                </p>
                <h2 className="font-display text-3xl font-bold text-gray-900 sm:text-4xl lg:text-5xl">
                  Una experiencia única en la naturaleza
                </h2>
                <p className="font-body mt-6 text-lg leading-relaxed text-gray-600">
                  Disfruta un día increíble en nuestro cenote natural y artificial, rodeado de
                  piscinas espectaculares y una selección de comida deliciosa. Vive la experiencia,
                  relájate y captura momentos únicos en nuestros spots diseñados para que tus fotos
                  luzcan increíbles.
                </p>
                <Link
                  href="/entradas"
                  className="font-body mt-8 inline-flex items-center justify-center rounded-full bg-[#0a3d2f] px-8 py-3.5 text-sm font-semibold uppercase tracking-widest text-white transition-all hover:bg-[#0d5a3f]"
                >
                  Ver Entradas
                </Link>
              </div>

              {/* image */}
              <div className="relative aspect-[4/3] overflow-hidden rounded-2xl shadow-xl">
                <Image
                  src="https://cenotesanisidro.com/wp-content/uploads/2026/03/WhatsApp-Image-2026-03-23-at-1.45.57-PM-1024x768.jpeg"
                  alt="Piscina del Cenote San Isidro"
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              </div>
            </div>
          </div>
        </section>

        {/* ── Cabañas Section ── */}
        <section className="relative overflow-hidden py-20 lg:py-28">
          {/* background image */}
          <Image
            src="https://cenotesanisidro.com/wp-content/uploads/2024/09/Captura-de-pantalla-2024-09-01-a-las-10.10.37%E2%80%AFp.m.png"
            alt=""
            fill
            className="object-cover"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-[#0a3d2f]/80" />

          <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
              {/* image */}
              <div className="relative aspect-[4/3] overflow-hidden rounded-2xl shadow-2xl">
                <Image
                  src="https://cenotesanisidro.com/wp-content/uploads/2026/06/casa-arbol-1024x768.jpg"
                  alt="Casa del Árbol — cabaña en Cenote San Isidro"
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              </div>

              {/* text */}
              <div className="text-white">
                <p className="font-body mb-3 text-sm font-semibold uppercase tracking-[0.25em] text-[#D4A843]">
                  Cabañas
                </p>
                <h2 className="font-display text-3xl font-bold sm:text-4xl lg:text-5xl">
                  Tu refugio en la naturaleza
                </h2>
                <p className="font-body mt-6 text-lg leading-relaxed text-white/80">
                  Descubre la magia de hospedarte en Cabañas San Isidro, ubicadas en destinos
                  naturales increíbles. Vive una experiencia única de confort y tranquilidad,
                  rodeado de paisajes espectaculares. Desconéctate, relájate y haz de tu escapada
                  algo inolvidable.
                </p>
                <Link
                  href="/reservar"
                  className="font-body mt-8 inline-flex items-center justify-center rounded-full bg-[#D4A843] px-10 py-3.5 text-sm font-semibold uppercase tracking-widest text-white shadow-lg transition-all hover:bg-[#c49a3a] hover:shadow-xl"
                >
                  Reserva
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ── Gallery Strip ── */}
        <section className="bg-[#0a3d2f] py-16 lg:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h2 className="font-display mb-10 text-center text-3xl font-bold text-white sm:text-4xl">
              Galería
            </h2>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
              {galleryImages.map((img) => (
                <div
                  key={img.src}
                  className="relative aspect-square overflow-hidden rounded-xl shadow-lg"
                >
                  <Image
                    src={img.src}
                    alt={img.alt}
                    fill
                    className="object-cover transition-transform duration-500 hover:scale-110"
                    sizes="(max-width: 768px) 50vw, 25vw"
                  />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Media Section ── */}
        <section className="py-16 bg-white lg:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h2 className="font-display mb-10 text-center text-xl font-bold text-gray-900 sm:text-2xl">
              Los medios más importantes de México nos recomiendan
            </h2>
            <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
              {mediaLogos.map((media) => (
                <a
                  key={media.name}
                  href={media.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-body rounded-full border border-gray-200 bg-gray-50 px-6 py-3 text-sm font-medium text-gray-600 transition-all hover:border-[#8B6914] hover:text-[#8B6914] hover:shadow-md"
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
