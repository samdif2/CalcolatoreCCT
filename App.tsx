
import React, { useState } from 'react';
import Header from './components/Header';
import NavigationBar from './components/NavigationBar';
import ClassGoldView from './components/views/ClassGoldView';
import GoldInTimeView from './components/views/GoldInTimeView';
import ClassTimeView from './components/views/ClassTimeView';
import ValoreView from './components/views/ValoreView';
import { ViewType } from './types';

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<ViewType>('valore');
  
  // State for Class Gold
  const [classCapital, setClassCapital] = useState<number>(15000);
  const [classYears, setClassYears] = useState<number>(15);

  // State for Gold in Time (Independent) - Default updated to 2400
  const [timeCapital, setTimeCapital] = useState<number>(2400);
  const [timeYears, setTimeYears] = useState<number>(15);

  // State for Class + Time (Hybrid)
  const [classTimeCapital, setClassTimeCapital] = useState<number>(15000);
  const [classTimeYears, setClassTimeYears] = useState<number>(15);

  // State for Valore dei tuoi soldi
  const [valoreCapital, setValoreCapital] = useState<number>(0);
  const [valoreMonthlySavings, setValoreMonthlySavings] = useState<number>(0);
  const [valoreYear, setValoreYear] = useState<number>(2020);

  const renderView = () => {
    switch (activeView) {
      case 'class':
        return (
          <ClassGoldView
            capital={classCapital}
            setCapital={setClassCapital}
            years={classYears}
            setYears={setClassYears}
          />
        );
      case 'time':
        return (
          <GoldInTimeView
            capital={timeCapital}
            setCapital={setTimeCapital}
            years={timeYears}
            setYears={setTimeYears}
          />
        );
      case 'c+t':
        return (
          <ClassTimeView
            capital={classTimeCapital}
            setCapital={setClassTimeCapital}
            years={classTimeYears}
            setYears={setClassTimeYears}
          />
        );
      case 'valore':
        return (
          <ValoreView
            capital={valoreCapital}
            setCapital={setValoreCapital}
            monthlySavings={valoreMonthlySavings}
            setMonthlySavings={setValoreMonthlySavings}
            year={valoreYear}
            setYear={setValoreYear}
          />
        );
      default:
        return (
          <ClassGoldView
            capital={classCapital}
            setCapital={setClassCapital}
            years={classYears}
            setYears={setClassYears}
          />
        );
    }
  };

  return (
    <div className="h-screen w-full max-w-md landscape:max-w-5xl md:max-w-4xl lg:max-w-6xl mx-auto flex flex-col bg-[#FAFAFA] text-[#2D2D2D] shadow-lg transition-all duration-300">
      <Header />
      <main className="flex-grow overflow-y-auto pb-24 px-1 sm:px-3">
        {renderView()}
      </main>
      <NavigationBar activeView={activeView} setActiveView={setActiveView} />
    </div>
  );
};

export default App;
