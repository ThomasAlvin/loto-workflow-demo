import { Button, Flex, useDisclosure } from "@chakra-ui/react";
import {
  getConnectedEdges,
  getIncomers,
  getOutgoers,
  useReactFlow,
} from "@xyflow/react";
import { FormikProvider } from "formik";
import { useCallback, useEffect, useRef, useState } from "react";
import { FaChevronRight } from "react-icons/fa";
import { FaTriangleExclamation } from "react-icons/fa6";
import DeleteMultiLockAccessConfirmationModal from "../../components/CreateEditWorkOrderTemplate/DeleteMultiLockAccessConfirmationModal";
import EditStepDrawer from "../../components/CreateEditWorkOrderTemplate/EditStepDrawer";
import TemplateDetailsInput from "../../components/CreateTemplate/TemplateDetailsInput";
import CreateTemplateLayout from "../../components/Layout/CreateTemplateLayout";
import WorkFlowXyFlow from "../../components/WorkFlowXyFlow";
import FlowProvider from "../../service/FlowProvider";
import computeNodeOrder from "../../utils/computeNodeOrder";
import getAlphabeticSequencing from "../../utils/getAlphabeticSequencing";
import getConnectedNodes from "../../utils/getConnectedNodes";
export default function EditTemplateBuildPage({
  templateDetails,
  debouncedUpdateTemplateDetails,
  currentPage,
  setCurrentPage,
  formik,
  submitTemplate,
  initialValues,
  nodes,
  setNodes,
  onNodesChange,
  edges,
  setEdges,
  onEdgesChange,
}) {
  const { fitView } = useReactFlow();
  const editStepDisclosure = useDisclosure();
  const [unconnectedNodesError, setUnconnectedNodesError] = useState("");
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [selectedEditStep, setSelectedEditStep] = useState();

  const nextAlphabeticalSequence = getAlphabeticSequencing(
    formik.values.templateSteps
  );
  const [initialFit, setInitialFit] = useState(false);
  const groupName = selectedEditStep?.multiLockAccessGroup?.name; // or any name you want to match
  const hasChanged = !(
    JSON.stringify(formik.values) === JSON.stringify(initialValues)
  );
  const mainStep = formik.values.templateSteps.find(
    (step) =>
      step?.isMainMultiLockAccess === true &&
      step?.multiLockAccessGroup?.name === groupName
  );
  const mainLockLimit = mainStep?.multiLockAccessGroup?.lockLimit ?? 0;
  const mainTotalStep = mainStep?.multiLockAccessGroup?.totalStep ?? 0;
  const workFlowRef = useRef();
  const templateTitleInputRef = useRef();
  const flowWrapperRef = useRef();

  async function handleSubmit() {
    const errors = await formik.validateForm();
    const allTouched = Object.keys(formik.values).reduce((acc, field) => {
      acc[field] = true;
      return acc;
    }, {});
    formik.setTouched(allTouched);

    const startNode = nodes.find((n) => n.data?.isStart);
    const connectedNodeIds = getConnectedNodes(startNode, edges);
    const unconnectedNodes = nodes.filter((n) => !connectedNodeIds.has(n.id));

    if (Object.keys(errors).length > 0 || unconnectedNodes.length > 0) {
      if (errors.name) {
        templateTitleInputRef.current.scrollIntoView({
          behavior: "smooth", // or "auto"
          block: "center", // "start", "center", "end", or "nearest"
        });
      } else if (unconnectedNodes.length) {
        setSubmitAttempted(true);
        workFlowRef.current.scrollIntoView({
          behavior: "smooth", // or "auto"
          block: "center", // "start", "center", "end", or "nearest"
        });
      } else {
        workFlowRef.current.scrollIntoView({
          behavior: "smooth", // or "auto"
          block: "center", // "start", "center", "end", or "nearest"
        });
      }
    } else {
      formik.handleSubmit();
    }
  }
  const deleteEdges = useCallback(
    (deletedEdges) => {
      const filteredEdges = edges.filter(
        (e) => !deletedEdges.some((de) => de.id === e.id)
      );
      setEdges(filteredEdges);

      let reorderedNodes = computeNodeOrder(
        nodes,
        filteredEdges,
        nodes[0]?.id || null
      );
      setNodes(
        reorderedNodes.map((node) => {
          const hadLoopBackFromThisNode = deletedEdges.some(
            (edge) =>
              edge.source === node.id && edge.sourceHandle === "loop-back"
          );

          if (!hadLoopBackFromThisNode) return node;

          return {
            ...node,
            data: {
              ...node.data,
              loop_target_UID: null,
            },
          };
        })
      );
    },
    [edges, nodes, setEdges, setNodes, computeNodeOrder, getConnectedNodes]
  );
  const handleOpenEditStepModal = useCallback(
    (selectedStep, selectedIndex) => {
      editStepDisclosure.onOpen();
      setSelectedEditStep({
        ...selectedStep,
        index: formik.values.templateSteps.findIndex(
          // switch id to UID
          (step) => step.UID === selectedStep.UID
        ),
      });
    },
    [formik.values.templateSteps]
  );

  const startNode = nodes.find((n) => n.data?.isStart);
  const connectedNodeIds = getConnectedNodes(startNode, edges);
  const unconnectedNodes = nodes.filter((n) => !connectedNodeIds.has(n.id));

  useEffect(() => {
    if (!submitAttempted) return;

    const startNode = nodes.find((n) => n.data?.isStart);
    const connectedNodeIds = getConnectedNodes(startNode, edges);
    const unconnectedNodes = nodes.filter((n) => !connectedNodeIds.has(n.id));
    setUnconnectedNodesError(
      unconnectedNodes.length
        ? "Some steps are not connected to the workflow. Please connect them or remove them before submitting."
        : ""
    );
  }, [edges, nodes.length, submitAttempted]);
  useEffect(() => {
    formik.setFieldValue("templateSteps", formik.values.templateSteps);
  }, [formik.values.templateSteps]);
  useEffect(() => {
    if (!initialFit && (nodes.length > 0 || edges.length > 0)) {
      setInitialFit(true); // prevent future calls
      if (nodes.length > 3) {
        fitView({ padding: 0.2 });
      }
    }
  }, [nodes, edges, fitView, initialFit]);
  return (
    <FlowProvider
      nodes={nodes}
      edges={edges}
      setNodes={setNodes}
      setEdges={setEdges}
      formikSetValues={formik.setValues}
      editStepDisclosureOnClose={editStepDisclosure.onClose}
      getIncomers={getIncomers}
      getOutgoers={getOutgoers}
      getConnectedEdges={getConnectedEdges}
      variant="template"
    >
      <Flex
        flexDir={"column"}
        justifyContent={"center"}
        overflow={editStepDisclosure.isOpen ? "hidden" : "auto"}
        gap={"20px"}
      >
        <CreateTemplateLayout
          formik={formik}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          stage={"build"}
          hasUnconnectedNode={unconnectedNodes.length ? true : false}
          // hasSidebar={"true"}
          templateDetails={templateDetails}
          submitTemplate={submitTemplate}
          templateStatus={templateDetails.status}
          hasChanged={hasChanged}
          variant={"edit"}
        >
          <FormikProvider value={formik}>
            <Flex w={"100%"} py={"10px"} flexDir={"column"} gap={"10px"}>
              <Flex px={"140px"} gap={"20px"} flexDir={"column"}>
                <TemplateDetailsInput
                  formik={formik}
                  templateTitleInputRef={templateTitleInputRef}
                  templateDetails={templateDetails}
                  debouncedUpdateTemplateDetails={
                    debouncedUpdateTemplateDetails
                  }
                  variant={"edit"}
                />
                <Flex flexDir={"column"} gap={"20px"}>
                  <Flex
                    flexDir={"column"}
                    color={"black"}
                    fontWeight={700}
                    fontSize={"24px"}
                  >
                    <Flex color={"#dc143c"}>Workflow</Flex>
                    <Flex
                      textAlign={"center"}
                      fontSize={"12px"}
                      color={"#848484"}
                      justifyContent={"space-between"}
                    >
                      <Flex>
                        Add or adjust the steps by dragging and dropping
                      </Flex>
                    </Flex>
                  </Flex>
                  {unconnectedNodesError ||
                  (formik.errors.templateSteps &&
                    formik.touched.templateSteps) ? (
                    <Flex
                      py={"4px"}
                      px={"8px"}
                      bg={"#FDE2E2"}
                      alignItems={"center"}
                      gap={"5px"}
                      color={"#dc143c"}
                    >
                      <Flex>
                        <FaTriangleExclamation />
                      </Flex>
                      <Flex>
                        {unconnectedNodesError
                          ? unconnectedNodesError
                          : formik.errors.templateSteps}
                      </Flex>
                    </Flex>
                  ) : (
                    ""
                  )}
                  <Flex ref={workFlowRef} w={"100%"} h={"100%"}>
                    <WorkFlowXyFlow
                      editStepDisclosureOnClose={editStepDisclosure.onClose}
                      // deleteStep={deleteStep}
                      deleteEdges={deleteEdges}
                      // handleDownload={handleDownload}
                      flowWrapperRef={flowWrapperRef}
                      nextAlphabeticalSequence={nextAlphabeticalSequence}
                      formikSetValues={formik.setValues}
                      handleOpenEditStepModal={handleOpenEditStepModal}
                      nodes={nodes}
                      setNodes={setNodes}
                      onNodesChange={onNodesChange}
                      edges={edges}
                      setEdges={setEdges}
                      onEdgesChange={onEdgesChange}
                      variant={"template"}
                    />
                  </Flex>
                </Flex>
                <Flex pt={"20px"} justifyContent={"end"}>
                  <Button
                    alignItems={"center"}
                    gap={"10px"}
                    background={"#dc143c"}
                    color={"white"}
                    onClick={handleSubmit}
                  >
                    <Flex>
                      <FaChevronRight />
                    </Flex>
                    <Flex>Next</Flex>{" "}
                  </Button>
                </Flex>
              </Flex>
            </Flex>
            <EditStepDrawer
              // deleteStep={deleteStep}
              stepIndex={selectedEditStep?.index}
              nextAlphabeticalSequence={nextAlphabeticalSequence}
              editStepDisclosure={editStepDisclosure}
              selectedEditStep={selectedEditStep}
              variant={"template"}
              formikSetValues={formik.setValues}
              mainTotalStep={mainTotalStep}
              stepType={"templateSteps"}
              selectedEditStepTab={"overview"}
            />
          </FormikProvider>

          <DeleteMultiLockAccessConfirmationModal
            // deleteStep={deleteStep}
            variant={"template"}
          />
        </CreateTemplateLayout>
      </Flex>
    </FlowProvider>
  );
}
