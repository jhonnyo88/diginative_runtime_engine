import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import { EnhancedMonitoringDashboard } from './EnhancedMonitoringDashboard';
import { InfrastructureMonitoring } from '../../services/infrastructure-monitoring';

// Mock the InfrastructureMonitoring service
vi.mock('../../services/infrastructure-monitoring', () => ({
  InfrastructureMonitoring: {
    getInstance: vi.fn()
  }
}));

const mockHealthData = {
  status: 'healthy' as const,
  timestamp: Date.now(),
  services: {
    api: {
      name: 'api',
      status: 'up' as const,
      lastCheck: Date.now(),
      responseTime: 45
    },
    database: {
      name: 'database',
      status: 'up' as const,
      lastCheck: Date.now(),
      responseTime: 12
    },
    auth: {
      name: 'auth',
      status: 'degraded' as const,
      lastCheck: Date.now(),
      responseTime: 850,
      error: 'High response time detected'
    }
  },
  metrics: []
};

const mockPerformanceBaseline = {
  lcp: 2200,
  fid: 85,
  cls: 0.08,
  api_response_time: 125,
  database_query_time: 45
};

describe('EnhancedMonitoringDashboard', () => {
  const mockMonitoring = {
    getHealthStatus: vi.fn().mockReturnValue(mockHealthData),
    getPerformanceBaseline: vi.fn().mockReturnValue(mockPerformanceBaseline)
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (InfrastructureMonitoring.getInstance as any).mockReturnValue(mockMonitoring);
  });

  const renderDashboard = () => {
    return render(
      <ChakraProvider>
        <EnhancedMonitoringDashboard />
      </ChakraProvider>
    );
  };

  it('renders the dashboard header with title', () => {
    renderDashboard();
    expect(screen.getByText('Enterprise Infrastructure Monitoring')).toBeInTheDocument();
  });

  it('displays system health status', async () => {
    renderDashboard();
    await waitFor(() => {
      expect(screen.getByText('HEALTHY')).toBeInTheDocument();
    });
  });

  it('shows service health cards', async () => {
    renderDashboard();
    await waitFor(() => {
      expect(screen.getByText('api')).toBeInTheDocument();
      expect(screen.getByText('database')).toBeInTheDocument();
      expect(screen.getByText('auth')).toBeInTheDocument();
    });
  });

  it('displays Web Vitals metrics', async () => {
    renderDashboard();
    
    // Click on Performance tab
    const performanceTab = screen.getByText('Performance');
    fireEvent.click(performanceTab);
    
    await waitFor(() => {
      expect(screen.getByText('Largest Contentful Paint')).toBeInTheDocument();
      expect(screen.getByText('First Input Delay')).toBeInTheDocument();
      expect(screen.getByText('Cumulative Layout Shift')).toBeInTheDocument();
    });
  });

  it('shows alerts for degraded services', async () => {
    renderDashboard();
    
    // Click on Alerts tab
    const alertsTab = screen.getByText('Alerts');
    fireEvent.click(alertsTab);
    
    await waitFor(() => {
      expect(screen.getByText(/High response time for auth/)).toBeInTheDocument();
    });
  });

  it('displays municipal metrics', async () => {
    renderDashboard();
    
    // Click on Municipal Metrics tab
    const municipalTab = screen.getByText('Municipal Metrics');
    fireEvent.click(municipalTab);
    
    await waitFor(() => {
      expect(screen.getByText('Active Users')).toBeInTheDocument();
      expect(screen.getByText('Training Completion')).toBeInTheDocument();
      expect(screen.getByText('Session Duration')).toBeInTheDocument();
    });
  });

  it('allows exporting monitoring data', async () => {
    // Create a mock for URL.createObjectURL and document.createElement
    const mockCreateObjectURL = vi.fn().mockReturnValue('mock-url');
    const mockClick = vi.fn();
    const mockRevokeObjectURL = vi.fn();
    
    global.URL.createObjectURL = mockCreateObjectURL;
    global.URL.revokeObjectURL = mockRevokeObjectURL;
    
    const originalCreateElement = document.createElement.bind(document);
    document.createElement = vi.fn((tagName) => {
      if (tagName === 'a') {
        const element = originalCreateElement('a');
        element.click = mockClick;
        return element;
      }
      return originalCreateElement(tagName);
    });
    
    renderDashboard();
    
    const exportButton = screen.getByText('Export');
    fireEvent.click(exportButton);
    
    await waitFor(() => {
      expect(mockCreateObjectURL).toHaveBeenCalled();
      expect(mockClick).toHaveBeenCalled();
      expect(mockRevokeObjectURL).toHaveBeenCalledWith('mock-url');
    });
    
    // Restore original functions
    document.createElement = originalCreateElement;
  });

  it('toggles auto-refresh', async () => {
    renderDashboard();
    
    const refreshButton = screen.getByLabelText('Toggle auto-refresh');
    
    // Initially auto-refresh is enabled
    expect(refreshButton).toHaveAttribute('data-active');
    
    // Click to disable
    fireEvent.click(refreshButton);
    
    await waitFor(() => {
      expect(refreshButton).not.toHaveAttribute('data-active');
    });
  });

  it('updates dashboard data periodically', async () => {
    vi.useFakeTimers();
    renderDashboard();
    
    expect(mockMonitoring.getHealthStatus).toHaveBeenCalledTimes(1);
    
    // Fast-forward 5 seconds
    vi.advanceTimersByTime(5000);
    
    await waitFor(() => {
      expect(mockMonitoring.getHealthStatus).toHaveBeenCalledTimes(2);
    });
    
    vi.useRealTimers();
  });

  it('shows critical alerts banner when critical issues exist', async () => {
    // Update mock to include a down service
    const criticalHealthData = {
      ...mockHealthData,
      services: {
        ...mockHealthData.services,
        api: {
          name: 'api',
          status: 'down' as const,
          lastCheck: Date.now(),
          error: 'Service unavailable'
        }
      }
    };
    
    mockMonitoring.getHealthStatus.mockReturnValue(criticalHealthData);
    
    renderDashboard();
    
    await waitFor(() => {
      expect(screen.getByText('Critical Issues Detected!')).toBeInTheDocument();
    });
  });

  it('displays time range selector', () => {
    renderDashboard();
    
    const timeRangeSelect = screen.getByRole('combobox');
    expect(timeRangeSelect).toBeInTheDocument();
    
    // Check options
    fireEvent.click(timeRangeSelect);
    expect(screen.getByText('Last 1 hour')).toBeInTheDocument();
    expect(screen.getByText('Last 24 hours')).toBeInTheDocument();
    expect(screen.getByText('Last 7 days')).toBeInTheDocument();
  });

  it('shows municipal compliance metrics', async () => {
    renderDashboard();
    
    // Navigate to Municipal Metrics tab
    const municipalTab = screen.getByText('Municipal Metrics');
    fireEvent.click(municipalTab);
    
    await waitFor(() => {
      expect(screen.getByText('GDPR Training Compliance')).toBeInTheDocument();
      expect(screen.getByText('Accessibility Standards (WCAG 2.1 AA)')).toBeInTheDocument();
      expect(screen.getByText('Municipal Security Requirements')).toBeInTheDocument();
    });
  });

  it('displays performance trends with arrows', async () => {
    renderDashboard();
    
    // Navigate to Overview tab (default)
    await waitFor(() => {
      // Should show trend arrows for metrics
      const statArrows = screen.getAllByRole('img', { hidden: true });
      expect(statArrows.length).toBeGreaterThan(0);
    });
  });

  it('handles loading state gracefully', () => {
    // Mock no data initially
    mockMonitoring.getHealthStatus.mockReturnValueOnce(null);
    
    renderDashboard();
    
    expect(screen.getByText('Loading monitoring data...')).toBeInTheDocument();
  });
});