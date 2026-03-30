
import React, { useState, useMemo, useCallback } from 'react';
import { YEAR_OPTIONS, YEAR_PERCENT_MAP } from '../../constants';
import { YearlyData } from '../../types';

// Declare html2pdf for TypeScript
declare const html2pdf: any;

interface ClassGoldViewProps {
  capital: number;
  setCapital: (value: number) => void;
  years: number;
  setYears: (value: number) => void;
}

const ClassGoldView: React.FC<ClassGoldViewProps> = ({ capital, setCapital, years, setYears }) => {
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [showMinError, setShowMinError] = useState<boolean>(false);

  const percentage = useMemo(() => YEAR_PERCENT_MAP[years], [years]);

  const yearlyData: YearlyData[] = useMemo(() => {
    const data: YearlyData[] = [];
    const safeCapital = capital || 0;
    
    if (safeCapital <= 0) return [];
    
    const yearlyRevenue = Math.round(safeCapital * (percentage / 100));
    for (let i = 1; i <= years; i++) {
      data.push({
        year: i,
        capital: safeCapital,
        percentage: percentage,
        yearlyRevenue: yearlyRevenue,
        accumulated: yearlyRevenue * i,
      });
    }
    return data;
  }, [capital, years, percentage]);

  const totalRevenue = yearlyData.length > 0 ? yearlyData[yearlyData.length - 1].accumulated : 0;
  const totalValue = (capital || 0) + totalRevenue;

  // Strict Italian Currency Formatting 
  // Explicitly enforcing useGrouping: true ensures 4-digit numbers (e.g. 4.500) always have the dot.
  const formatCurrency = useCallback((value: number) => {
    return new Intl.NumberFormat('it-IT', { 
        style: 'currency', 
        currency: 'EUR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
        useGrouping: true 
    }).format(Math.round(value));
  }, []);

  // Helper for Input Display (Only dots, no symbol)
  // Explicitly enforcing useGrouping: true ensures 4-digit numbers (e.g. 4.500) always have the dot while typing.
  const formatInputDisplay = (value: number) => {
    if (!value) return '';
    return new Intl.NumberFormat('it-IT', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
        useGrouping: true
    }).format(value);
  };

  const handleExportPDF = useCallback(() => {
    setIsExporting(true);
    const reportElement = document.getElementById('pdf-export-area');
    if (!reportElement) {
        setIsExporting(false);
        console.error("Could not find element to export to PDF.");
        return;
    }

    const pdfContainer = document.createElement('div');
    pdfContainer.style.fontFamily = 'Inter, Roboto, sans-serif';
    pdfContainer.style.color = '#111';
    
    const header = document.createElement('div');
    header.style.display = 'flex';
    header.style.justifyContent = 'space-between';
    header.style.alignItems = 'center';
    header.style.marginBottom = '20px';
    header.style.borderBottom = '2px solid #D4AF37';
    header.style.paddingBottom = '10px';
    header.style.fontSize = '12px'; 

    const today = new Date().toLocaleDateString('it-IT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });

    const leftHeaderText = document.createElement('span');
    leftHeaderText.innerHTML = `Piano personalizzato per un Class Gold da <strong>${formatCurrency(capital)}</strong> per <strong>${years}</strong> anni.`;
    
    const rightHeaderText = document.createElement('span');
    rightHeaderText.innerText = `Data: ${today}`;

    header.appendChild(leftHeaderText);
    header.appendChild(rightHeaderText);

    const contentClone = reportElement.cloneNode(true) as HTMLElement;

    const totalBox = contentClone.querySelector('.bg-\\[\\#D4AF37\\]') as HTMLElement;
    if (totalBox) {
        totalBox.style.padding = '15px'; 
        totalBox.style.marginBottom = '15px';
        totalBox.style.backgroundColor = '#FFFFFF';
        totalBox.style.border = '3px solid #D4AF37';
        totalBox.style.color = '#D4AF37';
        totalBox.style.boxShadow = 'none';

        const innerElements = totalBox.querySelectorAll('*');
        innerElements.forEach((el) => {
          (el as HTMLElement).style.color = '#D4AF37';
        });
    }

    const tableCells = contentClone.querySelectorAll('th, td');
    tableCells.forEach((cell) => {
        (cell as HTMLElement).style.padding = '6px 8px'; 
        (cell as HTMLElement).style.fontSize = '10px';
    });

    const headers = contentClone.querySelectorAll('h3');
    headers.forEach((h) => {
        if (!(h as HTMLElement).closest('.bg-\\[\\#D4AF37\\]')) {
            (h as HTMLElement).style.fontSize = '14px';
            (h as HTMLElement).style.marginBottom = '8px';
        }
    });

    const footer = contentClone.querySelector('.italic');
    if (footer) {
        (footer as HTMLElement).style.marginTop = '20px';
        (footer as HTMLElement).style.fontSize = '9px';
    }

    pdfContainer.appendChild(header);
    pdfContainer.appendChild(contentClone);

    const filename = `Class_Gold_${capital}x${years}.pdf`;
    
    const opt = {
      margin: [0.4, 0.4, 0.4, 0.4], 
      filename: filename,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' },
      pagebreak: { mode: 'avoid-all' }
    };

    html2pdf().from(pdfContainer).set(opt).save().then(() => {
      setIsExporting(false);
    });
  }, [capital, years, formatCurrency]);

  return (
    <div className="p-4 space-y-6">
      <h2 className="text-2xl font-bold text-[#D4AF37] text-center">Class Gold</h2>
      <div className="bg-white p-4 rounded-lg shadow-sm">
        <div className="space-y-4">
          {/* Capital Input with Dynamic Formatting */}
          <div className="flex items-center space-x-4">
            <label htmlFor="capital" className="text-sm font-medium text-gray-700 whitespace-nowrap">Capitale</label>
            <input
              type="text"
              inputMode="numeric"
              id="capital"
              value={formatInputDisplay(capital)}
              onFocus={() => setCapital(0)} // CLEARS INPUT ON CLICK
              onBlur={() => {
                if (capital > 0 && capital < 5000) {
                  setShowMinError(true);
                }
              }}
              onChange={(e) => {
                  // Robust sanitization: Remove dots first, then non-digits.
                  // This prevents NaN errors if the user copy-pastes "1.000"
                  const rawValue = e.target.value.replace(/\./g, '').replace(/[^0-9]/g, '');
                  setCapital(rawValue === '' ? 0 : parseInt(rawValue, 10));
              }}
              className="flex-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#D4AF37] focus:border-[#D4AF37]"
              placeholder="0"
            />
          </div>
          
          <div className="flex items-end space-x-4">
            <div className="w-1/2">
                <label htmlFor="years" className="block text-sm font-medium text-gray-700">Durata (Anni)</label>
                <div className="relative">
                    <select
                    id="years"
                    value={years}
                    onChange={(e) => setYears(Number(e.target.value))}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-[#D4AF37] focus:border-[#D4AF37] rounded-md appearance-none bg-white text-black"
                    >
                    {YEAR_OPTIONS.map((year) => (
                        <option key={year} value={year}>{year}</option>
                    ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 mt-1">
                        <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                    </div>
                </div>
            </div>
            <div className="w-1/2 flex justify-between items-center bg-gray-100 p-2 rounded-md h-[42px]">
              <span className="font-semibold text-sm">Ricavo:</span>
              <span className="text-lg font-bold text-[#D4AF37]">{percentage}%</span>
            </div>
          </div>
        </div>
      </div>
      
      <div id="pdf-export-area">
        <div className="bg-[#D4AF37] text-white p-6 rounded-lg shadow-lg text-center">
            <h3 className="text-sm uppercase tracking-widest">TOTALE</h3>
            <p className="text-5xl font-extrabold my-2">{formatCurrency(totalValue)}</p>
            <p className="text-sm opacity-90">{formatCurrency(capital)} (Capitale) + {formatCurrency(totalRevenue)} (Ricavi)</p>
        </div>

        <div className="mt-6 bg-white p-4 rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold mb-3">Piano di Accumulo Dettagliato</h3>
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-500">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                        <tr>
                            <th scope="col" className="px-4 py-3">Anno</th>
                            <th scope="col" className="px-4 py-3">Capitale</th>
                            <th scope="col" className="px-4 py-3">%</th>
                            <th scope="col" className="px-4 py-3">Ricavo</th>
                            <th scope="col" className="px-4 py-3">Accumulo</th>
                        </tr>
                    </thead>
                    <tbody>
                        {yearlyData.map((row) => (
                            <tr key={row.year} className="bg-white border-b">
                                <td className="px-4 py-4 font-medium text-gray-900">{row.year}</td>
                                <td className="px-4 py-4">{formatCurrency(row.capital)}</td>
                                <td className="px-4 py-4 text-[#D4AF37] font-bold">{row.percentage}%</td>
                                <td className="px-4 py-4 text-green-600">{formatCurrency(row.yearlyRevenue)}</td>
                                <td className="px-4 py-4 font-semibold text-gray-900">{formatCurrency(row.accumulated)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>

        <div className="mt-8 pt-4 border-t border-gray-200 text-center text-xs text-gray-500 italic">
            <p>Realizzato da ASSET Teramo - Piazza Martiri Pennesi, 4 - 64100 - Teramo</p>
        </div>
      </div>

      <div className="pt-2">
        <button
            onClick={handleExportPDF}
            disabled={isExporting}
            className="w-full bg-[#EF4444] text-white font-bold py-3 px-4 rounded-lg shadow-md hover:bg-red-600 transition-all duration-300 flex items-center justify-center disabled:bg-gray-400"
        >
            {isExporting ? (
                <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Esportazione...
                </>
            ) : (
                'Esporta Report in PDF'
            )}
        </button>
      </div>

      {showMinError && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50 px-4">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full text-center">
            <p className="text-gray-800 font-medium mb-6">
              Il Class Gold prevede un deposito minimo di 5.000 euro
            </p>
            <button
              onClick={() => setShowMinError(false)}
              className="bg-[#D4AF37] text-white px-6 py-2 rounded-md font-semibold hover:bg-[#b5952f] transition-colors"
            >
              chiudi
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClassGoldView;
