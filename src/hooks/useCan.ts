import { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { validateUserPermissions } from '../shared/commons/validateUserPermissions';

type UseCanParams = {
  permissions?: string[];
  roles?: string[];
}

export function useCan({ permissions = [], roles = [] }: UseCanParams) {
  const { user, isAuthenticated } = useContext(AuthContext);

  if (!isAuthenticated) return false;

  const userHasPermissions = validateUserPermissions({
    user,
    permissions,
    roles 
  });

  return userHasPermissions;
}
