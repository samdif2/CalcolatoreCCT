
import React, { useState } from 'react';
import Header from './components/Header';
import NavigationBar from './components/NavigationBar';
import ClassGoldView from './components/views/ClassGoldView';
import GoldInTimeView from './components/views/GoldInTimeView';
import ClassTimeView from './components/views/ClassTimeView';
import { ViewType } from './types';

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<ViewType>('class');
  
  // State for Class Gold
  const [classCapital, setClassCapital] = useState<number>(15000);
  const [classYears, setClassYears] = useState<number>(15);

  // State for Gold in Time (Independent) - Default updated to 2400
  const [timeCapital, setTimeCapital] = useState<number>(2400);
  const [timeYears, setTimeYears] = useState<number>(15);

  // State for Class + Time (Hybrid)
  const [classTimeCapital, setClassTimeCapital] = useState<number>(15000);
  const [classTimeYears, setClassTimeYears] = useState<number>(15);

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
    <div className="h-screen w-full max-w-md mx-auto flex flex-col bg-[#FAFAFA] text-[#2D2D2D] shadow-lg">
      <Header />
      <main className="flex-grow overflow-y-auto pb-20">
        {renderView()}
      </main>
      <NavigationBar activeView={activeView} setActiveView={setActiveView} />
    </div>
  );
};

export default App;
