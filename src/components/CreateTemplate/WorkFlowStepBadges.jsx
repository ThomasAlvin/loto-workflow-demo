import { Tooltip, Flex, Text, Box } from "@chakra-ui/react";
import { BsGlobe2 } from "react-icons/bs";
import { FaCogs, FaRegBell, FaUserLock } from "react-icons/fa";
import { FaLink } from "react-icons/fa6";
import { LuNetwork } from "react-icons/lu";
import { MdLockOutline, MdWeb, MdWebhook } from "react-icons/md";
import { TiClipboard } from "react-icons/ti";

export default function WorkFlowStepBadges({ val }) {
  const badges = [
    val.form && {
      label: "Form",
      bg: "#e6e6fa",
      color: "#7059ff",
      icon: <TiClipboard />,
    },
    val.notify && {
      label: "Notify",
      bg: "#fff1d9",
      color: "#ff8629",
      icon: <FaRegBell />,
    },
    val.machine && {
      label: "Machine",
      bg: "#EDF2F7",
      color: "#848484",
      icon: <FaCogs />,
    },
    (val.lockAccess || val.access_lock) && {
      label: "Lock Access",
      bg: "#ffe6e6",
      color: "#e32020",
      icon: <MdLockOutline />,
    },
    (val.condition || val.condition) && {
      label: "Condition",
      bg: "#fddeff",
      color: "#f329ff",
      icon: <LuNetwork />,
    },
    (val.triggerAPI || val.trigger_api) && {
      label: "Trigger API",
      bg: "#dbfbff",
      color: "#3cc1fa",
      icon: <BsGlobe2 />,
    },
    (val.sendWebhook || val.send_webhook) && {
      label: "Webhook",
      bg: "#cffff2",
      color: "#00CB94",
      icon: <MdWebhook />,
    },

    (val.multiLockAccess || val.multi_lock_access || val.multi_access_lock) && {
      label: `(${
        val.isMainMultiLockAccess || val.is_main_multi_access_lock
          ? val.multiLockAccessGroup?.name ||
            val.work_order_multi_lock_group?.name ||
            val.template_multi_lock_group?.name ||
            val.report_multi_lock_group?.name
          : (val.multiLockAccessGroup?.name ||
              val.work_order_multi_lock_group?.name ||
              val.template_multi_lock_group?.name ||
              val.report_multi_lock_group?.name) +
            (val.multiLockAccessStepIndex || val.multi_access_lock_step_index)
      }) Lock Access`,
      bg: "#ffe6e6",
      color: "#e32020",
      icon:
        val.isMainMultiLockAccess || val.is_main_multi_access_lock ? (
          <MdLockOutline />
        ) : (
          <FaLink />
        ),
    },
  ].filter(Boolean);

  const visibleBadges = badges.slice(0, 2);
  const hiddenCount = badges.length - visibleBadges.length;
  return (
    <>
      {visibleBadges.map((badge, idx) => (
        <Flex
          key={idx}
          alignItems="center"
          gap="4px"
          fontWeight={700}
          fontSize="12px"
          py="2px"
          px="10px"
          borderRadius="20px"
          bg={badge.bg}
          color={badge.color}
          whiteSpace="nowrap"
        >
          <Flex>{badge.label}</Flex>
          <Flex fontSize="16px">{badge.icon}</Flex>
        </Flex>
      ))}

      {hiddenCount > 0 && (
        <Tooltip
          color={"white"}
          hasArrow
          placement="top"
          label={badges
            .slice(2)
            .map((b) => b.label)
            .join(", ")}
        >
          <Flex
            alignItems="center"
            fontWeight={700}
            fontSize="12px"
            py="2px"
            px="10px"
            borderRadius="20px"
            bg="#e1ffe0"
            color="#35ab3d"
            cursor="pointer"
          >
            +{hiddenCount} more
          </Flex>
        </Tooltip>
      )}

      {/* Edit, duplicate, delete buttons */}
    </>
  );
}
