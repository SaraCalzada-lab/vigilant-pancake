"use client";

import { useCallback } from "react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import SortableItem from "./SortableItem";

interface OrderingItem {
  id: string;
  imageUrl: string;
  label: string;
}

interface OrderingSortableProps {
  items: OrderingItem[];
  currentOrder: string[];
  secondsLeft: number;
  onReorder: (orderedIds: string[]) => void;
  onSubmit: (orderedIds: string[]) => void;
  disabled: boolean;
}

export default function OrderingSortable({
  items,
  currentOrder,
  secondsLeft,
  onReorder,
  onSubmit,
  disabled,
}: OrderingSortableProps) {
  const timerDanger = secondsLeft <= 5;

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        delay: 150,
        tolerance: 5,
      },
    })
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;

      const oldIndex = currentOrder.indexOf(active.id as string);
      const newIndex = currentOrder.indexOf(over.id as string);
      const newOrder = arrayMove(currentOrder, oldIndex, newIndex);
      onReorder(newOrder);
    },
    [currentOrder, onReorder]
  );

  const itemsMap = new Map(items.map((item) => [item.id, item]));
  const orderedItems = currentOrder.map((id) => itemsMap.get(id)!).filter(Boolean);

  return (
    <div className="flex h-screen flex-col p-3 pb-4">
      {/* Timer */}
      <div className="flex items-center justify-center py-3">
        <div
          className={`flex h-16 w-16 items-center justify-center rounded-full text-3xl font-bold transition-all ${
            timerDanger
              ? "timer-danger bg-red-500/25 text-red-400"
              : "glass text-white/80"
          }`}
        >
          {secondsLeft}
        </div>
      </div>

      {/* Info pill */}
      <div className="mb-3 flex justify-center">
        <div className="glass rounded-full px-4 py-1.5 text-sm text-white/50">
          Hold and drag to reorder
        </div>
      </div>

      {/* Sortable list */}
      <div className="flex-1 space-y-2 overflow-y-auto">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={currentOrder} strategy={verticalListSortingStrategy}>
            {orderedItems.map((item, idx) => (
              <SortableItem
                key={item.id}
                id={item.id}
                imageUrl={item.imageUrl}
                label={item.label}
                position={idx + 1}
                disabled={disabled}
              />
            ))}
          </SortableContext>
        </DndContext>
      </div>

      {/* Confirm button */}
      <button
        onClick={() => onSubmit(currentOrder)}
        disabled={disabled}
        className={`mt-3 w-full rounded-2xl py-4 text-xl font-bold text-white transition-all ${
          disabled
            ? "bg-white/10 text-white/30"
            : "bg-gradient-to-r from-violet-600 to-indigo-600 shadow-lg shadow-violet-500/20 active:scale-[0.98]"
        }`}
      >
        {disabled ? "Locked In" : "Lock In Order"}
      </button>
    </div>
  );
}
