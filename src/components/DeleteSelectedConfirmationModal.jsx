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
import { FaRegTrashAlt } from "react-icons/fa";
import { useSelector } from "react-redux";
import checkHasPermission from "../utils/checkHasPermission";

export default function DeleteSelectedConfirmationModal({
  variant,
  deleteSelectedFunction,
  pageModule,
  selectedCount,
  deleteSelectedButtonLoading,
  deleteSelectedDisclosure,
}) {
  const userSelector = useSelector((state) => state.login.auth);

  return (
    <>
      <Button
        isDisabled={
          pageModule
            ? !checkHasPermission(userSelector, pageModule, [
                "manage",
                "manage_admin",
                "manage_member",
                "manage_finance",
              ])
            : false
        }
        isLoading={deleteSelectedButtonLoading}
        onClick={deleteSelectedDisclosure.onOpen}
        alignItems={"center"}
        gap={"5px"}
        size="sm"
        colorScheme="red"
      >
        <Flex fontSize={"20px"}>
          <FaRegTrashAlt />
        </Flex>
        <Flex>Delete All</Flex>
      </Button>
      {/* <Button
        onClick={onOpen}
        gap={"5px"}
        fontSize={"14px"}
        bg={"#dc143c"}
        color={"white"}
        h={"auto"}
        p={"6px 12px"}
        alignItems={"center"}
      >
        <Flex fontSize={"18px"}>
          <RiDraftLine />
        </Flex>
        <Flex>Save as draft</Flex>
      </Button> */}

      <Modal
        closeOnOverlayClick={!deleteSelectedButtonLoading}
        isOpen={deleteSelectedDisclosure.isOpen}
        onClose={deleteSelectedDisclosure.onClose}
        isCentered
        closeOnEsc={!deleteSelectedButtonLoading}
      >
        <ModalOverlay />
        <ModalContent maxW={"500px"} bg={"white"} overflow={"auto"}>
          <ModalHeader
            display={"flex"}
            gap={"10px"}
            alignItems={"center"}
            color={"#dc143c"}
          >
            <Flex flexDir={"column"}>
              <Flex>Delete all selected?</Flex>
              <Box
                fontWeight={700}
                color={"#848484"}
                fontSize={"16px"}
                as="span"
                flex="1"
                textAlign="left"
              ></Box>
            </Flex>
          </ModalHeader>
          <ModalCloseButton
            isDisabled={deleteSelectedButtonLoading}
            color={"black"}
          />
          <Divider m={0} />

          <ModalBody>
            <Flex flexDir={"column"} gap={"10px"}>
              <Flex flexDir={"column"}>
                <Box fontWeight={700} as="span" flex="1" textAlign="left">
                  Are you sure you want to delete the {selectedCount} selected{" "}
                  {variant}?{" "}
                </Box>
                <Flex fontSize={"14px"} color={"#848484"}>
                  deleting these {variant} is permanent and cannot be undone.
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
              onClick={deleteSelectedDisclosure.onClose}
              isLoading={deleteSelectedButtonLoading}
            >
              Cancel
            </Button>
            <Button
              _hover={{ background: "#b51031" }}
              background={"#dc143c"}
              color={"white"}
              onClick={() => {
                deleteSelectedFunction();
              }}
              isLoading={deleteSelectedButtonLoading}
            >
              Delete
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}
