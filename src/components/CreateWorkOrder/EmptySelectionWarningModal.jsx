import {
  Box,
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

import { IoMdCheckmark, IoMdClose } from "react-icons/io";
import { useNavigate } from "react-router-dom";
import { IoWarning } from "react-icons/io5";

export default function EmptySelectionWarningModal({
  emptySelectionWarningModal,
  selectionErrors,
}) {
  const memberError = selectionErrors?.member;
  const machineError = selectionErrors?.machine;
  const lockError = selectionErrors?.lock;
  const nav = useNavigate();
  return (
    <>
      <Modal
        closeOnOverlayClick={false}
        isOpen={emptySelectionWarningModal.isOpen}
        onClose={emptySelectionWarningModal.onClose}
        isCentered
      >
        <ModalOverlay />
        <ModalContent maxW={"500px"} bg={"white"} overflow={"auto"}>
          <ModalHeader
            display={"flex"}
            gap={"10px"}
            alignItems={"center"}
            color={"#dc143c"}
          >
            <Flex alignItems={"center"} gap={"5px"}>
              <Flex fontSize={"24px"}>
                <IoWarning />
              </Flex>
              <Flex>Warning!</Flex>
            </Flex>
          </ModalHeader>
          <ModalCloseButton color={"black"} />
          <Divider m={0} />

          <ModalBody>
            <Flex flexDir={"column"} gap={"10px"}>
              <Flex flexDir={"column"} gap={"10px"}>
                <Box fontWeight={700} as="span" flex="1" textAlign="left">
                  The following items are needed to fully create a work order:
                </Box>
                <Flex fontWeight={700} flexDir={"column"} gap={"10px"}>
                  <Flex
                    justify={"space-between"}
                    fontSize={"14px"}
                    color={memberError ? "#dc143c" : "#3D9666"}
                    gap={"10px"}
                  >
                    <Flex>- &nbsp;Atleast 1 member</Flex>
                    <Flex fontSize={"20px"}>
                      {memberError ? <IoMdClose /> : <IoMdCheckmark />}
                    </Flex>
                  </Flex>
                  <Flex
                    justify={"space-between"}
                    fontSize={"14px"}
                    color={machineError ? "#dc143c" : "#3D9666"}
                    gap={"10px"}
                  >
                    <Flex>
                      - &nbsp;Atleast 1 machine with a category and inspection
                      form
                    </Flex>
                    <Flex fontSize={"20px"}>
                      {machineError ? <IoMdClose /> : <IoMdCheckmark />}
                    </Flex>
                  </Flex>
                  <Flex
                    justify={"space-between"}
                    fontSize={"14px"}
                    color={lockError ? "#dc143c" : "#3D9666"}
                    gap={"10px"}
                  >
                    <Flex>- &nbsp;Atleast 1 available lock</Flex>
                    <Flex fontSize={"20px"}>
                      {lockError ? <IoMdClose /> : <IoMdCheckmark />}
                    </Flex>
                  </Flex>
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
              onClick={emptySelectionWarningModal.onClose}
            >
              Proceed anyway
            </Button>
            <Button
              _hover={{ background: "#b51031" }}
              background={"#dc143c"}
              color={"white"}
              onClick={() => {
                nav("/work-order");
              }}
            >
              Go back
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}
