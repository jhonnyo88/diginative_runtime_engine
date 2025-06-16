import React, { useState } from 'react';
import { AdminAuth } from './AdminAuth';
import { AdminDashboard } from './AdminDashboard';

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: 'super_admin' | 'tenant_admin' | 'content_manager';
  tenantId: string;
  tenantName: string;
  permissions: string[];
}

export const AdminApp: React.FC = () => {
  const [user, setUser] = useState<AdminUser | null>(null);

  const handleAuthenticated = (authenticatedUser: AdminUser) => {
    setUser(authenticatedUser);
  };

  const handleLogout = () => {
    setUser(null);
  };

  if (!user) {
    return <AdminAuth onAuthenticated={handleAuthenticated} />;
  }

  return (
    <AdminDashboard
      tenantId={user.tenantId}
      tenantName={user.tenantName}
      userRole={user.role}
    />
  );
};