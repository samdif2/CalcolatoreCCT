
import React from 'react';

const GoldBarIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M2 17L12.0326 22L22 17L12.0326 12L2 17Z" fill="#FACC15"/>
    <path d="M12.0326 12L22 7L12.0326 2L2 7L12.0326 12Z" fill="#FBBF24"/>
    <path d="M22 7V17L12.0326 22V12L22 7Z" fill="#F59E0B"/>
    <path d="M12.0326 12V22L2 17V7L12.0326 12Z" fill="#FDE68A"/>
  </svg>
);

export default GoldBarIcon;
