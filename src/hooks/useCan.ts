import { useContext } from "react";
import { AuthContext } from "../contexts/AuthContext";

type UseCanParams = {
  permissions?: string[];
  roles?: string[];
}

export function useCan({ permissions = [], roles = [] }: UseCanParams) {
  const { user, isAuthenticated } = useContext(AuthContext);

  if (!isAuthenticated) return false;

  if (!!permissions.length) {
    const hasAllPermissions = permissions.every(permission => user.permissions.includes(permission));

    if (!hasAllPermissions) return false;
  }

  if (!!roles.length) {
    const hasAllRoles = permissions.some(role => user.roles.includes(role));

    if (!hasAllRoles) return false;
  }

  return true;
}
