import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import { useDisclosure } from "@chakra-ui/react";

const DeleteContext = createContext(null);

export function DeleteMultiLockAccessProvider({ children }) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [modalDetails, setModalDetails] = useState({
    header: "",
    header2: "",
    body: "",
    confirmationLabel: "",
  });

  const openDeleteConfirm = useCallback((deleteData, modalData) => {
    setDeleteTarget(deleteData);
    setModalDetails(modalData);
    onOpen(); // open modal
  }, []);

  const closeDeleteConfirm = useCallback(() => {
    setDeleteTarget(null);
    onClose(); // close modal
  }, []);

  const value = useMemo(
    () => ({
      isOpen,
      deleteTarget,
      openDeleteConfirm,
      closeDeleteConfirm,
      modalDetails,
    }),
    [isOpen, deleteTarget, modalDetails, openDeleteConfirm, closeDeleteConfirm],
  );
  return (
    <DeleteContext.Provider value={value}>{children}</DeleteContext.Provider>
  );
}

export function useDeleteContext() {
  return useContext(DeleteContext);
}
