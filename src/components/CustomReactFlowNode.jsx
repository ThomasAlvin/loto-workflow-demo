import {
  Button,
  Flex,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Textarea,
  Tooltip,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import {
  memo,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { TfiBackRight } from "react-icons/tfi";
import { TbArrowMoveUp } from "react-icons/tb";
import {
  ReactFlow,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  Handle,
  Position,
  useReactFlow,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import DynamicPropsComparator from "../utils/DynamicPropsComparator";
import { IoIosWarning, IoMdClose } from "react-icons/io";
import { AiOutlineClose } from "react-icons/ai";
import { TiClipboard } from "react-icons/ti";
import {
  FaBan,
  FaCogs,
  FaLink,
  FaPlus,
  FaRegBell,
  FaRegStopCircle,
  FaStar,
  FaStopCircle,
  FaUserAltSlash,
} from "react-icons/fa";
import { MdLockOutline, MdWebhook } from "react-icons/md";
import { BsDiamond, BsFillHexagonFill, BsGlobe2 } from "react-icons/bs";
import NewWorkFlowStepBadges from "./CreateTemplate/NewWorkFlowStepBadges";
import {
  FaArrowRotateRight,
  FaDiamond,
  FaFlag,
  FaPlay,
  FaStop,
} from "react-icons/fa6";
import { useFormikContext } from "formik";
import { useDeleteContext } from "../service/DeleteMultiLockAccessContext";
import { LuCornerLeftUp, LuNetwork } from "react-icons/lu";
import TableStatusStyleMapper from "../utils/tableStatusStyleMapper";
import deleteNodeValidator from "../utils/deleteNodeValidator";
import findAncestorConditions from "../utils/findAncestorConditions";
import { getAllowedLoopTargets } from "../utils/getAllowedLoopTargets";
import { getAllowedLoopTargetsLatest } from "../utils/getAllowedLoopTargetsLatest";
import { memoPropsComparator } from "../debugging/memoPropsComparator";
import {
  ActionsContext,
  AllowedTargetsContext,
  FlagContext,
  UIContext,
} from "../service/FlowProvider";

function CustomReactFlowNodeMemo(node) {
  console.log(node.data.order, "CustomReactFlowNode Rerendered");
  const actionsRef = useContext(ActionsContext);
  const { connectingSourceId, editable, variant } = useContext(UIContext);
  const { allowedTargetIds } = useContext(AllowedTargetsContext);
  const { flaggedSteps } = useContext(FlagContext);
  const { deleteElements, getNodes, getEdges } = useReactFlow();
  const { data, selected } = node;
  // const workOrderFormik = useFormikContext();
  const toast = useToast();
  const { bgColor, textColor, icon, text } = TableStatusStyleMapper(
    data?.status
  );
  const { isOpen, deleteTarget, openDeleteConfirm, closeDeleteConfirm } =
    useDeleteContext();
  function getNodeBgColorByStatus(status) {
    switch (status) {
      case "completed":
        return "#edffe3";
      case "ongoing":
        return "#fcffe3";
      case "pending":
        return "white";
      case "cancelled":
        return "#fff2f2";
      case "ongoing_switch":
        return "#f0fdff";
      case "submitted":
        return "#fff6e3";
      case "skipped":
        return "white";
      default:
        return null;
        break;
    }
  }
  const edges = getEdges();
  const isConditional = data.condition;
  const isNormalSourceConnected = useMemo(() => {
    return edges.some(
      (e) => e.source === node.id && e.sourceHandle === "normal"
    );
  }, [edges, node.id]);

  const isLoopBackSourceConnected = useMemo(() => {
    return edges.some(
      (e) => e.source === node.id && e.sourceHandle === "loop-back"
    );
  }, [edges, node.id]);
  const connectableLoopBackTargets = getAllowedLoopTargetsLatest(
    getNodes(),
    node
  );
  const isConnecting = Boolean(connectingSourceId);
  const isSource = node.id === connectingSourceId;
  const isAllowed = allowedTargetIds.has(node.data.UID);
  const isDimmed = isConnecting && !isSource && !isAllowed;
  const isFlagged = flaggedSteps.some((f) => f.UID === node.data.UID);
  const showLoopBackSource = node.data.isStart && isConnecting && isAllowed;
  const showLoopBackHandle =
    (editable || data.loop_target_UID) &&
    connectableLoopBackTargets.length &&
    !data?.condition &&
    !isNormalSourceConnected;

  return (
    <Flex
      opacity={
        data?.status && data?.status === "skipped"
          ? "0.7"
          : isDimmed
          ? "0.4"
          : data.order
          ? "1"
          : "0.7"
      }
      gap={"5px"}
      w={isConditional ? "126px" : "110px"}
      h={isConditional ? "126px" : "110px"}
      flexDir={"column"}
      alignItems={"center"}
    >
      <Flex
        position={"relative"}
        outline={isConditional && selected ? "2px dashed #039be5" : ""}
        className="drag-handle__custom"
      >
        <Flex
          flexDir={"column"}
          w={isConditional ? "126px" : "110px"}
          h={isConditional ? "126px" : "110px"}
          position={"relative"}
          justify={"center"}
          align={"center"}
          borderRadius={"3px"}
          bg={
            selected
              ? "#039be5"
              : data?.status
              ? textColor
              : data.isStart
              ? "#7059ff"
              : "#848484"
          }
          clipPath={
            isConditional ? "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)" : ""
          }
        >
          <Flex
            w={isConditional ? "124px" : "110px"}
            h={isConditional ? "124px" : "110px"}
            clipPath={
              isConditional ? "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)" : ""
            }
            position={"relative"}
            p={"16px"}
            flexDir={"column"}
            padding={"10px"}
            border={
              isConditional
                ? ""
                : selected
                ? "1px solid #039be5"
                : data?.status
                ? "1px solid " + textColor
                : data.isStart
                ? "1px solid #7059ff"
                : "1px solid #848484"
            }
            borderRadius={"3px"}
            background={
              data?.status
                ? getNodeBgColorByStatus(data?.status)
                : data.isStart
                ? "#f4f2ff"
                : "white"
            }
            textAlign={"center"}
            alignItems={"center"}
            justify={"center"}
            fontSize={"12px"}
          >
            <Flex>
              <NewWorkFlowStepBadges val={data} />
            </Flex>
            {data?.isStart ? (
              <Tooltip
                color={"white"}
                bg={"#7059ff"}
                placement="top"
                hasArrow
                label={"Starting Point"}
              >
                <Flex
                  position={"absolute"}
                  top={isConditional ? "10px" : "4px"}
                  left={isConditional ? "50%" : "4px"}
                  transform={isConditional ? "translate(-50%,0%)" : "none"}
                  color={"#7059ff"}
                  fontSize={"12px"}
                >
                  <FaPlay />
                </Flex>
              </Tooltip>
            ) : (
              ""
            )}
            {/* {workOrderFormik?.errors?.workOrderSteps?.[
              workOrderFormik.values.workOrderSteps.findIndex(
                (step) => step.UID === data.UID,
              )
            ] ? ( */}
            {data.hasError ? (
              <Flex
                position={"absolute"}
                bottom={isConditional ? "10px" : "4px"}
                right={isConditional ? "50%" : "4px"}
                transform={isConditional ? "translate(50%,0%)" : "none"}
                // bottom={"4px"}
                // right={"4px"}

                gap={"2px"}
                alignItems={"center"}
              >
                <Tooltip
                  color={"white"}
                  bg={"#dc143c"}
                  placement="top"
                  hasArrow
                  label={"Step is not fully assigned"}
                >
                  <Flex color={"#dc143c"} fontSize={"14px"}>
                    <FaBan />
                    {/* <FaUserAltSlash /> */}
                  </Flex>
                </Tooltip>
              </Flex>
            ) : (
              ""
            )}
            {data.multiLockAccess ? (
              <Flex
                position={"absolute"}
                top={isConditional ? "50%" : "4px"}
                right={isConditional ? "7px" : "4px"}
                transform={isConditional ? "translate(0%,-50%)" : "none"}
                gap={"2px"}
                alignItems={"center"}
              >
                <Flex fontWeight={700} color={"#dc143c"} fontSize={"12px"}>
                  (
                  {data.isMainMultiLockAccess
                    ? data.multiLockAccessGroup?.name
                    : data.multiLockAccessGroup?.name +
                      data.multiLockAccessStepIndex}
                  )
                </Flex>
              </Flex>
            ) : (
              ""
            )}
            {!isConditional &&
            editable &&
            selected &&
            (!data.multiLockAccessGroup?.name || data.isMainMultiLockAccess) ? (
              <Flex
                position={"absolute"}
                top={"-9px"}
                right={"-9px"}
                gap={"2px"}
                alignItems={"center"}
              >
                <Flex
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteNodeValidator(
                      [node],
                      getNodes(),
                      getEdges(),
                      openDeleteConfirm,
                      toast,
                      actionsRef.current.deleteStep
                    );
                    // deleteElements({ nodes: [{ id: id }] });
                  }}
                  cursor={"pointer"}
                  borderRadius={"2px"}
                  color={"white"}
                  bg={"#dc143c"}
                  fontSize={"18px"}
                >
                  <IoMdClose />
                </Flex>
              </Flex>
            ) : (
              ""
            )}
            {variant === "review" &&
            data?.workOrderReviewerStatus === "pending" &&
            isFlagged ? (
              <Flex
                position={"absolute"}
                left={isConditional ? "10px" : "4px"}
                bottom={isConditional ? "50%" : "4px"}
                transform={isConditional ? "translate(0%,50%)" : "none"}
                // bottom={"4px"}
                // right={"4px"}

                gap={"2px"}
                alignItems={"center"}
              >
                <Tooltip
                  color={"white"}
                  bg={"#dc143c"}
                  placement="top"
                  hasArrow
                  label={"Step is flagged as problematic"}
                >
                  <Flex color={"#dc143c"} fontSize={"14px"}>
                    <FaFlag />
                    {/* <FaUserAltSlash /> */}
                  </Flex>
                </Tooltip>
              </Flex>
            ) : (
              ""
            )}
            <Flex
              position={"absolute"}
              left={isConditional ? "10px" : "4px"}
              bottom={isConditional ? "50%" : "4px"}
              transform={isConditional ? "translate(0%,50%)" : "none"}
              // bottom={"4px"}
              // right={"4px"}

              gap={"2px"}
              alignItems={"center"}
            >
              <Tooltip
                bg={"#dc143c"}
                hasArrow
                placement="top"
                label={(() => {
                  const names = data?.reviewsThatFlaggedThisStep?.length
                    ? data?.reviewsThatFlaggedThisStep?.map((val) => {
                        const filteredReviewer = val.super_admin
                          ? val.super_admin
                          : val.member.user;
                        return `${filteredReviewer.first_name} ${filteredReviewer.last_name}`;
                      })
                    : [];

                  const visibleNames = names.slice(0, 3);
                  const remainingCount = names.length - visibleNames.length;

                  return (
                    "Flagged by " +
                    visibleNames.join(", ") +
                    (remainingCount > 0 ? ` and ${remainingCount} others` : "")
                  );
                })()}
              >
                <Flex
                  display={
                    data?.reviewsThatFlaggedThisStep?.length ? "flex" : "none"
                  }
                  justify={"space-between"}
                  alignItems={"center"}
                  color={"#dc143c"}
                >
                  <FaFlag />
                </Flex>
              </Tooltip>
            </Flex>
          </Flex>
        </Flex>
        {isConditional &&
        editable &&
        selected &&
        (!data.multiLockAccessGroup?.name || data.isMainMultiLockAccess) ? (
          <Flex
            position={"absolute"}
            top={"-9px"}
            right={"-9px"}
            gap={"2px"}
            alignItems={"center"}
          >
            <Flex
              onClick={async (e) => {
                e.stopPropagation();
                deleteNodeValidator(
                  [node],
                  getNodes(),
                  getEdges(),
                  openDeleteConfirm,
                  toast,
                  actionsRef.current.deleteStep
                );
              }}
              cursor={"pointer"}
              borderRadius={"2px"}
              color={"white"}
              bg={"#dc143c"}
              fontSize={"18px"}
            >
              <IoMdClose />
            </Flex>
          </Flex>
        ) : (
          ""
        )}
        <Handle
          type="target"
          style={{
            borderRadius: "0",
            width: "12px",
            height: "6px",
            // border: "2px solid #848484",
            // background: "white",
            border: "2px solid #039be5",
            background: "#d9fbff",
            opacity: showLoopBackSource ? 1 : data.isStart ? 0 : 1,
            pointerEvents: showLoopBackSource
              ? 1
              : data.isStart
              ? "none"
              : "auto",
            transition: "0.1s",
          }}
          isConnectable={
            showLoopBackSource ? true : data.isStart ? false : editable
          }
          position={Position.Top}
        />
        <Handle
          type="source"
          id="normal"
          style={{
            width: "12px",
            height: "12px",
            // border: "2px solid #848484",
            // background: "white",
            border: "2px solid #039be5",
            background: "#d9fbff",
            opacity: !isLoopBackSourceConnected ? 1 : 0,
            pointerEvents: !isLoopBackSourceConnected ? "auto" : "none",
          }}
          position={Position.Bottom}
          isConnectableStart={editable}
        />

        <Tooltip label="Loop Back" bg={"#00CB94"} color={"white"}>
          <Handle
            type="source"
            id="loop-back"
            style={{
              width: "18px",
              height: "18px",
              alignItems: "center",
              justifyContent: "center",
              // border: "2px solid #848484",
              border: "2px solid #00CB94",
              background: "#cffff2",
              opacity: showLoopBackHandle ? 1 : 0,
              pointerEvents: showLoopBackHandle ? "auto" : "none",
            }}
            position={Position.Left}
            isConnectableStart={editable}
          >
            <Flex
              w={"100%"}
              h={"100%"}
              justify={"center"}
              alignItems={"center"}
              fontSize={"12px"}
              color={"#00CB94"}
            >
              <FaArrowRotateRight />
            </Flex>
          </Handle>
        </Tooltip>
      </Flex>
      <Flex
        onClick={(e) => e.stopPropagation()}
        className="nodrag"
        alignItems={"center"}
        flexDir={"column"}
      >
        <Flex
          alignItems={"center"}
          whiteSpace={"nowrap"}
          fontWeight={700}
          fontSize={"12px"}
          gap={"3px"}
        >
          <Flex alignItems={"center"}>
            <Flex>{data.order ? data.order + "." : "(Unordered)"}&nbsp;</Flex>
            <Flex>{data.label}</Flex>
          </Flex>
          {/* Untuk display review details */}
          {variant === "workOrder" ? (
            !editable ? (
              <Flex
                fontWeight={700}
                borderRadius={"10px"}
                px={"4px"}
                // py={"2px"}
                alignItems={"center"}
                gap={"2px"}
                bg={bgColor}
                color={textColor}
                fontSize={"10px"}
              >
                <Flex>{text}</Flex>
              </Flex>
            ) : (
              ""
            )
          ) : (
            ""
          )}
        </Flex>
        {data.condition ? (
          <Flex whiteSpace={"nowrap"} color={"#848484"} fontSize={"12px"}>
            <Flex>{data.condition_question}</Flex>
          </Flex>
        ) : (
          ""
        )}
        {/* {data.UID ? (
          <Flex
            onClick={() => {
              console.log(data.UID);
            }}
            whiteSpace={"nowrap"}
            color={"red"}
            fontSize={"12px"}
          >
            <Flex>{data.UID}</Flex>
          </Flex>
        ) : (
          ""
        )} */}
        {/* {data.idDB ? (
          <Flex whiteSpace={"nowrap"} color={"blue"} fontSize={"12px"}>
            <Flex>{data.idDB}</Flex>
          </Flex>
        ) : (
          ""
        )} */}
        {/* {data?.loop_target_UID ? (
          <Flex whiteSpace={"nowrap"} color={"#848484"} fontSize={"12px"}>
            <Flex>{data.loop_target_UID}</Flex>
          </Flex>
        ) : (
          ""
        )} */}
      </Flex>
    </Flex>
  );
}
const CustomReactFlowNode = memo(
  CustomReactFlowNodeMemo,
  memoPropsComparator("CustomReactFlowNode")
);
export default CustomReactFlowNode;
