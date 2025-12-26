import {
  Box,
  Button,
  Center,
  Collapse,
  Flex,
  Input,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Spinner,
  useDisclosure,
} from "@chakra-ui/react";
import { useFormik } from "formik";
import { useEffect, useRef, useState } from "react";
import { AiOutlineCloudUpload } from "react-icons/ai";
import { BsQrCode } from "react-icons/bs";
import QrScanner from "qr-scanner";
import {
  FaChevronDown,
  FaFileCsv,
  FaTriangleExclamation,
} from "react-icons/fa6";
import { FiCheckCircle } from "react-icons/fi";
import { GrPowerCycle } from "react-icons/gr";
import { IoMdCheckmark, IoMdCheckmarkCircleOutline } from "react-icons/io";
import { IoWarning } from "react-icons/io5";
import { LuUpload } from "react-icons/lu";
import { MdKeyboardTab } from "react-icons/md";
import tinycolor from "tinycolor2";
import { FaCheckCircle } from "react-icons/fa";
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
            <Box
              cursor={
                hasInputError === false &&
                formik.values.inputUID === formik.values.machineUID
                  ? "not-allowed"
                  : "default"
              }
            >
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
            </Box>
          </Flex>
        </Flex>
      </Flex>
    </Flex>
  );
}
