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



describe('EnhancedMonitoringDashboard', () => {

  beforeEach(() => {
    vi.clearAllMocks();
    (InfrastructureMonitoring.getInstance as any).mockReturnValue(mockMonitoring);
  });


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
    fireEvent.click(alertsTab);
    
    await waitFor(() => {
      expect(screen.getByText(/High response time for auth/)).toBeInTheDocument();
    });
  });

  it('displays municipal metrics', async () => {
    renderDashboard();
    
    // Click on Municipal Metrics tab
    fireEvent.click(municipalTab);
    
    await waitFor(() => {
      expect(screen.getByText('Active Users')).toBeInTheDocument();
      expect(screen.getByText('Training Completion')).toBeInTheDocument();
      expect(screen.getByText('Session Duration')).toBeInTheDocument();
    });
  });

  it('allows exporting monitoring data', async () => {
    // Create a mock for URL.createObjectURL and document.createElement
    
    global.URL.createObjectURL = mockCreateObjectURL;
    global.URL.revokeObjectURL = mockRevokeObjectURL;
    
    document.createElement = vi.fn((tagName) => {
      if (tagName === 'a') {
        element.click = mockClick;
        return element;
      }
      return originalCreateElement(tagName);
    });
    
    renderDashboard();
    
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
    
    mockMonitoring.getHealthStatus.mockReturnValue(criticalHealthData);
    
    renderDashboard();
    
    await waitFor(() => {
      expect(screen.getByText('Critical Issues Detected!')).toBeInTheDocument();
    });
  });

  it('displays time range selector', () => {
    renderDashboard();
    
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