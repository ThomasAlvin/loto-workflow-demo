import {
  Button,
  Center,
  Flex,
  Image,
  Tooltip,
  useDisclosure,
} from "@chakra-ui/react";
import WorkOrderDetailsLayout from "../../components/Layout/WorkOrderDetailsLayout";
import { LuClipboardPaste } from "react-icons/lu";
import { IoMdCheckmark } from "react-icons/io";
import { IoCloseSharp } from "react-icons/io5";
import WorkOrderDetailsStep from "../../components/WorkOrders/WorkOrderDetailsStep";
import WorkOrderDetailsAssociation from "../../components/WorkOrders/WorkOrderDetailsAssociations";
import WorkOrderDetailsHeader from "../../components/WorkOrders/WorkOrderDetailsHeader";
import SwitchAssigneeModal from "../../components/WorkOrders/SwitchAssigneeModal";
import AbortStepModal from "../../components/WorkOrders/AbortStepModal";
import { useCallback, useEffect, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import WorkFlowXyFlow from "../../components/WorkFlowXyFlow";
import { useEdgesState, useNodesState, useReactFlow } from "@xyflow/react";
import { DeleteMultiLockAccessProvider } from "../../service/DeleteMultiLockAccessContext";
import defaultNodeSettings from "../../constants/defaultNodeSettings";
import StepDetailsDrawerDetails from "../../components/WorkOrders/StepDetailsDrawerDetails";
import convertStepsToXyFlowData from "../../utils/convertStepsToXyFlowData";
import FlowProvider from "../../service/FlowProvider";

export default function WorkOrderDetailsOverviewPage({
  workOrder,
  memberSelection,
  abortStep,
  switchAssignee,
  abortStepButtonLoading,
  switchAssigneeButtonLoading,
  hasManagePermission,
  handleOpenSendReminder,
  pageModule,
  stepDetailsDisclosure,
}) {
  const { fitView } = useReactFlow();
  const [stepDetails, setStepDetails] = useState("");
  const [selectedEditStep, setSelectedEditStep] = useState();
  const [selectedEditStepTab, setSelectedEditStepTab] = useState("overview");

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const switchAssigneeDisclosure = useDisclosure();
  const abortStepDisclosure = useDisclosure();

  const groupName = selectedEditStep?.multiLockAccessGroup?.name; // or any name you want to match
  const mainStep = workOrder?.work_order_steps.find(
    (step) =>
      step?.isMainMultiLockAccess === true &&
      step?.multiLockAccessGroup?.name === groupName
  );
  const mainTotalStep = mainStep?.multiLockAccessGroup?.totalStep ?? 0;

  const requestSwitchAssigneeFormik = useFormik({
    initialValues: {
      memberUIDs: [],
      requestSwitchAssigneeMemberUID: "",
      reason: "",
      workOrderSteps: [],
    },
    validationSchema: Yup.object().shape({
      memberUIDs: stepDetails.isRequest
        ? Yup.array().nullable().notRequired()
        : Yup.array()
            .of(
              Yup.object().shape({
                value: Yup.string().trim().required("Assignee UID is required"),
              })
            )
            .min(1, "Must assign at least 1 assignee"),
      reason: Yup.string()
        .trim()
        .required("Please provide a reason to proceed"),
      workOrderSteps: stepDetails.isRequest
        ? Yup.array()
            .of(Yup.object({ value: Yup.mixed() }))
            .min(1, "Please select at least one step to proceed")
            .required("Please select at least one step to proceed")
        : Yup.array().notRequired(),
    }),
    onSubmit: () => {
      switchAssignee(
        stepDetails.UID,
        requestSwitchAssigneeFormik.values.requestSwitchAssigneeMemberUID,
        requestSwitchAssigneeFormik.values.workOrderSteps,
        requestSwitchAssigneeFormik.values.memberUIDs.map(
          (member) => member.UID
        ),
        requestSwitchAssigneeFormik.values.reason,
        handleSwitchAssigneeModalClose,
        stepDetails?.isRequest
      );
    },
  });
  function handleSwitchAssigneeModalClose() {
    requestSwitchAssigneeFormik.setValues({
      memberUIDs: [],
      requestSwitchAssigneeMemberUID: "",
      reason: "",
      workOrderSteps: [],
    });
    requestSwitchAssigneeFormik.setTouched({});
    switchAssigneeDisclosure.onClose();
  }
  const handleOpenSwitchAssignee = useCallback(
    (stepDetails, isRequest = false) => {
      setStepDetails({ ...stepDetails, isRequest });
      requestSwitchAssigneeFormik.setValues((prevState) => ({
        ...prevState,
        workOrderSteps: [
          {
            ...stepDetails,
            label: stepDetails.index + 1 + ". " + stepDetails.name,
            value: stepDetails.UID,
          },
        ],
        memberUIDs: stepDetails?.assigned_members?.map((member) => ({
          label: member.user.first_name + " " + member.user.last_name,
          value: member.id,
          ...member,
        })),
      }));
      switchAssigneeDisclosure.onOpen();
    },
    [requestSwitchAssigneeFormik.setValues]
  );
  const handleOpenAbortStep = useCallback((stepDetails) => {
    setStepDetails(stepDetails);
    abortStepDisclosure.onOpen();
  }, []);

  const handleOpenStepDrawer = useCallback(
    (selectedStep, selectedIndex) => {
      stepDetailsDisclosure.onOpen();
      if (!stepDetailsDisclosure.isOpen) {
        setSelectedEditStepTab("overview");
      }
      setSelectedEditStep({
        ...selectedStep,
        index: workOrder.work_order_steps.findIndex(
          // switch id to UID
          (step) => step.UID === selectedStep.UID
        ),
      });
    },
    [workOrder?.work_order_steps]
  );
  useEffect(() => {
    async function convertStepToFlow() {
      const xyFlowData = await convertStepsToXyFlowData(
        workOrder?.work_order_steps
      );
      setNodes(xyFlowData?.nodes);
      setEdges(xyFlowData?.edges);
      fitView({
        padding: 0.2,
        duration: 0,
      });
    }
    convertStepToFlow();
  }, [workOrder?.work_order_steps]);

  return (
    <>
      <FlowProvider
        editStepDisclosureOnClose={stepDetailsDisclosure.onClose}
        variant="workOrder"
        editable={false}
      >
        <Flex flexDir={"column"} p={"30px"}>
          <Flex
            p={"20px"}
            w={"100%"}
            boxShadow={"0px 0px 3px rgba(50,50,93,0.5)"}
            bg={"#f8f9fa"}
            gap={"20px"}
          >
            <Flex
              flexGrow={1}
              gap={"20px"}
              flexDir={"column"}
              alignItems={"center"}
            >
              <WorkOrderDetailsHeader workOrder={workOrder} />

              <Flex
                minH={"800px"}
                w={"100%"}
                px={"20px"}
                py={"20px"}
                bg={"white"}
                boxShadow={"0px 0px 3px rgba(50,50,93,0.5)"}
              >
                <Flex w={"100%"} h={"100%"} flexDir={"column"} gap={"20px"}>
                  <Flex h={"100%"} flexDir={"column"} gap={"20px"}>
                    <Flex
                      justifyContent={"space-between"}
                      alignItems={"center"}
                    >
                      <Flex
                        fontSize={"20px"}
                        fontWeight={700}
                        color={"#dc143c"}
                      >
                        Steps
                      </Flex>
                      <Flex gap={"10px"}>
                        <Tooltip
                          hasArrow
                          label="Cancelled Steps"
                          placement="top"
                        >
                          <Flex
                            color={"#dc143c"}
                            borderRadius={"20px"}
                            gap={"5px"}
                            fontSize={"14px"}
                            alignItems={"center"}
                            // bg={"#f8f9fa"}
                            px={"12px"}
                            py={"5px"}
                            boxShadow={"0px 0px 3px rgba(50,50,93,0.5)"}
                            // border={"1px solid #bababa"}
                          >
                            <Flex>
                              <IoCloseSharp fontSize={"18px"} />
                            </Flex>
                            <Flex>{workOrder?.cancelled_step_count}</Flex>
                          </Flex>
                        </Tooltip>
                        <Tooltip
                          hasArrow
                          label="Finished Steps"
                          placement="top"
                        >
                          <Flex
                            color={"#dc143c"}
                            borderRadius={"20px"}
                            gap={"5px"}
                            fontSize={"14px"}
                            alignItems={"center"}
                            // bg={"#f8f9fa"}
                            px={"12px"}
                            py={"5px"}
                            boxShadow={"0px 0px 3px rgba(50,50,93,0.5)"}
                            // border={"1px solid #bababa"}
                          >
                            <Flex>
                              <IoMdCheckmark fontSize={"18px"} />
                            </Flex>
                            <Flex>{workOrder?.completed_step_count}</Flex>
                          </Flex>
                        </Tooltip>

                        <Tooltip
                          hasArrow
                          label="Ongoing/Pending Steps"
                          placement="top"
                        >
                          <Flex
                            color={"#dc143c"}
                            borderRadius={"20px"}
                            gap={"5px"}
                            fontSize={"14px"}
                            alignItems={"center"}
                            // bg={"#f8f9fa"}
                            px={"12px"}
                            py={"5px"}
                            boxShadow={"0px 0px 3px rgba(50,50,93,0.5)"}
                            // border={"1px solid #bababa"}
                          >
                            <Flex>
                              <LuClipboardPaste fontSize={"18px"} />
                            </Flex>
                            <Flex>{workOrder?.ongoing_step_count}</Flex>
                          </Flex>
                        </Tooltip>
                      </Flex>
                    </Flex>

                    <Flex flexDir={"column"} w={"100%"}>
                      <WorkFlowXyFlow
                        editStepDisclosureOnClose={
                          stepDetailsDisclosure.onClose
                        }
                        handleOpenEditStepModal={handleOpenStepDrawer}
                        nodes={nodes}
                        setNodes={setNodes}
                        onNodesChange={onNodesChange}
                        edges={edges}
                        setEdges={setEdges}
                        onEdgesChange={onEdgesChange}
                        variant={"workOrder"}
                        editable={false}
                      />
                    </Flex>
                    {workOrder?.work_order_steps.length ? (
                      <Flex
                        flexDir={"column"}
                        gap={"8px"}
                        w={"100%"}
                        justify={"center"}
                      >
                        {workOrder?.work_order_steps.map((val, index) => (
                          <WorkOrderDetailsStep
                            pageModule={pageModule}
                            index={index}
                            val={val}
                            workOrderStatus={workOrder.status}
                            openByDefault={false}
                            machineOpenByDefault={false}
                            handleOpenAbortStep={handleOpenAbortStep}
                            handleOpenSwitchAssignee={handleOpenSwitchAssignee}
                            handleOpenSendReminder={handleOpenSendReminder}
                            hasManagePermission={hasManagePermission}
                          />
                        ))}
                      </Flex>
                    ) : (
                      <Center h={"100%"} flexDir={"column"}>
                        <Flex
                          fontSize={"20px"}
                          fontWeight={700}
                          justify={"center"}
                          alignItems={"center"}
                          color={"black"}
                        >
                          <Flex>No steps were assigned!</Flex>
                        </Flex>
                        <Flex
                          fontSize={"20px"}
                          justify={"center"}
                          color={"#848484"}
                          fontWeight={700}
                          textAlign={"center"}
                        >
                          This work order has no steps
                        </Flex>
                      </Center>
                    )}
                  </Flex>
                </Flex>
              </Flex>
            </Flex>
            <WorkOrderDetailsAssociation
              workOrder={workOrder}
              handleOpenSendReminder={handleOpenSendReminder}
              hasManagePermission={hasManagePermission}
            />
          </Flex>
        </Flex>
        {selectedEditStep ? (
          <Flex w={"700px"}>
            <StepDetailsDrawerDetails
              pageModule={pageModule}
              stepIndex={selectedEditStep?.index}
              editStepDisclosure={stepDetailsDisclosure}
              selectedEditStep={selectedEditStep}
              variant={"workOrder"}
              mainTotalStep={mainTotalStep}
              stepType={"workOrderSteps"}
              selectedEditStepTab={selectedEditStepTab}
              setSelectedEditStepTab={setSelectedEditStepTab}
              workOrderStatus={workOrder.status}
              machineOpenByDefault={false}
              handleOpenAbortStep={handleOpenAbortStep}
              handleOpenSwitchAssignee={handleOpenSwitchAssignee}
              hasManagePermission={hasManagePermission}
              handleOpenSendReminder={handleOpenSendReminder}
              abortStepDisclosure={abortStepDisclosure}
              switchAssigneeDisclosure={switchAssigneeDisclosure}
            />
          </Flex>
        ) : (
          ""
        )}
        <AbortStepModal
          abortStep={abortStep}
          stepDetails={stepDetails}
          abortStepButtonLoading={abortStepButtonLoading}
          abortStepDisclosure={abortStepDisclosure}
        />
        <SwitchAssigneeModal
          workOrderSteps={workOrder?.work_order_steps}
          stepDetails={stepDetails}
          formik={requestSwitchAssigneeFormik}
          handleModalClose={handleSwitchAssigneeModalClose}
          switchAssigneeButtonLoading={switchAssigneeButtonLoading}
          memberSelection={memberSelection}
          switchAssigneeDisclosure={switchAssigneeDisclosure}
        />
      </FlowProvider>
    </>
  );
}
