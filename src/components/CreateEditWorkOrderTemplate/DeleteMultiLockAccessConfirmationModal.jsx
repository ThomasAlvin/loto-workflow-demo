import {
  Button,
  Divider,
  Flex,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
} from "@chakra-ui/react";
import { IoMdWarning } from "react-icons/io";
import { useDeleteContext } from "../../service/DeleteMultiLockAccessContext";
import { ActionsContext } from "../../service/FlowProvider";
import { useContext } from "react";

export default function DeleteMultiLockAccessConfirmationModal() {
  const actionsRef = useContext(ActionsContext);
  const { deleteStep } = actionsRef.current;
  const { isOpen, deleteTarget, closeDeleteConfirm, modalDetails } =
    useDeleteContext();
  function deleteIndexes() {
    closeDeleteConfirm();
    deleteStep(deleteTarget);
  }

  return (
    <Modal
      blockScrollOnMount={false}
      trapFocus={false}
      returnFocusOnClose={false}
      isOpen={isOpen}
      onClose={closeDeleteConfirm}
      isCentered
    >
      <ModalOverlay />
      <ModalContent maxW={"500px"} bg={"white"}>
        <ModalHeader
          display={"flex"}
          gap={"10px"}
          alignItems={"center"}
          color={"#dc143c"}
        >
          <IoMdWarning /> {modalDetails.header}
        </ModalHeader>
        <ModalCloseButton color={"black"} />
        <Divider m={0} />

        <ModalBody>
          <Flex flexDir={"column"} gap={"10px"}>
            <Flex flexDir={"column"}>
              <Flex fontWeight={700} flexDir={"column"}>
                <Flex>{modalDetails.header2}</Flex>
              </Flex>

              <Flex fontSize={"16px"} color={"#848484"}>
                {modalDetails.body}
              </Flex>
            </Flex>
          </Flex>
        </ModalBody>
        <Divider m={0} />
        <ModalFooter gap={"10px"} w={"100%"} justifyContent={"end"}>
          <Button
            _hover={{ background: "#dc143c", color: "white" }}
            background={"white"}
            border={"1px solid #dc143c"}
            color={"#dc143c"}
            onClick={closeDeleteConfirm}
          >
            Cancel
          </Button>
          <Button
            _hover={{ background: "#b51031" }}
            background={"#dc143c"}
            color={"white"}
            onClick={deleteIndexes}
          >
            {modalDetails.confirmationLabel}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
