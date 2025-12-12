import {
  Button,
  Divider,
  Flex,
  MenuItem,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  useDisclosure,
} from "@chakra-ui/react";
import { ImExit } from "react-icons/im";
import { useSelector } from "react-redux";

export default function LogoutConfirmationModal({
  buttonLoading,
  logoutFunction,
}) {
  const userSelector = useSelector((state) => state.login.auth);

  function handleCloseModal() {
    onClose();
  }
  const { isOpen, onOpen, onClose } = useDisclosure();
  return (
    <>
      <MenuItem onClick={onOpen}>
        <Flex gap={"10px"} alignItems={"center"}>
          <Flex>
            <ImExit />
          </Flex>
          <Flex>Logout</Flex>
        </Flex>
      </MenuItem>
      <Modal
        closeOnOverlayClick={false}
        isOpen={isOpen}
        onClose={onClose}
        isCentered
        closeOnEsc={!buttonLoading}
      >
        <ModalOverlay />
        <ModalContent bg={"white"}>
          <ModalHeader
            display={"flex"}
            gap={"10px"}
            alignItems={"center"}
            color={"#dc143c"}
            onClick={() => {
              console.log(userSelector);
            }}
          >
            Logout from account?
          </ModalHeader>
          <ModalCloseButton isDisabled={buttonLoading} color={"black"} />
          <Divider m={0} />

          <ModalBody>
            <Flex flexDir={"column"}>
              <Flex fontWeight={700}>
                Are you sure you want to log out of this account?
              </Flex>
              <Flex fontSize={"14px"} color={"#848484"}>
                Logging out will end your current session. You can log back in
                anytime.
              </Flex>
            </Flex>
          </ModalBody>
          <Divider m={0} />
          <ModalFooter gap={"10px"} w={"100%"} justifyContent={"end"}>
            <Button
              isLoading={buttonLoading}
              _hover={{ background: "#dc143c", color: "white" }}
              background={"white"}
              border={"1px solid #dc143c"}
              color={"#dc143c"}
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              isLoading={buttonLoading}
              _hover={{ background: "#b51031" }}
              background={"#dc143c"}
              color={"white"}
              onClick={logoutFunction}
            >
              Logout
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}
