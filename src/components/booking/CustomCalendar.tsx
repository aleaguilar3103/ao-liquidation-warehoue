"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useMemo } from "react";

import { cn } from "@/lib/utils";

type Props = {
  // Mes visible — "YYYY-MM"
  viewMonth: string;
  onChangeMonth: (next: string) => void;
  selectedDate: string | null; // "YYYY-MM-DD"
  onSelectDate: (iso: string) => void;
  // Restricciones (opcional)
  isDateDisabled?: (iso: string) => boolean;
};

const WEEKDAYS = ["L", "M", "M", "J", "V", "S", "D"];
const MONTH_NAMES = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];

function parseYearMonth(ym: string): { year: number; month: number } {
  const [y, m] = ym.split("-").map(Number);
  return { year: y, month: m };
}

function pad2(n: number) {
  return String(n).padStart(2, "0");
}

// Lunes=0 .. Domingo=6 (formato local Costa Rica / España)
function getMondayBasedDayIndex(date: Date): number {
  const d = date.getUTCDay(); // 0=dom..6=sab
  return (d + 6) % 7;
}

export default function CustomCalendar({
  viewMonth,
  onChangeMonth,
  selectedDate,
  onSelectDate,
  isDateDisabled,
}: Props) {
  const { year, month } = parseYearMonth(viewMonth);

  const grid = useMemo(() => {
    const firstOfMonth = new Date(Date.UTC(year, month - 1, 1));
    const lastOfMonth = new Date(Date.UTC(year, month, 0));
    const daysInMonth = lastOfMonth.getUTCDate();
    const leadingBlanks = getMondayBasedDayIndex(firstOfMonth);

    const cells: Array<{ iso: string | null; day: number | null }> = [];
    for (let i = 0; i < leadingBlanks; i++) cells.push({ iso: null, day: null });
    for (let d = 1; d <= daysInMonth; d++) {
      cells.push({
        iso: `${year}-${pad2(month)}-${pad2(d)}`,
        day: d,
      });
    }
    // padding final hasta completar múltiplo de 7
    while (cells.length % 7 !== 0) cells.push({ iso: null, day: null });
    return cells;
  }, [year, month]);

  const goPrev = () => {
    const m = month - 1;
    if (m < 1) onChangeMonth(`${year - 1}-12`);
    else onChangeMonth(`${year}-${pad2(m)}`);
  };
  const goNext = () => {
    const m = month + 1;
    if (m > 12) onChangeMonth(`${year + 1}-01`);
    else onChangeMonth(`${year}-${pad2(m)}`);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <button
          type="button"
          onClick={goPrev}
          className="w-9 h-9 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-600 hover:text-brand transition-colors"
          aria-label="Mes anterior"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div className="text-base font-bold text-gray-900">
          {MONTH_NAMES[month - 1]} {year}
        </div>
        <button
          type="button"
          onClick={goNext}
          className="w-9 h-9 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-600 hover:text-brand transition-colors"
          aria-label="Mes siguiente"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-2">
        {WEEKDAYS.map((d, i) => (
          <div
            key={i}
            className="text-center text-xs font-semibold text-gray-400 py-2"
          >
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {grid.map((cell, idx) => {
          if (!cell.iso) {
            return <div key={`b-${idx}`} className="aspect-square" />;
          }
          const disabled = isDateDisabled?.(cell.iso) ?? false;
          const selected = selectedDate === cell.iso;
          return (
            <button
              key={cell.iso}
              type="button"
              disabled={disabled}
              onClick={() => onSelectDate(cell.iso!)}
              className={cn(
                "aspect-square rounded-lg text-sm font-medium transition-all relative",
                disabled &&
                  "text-gray-300 cursor-not-allowed line-through decoration-gray-200",
                !disabled &&
                  !selected &&
                  "text-gray-700 hover:bg-brand/10 hover:text-brand",
                selected &&
                  "bg-gradient-to-br from-brand to-brand-dark text-white shadow-lg shadow-brand/30 scale-105",
              )}
            >
              {cell.day}
            </button>
          );
        })}
      </div>
    </div>
  );
}
