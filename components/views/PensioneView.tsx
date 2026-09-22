import React, { useState } from 'react';

interface PensioneViewProps {
  years?: number;
  setYears?: (years: number) => void;
  salary?: number;
  setSalary?: (salary: number) => void;
}

const PensioneView: React.FC<PensioneViewProps> = ({
  years: propYears,
  setYears: propSetYears,
  salary: propSalary,
  setSalary: propSetSalary,
}) => {
  const [internalYears, setInternalYears] = useState<number>(10);
  const [internalSalary, setInternalSalary] = useState<number>(0);

  const years = propYears !== undefined ? propYears : internalYears;
  const setYears = propSetYears || setInternalYears;

  const salary = propSalary !== undefined ? propSalary : internalSalary;
  const setSalary = propSetSalary || setInternalSalary;

  const formatCurrency = (amount: number) => {
    // de-DE garantisce sempre il punto come separatore delle migliaia (es. 2.143 €)
    const formatted = new Intl.NumberFormat('de-DE', {
      maximumFractionDigits: 0,
      minimumFractionDigits: 0,
    }).format(Math.round(amount));
    return `${formatted} €`;
  };

  const formatInputDisplay = (val: number) => {
    if (val === 0) return '';
    return new Intl.NumberFormat('de-DE').format(val);
  };

  // Formula: stipendio netto attuale * (1 + 0.018)^years
  // Esempio: 1.500 * (1 + 0.018)^10 = 1.792 euro
  const lastSalary = salary > 0 ? Math.floor(salary * Math.pow(1 + 0.018, years)) : 0;

  // Pensione: 70% dell'ultimo stipendio (senza decimali)
  const pensioneAmount = salary > 0 ? Math.round(lastSalary * 0.7) : 0;

  // Potere di acquisto: inflazione 3% annuo composto: (1 + 0.03)^years
  // Esempio: per 10 anni è 1,03^10 = 1,3439 (+34,4%), per 1.254 € il potere di acquisto è 933 €
  const inflationFactor = Math.pow(1.03, years);
  const inflationPercent = (inflationFactor - 1) * 100;
  const purchasingPower = pensioneAmount > 0 ? Math.round(pensioneAmount / inflationFactor) : 0;

  // Valori da 1 a 45
  const yearsOptions = Array.from({ length: 45 }, (_, i) => i + 1);

  return (
    <div className="p-4 space-y-6">
      <h2 className="text-2xl font-bold text-[#D4AF37] text-center">Pensione</h2>

      {/* Inputs Card */}
      <div className="bg-white p-4 rounded-lg shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 landscape:grid-cols-2 gap-4 items-center">
          {/* Menu a tendina: In pensione tra anni: */}
          <div className="flex items-center space-x-3 sm:space-x-4">
            <label htmlFor="pensione-years-select" className="text-sm font-medium text-gray-700 whitespace-nowrap min-w-[150px]">
              In pensione tra anni:
            </label>
            <div className="relative flex-1">
              <select
                id="pensione-years-select"
                value={years}
                onChange={(e) => setYears(Number(e.target.value))}
                className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-[#D4AF37] focus:border-[#D4AF37] rounded-md appearance-none bg-white text-black"
              >
                {yearsOptions.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                  <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Campo: Stipendio netto attuale: */}
          <div className="flex items-center space-x-3 sm:space-x-4">
            <label htmlFor="current-salary-input" className="text-sm font-medium text-gray-700 whitespace-nowrap min-w-[150px]">
              Stipendio netto attuale:
            </label>
            <input
              type="text"
              inputMode="numeric"
              id="current-salary-input"
              value={formatInputDisplay(salary)}
              onFocus={() => setSalary(0)}
              onChange={(e) => {
                const rawValue = e.target.value.replace(/\./g, '').replace(/[^0-9]/g, '');
                setSalary(rawValue === '' ? 0 : parseInt(rawValue, 10));
              }}
              className="flex-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#D4AF37] focus:border-[#D4AF37]"
              placeholder="0"
            />
          </div>
        </div>
      </div>

      {/* Riquadro di colore verde: Ultimo stipendio */}
      <div className="bg-[#16A34A] text-white p-6 rounded-lg shadow-lg text-center">
        <h3 className="text-sm uppercase tracking-widest font-semibold">ULTIMO STIPENDIO</h3>
        <p className="text-5xl font-extrabold my-2">{formatCurrency(lastSalary)}</p>
        <p className="text-xs sm:text-sm opacity-90 font-medium">
          Incremento stimato dell'1,8% annuo ({years} {years === 1 ? 'anno' : 'anni'})
        </p>
      </div>

      {/* Riquadro di colore grigio, scritta bianca: Pensione */}
      <div className="bg-[#4B5563] text-white p-6 rounded-lg shadow-lg text-center">
        <h3 className="text-sm uppercase tracking-widest font-semibold">PENSIONE</h3>
        <p className="text-5xl font-extrabold my-2">{formatCurrency(pensioneAmount)}</p>
        <p className="text-xs sm:text-sm opacity-90 font-medium">
          70% dell'ultimo stipendio
        </p>
      </div>

      {/* Riquadro di colore rosso, scritta bianca: Potere di acquisto */}
      <div className="bg-[#DC2626] text-white p-6 rounded-lg shadow-lg text-center">
        <h3 className="text-sm uppercase tracking-widest font-semibold">POTERE DI ACQUISTO</h3>
        <p className="text-5xl font-extrabold my-2">{formatCurrency(purchasingPower)}</p>
        <p className="text-xs sm:text-sm opacity-90 font-medium">
          Inflazione 3% annua
        </p>
      </div>
    </div>
  );
};

export default PensioneView;
