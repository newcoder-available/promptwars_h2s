import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import App from './App';

// Mock complex specific parts that don't need UI rendering tests
vi.mock('react-leaflet', () => ({
  MapContainer: ({ children }: any) => <div data-testid="mock-map">{children}</div>,
  TileLayer: () => <div />,
  CircleMarker: ({ children }: any) => <div data-testid="mock-marker">{children}</div>,
  Popup: () => <div />
}));

vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: any) => <div>{children}</div>,
  LineChart: () => <div data-testid="mock-chart" />,
  Line: () => <div />,
  XAxis: () => <div />,
  YAxis: () => <div />,
  CartesianGrid: () => <div />,
  Tooltip: () => <div />
}));

describe('App', () => {
  it('renders correctly', () => {
    render(<App />);
    expect(screen.getByText('ResQNet Tsunami Watch')).toBeDefined();
    expect(screen.getByText('Global Seismic Activity')).toBeDefined();
    expect(screen.getByText('Magnitude Timeline')).toBeDefined();
    expect(screen.getByText('Vertex AI Risk Assessment')).toBeDefined();
  });
});
