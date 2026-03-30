
import React from 'react';
import { ViewType } from '../types';
import ChartBarIcon from './icons/ChartBarIcon';
import ClockIcon from './icons/ClockIcon';
import PlusCircleIcon from './icons/PlusCircleIcon';

interface NavigationBarProps {
  activeView: ViewType;
  setActiveView: (view: ViewType) => void;
}

const NavigationBar: React.FC<NavigationBarProps> = ({ activeView, setActiveView }) => {
  const navItems = [
    { id: 'class' as ViewType, label: 'Class', icon: <ChartBarIcon /> },
    { id: 'time' as ViewType, label: 'Time', icon: <ClockIcon /> },
    { id: 'c+t' as ViewType, label: 'ClassTime', icon: <PlusCircleIcon /> },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 h-20 bg-white border-t border-gray-200 flex justify-around items-center max-w-md mx-auto">
      {navItems.map((item) => {
        const isActive = activeView === item.id;
        return (
          <button
            key={item.id}
            onClick={() => setActiveView(item.id)}
            className={`flex flex-col items-center justify-center w-full h-full transition-colors duration-300 ${isActive ? 'text-[#D4AF37]' : 'text-gray-500'}`}
          >
            <div className={`p-1 ${isActive ? 'scale-110' : ''}`}>{item.icon}</div>
            <span className="text-xs font-medium">{item.label}</span>
            {isActive && <div className="w-8 h-1 bg-[#D4AF37] rounded-full mt-1"></div>}
          </button>
        );
      })}
    </nav>
  );
};

export default NavigationBar;
