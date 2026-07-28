// Test setup for vitest
import { vi } from 'vitest';

// Mock leaflet for tests
vi.mock('leaflet', () => ({
  icon: vi.fn(() => ({})),
  divIcon: vi.fn(() => ({})),
  latLngBounds: vi.fn(() => ({ isValid: () => true })),
  default: {},
}));

vi.mock('react-leaflet', () => ({
  MapContainer: ({ children }: { children: React.ReactNode }) => children,
  TileLayer: () => null,
  Marker: ({ children }: { children: React.ReactNode }) => children,
  Popup: ({ children }: { children: React.ReactNode }) => children,
  useMap: () => ({ fitBounds: vi.fn() }),
}));
