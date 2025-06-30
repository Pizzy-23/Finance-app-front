'use client';

import { useEffect, useState } from "react";
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, KeyboardSensor, PointerSensor, closestCenter, useSensor, useSensors } from "@dnd-kit/core";
import { SortableContext, arrayMove, horizontalListSortingStrategy } from "@dnd-kit/sortable";
import KanbanColumn from "./KanbanColumn";
import { FinanceGroup, FinanceItem } from "@/types/finance";
import FinanceCard from "./FinanceCard";
import ManageTagsModal from "./ManageTagsModal";

export default function KanbanBoard() {
  const [groups, setGroups] = useState<FinanceGroup[]>([]);
  const [activeElement, setActiveElement] = useState<{type: 'COLUMN' | 'ITEM', data: any} | null>(null);
  
  const [showColumnForm, setShowColumnForm] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupColor, setNewGroupColor] = useState("#6366f1");

  const [editingTagsForItem, setEditingTagsForItem] = useState<FinanceItem | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 10 } }),
    useSensor(KeyboardSensor)
  );

  const fetchGroups = async () => {
    try {
      const res = await fetch("http://localhost:53272/groups");
      const data: FinanceGroup[] = await res.json();
      setGroups(data);
    } catch (err) { console.error("Erro ao buscar grupos:", err); }
  };

  useEffect(() => { fetchGroups(); }, []);

  const saveColumnOrder = async (orderedGroups: FinanceGroup[]) => {
    await fetch("http://localhost:53272/groups/order", {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderedIds: orderedGroups.map(g => g.id) })
    });
  };

  const onDragStart = (event: DragStartEvent) => {
    if (event.active.data.current?.type === "COLUMN") {
      setActiveElement({type: 'COLUMN', data: event.active.data.current.group});
      return;
    }
    if (event.active.data.current?.type === "ITEM") {
      setActiveElement({type: 'ITEM', data: event.active.data.current.item});
      return;
    }
  };

  const onDragEnd = (event: DragEndEvent) => {
    setActiveElement(null);
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    if (active.data.current?.type === 'COLUMN') {
      setGroups(gs => {
        const oldIndex = gs.findIndex(g => g.id === active.id);
        const newIndex = gs.findIndex(g => g.id === over.id);
        const newOrder = arrayMove(gs, oldIndex, newIndex);
        saveColumnOrder(newOrder);
        return newOrder;
      });
      return;
    }

    if (active.data.current?.type === 'ITEM') {
        const activeGroup = groups.find(g => g.itens.some(i => i.id === active.id));
        const overGroup = groups.find(g => g.id === over.id || g.itens.some(i => i.id === over.id));
        if (!activeGroup || !overGroup || activeGroup.id === overGroup.id) return;

        fetch(`http://localhost:53272/items/${active.id}/move?newGroupId=${overGroup.id}`, { method: 'PUT' }).then(fetchGroups);
    }
  };
  
  const handleAddGroup = async () => { /* ... sua função handleAddGroup ... */ };


  return (
    <div className="min-h-screen bg-gray-100 font-sans">
      <header className="flex justify-between items-center p-4 border-b bg-white sticky top-0 z-20">
          <h1 className="text-xl font-bold text-gray-800">Finance Dashboard</h1>
          <button onClick={() => setShowColumnForm(true)} className="bg-indigo-600 text-white text-sm font-semibold px-4 py-2 rounded-lg shadow-sm hover:bg-indigo-700 transition-colors">
            + Add Column
          </button>
      </header>

      <main className="p-4 overflow-x-auto">
        <DndContext onDragStart={onDragStart} onDragEnd={onDragEnd} sensors={sensors}>
          <div className="flex gap-4 w-fit">
            <SortableContext items={groups} strategy={horizontalListSortingStrategy}>
              {groups.map(group => (
                <KanbanColumn key={group.id} group={group} onItemCreated={fetchGroups} onEditTags={setEditingTagsForItem} />
              ))}
            </SortableContext>
          </div>
          
          <DragOverlay>
            {activeElement?.type === 'COLUMN' && <KanbanColumn group={activeElement.data} onItemCreated={fetchGroups} onEditTags={setEditingTagsForItem} />}
            {activeElement?.type === 'ITEM' && <FinanceCard item={activeElement.data} onItemDeleted={fetchGroups} onEditTags={setEditingTagsForItem}/>}
          </DragOverlay>
        </DndContext>
      </main>

      {/* Modal para gerenciar tags */}
      <ManageTagsModal 
        item={editingTagsForItem} 
        onClose={() => setEditingTagsForItem(null)}
        onTagsUpdated={() => {
            fetchGroups(); // Recarrega os dados para mostrar as tags atualizadas
            setEditingTagsForItem(prev => prev ? { ...prev, tags: [] } : null); // Atualiza o estado do modal
        }}
      />
      
      {/* Modal para adicionar coluna... */}
    </div>
  );
}
