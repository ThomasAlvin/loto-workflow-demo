import { Flex, Spinner, Tooltip } from "@chakra-ui/react";
import { useState } from "react";
import { FaMagnifyingGlass } from "react-icons/fa6";
// import LockDetailsModal from "./LockDetailsModal";
import { GrDocumentDownload } from "react-icons/gr";
import { useLocation, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { api } from "../../api/api";
import SwalErrorMessages from "../SwalErrorMessages";
import ReportDownloadQRCode from "./ReportDownloadQRCode";
import toSnakeCase from "../../utils/toSnakeCase";
export default function ReportMenu({ reportUID, reportName }) {
  const nav = useNavigate();
  const location = useLocation();
  const [pdfLoading, setPdfLoading] = useState(false);
  async function downloadReportPDF() {
    try {
      setPdfLoading(true);
      await api.downloadReportPdfByName(toSnakeCase(reportName));
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
  return (
    <Flex justifyContent={"center"}>
      <Flex
        gap={"15px"}
        fontSize={"20px"}
        justify={"space-between"}
        alignItems={"center"}
      >
        <Tooltip
          hasArrow
          placement={"top"}
          label="Details"
          aria-label="A tooltip"
          color={"white"}
        >
          <Flex
            onClick={() => nav(`/report/${reportUID}${location.search}`)}
            cursor={"pointer"}
          >
            <FaMagnifyingGlass />
          </Flex>
        </Tooltip>
        <ReportDownloadQRCode UID={reportUID} />
        {pdfLoading ? (
          <Flex
            color={"#039be5"}
            justify={"center"}
            alignItems={"center"}
            h={"20px"}
            w={"20px"}
          >
            <Spinner size={"sm"} />
          </Flex>
        ) : (
          <Tooltip
            hasArrow
            placement={"top"}
            label="Download Report"
            aria-label="A tooltip"
            background={"#039be5"}
            color={"white"}
          >
            <Flex
              onClick={downloadReportPDF}
              cursor={"pointer"}
              color={"#039be5"}
            >
              <GrDocumentDownload />
            </Flex>
          </Tooltip>
        )}
      </Flex>
    </Flex>
  );
}
