import { Flex } from "@chakra-ui/react";
import { useLoading } from "../../service/LoadingContext";
import LoadingOverlay from "../LoadingOverlay";
import ReportDetailsNavbar from "../Report/ReportDetailsNavbar";

export default function ReportDetailsLayout({
  children,
  reportName,
  generatePdf,
  currentPage,
  setCurrentPage,
}) {
  const { loading, setLoading } = useLoading();
  return (
    <>
      <Flex w={"100%"} flexDir={"column"} height={"100vh"}>
        <Flex w={"100%"}>
          <Flex w={"100%"} pb={"100px"} flexDir={"column"}>
            <ReportDetailsNavbar
              currentPage={currentPage}
              reportName={reportName}
              setCurrentPage={setCurrentPage}
              generatePdf={generatePdf}
            />
            {children}
          </Flex>
        </Flex>
      </Flex>
      {loading && <LoadingOverlay />}
    </>
  );
}
