import { createContext, useContext, useState, useEffect } from "react";

const PermissionContext = createContext();

export const PermissionProvider = ({ children }) => {
  const [permissions, setPermissions] = useState({});
  const hasPermission = (module, permission) => {
    const modulePermissions = permissions.find((perm) => perm.name === module);
    return modulePermissions?.permissions.some(
      (perm) => perm.name === permission,
    );
  };
  return (
    <PermissionContext.Provider
      value={{ permissions, setPermissions, hasPermission }}
    >
      {children}
    </PermissionContext.Provider>
  );
};

export const usePermissions = () => useContext(PermissionContext);
