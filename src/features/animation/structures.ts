export interface CanvasContainer { id: string; kind: 'stack' | 'queue'; title: string; x: number; y: number; capacity: number; items: { id: string; label: string }[] }
export type CanvasContainerType = CanvasContainer;

export function createStack(id: string, title: string, x: number, y: number, capacity: number, items: CanvasContainer['items'] = []): CanvasContainer {
  return { id, kind: 'stack', title, x, y, capacity: Math.max(4, capacity), items: items.slice(-Math.max(4, capacity)) };
}

export function createQueue(id: string, title: string, x: number, y: number, capacity: number, items: CanvasContainer['items'] = []): CanvasContainer {
  return { id, kind: 'queue', title, x, y, capacity: Math.max(4, capacity), items: items.slice(0, Math.max(4, capacity)) };
}
