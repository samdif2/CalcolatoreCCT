
import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="flex-shrink-0 bg-[#FAFAFA] p-4 flex items-center border-b border-gray-200">
      {/* 
        NOTA: Sostituisci l'URL qui sotto con il percorso della tua immagine (es. /logo.png) 
        o la stringa Base64 del logo che hai fornito.
      */}
      <img 
        src="https://i.postimg.cc/ryZmztmM/Asset_logo_removebg_preview.png" 
        alt="Logo ASSET Teramo" 
        className="w-[60px] h-[60px] object-contain"
      />
      <h1 className="ml-4 text-3xl font-bold text-[#2D2D2D]">Calcolatore CCT</h1>
    </header>
  );
};

export default Header;
