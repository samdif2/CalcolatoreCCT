import React, { useState, useMemo, useCallback } from 'react';
import { YEARS_VALORE, INFLATION_RATES, GOLD_PRICES } from '../../constants';

// Declare html2pdf for TypeScript
declare const html2pdf: any;

interface ValoreViewProps {
  capital: number;
  setCapital: (capital: number) => void;
  year: number;
  setYear: (year: number) => void;
}

const ValoreView: React.FC<ValoreViewProps> = ({ capital, setCapital, year, setYear }) => {
  const [isExporting, setIsExporting] = useState<boolean>(false);

  // How many years have passed compared to 2026 (e.g. 2020 -> 6, 2011 -> 15)
  const yearsPassed = useMemo(() => 2026 - year, [year]);

  // Calculation of purchasing power and inflation and gold value
  const calculation = useMemo(() => {
    const breakdown: Array<{
      year: number;
      rate: number;
      cumulativeFactor: number;
      purchasingPower: number;
      cumulativeLoss: number;
      valoreOro: number;
    }> = [];

    const startGoldPrice = GOLD_PRICES[year] || 1;
    const currentGoldPrice = GOLD_PRICES[2026] || 1;
    const gramsPurchased = capital > 0 ? capital / startGoldPrice : 0;

    let factor = 1;
    for (let y = year; y <= 2026; y++) {
      const rate = INFLATION_RATES[y] ?? 0;
      factor *= 1 + rate / 100;
      const power = capital > 0 ? capital / factor : 0;
      const loss = capital > 0 ? capital - power : 0;

      const goldPriceInYear = GOLD_PRICES[y] ?? startGoldPrice;
      const goldVal = capital > 0 ? Math.round(gramsPurchased * goldPriceInYear) : 0;

      breakdown.push({
        year: y,
        rate,
        cumulativeFactor: factor,
        purchasingPower: Math.round(power),
        cumulativeLoss: Math.round(loss),
        valoreOro: goldVal,
      });
    }

    const valoreOggi = capital > 0 ? Math.round(capital / factor) : 0;
    const lossAmount = capital > 0 ? capital - valoreOggi : 0;
    const lossPercent = capital > 0 ? (lossAmount / capital) * 100 : 0;
    const cumulativeInflationPercent = (factor - 1) * 100;

    const valoreOroOggi = capital > 0 ? Math.round(gramsPurchased * currentGoldPrice) : 0;
    const goldGainAmount = valoreOroOggi - capital;
    const goldGainPercent = capital > 0 ? (goldGainAmount / capital) * 100 : 0;

    return {
      breakdown,
      valoreOggi,
      lossAmount,
      lossPercent,
      cumulativeInflationPercent,
      gramsPurchased,
      valoreOroOggi,
      goldGainAmount,
      goldGainPercent,
    };
  }, [capital, year]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0,
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatInputDisplay = (val: number) => {
    if (val === 0) return '';
    return new Intl.NumberFormat('de-DE').format(val);
  };

  const handleExportPDF = useCallback(() => {
    const element = document.getElementById('printable-content-valore');
    if (!element) return;

    setIsExporting(true);

    const opt = {
      margin: [10, 10, 10, 10],
      filename: `Report_Valore_Soldi_${capital}EUR_${year}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, logging: false },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
    };

    if (typeof html2pdf !== 'undefined') {
      html2pdf()
        .set(opt)
        .from(element)
        .save()
        .then(() => {
          setIsExporting(false);
        })
        .catch((err: any) => {
          console.error('PDF export error:', err);
          setIsExporting(false);
        });
    } else {
      console.warn('html2pdf library not loaded.');
      setIsExporting(false);
    }
  }, [capital, year]);

  return (
    <div className="p-4 space-y-6">
      <h2 className="text-2xl font-bold text-[#D4AF37] text-center">Valore dei tuoi soldi</h2>

      {/* Inputs Card */}
      <div className="bg-white p-4 rounded-lg shadow-sm">
        <div className="space-y-4">
          {/* Capital Input - senza limiti minimi e massimi */}
          <div className="flex items-center space-x-4">
            <label htmlFor="capital-valore-input" className="text-sm font-medium text-gray-700 whitespace-nowrap">
              Capitale
            </label>
            <input
              type="text"
              inputMode="numeric"
              id="capital-valore-input"
              value={formatInputDisplay(capital)}
              onFocus={() => setCapital(0)}
              onChange={(e) => {
                const rawValue = e.target.value.replace(/\./g, '').replace(/[^0-9]/g, '');
                setCapital(rawValue === '' ? 0 : parseInt(rawValue, 10));
              }}
              className="flex-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#D4AF37] focus:border-[#D4AF37]"
              placeholder="0"
            />
          </div>

          {/* Year Dropdown & Years Passed Display */}
          <div className="flex items-end space-x-4">
            <div className="w-1/2">
              <label htmlFor="year-select" className="block text-sm font-medium text-gray-700">
                Anno
              </label>
              <div className="relative">
                <select
                  id="year-select"
                  value={year}
                  onChange={(e) => setYear(Number(e.target.value))}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-[#D4AF37] focus:border-[#D4AF37] rounded-md appearance-none bg-white text-black"
                >
                  {YEARS_VALORE.map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 mt-1">
                  <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                    <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* A fianco: calcola quanti anni sono passati rispetto al 2026 */}
            <div className="w-1/2 flex justify-between items-center bg-gray-100 p-2 rounded-md h-[42px]">
              <span className="font-semibold text-sm text-gray-700">Anni passati:</span>
              <span className="text-lg font-bold text-[#D4AF37]">{yearsPassed}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Printable / Report Container */}
      <div id="printable-content-valore" className="space-y-6 bg-white p-4 rounded-lg shadow-sm">
        {/* Output centrale riquadro sfondo rosso: Valore Oggi */}
        <div className="bg-[#DC2626] text-white p-6 rounded-lg shadow-lg text-center">
          <h3 className="text-sm uppercase tracking-widest font-semibold">VALORE OGGI</h3>
          <p className="text-5xl font-extrabold my-2">{formatCurrency(calculation.valoreOggi)}</p>
          <p className="text-sm opacity-95 font-medium">
            Perdita potere d'acquisto: -{formatCurrency(calculation.lossAmount)} (-{calculation.lossPercent.toFixed(1).replace('.', ',')}%)
          </p>
          <p className="text-xs opacity-80 mt-1">
            Inflazione cumulata ({year}-2026): +{calculation.cumulativeInflationPercent.toFixed(1).replace('.', ',')}%
          </p>
        </div>

        {/* Nuovo riquadro color oro: Valore oggi in oro */}
        <div className="bg-[#D4AF37] text-white p-6 rounded-lg shadow-lg text-center">
          <h3 className="text-sm uppercase tracking-widest font-semibold">VALORE OGGI IN ORO</h3>
          <p className="text-5xl font-extrabold my-2">{formatCurrency(calculation.valoreOroOggi)}</p>
          <p className="text-sm opacity-95 font-medium">
            Rivalutazione oro: {calculation.goldGainAmount >= 0 ? '+' : ''}{formatCurrency(calculation.goldGainAmount)} ({calculation.goldGainAmount >= 0 ? '+' : ''}{calculation.goldGainPercent.toFixed(1).replace('.', ',')}%)
          </p>
          <p className="text-xs opacity-90 mt-1">
            {calculation.gramsPurchased.toFixed(2).replace('.', ',')} grammi acquistati nel {year} ({GOLD_PRICES[year]?.toFixed(2).replace('.', ',')} €/g → {GOLD_PRICES[2026]?.toFixed(2).replace('.', ',')} €/g)
          </p>
        </div>

        {/* Detailed Breakdown Table */}
        <div>
          <h3 className="text-lg font-bold text-gray-800 mb-2">Dettaglio</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-gray-500 uppercase bg-gray-50">
                <tr>
                  <th className="py-2 px-3">Anno</th>
                  <th className="py-2 px-3 text-right">Valore in euro</th>
                  <th className="py-2 px-3 text-right">Valore in oro</th>
                </tr>
              </thead>
              <tbody>
                {calculation.breakdown.map((row) => (
                  <tr key={row.year} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-2 px-3 font-medium text-gray-900">
                      {row.year}{row.year === 2026 ? '*' : ''}
                    </td>
                    <td className="py-2 px-3 text-right font-semibold text-[#DC2626]">
                      {formatCurrency(row.purchasingPower)}
                    </td>
                    <td className="py-2 px-3 text-right font-semibold text-black">
                      {formatCurrency(row.valoreOro)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Brand Footer */}
        <div className="mt-8 pt-4 border-t border-gray-200 text-center text-xs text-gray-500 italic">
          <p>Realizzato da ASSET Teramo - Piazza Martiri Pennesi, 4 - 64100 - Teramo</p>
        </div>
      </div>

      {/* PDF Export Button */}
      <div className="pt-2 flex justify-center">
        <button
          type="button"
          onClick={handleExportPDF}
          disabled={isExporting}
          className="w-full py-3 px-4 bg-[#D4AF37] hover:bg-[#b8972e] text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center space-x-2 disabled:opacity-50"
        >
          {isExporting ? (
            <span>Generazione PDF in corso...</span>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span>Esporta Report in PDF</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default ValoreView;
