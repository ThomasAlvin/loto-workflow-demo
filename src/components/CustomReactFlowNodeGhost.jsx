import { Flex } from "@chakra-ui/react";

import "@xyflow/react/dist/style.css";
import { BsGlobe2 } from "react-icons/bs";
import { FaCogs, FaLink, FaRegBell } from "react-icons/fa";
import { LuNetwork } from "react-icons/lu";
import { MdLockOutline, MdWebhook } from "react-icons/md";
import { TiClipboard } from "react-icons/ti";
import NewWorkFlowStepBadges from "./CreateTemplate/NewWorkFlowStepBadges";
export default function CustomReactFlowNodeGhost({ data, nodeGhostRef }) {
  const badges = [
    data?.form && {
      label: "Form",
      bg: "#e6e6fa",
      color: "#7059ff",
      icon: <TiClipboard />,
    },
    data?.notify && {
      label: "Notify",
      bg: "#fff1d9",
      color: "#ff8629",
      icon: <FaRegBell />,
    },
    data?.machine && {
      label: "Machine",
      bg: "#EDF2F7",
      color: "#848484",
      icon: <FaCogs />,
    },
    (data?.condition || data?.condition) && {
      label: "Condition",
      bg: "#fddeff",
      color: "#f329ff",
      icon: <LuNetwork />,
    },
    (data?.multiLockAccess ||
      data?.multi_lock_access ||
      data?.multi_access_lock) && {
      label: `(${
        data?.isMainMultiLockAccess || data?.is_main_multi_access_lock
          ? data?.multiLockAccessGroup?.name ||
            data?.work_order_multi_lock_group?.name ||
            data?.template_multi_lock_group?.name ||
            data?.report_multi_lock_group?.name
          : (data?.multiLockAccessGroup?.name ||
              data?.work_order_multi_lock_group?.name ||
              data?.template_multi_lock_group?.name ||
              data?.report_multi_lock_group?.name) +
            (data?.multiLockAccessStepIndex ||
              data?.multi_access_lock_step_index)
      }) Lock Access`,
      bg: "#ffe6e6",
      color: "#e32020",
      icon: data?.isMainMultiLockAccess ? <MdLockOutline /> : <FaLink />,
    },
  ].filter(Boolean);

  const visibleBadges = badges.slice(0, 2);
  const isConditional = data?.condition;
  return (
    <Flex
      position={"fixed"}
      top={"-99999px"}
      left={"-99999px"}
      ref={nodeGhostRef}
      opacity={data?.order ? "1" : "0.7"}
      gap={"5px"}
      w={isConditional ? "126px" : "110px"}
      h={isConditional ? "126px" : "110px"}
      flexDir={"column"}
      alignItems={"center"}
    >
      <Flex>
        <Flex
          flexDir={"column"}
          w={isConditional ? "126px" : "110px"}
          h={isConditional ? "126px" : "110px"}
          position={"relative"}
          justify={"center"}
          align={"center"}
          borderRadius={"3px"}
          bg={
            data?.isStart && data?.isEnd
              ? "#7059ff"
              : data?.isStart && !data?.isEnd
              ? "#3D9666"
              : data?.isEnd && !data?.isStart
              ? "#ffc06e"
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
                : data?.isStart && data?.isEnd
                ? "1px solid #7059ff"
                : data?.isStart && !data?.isEnd
                ? "1px solid #3D9666"
                : data?.isEnd && !data?.isStart
                ? "1px solid #ffc06e"
                : "1px solid #848484"
            }
            borderRadius={"3px"}
            background={
              data?.isStart && data?.isEnd
                ? "#f4f2ff"
                : data?.isStart && !data?.isEnd
                ? "#edffe3"
                : data?.isEnd && !data?.isStart
                ? "#fcffe3"
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
          </Flex>
        </Flex>
      </Flex>
    </Flex>
  );
}
