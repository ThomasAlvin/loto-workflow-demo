import { Box, Button, Divider, Flex, useDisclosure } from "@chakra-ui/react";
import { FaArrowLeftLong } from "react-icons/fa6";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import TemplateSaveAsDraftConfirmationModal from "./TemplateSaveAsDraftConfirmationModal";
import SaveChangesConfirmationModal from "../CreateEditWorkOrderTemplate/SaveChangesConfirmationModal";
export default function CreateTemplateNavbar({
  currentPage,
  setCurrentPage,
  stage,
  formik,
  templateDetails,
  hasChanged,
  submitTemplate,
  templateStatus,
  variant,
}) {
  console.log(formik);

  const saveChangesDisclosure = useDisclosure();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const previousPage = searchParams.get("from");
  const nav = useNavigate();
  function handleBackRedirect() {
    if (currentPage === "access") {
      setCurrentPage("build");
    } else {
      if (hasChanged && templateStatus !== "completed") {
        saveChangesDisclosure.onOpen();
      } else {
        nav(`/template${location.search}`);
      }
    }
  }

  return (
    <Flex flexDir={"column"}>
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
            // onClick={() => nav("/template/create/build")}
            onClick={() => setCurrentPage("build")}
          >
            1. Build
          </Button>
          <Button
            isDisabled={!(formik?.isValid ?? true)}
            _hover={{ bg: "#FFB0B0", color: "crimson" }}
            width={"120px"}
            h={"auto"}
            transition={"none"}
            justifyContent={"center"}
            borderTopLeftRadius={"20px"}
            borderTopRightRadius={"20px"}
            borderBottomLeftRadius={"0px"}
            borderBottomRightRadius={"0px"}
            bg={stage === "access" ? "#FFB0B0" : ""}
            py={"20px"}
            borderBottom={stage === "access" ? "crimson 2px solid" : ""}
            color={stage === "access" ? "crimson" : "#848484"}
            // onClick={() =>
            //   nav("/template/create/access?from=" + location.pathname)
            // }
            onClick={() => setCurrentPage("access")}
          >
            2. Access
          </Button>
        </Flex>
      </Flex>
      <Divider m={0} borderColor={"#848484"} />
      {templateStatus !== "completed" ? (
        <Flex
          justify={"right"}
          py={"8px"}
          bg={"#FFE6E6"}
          px={"20px"}
          w={"100%"}
        >
          <TemplateSaveAsDraftConfirmationModal
            submitTemplate={submitTemplate}
            templateDetails={templateDetails}
          />
        </Flex>
      ) : (
        ""
      )}
      <SaveChangesConfirmationModal
        module={"template"}
        variant={variant}
        saveChangesDisclosure={saveChangesDisclosure}
        moduleDetails={{
          ...templateDetails,
          workOrderSteps: formik.values?.templateSteps,
        }}
      />
    </Flex>
  );
}
