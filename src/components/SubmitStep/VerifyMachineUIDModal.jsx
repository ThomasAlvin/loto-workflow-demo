import {
  Button,
  Collapse,
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
  useToast,
} from "@chakra-ui/react";
import { FaChevronDown } from "react-icons/fa6";
import { ImExit } from "react-icons/im";
import { IoIosLock } from "react-icons/io";
import { IoWarning } from "react-icons/io5";
import VerifyMachineDropdownMenu from "./VerifyMachineDropdownMenu";
import * as Yup from "yup";
import { useFormik } from "formik";
import { useEffect, useState } from "react";
import setAllFieldsTouched from "../../utils/SetAllFieldsTouched";
import Swal from "sweetalert2";
import SwalErrorMessages from "../SwalErrorMessages";
import { api } from "../../api/api";
import { useLocation, useNavigate } from "react-router-dom";

export default function VerifyMachineUIDModal({
  setValue,
  selectedVerifyMachine,
  isOpen,
  onClose,
}) {
  const toast = useToast();

  const [buttonLoading, setButtonLoading] = useState(false);
  const location = useLocation();
  const nav = useNavigate();
  function handleCloseModal() {
    onClose();
  }
  const formik = useFormik({
    initialValues: {
      machineUID: "",
      inputQrUID: "",
      inputUID: "",
    },
    validationSchema: Yup.object().shape({
      machineUID: Yup.string().required(), // real UID (hidden / predefined)
      inputQrUID: Yup.string(), // real UID (hidden / predefined)
      inputUID: Yup.string()
        .nullable()
        .test(
          "match-machine-uid",
          "Entered UID or scanned QR does not match the machine UID",
          function (value) {
            const { machineUID, inputQrUID } = this.parent;
            console.log(this);
            console.log(this.parent);
            console.log(machineUID);
            console.log(inputQrUID);
            console.log(value);

            if (value === machineUID || inputQrUID === machineUID) {
              return true;
            }

            if (!value)
              return this.createError({
                message: "Please enter the Equipment/Machine UID",
              });

            if (!machineUID)
              return this.createError({
                message: "Machine UID is missing",
              });

            return false;
          },
        ),
      inputQrUID: Yup.string()
        .nullable()
        .test(
          "match-machine-uid",
          "Scanned QR does not match the machine UID",
          function (value) {
            const { machineUID, inputUID } = this.parent;

            if (value === machineUID || inputUID === machineUID) {
              return true;
            }
            console.log(value);

            if (value === null)
              return this.createError({
                message:
                  "The file you submitted is not a valid QR code. Please try again.",
              });
            if (!value)
              return this.createError({
                message:
                  "Please select a qr code image of the Equipment/Machine",
              });

            if (!machineUID)
              return this.createError({
                message: "Machine UID is missing",
              });

            return false;
          },
        ),
    }),
    onSubmit: () => {
      verifyMachine();
      // submitEquipmentMachine();
    },
  });

  function getFieldPaths(obj, prefix = "") {
    let paths = [];
    for (const key in obj) {
      const value = obj[key];
      const path = prefix
        ? Array.isArray(obj)
          ? `${prefix}[${key}]`
          : `${prefix}.${key}`
        : key;
      if (value && typeof value === "object") {
        paths = paths.concat(getFieldPaths(value, path));
      } else {
        paths.push(path);
      }
    }

    return paths;
  }
  async function handleSubmit(e) {
    e.preventDefault();
    formik.setTouched(setAllFieldsTouched(formik.values));
    const errors = await formik.validateForm();
    const errorPaths = getFieldPaths(errors);
    console.log(errorPaths);

    if (errorPaths.length > 0) {
      // scrollToFirstError(errorPaths);
    } else {
      formik.handleSubmit();
    }
  }
  async function verifyMachine() {
    setValue(
      `workOrderStepMachines[${selectedVerifyMachine.stepMachinesCounterIndex}].isMachineVerified`,
      true,
      { shouldValidate: true },
    );
    onClose();
    // setButtonLoading(true);
  }
  useEffect(() => {
    formik.resetForm({
      values: {
        machineUID: selectedVerifyMachine.UID,
        inputUID: "",
        inputQrUID: "",
      },
    });
  }, [selectedVerifyMachine]);
  return (
    <>
      <Modal
        closeOnOverlayClick={false}
        isOpen={isOpen}
        onClose={handleCloseModal}
        isCentered
        autoFocus={false}
        scrollBehavior={"inside"}
        closeOnEsc={false}
      >
        <ModalOverlay />
        <ModalContent maxW={"700px"} bg={"white"}>
          <ModalHeader
            display={"flex"}
            gap={"10px"}
            alignItems={"center"}
            color={"#dc143c"}
          >
            <Flex
              onClick={() => {
                console.log(formik);
              }}
              alignItems={"center"}
              gap={"5px"}
            >
              <Flex fontSize={"24px"}>
                <IoWarning />
              </Flex>
              <Flex>Attention!</Flex>
            </Flex>
          </ModalHeader>
          {/* <ModalCloseButton isDisabled={buttonLoading} color={"black"} /> */}
          <Divider m={0} />

          <ModalBody py={"16px"}>
            <Flex flexDir={"column"} gap={"20px"}>
              <Flex flexDir={"column"}>
                <Flex
                  fontWeight={700}
                  fontSize={"20px"}
                  alignItems={"center"}
                  gap={"5px"}
                >
                  <Flex>Machine Verification</Flex>
                </Flex>
                <Flex fontSize={"14px"} color={"#848484"}>
                  Before proceeding, please provide the UID for the
                  machine—either by entering it manually or submitting the
                  machine's QR code.
                </Flex>
              </Flex>
              <Flex flexDir={"column"} gap={"20px"} w={"100%"}>
                <VerifyMachineDropdownMenu
                  formik={formik}
                  machine={selectedVerifyMachine}
                />
              </Flex>
            </Flex>
          </ModalBody>
          <Divider m={0} />
          <ModalFooter gap={"10px"} w={"100%"} justifyContent={"end"}>
            <Button
              w={"100px"}
              isLoading={buttonLoading}
              _hover={{ background: "#dc143c", color: "white" }}
              background={"white"}
              border={"1px solid #dc143c"}
              color={"#dc143c"}
              onClick={onClose}
            >
              Back
            </Button>
            <Button
              w={"100px"}
              isLoading={buttonLoading}
              _hover={{ background: "#b51031" }}
              background={"#dc143c"}
              color={"white"}
              onClick={handleSubmit}
            >
              Submit
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}
