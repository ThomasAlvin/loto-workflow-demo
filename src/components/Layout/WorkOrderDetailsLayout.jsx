import { Box, Center, Divider, Flex, Spinner } from "@chakra-ui/react";
import { useLoading } from "../../service/LoadingContext";
import LoadingOverlay from "../LoadingOverlay";
import ReportDetailsNavbar from "../Report/ReportDetailsNavbar";
import WorkOrderDetailsNavbar from "../WorkOrders/WorkOrderDetailsNavbar";

export default function WorkOrderDetailsLayout({
  children,
  variant,
  workOrderReviewerStatus,
  flaggedSteps,
  currentPage,
  setCurrentPage,
  workOrder,
  workOrderReviewerUID,
  reviewAbortControllerRef,
  fetchReviewDetails,
  reviewApproveDisabled,
  stepDetailsDisclosure,
}) {
  const { loading, setLoading } = useLoading();
  return (
    <>
      <Flex
        w={"100%"}
        flexDir={"column"}
        overflow={stepDetailsDisclosure?.isOpen ? "hidden" : "auto"}
        height={"100vh"}
      >
        <Flex w={"100%"}>
          <Flex w={"100%"} pb={"100px"} flexDir={"column"}>
            <WorkOrderDetailsNavbar
              variant={variant}
              reviewApproveDisabled={reviewApproveDisabled}
              workOrderReviewerStatus={workOrderReviewerStatus}
              flaggedSteps={flaggedSteps}
              currentPage={currentPage}
              setCurrentPage={setCurrentPage}
              workOrder={workOrder}
              workOrderReviewerUID={workOrderReviewerUID}
              reviewAbortControllerRef={reviewAbortControllerRef}
              fetchReviewDetails={fetchReviewDetails}
            />
            {children}
          </Flex>
        </Flex>
      </Flex>
      {loading && <LoadingOverlay />}
    </>
  );
}
