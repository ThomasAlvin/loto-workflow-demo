import {
  Box,
  Button,
  ButtonGroup,
  Divider,
  Flex,
  IconButton,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
} from "@chakra-ui/react";
import { FaArrowLeftLong, FaChevronUp } from "react-icons/fa6";
import { MdFileDownload } from "react-icons/md";

import {
  useLocation,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";
import { FaRegFilePdf, FaRegFileWord, FaSearch } from "react-icons/fa";
import { api } from "../../api/api";
import Swal from "sweetalert2";
import SwalErrorMessages from "../SwalErrorMessages";
import { FiCheckCircle, FiXCircle } from "react-icons/fi";
import ReviewDetailsRejectModal from "../Review/ReviewDetailsRejectModal";
import ReviewDetailsApproveModal from "../Review/ReviewDetailsApproveModal";
import { useState } from "react";
import { IoSearch } from "react-icons/io5";
import checkHasPermission from "../../utils/checkHasPermission";
import { useSelector } from "react-redux";
export default function WorkOrderDetailsNavbar({
  variant,
  workOrderReviewerStatus,
  flaggedSteps,
  currentPage,
  setCurrentPage,
  workOrder,
  workOrderReviewerUID,
  fetchReviewDetails,
  reviewAbortControllerRef,
  reviewApproveDisabled,
}) {
  const userSelector = useSelector((state) => state.login.auth);
  const nav = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const from = searchParams.get("from");
  const { UID } = useParams();
  const [buttonLoading, setButtonLoading] = useState(false);
  //old handleBackRedirect
  // function handleBackRedirect() {
  //   if (from === "assigned-work-order") {
  //     nav("/assigned-work-order");
  //     return;
  //   }
  //   if (variant === "review") {
  //     nav("/review");
  //     return;
  //   }
  //   if (currentPage === "auditLogs") {
  //     setCurrentPage("overview");
  //     return;
  //   }
  //   nav("/work-order");
  // }
  function handleBackRedirect() {
    if (from === "assigned-work-order") {
      const newParams = new URLSearchParams(searchParams.toString());
      newParams.delete("from");
      const queryString = newParams.toString();
      const path = `/assigned-work-order${
        queryString ? `?${queryString}` : ""
      }`;

      nav(path);
      return;
    }
    if (variant === "review") {
      nav(`/review${location.search}`);
      return;
    }
    if (currentPage === "auditLogs") {
      setCurrentPage("overview");
      return;
    }
    if (
      checkHasPermission(userSelector, "work_orders", ["view", "view_assigned"])
    ) {
      nav(`/work-order${location.search}`);
    } else if (
      checkHasPermission(userSelector, "assigned_work_order", ["full_access"])
    ) {
      nav("/assigned-work-order");
    } else {
      console.log(userSelector);
      nav("/starter-guide");
    }
  }

  async function finishWorkOrder() {
    api
      .post(`work-order/finish/${UID}`)
      .then((response) => {
        // nav("/work-order");
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
      })
      .catch((error) => {
        Swal.fire({
          title: "Oops...",
          icon: "error",
          html: SwalErrorMessages(error.response.data.message),
          customClass: {
            popup: "swal2-custom-popup",
            title: "swal2-custom-title",
            content: "swal2-custom-content",
            actions: "swal2-custom-actions",
            confirmButton: "swal2-custom-confirm-button",
          },
        });
        console.log(error);
      })
      .finally(() => {
        // setLoading(false);
        // onClose();
      });
  }

  return (
    <Flex
      // display={"none"}
      flexDir={"column"}
      zIndex={10}
      bg={"white"}
      position={"sticky"}
      top={0}
    >
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
          alignItems={"center"}
          gap={"10px"}
          fontWeight={700}
          fontSize={"16px"}
          h={"60px"}
        >
          {variant !== "review" && (
            <>
              <Button
                _hover={{ bg: "#FFB0B0", color: "crimson" }}
                width={"150px"}
                h={"auto"}
                justifyContent={"center"}
                borderTopLeftRadius={"20px"}
                borderTopRightRadius={"20px"}
                borderBottomLeftRadius={"0px"}
                borderBottomRightRadius={"0px"}
                bg={currentPage === "overview" ? "#FFB0B0" : ""}
                color={currentPage === "overview" ? "crimson" : "#848484"}
                py={"20px"}
                borderBottom={
                  currentPage === "overview" ? "crimson 2px solid" : ""
                }
                onClick={() => setCurrentPage("overview")}
              >
                1. Overview
              </Button>
              <Button
                _hover={{ bg: "#FFB0B0", color: "crimson" }}
                width={"150px"}
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
              <Button
                _hover={{ bg: "#FFB0B0", color: "crimson" }}
                width={"150px"}
                h={"auto"}
                transition={"none"}
                isDisabled={
                  workOrder?.latest_work_order_reviews?.length ? false : true
                }
                justifyContent={"center"}
                borderTopLeftRadius={"20px"}
                borderTopRightRadius={"20px"}
                borderBottomLeftRadius={"0px"}
                borderBottomRightRadius={"0px"}
                bg={currentPage === "reviews" ? "#FFB0B0" : ""}
                color={currentPage === "reviews" ? "crimson" : "#848484"}
                py={"20px"}
                borderBottom={
                  currentPage === "reviews" ? "crimson 2px solid" : ""
                }
                onClick={() => setCurrentPage("reviews")}
              >
                3. Reviews
              </Button>
            </>
          )}
        </Flex>
        <Box
          color={"crimson"}
          position="absolute"
          top="50%"
          transform="translate(0%, -50%)"
          right="40px"
        >
          {variant === "review" ? (
            workOrderReviewerStatus === "pending" ? (
              <Flex alignItems={"center"} gap={"30px"}>
                <Flex>
                  <ReviewDetailsRejectModal
                    fetchReviewDetails={fetchReviewDetails}
                    abortControllerRef={reviewAbortControllerRef}
                    buttonLoading={buttonLoading}
                    setButtonLoading={setButtonLoading}
                    workOrderReviewerUID={workOrderReviewerUID}
                    flaggedSteps={flaggedSteps}
                  />
                </Flex>
                <Flex>
                  <ReviewDetailsApproveModal
                    isDisabled={reviewApproveDisabled}
                    fetchReviewDetails={fetchReviewDetails}
                    abortControllerRef={reviewAbortControllerRef}
                    buttonLoading={buttonLoading}
                    setButtonLoading={setButtonLoading}
                    workOrderReviewerUID={workOrderReviewerUID}
                  />
                </Flex>
              </Flex>
            ) : (
              ""
            )
          ) : (
            <Flex alignItems={"center"} gap={"30px"}>
              {/* <Flex>
                <ButtonGroup
                  border={"1px solid #dc143c"}
                  isAttached
                  variant="outline"
                  borderRadius={"5px"}
                >
                  <Button
                    borderRadius={"5px"}
                    border={"none"}
                    borderRight={"1px solid #dc143c"}
                    alignItems={"center"}
                    gap={"10px"}
                    color={"#dc143c"}
                    _hover={{ background: "#dc143c", color: "white" }}
                  >
                    <MdFileDownload fontSize={"20px"} />
                    Download PDF
                  </Button>

                  <Menu>
                    <MenuButton
                      border={"none"}
                      px={"16px"}
                      borderRadius={"0px"}
                      as={IconButton}
                      aria-label="Options"
                      fontSize={"20px"}
                      icon={<FaChevronUp />}
                      variant="outline"
                      color={"#dc143c"}
                      _hover={{ background: "#dc143c", color: "white" }}
                      _active={{ background: "#dc143c", color: "white" }}
                    />
                    <MenuList>
                      <MenuItem>
                        <Flex gap={"10px"} alignItems={"center"}>
                          <FaRegFilePdf />
                          PDF
                        </Flex>
                      </MenuItem>
                      <MenuItem>
                        <Flex gap={"10px"} alignItems={"center"}>
                          <FaRegFileWord />
                          Word
                        </Flex>
                      </MenuItem>
                    </MenuList>
                  </Menu>
                </ButtonGroup>
              </Flex> */}
              {/* <Flex>
                <Button
                  zIndex={"200"}
                  px={"20px"}
                  bg={"#dc143c"}
                  color={"white"}
                  alignItems={"center"}
                  gap={"10px"}
                  onClick={finishWorkOrder}
                >
                  Finish Work Order
                </Button>
              </Flex> */}
            </Flex>
          )}
        </Box>
      </Flex>
      <Divider m={0} borderColor={"#848484"} />
    </Flex>
  );
}
