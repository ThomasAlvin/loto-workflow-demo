import {
  Box,
  Button,
  Divider,
  Flex,
  Input,
  MenuItem,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Textarea,
  useDisclosure,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { v4 as uuid } from "uuid";
import CreatableSelect from "react-select/creatable";
import {
  FaFlag,
  FaMagnifyingGlass,
  FaPlus,
  FaTriangleExclamation,
} from "react-icons/fa6";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import { api } from "../../api/api";
import Swal from "sweetalert2";
import { useNavigate, useSearchParams } from "react-router-dom";
import { VscEmptyWindow } from "react-icons/vsc";
import SwalErrorMessages from "../SwalErrorMessages";
import CustomSelectionSelect from "../CustomSelectionSelect";
import { FiXCircle } from "react-icons/fi";
import { IoCloseSharp } from "react-icons/io5";
import { useFormik } from "formik";
import tinycolor from "tinycolor2";

export default function ReviewDetailsRejectModal({
  fetchReviewDetails,
  abortControllerRef,
  buttonLoading,
  setButtonLoading,
  workOrderReviewerUID,
  flaggedSteps,
}) {
  const nav = useNavigate();
  const { isOpen, onOpen, onClose } = useDisclosure();
  function inputHandler(event) {
    formik.setFieldValue("reason", event.target.value);
  }

  function handleCloseModal() {
    onClose();
    formik.resetForm();
  }
  const formik = useFormik({
    initialValues: { reason: "" },
    validationSchema: Yup.object().shape({
      reason: Yup.string()
        .trim()
        .required("Please enter a valid reason to proceed"),
    }),
    onSubmit: () => {
      onSubmit();
    },
  });
  async function onSubmit() {
    setButtonLoading(true);

    await api
      .post(`work-order/${workOrderReviewerUID}/review/reject`, {
        workOrderSteps: flaggedSteps,
        reason: formik.values.reason,
      })
      .then((response) => {
        Swal.fire({
          title: "Success!",
          text: response.data.message,
          icon: "success",
          customClass: {
            popup: "swal2-custom-popup",
            title: "swal2-custom-title",
            content: "swal2-custom-content",
            actions: "swal2-custom-actions",
            confirmButton: "swal2-custom-confirm-button",
          },
        });
        abortControllerRef.current.abort(); // Cancel any previous request
        abortControllerRef.current = new AbortController();
        fetchReviewDetails(true);
      })
      .catch((error) => {
        Swal.fire({
          title: "Oops...",
          // text: error.response.data.errors || "An error occurred",
          icon: "error",
          html: SwalErrorMessages(error.response.data.message),
          customClass: {
            popup: "swal2-custom-popup",
            title: "swal2-custom-title",
            content: "swal2-custom-content",
            actions: "swal2-custom-actions",
            confirmButton: "swal2-custom-confirm-button",
          },
        });
      })
      .finally(() => {
        setButtonLoading(false);
        handleCloseModal();
      });
  }
  return (
    <>
      <Button
        onClick={() => {
          onOpen();
        }}
        zIndex={"200"}
        _hover={{
          bg: tinycolor("#dc143c").darken(5).toString(),
        }}
        px={"20px"}
        bg={"#dc143c"}
        color={"white"}
        alignItems={"center"}
        gap={"10px"}
      >
        <FiXCircle fontSize={"20px"} />
        Reject Work Order
      </Button>
      <Modal
        closeOnOverlayClick={false}
        isOpen={isOpen}
        onClose={handleCloseModal}
        isCentered
        closeOnEsc={!buttonLoading}
      >
        <ModalOverlay />
        <ModalContent bg={"white"} maxW="60%" maxH={"90vh"} overflow={"auto"}>
          <ModalHeader
            py={"5px"}
            px={"16px"}
            display={"flex"}
            flexDir={"column"}
          >
            <Flex color={"crimson"}>Reject Work Order</Flex>
            <Flex
              textAlign={"center"}
              fontSize={"14px"}
              color={"#848484"}
              justifyContent={"space-between"}
            >
              <Flex>
                Please provide a clear summary explaining the rejection
              </Flex>
            </Flex>
          </ModalHeader>
          <ModalCloseButton isDisabled={buttonLoading} color={"black"} />
          <Divider m={0} />

          <ModalBody>
            <Flex flexDir={"column"} gap={"20px"}>
              <Flex position={"relative"} flexDir={"column"} gap={"10px"}>
                <Flex flexDir={"column"}>
                  <Flex fontWeight={700} alignItems={"center"} gap={"5px"}>
                    Steps Flagged as Problematic
                    <Flex color={"#dc143c"}>
                      <FaFlag />
                    </Flex>
                  </Flex>
                  <Flex
                    textAlign={"center"}
                    fontSize={"14px"}
                    color={"#848484"}
                    justifyContent={"space-between"}
                  >
                    <Flex>
                      You indicated that the following steps require
                      attention.{" "}
                    </Flex>
                  </Flex>
                </Flex>
                <Flex flexWrap={"wrap"} gap={"10px"}>
                  {flaggedSteps.length ? (
                    flaggedSteps.map((flaggedStep) => (
                      <Flex
                        alignItems={"center"}
                        gap={"3px"}
                        borderRadius={"full"}
                        px={"6px"}
                        py={"2px"}
                        fontSize={"12px"}
                        fontWeight={700}
                        border={"1px solid #dc143c"}
                        color={"#dc143c"}
                        bg={"#FDE2E2"}
                      >
                        <Flex>
                          {flaggedStep.workOrderStepIndex + 1}.{" "}
                          {flaggedStep.name}
                        </Flex>
                      </Flex>
                    ))
                  ) : (
                    <Flex
                      alignItems={"center"}
                      gap={"3px"}
                      borderRadius={"full"}
                      px={"6px"}
                      py={"2px"}
                      fontSize={"12px"}
                      fontWeight={700}
                      border={"1px solid #848484"}
                      color={"#848484"}
                      bg={"#ededed"}
                    >
                      <Flex>No steps selected</Flex>
                    </Flex>
                  )}
                </Flex>
              </Flex>
              <Flex position={"relative"} flexDir={"column"}>
                <Flex flexDir={"column"}>
                  <Box fontWeight={700} as="span" flex="1" textAlign="left">
                    Reason&nbsp;
                    <Box as="span" color={"#dc143c"}>
                      *
                    </Box>
                  </Box>
                  <Flex
                    textAlign={"center"}
                    fontSize={"14px"}
                    color={"#848484"}
                    justifyContent={"space-between"}
                  >
                    <Flex>
                      Provide a reason on the issues that led to this rejection.
                    </Flex>
                  </Flex>
                </Flex>
                <Flex flexDir={"column"}>
                  <Textarea
                    name="reason"
                    border={
                      formik.touched.reason && formik.errors.reason
                        ? "1px solid #dc143c"
                        : null
                    }
                    id="reason"
                    onChange={inputHandler}
                    onBlur={formik.handleBlur}
                    placeholder="Ex: Rejected due to issues in steps 2 and 4. Missing safety inspection and incomplete calibration log. Please address these before resubmitting."
                  />
                  {formik.touched.reason && formik.errors.reason && (
                    <Flex
                      color="crimson"
                      fontSize="14px"
                      gap="5px"
                      alignItems="center"
                    >
                      <FaTriangleExclamation />
                      <Flex>{formik.errors.reason}</Flex>
                    </Flex>
                  )}
                </Flex>
              </Flex>
            </Flex>
          </ModalBody>
          <Divider m={0} />
          <ModalFooter w={"100%"} justifyContent={"center"}>
            <Flex w={"100%"} alignItems={"center"} justifyContent={"end"}>
              <Flex>
                <Button
                  isLoading={buttonLoading}
                  _hover={{ background: "#dc143c", color: "white" }}
                  width={"95px"}
                  color={"#dc143c"}
                  background={"transparent"}
                  border={"1px solid #dc143c"}
                  mr={3}
                  onClick={handleCloseModal}
                >
                  {"Close"}
                </Button>
                <Button
                  isLoading={buttonLoading}
                  _hover={{ background: "#b80d2f" }}
                  width={"95px"}
                  border={"1px solid #dc143c"}
                  color={"white"}
                  bgColor={"#dc143c"}
                  variant="ghost"
                  onClick={() => {
                    formik.handleSubmit();
                  }}
                >
                  Send
                </Button>
              </Flex>
            </Flex>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}
