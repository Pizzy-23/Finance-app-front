'use client';

import { useState } from 'react';
import { Check, X } from 'lucide-react';

interface AddItemFormProps {
  groupId: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function AddItemForm({ groupId, onSuccess, onCancel }: AddItemFormProps) {
  const [formData, setFormData] = useState({
    nome: '',
    valor: '',
    data: new Date().toISOString().split('T')[0],
    recorrente: false,
    financeGroupId: groupId
  });
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nome.trim() || !formData.valor) {
      setError('Por favor, preencha nome e valor.');
      return;
    }
    const numericValue = parseFloat(formData.valor);
    if (isNaN(numericValue) || numericValue < 0) {
      setError('Insira um valor numérico válido.');
      return;
    }
    setError('');

    try {
      await fetch('http://localhost:53272/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          valor: numericValue,
          data: new Date(`${formData.data}T00:00:00Z`).toISOString(),
        }),
      });
      onSuccess();
    } catch (err) {
      setError('Não foi possível adicionar o item.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col space-y-4 p-4 bg-white dark:bg-zinc-800 rounded-lg border border-gray-300 dark:border-zinc-700 shadow-lg mt-2">
      <div>
        <label htmlFor="itemName" className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Nome</label>
        <input id="itemName" type="text" placeholder="Ex: Aluguel" value={formData.nome} onChange={(e) => setFormData({ ...formData, nome: e.target.value })} className="w-full text-sm border-gray-300 dark:border-zinc-600 bg-white dark:bg-zinc-700 text-gray-900 dark:text-gray-100 rounded-md px-3 py-2 focus:ring-1 focus:ring-indigo-500" required autoFocus/>
      </div>

      <div className="flex gap-4">
        <div className="flex-1">
          <label htmlFor="itemValue" className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Valor (R$)</label>
          <input id="itemValue" type="number" placeholder="0.00" value={formData.valor} onChange={(e) => setFormData({ ...formData, valor: e.target.value })} className="w-full text-sm border-gray-300 dark:border-zinc-600 bg-white dark:bg-zinc-700 text-gray-900 dark:text-gray-100 rounded-md px-3 py-2 focus:ring-1 focus:ring-indigo-500" required min="0" step="0.01"/>
        </div>
        <div className="flex-1">
          <label htmlFor="itemDate" className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Data</label>
          <input id="itemDate" type="date" value={formData.data} onChange={(e) => setFormData({ ...formData, data: e.target.value })} className="w-full text-sm border-gray-300 dark:border-zinc-600 bg-white dark:bg-zinc-700 text-gray-900 dark:text-gray-100 rounded-md px-3 py-2 focus:ring-1 focus:ring-indigo-500"/>
        </div>
      </div>
      
      <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer pt-2">
        <input type="checkbox" checked={formData.recorrente} onChange={(e) => setFormData({ ...formData, recorrente: e.target.checked })} className="h-4 w-4 rounded border-gray-300 dark:border-zinc-600 bg-white dark:bg-zinc-700 text-indigo-600 focus:ring-indigo-500"/>
        É uma transação recorrente?
      </label>

      {error && <p className="text-red-600 dark:text-red-500 text-xs text-center">{error}</p>}

      <div className="flex justify-end gap-2 mt-2">
         <button type="button" onClick={onCancel} className="flex items-center justify-center p-2 h-9 w-9 rounded-md bg-gray-200 hover:bg-gray-300 dark:bg-zinc-700 dark:hover:bg-zinc-600 transition-colors" title="Cancelar"><X size={16} className="text-gray-700 dark:text-gray-200" /></button>
        <button type="submit" className="flex items-center justify-center p-2 h-9 w-9 rounded-md bg-indigo-600 hover:bg-indigo-700 transition-colors" title="Salvar"><Check size={16} className="text-white" /></button>
      </div>
    </form>
  );
}