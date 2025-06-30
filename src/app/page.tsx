"use client";

import KanbanBoard from "@/components/KanbanBoard";

export default function Home() {
  return (
    <div className="min-h-screen w-full bg-[#0f0f0f] text-white p-6 sm:p-10">

      <main>
        <KanbanBoard />
      </main>
    </div>
  );
}
