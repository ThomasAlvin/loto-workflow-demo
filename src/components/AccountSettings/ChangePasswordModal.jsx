import {
  Box,
  Button,
  Divider,
  Flex,
  IconButton,
  Input,
  InputGroup,
  InputRightElement,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  useDisclosure,
} from "@chakra-ui/react";
import { BsFillInfoCircleFill } from "react-icons/bs";
import * as Yup from "yup";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { FaTriangleExclamation } from "react-icons/fa6";
import { useState } from "react";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import { api } from "../../api/api";
import Swal from "sweetalert2";
import { useSelector } from "react-redux";
import { IoWarning } from "react-icons/io5";
import SwalErrorMessages from "../SwalErrorMessages";
import tinycolor from "tinycolor2";

export default function ChangePasswordModal() {
  const { isOpen, onClose, onOpen } = useDisclosure();
  const userSelector = useSelector((state) => state.login.auth);
  const [seePassword, setSeePassword] = useState({
    // oldPassword: false,
    newPassword: false,
    confirmNewPassword: false,
  });
  const [errorMessage, setErrorMessage] = useState();
  const [buttonLoading, setButtonLoading] = useState();
  function handleCloseModal() {
    onClose();
    reset();
  }

  const {
    control,
    register,
    handleSubmit,
    setValue,
    getValues,
    watch,
    clearErrors,
    setError,
    reset,
    formState: { errors, touchedFields },
    trigger,
  } = useForm({
    defaultValues: {
      // oldPassword: "",
      newPassword: "",
      confirmNewPassword: "",
    },
    resolver: yupResolver(
      Yup.object({
        // oldPassword: Yup.string().trim().required("Old password is required"),
        newPassword: Yup.string()
          .trim()
          .required("New password is required")
          .min(8, "Password must be at least 8 characters")
          .matches(/[A-Z]/, "Password must contain one capital letter")
          .matches(/[0-9]/, "Password must contain one number")
          .matches(
            /[!@#$%^&*(),.?":{}|<>]/,
            "Password must contain one symbol"
          ),
        confirmNewPassword: Yup.string()
          .trim()
          .required("Confirmation password is required")
          .oneOf([Yup.ref("newPassword")], "Passwords must match"),
      })
    ),
    mode: "onTouched",
    reValidateMode: "onChange",
  });

  async function submitChangePassword(data) {
    try {
      setButtonLoading(true);
      setErrorMessage("");
      await api
        .testSubmit("Password changed successfully")
        .then(async (response) => {
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
          onClose();
        })
        .catch((error) => {
          Swal.fire({
            title: "Oops...",
            // text: error.response.data.errors || "An error occurred",
            html: SwalErrorMessages(error.response.data.message),
            icon: "error",
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
        });
    } catch (error) {
      setButtonLoading(false);
      setErrorMessage("Old password is incorrect");
      console.error(
        "Reauthentication failed or password change failed:",
        error.message
      );
    }
  }
  return (
    <>
      <Button
        _hover={{
          background: tinycolor("#dc143c").darken(5).toString(),
        }}
        onClick={onOpen}
        h={"32px"}
        bg={"#dc143c"}
        color={"white"}
        px={"8px"}
      >
        Change Password
      </Button>
      <Modal isOpen={isOpen} onClose={handleCloseModal} isCentered>
        <ModalOverlay />
        <ModalContent maxW={"600px"} bg={"white"}>
          <ModalHeader
            display={"flex"}
            gap={"10px"}
            fontSize={"24px"}
            alignItems={"center"}
            color={"#dc143c"}
          >
            Change Password
          </ModalHeader>
          <ModalCloseButton color={"black"} />
          <Divider m={0} />

          <ModalBody>
            <Flex flexDir={"column"} gap={"10px"}>
              <Flex
                bg={"#FDE2E2"}
                color={"#dc143c"}
                fontSize={"14px"}
                py={"10px"}
                px={"10px"}
                gap={"5px"}
              >
                <Flex fontSize={"16px"} pt={"2px"}>
                  <BsFillInfoCircleFill />
                </Flex>
                <Flex>
                  To ensure your password remains secure please choose a new
                  password with 1 uppercase letter, 1 number, 1 symbol and
                  atleast 8 characters
                </Flex>
              </Flex>
              <Flex flexDir={"column"}>
                {/* <Flex
                  w={"100%"}
                  position={"relative"}
                  pb={"20px"}
                  flexDir={"column"}
                >
                  <Flex flexDir={"column"}>
                    <Box fontWeight={700} as="span" flex="1" textAlign="left">
                      Old Password
                    </Box>
                    <Flex
                      textAlign={"center"}
                      fontSize={"14px"}
                      color={"#848484"}
                      justifyContent={"space-between"}
                    >
                      <Flex>
                        Enter your current password to verify your identity.{" "}
                      </Flex>
                    </Flex>
                  </Flex>
                  <Flex>
                    <InputGroup>
                      <Input
                        {...register("oldPassword")}
                        border={
                          errors.oldPassword
                            ? "1px solid crimson"
                            : "1px solid #E2E8F0"
                        }
                        fontSize={"14px"}
                        type={seePassword.oldPassword ? "text" : "password"}
                        placeholder="Old Password"
                      ></Input>
                      <InputRightElement width={"2.5rem"} h={"100%"}>
                        <IconButton
                          colorScheme="whiteAlpha"
                          color={"grey"}
                          as={
                            seePassword.oldPassword
                              ? AiOutlineEye
                              : AiOutlineEyeInvisible
                          }
                          w={"24px"}
                          h={"24px"}
                          onClick={() =>
                            setSeePassword((prevState) => ({
                              ...prevState,
                              oldPassword: !prevState.oldPassword,
                            }))
                          }
                          cursor={"pointer"}
                        ></IconButton>
                      </InputRightElement>
                    </InputGroup>
                  </Flex>
                  {errors.oldPassword ? (
                    <Flex
                      position={"absolute"}
                      left={0}
                      bottom={0}
                      color="crimson"
                      fontSize="14px"
                      gap="5px"
                      alignItems="center"
                    >
                      <FaTriangleExclamation />
                      <Flex>{errors.oldPassword.message}</Flex>
                    </Flex>
                  ) : (
                    ""
                  )}
                </Flex> */}
                <Flex
                  w={"100%"}
                  position={"relative"}
                  pb={"20px"}
                  flexDir={"column"}
                >
                  <Flex flexDir={"column"}>
                    <Box fontWeight={700} as="span" flex="1" textAlign="left">
                      New Password
                    </Box>
                    <Flex
                      textAlign={"center"}
                      fontSize={"14px"}
                      color={"#848484"}
                      justifyContent={"space-between"}
                    >
                      <Flex>
                        Create a secure new password that meets the
                        requirements.
                      </Flex>
                    </Flex>
                  </Flex>
                  <Flex>
                    <InputGroup>
                      <Input
                        {...register("newPassword")}
                        border={
                          errors.newPassword
                            ? "1px solid crimson"
                            : "1px solid #E2E8F0"
                        }
                        fontSize={"14px"}
                        type={seePassword.newPassword ? "text" : "password"}
                        placeholder="New Password"
                      ></Input>
                      <InputRightElement width={"2.5rem"} h={"100%"}>
                        <IconButton
                          colorScheme="whiteAlpha"
                          color={"grey"}
                          as={
                            seePassword.newPassword
                              ? AiOutlineEye
                              : AiOutlineEyeInvisible
                          }
                          w={"24px"}
                          h={"24px"}
                          onClick={() =>
                            setSeePassword((prevState) => ({
                              ...prevState,
                              newPassword: !prevState.newPassword,
                            }))
                          }
                          cursor={"pointer"}
                        ></IconButton>
                      </InputRightElement>
                    </InputGroup>
                  </Flex>
                  {errors.newPassword ? (
                    <Flex
                      position={"absolute"}
                      left={0}
                      bottom={0}
                      color="crimson"
                      fontSize="14px"
                      gap="5px"
                      alignItems="center"
                    >
                      <FaTriangleExclamation />
                      <Flex>{errors.newPassword.message}</Flex>
                    </Flex>
                  ) : (
                    ""
                  )}
                </Flex>
                <Flex
                  w={"100%"}
                  position={"relative"}
                  pb={"20px"}
                  flexDir={"column"}
                >
                  <Flex flexDir={"column"}>
                    <Box fontWeight={700} as="span" flex="1" textAlign="left">
                      Confirm New Password
                    </Box>
                    <Flex
                      textAlign={"center"}
                      fontSize={"14px"}
                      color={"#848484"}
                      justifyContent={"space-between"}
                    >
                      <Flex>Re-enter your new password to confirm.</Flex>
                    </Flex>
                  </Flex>
                  <Flex>
                    <InputGroup>
                      <Input
                        {...register("confirmNewPassword")}
                        border={
                          errors.confirmNewPassword
                            ? "1px solid crimson"
                            : "1px solid #E2E8F0"
                        }
                        fontSize={"14px"}
                        type={
                          seePassword.confirmNewPassword ? "text" : "password"
                        }
                        placeholder="Confirm New Password"
                      ></Input>
                      <InputRightElement width={"2.5rem"} h={"100%"}>
                        <IconButton
                          colorScheme="whiteAlpha"
                          color={"grey"}
                          as={
                            seePassword.confirmNewPassword
                              ? AiOutlineEye
                              : AiOutlineEyeInvisible
                          }
                          w={"24px"}
                          h={"24px"}
                          onClick={() =>
                            setSeePassword((prevState) => ({
                              ...prevState,
                              confirmNewPassword: !prevState.confirmNewPassword,
                            }))
                          }
                          cursor={"pointer"}
                        ></IconButton>
                      </InputRightElement>
                    </InputGroup>
                  </Flex>
                  {errors.confirmNewPassword ? (
                    <Flex
                      position={"absolute"}
                      left={0}
                      bottom={0}
                      color="crimson"
                      fontSize="14px"
                      gap="5px"
                      alignItems="center"
                    >
                      <FaTriangleExclamation />
                      <Flex>{errors.confirmNewPassword.message}</Flex>
                    </Flex>
                  ) : (
                    ""
                  )}
                </Flex>
                {errorMessage && (
                  <Flex
                    p={"8px"}
                    bg={"#fde2e2"}
                    color={"#dc143c"}
                    alignItems={"center"}
                    gap={"5px"}
                  >
                    <Flex fontSize={"20px"}>
                      <IoWarning />
                    </Flex>
                    <Flex>Old Password is incorrect!</Flex>
                  </Flex>
                )}
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
              onClick={handleSubmit(submitChangePassword)}
            >
              Confirm
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}
