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

export default function SendReminderModal({
  sendReminder,
  sendReminderButtonLoading,
  sendReminderDisclosure,
  selectedSendReminderMember,
}) {
  return (
    <>
      <Modal
        returnFocusOnClose={false}
        closeOnOverlayClick={!sendReminderButtonLoading}
        isOpen={sendReminderDisclosure.isOpen}
        onClose={sendReminderDisclosure.onClose}
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
            <Flex
              onClick={() => {
                console.log(selectedSendReminderMember);
              }}
            >
              Send Reminder?
            </Flex>
          </ModalHeader>
          <ModalCloseButton
            isDisabled={sendReminderButtonLoading}
            color={"black"}
          />
          <Divider m={0} />

          <ModalBody>
            <Flex flexDir={"column"} gap={"10px"}>
              <Flex flexDir={"column"}>
                <Box fontWeight={700} as="span" flex="1" textAlign="left">
                  Are you sure you want to send a reminder to this user?
                </Box>
                <Flex fontSize={"14px"} color={"#848484"}>
                  This will send a notification to the user
                </Flex>
              </Flex>
            </Flex>
          </ModalBody>
          <Divider m={0} />
          <ModalFooter gap={"10px"} w={"100%"} justifyContent={"end"}>
            <Button
              isLoading={sendReminderButtonLoading}
              _hover={{ background: "#dc143c", color: "white" }}
              background={"white"}
              border={"1px solid #dc143c"}
              color={"#dc143c"}
              onClick={sendReminderDisclosure.onClose}
            >
              Cancel
            </Button>
            <Button
              isLoading={sendReminderButtonLoading}
              _hover={{ background: "#b51031" }}
              background={"#dc143c"}
              color={"white"}
              onClick={() =>
                sendReminder(
                  selectedSendReminderMember.memberUID ||
                    selectedSendReminderMember.UID,
                  selectedSendReminderMember.reminderRole,
                )
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
