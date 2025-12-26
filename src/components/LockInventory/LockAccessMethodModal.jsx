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
  useDisclosure,
} from "@chakra-ui/react";

import { FaPlus } from "react-icons/fa";

export default function LockAccessMethodModal({ lockInput }) {
  const { isOpen, onClose, onOpen } = useDisclosure();
  return (
    <>
      <Flex fontSize={"14px"}>
        <Flex
          gap={"10px"}
          cursor={"pointer"}
          color={"#dc143c"}
          alignItems={"center"}
          onClick={onOpen}
        >
          <FaPlus />
          <Flex>Add New Method</Flex>
        </Flex>
      </Flex>
      <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay />
        <ModalContent
          maxW={"700px"}
          maxH={"90vh"}
          overflow={"auto"}
          bg={"white"}
        >
          <ModalHeader
            display={"flex"}
            gap={"10px"}
            alignItems={"center"}
            color={"#dc143c"}
          >
            Add new method
          </ModalHeader>
          <ModalCloseButton
            //   isDisabled={removeButtonLoading}
            color={"black"}
          />
          <Divider m={0} />

          <ModalBody p={0}></ModalBody>
          <Divider m={0} borderColor={"#bababa"} />
          <ModalFooter p={"20px"} w={"100%"} justifyContent={"center"}>
            <Flex w={"100%"} justify={"end"}>
              <Button
                background={"#dc143c"}
                h={"32px"}
                color={"white"}
                gap={"10px"}
                alignItems={"center"}
                onClick={onClose}
              >
                <Flex>Close</Flex>
              </Button>
            </Flex>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}
