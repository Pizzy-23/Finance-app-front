'use client';

import { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import FinanceCard from './FinanceCard';
import { FinanceGroup, FinanceItem } from '@/types/finance';
import AddItemForm from './AddItemForm';
import { X, Bookmark, CircleDollarSign } from 'lucide-react';

interface KanbanColumnProps {
  group: FinanceGroup;
  onItemCreated: () => void;
  onEditTags: (item: FinanceItem) => void;
}

export default function KanbanColumn({ group, onItemCreated, onEditTags }: KanbanColumnProps) {
  const [showForm, setShowForm] = useState(false);

  const columnTotal = group.itens.reduce((sum, item) => sum + item.valor, 0);

  const totalDisplay = group.entrada ? columnTotal : -columnTotal;
  const totalColor = group.entrada ? 'text-green-600 dark:text-green-500' 
                   : columnTotal > 0 ? 'text-red-600 dark:text-red-500'
                   : 'text-gray-500 dark:text-gray-400';

  const { setNodeRef, attributes, listeners, transform, transition, isDragging } = useSortable({
    id: group.id,
    data: { type: 'COLUMN', group },
  });

  const style = { transition, transform: CSS.Translate.toString(transform) };

  const handleDeleteGroup = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(`Remover a coluna "${group.nome}"?`)) {
      await fetch(`http://localhost:53272/groups/${group.id}`, { method: 'DELETE' });
      onItemCreated();
    }
  };

  if (isDragging) {
    return <div ref={setNodeRef} style={style} className="w-80 h-full bg-gray-200/50 dark:bg-zinc-800/50 rounded-lg border-2 border-indigo-500" />;
  }

  return (
    <div ref={setNodeRef} style={style} className="flex flex-col w-80 max-h-[calc(100vh-10rem)] bg-gray-200/80 dark:bg-zinc-800/90 rounded-xl shadow-sm">
      <div {...attributes} {...listeners} className="relative flex justify-between items-center p-3 cursor-grab border-b border-gray-300/50 dark:border-zinc-700/50">
        {group.entrada ? (
            <CircleDollarSign className="absolute -top-2 -left-2 w-8 h-8 text-green-500 bg-gray-200 dark:bg-zinc-800 rounded-full p-1 z-10" />
        ) : (
            <Bookmark className="absolute -top-px -left-px w-9 h-9" style={{ color: group.cor }} fill={group.cor} strokeWidth={1.5} />
        )}
        <div className="flex-grow flex items-center gap-2 pl-8 z-10">
          <h3 className="font-semibold text-gray-700 dark:text-gray-300 text-sm truncate">{group.nome}</h3>
          <span className="flex-shrink-0 text-xs text-gray-500 dark:text-gray-400 bg-gray-300/70 dark:bg-zinc-700 rounded-full px-2 py-0.5">{group.itens.length}</span>
        </div>
        <button onClick={handleDeleteGroup} title="Excluir Coluna" className="flex-shrink-0 w-6 h-6 bg-red-500 text-white flex items-center justify-center rounded-lg shadow-md hover:bg-red-600 z-10">
          <X size={16} />
        </button>
      </div>
      <div className="p-2 flex-grow overflow-y-auto space-y-3">
        <SortableContext items={group.itens.map(i => i.id)} strategy={verticalListSortingStrategy}>
          {group.itens.map(item => (
            <FinanceCard key={item.id} item={item} onItemDeleted={onItemCreated} onEditTags={onEditTags} isIncome={group.entrada} />
          ))}
        </SortableContext>
      </div>
      <div className="p-3 mt-auto border-t border-gray-300/50 dark:border-zinc-700/50">
        {showForm ? (
          <AddItemForm groupId={group.id} onSuccess={() => { setShowForm(false); onItemCreated(); }} onCancel={() => setShowForm(false)} />
        ) : (
          <div className="flex justify-between items-center">
            <button onClick={() => setShowForm(true)} className="text-sm text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200">+ Adicionar item</button>
            <div className="text-right">
              <span className="text-xs text-gray-500 dark:text-gray-400">Total</span>
              <p className={`font-bold text-lg ${totalColor}`} suppressHydrationWarning>
                {totalDisplay.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}