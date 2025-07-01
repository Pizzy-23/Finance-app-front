'use client';

import { ArrowUpRight, ArrowDownLeft } from 'lucide-react';

interface DashboardHeaderProps {
  saldoFinal: number;
  totalEntradas: number;
  totalDespesas: number;
}

const formatCurrency = (value: number) => {
    const isNegative = value < 0;
    const absValue = Math.abs(value);
    const formatted = absValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    return isNegative ? `-${formatted}` : formatted;
};

export function DashboardHeader({ saldoFinal, totalEntradas, totalDespesas }: DashboardHeaderProps) {
  const saldoColor = saldoFinal >= 0 ? 'text-green-600 dark:text-green-500' : 'text-red-600 dark:text-red-500';

  return (
    <div className="hidden md:flex items-center gap-6 rounded-lg bg-gray-100 dark:bg-zinc-800/50 p-3 border border-gray-200 dark:border-zinc-700">
      
      {/* Total de Entradas */}
      <div className="flex items-center gap-2">
        <ArrowUpRight className="w-5 h-5 text-green-500" strokeWidth={2.5}/>
        <div>
          <span className="text-xs text-gray-500 dark:text-gray-400">Receitas</span>
          <p className="font-semibold text-green-600 dark:text-green-500" suppressHydrationWarning>
            {formatCurrency(totalEntradas)}
          </p>
        </div>
      </div>

      {/* Separador */}
      <div className="w-px h-8 bg-gray-300 dark:bg-zinc-700"></div>

      {/* Total de Despesas */}
      <div className="flex items-center gap-2">
        <ArrowDownLeft className="w-5 h-5 text-red-500" strokeWidth={2.5}/>
        <div>
            <span className="text-xs text-gray-500 dark:text-gray-400">Despesas</span>
            <p className="font-semibold text-red-600 dark:text-red-500" suppressHydrationWarning>
              {formatCurrency(totalDespesas)}
            </p>
        </div>
      </div>

      {/* Separador */}
      <div className="w-px h-8 bg-gray-300 dark:bg-zinc-700"></div>

      {/* Saldo Final */}
      <div>
        <span className="text-xs text-gray-500 dark:text-gray-400">Total Final</span>
        <p className={`font-bold text-lg ${saldoColor}`} suppressHydrationWarning>
          {formatCurrency(saldoFinal)}
        </p>
      </div>

    </div>
  );
}