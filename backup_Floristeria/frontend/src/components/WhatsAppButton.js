import { MessageCircle } from "lucide-react";
import { WHATSAPP_URL } from "@/lib/constants";

export default function WhatsAppButton() {
  return (
    <a
      href={`${WHATSAPP_URL}?text=${encodeURIComponent("Hola! Me gustaria hacer un pedido en Floristeria Atelier Fleurs")}`}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 bg-green-500 text-white rounded-full p-4 shadow-lg hover:bg-green-600 hover:scale-110 transition-all duration-300"
      data-testid="whatsapp-float-button"
    >
      <MessageCircle className="h-6 w-6" strokeWidth={1.5} />
    </a>
  );
}
