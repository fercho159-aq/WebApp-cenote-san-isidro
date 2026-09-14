import { Navbar } from "@/components/public/navbar";
import { Footer } from "@/components/public/footer";
import { WhatsAppButton } from "@/components/public/whatsapp-button";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-white text-gray-900">
      <Navbar />
      <main className="flex-1 pt-20">{children}</main>
      <Footer />
      <WhatsAppButton />
    </div>
  );
}
