import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/vue'
import { afterEach, vi } from 'vitest'

afterEach(() => {
  cleanup()
})

if (!globalThis.ResizeObserver) {
  globalThis.ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
}

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(
    (query: string) =>
      ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }) as unknown as MediaQueryList,
  ),
})

if (!window.visualViewport) {
  Object.defineProperty(window, 'visualViewport', {
    configurable: true,
    value: {
      width: window.innerWidth,
      height: window.innerHeight,
      offsetLeft: 0,
      offsetTop: 0,
      pageLeft: 0,
      pageTop: 0,
      scale: 1,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    },
  })
}
