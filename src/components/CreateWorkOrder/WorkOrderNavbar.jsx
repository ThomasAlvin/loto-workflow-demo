import { Box, Button, Divider, Flex, useDisclosure } from "@chakra-ui/react";
import { FaArrowLeftLong } from "react-icons/fa6";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import SaveChangesConfirmationModal from "../CreateEditWorkOrderTemplate/SaveChangesConfirmationModal";
import SaveAsTemplateModal from "./SaveAsTemplateModal";
import WorkOrderSaveAsDraftConfirmationModal from "./WorkOrderSaveAsDraftConfirmationModal";
export default function WorkOrderNavbar({
  formik,
  showUnassignedStepSwal,
  stage,
  currentPage,
  setCurrentPage,
  hasChanged,
  variant,
  workOrderStatus,
}) {
  const saveChangesDisclosure = useDisclosure();
  const [searchParams] = useSearchParams();
  const previousPage = searchParams.get("from");
  const nav = useNavigate();
  const location = useLocation();
  const duplicationIssues = location.state?.errorMessages;
  function handleBackRedirect() {
    if (currentPage === "assign") {
      setCurrentPage("build");
    } else {
      if (hasChanged) {
        saveChangesDisclosure.onOpen();
      } else {
        nav(`/work-order${location.search}`);
      }
    }
  }

  return (
    <Flex position={"sticky"} flexDir={"column"}>
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
            bg={stage === "build" ? "#FFB0B0" : ""}
            color={stage === "build" ? "crimson" : "#848484"}
            py={"20px"}
            borderBottom={stage === "build" ? "crimson 2px solid" : ""}
            onClick={() => setCurrentPage("build")}
          >
            1. Build
          </Button>
        </Flex>
      </Flex>
      <Divider m={0} borderColor={"#848484"} />
      <Flex
        position={"sticky"}
        top={0}
        justify={"right"}
        py={"8px"}
        bg={"#FFE6E6"}
        px={"20px"}
        w={"100%"}
        gap={"20px"}
      >
        {duplicationIssues?.length ? (
          <Button
            onClick={() => showUnassignedStepSwal(duplicationIssues)}
            fontSize={"14px"}
            h={"28px"}
            bg={"#ffbc21"}
            color={"white"}
          >
            <Flex alignItems={"center"} gap={"5px"}>
              <Flex>
                <FaTriangleExclamation />
              </Flex>
              <Flex>Unassigned Issues</Flex>
            </Flex>
          </Button>
        ) : (
          ""
        )}
        <SaveAsTemplateModal workOrderDetails={formik.values} />
        <WorkOrderSaveAsDraftConfirmationModal
          variant={variant}
          workOrderDetails={formik.values}
        />
      </Flex>
      <SaveChangesConfirmationModal
        module={"work_order"}
        variant={variant}
        saveChangesDisclosure={saveChangesDisclosure}
        moduleDetails={formik.values}
      />
    </Flex>
  );
}
