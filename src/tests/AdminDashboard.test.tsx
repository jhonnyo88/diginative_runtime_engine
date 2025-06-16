import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AdminDashboard } from '../components/admin/AdminDashboard';
import { ChakraThemeProvider } from '../theme/ChakraThemeProvider';

// Mock ChakraThemeProvider for testing
const MockChakraProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div data-testid="mock-chakra-provider">
    {children}
  </div>
);

// Test wrapper with required providers
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <MockChakraProvider>
    {children}
  </MockChakraProvider>
);

describe('AdminDashboard', () => {
  const defaultProps = {
    tenantId: 'test-tenant',
    tenantName: 'Test Municipality',
    userRole: 'tenant_admin' as const
  };

  it('renders dashboard header with tenant information', () => {
    render(
      <TestWrapper>
        <AdminDashboard {...defaultProps} />
      </TestWrapper>
    );

    expect(screen.getByText('Admin Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Test Municipality')).toBeInTheDocument();
    expect(screen.getByText('TENANT_ADMIN')).toBeInTheDocument();
  });

  it('shows analytics for users with analytics permissions', () => {
    render(
      <TestWrapper>
        <AdminDashboard {...defaultProps} />
      </TestWrapper>
    );

    expect(screen.getByText('Total Users')).toBeInTheDocument();
    expect(screen.getByText('Active Games')).toBeInTheDocument();
    expect(screen.getByText('Completion Rate')).toBeInTheDocument();
    expect(screen.getByText('Avg Session Time')).toBeInTheDocument();
  });

  it('hides analytics for content managers', () => {
    render(
      <TestWrapper>
        <AdminDashboard {...defaultProps} userRole="content_manager" />
      </TestWrapper>
    );

    expect(screen.queryByText('Total Users')).not.toBeInTheDocument();
    expect(screen.getByText('Game Management')).toBeInTheDocument();
  });

  it('shows system health tab only for super admins', () => {
    render(
      <TestWrapper>
        <AdminDashboard {...defaultProps} userRole="super_admin" />
      </TestWrapper>
    );

    expect(screen.getByText('System Health')).toBeInTheDocument();
  });

  it('does not show system health tab for non-super admins', () => {
    render(
      <TestWrapper>
        <AdminDashboard {...defaultProps} />
      </TestWrapper>
    );

    expect(screen.queryByText('System Health')).not.toBeInTheDocument();
  });

  it('displays game performance table', async () => {
    render(
      <TestWrapper>
        <AdminDashboard {...defaultProps} />
      </TestWrapper>
    );

    // Click on Game Management tab
    fireEvent.click(screen.getByText('Game Management'));

    await waitFor(() => {
      expect(screen.getByText('GDPR Training - Malmö')).toBeInTheDocument();
      expect(screen.getByText('Workplace Safety')).toBeInTheDocument();
    });
  });

  it('shows create game button for content managers', () => {
    render(
      <TestWrapper>
        <AdminDashboard {...defaultProps} userRole="content_manager" />
      </TestWrapper>
    );

    expect(screen.getByText('Create New Game')).toBeInTheDocument();
  });

  it('updates metrics in real-time', async () => {
    const { rerender } = render(
      <TestWrapper>
        <AdminDashboard {...defaultProps} />
      </TestWrapper>
    );

    // Initial render should show metrics
    expect(screen.getByText(/1,247/)).toBeInTheDocument();

    // Wait for real-time update (mocked to be faster)
    await waitFor(() => {
      // The component should update metrics automatically
      expect(screen.getByText(/87\./)).toBeInTheDocument(); // Completion rate
    }, { timeout: 3000 });
  });

  it('handles timeframe selection', () => {
    render(
      <TestWrapper>
        <AdminDashboard {...defaultProps} />
      </TestWrapper>
    );

    const timeframeButton = screen.getByText('Last 30 days');
    fireEvent.click(timeframeButton);

    expect(screen.getByText('Last 7 days')).toBeInTheDocument();
    expect(screen.getByText('Last 90 days')).toBeInTheDocument();
  });

  it('displays recent activity feed', () => {
    render(
      <TestWrapper>
        <AdminDashboard {...defaultProps} />
      </TestWrapper>
    );

    expect(screen.getByText('Recent Activity')).toBeInTheDocument();
    expect(screen.getByText('Anna Svensson')).toBeInTheDocument();
    expect(screen.getByText('Completed GDPR Training')).toBeInTheDocument();
  });

  it('shows appropriate content based on user permissions', () => {
    const superAdminProps = {
      ...defaultProps,
      userRole: 'super_admin' as const
    };

    render(
      <TestWrapper>
        <AdminDashboard {...superAdminProps} />
      </TestWrapper>
    );

    // Super admin should see all tabs
    expect(screen.getByText('Analytics Overview')).toBeInTheDocument();
    expect(screen.getByText('Game Management')).toBeInTheDocument();
    expect(screen.getByText('Content Library')).toBeInTheDocument();
    expect(screen.getByText('User Activity')).toBeInTheDocument();
    expect(screen.getByText('System Health')).toBeInTheDocument();
  });
});

// Integration tests for admin workflow
describe('AdminDashboard Integration', () => {
  it('completes full admin workflow', async () => {
    const props = {
      tenantId: 'malmo-stad',
      tenantName: 'Malmö Stad',
      userRole: 'tenant_admin' as const
    };

    render(
      <TestWrapper>
        <AdminDashboard {...props} />
      </TestWrapper>
    );

    // 1. Verify dashboard loads
    expect(screen.getByText('Admin Dashboard')).toBeInTheDocument();

    // 2. Check analytics data
    expect(screen.getByText('Total Users')).toBeInTheDocument();

    // 3. Navigate to game management
    fireEvent.click(screen.getByText('Game Management'));
    
    await waitFor(() => {
      expect(screen.getByText('Active Games')).toBeInTheDocument();
    });

    // 4. Verify game table displays
    expect(screen.getByText('GDPR Training - Malmö')).toBeInTheDocument();

    // 5. Check action buttons are available
    expect(screen.getAllByText('View')).toHaveLength(3); // 3 games in mock data
  });

  it('handles different user roles appropriately', () => {
    const roles = ['super_admin', 'tenant_admin', 'content_manager'] as const;

    roles.forEach(role => {
      const { unmount } = render(
        <TestWrapper>
          <AdminDashboard
            tenantId="test"
            tenantName="Test"
            userRole={role}
          />
        </TestWrapper>
      );

      // Each role should see appropriate interface
      expect(screen.getByText('Admin Dashboard')).toBeInTheDocument();

      if (role === 'content_manager') {
        expect(screen.queryByText('Analytics Overview')).not.toBeInTheDocument();
      } else {
        expect(screen.getByText('Analytics Overview')).toBeInTheDocument();
      }

      if (role === 'super_admin') {
        expect(screen.getByText('System Health')).toBeInTheDocument();
      }

      unmount();
    });
  });
});