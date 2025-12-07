import {
  Box,
  Button,
  ButtonGroup,
  Divider,
  Flex,
  Spinner,
} from "@chakra-ui/react";
import { FaArrowLeftLong } from "react-icons/fa6";
import { MdFileDownload } from "react-icons/md";

import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { api } from "../../api/api";
import SwalErrorMessages from "../SwalErrorMessages";
export default function ReportDetailsNavbar({
  generatePdf,
  reportUID,
  setCurrentPage,
  currentPage,
}) {
  const [pdfLoading, setPdfLoading] = useState(false);
  async function downloadReportPDF(controller) {
    try {
      setPdfLoading(true);
      const response = await api.get(`report/${reportUID}/download`, {
        signal: controller.signal,
        responseType: "blob", // 👈 this tells axios to handle binary
      });

      // Convert the blob into a downloadable object
      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `report-${reportUID}.pdf`); // name of the file
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // cleanup
      window.URL.revokeObjectURL(url);
    } catch (error) {
      let errorMessage = "Something went wrong while downloading the report.";

      if (error.name === "CanceledError") {
        errorMessage = "Download was cancelled.";
      } else if (error.response) {
        try {
          const text = await error.response.data.text();
          const json = JSON.parse(text);
          errorMessage =
            json.message || json.error_message || error.response.statusText;
        } catch {
          errorMessage = "Failed to read error message from server.";
        }
      } else if (error.request) {
        errorMessage = "No response received from the server.";
      } else if (error.message) {
        errorMessage = error.message;
      }
      Swal.fire({
        title: "Oops...",
        html: SwalErrorMessages(errorMessage),
        icon: "error",
        customClass: {
          popup: "swal2-custom-popup",
          title: "swal2-custom-title",
          content: "swal2-custom-content",
          actions: "swal2-custom-actions",
          confirmButton: "swal2-custom-confirm-button",
        },
      });
    } finally {
      setPdfLoading(false);
    }
  }
  const location = useLocation();
  const nav = useNavigate();
  function handleBackRedirect() {
    nav(`/report${location.search}`);
  }
  return (
    <Flex flexDir={"column"} bg={"white"} position={"sticky"} top={0}>
      <Flex
        position={"relative"}
        px={"20px"}
        gap={"20px"}
        alignItems={"center"}
        justifyContent={"center"}
      >
        <Box
          color={"crimson"}
          position="absolute"
          top="50%"
          transform="translate(0%, -50%)"
          left="20px"
        >
          <Flex
            cursor={"pointer"}
            onClick={handleBackRedirect}
            alignItems={"center"}
            gap={"20px"}
          >
            <Flex>
              <FaArrowLeftLong />
            </Flex>
            <Flex>Back</Flex>
          </Flex>
        </Box>
        <Flex
          color={"#848484"}
          justifyContent={"center"}
          gap={"10px"}
          fontWeight={700}
          fontSize={"16px"}
          h={"60px"}
        >
          <Button
            _hover={{ bg: "#FFB0B0", color: "crimson" }}
            width={"120px"}
            h={"auto"}
            justifyContent={"center"}
            borderTopLeftRadius={"20px"}
            borderTopRightRadius={"20px"}
            borderBottomLeftRadius={"0px"}
            borderBottomRightRadius={"0px"}
            bg={currentPage === "overview" ? "#FFB0B0" : ""}
            color={currentPage === "overview" ? "crimson" : "#848484"}
            py={"20px"}
            borderBottom={currentPage === "overview" ? "crimson 2px solid" : ""}
            onClick={() => setCurrentPage("overview")}
          >
            1. Overview
          </Button>
          <Button
            _hover={{ bg: "#FFB0B0", color: "crimson" }}
            width={"120px"}
            h={"auto"}
            transition={"none"}
            justifyContent={"center"}
            borderTopLeftRadius={"20px"}
            borderTopRightRadius={"20px"}
            borderBottomLeftRadius={"0px"}
            borderBottomRightRadius={"0px"}
            bg={currentPage === "auditLogs" ? "#FFB0B0" : ""}
            color={currentPage === "auditLogs" ? "crimson" : "#848484"}
            py={"20px"}
            borderBottom={
              currentPage === "auditLogs" ? "crimson 2px solid" : ""
            }
            onClick={() => setCurrentPage("auditLogs")}
          >
            2. Audit Logs
          </Button>
        </Flex>
        <Box
          color={"crimson"}
          position="absolute"
          top="50%"
          transform="translate(0%, -50%)"
          right="20px"
        >
          <Flex alignItems={"center"} gap={"20px"}>
            <Flex>
              <ButtonGroup
                isDisabled={pdfLoading}
                border={"1px solid #dc143c"}
                isAttached
                variant="outline"
                borderRadius={"5px"}
              >
                <Button
                  // onClick={generatePdf}
                  onClick={downloadReportPDF}
                  borderRadius={"5px"}
                  border={"none"}
                  borderRight={"1px solid #dc143c"}
                  alignItems={"center"}
                  gap={"10px"}
                  color={"#dc143c"}
                  _hover={{ background: "#dc143c", color: "white" }}
                >
                  {pdfLoading ? (
                    <Flex alignItems={"center"} gap={"10px"}>
                      <Spinner size={"sm"} />
                      <Flex>Downloading...</Flex>
                    </Flex>
                  ) : (
                    <>
                      <MdFileDownload fontSize={"20px"} />
                      Download PDF
                    </>
                  )}
                </Button>
              </ButtonGroup>
            </Flex>
            <Flex>
              <Button
                px={"20px"}
                bg={"#dc143c"}
                color={"white"}
                alignItems={"center"}
                gap={"10px"}
              >
                Share
              </Button>
            </Flex>
          </Flex>
        </Box>
      </Flex>
      <Divider m={0} borderColor={"#848484"} />
    </Flex>
  );
}
