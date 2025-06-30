import React from 'react';

interface KanbanLaneProps {
  title: string;
  children: React.ReactNode;
}

export default function KanbanLane({ title, children }: KanbanLaneProps) {
  return (
    <div className="flex items-start gap-4 w-full">
      {/* Título da Lane na lateral */}
      <div className="w-40 flex-shrink-0 pt-3 sticky left-0 z-10 bg-gray-100 h-full">
        <h2 className="font-bold text-gray-600 uppercase text-sm transform -rotate-90 origin-top-left -translate-y-full -translate-x-4 w-40 text-center py-2">
          {title}
        </h2>
      </div>

      {/* Container horizontal para as colunas */}
      <div className="flex-grow flex gap-4 pb-2">
        {children}
      </div>
    </div>
  );
}