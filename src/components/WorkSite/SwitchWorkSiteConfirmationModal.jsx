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

export default function SwitchWorkSiteConfirmationModal({
  buttonLoading,
  switchWorkSite,
  selectedSwitchWorkSite,
  onClose,
  isOpen,
}) {
  function handleCloseModal() {
    onClose();
  }
  return (
    <>
      <Modal
        closeOnOverlayClick={!buttonLoading}
        isOpen={isOpen}
        onClose={handleCloseModal}
        isCentered
        closeOnEsc={!buttonLoading}
      >
        <ModalOverlay />
        <ModalContent bg={"white"} minW={"500px"}>
          <ModalHeader
            display={"flex"}
            gap={"10px"}
            alignItems={"center"}
            color={"#dc143c"}
          >
            Switch worksite?
          </ModalHeader>
          <ModalCloseButton isDisabled={buttonLoading} color={"black"} />
          <Divider m={0} />

          <ModalBody>
            <Flex flexDir={"column"}>
              <Flex fontWeight={700}>
                Are you sure you want to switch to this worksite?
              </Flex>
              <Flex fontSize={"14px"} color={"#848484"}>
                When you switch worksites, work orders, equipment/machines , and
                other site-specific data will automatically adjust based on your
                site.
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
              onClick={handleCloseModal}
            >
              Cancel
            </Button>
            <Button
              isLoading={buttonLoading}
              _hover={{ background: "#b51031" }}
              background={"#dc143c"}
              color={"white"}
              onClick={() => {
                switchWorkSite(selectedSwitchWorkSite);
              }}
            >
              Confirm
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}
