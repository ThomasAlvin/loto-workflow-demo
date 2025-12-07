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
  Tooltip,
} from "@chakra-ui/react";
import { ImCheckmark } from "react-icons/im";

export default function ConfirmSubmitWorkOrderStepModal({
  hasNotify,
  confirmSubmitWorkOrderStepDisclosure,
  setOpenMachineInspectionFormIndexes,
  setOpenMachineIndexes,
  setSubmitScope,
  submitWorkOrderStep,
  handleSubmit,
  workOrderStep,
  buttonLoading,
}) {
  function handleCloseModal() {
    confirmSubmitWorkOrderStepDisclosure.onClose();
  }
  return (
    <>
      {/* <Tooltip
        placement="top"
        label="All steps must be assigned!"
        color="white"
        bg={"#dc143c"}
      > */}
      <Button
        _hover={{ background: "#b51031" }}
        w={"auto"}
        // _focus={{}}
        alignItems={"center"}
        // onClick={handleSubmit(confirmSubmitWorkOrderStepDisclosure.onOpen)}
        onClick={handleSubmit(
          confirmSubmitWorkOrderStepDisclosure.onOpen,
          () => {
            setSubmitScope(null);
            setOpenMachineIndexes(
              workOrderStep?.work_order_step_machines?.map((_, index) => index),
            );
            setOpenMachineInspectionFormIndexes(
              workOrderStep?.work_order_step_machines?.map(
                (machine, machineIndex) => {
                  return machine.selected_inspection_forms.map(
                    (inspectionForm, inspectionFormIndex) => {
                      return inspectionFormIndex;
                    },
                  );
                },
              ),
            );
          },
        )}
        gap={"10px"}
        background={"#dc143c"}
        color={"white"}
      >
        <Flex>
          <ImCheckmark />
        </Flex>
        <Flex>Complete Step {hasNotify ? "& Notify" : ""}</Flex>
      </Button>
      {/* </Tooltip> */}
      <Modal
        closeOnOverlayClick={!buttonLoading}
        isOpen={confirmSubmitWorkOrderStepDisclosure.isOpen}
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
            Confirm Step Submission
          </ModalHeader>
          <ModalCloseButton isDisabled={buttonLoading} color={"black"} />
          <Divider m={0} />

          <ModalBody>
            <Flex flexDir={"column"}>
              <Flex fontWeight={700}>
                Are you sure you want to submit this step?
              </Flex>
              <Flex fontSize={"14px"} color={"#848484"}>
                Once submitted, this action cannot be undone.
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
              onClick={() => submitWorkOrderStep(handleCloseModal)}
            >
              Confirm
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}
