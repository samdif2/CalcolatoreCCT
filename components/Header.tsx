
import React from 'react';
import HomeIcon from './icons/HomeIcon';

const Header: React.FC = () => {
  return (
    <header className="flex-shrink-0 bg-[#FAFAFA] p-4 flex items-center border-b border-gray-200">
      {/* 
        NOTA: Sostituisci l'URL qui sotto con il percorso della tua immagine (es. /logo.png) 
        o la stringa Base64 del logo che hai fornito.
      */}
      <a href="https://assetteramo.my.canva.site/asset" target="_blank" rel="noopener noreferrer">
        <img 
          src="https://i.postimg.cc/ryZmztmM/Asset_logo_removebg_preview.png" 
          alt="Logo ASSET Teramo" 
          className="w-[60px] h-[60px] object-contain"
        />
      </a>
      <h1 className="ml-4 text-3xl font-bold text-[#2D2D2D]">Calcolatore CCT</h1>
      <a 
        href="https://assetteramo.my.canva.site/asset" 
        target="_blank" 
        rel="noopener noreferrer"
        className="ml-auto flex flex-col items-center justify-center text-gray-500 hover:text-[#D4AF37] transition-colors"
      >
        <HomeIcon />
        <span className="text-[10px] mt-1 leading-none text-center whitespace-nowrap">torna indietro</span>
      </a>
    </header>
  );
};

export default Header;
