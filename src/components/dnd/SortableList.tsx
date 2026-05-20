import React from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  Announcements,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';

interface Props<T> {
  items: T[];
  getId: (item: T) => string;
  onReorder: (activeId: string, overId: string) => void;
  children: React.ReactNode;
  getLabel?: (item: T) => string;
}

export function SortableList<T>({ items, getId, onReorder, children, getLabel }: Props<T>) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const ids = items.map(getId);
  const total = items.length;

  const announcements: Announcements = {
    onDragStart({ active }) {
      const idx = ids.indexOf(String(active.id));
      const label = getLabel ? getLabel(items[idx]) : String(active.id);
      return `Picked up ${label}, position ${idx + 1} of ${total}.`;
    },
    onDragOver({ active, over }) {
      if (!over) return;
      const toIdx = ids.indexOf(String(over.id));
      return `Moving to position ${toIdx + 1} of ${total}.`;
    },
    onDragEnd({ active, over }) {
      if (!over || active.id === over.id) return;
      const toIdx = ids.indexOf(String(over.id));
      const label = getLabel ? getLabel(items[ids.indexOf(String(active.id))]) : String(active.id);
      return `${label} dropped at position ${toIdx + 1} of ${total}.`;
    },
    onDragCancel({ active }) {
      const idx = ids.indexOf(String(active.id));
      const label = getLabel ? getLabel(items[idx]) : String(active.id);
      return `Reordering cancelled. ${label} returned to position ${idx + 1} of ${total}.`;
    },
  };

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      onReorder(String(active.id), String(over.id));
    }
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
      accessibility={{ announcements }}
    >
      <SortableContext items={ids} strategy={verticalListSortingStrategy}>
        {children}
      </SortableContext>
    </DndContext>
  );
}
