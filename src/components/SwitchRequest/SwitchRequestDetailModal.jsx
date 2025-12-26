import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  Avatar,
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
import SwitchRequestDetailStep from "./SwitchRequestDetailStep";
import tinycolor from "tinycolor2";
import { useFormik } from "formik";
import * as Yup from "yup";
import { FaUserAlt } from "react-icons/fa";
import labelizeRole from "../../utils/labelizeRole";
import ReactSelect from "react-select";
import ReactSelectMemberSelection from "../ReactSelectMemberSelection";
import { FaTriangleExclamation } from "react-icons/fa6";
import Swal from "sweetalert2";
import { useEffect, useRef, useState } from "react";
import { api } from "../../api/api";
import SwalErrorMessages from "../SwalErrorMessages";
import tableStatusStyleMapper from "../../utils/tableStatusStyleMapper";
import setAllFieldsTouched from "../../utils/setAllFieldsTouched";
export default function SwitchRequestDetailModal({
  abortControllerRef,
  fetchSwitchRequest,
  memberSelection,
  selectedSwitchRequest,
  onClose,
  isOpen,
}) {
  const [buttonLoading, setButtonLoading] = useState(false);

  // const filteredMemberSelection = memberSelection?.filter(
  //   (member) => member?.UID !== selectedSwitchRequest?.old_assignee?.UID
  // );
  const statusTag = tableStatusStyleMapper(selectedSwitchRequest.status);

  const requester = selectedSwitchRequest?.requester_super_admin?.id
    ? selectedSwitchRequest?.requester_super_admin
    : {
        ...selectedSwitchRequest?.requester_member,
        first_name: selectedSwitchRequest?.requester_member?.user?.first_name,
        last_name: selectedSwitchRequest?.requester_member?.user?.last_name,
        profile_image_url:
          selectedSwitchRequest?.requester_member?.user?.profile_image_url,
      };
  const customReactSelectStyle = {
    menuPortal: (base) => ({
      ...base,
      zIndex: 1401, // Or higher than modal
    }),
    control: (provided, state) => ({
      ...provided,
      borderColor:
        formik.touched.new_assignee_UID && formik.errors.new_assignee_UID
          ? "#dc143c"
          : "#039be5", // Default case
      borderRadius: "0px",
      boxShadow: state.isFocused ? "0 0 3px rgba(3, 154, 229, 0.8)" : "none",
      "&:hover": {
        boxShadow: "0 0 3px rgba(3, 154, 229, 0.8)",
        width: "100%",
      },
    }),
    menuList: (provided) => ({
      ...provided,
      maxHeight: 200, // Ensure the inner menu list also respects the height limit
    }),
  };

  const formik = useFormik({
    initialValues: { switchRequestSteps: [] },
    validationSchema: Yup.object().shape({
      switchRequestSteps: Yup.array() // Return a Yup array schema
        .of(
          Yup.object().shape({
            new_assignee_UID: Yup.string()
              .trim()
              .required(
                "Please reassign this step to an assignee before approving."
              ),
          })
        ),
    }),

    onSubmit: () => {
      submitResponse("approved");
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
  async function handleSubmit() {
    formik.setTouched(setAllFieldsTouched(formik.values));
    const errors = await formik.validateForm();
    const errorPaths = getFieldPaths(errors);
    if (errorPaths.length > 0) {
      console.log(errorPaths);
    } else {
      formik.handleSubmit();
    }
  }
  function handleCloseModal() {
    formik.setValues({ new_assignee_UID: "" });
    formik.setTouched({});
    onClose();
  }

  async function submitResponse(status) {
    setButtonLoading(true);
    try {
      await api
        .testSubmit(
          status === "rejected"
            ? "Switch request rejected successfully"
            : "Switch request approved successfully"
        )
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
          fetchSwitchRequest();
          handleCloseModal();
        })
        .catch((error) => {
          Swal.fire({
            title: "Oops...",
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
          console.log(error);
        });
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setButtonLoading(false); // Set loading to false after 3 seconds
    }
  }
  async function selectHandler(event, stepUID) {
    formik.setValues((prevState) => {
      return {
        ...prevState,
        switchRequestSteps: prevState.switchRequestSteps.map((switchStep) => {
          if (switchStep.UID === stepUID) {
            return { ...switchStep, new_assignee_UID: event?.UID || null };
          }
          return switchStep;
        }),
      };
    });
  }
  useEffect(() => {
    if (isOpen) {
      formik.setValues({
        switchRequestSteps:
          selectedSwitchRequest?.assignee_switch_request_steps.map((step) => ({
            ...step,
            new_assignee_UID: "",
          })),
      });
    }
  }, [isOpen]);
  const modalContentRef = useRef(null);

  return (
    <Modal
      closeOnOverlayClick={!buttonLoading}
      isOpen={isOpen}
      onClose={handleCloseModal}
      isCentered
      scrollBehavior="inside"
      closeOnEsc={!buttonLoading}
    >
      <ModalOverlay />

      <ModalContent
        ref={modalContentRef}
        justifyContent={"center"}
        maxW={"900px"}
        bg={"white"}
      >
        <ModalHeader
          display={"flex"}
          gap={"10px"}
          alignItems={"center"}
          color={"#dc143c"}
        >
          <Flex gap={"10px"} alignItems={"center"}>
            <Flex>Switch Assignee Request</Flex>
          </Flex>
        </ModalHeader>
        <ModalCloseButton isDisabled={buttonLoading} color={"black"} />
        <Divider m={0} />

        <ModalBody>
          <Flex flexDir={"column"}>
            <Flex flexDir={"column"} gap={"20px"}>
              <Flex flexDir={"column"} gap={"10px"}>
                <Flex fontWeight={700}>Requested by :</Flex>
                <Flex alignItems={"center"} gap={"10px"}>
                  {requester?.first_name ? (
                    <Avatar
                      outline={"1px solid #dc143c"}
                      border={"2px solid white"}
                      name={requester?.first_name + " " + requester?.last_name}
                      src={
                        requester?.profile_image_url
                          ? requester?.profile_image_url
                          : null
                      }
                    ></Avatar>
                  ) : (
                    <Flex
                      outline={"1px solid #dc143c"}
                      bg={"#bababa"}
                      borderRadius={"100%"}
                      justifyContent={"center"}
                      alignItems={"center"}
                      h={"48px"}
                      w={"48px"}
                      border={"2px solid white"}
                    >
                      <Flex color={"white"} fontSize={"24px"}>
                        <FaUserAlt />
                      </Flex>
                    </Flex>
                  )}
                  <Flex flexDir={"column"} onClick={() => {}}>
                    <Flex>
                      {requester?.first_name + " " + requester?.last_name}
                    </Flex>
                    <Flex fontWeight={400} fontSize={"14px"} color={"#848484"}>
                      {selectedSwitchRequest?.requester_super_admin?.id
                        ? "Super Admin"
                        : labelizeRole(requester?.role) +
                          " - " +
                          requester?.employee_id}
                    </Flex>
                  </Flex>
                </Flex>
              </Flex>
              <Flex flexDir={"column"} gap={"10px"}>
                <Flex fontWeight={700}>Reassignment Reason : </Flex>
                <Flex>{selectedSwitchRequest.reason}</Flex>
              </Flex>
              <Flex flexDir={"column"} gap={"10px"}>
                <Flex fontWeight={700}>Steps Selected for Reassignment :</Flex>
                <Flex flexDir={"column"} gap={"10px"}>
                  {selectedSwitchRequest?.assignee_switch_request_steps?.map(
                    (val, stepIndex) => (
                      <SwitchRequestDetailStep
                        val={val}
                        stepIndex={stepIndex}
                        formik={formik}
                        openByDefault={true}
                        machineOpenByDefault={false}
                        memberSelection={memberSelection}
                        selectHandler={selectHandler}
                        handleSubmit={handleSubmit}
                        selectedSwitchRequestStatus={
                          selectedSwitchRequest.status
                        }
                        requester={requester}
                        modalContentRef={modalContentRef}
                      />
                    )
                  )}
                </Flex>
              </Flex>
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
            onClick={handleCloseModal}
          >
            Close
          </Button>
          {selectedSwitchRequest.status === "pending" ? (
            <>
              {" "}
              <Button
                w={"100px"}
                isLoading={buttonLoading}
                _hover={{
                  background: tinycolor("#dc143c").darken(5).toString(),
                }}
                background={"#dc143c"}
                color={"white"}
                onClick={() => {
                  submitResponse("rejected");
                }}
              >
                Reject
              </Button>
              <Button
                w={"100px"}
                isLoading={buttonLoading}
                _hover={{
                  background: tinycolor("#3D9666").darken(5).toString(),
                }}
                bg={"#3D9666"}
                color={"white"}
                onClick={() => {
                  handleSubmit();
                }}
              >
                Approve
              </Button>
            </>
          ) : (
            ""
          )}
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
