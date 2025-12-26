import {
  Avatar,
  Flex,
  Image,
  Table,
  TableContainer,
  Tbody,
  Td,
  Th,
  Thead,
  Tooltip,
  Tr,
  useDisclosure,
} from "@chakra-ui/react";
import ReportDetailsLayout from "../components/Layout/ReportDetailsLayout";
import moment from "moment";
import { useParams } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { api } from "../api/api";
import labelizeRole from "../utils/labelizeRole";
import { FaUserAlt } from "react-icons/fa";
import html2pdf from "html2pdf.js";
import html2canvas from "html2canvas";
import { useLoading } from "../service/LoadingContext";
import ReportDetailsStep from "../components/Report/ReportDetailsStep";
import WorkOrderDetailsAuditLog from "../components/WorkOrders/WorkOrderDetailsAuditLog";
import ListEmptyState from "../components/ListEmptyState";
import logoEgeeTouchRed from "../assets/images/egeetouch-icon-red.png";
import { QRCodeCanvas } from "qrcode.react";
import ReportDetails404Page from "./ReportDetails404Page";
import { IoWarning } from "react-icons/io5";
import ReportDetailsStepModal from "../components/Report/ReportDetailsStepModal";
export default function ReportDetailsPage() {
  const { onClose, onOpen, isOpen } = useDisclosure();
  const reportDetailsRef = useRef(null);
  const { loading, setLoading } = useLoading();
  const { UID } = useParams();

  const [report, setReport] = useState();
  const [selectedStep, setSelectedStep] = useState(1);
  const [fetchError, setFetchError] = useState(false);
  const [currentPage, setCurrentPage] = useState("overview");
  const multiLockAccessNames =
    selectedStep?.report_multi_lock_group?.report_multi_lock_group_items.map(
      (item) => item.name
    ) || [];

  const creatorInfo = report?.creator?.is_superadmin
    ? { ...report?.creator, role: labelizeRole("super_admin") }
    : {
        ...report?.creator,
        first_name: report?.creator?.first_name,
        last_name: report?.creator?.last_name,
        role: labelizeRole(report?.creator?.member?.role),
        employee_id: report?.creator?.member?.employee_id,
      };

  const generatePdf = () => {
    const element = reportDetailsRef.current; // The HTML element to capture

    const style = document.createElement("style");
    document.head.appendChild(style);
    style.sheet?.insertRule(
      "body > div:last-child img { display: inline-block; }"
    );
    html2canvas(element).then((canvas) => {
      // style.remove();
    });
    const originalDisplay = element.style.display;
    var clonedElement = element.cloneNode(true);

    // Change the display rule of the cloned element
    clonedElement.style.display = "flex";
    // element.style.display = "block";

    const options = {
      margin: 20,
      filename:
        report?.name
          .trim()
          .replace(/[\s]+/g, "_") // replace spaces with underscores
          .replace(/[^a-zA-Z0-9_\-\.]/g, "") // remove other invalid characters
          .replace(/\.+$/, "") + " report",
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2 }, // Increase scale for better quality
      jsPDF: {
        unit: "px",
        format: "a4",
        orientation: "portrait",
        hotfixes: ["px_scaling"],
      },
    };

    html2pdf()
      .from(clonedElement)
      .set(options)
      .save()
      .then(() => {
        // Restore the original display style after the PDF is generated
        clonedElement.style.display = originalDisplay;
      })
      .catch((error) => {
        console.error("PDF generation error:", error);
        // Ensure the display style is reset even if an error occurs
        clonedElement.style.display = originalDisplay;
      });
    clonedElement.remove();
  };

  async function fetchReportDetails(controller) {
    setLoading(true);
    await api
      .getReportDetails(UID)
      .then((response) => {
        const uniqueAssigneesSet = new Set();
        const uniqueAssignees = [];

        response.data.report?.report_steps.forEach((step) => {
          const assignees = step.report_step_assigned_members;

          assignees.map((assignee) => {
            if (assignee?.email && !uniqueAssigneesSet.has(assignee.email)) {
              uniqueAssigneesSet.add(assignee.email);
              uniqueAssignees.push(assignee);
            }
          });
        });

        const uniqueNotifiedMembersSet = new Set();
        const uniqueNotifiedMembers = [];

        response.data.report.report_steps.forEach((step) => {
          const notifiedMembers = step.report_step_notified_members;

          notifiedMembers.map((notifiedMember) => {
            if (
              notifiedMember?.email &&
              !uniqueNotifiedMembersSet.has(notifiedMember.email)
            ) {
              uniqueNotifiedMembersSet.add(notifiedMember.email);
              uniqueNotifiedMembers.push(notifiedMember);
            }
          });
        });

        setReport({
          ...response.data.report,
          report_steps: response.data.report.report_steps.map(
            (rs, rsIndex) => ({
              ...rs,
              originalIndex: rsIndex,
            })
          ),
          assignees: uniqueAssignees,
          notifiedMembers: uniqueNotifiedMembers,
        });
        setSelectedStep({ ...response.data.report.report_steps[0], index: 0 });
      })
      .catch((error) => {
        console.log(error);
        if (error.response.data?.error_type === "NotFound") {
          setFetchError(true);
        }
      })
      .finally(() => {
        setLoading(false);
      });
  }

  const executedSteps =
    report?.report_steps.filter(
      (s) =>
        s.status === "completed" ||
        s.status === "cancelled" ||
        s.status === "submitted"
    ) || [];
  const skippedSteps =
    report?.report_steps.filter((s) => s.status === "skipped") || [];
  useEffect(() => {
    const controller = new AbortController();
    fetchReportDetails(controller);

    return () => {
      controller.abort();
    };
  }, []);

  return !fetchError ? (
    <ReportDetailsLayout
      reportUID={UID}
      setCurrentPage={setCurrentPage}
      currentPage={currentPage}
      generatePdf={generatePdf}
    >
      <Flex flexDir={"column"} pt={"20px"}>
        <Flex flexDir={"column"} alignItems={"center"}>
          <Flex
            p={"20px"}
            bg={"#ededed"}
            w={"900px"}
            justify={"center"}
            flexDirection={"column"}
          >
            <Flex p={"20px"} pb={"0px"} bg={"white"}>
              <Flex
                w={"100%"}
                alignItems={"center"}
                justify={"space-between"}
                color={"#dc143c"}
                background={"white"}
                pb={report?.description ? "40px" : ""}
                borderBottom={report?.description ? "1px solid #dc143c" : ""}
              >
                <Flex flexDir={"column"}>
                  <Flex fontSize={"20px"}>Work Order Report</Flex>
                  <Flex fontSize={"32px"} fontWeight={700}>
                    {report?.name}
                  </Flex>
                  <Flex color={"#848484"} fontWeight={700}>
                    {" "}
                    {report?.report_custom_id}
                  </Flex>

                  <Flex gap={"5px"} color={"#848484"}>
                    <Flex>{report?.work_site?.name}</Flex>
                    <Flex>-</Flex>
                    {moment(report?.started_at).format(
                      "DD MMMM YYYY hh:mm A"
                    )}{" "}
                  </Flex>
                </Flex>
                <Flex minW={"170px"} gap={"10px"} alignItems={"center"}>
                  <QRCodeCanvas
                    value={report?.UID} // The data to encode
                    size={80} // Size of the QR code in pixels
                    bgColor="#ffffff" // Background color
                    fgColor="#000000" // Foreground (QR code) color
                    level="L" // Error correction level (L, M, Q, H)
                  />
                  <Image w={"80px"} src={logoEgeeTouchRed}></Image>
                </Flex>
              </Flex>
            </Flex>
            <Flex
              minH={"900px"}
              w={"100%"}
              px={"20px"}
              py={"20px"}
              bg={"white"}
            >
              <Flex w={"100%"} flexDir={"column"} gap={"20px"}>
                <Flex
                  fontSize={"16px"}
                  color={report?.description ? "black" : "#848484"}
                >
                  {report?.description}
                </Flex>
                <Flex borderY={"1px solid #848484"} justify={"space-between"}>
                  <Flex
                    borderRight={"1px solid #848484"}
                    flexDir={"column"}
                    w={"33%"}
                    gap={"10px"}
                    p={"10px"}
                  >
                    <Flex fontSize={"14px"} color={"#848484"}>
                      Total Steps
                    </Flex>
                    <Flex fontWeight={700} fontSize={"18px"}>
                      {report?.report_steps.length}
                    </Flex>
                  </Flex>
                  <Flex
                    borderRight={"1px solid #848484"}
                    flexDir={"column"}
                    w={"33%"}
                    gap={"10px"}
                    p={"10px"}
                  >
                    <Flex fontSize={"14px"} color={"#848484"}>
                      Completion Time
                    </Flex>
                    <Flex
                      color={report?.status === "overdue" ? "#dc143c" : "black"}
                      fontWeight={700}
                      fontSize={"18px"}
                      alignItems={"center"}
                      gap={"5px"}
                    >
                      {moment(report?.finished_at).format(
                        "DD MMMM YYYY hh:mm A"
                      )}
                      {report?.status === "overdue" ? (
                        <Tooltip
                          label="This work order was completed past its deadline."
                          hasArrow
                          placement="top"
                          bg={"#dc143c"}
                        >
                          <Flex fontSize={"20px"}>
                            <IoWarning />
                          </Flex>
                        </Tooltip>
                      ) : (
                        ""
                      )}
                    </Flex>
                  </Flex>
                  <Flex p={"10px"} flexDir={"column"} w={"33%"} gap={"10px"}>
                    <Flex fontSize={"14px"} color={"#848484"}>
                      Deadline Time
                    </Flex>
                    <Flex fontWeight={700} fontSize={"18px"}>
                      {moment(report?.deadline_date_time).format(
                        "DD MMMM YYYY hh:mm A"
                      )}{" "}
                    </Flex>
                  </Flex>
                </Flex>
                {currentPage === "overview" ? (
                  <>
                    <Flex flexDir={"column"} gap={"10px"}>
                      <Flex
                        fontSize={"20px"}
                        fontWeight={700}
                        color={"#dc143c"}
                      >
                        Creator
                      </Flex>
                      <Flex w={"100%"} justify={"center"}>
                        <TableContainer
                          w={"100%"}
                          boxShadow={"0px 0px 3px rgba(50,50,93,0.5)"}
                        >
                          <Table variant="simple" borderColor={"blue"}>
                            <Thead>
                              <Tr>
                                <Th
                                  borderColor={"#bababa"}
                                  w={"52px"}
                                  px={"16px"}
                                >
                                  No
                                </Th>
                                <Th borderColor={"#bababa"}>Name</Th>
                                <Th borderColor={"#bababa"} w={"30%"}>
                                  Email
                                </Th>
                                <Th borderColor={"#bababa"}>Phone Number</Th>
                              </Tr>
                            </Thead>

                            <Tbody fontSize={"14px"}>
                              <Tr fontWeight={700}>
                                <Td px={"16px"} py={"8px"}>
                                  1.
                                </Td>
                                <Td
                                  px={"16px"}
                                  borderTop={"1px solid blue"}
                                  py={"8px"}
                                >
                                  <Flex alignItems={"center"} gap={"10px"}>
                                    {creatorInfo.first_name ? (
                                      <Avatar
                                        position={"static"}
                                        outline={"1px solid #dc143c"}
                                        border={"2px solid white"}
                                        name={
                                          creatorInfo.first_name +
                                          " " +
                                          creatorInfo.last_name
                                        }
                                        src={
                                          creatorInfo.profile_image_url
                                            ? creatorInfo.profile_image_url
                                            : null
                                        }
                                      ></Avatar>
                                    ) : (
                                      <Flex
                                        outline={"1px solid #dc143c"}
                                        bg={"#bababa"}
                                        borderRadius={"100%"}
                                        justifyContent={"center"}
                                        alignItems={"center"}
                                        h={"48px"}
                                        w={"48px"}
                                        border={"2px solid white"}
                                      >
                                        <Flex color={"white"} fontSize={"24px"}>
                                          <FaUserAlt />
                                        </Flex>
                                      </Flex>
                                    )}
                                    <Flex flexDir={"column"}>
                                      <Flex>
                                        {creatorInfo.first_name +
                                          " " +
                                          creatorInfo.last_name}
                                      </Flex>
                                      <Flex
                                        fontWeight={400}
                                        fontSize={"14px"}
                                        color={"#848484"}
                                      >
                                        {labelizeRole(creatorInfo.role) +
                                          (creatorInfo?.employee_id
                                            ? " - " + creatorInfo.employee_id
                                            : "")}
                                      </Flex>
                                    </Flex>
                                  </Flex>
                                </Td>
                                <Td px={"16px"} py={"8px"}>
                                  {creatorInfo.email}
                                </Td>
                                <Td px={"16px"} py={"8px"} color={"black"}>
                                  {creatorInfo.phone_number || "-"}
                                </Td>
                              </Tr>
                            </Tbody>
                          </Table>
                        </TableContainer>
                      </Flex>
                    </Flex>
                    {report?.co_creator_members?.length ? (
                      <Flex flexDir={"column"} gap={"10px"}>
                        <Flex
                          fontSize={"20px"}
                          fontWeight={700}
                          color={"#dc143c"}
                        >
                          Co-Creator
                        </Flex>
                        <Flex w={"100%"} justify={"center"}>
                          <TableContainer
                            w={"100%"}
                            boxShadow={"0px 0px 3px rgba(50,50,93,0.5)"}
                          >
                            <Table variant="simple" borderColor={"blue"}>
                              <Thead>
                                <Tr>
                                  <Th
                                    borderColor={"#bababa"}
                                    w={"52px"}
                                    px={"16px"}
                                  >
                                    No
                                  </Th>
                                  <Th borderColor={"#bababa"}>Name</Th>
                                  <Th borderColor={"#bababa"} w={"30%"}>
                                    Email
                                  </Th>
                                  <Th borderColor={"#bababa"}>Phone Number</Th>
                                </Tr>
                              </Thead>

                              <Tbody fontSize={"14px"}>
                                {report?.co_creator_members.map((coCreator) => (
                                  <Tr fontWeight={700}>
                                    <Td px={"16px"} py={"8px"}>
                                      1.
                                    </Td>
                                    <Td
                                      px={"16px"}
                                      borderTop={"1px solid blue"}
                                      py={"8px"}
                                    >
                                      <Flex alignItems={"center"} gap={"10px"}>
                                        {coCreator?.first_name ? (
                                          <Avatar
                                            position={"static"}
                                            outline={"1px solid #dc143c"}
                                            border={"2px solid white"}
                                            name={
                                              coCreator?.first_name +
                                              " " +
                                              coCreator?.last_name
                                            }
                                            src={
                                              coCreator?.profile_image_url
                                                ? coCreator?.profile_image_url
                                                : null
                                            }
                                          ></Avatar>
                                        ) : (
                                          <Flex
                                            outline={"1px solid #dc143c"}
                                            bg={"#bababa"}
                                            borderRadius={"100%"}
                                            justifyContent={"center"}
                                            alignItems={"center"}
                                            h={"48px"}
                                            w={"48px"}
                                            border={"2px solid white"}
                                          >
                                            <Flex
                                              color={"white"}
                                              fontSize={"24px"}
                                            >
                                              <FaUserAlt />
                                            </Flex>
                                          </Flex>
                                        )}
                                        <Flex flexDir={"column"}>
                                          <Flex>
                                            {coCreator?.first_name +
                                              " " +
                                              coCreator?.last_name}
                                          </Flex>
                                          <Flex
                                            fontWeight={400}
                                            fontSize={"14px"}
                                            color={"#848484"}
                                          >
                                            {labelizeRole(coCreator?.role) +
                                              " - " +
                                              coCreator?.employee_id}
                                          </Flex>
                                        </Flex>
                                      </Flex>
                                    </Td>
                                    <Td px={"16px"} py={"8px"}>
                                      {coCreator?.email}
                                    </Td>
                                    <Td px={"16px"} py={"8px"} color={"black"}>
                                      {coCreator.phone_number || "-"}
                                    </Td>
                                  </Tr>
                                ))}
                              </Tbody>
                            </Table>
                          </TableContainer>
                        </Flex>
                      </Flex>
                    ) : (
                      ""
                    )}

                    <Flex flexDir={"column"} gap={"10px"}>
                      <Flex
                        fontSize={"20px"}
                        fontWeight={700}
                        color={"#dc143c"}
                      >
                        Assignees
                      </Flex>
                      <Flex w={"100%"} justify={"center"}>
                        <TableContainer
                          w={"100%"}
                          boxShadow={"0px 0px 3px rgba(50,50,93,0.5)"}
                        >
                          <Table variant="simple" borderColor={"blue"}>
                            <Thead>
                              <Tr>
                                <Th
                                  borderColor={"#bababa"}
                                  w={"52px"}
                                  px={"16px"}
                                >
                                  No
                                </Th>
                                <Th borderColor={"#bababa"}>Name</Th>
                                <Th borderColor={"#bababa"} w={"30%"}>
                                  Email
                                </Th>
                                <Th borderColor={"#bababa"}>Phone Number</Th>
                              </Tr>
                            </Thead>

                            <Tbody fontSize={"14px"}>
                              {report?.assignees.map((assignee, index) => (
                                <Tr fontWeight={700}>
                                  <Td px={"16px"} py={"8px"}>
                                    {index + 1}.
                                  </Td>
                                  <Td
                                    px={"16px"}
                                    borderTop={"1px solid blue"}
                                    py={"8px"}
                                  >
                                    <Flex alignItems={"center"} gap={"10px"}>
                                      {assignee.first_name ? (
                                        <Avatar
                                          // bg={"#848484"}
                                          // color={"black"}
                                          position={"static"}
                                          outline={"1px solid #dc143c"}
                                          border={"2px solid white"}
                                          key={
                                            assignee?.first_name +
                                            assignee?.last_name +
                                            "_" +
                                            index
                                          }
                                          name={
                                            assignee.first_name +
                                            " " +
                                            assignee.last_name
                                          }
                                          src={
                                            assignee.profile_image_url
                                              ? assignee.profile_image_url
                                              : null
                                          }
                                        ></Avatar>
                                      ) : (
                                        <Flex
                                          outline={"1px solid #dc143c"}
                                          bg={"#bababa"}
                                          borderRadius={"100%"}
                                          justifyContent={"center"}
                                          alignItems={"center"}
                                          h={"48px"}
                                          w={"48px"}
                                          border={"2px solid white"}
                                        >
                                          <Flex
                                            color={"white"}
                                            fontSize={"24px"}
                                          >
                                            <FaUserAlt />
                                          </Flex>
                                        </Flex>
                                      )}
                                      <Flex flexDir={"column"}>
                                        <Flex
                                          display={"inline-block"}
                                          overflow={"hidden"}
                                          textOverflow={"ellipsis"}
                                          whiteSpace={"nowrap"}
                                          maxW={"200px"}
                                        >
                                          {assignee.first_name +
                                            " " +
                                            assignee.last_name}
                                        </Flex>
                                        <Flex
                                          fontWeight={400}
                                          fontSize={"14px"}
                                          color={"#848484"}
                                        >
                                          {labelizeRole(assignee.role) +
                                            " - " +
                                            assignee.employee_id}
                                        </Flex>
                                      </Flex>
                                    </Flex>
                                  </Td>
                                  <Td px={"16px"} py={"8px"}>
                                    <Flex
                                      display={"inline-block"}
                                      overflow={"hidden"}
                                      textOverflow={"ellipsis"}
                                      whiteSpace={"nowrap"}
                                      maxW={"200px"}
                                    >
                                      {assignee.email}
                                    </Flex>
                                  </Td>
                                  <Td px={"16px"} py={"8px"} color={"black"}>
                                    <Flex
                                      display={"inline-block"}
                                      overflow={"hidden"}
                                      textOverflow={"ellipsis"}
                                      whiteSpace={"nowrap"}
                                      maxW={"200px"}
                                    >
                                      {assignee.phone_number || "-"}
                                    </Flex>
                                  </Td>
                                </Tr>
                              ))}
                            </Tbody>
                          </Table>
                        </TableContainer>
                      </Flex>
                    </Flex>
                    {report?.notifiedMembers?.length ? (
                      <Flex flexDir={"column"} gap={"10px"}>
                        <Flex
                          fontSize={"20px"}
                          fontWeight={700}
                          color={"#dc143c"}
                        >
                          Notified Members
                        </Flex>
                        <Flex w={"100%"} justify={"center"}>
                          <TableContainer
                            w={"100%"}
                            boxShadow={"0px 0px 3px rgba(50,50,93,0.5)"}
                            // border={"1px solid black"}
                          >
                            <Table variant="simple">
                              <Thead>
                                <Tr>
                                  <Th
                                    borderColor={"#bababa"}
                                    w={"52px"}
                                    px={"16px"}
                                  >
                                    No
                                  </Th>
                                  <Th borderColor={"#bababa"}>Name</Th>
                                  <Th borderColor={"#bababa"} w={"30%"}>
                                    Email
                                  </Th>
                                  <Th borderColor={"#bababa"} w={"20%"}>
                                    Phone Number
                                  </Th>
                                </Tr>
                              </Thead>
                              <Tbody fontSize={"14px"}>
                                {report?.notifiedMembers?.length === 0 ||
                                !report?.notifiedMembers ? (
                                  <Tr>
                                    <Td colSpan={6} bg={"#f8f9fa"}>
                                      <Flex
                                        w={"100%"}
                                        h={"80px"}
                                        justify={"center"}
                                        flexDir={"column"}
                                        gap={"5px"}
                                      >
                                        <Flex
                                          fontSize={"16px"}
                                          fontWeight={700}
                                          justify={"center"}
                                          alignItems={"center"}
                                          color={"#dc143c"}
                                        >
                                          <Flex>No members were notified!</Flex>
                                        </Flex>
                                        <Flex
                                          justify={"center"}
                                          // color={"#848484"}
                                          fontWeight={700}
                                        >
                                          This work order has no assigned
                                          recipients for notifications.
                                        </Flex>
                                      </Flex>
                                    </Td>
                                  </Tr>
                                ) : (
                                  report?.notifiedMembers.map(
                                    (notifiedMember, index) => (
                                      <Tr fontWeight={700}>
                                        <Td px={"16px"} py={"8px"}>
                                          {index + 1}.
                                        </Td>
                                        <Td px={"16px"} py={"8px"}>
                                          <Flex
                                            alignItems={"center"}
                                            gap={"10px"}
                                          >
                                            {notifiedMember.first_name ? (
                                              <Avatar
                                                position={"static"}
                                                outline={"1px solid #dc143c"}
                                                border={"2px solid white"}
                                                name={
                                                  notifiedMember.first_name +
                                                  " " +
                                                  notifiedMember.last_name
                                                }
                                                src={
                                                  notifiedMember.profile_image_url
                                                    ? notifiedMember.profile_image_url
                                                    : null
                                                }
                                              ></Avatar>
                                            ) : (
                                              <Flex
                                                outline={"1px solid #dc143c"}
                                                bg={"#bababa"}
                                                borderRadius={"100%"}
                                                justifyContent={"center"}
                                                alignItems={"center"}
                                                h={"48px"}
                                                w={"48px"}
                                                border={"2px solid white"}
                                              >
                                                <Flex
                                                  color={"white"}
                                                  fontSize={"24px"}
                                                >
                                                  <FaUserAlt />
                                                </Flex>
                                              </Flex>
                                            )}
                                            <Flex flexDir={"column"}>
                                              <Flex>
                                                {notifiedMember.first_name +
                                                  " " +
                                                  notifiedMember.last_name}
                                              </Flex>
                                              <Flex
                                                fontWeight={400}
                                                fontSize={"14px"}
                                                color={"#848484"}
                                              >
                                                {labelizeRole(
                                                  notifiedMember.role
                                                ) +
                                                  " - " +
                                                  notifiedMember.employee_id}
                                              </Flex>
                                            </Flex>
                                          </Flex>
                                        </Td>
                                        <Td px={"16px"} py={"8px"}>
                                          {notifiedMember.email}
                                        </Td>
                                        <Td px={"16px"} py={"8px"}>
                                          {notifiedMember.phone_number || "-"}
                                        </Td>
                                      </Tr>
                                    )
                                  )
                                )}
                              </Tbody>
                            </Table>
                          </TableContainer>
                        </Flex>
                      </Flex>
                    ) : (
                      ""
                    )}
                    {report?.flow_chart_images?.[0] ? (
                      <Flex flexDir={"column"} gap={"10px"}>
                        <Flex
                          fontSize={"20px"}
                          fontWeight={700}
                          color={"#dc143c"}
                        >
                          Work Flow
                        </Flex>
                        <Flex
                          flexDir={"column"}
                          gap={"8px"}
                          w={"100%"}
                          justify={"center"}
                        >
                          <Flex border={"1px solid #bababa"}>
                            <Image src={report?.flow_chart_images?.[0]} />
                          </Flex>
                        </Flex>
                      </Flex>
                    ) : (
                      ""
                    )}

                    <Flex flexDir={"column"} gap={"10px"}>
                      <Flex
                        fontSize={"20px"}
                        fontWeight={700}
                        color={"#dc143c"}
                      >
                        Executed Steps
                      </Flex>
                      <Flex
                        flexDir={"column"}
                        gap={"8px"}
                        w={"100%"}
                        justify={"center"}
                      >
                        {executedSteps.map((val, index) => (
                          <ReportDetailsStep
                            val={val}
                            reportSteps={executedSteps}
                            index={index}
                            setSelectedStep={setSelectedStep}
                            onOpen={onOpen}
                          />
                        ))}
                      </Flex>
                    </Flex>
                    {skippedSteps.length ? (
                      <Flex flexDir={"column"} gap={"10px"}>
                        <Flex
                          fontSize={"20px"}
                          fontWeight={700}
                          color={"#dc143c"}
                        >
                          Skipped Steps
                        </Flex>
                        <Flex
                          flexDir={"column"}
                          gap={"8px"}
                          w={"100%"}
                          justify={"center"}
                        >
                          {skippedSteps.map((val, index) => (
                            <ReportDetailsStep
                              val={val}
                              reportSteps={skippedSteps}
                              index={index}
                              setSelectedStep={setSelectedStep}
                              onOpen={onOpen}
                            />
                          ))}
                        </Flex>
                      </Flex>
                    ) : (
                      ""
                    )}
                  </>
                ) : currentPage === "auditLogs" ? (
                  <Flex flexDir={"column"} gap={"10px"}>
                    <Flex fontSize={"20px"} fontWeight={700} color={"#dc143c"}>
                      Audit Logs
                    </Flex>
                    <Flex w={"100%"} justify={"center"}>
                      <Flex
                        flexDir={"column"}
                        w={"100%"}
                        justify={"center"}
                        borderTop={"1px solid #bababa"}
                      >
                        {report.report_audit_logs.length ? (
                          report.report_audit_logs.map((val, index) => (
                            <Flex
                              borderBottom={"1px solid #bababa"}
                              flexDir={"column"}
                              className="page-break-inside"
                              w={"100%"}
                            >
                              <Flex py={"15px"}>
                                <WorkOrderDetailsAuditLog
                                  index={index}
                                  val={{
                                    ...val,
                                    type: val.type || "manual",
                                  }}
                                />
                              </Flex>
                            </Flex>
                          ))
                        ) : (
                          <ListEmptyState
                            isTable={false}
                            header1={"No audit logs found."}
                            header2={"to begin tracking them."}
                            linkText={"Update the work order"}
                          />
                        )}
                      </Flex>
                    </Flex>
                  </Flex>
                ) : (
                  ""
                )}
              </Flex>
            </Flex>
          </Flex>
        </Flex>
      </Flex>
      <ReportDetailsStepModal
        report={report}
        onClose={onClose}
        isOpen={isOpen}
        selectedStep={selectedStep}
        setSelectedStep={setSelectedStep}
      />
    </ReportDetailsLayout>
  ) : (
    <ReportDetails404Page />
  );
}
