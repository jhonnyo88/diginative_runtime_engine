import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

// Simple integration test for AdminDashboard
describe('AdminDashboard Integration Test', () => {
  // Mock all Chakra components to avoid import issues
  vi.mock('@chakra-ui/react', () => ({
    Box: ({ children, ...props }: any) => <div data-testid="box" {...props}>{children}</div>,
    VStack: ({ children, ...props }: any) => <div data-testid="vstack" {...props}>{children}</div>,
    HStack: ({ children, ...props }: any) => <div data-testid="hstack" {...props}>{children}</div>,
    Text: ({ children, ...props }: any) => <span data-testid="text" {...props}>{children}</span>,
    Button: ({ children, ...props }: any) => <button data-testid="button" {...props}>{children}</button>,
    Card: ({ children, ...props }: any) => <div data-testid="card" {...props}>{children}</div>,
    CardBody: ({ children, ...props }: any) => <div data-testid="card-body" {...props}>{children}</div>,
    CardHeader: ({ children, ...props }: any) => <div data-testid="card-header" {...props}>{children}</div>,
    SimpleGrid: ({ children, ...props }: any) => <div data-testid="simple-grid" {...props}>{children}</div>,
    Stat: ({ children, ...props }: any) => <div data-testid="stat" {...props}>{children}</div>,
    StatLabel: ({ children, ...props }: any) => <div data-testid="stat-label" {...props}>{children}</div>,
    StatNumber: ({ children, ...props }: any) => <div data-testid="stat-number" {...props}>{children}</div>,
    StatHelpText: ({ children, ...props }: any) => <div data-testid="stat-help-text" {...props}>{children}</div>,
    StatArrow: ({ type, ...props }: any) => <span data-testid="stat-arrow" data-type={type} {...props}></span>,
    Progress: ({ value, ...props }: any) => <div data-testid="progress" data-value={value} {...props}></div>,
    Badge: ({ children, ...props }: any) => <span data-testid="badge" {...props}>{children}</span>,
    Table: ({ children, ...props }: any) => <table data-testid="table" {...props}>{children}</table>,
    Thead: ({ children, ...props }: any) => <thead data-testid="thead" {...props}>{children}</thead>,
    Tbody: ({ children, ...props }: any) => <tbody data-testid="tbody" {...props}>{children}</tbody>,
    Tr: ({ children, ...props }: any) => <tr data-testid="tr" {...props}>{children}</tr>,
    Th: ({ children, ...props }: any) => <th data-testid="th" {...props}>{children}</th>,
    Td: ({ children, ...props }: any) => <td data-testid="td" {...props}>{children}</td>,
    Avatar: ({ name, ...props }: any) => <div data-testid="avatar" data-name={name} {...props}></div>,
    Menu: ({ children, ...props }: any) => <div data-testid="menu" {...props}>{children}</div>,
    MenuButton: ({ children, ...props }: any) => <button data-testid="menu-button" {...props}>{children}</button>,
    MenuList: ({ children, ...props }: any) => <div data-testid="menu-list" {...props}>{children}</div>,
    MenuItem: ({ children, ...props }: any) => <div data-testid="menu-item" {...props}>{children}</div>,
    Alert: ({ children, ...props }: any) => <div data-testid="alert" {...props}>{children}</div>,
    Tabs: ({ children, ...props }: any) => <div data-testid="tabs" {...props}>{children}</div>,
    TabList: ({ children, ...props }: any) => <div data-testid="tab-list" {...props}>{children}</div>,
    TabPanels: ({ children, ...props }: any) => <div data-testid="tab-panels" {...props}>{children}</div>,
    Tab: ({ children, ...props }: any) => <button data-testid="tab" {...props}>{children}</button>,
    TabPanel: ({ children, ...props }: any) => <div data-testid="tab-panel" {...props}>{children}</div>,
  }));

  vi.mock('@chakra-ui/icons', () => ({
    InfoIcon: (props: any) => <span data-testid="info-icon" {...props}></span>,
  }));

  it('renders basic dashboard structure', async () => {
    // Dynamic import to avoid module resolution issues
    const { AdminDashboard } = await import('../components/admin/AdminDashboard');
    
    const props = {
      tenantId: 'test-tenant',
      tenantName: 'Test Municipality',
      userRole: 'tenant_admin' as const
    };

    render(<AdminDashboard {...props} />);

    // Verify basic structure renders
    expect(screen.getByTestId('box')).toBeInTheDocument();
    expect(screen.getByText('Admin Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Test Municipality')).toBeInTheDocument();
  });

  it('shows different content for different user roles', async () => {
    const { AdminDashboard } = await import('../components/admin/AdminDashboard');
    
    const { rerender } = render(
      <AdminDashboard 
        tenantId="test" 
        tenantName="Test" 
        userRole="content_manager" 
      />
    );

    // Content manager should see Create New Game button
    expect(screen.getByText('Create New Game')).toBeInTheDocument();

    // Rerender as super admin
    rerender(
      <AdminDashboard 
        tenantId="test" 
        tenantName="Test" 
        userRole="super_admin" 
      />
    );

    // Super admin should see system health tab
    expect(screen.getByText('System Health')).toBeInTheDocument();
  });

  it('displays mock data correctly', async () => {
    const { AdminDashboard } = await import('../components/admin/AdminDashboard');
    
    render(
      <AdminDashboard 
        tenantId="test" 
        tenantName="Test" 
        userRole="tenant_admin" 
      />
    );

    // Check for analytics metrics
    expect(screen.getByText('Total Users')).toBeInTheDocument();
    expect(screen.getByText('Active Games')).toBeInTheDocument();
    expect(screen.getByText('Completion Rate')).toBeInTheDocument();
    
    // Check for game names in mock data
    expect(screen.getByText('GDPR Training - Malmö')).toBeInTheDocument();
    expect(screen.getByText('Workplace Safety')).toBeInTheDocument();
  });
});