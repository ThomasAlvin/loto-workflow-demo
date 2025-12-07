import { Flex, Spinner, Tooltip, useDisclosure } from "@chakra-ui/react";
import { useState } from "react";
import { FaRegEdit, FaRegTrashAlt } from "react-icons/fa";
import { FaMagnifyingGlass } from "react-icons/fa6";
import { GrDocumentDownload } from "react-icons/gr";
import { LuCopyPlus } from "react-icons/lu";
import { useLocation, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { api } from "../../api/api";
import Can from "../../components/Can";
import SwalErrorMessages from "../SwalErrorMessages";
import WorkOrderDownloadQRCode from "./WorkOrderDownloadQRCode";
export default function WorkOrderMenu({
  pageModule,
  val,
  handleOpenDeleteWorkOrderModal,
  handleOpenDuplicateWorkOrderModal,
  isDeleted,
}) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const location = useLocation(); // gives you { pathname, search, ... }
  const [pdfLoading, setPdfLoading] = useState(false);

  async function downloadReportPDF() {
    try {
      setPdfLoading(true);
      const response = await api.get(`report/${val.report.UID}/download`, {
        responseType: "blob", // 👈 this tells axios to handle binary
      });

      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `report-${val.report.name}.pdf`); // name of the file
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
  const nav = useNavigate();
  return (
    <Flex w={"100%"} justify={"center"}>
      <Flex
        pointerEvents={isDeleted ? "none" : "auto"}
        w={"100%"}
        justify={"center"}
      >
        <Flex gap={"15px"} fontSize={"20px"} justify={"center"}>
          <Tooltip
            hasArrow
            placement={"top"}
            label="Details"
            aria-label="A tooltip"
            color={"white"}
          >
            <Flex
              onClick={() => {
                nav(`/work-order/${val.UID}${location.search}`);
              }}
              cursor={"pointer"}
            >
              <FaMagnifyingGlass />
            </Flex>
          </Tooltip>
          <Can module={pageModule} permission={["manage"]}>
            <Tooltip
              hasArrow
              placement={"top"}
              background={
                val.status === "draft" || val.status === "review_rejected"
                  ? "#3cc1fa"
                  : "#848484"
              }
              label={
                val.status === "draft" || val.status === "review_rejected"
                  ? "Edit"
                  : "Edit disabled: Already published"
              }
              aria-label="A tooltip"
              color={"white"}
            >
              <Flex
                cursor={
                  val.status === "draft" || val.status === "review_rejected"
                    ? "pointer"
                    : "not-allowed"
                }
                onClick={() => {
                  if (
                    val.status === "draft" ||
                    val.status === "review_rejected"
                  ) {
                    nav(`/work-order/edit/${val.UID}${location.search}`);
                  }
                }}
                color={
                  val.status === "draft" || val.status === "review_rejected"
                    ? "#3cc1fa"
                    : "#848484"
                }
              >
                <FaRegEdit />
              </Flex>
            </Tooltip>
          </Can>
          <Can module={pageModule} permission={["manage"]}>
            <Tooltip
              hasArrow
              placement={"top"}
              background={"#7059ff"}
              label={"Duplicate"}
              aria-label="A tooltip"
              color={"white"}
            >
              <Flex
                cursor={"pointer"}
                onClick={() => {
                  handleOpenDuplicateWorkOrderModal(val.UID);
                }}
                color={"#7059ff"}
              >
                <LuCopyPlus />
              </Flex>
            </Tooltip>
          </Can>
          <WorkOrderDownloadQRCode UID={val.UID} />
          <Can module={pageModule} permission={["manage"]}>
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
                label={
                  val.report?.UID
                    ? "Download Report"
                    : "Report Not Available Yet"
                }
                aria-label="A tooltip"
                background={val.report?.UID ? "#039be5" : "#848484"}
                color={"white"}
              >
                <Flex
                  onClick={val.report?.UID ? downloadReportPDF : ""}
                  cursor={val.report?.UID ? "pointer" : "not-allowed"}
                  color={val.report?.UID ? "#039be5" : "#848484"}
                >
                  <GrDocumentDownload />
                </Flex>
              </Tooltip>
            )}
          </Can>
          <Can module={pageModule} permission={["manage"]}>
            <Tooltip
              hasArrow
              placement={"top"}
              label="Delete"
              aria-label="A tooltip"
              background={"crimson"}
              color={"white"}
            >
              <Flex
                cursor={"pointer"}
                onClick={() => {
                  handleOpenDeleteWorkOrderModal(val.UID);
                }}
                color={"crimson"}
              >
                <FaRegTrashAlt />
              </Flex>
            </Tooltip>
          </Can>
        </Flex>
      </Flex>
    </Flex>
  );
}
