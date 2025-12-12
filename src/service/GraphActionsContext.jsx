import { useRef, useEffect, createContext } from "react";

export const ActionsContext2 = createContext(null);

export default function GraphActionsProvider({ children, setNodes }) {
  const actionsRef = useRef({
    deleteStep: () => {},
  });

  // Assign your real delete logic ONCE
  useEffect(() => {
    actionsRef.current.deleteStep = (nodeId) => {
      setNodes((prev) => prev.filter((n) => n.id !== nodeId));
    };
  }, [setNodes]);

  return (
    <ActionsContext2.Provider value={actionsRef}>
      {children}
    </ActionsContext2.Provider>
  );
}
