import { vi } from 'vitest';
import '@testing-library/jest-dom/vitest';

class TestResizeObserver {
  observe(target: Element) {
    queueMicrotask(() => this.callback([{ contentRect: { width: 800, height: 400 } as DOMRectReadOnly, target } as ResizeObserverEntry], this));
  }
  unobserve() {}
  disconnect() {}
  constructor(private callback: ResizeObserverCallback) {}
}

vi.stubGlobal('ResizeObserver', TestResizeObserver);
