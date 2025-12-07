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
export default function ReportMenu({ reportUID, reportName, deleteReport }) {
  const nav = useNavigate();
  const location = useLocation();
  const [pdfLoading, setPdfLoading] = useState(false);
  async function downloadReportPDF() {
    try {
      setPdfLoading(true);
      const response = await api.get(`report/${reportUID}/download`, {
        responseType: "blob", // 👈 this tells axios to handle binary
      });

      // Convert the blob into a downloadable object
      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `report-${reportName}.pdf`); // name of the file
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
        {/* <Tooltip
          hasArrow
          placement={"top"}
          label="Delete"
          aria-label="A tooltip"
          background={"crimson"}
          color={"white"}
          onClick={() => {
            deleteReport();
          }}
        >
          <Flex cursor={"pointer"} color={"crimson"}>
            <FaRegTrashAlt />
          </Flex>
        </Tooltip> */}
      </Flex>
    </Flex>
  );
}
