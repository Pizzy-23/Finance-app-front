'use client';

import { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable'; 
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import FinanceCard from './FinanceCard';
import { FinanceGroup, FinanceItem } from '@/types/finance';
import AddItemForm from './AddItemForm';
import { X } from 'lucide-react';

interface KanbanColumnProps {
  group: FinanceGroup;
  onItemCreated: () => void;
  onEditTags: (item: FinanceItem) => void;
}

export default function KanbanColumn({ group, onItemCreated, onEditTags }: KanbanColumnProps) {
  const [showForm, setShowForm] = useState(false);
  
  const { setNodeRef, attributes, listeners, transform, transition, isDragging } = useSortable({
    id: group.id,
    data: { type: 'COLUMN', group },
  });

  const style = {
    transition,
    transform: CSS.Translate.toString(transform),
  };

  const handleDeleteGroup = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(`Remover a coluna "${group.nome}"?`)) {
        fetch(`http://localhost:53272/groups/${group.id}`, { method: 'DELETE' }).then(onItemCreated);
    }
  };

  if (isDragging) {
    return <div ref={setNodeRef} style={style} className="w-72 h-[500px] bg-gray-200/50 rounded-lg border-2 border-indigo-500"></div>;
  }

  return (
    <div ref={setNodeRef} style={style} className="flex flex-col w-72 bg-gray-200/50 rounded-lg shadow-sm">
      <div {...attributes} {...listeners} className="relative flex justify-between items-center p-3 cursor-grab">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: group.cor }}></span>
          <h3 className="font-semibold text-gray-700 text-sm">{group.nome}</h3>
          <span className="text-xs text-gray-500 bg-gray-300/70 rounded-full px-2 py-0.5">{group.itens.length}</span>
        </div>
        <button onClick={handleDeleteGroup} title="Excluir Coluna" className="w-6 h-6 bg-red-500 text-white flex items-center justify-center rounded-lg shadow-md hover:bg-red-600">
          <X size={16} />
        </button>
      </div>

      <div className="p-2 flex-grow min-h-[100px] space-y-3">
        <SortableContext items={group.itens} strategy={verticalListSortingStrategy}>
          {group.itens.map(item => (
            <FinanceCard key={item.id} item={item} onItemDeleted={onItemCreated} onEditTags={onEditTags} />
          ))}
        </SortableContext>
      </div>
      
       <div className="p-2 mt-auto">
        {showForm ? (
            <AddItemForm groupId={group.id} onSuccess={() => { setShowForm(false); onItemCreated(); }} onCancel={() => setShowForm(false)} />
        ) : (
            <button onClick={() => setShowForm(true)} className="w-full text-left text-sm text-gray-500 hover:text-gray-800 p-1">
              + Adicionar item
            </button>
        )}
      </div>
    </div>
  );
}