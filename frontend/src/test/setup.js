import { vi } from 'vitest';

// Mock localStorage
global.localStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

// Mock the entire api.js module before it's imported
vi.mock('../services/api.js', () => ({
  api: {
    interceptors: {
      request: { use: vi.fn(), eject: vi.fn() },
      response: { use: vi.fn(), eject: vi.fn() },
    },
    get: vi.fn(() => Promise.resolve({ data: [] })),
    post: vi.fn(() => Promise.resolve({ data: {} })),
    put: vi.fn(() => Promise.resolve({ data: {} })),
    delete: vi.fn(() => Promise.resolve({ data: {} })),
  },
}));

// Mock kpiService
vi.mock('../services/kpiService.js', () => ({
  default: {
    computeAdHoc: vi.fn(() => Promise.resolve({ data: {} })),
    listKpis: vi.fn(() => Promise.resolve({ data: [] })),
  },
}));

// Mock axios
vi.mock('axios', () => {
  const mockAxios = {
    create: vi.fn(() => ({
      interceptors: {
        request: { use: vi.fn(), eject: vi.fn() },
        response: { use: vi.fn(), eject: vi.fn() },
      },
      get: vi.fn(() => Promise.resolve({ data: [] })),
      post: vi.fn(() => Promise.resolve({ data: {} })),
      put: vi.fn(() => Promise.resolve({ data: {} })),
      delete: vi.fn(() => Promise.resolve({ data: {} })),
    })),
    get: vi.fn(() => Promise.resolve({ data: [] })),
    post: vi.fn(() => Promise.resolve({ data: {} })),
  };
  return { default: mockAxios };
});

// Mock Chart.js
vi.mock('chart.js', () => ({
  Chart: class MockChart {
    constructor() {
      this.destroy = vi.fn();
      this.update = vi.fn();
    }
    static register() {
      return vi.fn();
    }
  },
  registerables: [],
}));

// Mock html2canvas
vi.mock('html2canvas', () => ({
  default: vi.fn(() => Promise.resolve({
    toDataURL: vi.fn(() => 'data:image/png;base64,mock'),
  })),
}));

// Mock jsPDF
vi.mock('jspdf', () => ({
  jsPDF: vi.fn(() => ({
    addImage: vi.fn(),
    save: vi.fn(),
    internal: {
      pageSize: {
        getWidth: vi.fn(() => 210),
        getHeight: vi.fn(() => 297),
      },
    },
  })),
}));

