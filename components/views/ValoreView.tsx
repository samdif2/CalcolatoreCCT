import React, { useState, useMemo, useCallback } from 'react';
import { YEARS_VALORE, INFLATION_RATES, GOLD_PRICES } from '../../constants';

// Declare html2pdf for TypeScript
declare const html2pdf: any;

interface ValoreViewProps {
  capital: number;
  setCapital: (capital: number) => void;
  monthlySavings: number;
  setMonthlySavings: (val: number) => void;
  year: number;
  setYear: (year: number) => void;
}

const ValoreView: React.FC<ValoreViewProps> = ({
  capital,
  setCapital,
  monthlySavings,
  setMonthlySavings,
  year,
  setYear,
}) => {
  const [isExporting, setIsExporting] = useState<boolean>(false);

  // How many years have passed compared to 2026 (considering both start and end year, e.g. 2020 -> 7)
  const yearsPassed = useMemo(() => 2026 - year + 1, [year]);

  // Calculation of purchasing power, inflation, capital evolution and gold value
  const calculation = useMemo(() => {
    const annualSavings = monthlySavings * 12;
    const startGoldPrice = GOLD_PRICES[year] || 1;
    const currentGoldPrice = GOLD_PRICES[2026] || 1;

    // Grams purchased at start year with initial capital
    const initialGrams = capital > 0 ? capital / startGoldPrice : 0;

    const breakdown: Array<{
      year: number;
      capital: number;
      rate: number;
      cumulativeFactor: number;
      purchasingPower: number;
      cumulativeLoss: number;
      valoreOro: number;
    }> = [];

    let accumulatedGrams = initialGrams;

    for (let y = year; y <= 2026; y++) {
      const rate = INFLATION_RATES[y] ?? 0;
      // Capital accumulated up to year y:
      // Initial capital + annual savings for each year from start year to y
      const nominalCap = capital + (y - year + 1) * annualSavings;

      // Add this year's annual savings in gold grams
      if (annualSavings > 0) {
        const goldPriceInD = GOLD_PRICES[y] || 1;
        accumulatedGrams += annualSavings / goldPriceInD;
      }

      // Calculate purchasing power at year y:
      // Initial capital devalued from `year` to `y`
      let powerTotal = 0;
      if (capital > 0) {
        let factorInit = 1;
        for (let t = year; t <= y; t++) {
          factorInit *= 1 + (INFLATION_RATES[t] ?? 0) / 100;
        }
        powerTotal += capital / factorInit;
      }

      // Each annual savings deposited in year d (from `year` to `y`) devalued from d to y
      if (annualSavings > 0) {
        for (let d = year; d <= y; d++) {
          let factorSavings = 1;
          for (let t = d; t <= y; t++) {
            factorSavings *= 1 + (INFLATION_RATES[t] ?? 0) / 100;
          }
          powerTotal += annualSavings / factorSavings;
        }
      }

      const goldPriceInYear = GOLD_PRICES[y] ?? startGoldPrice;
      const goldVal = nominalCap > 0 ? Math.round(accumulatedGrams * goldPriceInYear) : 0;
      const powerRound = Math.round(powerTotal);
      const loss = nominalCap > 0 ? nominalCap - powerRound : 0;

      let factorFromStart = 1;
      for (let t = year; t <= y; t++) {
        factorFromStart *= 1 + (INFLATION_RATES[t] ?? 0) / 100;
      }

      breakdown.push({
        year: y,
        capital: nominalCap,
        rate,
        cumulativeFactor: factorFromStart,
        purchasingPower: powerRound,
        cumulativeLoss: loss,
        valoreOro: goldVal,
      });
    }

    const totalInvested = capital + (2026 - year + 1) * annualSavings;
    const lastRow = breakdown[breakdown.length - 1];

    const valoreOggi = lastRow ? lastRow.purchasingPower : 0;
    const lossAmount = totalInvested > 0 ? totalInvested - valoreOggi : 0;
    const lossPercent = totalInvested > 0 ? (lossAmount / totalInvested) * 100 : 0;

    let totalFactor = 1;
    for (let t = year; t <= 2026; t++) {
      totalFactor *= 1 + (INFLATION_RATES[t] ?? 0) / 100;
    }
    const cumulativeInflationPercent = (totalFactor - 1) * 100;

    const totalGramsToday = accumulatedGrams;
    const valoreOroOggi = totalInvested > 0 ? Math.round(totalGramsToday * currentGoldPrice) : 0;
    const goldGainAmount = totalInvested > 0 ? valoreOroOggi - totalInvested : 0;
    const goldGainPercent = totalInvested > 0 ? (goldGainAmount / totalInvested) * 100 : 0;

    return {
      breakdown,
      totalInvested,
      valoreOggi,
      lossAmount,
      lossPercent,
      cumulativeInflationPercent,
      totalGrams: totalGramsToday,
      valoreOroOggi,
      goldGainAmount,
      goldGainPercent,
      annualSavings,
    };
  }, [capital, monthlySavings, year]);

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

    const contentClone = element.cloneNode(true) as HTMLElement;

    // Remove buttons in clone
    const buttonsInClone = contentClone.querySelectorAll('button');
    buttonsInClone.forEach((b) => b.remove());

    // Reset grid to single column on PDF for clean A4 printing
    const gridEl = contentClone.querySelector('.grid');
    if (gridEl) {
      gridEl.classList.remove('md:grid-cols-2', 'landscape:grid-cols-2');
      gridEl.classList.add('grid-cols-1');
    }

    const opt = {
      margin: [10, 10, 10, 10],
      filename: `Report_Valore_Soldi_${capital}EUR_${monthlySavings}Mese_${year}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, logging: false },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
    };

    if (typeof html2pdf !== 'undefined') {
      html2pdf()
        .set(opt)
        .from(contentClone)
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
  }, [capital, monthlySavings, year]);

  return (
    <div className="p-4 space-y-6">
      <h2 className="text-2xl font-bold text-[#D4AF37] text-center">Valore dei tuoi soldi</h2>

      {/* Inputs Card */}
      <div className="bg-white p-4 rounded-lg shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 landscape:grid-cols-2 gap-4 items-center">
          {/* Left Column: Capitale iniziale & Risparmio mensile */}
          <div className="space-y-4">
            {/* Risparmio iniziale Input */}
            <div className="flex items-center space-x-3 sm:space-x-4">
              <label htmlFor="capital-valore-input" className="text-sm font-medium text-gray-700 whitespace-nowrap min-w-[115px]">
                Risparmio iniziale
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

            {/* Risparmio mensile Input */}
            <div className="flex items-center space-x-3 sm:space-x-4">
              <label htmlFor="monthly-savings-input" className="text-sm font-medium text-gray-700 whitespace-nowrap min-w-[115px]">
                Risparmio mensile
              </label>
              <input
                type="text"
                inputMode="numeric"
                id="monthly-savings-input"
                value={formatInputDisplay(monthlySavings)}
                onFocus={() => setMonthlySavings(0)}
                onChange={(e) => {
                  const rawValue = e.target.value.replace(/\./g, '').replace(/[^0-9]/g, '');
                  setMonthlySavings(rawValue === '' ? 0 : parseInt(rawValue, 10));
                }}
                className="flex-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#D4AF37] focus:border-[#D4AF37]"
                placeholder="0"
              />
            </div>
          </div>

          {/* Right Column: Anno, Anni passati & Risparmio annuale info */}
          <div className="space-y-4">
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

            {/* Risparmio annuale indicato se impostato risparmio mensile */}
            {monthlySavings > 0 && (
              <div className="flex justify-between items-center bg-gray-50 border border-gray-200 px-3 py-2 rounded-md text-xs text-gray-600">
                <span>Risparmio annuale:</span>
                <span className="font-bold text-gray-800">{formatCurrency(monthlySavings * 12)}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Printable / Report Container */}
      <div id="printable-content-valore" className="bg-white p-4 rounded-lg shadow-sm space-y-6">
        {/* Scritta bianca su sfondo verde: Capitale accumulato */}
        <div className="bg-[#16A34A] text-white p-5 rounded-lg shadow-md text-center">
          <h3 className="text-sm uppercase tracking-widest font-semibold">CAPITALE ACCUMULATO</h3>
          <p className="text-4xl sm:text-5xl font-extrabold my-2">{formatCurrency(calculation.totalInvested)}</p>
          <p className="text-xs sm:text-sm opacity-95 font-medium">
            Risparmio iniziale ({formatCurrency(capital)}) + Risparmio annuale ({formatCurrency(calculation.annualSavings)} × {yearsPassed} anni)
          </p>
        </div>

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
          {calculation.annualSavings > 0 ? (
            <p className="text-xs opacity-90 mt-1">
              {calculation.totalGrams.toFixed(2).replace('.', ',')} grammi accumulati ({year}-2026)
            </p>
          ) : (
            <p className="text-xs opacity-90 mt-1">
              {calculation.totalGrams.toFixed(2).replace('.', ',')} grammi acquistati nel {year} ({GOLD_PRICES[year]?.toFixed(2).replace('.', ',')} €/g → {GOLD_PRICES[2026]?.toFixed(2).replace('.', ',')} €/g)
            </p>
          )}
        </div>

        {/* Dettagli scorrendo, dopo i riquadri */}
        <div className="space-y-6 pt-2">
          {/* Detailed Breakdown Table */}
          <div>
            <h3 className="text-lg font-bold text-gray-800 mb-2">Dettaglio</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-gray-500 uppercase bg-gray-50">
                  <tr>
                    <th className="py-2 px-2 sm:px-3">Anno</th>
                    <th className="py-2 px-2 sm:px-3 text-right">Capitale</th>
                    <th className="py-2 px-2 sm:px-3 text-right">Valore in euro</th>
                    <th className="py-2 px-2 sm:px-3 text-right">Valore in oro</th>
                  </tr>
                </thead>
                <tbody>
                  {calculation.breakdown.map((row) => (
                    <tr key={row.year} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-2 px-2 sm:px-3 font-medium text-gray-900 whitespace-nowrap">
                        {row.year}{row.year === 2026 ? '*' : ''}
                      </td>
                      <td className="py-2 px-2 sm:px-3 text-right font-medium text-gray-700">
                        {formatCurrency(row.capital)}
                      </td>
                      <td className="py-2 px-2 sm:px-3 text-right font-semibold text-[#DC2626]">
                        {formatCurrency(row.purchasingPower)}
                      </td>
                      <td className="py-2 px-2 sm:px-3 text-right font-semibold text-black">
                        {formatCurrency(row.valoreOro)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Brand Footer */}
          <div className="pt-4 border-t border-gray-200 text-center text-xs text-gray-500 italic">
            <p>Realizzato da ASSET Teramo - Piazza Martiri Pennesi, 4 - 64100 - Teramo</p>
          </div>

          {/* PDF Export Button */}
          <div className="pt-2">
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
      </div>
    </div>
  );
};

export default ValoreView;
