import { Box, Flex, Text } from "@chakra-ui/react";
import { FiCheckCircle } from "react-icons/fi";
import { IoMdCheckmarkCircleOutline } from "react-icons/io";
export default function VerifyMachineDropdownMenu({ formik, machine }) {
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
    <Flex flexDir={"column"} gap={"16px"}>
      <Flex flexDir={"column"}>
        <Flex
          fontWeight={700}
          fontSize={"20px"}
          alignItems={"center"}
          justify={"space-between"}
          color={
            hasError ? "#dc143c" : hasError === false ? "#3D9666" : "#dc143c"
          }
          // color={"#dc143c"}
        >
          <Flex alignItems={"center"} gap={"10px"}>
            <Flex>{machine.name}</Flex>
            {hasError === false ? (
              <Flex borderRadius={"full"}>
                <FiCheckCircle />
              </Flex>
            ) : (
              ""
            )}
          </Flex>
        </Flex>
        <Flex fontSize={"14px"} color={"#848484"}>
          Before proceeding, please verify the machine—either by scanning the
          machine's QR code or entering the machine's UID manually.
        </Flex>
      </Flex>
      <Flex w={"100%"} gap={"10px"} flexDir={"column"}>
        <Flex flexDir={"column"} gap={"20px"}>
          <Flex flexDir={"column"} gap={"10px"}>
            <Flex flexDir={"column"} gap={"10px"}>
              <Flex fontWeight={700} color={"black"}>
                How to Verify a Machine via QR Code Scan?
              </Flex>
              <Flex color={"black"} flexDir={"column"} gap={"10px"}>
                <Flex alignItems={"center"} gap={"10px"}>
                  <Flex color={"#3D9666"} fontSize={"20px"}>
                    <IoMdCheckmarkCircleOutline />
                  </Flex>
                  <Flex fontSize={"14px"}>
                    Allow permission for the website to access your camera
                  </Flex>
                </Flex>
                <Flex alignItems={"center"} gap={"10px"}>
                  <Flex color={"#3D9666"} fontSize={"20px"}>
                    <IoMdCheckmarkCircleOutline />
                  </Flex>
                  <Flex fontSize={"14px"}>
                    Locate the QR code on the machine and scan it using the
                    camera.
                  </Flex>
                </Flex>
                <Flex alignItems={"center"} gap={"10px"}>
                  <Flex color={"#3D9666"} fontSize={"20px"}>
                    <IoMdCheckmarkCircleOutline />
                  </Flex>
                  <Flex fontSize={"14px"}>
                    Place the QR code in the center of the camera frame within
                    the highlighted area
                  </Flex>
                </Flex>
              </Flex>
            </Flex>
            <Text fontSize={"14px"} color={"#848484"}>
              <span style={{ fontWeight: "700" }}>Demo note:</span>{" "}
              <span>
                if you wanna test the QR Scan feature, please download the QR
                code of the assigned machine on the Equipment/Machines List Page
                and show the downloaded QR Code image to the camera
              </span>
            </Text>
          </Flex>
        </Flex>
      </Flex>
    </Flex>
  );
}
