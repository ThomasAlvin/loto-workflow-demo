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
  useDisclosure,
} from "@chakra-ui/react";
import { TiWarning } from "react-icons/ti";
import { api } from "../../api/api";
import Swal from "sweetalert2";
import { useState } from "react";

export default function AbortStepModal({
  abortStep,
  stepDetails,
  abortStepButtonLoading,
  abortStepDisclosure,
}) {
  return (
    <>
      <Modal
        closeOnOverlayClick={!abortStepButtonLoading}
        isOpen={abortStepDisclosure.isOpen}
        onClose={abortStepDisclosure.onClose}
        isCentered
      >
        <ModalOverlay />
        <ModalContent bg={"white"} overflow={"auto"}>
          <ModalHeader
            display={"flex"}
            gap={"10px"}
            alignItems={"center"}
            color={"#dc143c"}
          >
            <Flex>Abort Step?</Flex>
          </ModalHeader>
          <ModalCloseButton
            isDisabled={abortStepButtonLoading}
            color={"black"}
          />
          <Divider m={0} />

          <ModalBody>
            <Flex flexDir={"column"} gap={"10px"}>
              <Flex flexDir={"column"}>
                <Box fontWeight={700} as="span" flex="1" textAlign="left">
                  Are you sure you want to abort this step?
                </Box>
                <Flex fontSize={"14px"} color={"#848484"}>
                  This will mark the step as aborted and would be skipped
                </Flex>
              </Flex>
            </Flex>
          </ModalBody>
          <Divider m={0} />
          <ModalFooter gap={"10px"} w={"100%"} justifyContent={"end"}>
            <Button
              isLoading={abortStepButtonLoading}
              _hover={{ background: "#dc143c", color: "white" }}
              background={"white"}
              border={"1px solid #dc143c"}
              color={"#dc143c"}
              onClick={abortStepDisclosure.onClose}
            >
              Cancel
            </Button>
            <Button
              isLoading={abortStepButtonLoading}
              _hover={{ background: "#b51031" }}
              background={"#dc143c"}
              color={"white"}
              onClick={() =>
                abortStep(stepDetails.UID, abortStepDisclosure.onClose)
              }
            >
              Confirm
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}
