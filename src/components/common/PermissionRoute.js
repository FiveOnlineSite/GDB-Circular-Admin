import React from 'react';
import usePermission from '../../hooks/usePermission';
import { useAuth } from '../../context/AuthContext';
import { ShieldOff } from 'lucide-react';

/**
 * ================================================
 * PERMISSION ROUTE
 * Wraps a route and shows an Access Denied screen
 * if the user lacks the required permission.
 * forbiddenRoles: optional array of role_ids that are blocked
 * regardless of hasPermission (e.g. super admin for builder-only actions).
 * ================================================
 */
const PermissionRoute = ({ module, action = 'view', forbiddenRoles = [], children }) => {
  const { hasPermission, loading } = usePermission(module, action);
  const { user } = useAuth();
  const roleId = Number(user?.role_id);

  const denied =
    (!loading && !hasPermission) ||
    (forbiddenRoles.length > 0 && forbiddenRoles.includes(roleId));

  if (loading && !forbiddenRoles.includes(roleId)) {
    return (
      <div className='flex items-center justify-center h-full min-h-[400px]'>
        <div className='w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto' />
      </div>
    );
  }

  if (denied) {
    return (
      <div className='flex items-center justify-center h-full min-h-[400px] bg-gray-50 rounded-lg'>
        <div className='text-center p-8 bg-white rounded-xl shadow-sm border border-gray-200 max-w-md'>
          <div className='w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4'>
            <ShieldOff className='h-8 w-8' />
          </div>
          <h2 className='text-xl font-bold text-gray-900 mb-2'>Access Denied</h2>
          <p className='text-gray-500'>
            You do not have permission to view this page. Please navigate to a
            different section using the menu.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default PermissionRoute;
