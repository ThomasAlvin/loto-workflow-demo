import { Flex } from "@chakra-ui/react";
import { useLoading } from "../../service/LoadingContext";
import CreateTemplateAndWorkOrderSidebar from "../CreateTemplateAndWorkOrderSidebar";
import WorkOrderNavbar from "../CreateWorkOrder/WorkOrderNavbar";
import LoadingOverlay from "../LoadingOverlay";

export default function CreateWorkOrderLayout({
  children,
  stage,
  formik,
  currentPage,
  setCurrentPage,
  variant,
  hasSidebar,
  hasChanged,
  workOrderStatus,
}) {
  const { loading, setLoading } = useLoading();
  return (
    <>
      <Flex w={"100%"} flexDir={"column"} height={"100vh"}>
        <Flex w={"100%"}>
          <Flex w={"100%"} pb={"100px"} flexDir={"column"}>
            <WorkOrderNavbar
              formik={formik}
              stage={stage}
              currentPage={currentPage}
              setCurrentPage={setCurrentPage}
              hasChanged={hasChanged}
              variant={variant}
              workOrderStatus={workOrderStatus}
            />
            {children}
          </Flex>
          {hasSidebar ? <CreateTemplateAndWorkOrderSidebar /> : ""}
        </Flex>
      </Flex>
      {loading && <LoadingOverlay />}
    </>
  );
}
