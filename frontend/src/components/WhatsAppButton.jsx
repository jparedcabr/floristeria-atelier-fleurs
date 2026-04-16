import React from 'react';
import { MessageCircle } from 'lucide-react';

const WhatsAppButton = () => {
  const whatsappNumber = '51922458758';
  const message = '¡Hola! Me gustaría obtener más información sobre sus productos.';
  
  const handleClick = () => {
    window.open(
      `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`,
      '_blank'
    );
  };

  return (
    <button
      onClick={handleClick}
      className="fixed bottom-6 right-6 z-50 bg-[#25D366] hover:bg-[#20BA5A] text-white rounded-full p-5 shadow-2xl hover:shadow-[#25D366]/50 hover:scale-110 transition-all duration-300 flex items-center gap-3 group"
      aria-label="Contactar por WhatsApp"
      data-testid="whatsapp-float-button"
    >
      <MessageCircle className="h-8 w-8" />
      <span className="hidden group-hover:inline-block font-semibold text-base pr-2 whitespace-nowrap">
        Chatea con nosotros
      </span>
    </button>
  );
};

export default WhatsAppButton;
