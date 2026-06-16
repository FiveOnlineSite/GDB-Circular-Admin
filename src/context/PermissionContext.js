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

      if (action === undefined) {
        if (moduleOrPerm.includes(".")) {
          return permissions.some((perm) => perm.name === moduleOrPerm);
        }
        // Check if user has any permission in this module
        const searchMod = moduleOrPerm === "users" ? "users" : (moduleOrPerm === "roles" ? "roles" : moduleOrPerm);
        return permissions.some(
          (perm) => 
            perm.module === searchMod || 
            perm.name.startsWith(searchMod + ".") ||
            (searchMod === "users" && (perm.module === "user" || perm.name.startsWith("user."))) ||
            (searchMod === "roles" && (perm.module === "role" || perm.name.startsWith("role.")))
        );
      }

      let searchModule = moduleOrPerm;
      let searchAction = action;

      if (searchModule === "users") searchModule = "user";
      if (searchModule === "roles") searchModule = "role";
      
      // Map view -> read only for user/users module
      if (searchAction === "view" && (searchModule === "user" || searchModule === "users")) {
        searchAction = "read";
      }

      return permissions.some((perm) => {
        // Match exact name, e.g. "facilities.view" or "user.read"
        const targetName1 = `${searchModule}.${searchAction}`;
        if (perm.name === targetName1) return true;

        // Match normalized module and action
        const normPermModule = perm.module === "user" ? "users" : (perm.module === "role" ? "roles" : perm.module);
        const normSearchModule = moduleOrPerm === "user" ? "users" : (moduleOrPerm === "role" ? "roles" : moduleOrPerm);
        if (normPermModule === normSearchModule && perm.action === searchAction) {
          return true;
        }

        return false;
      });
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
