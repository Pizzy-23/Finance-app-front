'use client';

import { useState } from 'react';
import { FinanceItem } from '@/types/finance';
import { X, Plus } from 'lucide-react';

interface ManageTagsModalProps {
  item: FinanceItem | null;
  onClose: () => void;
  onTagsUpdated: () => void;
}

export default function ManageTagsModal({ item, onClose, onTagsUpdated }: ManageTagsModalProps) {
  const [newTagName, setNewTagName] = useState('');
  const [newTagColor, setNewTagColor] = useState('#808080');

  if (!item) return null;

  const handleUpdate = () => {
    setNewTagName('');
    onTagsUpdated();
  }

  const handleAddTag = async () => {
    if (!newTagName) return;
    await fetch(`http://localhost:53272/items/${item.id}/tags`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nome: newTagName, cor: newTagColor }),
    });
    handleUpdate();
  };
  
  const handleRemoveTag = async (tagId: string) => {
    await fetch(`http://localhost:53272/items/${item.id}/tags/${tagId}`, {
      method: 'DELETE',
    });
    handleUpdate();
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/60 z-50" onClick={onClose}>
      <div className="bg-white dark:bg-zinc-800 rounded-2xl shadow-xl p-6 w-full max-w-md space-y-4" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Gerenciar Tags para "{item.nome}"</h2>
        
        <div className="space-y-2">
          {item.tags.map(tag => (
            <div key={tag.id} className="flex justify-between items-center bg-gray-100 dark:bg-zinc-700 p-2 rounded-lg">
              <span style={{ color: tag.cor }} className="font-semibold text-sm">{tag.nome}</span>
              <button onClick={() => handleRemoveTag(tag.id)} className="text-red-500 hover:text-red-700">
                <X size={16} />
              </button>
            </div>
          ))}
          {item.tags.length === 0 && <p className="text-sm text-gray-500 dark:text-gray-400">Nenhuma tag adicionada.</p>}
        </div>

        <div className="pt-4 border-t border-gray-200 dark:border-zinc-700 space-y-2">
          <h3 className="text-md font-semibold text-gray-800 dark:text-gray-200">Nova Tag</h3>
          <div className="flex gap-2">
            <input type="text" value={newTagName} onChange={e => setNewTagName(e.target.value)} placeholder="Nome da tag" className="flex-grow border border-gray-300 dark:border-zinc-600 bg-white dark:bg-zinc-700 rounded-lg px-3 py-2 text-gray-900 dark:text-gray-100" />
            <input type="color" value={newTagColor} onChange={e => setNewTagColor(e.target.value)} className="w-12 h-10 cursor-pointer bg-transparent border border-gray-300 dark:border-zinc-600 rounded-lg" />
            <button onClick={handleAddTag} className="bg-indigo-600 text-white p-2 rounded-lg hover:bg-indigo-700"><Plus size={16}/></button>
          </div>
        </div>
      </div>
    </div>
  );
}