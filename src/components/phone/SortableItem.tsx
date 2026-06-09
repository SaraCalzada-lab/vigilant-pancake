"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface SortableItemProps {
  id: string;
  imageUrl: string;
  label: string;
  position: number;
  disabled?: boolean;
}

export default function SortableItem({ id, imageUrl, label, position, disabled }: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id, disabled });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 50 : undefined,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`glass-strong flex items-center gap-3 rounded-2xl px-4 py-3 ${
        disabled ? "opacity-50" : ""
      } ${isDragging ? "scale-105 shadow-lg" : ""}`}
    >
      {/* Position number */}
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/10 text-sm font-bold text-white/70">
        {position}
      </span>

      {/* Image thumbnail — dynamic external URLs, next/image needs domain allowlist */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={imageUrl}
        alt={label}
        className="h-16 w-16 shrink-0 rounded-xl object-cover"
        draggable={false}
      />

      {/* Label */}
      <span className="flex-1 text-base font-semibold text-white">{label}</span>

      {/* Drag handle */}
      {!disabled && (
        <div
          {...attributes}
          {...listeners}
          className="flex shrink-0 cursor-grab touch-none flex-col items-center justify-center gap-0.5 px-1 active:cursor-grabbing"
        >
          <span className="block h-0.5 w-5 rounded bg-white/30" />
          <span className="block h-0.5 w-5 rounded bg-white/30" />
          <span className="block h-0.5 w-5 rounded bg-white/30" />
        </div>
      )}
    </div>
  );
}
