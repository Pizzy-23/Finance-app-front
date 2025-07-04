'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Trash2, DollarSign, Calendar, Tags as TagsIcon } from 'lucide-react';
import { FinanceItem } from '@/types/finance';

interface FinanceCardProps {
  item: FinanceItem;
  onItemDeleted: () => void;
  onEditTags: (item: FinanceItem) => void;
  isIncome: boolean;
}

export default function FinanceCard({ item, onItemDeleted, onEditTags }: FinanceCardProps) {
  const { 
    attributes, listeners, setNodeRef, transform, transition, isDragging 
  } = useSortable({ id: item.id, data: { type: 'ITEM', item } });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('pt-BR', { timeZone: 'UTC' });
  
  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(`Excluir o item "${item.nome}"?`)) {
      fetch(`http://localhost:53272/items/${item.id}`, { method: 'DELETE' }).then(onItemDeleted);
    }
  };

  const handleEditTagsClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEditTags(item);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="bg-white dark:bg-zinc-900/50 rounded-md p-3 shadow-sm border border-gray-200/80 dark:border-zinc-700/50 cursor-grab group touch-none"
    >
      <div className="flex justify-between items-start">
        <h4 className="font-medium text-sm text-gray-800 dark:text-gray-200">{item.nome}</h4>
        <button 
            onClick={handleDelete}
            className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 dark:text-gray-500 hover:text-red-500"
        >
          <Trash2 size={16} />
        </button>
      </div>

      <div className="mt-2 space-y-1.5 text-xs text-gray-600 dark:text-gray-400">
        <div suppressHydrationWarning className="flex items-center gap-2"><DollarSign size={14} className={item.recorrente ? 'text-green-500' : 'text-red-500'} /><span>R$ {item.valor.toFixed(2)}</span></div>
        <div suppressHydrationWarning className="flex items-center gap-2"><Calendar size={14} /><span>{formatDate(item.data)}</span></div>
      </div>
      
      <div className="flex justify-between items-end mt-3">
        <div className="flex items-center gap-1.5 flex-wrap">
          {item.tags.map(tag => (
            <span
              key={tag.id}
              style={{ backgroundColor: `${tag.cor}20`, color: tag.cor }}
              className="px-2 py-0.5 rounded-full text-xs font-semibold"
            >
              {tag.nome}
            </span>
          ))}
        </div>
        <button onClick={handleEditTagsClick} className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-indigo-500" title="Editar Tags">
            <TagsIcon size={16}/>
        </button>
      </div>
    </div>
  );
}