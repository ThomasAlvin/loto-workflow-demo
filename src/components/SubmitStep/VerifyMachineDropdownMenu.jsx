import { Box, Button, Center, Flex, Input, Spinner } from "@chakra-ui/react";
import QrScanner from "qr-scanner";
import { useRef, useState } from "react";
import { AiOutlineCloudUpload } from "react-icons/ai";
import { FaTriangleExclamation } from "react-icons/fa6";
import { FiCheckCircle } from "react-icons/fi";

export default function VerifyMachineDropdownMenu({ formik, machine }) {
  const fileInputRef = useRef();
  const IMGURL = import.meta.env.VITE_API_IMAGE_URL;
  const [scanQrLoading, setScanQrLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragCounter, setDragCounter] = useState(false);
  const [previewImageURL, setPreviewImageURL] = useState("");
  function inputHandler(event) {
    const { id, value } = event.target;
    formik.setFieldValue(id, value);
  }

  function handleFileUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    setScanQrLoading(true);
    const previewUrl = URL.createObjectURL(file);
    setPreviewImageURL(previewUrl);
    const reader = new FileReader();
    reader.onload = async (e) => {
      const fieldName = `inputQrUID`;
      try {
        const result = await QrScanner.scanImage(e.target.result, {
          returnDetailedScanResult: true,
        });
        // console.log("dafak");

        formik.setFieldValue(fieldName, result.data);
        formik.setFieldTouched(fieldName, true, false);
      } catch (err) {
        console.log(err);
        // formik.setFieldTouched(fieldName, true);
        formik.setFieldValue(fieldName, null);
        formik.setFieldTouched(fieldName, true, false);
      } finally {
        setScanQrLoading(false);
      }
    };
    reader.readAsDataURL(file);
  }
  function handleFileInputClick() {
    fileInputRef.current.click();
  }
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const droppedFiles = Array.from(e.dataTransfer.files)[0];
    if (!droppedFiles) return;
    const previewUrl = URL.createObjectURL(droppedFiles);
    setPreviewImageURL(previewUrl);
    const reader = new FileReader();
    reader.onload = async (e) => {
      const fieldName = `inputQrUID`;
      try {
        const result = await QrScanner.scanImage(e.target.result, {
          returnDetailedScanResult: true,
        });
        formik.setFieldValue(fieldName, result.data);
        formik.setFieldTouched(fieldName, true, false);
      } catch (err) {
        console.log(err);
        // formik.setFieldTouched(fieldName, true);
        formik.setFieldValue(fieldName, null);
        formik.setFieldTouched(fieldName, true, false);
      } finally {
        setScanQrLoading(false);
      }
    };
    reader.readAsDataURL(droppedFiles);
  };
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    // setIsDragging(true);
  };
  function handleDragEnter(e) {
    e.preventDefault();
    e.stopPropagation();
    setDragCounter((prev) => prev + 1);
    setIsDragging(true);
  }

  function handleDragLeave(e) {
    e.preventDefault();
    e.stopPropagation();
    setDragCounter((prev) => {
      const newCounter = prev - 1;
      if (newCounter === 0) setIsDragging(false);
      return newCounter;
    });
  }
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
  const hasError =
    hasInputError || hasQrError
      ? true
      : hasInputError === false || hasQrError === false
      ? false
      : null;

  return (
    <Flex
      onDragEnter={handleDragEnter}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      borderBottom={"2px solid #dedede"}
      w={"100%"}
      pb={"10px"}
      gap={"10px"}
      flexDir={"column"}
    >
      <Flex
        fontWeight={700}
        fontSize={"18px"}
        alignItems={"center"}
        justify={"space-between"}
        color={
          hasError ? "#dc143c" : hasError === false ? "#3D9666" : "#dc143c"
        }
        // color={"#dc143c"}
      >
        <Flex alignItems={"center"} gap={"10px"}>
          <Flex
            onClick={() => {
              console.log(formik);
            }}
          >
            {machine.name}
          </Flex>
          {hasError === false ? (
            <Flex borderRadius={"full"}>
              <FiCheckCircle />
            </Flex>
          ) : (
            ""
          )}
        </Flex>
      </Flex>
      <Flex flexDir={"column"} pb={"10px"} gap={"20px"}>
        <Flex flexDir={"column"} gap={"10px"}>
          <Box
            cursor={
              hasInputError === false &&
              formik.values.inputUID === formik.values.machineUID
                ? "not-allowed"
                : "default"
            }
          >
            <Flex
              opacity={
                hasInputError === false &&
                formik.values.inputUID === formik.values.machineUID
                  ? 0.6
                  : 1
              }
              pointerEvents={
                hasInputError === false &&
                formik.values.inputUID === formik.values.machineUID
                  ? "none"
                  : "auto"
              }
              px={"10px"}
              flexDir={"column"}
              gap={"10px"}
            >
              <Flex flexDir={"column"}>
                <Flex fontSize={"14px"} fontWeight={700}>
                  Submit Machine QR Code Image
                </Flex>
                <Flex
                  onClick={() => {
                    formik.setFieldValue(`inputQrUID`, "");
                  }}
                  fontSize={"14px"}
                  color={"#848484"}
                >
                  Please select a QR code image file of the selected machine
                </Flex>
              </Flex>
              <Flex onDrop={handleDrop} gap={"15px"} flexDir={"column"}>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  style={{ display: "none" }}
                  onChange={handleFileUpload}
                ></input>
                {scanQrLoading ? (
                  <Center
                    flexDir={"column"}
                    alignItems={"center"}
                    gap={"20px"}
                    width="100%"
                    height="100vh"
                    opacity={1}
                  >
                    <Spinner thickness="4px" size="xl" color="#dc143c" />
                    <Center
                      flexDir={"column"}
                      color={"#dc143c"}
                      fontWeight={700}
                    >
                      <Flex fontWeight={700} fontSize={"20px"}>
                        Loading
                      </Flex>
                      <Flex color={"black"}>Processing your request...</Flex>
                    </Center>
                  </Center>
                ) : isDragging ? (
                  <Center
                    flexDir={"column"}
                    border={"2px dashed #848484"}
                    h={"200px"}
                    gap={"10px"}
                    cursor={"pointer"}
                    // onDrop={handleDrop}
                    transition={"background-color 0.2s ease"}
                    _hover={{ bg: "#FDE2E2", borderColor: "#dc143c" }}
                    bg={"#FDE2E2"}
                    borderColor={"#dc143c"}
                    role="group"
                  >
                    <Flex
                      fontSize={"76px"}
                      p={"10px"}
                      bg={"#dc143c"}
                      color={"white"}
                      borderRadius={"100%"}
                      _groupHover={{
                        bg: "#dc143c", // Change the background when parent is hovered
                        color: "white", // Change the text color when parent is hovered
                      }}
                    >
                      <AiOutlineCloudUpload />
                    </Flex>
                    <Center
                      color={"#dc143c"}
                      fontSize={"24px"}
                      fontWeight={700}
                    >
                      Drop Your Image Here!
                    </Center>
                  </Center>
                ) : previewImageURL ? (
                  <Flex
                    w={"100%"}
                    flexDir={"column"}
                    alignItems={"center"}
                    justify={"center"}
                    gap={"10px"}
                  >
                    <Flex
                      pointerEvents={
                        hasQrError === false &&
                        formik.values.inputQrUID === formik.values.machineUID
                          ? "none"
                          : "auto"
                      }
                      cursor={"pointer"}
                      _hover={{ bg: "#ededed" }}
                      boxShadow={"0px 0px 3px rgba(50,50,93,0.5)"}
                      w={"170px"}
                      p={"10px"}
                      onClick={handleFileInputClick}
                    >
                      <img src={previewImageURL}></img>
                    </Flex>
                    {formik.values.inputQrUID ? (
                      <Flex alignItems={"center"} flexDir={"column"}>
                        <Flex fontWeight={700}>
                          UID extracted from your QR code
                        </Flex>
                        <Flex fontSize={"14px"} color={"#848484"}>
                          {formik.values.inputQrUID}
                        </Flex>
                      </Flex>
                    ) : (
                      ""
                    )}
                    {hasQrError && !(hasInputError === false) ? (
                      <Flex
                        // position={"absolute"}
                        // left={0}
                        // bottom={0}
                        bg={"#fde2e2"}
                        px={"10px"}
                        py={"2px"}
                        color="crimson"
                        fontSize="14px"
                        gap="5px"
                        alignItems="center"
                      >
                        <FaTriangleExclamation />
                        <Flex>{formik.errors?.inputQrUID}</Flex>
                      </Flex>
                    ) : hasQrError === false &&
                      formik.values.inputQrUID === formik.values.machineUID ? (
                      <Flex
                        bg={"#DBF6CB"}
                        px={"10px"}
                        py={"2px"}
                        color="#3D9666"
                        fontSize="14px"
                        gap="5px"
                        alignItems="center"
                      >
                        <FiCheckCircle />
                        <Flex>Equipment/Machine verified successfully</Flex>
                      </Flex>
                    ) : (
                      ""
                    )}
                    {hasQrError ? (
                      <Button
                        mt={"10px"}
                        color={"white"}
                        bg={"#dc143c"}
                        h={"32px"}
                        fontSize={"14px"}
                        onClick={handleFileInputClick}
                      >
                        Select another image
                      </Button>
                    ) : (
                      ""
                    )}
                  </Flex>
                ) : (
                  <Center
                    flexDir={"column"}
                    border={"2px dashed #848484"}
                    h={"200px"}
                    gap={"10px"}
                    cursor={"pointer"}
                    // onDrop={handleDrop}
                    onClick={handleFileInputClick}
                    transition={"background-color 0.2s ease"}
                    _hover={{ bg: "#FDE2E2", borderColor: "#dc143c" }}
                    bg={isDragging ? "#FDE2E2" : ""}
                    borderColor={isDragging ? "#dc143c" : ""}
                    role="group"
                  >
                    <Flex
                      fontSize={"76px"}
                      p={"10px"}
                      bg={isDragging ? "#dc143c" : "#ededed"}
                      color={isDragging ? "white" : "#848484"}
                      borderRadius={"100%"}
                      _groupHover={{
                        bg: "#dc143c", // Change the background when parent is hovered
                        color: "white", // Change the text color when parent is hovered
                      }}
                    >
                      <AiOutlineCloudUpload />
                    </Flex>

                    <Center
                      _groupHover={{
                        color: "#dc143c", // Change the text color when parent is hovered
                      }}
                      color={"#848484"}
                      flexDir={"column"}
                    >
                      <Flex fontSize={"16px"} fontWeight={700}>
                        Select a QR Code Image
                      </Flex>
                      <Flex fontSize={"16px"}>or drag and drop here!</Flex>
                    </Center>
                  </Center>
                )}

                {/* {hasQrError ? (
                    <Flex
                      // position={"absolute"}
                      // left={0}
                      // bottom={0}
                      color="crimson"
                      fontSize="14px"
                      gap="5px"
                      alignItems="center"
                    >
                      <FaTriangleExclamation />
                      <Flex>{formik.errors?.inputQrUID}</Flex>
                    </Flex>
                  ) : hasQrError === false ? (
                    <Flex
                      // position={"absolute"}
                      // left={0}
                      // bottom={0}
                      color="#3D9666"
                      fontSize="14px"
                      gap="5px"
                      alignItems="center"
                    >
                      <FiCheckCircle />
                      <Flex>Equipment/Machine verified successfully</Flex>
                    </Flex>
                  ) : (
                    ""
                  )} */}
              </Flex>
            </Flex>
          </Box>
          <Flex pt={"5px"} gap={"10px"} w={"100%"} alignItems={"center"}>
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
              px={"10px"}
              position={"relative"}
              pb={"20px"}
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
                <Flex
                  onClick={() => {
                    console.log(formik);
                    console.log("hasInputError :" + hasInputError);
                    console.log("hasQrError :" + hasQrError);
                    console.log(hasQrError === false);
                    console.log(!(hasQrError === false));

                    console.log("hasError :" + hasError);
                  }}
                  fontWeight={700}
                  fontSize={"14px"}
                >
                  Enter Equipment/Machine UID
                </Flex>
                <Flex fontSize={"14px"} color={"#848484"}>
                  Enter the machine’s unique ID to verify you’ve selected the
                  right equipment.
                </Flex>
              </Flex>
              <Flex>
                <Input
                  isDisabled={
                    hasQrError === false &&
                    formik.values.inputQrUID === formik.values.machineUID
                      ? true
                      : false
                  }
                  placeholder="Ex: 6907FA3F-427B-4196-BE7B-48D3CACB30BE"
                  border={
                    hasInputError
                      ? "1px solid #dc143c"
                      : hasInputError === false &&
                        formik.values.inputUID === formik.values.machineUID
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
                  bottom={"-12px"}
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
                  bottom={"-12px"}
                  color="#3D9666"
                  fontSize="14px"
                  gap="5px"
                  alignItems="center"
                >
                  <FiCheckCircle />
                  <Flex>Equipment/Machine verified successfully</Flex>
                </Flex>
              ) : (
                ""
              )}
            </Flex>
          </Box>
        </Flex>
      </Flex>
    </Flex>
  );
}
