import {
  Box,
  Divider,
  Flex,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Tooltip,
  useDisclosure,
} from "@chakra-ui/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { FaRegEdit } from "react-icons/fa";
import { FaMagnifyingGlass } from "react-icons/fa6";
import { IoCheckmark } from "react-icons/io5";
import WorkFlowXyFlow from "../WorkFlowXyFlow";
import {
  ReactFlowProvider,
  useEdgesState,
  useNodesState,
  useReactFlow,
} from "@xyflow/react";
import DeleteMultiLockAccessConfirmationModal from "../CreateEditWorkOrderTemplate/DeleteMultiLockAccessConfirmationModal";
import { DeleteMultiLockAccessProvider } from "../../service/DeleteMultiLockAccessContext";
import convertStepsToXyFlowData from "../../utils/convertStepsToXyFlowData";
import StepDetailsDrawerDetails from "../WorkOrders/StepDetailsDrawerDetails";
import TemplateStepDetailsDrawerDetails from "./TemplateStepDetailsDrawerDetails";

function TemplateDetailsModalContent({
  selectedTemplateDetails,
  onClose,
  isOpen,
}) {
  const { fitView } = useReactFlow();
  const containerRef = useRef();
  const [steps, setSteps] = useState([]);
  const [selectedEditStep, setSelectedEditStep] = useState();
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const stepDetailsDisclosure = useDisclosure();

  const groupName = selectedTemplateDetails?.multi_lock_access_group?.name; // or any name you want to match
  const mainStep = selectedTemplateDetails?.template_steps?.find(
    (step) =>
      step?.isMainMultiLockAccess === true &&
      step?.multiLockAccessGroup?.name === groupName
  );

  const handleOpenStepDrawer = useCallback(
    (selectedStep, selectedIndex) => {
      stepDetailsDisclosure.onOpen();
      console.log(selectedStep);

      setSelectedEditStep({
        ...selectedStep,
        // Unused but maybe in the future?
        // index: selectedTemplateDetails.template_steps.findIndex(
        //   (step) => step.id === selectedStep.id
        // ),
      });
    },
    [selectedTemplateDetails?.template_steps]
  );

  useEffect(() => {
    async function loadTemplateData() {
      const filteredSteps = selectedTemplateDetails?.template_steps?.filter(
        (step) => !step.is_drafted
      );

      if (filteredSteps?.length > 0) {
        setSteps(filteredSteps.slice(0, 4));
      }

      const xyFlowData = await convertStepsToXyFlowData(
        selectedTemplateDetails?.template_steps
      );
      console.log(selectedTemplateDetails?.template_steps);

      setNodes(xyFlowData?.nodes);
      setEdges(xyFlowData?.edges);
      fitView({
        padding: 0.2,
        duration: 0,
      });
    }
    loadTemplateData();
  }, [selectedTemplateDetails?.template_steps]);
  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay />
        <ModalContent
          ref={containerRef}
          bg={"white"}
          maxW="100%"
          maxH={"100vh"}
          overflow={"hidden"}
        >
          <ModalHeader
            display={"flex"}
            gap={"10px"}
            alignItems={"center"}
            color={"#dc143c"}
          >
            <Flex flexDir={"column"}>
              <Flex color={"#dc143c"} fontSize={"24px"}>
                {selectedTemplateDetails?.name}
              </Flex>
            </Flex>
          </ModalHeader>
          <ModalCloseButton color={"black"} />
          <Divider m={0} />

          <ModalBody>
            <Flex flexDir={"column"} gap={"10px"}>
              <Flex flexDir={"column"}>
                <Box fontWeight={700} as="span" flex="1" textAlign="left">
                  Access :
                </Box>
                <Flex
                  flexDir={"column"}
                  textAlign={"center"}
                  color={"#848484"}
                  justifyContent={"space-between"}
                >
                  {selectedTemplateDetails?.template_access?.map(
                    (value, index) => {
                      return (
                        <>
                          {value.role === "owner" ? (
                            <Flex>
                              {index + 1}.{" "}
                              {(value?.member?.user?.first_name ||
                                value?.super_admin?.first_name) +
                                " " +
                                (value?.member?.user?.last_name ||
                                  value?.super_admin?.last_name)}
                              &nbsp; (Owner)
                            </Flex>
                          ) : (
                            <Flex>
                              {index + 1}.{" "}
                              {value?.member?.user?.first_name +
                                " " +
                                value?.member?.user?.last_name}
                            </Flex>
                          )}
                        </>
                      );
                    }
                  )}
                </Flex>
              </Flex>
              <Flex flexDir={"column"}>
                <Box fontWeight={700} as="span" flex="1" textAlign="left">
                  Template Work Flow :
                </Box>
                <Flex w={"100%"} h={"100%"}>
                  <WorkFlowXyFlow
                    editStepDisclosureOnClose={stepDetailsDisclosure.onClose}
                    handleOpenEditStepModal={handleOpenStepDrawer}
                    nodes={nodes}
                    setNodes={setNodes}
                    onNodesChange={onNodesChange}
                    edges={edges}
                    setEdges={setEdges}
                    onEdgesChange={onEdgesChange}
                    variant={"templateDetails"}
                    editable={false}
                    fullScreen={true}
                    templateDetails={selectedTemplateDetails}
                    templateOnClose={onClose}
                  />
                </Flex>
              </Flex>
            </Flex>
          </ModalBody>
          <ModalFooter w={"100%"} justifyContent={"center"}>
            <Flex w={"100%"} alignItems={"center"} justifyContent={"end"}>
              <Flex></Flex>
            </Flex>
          </ModalFooter>
          <Divider m={0} />
          {selectedEditStep ? (
            <Flex w={"700px"} position={"relative"}>
              <TemplateStepDetailsDrawerDetails
                editStepDisclosure={stepDetailsDisclosure}
                selectedEditStep={selectedEditStep}
              />
            </Flex>
          ) : (
            ""
          )}
        </ModalContent>
      </Modal>
    </>
  );
}
export default function TemplateDetailsModal({
  selectedTemplateDetails,
  onClose,
  isOpen,
}) {
  return (
    <ReactFlowProvider variant={"templateDetails"} editable={false}>
      <TemplateDetailsModalContent
        selectedTemplateDetails={selectedTemplateDetails}
        onClose={onClose}
        isOpen={isOpen}
      ></TemplateDetailsModalContent>
    </ReactFlowProvider>
  );
}
