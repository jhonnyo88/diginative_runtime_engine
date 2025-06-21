import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
};

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
};

// Mock matchMedia for responsive design tests
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock CSS custom properties
Object.defineProperty(document.documentElement.style, 'setProperty', {
  value: vi.fn(),
});

// Mock local storage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
global.localStorage = localStorageMock;

// Mock WebSocket to prevent analytics connection errors
global.WebSocket = class MockWebSocket {
  constructor(url) {
    this.url = url;
    this.readyState = 0;
    setTimeout(() => {
      this.readyState = 1;
      if (this.onopen) this.onopen(new Event('open'));
    }, 10);
  }
  close() {
    this.readyState = 3;
    if (this.onclose) this.onclose(new Event('close'));
  }
  send() {}
  addEventListener() {}
  removeEventListener() {}
};

// Mock fetch for analytics to prevent network errors
const originalFetch = global.fetch;
global.fetch = vi.fn().mockImplementation((url, options) => {
  // Mock analytics endpoints
  if (typeof url === 'string' && url.includes('/api/analytics')) {
    return Promise.resolve({
      ok: true,
      status: 200,
      json: async () => ({ success: true }),
    });
  }
  // Call original fetch for other URLs
  return originalFetch(url, options);
});