'use client';

import { useState } from 'react';

interface AddItemFormProps {
  groupId: string;
  onSuccess: () => void;
  onCancel: () => void;
}

// Função para obter a data de hoje no formato YYYY-MM-DD
const getTodayString = () => {
  const today = new Date();
  today.setMinutes(today.getMinutes() - today.getTimezoneOffset());
  return today.toISOString().split('T')[0];
};

export default function AddItemForm({ groupId, onSuccess, onCancel }: AddItemFormProps) {
  const [formData, setFormData] = useState({
    nome: '',
    valor: '',
    data: getTodayString(),
    recorrente: false,
    financeGroupId: groupId
  });
  const [error, setError] = useState('');

  // Formata a data de 'YYYY-MM-DD' para 'DD/MM/YYYY' para exibição
  const formatDateForDisplay = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(`${dateString}T00:00:00`); // Evita problemas de fuso
    return date.toLocaleDateString('pt-BR');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const numericValue = parseFloat(formData.valor);
    if (!formData.nome || !formData.valor || isNaN(numericValue) || numericValue < 0) {
      setError('Preencha o nome e um valor válido.');
      return;
    }
    setError('');

    try {
      const response = await fetch('http://localhost:53272/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          valor: numericValue,
          data: new Date(formData.data).toISOString(),
        }),
      });

      if (response.ok) {
        onSuccess();
      } else {
        throw new Error('Falha ao criar o item no servidor.');
      }
    } catch (err) {
      console.error('Erro ao adicionar item:', err);
      setError('Não foi possível adicionar o item. Tente novamente.');
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-4 p-5 bg-zinc-900 rounded-3xl shadow-xl text-white mt-2"
    >
      <h3 className="text-xl font-bold mb-1 text-center">Novo Item</h3>

      <input
        type="text"
        placeholder="Nome do item"
        value={formData.nome}
        onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
        className="p-3 rounded-2xl bg-black text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
        required
      />
      <input
        type="number"
        placeholder="0"
        value={formData.valor}
        onChange={(e) => setFormData({ ...formData, valor: e.target.value })}
        className="p-3 rounded-2xl bg-black text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
        required
        min="0"
        step="0.01"
      />

      <div className="relative">
        <div className="flex justify-between items-center p-3 rounded-2xl bg-black text-white cursor-pointer">
          <span>{formatDateForDisplay(formData.data)}</span>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="text-gray-400" viewBox="0 0 16 16">
            <path d="M3.5 0a.5.5 0 0 1 .5.5V1h8V.5a.5.5 0 0 1 1 0V1h1a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2h1V.5a.5.5 0 0 1 .5-.5M1 4v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V4z"/>
          </svg>
        </div>
        <input
          type="date"
          value={formData.data}
          onChange={(e) => setFormData({ ...formData, data: e.target.value })}
          className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer"
        />
      </div>
      
      <label className="flex items-center gap-3 text-base cursor-pointer">
        <input
          type="checkbox"
          checked={formData.recorrente}
          onChange={(e) => setFormData({ ...formData, recorrente: e.target.checked })}
          className="appearance-none w-5 h-5 bg-black rounded-md cursor-pointer"
        />
        Recorrente (Entrada)
      </label>

      {error && <p className="text-red-400 text-sm text-center">{error}</p>}

      {/* *** CORREÇÃO APLICADA AQUI *** */}
      <div className="flex justify-end gap-2 mt-3">
        <button
          type="submit"
          className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-2xl bg-green-500 hover:bg-green-600 transition-colors text-sm font-bold"
        >
          <span>✓</span>
          <span>Salvar</span>
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-2xl bg-red-600 hover:bg-red-700 transition-colors text-sm font-bold"
        >
          <span>×</span>
          <span>Cancelar</span>
        </button>
      </div>
    </form>
  );
}