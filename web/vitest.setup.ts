import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach, expect, vi } from "vitest";

function ensureStorage(name: "localStorage" | "sessionStorage") {
  const existing = window[name];

  if (
    existing &&
    typeof existing.getItem === "function" &&
    typeof existing.setItem === "function" &&
    typeof existing.removeItem === "function" &&
    typeof existing.clear === "function"
  ) {
    return;
  }

  const store = new Map<string, string>();
  const storage = {
    getItem: vi.fn((key: string) => (store.has(key) ? store.get(key)! : null)),
    setItem: vi.fn((key: string, value: string) => {
      store.set(String(key), String(value));
    }),
    removeItem: vi.fn((key: string) => {
      store.delete(String(key));
    }),
    clear: vi.fn(() => {
      store.clear();
    }),
    key: vi.fn((index: number) => Array.from(store.keys())[index] ?? null),
    get length() {
      return store.size;
    }
  };

  Object.defineProperty(window, name, {
    configurable: true,
    writable: true,
    value: storage
  });
}

ensureStorage("localStorage");
ensureStorage("sessionStorage");

if (!window.matchMedia) {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn()
    }))
  });
}

Object.defineProperty(window, "scrollTo", {
  writable: true,
  value: vi.fn()
});

if (!Element.prototype.scrollIntoView) {
  Object.defineProperty(Element.prototype, "scrollIntoView", {
    writable: true,
    value: vi.fn()
  });
}

afterEach(() => {
  cleanup();
  window.localStorage.clear();
  vi.clearAllMocks();
});
