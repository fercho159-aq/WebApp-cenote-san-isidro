import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Comida y Bebida - Cenote San Isidro",
  description: "Disfruta de nuestra selección de comida y bebidas en Cenote San Isidro.",
};

const menuCategories = [
  {
    name: "Alimentos",
    items: [
      { name: "Tacos de cochinita", price: "$80" },
      { name: "Panuchos", price: "$70" },
      { name: "Salbutes", price: "$70" },
      { name: "Hamburguesa", price: "$90" },
      { name: "Hot dog", price: "$60" },
      { name: "Papas fritas", price: "$50" },
      { name: "Nachos con queso", price: "$70" },
      { name: "Marquesitas", price: "$50" },
    ],
  },
  {
    name: "Bebidas",
    items: [
      { name: "Agua natural", price: "$25" },
      { name: "Refresco", price: "$30" },
      { name: "Cerveza nacional", price: "$45" },
      { name: "Cerveza importada", price: "$60" },
      { name: "Michelada", price: "$70" },
      { name: "Agua de sabor (1L)", price: "$40" },
      { name: "Smoothie", price: "$65" },
      { name: "Coctel de frutas", price: "$60" },
    ],
  },
];

export default function AlimentosPage() {
  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-[#0a3d2f] to-[#1a5c3a] text-white py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#D4A843] mb-3">Cenote San Isidro</p>
          <h1 className="text-4xl sm:text-5xl font-bold">Comida & Bebida</h1>
        </div>
      </section>

      {/* Notices */}
      <section className="bg-[#D4A843]/10 border-b border-[#D4A843]/20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-center gap-2 sm:gap-6 text-sm text-[#8B6914]">
            <p>Los precios pueden cambiar sin previo aviso.</p>
            <span className="hidden sm:inline text-[#8B6914]/30">|</span>
            <p>No se puede ingresar con bebidas o alimentos ajenos al establecimiento.</p>
          </div>
        </div>
      </section>

      {/* Menu */}
      <section className="py-16 bg-white">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-gray-500 uppercase tracking-wide mb-12">
            Menú sujeto a disponibilidad
          </p>

          <div className="grid sm:grid-cols-2 gap-12">
            {menuCategories.map((cat) => (
              <div key={cat.name}>
                <h2 className="text-2xl font-bold text-gray-900 mb-6 pb-3 border-b-2 border-[#0a3d2f]">
                  {cat.name}
                </h2>
                <div className="space-y-0">
                  {cat.items.map((item) => (
                    <div key={item.name} className="flex items-center justify-between py-3 border-b border-gray-100">
                      <span className="text-sm text-gray-700">{item.name}</span>
                      <span className="text-sm font-semibold text-gray-900 ml-4">{item.price}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
