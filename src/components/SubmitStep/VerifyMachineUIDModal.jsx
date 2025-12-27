import {
  Box,
  Button,
  Divider,
  Flex,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Spinner,
  useToast,
} from "@chakra-ui/react";
import { useFormik } from "formik";
import QrScanner from "qr-scanner";
import { useEffect, useRef, useState } from "react";
import {
  BsCameraVideoFill,
  BsCameraVideoOffFill,
  BsQrCodeScan,
} from "react-icons/bs";
import { FaTriangleExclamation } from "react-icons/fa6";
import { FiCheckCircle } from "react-icons/fi";
import { IoWarning } from "react-icons/io5";
import { useLocation, useNavigate } from "react-router-dom";
import * as Yup from "yup";
import setAllFieldsTouched from "../../utils/setAllFieldsTouched";
import VerifyMachineDropdownMenu from "./VerifyMachineDropdownMenu";

export default function VerifyMachineUIDModal({
  setValue,
  selectedVerifyMachine,
  isOpen,
  onClose,
}) {
  const toast = useToast();
  const videoRef = useRef(null);
  const [cameraOn, setCameraOn] = useState(false);
  const qrScannerRef = useRef(null);
  const [toggleCameraLoading, setToggleCameraLoading] = useState(false);
  const [buttonLoading, setButtonLoading] = useState(false);
  const location = useLocation();
  const nav = useNavigate();
  function handleCloseModal() {
    onClose();
    turnCameraOff();
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
          "Entered UID does not match the machine UID",
          function (value) {
            const { machineUID, inputQrUID } = this.parent;
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
          }
        ),
      inputQrUID: Yup.string()
        .nullable()
        .test(
          "match-machine-uid",
          "Please scan the machine's QR code to verify the machine",
          function (value) {
            const { machineUID, inputUID } = this.parent;

            if (value === machineUID || inputUID === machineUID) {
              return true;
            }

            if (value === null)
              return this.createError({
                message: "The submitted QR code is not valid. Please try again",
              });
            if (value && (value !== machineUID || inputUID !== machineUID))
              return this.createError({
                message: "Scanned QR does not match the machine UID",
              });

            if (!machineUID)
              return this.createError({
                message: "Machine UID is missing",
              });

            return false;
          }
        ),
    }),
    onSubmit: () => {
      verifyMachine();
      // submitEquipmentMachine();
    },
  });
  const hasInputError =
    formik.errors.inputUID && formik.touched.inputUID
      ? true
      : formik.touched.inputUID
      ? false
      : null;
  const hasQrError =
    formik.errors.inputQrUID && formik.touched.inputQrUID
      ? true
      : formik.touched.inputQrUID
      ? false
      : null;
  function inputHandler(event) {
    const { id, value } = event.target;
    formik.setFieldValue(id, value);
  }
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
    if (e) {
      e.preventDefault();
    }
    formik.setTouched(setAllFieldsTouched(formik.values));
    const errors = await formik.validateForm();
    const errorPaths = getFieldPaths(errors);

    if (errorPaths.length > 0) {
      // scrollToFirstError(errorPaths);
    } else {
      formik.handleSubmit();
      turnCameraOff();
    }
  }
  function turnCameraOff() {
    if (cameraOn) {
      const currentStream = videoRef.current?.srcObject;
      try {
        if (qrScannerRef.current) {
          qrScannerRef.current.stop();
          qrScannerRef.current.destroy();
          qrScannerRef.current = null;
        }

        if (currentStream) {
          currentStream.getTracks().forEach((t) => t.stop());
        }

        videoRef.current.srcObject = null;
      } finally {
        setCameraOn(false);
      }
    }
  }
  async function turnCameraOn() {
    try {
      qrScannerRef.current = new QrScanner(
        videoRef.current,
        (result) => {
          formik.setFieldValue("inputQrUID", result.data);
          formik.setFieldTouched("inputQrUID", true, false);

          setTimeout(() => {
            if (result.data === selectedVerifyMachine.UID) {
              handleSubmit();
            }
          }, 0);
        },
        {
          preferredCamera: "environment",
          highlightScanRegion: true,
          highlightCodeOutline: true,
          calculateScanRegion(video) {
            // Take the smaller of width or height to make a square
            const size = Math.min(video.videoWidth, video.videoHeight) * 0.8; // 50% of smaller dimension
            const x = (video.videoWidth - size) / 2;
            const y = (video.videoHeight - size) / 2;
            return { x, y, width: size, height: size };
          },
        }
      );

      await qrScannerRef.current.start();

      // SUCCESS: mark as ON
      setCameraOn(true);
    } catch (err) {
      console.error("Failed to start camera:", err);
      toast.closeAll();
      toast({
        title: "Camera access is required to scan QR codes",
        description:
          "Please allow camera access when prompted, or enable it in your browser’s site settings if you previously blocked it.",
        status: "error",
        duration: 5000,
        position: "top",
        isClosable: true,
      });
      // Clean up partial init
      if (qrScannerRef.current) {
        qrScannerRef.current.stop();
        qrScannerRef.current.destroy();
        qrScannerRef.current = null;
      }

      setCameraOn(false);
    }
  }
  const toggleCamera = async () => {
    if (toggleCameraLoading) return; // prevent spamming
    setToggleCameraLoading(true);

    if (!cameraOn) {
      await turnCameraOn();
      return;
    } else {
      turnCameraOff();
    }

    setTimeout(() => {
      setToggleCameraLoading(false);
    }, 1000);
  };
  async function verifyMachine() {
    setValue(
      `workOrderStepMachines[${selectedVerifyMachine.stepMachinesCounterIndex}].isMachineVerified`,
      true,
      { shouldValidate: true }
    );
    toast({
      title: "Machine Verified",
      description: "The inspection form is now available for you.",
      status: "success",
      duration: 5000,
      position: "top",
      isClosable: true,
    });
    handleCloseModal();
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
  useEffect(() => {
    if (isOpen) {
      const frame = requestAnimationFrame(() => {
        if (videoRef.current) {
          turnCameraOn();
        }
      });
      return () => cancelAnimationFrame(frame);
    }
  }, [isOpen]);
  return (
    <>
      <Modal
        closeOnOverlayClick={false}
        isOpen={isOpen}
        onClose={handleCloseModal}
        isCentered
        autoFocus={false}
        // scrollBehavior={"inside"}
        closeOnEsc={false}
        returnFocusOnClose={false} // prevents autofocus back to trigger
      >
        <ModalOverlay />
        <ModalContent maxW={"900px"} bg={"white"}>
          <ModalHeader
            display={"flex"}
            gap={"10px"}
            alignItems={"center"}
            color={"#dc143c"}
          >
            <Flex alignItems={"center"} gap={"5px"}>
              <Flex fontSize={"24px"}>
                <IoWarning />
              </Flex>
              <Flex>Machine Verification!</Flex>
            </Flex>
          </ModalHeader>
          <Divider m={0} />

          <ModalBody py={"16px"}>
            <Flex flexDir={"column"} gap={"10px"}>
              <Flex w={"100%"} alignItems={"center"} gap={"30px"}>
                <Flex w={"50%"} flexDir={"column"} gap={"16px"}>
                  <VerifyMachineDropdownMenu
                    formik={formik}
                    machine={selectedVerifyMachine}
                  />
                </Flex>
                <Flex w={"50%"} flexDir={"column"} gap={"10px"}>
                  <Flex
                    position={"relative"}
                    w={"100%"}
                    aspectRatio={16 / 9}
                    flexDir={"column"}
                    bg={"#f8f9fa"}
                    boxShadow={"0px 0px 3px rgba(50,50,93,0.5)"}
                  >
                    <video
                      ref={videoRef}
                      style={{ width: "100%", height: "100%" }}
                      autoPlay
                      muted
                      playsInline
                    ></video>
                    {!cameraOn ? (
                      <Flex
                        position={"absolute"}
                        top={"50%"}
                        left={"50%"}
                        transform="translate(-50%, -50%)"
                        fontSize={"80px"}
                      >
                        <BsQrCodeScan />
                      </Flex>
                    ) : (
                      ""
                    )}
                  </Flex>
                  <Flex justify={"center"}>
                    {hasQrError ? (
                      <Flex flexDir={"column"}>
                        <Flex flexDir={"column"}>
                          <Flex
                            justify={"center"}
                            fontSize={"14px"}
                            fontWeight={700}
                            // color={"#848484"}
                          >
                            {formik.values.inputQrUID}
                          </Flex>
                        </Flex>
                        <Flex
                          bg={"#fde2e2"}
                          px={"10px"}
                          py={"2px"}
                          left={0}
                          bottom={"-12px"}
                          color="crimson"
                          fontSize="14px"
                          gap="5px"
                          alignItems="center"
                        >
                          <FaTriangleExclamation />
                          <Flex>{formik.errors?.inputQrUID}</Flex>
                        </Flex>
                      </Flex>
                    ) : (
                      ""
                    )}
                  </Flex>
                  <Flex w={"100%"} justify={"center"}>
                    <Button
                      h={"28px"}
                      fontSize={"14px"}
                      bg={"#dc143c"}
                      color={"white"}
                      _hover={{ background: "#b51031" }}
                      opacity={toggleCameraLoading ? 0.6 : 1}
                      onClick={() => toggleCamera(videoRef.current.srcObject)}
                    >
                      {toggleCameraLoading ? (
                        <Flex width={"90px"} justify={"center"}>
                          <Spinner size={"sm"} />
                        </Flex>
                      ) : cameraOn ? (
                        <Flex alignItems={"center"} gap={"5px"}>
                          <Flex>
                            <BsCameraVideoOffFill />
                          </Flex>
                          <Flex>Turn off Camera</Flex>
                        </Flex>
                      ) : (
                        <Flex alignItems={"center"} gap={"5px"}>
                          <Flex>
                            <BsCameraVideoFill />
                          </Flex>
                          <Flex>Turn on Camera</Flex>
                        </Flex>
                      )}
                    </Button>
                  </Flex>
                  <Flex
                    pt={"5px"}
                    gap={"10px"}
                    w={"100%"}
                    alignItems={"center"}
                  >
                    <Flex flex={1} borderBottom={"1px solid #848484"}></Flex>
                    <Flex color={"#848484"}>OR</Flex>
                    <Flex flex={1} borderBottom={"1px solid #848484"}></Flex>
                  </Flex>
                  <Box
                    w={"100%"}
                    cursor={
                      hasQrError === false &&
                      formik.values.inputQrUID === formik.values.machineUID
                        ? "not-allowed"
                        : "default"
                    }
                  >
                    <Flex
                      pointerEvents={
                        hasQrError === false &&
                        formik.values.inputQrUID === formik.values.machineUID
                          ? "none"
                          : "auto"
                      }
                      position={"relative"}
                      flexDir={"column"}
                    >
                      <Flex
                        opacity={
                          hasQrError === false &&
                          formik.values.inputQrUID === formik.values.machineUID
                            ? 0.6
                            : 1
                        }
                        flexDir={"column"}
                      >
                        <Flex fontWeight={700}>
                          Enter Equipment/Machine UID
                        </Flex>
                        <Flex fontSize={"14px"} color={"#848484"}>
                          Enter the machine’s unique ID to verify the machine
                        </Flex>
                      </Flex>
                      <Flex>
                        <Input
                          isDisabled={
                            hasQrError === false &&
                            formik.values.inputQrUID ===
                              formik.values.machineUID
                              ? true
                              : false
                          }
                          placeholder="Ex: 6907FA3F-427B-4196-BE7B-48D3CACB30BE"
                          border={
                            hasInputError
                              ? "1px solid #dc143c"
                              : hasInputError === false &&
                                formik.values.inputUID ===
                                  formik.values.machineUID
                              ? "1px solid #3D9666"
                              : "1px solid #E2E8F0"
                          }
                          onBlur={formik.handleBlur}
                          onChange={(e) => {
                            inputHandler(e);
                          }}
                          // value={machineInput.inputUID}
                          id={`inputUID`}
                        ></Input>
                      </Flex>
                      {hasInputError ? (
                        <Flex
                          bg={"#fde2e2"}
                          px={"10px"}
                          py={"2px"}
                          position={"absolute"}
                          left={0}
                          bottom={"-35px"}
                          color="crimson"
                          fontSize="14px"
                          gap="5px"
                          alignItems="center"
                        >
                          <FaTriangleExclamation />
                          <Flex>{formik.errors?.inputUID}</Flex>
                        </Flex>
                      ) : hasInputError === false &&
                        formik.values.inputUID === formik.values.machineUID ? (
                        <Flex
                          bg={"#DBF6CB"}
                          px={"10px"}
                          py={"2px"}
                          position={"absolute"}
                          left={0}
                          bottom={"-35px"}
                          color="#3D9666"
                          fontSize="14px"
                          gap="5px"
                          alignItems="center"
                        >
                          <FiCheckCircle />
                          <Flex>Equipment/Machine UID is valid</Flex>
                        </Flex>
                      ) : (
                        ""
                      )}
                    </Flex>
                  </Box>
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
