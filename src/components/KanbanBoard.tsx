'use client';

import { useState, useEffect, useMemo } from "react";
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, KeyboardSensor, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { SortableContext, arrayMove, horizontalListSortingStrategy } from "@dnd-kit/sortable";
import KanbanColumn from "./KanbanColumn";
import { FinanceGroup, FinanceItem } from "@/types/finance";
import FinanceCard from "./FinanceCard";
import ManageTagsModal from "./ManageTagsModal";
import { ThemeSwitcher } from "./ThemeSwitcher";
import { DashboardHeader } from "./DashboardHeader";

export default function KanbanBoard() {
  const [groups, setGroups] = useState<FinanceGroup[]>([]);
  const [activeElement, setActiveElement] = useState<{type: 'COLUMN' | 'ITEM', data: FinanceGroup | FinanceItem} | null>(null);
  
  const [showColumnForm, setShowColumnForm] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupColor, setNewGroupColor] = useState("#6366f1");
  const [isIncomeColumn, setIsIncomeColumn] = useState(false);
  
  const [editingTagsForItem, setEditingTagsForItem] = useState<FinanceItem | null>(null);

  const incomeColumnExists = useMemo(() => groups.some(g => g.entrada), [groups]);
  
  const { totalEntradas, totalDespesas, saldoFinal } = useMemo(() => {
    let entradas = 0, despesas = 0;
    groups.forEach(group => {
      const groupTotal = group.itens.reduce((sum, item) => sum + item.valor, 0);
      if (group.entrada) entradas += groupTotal;
      else despesas += groupTotal;
    });
    return { totalEntradas: entradas, totalDespesas: despesas, saldoFinal: entradas - despesas };
  }, [groups]);

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
  
  const handleAddGroup = async () => {
    if (!newGroupName.trim()) return alert("O nome da coluna não pode ser vazio!");
    try {
      await fetch("http://localhost:53272/groups", {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome: newGroupName, cor: newGroupColor, isIncomeSource: isIncomeColumn })
      });
      fetchGroups();
      setShowColumnForm(false);
      setNewGroupName("");
      setIsIncomeColumn(false);
    } catch (error) {
      console.error("Erro ao criar o grupo:", error);
    }
  };

  const onDragStart = (event: DragStartEvent) => {
    if (event.active.data.current?.type === "COLUMN") setActiveElement({type: 'COLUMN', data: event.active.data.current.group});
    if (event.active.data.current?.type === "ITEM") setActiveElement({type: 'ITEM', data: event.active.data.current.item});
  };

  // --- A NOVA LÓGICA INTELIGENTE ON DRAG END ---
  const onDragEnd = (event: DragEndEvent) => {
    setActiveElement(null);
    const { active, over } = event;
    if (!over) return;
    const activeId = String(active.id);
    const overId = String(over.id);

    // Reordenação de Colunas
    if (active.data.current?.type === 'COLUMN' && over.data.current?.type === 'COLUMN') {
        if (activeId === overId) return;
        setGroups(currentGroups => {
            const oldIndex = currentGroups.findIndex(g => g.id === activeId);
            const newIndex = currentGroups.findIndex(g => g.id === overId);
            const reorderedGroups = arrayMove(currentGroups, oldIndex, newIndex);
            
            // Salva a nova ordem das colunas na API
            fetch(`http://localhost:53272/groups/order`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ orderedIds: reorderedGroups.map(g => g.id) })
            });

            return reorderedGroups;
        });
        return;
    }

    // Reordenação de Itens
    if (active.data.current?.type === 'ITEM') {
        const activeContainer = groups.find(g => g.itens.some(i => i.id === activeId));
        const overContainer = groups.find(g => g.id === overId || g.itens.some(i => i.id === overId));

        if (!activeContainer || !overContainer) return;

        // Cenário 1: Reordenando itens DENTRO da mesma coluna
        if (activeContainer.id === overContainer.id) {
            setGroups(currentGroups => {
                const groupIndex = currentGroups.findIndex(g => g.id === activeContainer.id);
                if (groupIndex === -1) return currentGroups;

                const oldItemIndex = currentGroups[groupIndex].itens.findIndex(item => item.id === activeId);
                const newItemIndex = currentGroups[groupIndex].itens.findIndex(item => item.id === overId);
                const reorderedItems = arrayMove(currentGroups[groupIndex].itens, oldItemIndex, newItemIndex);

                // Salva a nova ordem dos itens na API
                fetch(`http://localhost:53272/items/order`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ orderedIds: reorderedItems.map(item => item.id) })
                });

                currentGroups[groupIndex] = { ...currentGroups[groupIndex], itens: reorderedItems };
                return [...currentGroups];
            });
        } 
        // Cenário 2: Movendo um item para uma coluna DIFERENTE
        else {
            // Atualiza o estado da UI otimisticamente
            setGroups(currentGroups => {
                const activeItem = activeContainer.itens.find(i => i.id === activeId);
                if (!activeItem) return currentGroups;

                const sourceGroup = currentGroups.find(g => g.id === activeContainer.id);
                const destGroup = currentGroups.find(g => g.id === overContainer.id);
                if (!sourceGroup || !destGroup) return currentGroups;

                sourceGroup.itens = sourceGroup.itens.filter(i => i.id !== activeId);
                destGroup.itens.push(activeItem);

                return [...currentGroups];
            });
            
            // Chama a API existente para mover o item entre grupos
            fetch(`http://localhost:53272/items/${activeId}/move?newGroupId=${overContainer.id}`, {
                method: 'PUT'
            });
        }
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-zinc-900 font-sans transition-colors duration-300">
      <header className="flex justify-between items-center p-4 border-b bg-white dark:bg-zinc-800 dark:border-zinc-700 sticky top-0 z-30">
        <h1 className="text-xl font-bold text-gray-800 dark:text-gray-200">Finance Dashboard</h1>
        <DashboardHeader saldoFinal={saldoFinal} totalEntradas={totalEntradas} totalDespesas={totalDespesas}/>
        <div className="flex items-center gap-4">
          <button onClick={() => setShowColumnForm(true)} className="bg-indigo-600 text-white text-sm font-semibold px-4 py-2 rounded-lg shadow-sm hover:bg-indigo-700">
            + Add Column
          </button>
          <ThemeSwitcher />
        </div>
      </header>
      <main className="p-4 overflow-x-auto">
        <DndContext onDragStart={onDragStart} onDragEnd={onDragEnd} sensors={sensors}>
          <div className="flex gap-4 w-fit">
            <SortableContext items={groups.map(g => g.id)} strategy={horizontalListSortingStrategy}>
              {groups.map(group => (
                <KanbanColumn key={group.id} group={group} onItemCreated={fetchGroups} onEditTags={setEditingTagsForItem} />
              ))}
            </SortableContext>
          </div>
          <DragOverlay>
            {activeElement?.type === 'COLUMN' && <KanbanColumn group={activeElement.data as FinanceGroup} onItemCreated={fetchGroups} onEditTags={setEditingTagsForItem} />}
            {activeElement?.type === 'ITEM' && <FinanceCard item={activeElement.data as FinanceItem} onItemDeleted={fetchGroups} onEditTags={setEditingTagsForItem} isIncome={groups.find(g => g.itens.some(i => i.id === activeElement?.data.id))?.entrada ?? false} />}
          </DragOverlay>
        </DndContext>
      </main>

      <ManageTagsModal item={editingTagsForItem} onClose={() => setEditingTagsForItem(null)} onTagsUpdated={fetchGroups}/>
      {showColumnForm && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/60 z-50" onClick={() => setShowColumnForm(false)}>
            <div className="bg-white dark:bg-zinc-800 rounded-2xl shadow-xl p-6 w-full max-w-md space-y-4" onClick={(e) => e.stopPropagation()}>
                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Adicionar Nova Coluna</h2>
                <div>
                  <label htmlFor="groupName" className="text-sm font-medium text-gray-700 dark:text-gray-300">Nome da Coluna</label>
                  <input id="groupName" type="text" value={newGroupName} onChange={e => setNewGroupName(e.target.value)} placeholder="Ex: Contas a Pagar" className="mt-1 w-full border border-gray-300 dark:border-zinc-600 bg-white dark:bg-zinc-700 rounded-lg px-3 py-2 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div>
                    <label htmlFor="groupColor" className="text-sm font-medium text-gray-700 dark:text-gray-300">Cor</label>
                    <input id="groupColor" type="color" value={newGroupColor} onChange={e => setNewGroupColor(e.target.value)} className="mt-1 w-full h-10 cursor-pointer bg-transparent border-gray-300 dark:border-zinc-600 rounded-lg" />
                </div>
                {!incomeColumnExists && (
                    <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer pt-2">
                        <input type="checkbox" checked={isIncomeColumn} onChange={(e) => setIsIncomeColumn(e.target.checked)} className="h-4 w-4 rounded border-gray-300 dark:border-zinc-600 bg-white dark:bg-zinc-700 text-indigo-600 focus:ring-indigo-500"/>
                        Esta é a coluna de Receitas?
                    </label>
                )}
                <div className="flex justify-end gap-4 pt-4">
                <button onClick={() => setShowColumnForm(false)} className="text-gray-600 dark:text-gray-300 font-semibold px-4 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-700">Cancelar</button>
                <button onClick={handleAddGroup} className="bg-indigo-600 text-white font-semibold px-4 py-2 rounded-lg shadow-sm hover:bg-indigo-700">Salvar Coluna</button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
}