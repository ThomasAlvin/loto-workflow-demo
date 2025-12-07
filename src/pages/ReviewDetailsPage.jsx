import { Avatar, Divider, Flex, useDisclosure } from "@chakra-ui/react";
import {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import WorkOrderDetailsStep from "../components/WorkOrders/WorkOrderDetailsStep";
import WorkOrderDetailsAssociation from "../components/WorkOrders/WorkOrderDetailsAssociations";
import WorkOrderDetailsHeader from "../components/WorkOrders/WorkOrderDetailsHeader";
import WorkOrderDetailsLayout from "../components/Layout/WorkOrderDetailsLayout";
import { useParams } from "react-router-dom";
import { useLoading } from "../service/LoadingContext";
import { api } from "../api/api";
import { FaRegClock, FaUserAlt } from "react-icons/fa";
import tableStatusStyleMapper from "../utils/tableStatusStyleMapper";
import moment from "moment";
import labelizeRole from "../utils/labelizeRole";
import { FaCheck, FaFlag } from "react-icons/fa6";
import { TbClockX } from "react-icons/tb";
import ReviewDetails404Page from "./ReviewDetails404Page";
import {
  ReactFlowProvider,
  useEdgesState,
  useNodesState,
  useReactFlow,
} from "@xyflow/react";
import { DeleteMultiLockAccessProvider } from "../service/DeleteMultiLockAccessContext";
import WorkFlowXyFlow from "../components/WorkFlowXyFlow";
import convertStepsToXyFlowData from "../utils/convertStepsToXyFlowData";
import StepDetailsDrawerDetails from "../components/WorkOrders/StepDetailsDrawerDetails";
import FlowProvider, { FlagContext } from "../service/FlowProvider";

export default function ReviewDetailsPage() {
  const stepDetailsDisclosure = useDisclosure();
  return (
    <ReactFlowProvider>
      <DeleteMultiLockAccessProvider>
        <FlowProvider
          editStepDisclosureOnClose={stepDetailsDisclosure.onClose}
          editable={false}
          variant={"review"}
        >
          <ReviewContent stepDetailsDisclosure={stepDetailsDisclosure} />
        </FlowProvider>
      </DeleteMultiLockAccessProvider>
    </ReactFlowProvider>
  );
}

function ReviewContent({ stepDetailsDisclosure }) {
  const { fitView } = useReactFlow();
  const IMGURL = import.meta.env.VITE_API_IMAGE_URL;
  const abortControllerRef = useRef(new AbortController()); // Persistent controller
  const [workOrder, setWorkOrder] = useState();
  const [fetchError, setFetchError] = useState(false);
  const [selectedEditStep, setSelectedEditStep] = useState();
  const [selectedEditStepTab, setSelectedEditStepTab] = useState("overview");
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const { UID } = useParams();
  const { setLoading } = useLoading();
  const { flaggedSteps, setFlaggedSteps } = useContext(FlagContext);

  // const [flaggedSteps, setFlaggedSteps] = useState([]);
  const isMultiAssign = import.meta.env.VITE_MULTI_ASSIGN === "true";
  const pageModule = "reviews";

  const { bgColor, textColor, icon, text } = tableStatusStyleMapper(
    workOrder?.work_order_reviewer.work_order_reviewer_response.status
  );
  const collectedReviews = [
    ...(workOrder?.work_order_review?.work_order_reviewer_super_admin
      ? [workOrder?.work_order_review.work_order_reviewer_super_admin]
      : []),
    ...(workOrder?.work_order_review?.work_order_reviewer_members ?? []),
  ];

  const groupName = selectedEditStep?.multiLockAccessGroup?.name; // or any name you want to match
  const mainStep =
    workOrder?.work_order_review.work_order.work_order_steps.find(
      (step) =>
        step?.isMainMultiLockAccess === true &&
        step?.multiLockAccessGroup?.name === groupName
    );
  const mainTotalStep = mainStep?.multiLockAccessGroup?.totalStep ?? 0;

  const submittedReviews = collectedReviews.filter(
    (review) =>
      review.work_order_reviewer_response.status === "rejected" ||
      review.work_order_reviewer_response.status === "approved"
  );
  const pendingReviews = collectedReviews?.filter((review) => {
    return review.work_order_reviewer_response.status === "pending";
  });
  const skippedReviews = collectedReviews.filter((review) => {
    return review.work_order_reviewer_response.status === "skipped";
  });
  // const mySubmissionRequester = workOrder?.work_order_review.work_order
  //   .super_admin
  //   ? workOrder?.work_order_review.work_order.super_admin
  //   : {
  //       ...workOrder?.work_order_review.work_order.member?.user,
  //       role: workOrder?.work_order_review.work_order.member?.role,
  //       employee_id:
  //         workOrder?.work_order_review.work_order.member?.employee_id,
  //     };
  const mySubmissionRequester = workOrder?.work_order_reviewer.super_admin
    ? workOrder?.work_order_reviewer.super_admin
    : {
        ...workOrder?.work_order_reviewer.member?.user,
        role: workOrder?.work_order_reviewer.member?.role,
        employee_id: workOrder?.work_order_reviewer.member?.employee_id,
      };
  console.log(workOrder?.work_order_review);
  console.log(mySubmissionRequester);

  const hasPastDeadlineTime =
    Date.now() >= workOrder?.work_order.deadline_date_time;

  const handleOpenStepDrawer = useCallback(
    (selectedStep, selectedIndex) => {
      stepDetailsDisclosure.onOpen();
      if (!stepDetailsDisclosure.isOpen) {
        setSelectedEditStepTab("overview");
      }
      console.log(selectedStep);
      console.log(workOrder?.work_order_review.work_order.work_order_steps);

      setSelectedEditStep({
        ...selectedStep,
        index:
          workOrder?.work_order_review.work_order?.work_order_steps.findIndex(
            // switch id to UID
            (step) => step.UID === selectedStep.UID
          ),
      });
    },
    [workOrder?.work_order_review.work_order?.work_order_steps]
  );
  async function fetchReviewDetails(isWithLoading) {
    if (isWithLoading) {
      setLoading(true);
    }
    await api
      .get(`review/${UID}`, {
        signal: abortControllerRef.current.signal,
      })
      .then((response) => {
        const uniqueAssigneesSet = new Set();
        const uniqueAssignees = [];
        const uniqueNotifiedMembersSet = new Set();
        const uniqueNotifiedMembers = [];
        const uniqueAssignedMachinesSet = new Set();
        const uniqueAssignedMachines = [];
        const uniqueAssignedLocksSet = new Set();
        const uniqueAssignedLocks = [];
        const uniqueAssignedReviewerSet = new Set();
        const uniqueAssignedReviewer = [];
        console.log(response.data);

        const reformedWorkOrder = {
          ...response.data,
          work_order_review: {
            ...response.data,
            work_order: {
              ...response.data.work_order_snapshot,
              work_order_steps: [
                ...response.data.work_order_snapshot.work_order_step_snapshots.map(
                  (stepSnapshot) => {
                    console.log(stepSnapshot);
                    console.log(stepSnapshot.UID);

                    console.log({
                      ...stepSnapshot.work_order_multi_lock_group_snapshot,
                    });
                    console.log(
                      stepSnapshot.work_order_multi_lock_group_snapshot
                        ?.work_order_multi_lock_group_item_snapshots
                    );

                    return {
                      ...stepSnapshot,
                      // switch id to UID
                      // id: stepSnapshot.UID,
                      // UID: stepSnapshot.UID,
                      work_order_form_questions:
                        stepSnapshot.work_order_form_question_snapshots,
                      assigned_members: isMultiAssign
                        ? stepSnapshot.work_order_step_assigned_member_snapshots.map(
                            (assignedMember) => ({
                              ...assignedMember,
                              user: {
                                first_name: assignedMember.first_name,
                                last_name: assignedMember.last_name,
                                profile_image_url:
                                  assignedMember.profile_image_url,
                              },
                            })
                          )
                        : {
                            ...stepSnapshot.work_order_step_assigned_member_snapshot,
                            user: {
                              first_name:
                                stepSnapshot
                                  .work_order_step_assigned_member_snapshot
                                  .first_name,
                              last_name:
                                stepSnapshot
                                  .work_order_step_assigned_member_snapshot
                                  .last_name,
                              profile_image_url:
                                stepSnapshot
                                  .work_order_step_assigned_member_snapshot
                                  .profile_image_url,
                            },
                          },
                      notified_members: isMultiAssign
                        ? stepSnapshot.work_order_step_notified_member_snapshots.map(
                            (notifiedMember) => ({
                              ...notifiedMember,
                              user: {
                                first_name: notifiedMember.first_name,
                                last_name: notifiedMember.last_name,
                                profile_image_url:
                                  notifiedMember.profile_image_url,
                              },
                            })
                          )
                        : {
                            ...stepSnapshot.work_order_step_notified_member_snapshot,
                            user: {
                              first_name:
                                stepSnapshot
                                  .work_order_step_notified_member_snapshot
                                  ?.first_name,
                              last_name:
                                stepSnapshot
                                  .work_order_step_notified_member_snapshot
                                  ?.last_name,
                              profile_image_url:
                                stepSnapshot
                                  .work_order_step_notified_member_snapshot
                                  ?.profile_image_url,
                            },
                          },

                      work_order_multi_lock_group: {
                        ...stepSnapshot.work_order_multi_lock_group_snapshot,
                        work_order_multi_lock_group_items:
                          stepSnapshot.work_order_multi_lock_group_snapshot?.work_order_multi_lock_group_item_snapshots.map(
                            (groupItem) => {
                              return {
                                ...groupItem.work_order_lock_snapshot,
                                work_order_multi_lock_group_item_responses:
                                  groupItem.work_order_multi_lock_group_item_response_snapshots,
                              };
                            }
                          ),
                      },
                      work_order_step_machines: [
                        ...stepSnapshot.work_order_step_machine_snapshots.map(
                          (stepMachine) => ({
                            ...stepMachine,
                            selected_inspection_forms: [
                              ...stepMachine.selected_inspection_form_snapshots.map(
                                (selectedForm) => {
                                  return {
                                    ...selectedForm,
                                    work_order_step_inspection_form: {
                                      ...selectedForm.work_order_step_inspection_form_snapshot,
                                      work_order_step_inspection_questions:
                                        selectedForm
                                          .work_order_step_inspection_form_snapshot
                                          .work_order_step_inspection_question_snapshots,
                                    },
                                  };
                                }
                              ),
                            ],
                          })
                        ),
                      ],
                      work_order_locks:
                        stepSnapshot.work_order_lock_snapshots || [],
                    };
                  }
                ),
              ],
            },
          },
        };
        reformedWorkOrder?.work_order_review.work_order?.latest_work_order_reviews?.map(
          (review) => {
            const reviewers = review.work_order_reviewer_members;
            reviewers.map((reviewer) => {
              const filteredReviewer = reviewer?.super_admin
                ? reviewer.super_admin
                : {
                    ...reviewer.member.user,
                    employee_id: reviewer.member.employee_id,
                    role: reviewer.member.role,
                  };

              uniqueAssignedReviewer.push(filteredReviewer);
            });
          }
        );
        reformedWorkOrder.work_order_review.work_order?.work_order_steps.map(
          (step) => {
            const assignees = step.assigned_members;
            const notifiedMembers = step.notified_members;
            const assigned_machines = step.work_order_step_machines;
            const assigned_locks = step.work_order_locks;
            console.log(step);
            console.log(uniqueAssignees);
            console.log(assigned_locks);
            if (isMultiAssign) {
              console.log(step);
              console.log(assignees);

              if (assignees.length) {
                assignees.map((assignee) => {
                  if (
                    assignee?.email &&
                    !uniqueAssigneesSet.has(assignee.email)
                  ) {
                    uniqueAssigneesSet.add(assignee.email);
                    uniqueAssignees.push(assignee);
                  }
                });
              }
            } else {
              if (
                assignees?.email &&
                !uniqueAssigneesSet.has(assignees.email)
              ) {
                uniqueAssigneesSet.add(assignees.email);
                uniqueAssignees.push(assignees);
              }
            }

            console.log(uniqueAssignees);
            if (isMultiAssign) {
              if (notifiedMembers.length) {
                notifiedMembers.map((notifMember) => {
                  if (
                    notifMember?.email &&
                    !uniqueNotifiedMembersSet.has(notifMember.email)
                  ) {
                    uniqueNotifiedMembersSet.add(notifMember.email);
                    uniqueNotifiedMembers.push(notifMember);
                  }
                });
              }
            } else {
              if (
                notifiedMembers?.email &&
                !uniqueNotifiedMembersSet.has(notifiedMembers.email)
              ) {
                uniqueNotifiedMembersSet.add(notifiedMembers.email);
                uniqueNotifiedMembers.push(notifiedMembers);
              }
            }

            assigned_machines.map((assigned_machine) => {
              if (
                assigned_machine?.name &&
                !uniqueAssignedMachinesSet.has(assigned_machine.name)
              ) {
                uniqueAssignedMachinesSet.add(assigned_machine.name);
                uniqueAssignedMachines.push(assigned_machine);
              }
            });

            assigned_locks.map((assigned_lock) => {
              if (
                assigned_lock?.name &&
                !uniqueAssignedLocksSet.has(assigned_lock.name)
              ) {
                uniqueAssignedLocksSet.add(assigned_lock.name);
                uniqueAssignedLocks.push(assigned_lock);
              }
            });
          }
        );

        setWorkOrder({
          ...reformedWorkOrder,
          creator: response.data.work_order.creator,
          co_creator_members: isMultiAssign
            ? response.data.work_order.co_creator_members
            : response.data.work_order.co_creator_member,
          assignees: uniqueAssignees,
          notifiedMembers: uniqueNotifiedMembers,
          assignedLocks: uniqueAssignedLocks,
          assignedMachines: uniqueAssignedMachines,
          assignedReviewers: response.data.work_order_reviewer_members.map(
            (reviewer) => {
              const filteredReviewer = reviewer?.super_admin
                ? reviewer.super_admin
                : {
                    ...reviewer.member.user,
                    employee_id: reviewer.member.employee_id,
                    role: reviewer.member.role,
                  };
              return filteredReviewer;
            }
          ),
        });
        console.log({
          ...reformedWorkOrder,
          assignees: uniqueAssignees,
          notifiedMembers: uniqueNotifiedMembers,
          assignedLocks: uniqueAssignedLocks,
          assignedMachines: uniqueAssignedMachines,
          // assignedReviewers: uniqueAssignedReviewer,
        });

        // setSelectedStep({ ...response.data.workOrder.work_order_steps[0], index: 0 });
      })
      .catch((error) => {
        console.log(error);
        if (error.response.data?.error_type === "NotFound") {
          setFetchError(true);
        }
      })
      .finally(() => {
        setLoading(false);
      });
  }

  const handleFlagSteps = useCallback(
    (index) => {
      const stepToToggle =
        workOrder.work_order_review.work_order.work_order_steps[index];
      console.log(index);
      console.log(
        workOrder.work_order_review.work_order.work_order_steps[index]
      );

      console.log(stepToToggle);

      setFlaggedSteps((prevState) => {
        // switch id to UID
        const isAlreadyFlagged = prevState.some(
          (step) => step.UID === stepToToggle.UID
        );
        let newFlaggedSteps;
        if (isAlreadyFlagged) {
          // switch id to UID
          newFlaggedSteps = prevState.filter(
            (step) => step.UID !== stepToToggle.UID
          );
        } else {
          newFlaggedSteps = [
            ...prevState,
            { ...stepToToggle, workOrderStepIndex: index },
          ];
        }
        return newFlaggedSteps.sort(
          (a, b) => a.workOrderStepIndex - b.workOrderStepIndex
        );
      });
    },
    [workOrder]
  );

  const workOrderReviewerStatus =
    workOrder?.work_order_reviewer.work_order_reviewer_response.status;

  const convertedNodes = useMemo(() => {
    return nodes.map((node) => ({
      ...node,
      data: {
        ...node.data,
        workOrderReviewerStatus,
      },
    }));
  }, [nodes, workOrderReviewerStatus]);

  useEffect(() => {
    abortControllerRef.current = new AbortController();
    fetchReviewDetails(true);
    return () => {
      abortControllerRef.current.abort(); // Cleanup on unmount
    };
  }, []);
  useEffect(() => {
    async function convertStepToFlow() {
      const xyFlowData = await convertStepsToXyFlowData(
        workOrder?.work_order_review.work_order?.work_order_steps
      );
      console.log(xyFlowData);
      console.log(workOrder);

      setNodes(xyFlowData?.nodes);
      setEdges(xyFlowData?.edges);
      fitView({
        padding: 0.2,
        duration: 0,
      });
    }
    convertStepToFlow();
  }, [workOrder?.work_order_review.work_order?.work_order_steps]);

  return !fetchError ? (
    <WorkOrderDetailsLayout
      reviewApproveDisabled={hasPastDeadlineTime}
      workOrderReviewerUID={workOrder?.work_order_reviewer.UID}
      variant={"review"}
      workOrderReviewerStatus={workOrderReviewerStatus}
      flaggedSteps={flaggedSteps}
      reviewAbortControllerRef={abortControllerRef}
      fetchReviewDetails={fetchReviewDetails}
    >
      <Flex p={"30px"}>
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
            <WorkOrderDetailsHeader
              variant={"review"}
              workOrder={workOrder?.work_order_review?.work_order}
            />

            <Flex
              minH={"800px"}
              w={"100%"}
              px={"20px"}
              py={"20px"}
              bg={"white"}
              boxShadow={"0px 0px 3px rgba(50,50,93,0.5)"}
            >
              <Flex w={"100%"} flexDir={"column"} gap={"20px"}>
                <Flex flexDir={"column"} gap={"20px"}>
                  <Flex justifyContent={"space-between"} alignItems={"center"}>
                    <Flex
                      onClick={() => {
                        console.log(workOrder);
                        console.log(flaggedSteps);
                        console.log(collectedReviews);
                      }}
                      fontSize={"20px"}
                      fontWeight={700}
                      color={"#dc143c"}
                    >
                      Steps
                    </Flex>

                    <Flex
                      cursor={"default"}
                      bg={"#DBFBFF"}
                      px={"10px"}
                      py={"2px"}
                      border={"1px solid #47c5fa"}
                      color={"#47c5fa"}
                      borderRadius={"full"}
                      fontWeight={700}
                      fontSize={"14px"}
                    >
                      <Flex alignItems={"center"} gap={"5px"}>
                        <Flex>
                          {workOrder?.work_order_review.type === "single"
                            ? "Single Approval"
                            : "Multi Approval"}
                        </Flex>
                      </Flex>
                    </Flex>
                  </Flex>
                  <WorkFlowXyFlow
                    editStepDisclosureOnClose={stepDetailsDisclosure.onClose}
                    handleOpenEditStepModal={handleOpenStepDrawer}
                    nodes={convertedNodes}
                    setNodes={setNodes}
                    onNodesChange={onNodesChange}
                    edges={edges}
                    setEdges={setEdges}
                    onEdgesChange={onEdgesChange}
                    variant={"review"}
                    editable={false}
                    // flaggedSteps={flaggedSteps}
                  />
                  <Flex
                    flexDir={"column"}
                    gap={"8px"}
                    w={"100%"}
                    justify={"center"}
                  >
                    {workOrder?.work_order_review.work_order?.work_order_steps.map(
                      (val, index) => {
                        const isFlagged = flaggedSteps.some(
                          (flaggedStep) => flaggedStep.UID === val.UID // compare by ID or any unique key
                        );
                        return (
                          <>
                            <WorkOrderDetailsStep
                              variant={"review"}
                              handleFlagSteps={handleFlagSteps}
                              isFlagged={isFlagged}
                              pageModule={pageModule}
                              index={index}
                              val={val}
                              workOrderStatus={
                                workOrder?.work_order_review?.work_order?.status
                              }
                              workOrderReviewerStatus={workOrderReviewerStatus}
                              openByDefault={false}
                              machineOpenByDefault={false}
                            />
                          </>
                        );
                      }
                    )}
                  </Flex>
                </Flex>
                {workOrder?.work_order_reviewer.work_order_reviewer_response
                  .status === "approved" ||
                workOrder?.work_order_reviewer.work_order_reviewer_response
                  .status === "rejected" ? (
                  <Flex flexDir={"column"} gap={"10px"}>
                    <Flex gap={"20px"} alignItems={"center"}>
                      <Flex
                        fontSize={"20px"}
                        fontWeight={700}
                        color={"#dc143c"}
                      >
                        My Submission
                      </Flex>
                      {/* <Flex
                      h={"fit-content"}
                      fontWeight={700}
                      borderRadius={"10px"}
                      px={"8px"}
                      py={"4px"}
                      alignItems={"center"}
                      gap={"8px"}
                      bg={bgColor}
                      color={textColor}
                    >
                      <Flex fontSize={"20px"}>{icon}</Flex>
                      <Flex>{text}</Flex>
                    </Flex> */}
                    </Flex>
                    <Flex
                      // bg={"#f8f9fa"}
                      // boxShadow={"0px 0px 3px rgba(50,50,93,0.5)"}
                      // border={"3px dashed #dc143c"}
                      // p={"20px"}
                      w={"100%"}
                      flexDir={"column"}
                      gap={"20px"}
                    >
                      <Flex flexDir={"column"}>
                        <Flex alignItems={"center"} gap={"10px"}>
                          {mySubmissionRequester.first_name ? (
                            <Avatar
                              outline={"1px solid #dc143c"}
                              border={"2px solid white"}
                              name={
                                mySubmissionRequester.first_name +
                                " " +
                                mySubmissionRequester.last_name
                              }
                              src={
                                mySubmissionRequester.profile_image_url
                                  ? IMGURL +
                                    mySubmissionRequester.profile_image_url
                                  : null
                              }
                            ></Avatar>
                          ) : (
                            <Flex
                              outline={"1px solid #dc143c"}
                              bg={"#bababa"}
                              borderRadius={"100%"}
                              justifyContent={"center"}
                              alignItems={"center"}
                              h={"48px"}
                              w={"48px"}
                              border={"2px solid white"}
                            >
                              <Flex color={"white"} fontSize={"24px"}>
                                <FaUserAlt />
                              </Flex>
                            </Flex>
                          )}
                          <Flex w={"100%"} flexDir={"column"}>
                            <Flex
                              w={"100%"}
                              alignItems={"center"}
                              justify={"space-between"}
                            >
                              <Flex flexDir={"column"}>
                                <Flex fontWeight={700}>
                                  {mySubmissionRequester?.first_name +
                                    " " +
                                    mySubmissionRequester?.last_name}
                                </Flex>

                                <Flex fontSize={"14px"} color={"#848484"}>
                                  {mySubmissionRequester?.is_superadmin
                                    ? "Super Admin"
                                    : labelizeRole(
                                        mySubmissionRequester?.role
                                      ) +
                                      " - " +
                                      mySubmissionRequester?.employee_id}
                                </Flex>
                              </Flex>
                              <Flex color={"green"}>
                                <Flex
                                  fontWeight={700}
                                  borderRadius={"10px"}
                                  px={"8px"}
                                  py={"4px"}
                                  alignItems={"center"}
                                  gap={"8px"}
                                  bg={bgColor}
                                  fontSize={"16px"}
                                  color={textColor}
                                >
                                  <Flex fontSize={"20px"}>{icon}</Flex>
                                  <Flex>{text}</Flex>
                                </Flex>
                              </Flex>
                            </Flex>
                          </Flex>
                        </Flex>
                      </Flex>
                      <Flex>
                        {workOrder.work_order_reviewer
                          .work_order_reviewer_response.status ===
                        "approved" ? (
                          <Flex
                            alignItems={"center"}
                            fontWeight={700}
                            color={"#3D9666"}
                            gap={"5px"}
                          >
                            <Flex>
                              <FaCheck />
                            </Flex>
                            <Flex>All Steps Approved!</Flex>
                          </Flex>
                        ) : workOrder.work_order_reviewer
                            .work_order_reviewer_response?.status ===
                          "rejected" ? (
                          <Flex gap={"5px"} flexDir={"column"}>
                            <Flex
                              alignItems={"center"}
                              fontWeight={700}
                              color={"#dc143c"}
                              gap={"5px"}
                            >
                              <Flex>
                                <FaFlag />
                              </Flex>
                              <Flex>Problematic Steps</Flex>
                            </Flex>
                            <Flex flexWrap={"wrap"} gap={"10px"}>
                              {workOrder?.work_order_reviewer
                                .work_order_step_review_rejections?.length ? (
                                workOrder.work_order_reviewer.work_order_step_review_rejections.map(
                                  (step) => (
                                    <Flex
                                      alignItems={"center"}
                                      gap={"3px"}
                                      borderRadius={"full"}
                                      px={"6px"}
                                      py={"2px"}
                                      fontSize={"12px"}
                                      fontWeight={700}
                                      border={"1px solid #dc143c"}
                                      color={"#dc143c"}
                                      bg={"#FDE2E2"}
                                    >
                                      <Flex>
                                        {step.no_work_order_step}.{" "}
                                        {step.name_work_order_step}
                                      </Flex>
                                    </Flex>
                                  )
                                )
                              ) : (
                                <Flex
                                  fontWeight={700}
                                  fontSize={"12px"}
                                  bg={"#ededed"}
                                  color={"#848484"}
                                  borderRadius={"10px"}
                                  border={"1px solid #848484"}
                                  px={"8px"}
                                >
                                  No Steps Flagged
                                </Flex>
                              )}
                            </Flex>
                          </Flex>
                        ) : (
                          ""
                        )}
                      </Flex>

                      <Flex flexDir={"column"}>
                        <Flex
                          maxW={"100%"}
                          whiteSpace="normal"
                          wordBreak="break-word"
                          color={
                            workOrder.work_order_reviewer
                              .work_order_reviewer_response.reason
                              ? "black"
                              : "#848484"
                          }
                        >
                          {workOrder.work_order_reviewer
                            .work_order_reviewer_response.reason ||
                            "No Additional Comment"}
                        </Flex>
                        <Flex
                          justify={"end"}
                          color={"#848484"}
                          fontSize={"14px"}
                        >
                          {moment(
                            workOrder.work_order_review.updated_at
                          ).format("DD MMMM YYYY hh:mm A")}
                        </Flex>
                      </Flex>
                    </Flex>
                  </Flex>
                ) : (
                  ""
                )}
                {submittedReviews?.length ? (
                  <Flex w={"100%"} flexDir={"column"} gap={"20px"}>
                    <Flex flexDir={"column"} gap={"20px"}>
                      <Flex
                        justifyContent={"space-between"}
                        alignItems={"center"}
                      >
                        <Flex
                          color={"#dc143c"}
                          fontSize={"20px"}
                          fontWeight={700}
                        >
                          Submitted Reviews ({submittedReviews?.length})
                        </Flex>
                      </Flex>
                      <Divider borderColor={"#848484"} m={0} />
                    </Flex>

                    <Flex flexDir={"column"} gap={"20px"}>
                      {submittedReviews.map((val, index) => {
                        const { bgColor, icon, textColor, text } =
                          tableStatusStyleMapper(
                            "review-" + val.work_order_reviewer_response.status
                          );
                        const requester = val.super_admin
                          ? { ...val.super_admin, is_superadmin: true }
                          : {
                              ...val.member.user,
                              role: val.member.role,
                              employee_id: val.member.employee_id,
                            };
                        return (
                          <Flex w={"100%"} flexDir={"column"} gap={"20px"}>
                            <Flex flexDir={"column"}>
                              <Flex alignItems={"center"} gap={"10px"}>
                                {requester?.first_name ? (
                                  <Avatar
                                    outline={"1px solid #dc143c"}
                                    border={"2px solid white"}
                                    name={
                                      requester?.first_name +
                                      " " +
                                      requester?.last_name
                                    }
                                    src={
                                      requester?.profile_image_url
                                        ? IMGURL + requester?.profile_image_url
                                        : null
                                    }
                                  ></Avatar>
                                ) : (
                                  <Flex
                                    outline={"1px solid #dc143c"}
                                    bg={"#bababa"}
                                    borderRadius={"100%"}
                                    justifyContent={"center"}
                                    alignItems={"center"}
                                    h={"48px"}
                                    w={"48px"}
                                    border={"2px solid white"}
                                  >
                                    <Flex color={"white"} fontSize={"24px"}>
                                      <FaUserAlt />
                                    </Flex>
                                  </Flex>
                                )}
                                <Flex w={"100%"} flexDir={"column"}>
                                  <Flex
                                    w={"100%"}
                                    alignItems={"center"}
                                    justify={"space-between"}
                                  >
                                    <Flex flexDir={"column"}>
                                      <Flex fontWeight={700}>
                                        {requester.first_name +
                                          " " +
                                          requester.last_name}
                                      </Flex>

                                      <Flex fontSize={"14px"} color={"#848484"}>
                                        {requester?.is_superadmin
                                          ? "Super Admin"
                                          : labelizeRole(requester?.role) +
                                            " - " +
                                            requester?.employee_id}
                                      </Flex>
                                    </Flex>
                                    <Flex color={"green"}>
                                      <Flex
                                        fontWeight={700}
                                        borderRadius={"10px"}
                                        px={"8px"}
                                        py={"4px"}
                                        alignItems={"center"}
                                        gap={"8px"}
                                        bg={bgColor}
                                        fontSize={"16px"}
                                        color={textColor}
                                      >
                                        <Flex fontSize={"20px"}>{icon}</Flex>
                                        <Flex>{text}</Flex>
                                      </Flex>
                                    </Flex>
                                  </Flex>
                                </Flex>
                              </Flex>
                            </Flex>
                            <Flex>
                              {val.work_order_reviewer_response.status ===
                              "approved" ? (
                                <Flex
                                  alignItems={"center"}
                                  fontWeight={700}
                                  color={"#3D9666"}
                                  gap={"5px"}
                                >
                                  <Flex>
                                    <FaCheck />
                                  </Flex>
                                  <Flex>All Steps Approved!</Flex>
                                </Flex>
                              ) : val.work_order_reviewer_response.status ===
                                "rejected" ? (
                                <Flex gap={"5px"} flexDir={"column"}>
                                  <Flex
                                    alignItems={"center"}
                                    fontWeight={700}
                                    color={"#dc143c"}
                                    gap={"5px"}
                                  >
                                    <Flex>
                                      <FaFlag />
                                    </Flex>
                                    <Flex>Problematic Steps</Flex>
                                  </Flex>
                                  <Flex flexWrap={"wrap"} gap={"10px"}>
                                    {val.work_order_step_review_rejections
                                      .length ? (
                                      val.work_order_step_review_rejections.map(
                                        (step) => (
                                          <Flex
                                            alignItems={"center"}
                                            gap={"3px"}
                                            borderRadius={"full"}
                                            px={"6px"}
                                            py={"2px"}
                                            fontSize={"12px"}
                                            fontWeight={700}
                                            border={"1px solid #dc143c"}
                                            color={"#dc143c"}
                                            bg={"#FDE2E2"}
                                          >
                                            <Flex>
                                              {step.no_work_order_step}.{" "}
                                              {step.name_work_order_step}
                                            </Flex>
                                          </Flex>
                                        )
                                      )
                                    ) : (
                                      <Flex
                                        fontWeight={700}
                                        fontSize={"12px"}
                                        bg={"#ededed"}
                                        color={"#848484"}
                                        borderRadius={"10px"}
                                        border={"1px solid #848484"}
                                        px={"8px"}
                                      >
                                        No Steps Flagged
                                      </Flex>
                                    )}
                                  </Flex>
                                </Flex>
                              ) : (
                                ""
                              )}
                            </Flex>

                            <Flex flexDir={"column"}>
                              <Flex
                                maxW={"100%"}
                                whiteSpace="normal"
                                wordBreak="break-word"
                                color={
                                  val.work_order_reviewer_response.reason
                                    ? "black"
                                    : "#848484"
                                }
                              >
                                {val.work_order_reviewer_response.reason ||
                                  "No Additional Comment"}
                              </Flex>
                              <Flex
                                justify={"end"}
                                color={"#848484"}
                                fontSize={"14px"}
                              >
                                {moment(val.updated_at).format(
                                  "DD MMMM YYYY hh:mm A"
                                )}
                              </Flex>
                            </Flex>
                            {index !== submittedReviews.length - 1 && (
                              <Divider m={0} borderColor={"#848484"} />
                            )}
                          </Flex>
                        );
                      })}
                    </Flex>
                  </Flex>
                ) : null}
                {pendingReviews?.length ? (
                  <Flex w={"100%"} flexDir={"column"} gap={"20px"}>
                    <Flex flexDir={"column"} gap={"20px"}>
                      <Flex
                        justifyContent={"space-between"}
                        alignItems={"center"}
                      >
                        <Flex
                          color={"#dc143c"}
                          fontSize={"20px"}
                          fontWeight={700}
                        >
                          Pending Reviews ({pendingReviews?.length})
                        </Flex>
                      </Flex>
                      <Divider borderColor={"#848484"} m={0} />
                    </Flex>
                    <Flex flexDir={"column"} gap={"10px"}>
                      {pendingReviews.map((val) => {
                        const requester = val.super_admin
                          ? val.super_admin
                          : {
                              ...val.member.user,
                              role: val.member.role,
                              employee_id: val.member.employee_id,
                            };
                        return (
                          <Flex flexDir={"column"}>
                            <Flex alignItems={"center"} gap={"10px"}>
                              {requester.first_name ? (
                                <Avatar
                                  outline={"1px solid #dc143c"}
                                  border={"2px solid white"}
                                  name={
                                    requester.first_name +
                                    " " +
                                    requester.last_name
                                  }
                                  src={
                                    requester.profile_image_url
                                      ? IMGURL + requester.profile_image_url
                                      : null
                                  }
                                ></Avatar>
                              ) : (
                                <Flex
                                  outline={"1px solid #dc143c"}
                                  bg={"#bababa"}
                                  borderRadius={"100%"}
                                  justifyContent={"center"}
                                  alignItems={"center"}
                                  h={"48px"}
                                  w={"48px"}
                                  border={"2px solid white"}
                                >
                                  <Flex color={"white"} fontSize={"24px"}>
                                    <FaUserAlt />
                                  </Flex>
                                </Flex>
                              )}
                              <Flex w={"100%"} flexDir={"column"}>
                                <Flex
                                  w={"100%"}
                                  alignItems={"center"}
                                  justify={"space-between"}
                                >
                                  <Flex flexDir={"column"}>
                                    <Flex fontWeight={700}>
                                      {requester.first_name +
                                        " " +
                                        requester.last_name}
                                    </Flex>

                                    <Flex fontSize={"14px"} color={"#848484"}>
                                      {labelizeRole(requester.role) +
                                        " - " +
                                        requester.employee_id}
                                    </Flex>
                                  </Flex>
                                  <Flex color={"green"}>
                                    <Flex
                                      fontWeight={700}
                                      borderRadius={"10px"}
                                      px={"8px"}
                                      py={"4px"}
                                      alignItems={"center"}
                                      gap={"8px"}
                                      bg={"#ffeebd"}
                                      fontSize={"16px"}
                                      color={"#ff9100"}
                                    >
                                      <Flex fontSize={"20px"}>
                                        <FaRegClock />
                                      </Flex>
                                      <Flex>Pending</Flex>
                                    </Flex>
                                  </Flex>
                                </Flex>
                              </Flex>
                            </Flex>
                          </Flex>
                        );
                      })}
                    </Flex>
                  </Flex>
                ) : null}
                {skippedReviews?.length ? (
                  <Flex w={"100%"} flexDir={"column"} gap={"20px"}>
                    <Flex flexDir={"column"} gap={"20px"}>
                      <Flex
                        justifyContent={"space-between"}
                        alignItems={"center"}
                      >
                        <Flex
                          color={"#dc143c"}
                          fontSize={"20px"}
                          fontWeight={700}
                        >
                          Skipped Reviews ({skippedReviews?.length})
                        </Flex>
                      </Flex>
                      <Divider borderColor={"#848484"} m={0} />
                    </Flex>
                    <Flex flexDir={"column"} gap={"10px"}>
                      {skippedReviews.map((val) => {
                        const requester = val.super_admin
                          ? val.super_admin
                          : {
                              ...val.member.user,
                              role: val.member.role,
                              employee_id: val.member.employee_id,
                            };
                        return (
                          <Flex flexDir={"column"}>
                            <Flex alignItems={"center"} gap={"10px"}>
                              {requester.first_name ? (
                                <Avatar
                                  outline={"1px solid #dc143c"}
                                  border={"2px solid white"}
                                  name={
                                    requester.first_name +
                                    " " +
                                    requester.last_name
                                  }
                                  src={
                                    requester.profile_image_url
                                      ? IMGURL + requester.profile_image_url
                                      : null
                                  }
                                ></Avatar>
                              ) : (
                                <Flex
                                  outline={"1px solid #dc143c"}
                                  bg={"#bababa"}
                                  borderRadius={"100%"}
                                  justifyContent={"center"}
                                  alignItems={"center"}
                                  h={"48px"}
                                  w={"48px"}
                                  border={"2px solid white"}
                                >
                                  <Flex color={"white"} fontSize={"24px"}>
                                    <FaUserAlt />
                                  </Flex>
                                </Flex>
                              )}
                              <Flex w={"100%"} flexDir={"column"}>
                                <Flex
                                  w={"100%"}
                                  alignItems={"center"}
                                  justify={"space-between"}
                                >
                                  <Flex flexDir={"column"}>
                                    <Flex fontWeight={700}>
                                      {requester.first_name +
                                        " " +
                                        requester.last_name}
                                    </Flex>

                                    <Flex fontSize={"14px"} color={"#848484"}>
                                      {labelizeRole(requester.role) +
                                        " - " +
                                        requester.employee_id}
                                    </Flex>
                                  </Flex>
                                  <Flex color={"green"}>
                                    <Flex
                                      fontWeight={700}
                                      borderRadius={"10px"}
                                      px={"8px"}
                                      py={"4px"}
                                      alignItems={"center"}
                                      gap={"8px"}
                                      bg={"#dedede"}
                                      fontSize={"16px"}
                                      color={"#848484"}
                                    >
                                      <Flex fontSize={"20px"}>
                                        <TbClockX />
                                      </Flex>
                                      <Flex>Skipped</Flex>
                                    </Flex>
                                  </Flex>
                                </Flex>
                              </Flex>
                            </Flex>
                          </Flex>
                        );
                      })}
                    </Flex>
                  </Flex>
                ) : null}
              </Flex>
            </Flex>
          </Flex>
          <WorkOrderDetailsAssociation
            variant={"review"}
            workOrder={workOrder}
          />
        </Flex>
      </Flex>
      {selectedEditStep ? (
        <Flex w={"700px"}>
          <StepDetailsDrawerDetails
            pageModule={pageModule}
            // deleteStep={deleteStep}
            stepIndex={selectedEditStep?.index}
            // nextAlphabeticalSequence={nextAlphabeticalSequence}
            editStepDisclosure={stepDetailsDisclosure}
            selectedEditStep={selectedEditStep}
            variant={"review"}
            // formikSetValues={formik.setValues}
            mainTotalStep={mainTotalStep}
            stepType={"workOrderSteps"}
            // reviewsThatFlaggedThisStep={
            //   selectedEditStep?.reviewsThatFlaggedThisStep
            // }
            // machineSelection={machineSelection}
            // memberSelection={memberSelection}
            // lockSelection={lockSelection}
            // handleCallToAction={handleCallToAction}
            selectedEditStepTab={selectedEditStepTab}
            setSelectedEditStepTab={setSelectedEditStepTab}
            workOrderStatus={workOrder.work_order_review.status}
            machineOpenByDefault={false}
            workOrderReviewerStatus={workOrderReviewerStatus}
            isFlagged={flaggedSteps.some(
              // switch id to UID
              (flaggedStep) => flaggedStep.UID === selectedEditStep.UID // compare by ID or any unique key
            )}
            handleFlagSteps={handleFlagSteps}
            // handleOpenAbortStep={handleOpenAbortStep}
            // handleOpenSwitchAssignee={handleOpenSwitchAssignee}
            // hasManagePermission={hasManagePermission}
            // handleOpenSendReminder={handleOpenSendReminder}
            // abortStepDisclosure={abortStepDisclosure}
            // switchAssigneeDisclosure={switchAssigneeDisclosure}
          />
        </Flex>
      ) : (
        ""
      )}
    </WorkOrderDetailsLayout>
  ) : (
    <ReviewDetails404Page />
  );
}
