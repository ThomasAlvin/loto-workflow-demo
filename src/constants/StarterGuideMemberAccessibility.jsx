import { BsFillClipboard2CheckFill } from "react-icons/bs";
import {
  FaClipboardList,
  FaFileAlt,
  FaThLarge,
  FaUserCog,
  FaWrench,
} from "react-icons/fa";
import { FaMapLocationDot } from "react-icons/fa6";
import { GrHistory } from "react-icons/gr";
import { ImPriceTag } from "react-icons/im";
import { IoIosLock, IoIosPaper } from "react-icons/io";
import { MdSpaceDashboard } from "react-icons/md";
import { RiSwapBoxFill } from "react-icons/ri";

const starterGuideMemberAccessibility = [
  {
    name: "dashboard",
    permissions: [{ permission: "view" }],
    icon: MdSpaceDashboard,
  },
  {
    name: "assigned_work_orders",
    permissions: [{ permission: "full_access" }],
    icon: BsFillClipboard2CheckFill,
  },
  {
    name: "work_sites",
    permissions: [{ permission: "view" }, { permission: "manage" }],
    icon: FaMapLocationDot,
  },
  {
    name: "work_orders",
    permissions: [{ permission: "manage_all" }, { permission: "manage_owned" }],
    icon: FaClipboardList,
  },
  {
    name: "reviews",
    permissions: [{ permission: "view_assigned" }, { permission: "manage" }],
    icon: IoIosPaper,
  },
  {
    name: "switch_requests",
    permissions: [{ permission: "view_owned" }, { permission: "manage" }],
    icon: RiSwapBoxFill,
  },
  {
    name: "equipment_machines",
    permissions: [
      { permission: "view" },
      { permission: "view_assigned" },
      { permission: "manage" },
    ],
    icon: FaWrench,
  },
  {
    name: "templates",
    permissions: [
      { permission: "view" },
      { permission: "view_owned" },
      { permission: "manage" },
    ],
    icon: FaThLarge,
  },
  {
    name: "members",
    permissions: [
      { permission: "view" },
      { permission: "manage_admin" },
      { permission: "manage_member" },
      { permission: "manage_finance" },
    ],
    icon: FaUserCog,
  },
  {
    name: "lock_inventory",
    permissions: [
      { permission: "view" },
      { permission: "view_assigned" },
      { permission: "manage" },
    ],
    icon: IoIosLock,
  },
  {
    name: "reports",
    permissions: [{ permission: "view" }, { permission: "view_assigned" }],
    icon: FaFileAlt,
  },
  {
    name: "activities",
    permissions: [{ permission: "view" }, { permission: "view_owned" }],
    icon: GrHistory,
  },
  {
    name: "subscription",
    permissions: [{ permission: "full_access" }],
    icon: ImPriceTag,
  },
];

export default starterGuideMemberAccessibility;
