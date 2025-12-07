import { Box, Center, Divider, Flex, Spinner } from "@chakra-ui/react";
import CreateTemplateNavbar from "../CreateTemplate/CreateTemplateNavbar";
import { useState } from "react";
import { useLoading } from "../../service/LoadingContext";
import LoadingOverlay from "../LoadingOverlay";
import CreateTemplateAndWorkOrderSidebar from "../CreateTemplateAndWorkOrderSidebar";

export default function CreateTemplateLayout({
  children,
  formik,
  currentPage,
  setCurrentPage,
  stage,
  hasSidebar,
  templateDetails,
  submitTemplate,
  templateStatus,
  hasChanged,
  variant,
}) {
  const { loading, setLoading } = useLoading();
  console.log(formik);

  return (
    <>
      <Flex w={"100%"} flexDir={"column"} height={"100vh"}>
        <Flex w={"100%"}>
          <Flex w={"100%"} pb={"100px"} flexDir={"column"}>
            <CreateTemplateNavbar
              currentPage={currentPage}
              setCurrentPage={setCurrentPage}
              stage={stage}
              formik={formik}
              templateDetails={templateDetails}
              hasChanged={hasChanged}
              submitTemplate={submitTemplate}
              templateStatus={templateStatus}
              variant={variant}
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
