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
  PinInput,
  PinInputField,
  useDisclosure,
} from "@chakra-ui/react";
import GoogleAuthenticationQRCodeGenerator from "./GoogleAuthenticationQRCodeGenerator";
import { useCallback, useEffect, useRef, useState } from "react";
import Swal from "sweetalert2";
import { api } from "../../api/api";
import { useFormik } from "formik";
import * as Yup from "yup";
import setAllFieldsTouched from "../../utils/setAllFieldsTouched";
import { FaTriangleExclamation } from "react-icons/fa6";
import { useDispatch, useSelector } from "react-redux";

export default function ConnectGoogleAuthModal({
  isDisabled,
  refreshQrCode,
  QRLoading,
  QRCodeUrl,
  isOpen,
  onClose,
  handleOpenConnectGoogleAuth,
}) {
  const submitButtonRef = useRef();
  const userSelector = useSelector((state) => state.login.auth);
  const [buttonLoading, setButtonLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const formik = useFormik({
    initialValues: { OTPInput: "" },
    validationSchema: Yup.object().shape({
      OTPInput: Yup.string()
        .trim()
        .required("Please enter the 6-digit OTP to proceed")
        .matches(/^\d{6}$/, "OTP must be exactly 6 digits"),
    }),
    onSubmit: () => {
      submitGoogleAuth();
    },
  });

  async function submitGoogleAuth() {
    setButtonLoading(true);
    await api
      .testSubmit("Google authenticator verified successfully")
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
        handleCloseModal();
      })
      .catch((error) => {
        console.log(error);

        setErrorMessage(error.response.data.message);
        // Swal.fire({
        //   title: "Oops...",
        //   icon: "error",
        //   html: SwalErrorMessages(error.response.data.message),
        //   customClass: {
        //     popup: "swal2-custom-popup",
        //     title: "swal2-custom-title",
        //     content: "swal2-custom-content",
        //     actions: "swal2-custom-actions",
        //     confirmButton: "swal2-custom-confirm-button",
        //   },
        // });
      })
      .finally(() => {
        setButtonLoading(false);
      });
  }
  const handleKeyPress = useCallback((event) => {
    if (event.key === "Enter") {
      submitButtonRef.current.click();
    }
  }, []);
  const handleFormikSubmit = () => {
    formik.setTouched(setAllFieldsTouched(formik.values));
    formik.handleSubmit();
  };
  function handleCloseModal() {
    formik.resetForm();
    onClose();
    setErrorMessage("");
  }
  return (
    <>
      <Button
        // isDisabled={isDisabled}
        cursor={isDisabled ? "not-allowed !important" : "pointer"}
        id="profile"
        _hover={isDisabled ? "" : { background: "#dc143c", color: "white" }}
        fontSize={"14px"}
        h={"28px"}
        bg={"white"}
        onClick={isDisabled ? "" : handleOpenConnectGoogleAuth}
        border={"1px solid #dc143c"}
        color={"#dc143c"}
        px={"8px"}
      >
        <Flex>Connect</Flex>
      </Button>
      <Modal
        closeOnOverlayClick={!buttonLoading}
        isOpen={isOpen}
        onClose={handleCloseModal}
        isCentered
        closeOnEsc={!buttonLoading}
      >
        <ModalOverlay />
        <ModalContent maxW={"600px"} bg={"white"}>
          <ModalHeader
            display={"flex"}
            gap={"10px"}
            alignItems={"center"}
            color={"#dc143c"}
          >
            Connect Google Authenticator
          </ModalHeader>
          <ModalCloseButton isDisabled={buttonLoading} color={"black"} />
          <Divider m={0} />

          <ModalBody pb={"20px"}>
            <Flex flexDir={"column"} gap={"20px"}>
              {errorMessage ? (
                <Flex
                  bg={"#FDE2E2"}
                  p={"10px"}
                  alignItems={"center"}
                  color={"#dc143c"}
                  gap={"10px"}
                >
                  <Flex>
                    <FaTriangleExclamation />
                  </Flex>
                  <Flex fontSize={"14px"}>{errorMessage}</Flex>
                </Flex>
              ) : (
                ""
              )}

              <Flex color={"#848484"} fontSize={"14px"}>
                Google Authenticator is a mobile app that generates time-based
                one-time passwords.
                <br />
                To set up Google Authenticator, please follow the instructions
                below :
              </Flex>

              <Flex justify={"center"} w={"100%"}>
                <GoogleAuthenticationQRCodeGenerator
                  QRCodeValue={QRCodeUrl}
                  refreshQrCode={refreshQrCode}
                  QRLoading={QRLoading}
                />
              </Flex>
              <Flex flexDir={"column"} gap={"20px"}>
                <Flex fontSize={"14px"} gap={"10px"} align={"flex-start"}>
                  <Flex
                    flex="0 0 auto"
                    border={"1px solid #848484"}
                    fontWeight={700}
                    alignItems={"center"}
                    justify={"center"}
                    w={"32px"}
                    aspectRatio={1}
                    borderRadius={"full"}
                    bg={"#ededed"}
                  >
                    1
                  </Flex>
                  <Flex fontWeight={700}>
                    Download Google Authenticator in your phone and scan the QR
                    code using Google Authenticator App
                  </Flex>
                </Flex>
                <Flex flexDir={"column"} gap={"10px"} fontSize={"14px"}>
                  <Flex gap={"10px"} align={"center"}>
                    <Flex
                      flex="0 0 auto"
                      border={"1px solid #848484"}
                      fontWeight={700}
                      alignItems={"center"}
                      justify={"center"}
                      w={"32px"}
                      aspectRatio={1}
                      borderRadius={"full"}
                      bg={"#ededed"}
                    >
                      2
                    </Flex>
                    <Flex fontWeight={700}>
                      Enter the 6 digit confirmation code shown on the Google
                      Authenticator App.
                    </Flex>
                  </Flex>
                  <Flex pl={"40px"} flexDir={"column"} gap={"10px"}>
                    <Flex gap={"10px"}>
                      <PinInput
                        otp
                        onChange={(e) => {
                          formik.setFieldValue("OTPInput", e);
                        }}
                      >
                        {Array.from({ length: 6 }).map(() => (
                          <PinInputField
                            fontWeight={700}
                            onKeyDown={handleKeyPress}
                            fontSize={"20px"}
                            boxShadow={"0px 0px 3px rgba(50,50,93,0.5)"}
                            h={"52px"}
                          />
                        ))}
                      </PinInput>
                    </Flex>
                    {formik.touched.OTPInput && formik.errors.OTPInput && (
                      <Flex
                        color="crimson"
                        fontSize="14px"
                        gap="5px"
                        alignItems="center"
                      >
                        <FaTriangleExclamation />
                        <Flex>{formik.errors.OTPInput}</Flex>
                      </Flex>
                    )}
                  </Flex>
                </Flex>
              </Flex>
            </Flex>
          </ModalBody>
          <Divider m={0} />
          <ModalFooter gap={"30px"} w={"100%"} justifyContent={"end"}>
            <Button
              w={"50%"}
              isLoading={buttonLoading}
              _hover={{ background: "#dc143c", color: "white" }}
              background={"white"}
              border={"1px solid #dc143c"}
              color={"#dc143c"}
              onClick={handleCloseModal}
            >
              Close
            </Button>
            <Button
              ref={submitButtonRef}
              w={"50%"}
              isLoading={buttonLoading}
              _hover={{ background: "#b51031" }}
              background={"#dc143c"}
              color={"white"}
              onClick={handleFormikSubmit}
            >
              Activate
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}
