import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { useAuth } from "./AuthContext";
import api from "../lib/utils/apiConfig";

const PermissionContext = createContext();

const modulePermissionPrefixes = {
  users: ["user"],
  user: ["user"],
  roles: ["role"],
  role: ["role"],
  globalContent: ["global"],
  homepage: ["homepage"],
  product: ["product"],
  about: ["about"],
  facilities: ["facilities"],
  team: ["team"],
  sellers: ["seller"],
  seller: ["seller"],
  news: ["news"],
  settings: ["media"],
};

const getPermissionNames = (moduleOrPerm, action) => {
  if (action === undefined) {
    return [moduleOrPerm];
  }

  const prefixes = modulePermissionPrefixes[moduleOrPerm] || [moduleOrPerm];
  const actions = action === "view" && (moduleOrPerm === "users" || moduleOrPerm === "user" || moduleOrPerm === "roles" || moduleOrPerm === "role")
    ? ["read"]
    : [action];

  return prefixes.flatMap((prefix) => actions.map((item) => `${prefix}.${item}`));
};

export const usePermissionContext = () => {
  const context = useContext(PermissionContext);
  if (!context) {
    throw new Error(
      "usePermissionContext must be used within PermissionProvider",
    );
  }
  return context;
};

export const PermissionProvider = ({ children }) => {
  const { user } = useAuth();
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPermissions = useCallback(async () => {
    if (!user) {
      setPermissions([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await api.get("/role-permissions/me/permissions");
      if (response.data && response.data.success) {
        // Parse permissions into { action, module } format for easier checking
        const rawPermissions = response.data.data || [];
        const parsedPermissions = rawPermissions.map((perm) => {
          const nameParts = perm.name.split(".");
          const action = nameParts[nameParts.length - 1];
          let module = perm.module || nameParts[0];

          if (module === "user") module = "users";
          if (module === "role" || module === "role-permissions") module = "roles";

          return {
            ...perm,
            action,
            module,
          };
        });
        setPermissions(parsedPermissions);
      }
    } catch (error) {
      console.error("Error fetching permissions:", error);
      setPermissions([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchPermissions();
  }, [fetchPermissions]);

  const hasPermission = useCallback(
    (moduleOrPerm, action) => {
      const roleId = Number(user?.role_id);
      // SuperAdmin (1) always has all permissions
      if (roleId === 1) {
        return true;
      }

      const permissionNames = getPermissionNames(moduleOrPerm, action);
      if (action === undefined && !moduleOrPerm.includes(".")) {
        const prefixes = modulePermissionPrefixes[moduleOrPerm] || [moduleOrPerm];
        return permissions.some((perm) =>
          prefixes.some((prefix) => perm.name.startsWith(`${prefix}.`))
        );
      }

      return permissions.some((perm) => permissionNames.includes(perm.name));
    },
    [user, permissions],
  );

  const value = {
    permissions,
    loading,
    hasPermission,
    refreshPermissions: fetchPermissions,
  };

  return (
    <PermissionContext.Provider value={value}>
      {children}
    </PermissionContext.Provider>
  );
};
