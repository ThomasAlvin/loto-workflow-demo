import {
  AiOutlineSync,
  AiOutlineUserSwitch,
  AiOutlineWarning,
} from "react-icons/ai";
import { BsPatchCheck } from "react-icons/bs";
import {
  FaFileExport,
  FaFileImport,
  FaForward,
  FaLink,
  FaPlus,
  FaUserAlt,
} from "react-icons/fa";
import { FaFilePen, FaRegClock, FaUsers } from "react-icons/fa6";
import { FiCheckCircle, FiXCircle } from "react-icons/fi";
import { ImCheckmark } from "react-icons/im";
import {
  IoIosWarning,
  IoMdArrowRoundForward,
  IoMdCheckmark,
  IoMdLock,
  IoMdUnlock,
} from "react-icons/io";
import {
  IoChatbubbleEllipsesOutline,
  IoCheckmarkDoneSharp,
} from "react-icons/io5";
import {
  LuClipboardPen,
  LuClipboardPenLine,
  LuClipboardX,
  LuMailWarning,
} from "react-icons/lu";
import {
  MdBrokenImage,
  MdLogin,
  MdLogout,
  MdOutlineBrokenImage,
  MdOutlineSwapHoriz,
  MdOutlineWifi,
  MdOutlineWifiOff,
} from "react-icons/md";
import { RiDraftLine, RiSwapBoxFill, RiSwapBoxLine } from "react-icons/ri";
import { TbCircleDashedCheck, TbClockX } from "react-icons/tb";
import {} from "react-icons/tb";

const TableStatusStyleMapper = (status) => {
  switch (status) {
    case "out_of_order":
      return {
        icon: <AiOutlineWarning />,
        bgColor: "#FDE2E2",
        textColor: "#dc143c",
        text: "Out of order",
      };
    case "operational":
      return {
        icon: <FiCheckCircle />, // Example error icon
        bgColor: "#DBF6CB",
        textColor: "#3D9666",
        text: "Operational",
      };

    case "under_maintenance":
      return {
        icon: <LuClipboardPen />, // Example error icon
        bgColor: "#e3e3ff",
        textColor: "#7B7BBA",
        text: "Under Maintenance",
      };

    case "idle":
      return {
        icon: <IoChatbubbleEllipsesOutline />, // Example error icon
        bgColor: "#FDE2E2",
        textColor: "#dc143c",
        text: "Idle",
      };
    case "ongoing_inspection":
      return {
        icon: <LuClipboardPen />, // Example error icon
        bgColor: "#e3e3ff",
        textColor: "#7B7BBA",
        text: "Ongoing Inspection",
      };
    case "decommissioned":
      return {
        icon: <MdOutlineBrokenImage />, // Example error icon
        bgColor: "#dedede",
        textColor: "#848484",
        text: "Decommissioned",
      };
    case "draft":
      return {
        icon: <RiDraftLine />, // Example error icon
        bgColor: "#cfecff",
        textColor: "#19a3ff",
        text: "Draft",
      };
    case "published":
      return {
        icon: <FiCheckCircle />, // Example error icon
        bgColor: "#DBF6CB",
        textColor: "#3D9666",
        text: "Published",
      };
    case "completed":
      return {
        icon: <FiCheckCircle />, // Example error icon
        bgColor: "#DBF6CB",
        textColor: "#3D9666",
        text: "Completed",
      };
    case "ongoing":
      return {
        icon: <FaRegClock />, // Example error icon
        bgColor: "#ffeebd",
        textColor: "#ff9100",
        text: "Ongoing",
      };
    case "ongoing_switch":
      return {
        icon: <AiOutlineUserSwitch />,
        bgColor: "#d9fbff",
        textColor: "#00bcd4",
        text: "Ongoing Switch",
      };
    case "skipped":
      return {
        icon: <FaForward />,
        bgColor: "#dedede",
        textColor: "#848484",
        text: "Skipped",
      };
    case "pending":
      return {
        icon: <IoChatbubbleEllipsesOutline />, // Example error icon
        bgColor: "#dedede",
        textColor: "#848484",
        text: "Pending",
      };
    case "submitted":
      return {
        icon: <BsPatchCheck />, // Example error icon
        bgColor: "#fff6e3",
        textColor: "#cfaf74",
        text: "Submitted",
      };
    case "unverified":
      return {
        icon: <LuMailWarning />, // Example error icon
        bgColor: "#dedede",
        textColor: "#848484",
        text: "Unverified",
      };
    case "completed":
      return {
        icon: <FiCheckCircle />, // Example error icon
        bgColor: "#DBF6CB",
        textColor: "#3D9666",
        text: "Completed",
      };
    case "cancelled":
      return {
        icon: <AiOutlineWarning />,
        bgColor: "#FDE2E2",
        textColor: "#dc143c",
        text: "Cancelled",
      };
    case "overdue":
      return {
        icon: <TbClockX />,
        bgColor: "#FDE2E2",
        textColor: "#DC143C",
        text: "Overdue",
      };
    case "available":
      return {
        icon: <FiCheckCircle />,
        bgColor: "#DBF6CB",
        textColor: "#3D9666",
        text: "Available",
      };
    case "assigned":
      return {
        icon: <FaLink />,
        bgColor: "#ffecd1",
        textColor: "#FF9900",
        text: "Assigned",
      };
    case "verified":
      return {
        icon: <FiCheckCircle />,
        bgColor: "#DBF6CB",
        textColor: "#3D9666",
        text: "Verified",
      };
    case "under_review":
      return {
        icon: <LuClipboardPenLine />,
        bgColor: "#e3e3ff",
        textColor: "#7B7BBA",
        text: "Under Review",
      };
    case "approved":
      return {
        icon: <FiCheckCircle />,
        bgColor: "#DBF6CB",
        textColor: "#3D9666",
        text: "Approved",
      };
    case "rejected":
      return {
        icon: <FiXCircle />,
        bgColor: "#FDE2E2",
        textColor: "#dc143c",
        text: "Rejected",
      };
    case "review_rejected":
      return {
        icon: <LuClipboardX />,
        bgColor: "#FDE2E2",
        textColor: "#dc143c",
        text: "Review Rejected",
      };
    case "review-approved":
      return {
        icon: <FiCheckCircle />,
        bgColor: "#DBF6CB",
        textColor: "#3D9666",
        text: "Approved",
      };
    case "review-rejected":
      return {
        icon: <FiXCircle />,
        bgColor: "#FDE2E2",
        textColor: "#dc143c",
        text: "Rejected",
      };
    case "review-skipped":
      return {
        icon: <FaForward />,
        bgColor: "#dedede",
        textColor: "#848484",
        text: "Skipped",
      };
    case "review-pending":
      return {
        icon: <FaRegClock />,
        bgColor: "#ffeebd",
        textColor: "#ff9100",
        text: "Pending",
      };
    case "review-draft":
      return {
        icon: <RiDraftLine />, // Example error icon
        bgColor: "#cfecff",
        textColor: "#19a3ff",
        text: "Draft",
      };
    case "single":
      return {
        icon: <IoMdCheckmark />,
        bgColor: "#cfecff",
        textColor: "#19a3ff",
        text: "Single Approval",
      };
    case "all":
      return {
        icon: <IoCheckmarkDoneSharp />,
        bgColor: "#cfecff",
        textColor: "#19a3ff",
        text: "Multi Approval",
      };
    case "unlocked":
      return {
        icon: <IoMdUnlock />, // Example error icon
        bgColor: "#DBF6CB",
        textColor: "#3D9666",
        text: "Unlocked",
      };
    case "locked":
      return {
        icon: <IoMdLock />, // Example error icon

        bgColor: "#FDE2E2",
        textColor: "#dc143c",
        text: "Locked ",
      };
    case "connected":
      return {
        icon: <MdOutlineWifi />, // Example error icon
        bgColor: "#DBF6CB",
        textColor: "#3D9666",
        text: "Connected",
      };
    case "disconnected":
      return {
        icon: <MdOutlineWifiOff />, // Example error icon
        bgColor: "#FDE2E2",
        textColor: "#dc143c",
        text: "Disconnected ",
      };
    case "awaiting_sync":
      return {
        icon: <AiOutlineSync />, // Example error icon
        bgColor: "#e6e6fa",
        textColor: "#7059ff",
        text: "Awaiting Sync ",
      };
    case "action_required":
      return {
        icon: <IoIosWarning />, // Example error icon
        bgColor: "#ffeebd",
        textColor: "#ff9100",
        text: "Action Required",
      };
    case "create":
      return {
        icon: <FaPlus />, // Example error icon
        bgColor: "#d6eaff",
        textColor: "#007bff",
        text: "Create",
      };
    case "update":
      return {
        icon: <FaFilePen />, // Example error icon
        bgColor: "#ffeebd",
        textColor: "#ff9100",
        text: "Update",
      };
    case "delete":
      return {
        icon: <FiXCircle />,
        bgColor: "#FDE2E2",
        textColor: "#dc143c",
        text: "Delete",
      };
    case "import":
      return {
        icon: <FaFileImport />, // Example error icon
        bgColor: "#e6e6fa",
        textColor: "#7059ff",
        text: "Import",
      };
    case "export":
      return {
        icon: <FaFileExport />, // Example error icon
        bgColor: "#e6e6fa",
        textColor: "#7059ff",
        text: "Export",
      };
    case "login":
      return {
        icon: <MdLogin />, // Example error icon
        bgColor: "#DBF6CB",
        textColor: "#3D9666",
        text: "Login",
      };
    case "logout":
      return {
        icon: <MdLogout />, // Example error icon
        bgColor: "#FDE2E2",
        textColor: "#dc143c",
        text: "Logout",
      };

    default:
      return {
        icon: null,
        bgColor: "#FFFFFF",
        textColor: "#000000",
        text: "Unknown status",
      };
  }
};
export default TableStatusStyleMapper;
