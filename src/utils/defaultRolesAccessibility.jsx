import { CgTemplate } from "react-icons/cg";
import {
  FaBuilding,
  FaClipboardList,
  FaFileAlt,
  FaKey,
  FaThLarge,
  FaUserCog,
  FaWrench,
} from "react-icons/fa";
import { FaMapLocationDot } from "react-icons/fa6";
import { GoChecklist } from "react-icons/go";
import { GrHistory } from "react-icons/gr";
import { MdSpaceDashboard } from "react-icons/md";

const defaultRoleAccessibility = [
  {
    name: "Admin",
    technicalName: "admin",
    modules: [
      {
        name: "dashboard",
        description:
          "View key metrics, track activities, and access important insights at a glance.",
        permissions: [{ permission: "view" }],
        icon: MdSpaceDashboard,
      },
      {
        name: "activities",
        description: "Oversee and track user's activities throughout the app",
        permissions: [{ permission: "view" }],
        icon: GrHistory,
      },
      {
        name: "work_sites",
        description: "Manage work sites, determining where users can operate",
        permissions: [{ permission: "view" }],
        icon: FaMapLocationDot,
      },
      {
        name: "work_orders",
        description:
          "Oversee, assign, and track work orders to ensure efficient task management.",
        permissions: [
          { permission: "view" },
          {
            permission: "create",
          },
          { permission: "delete" },
        ],
        icon: FaClipboardList,
      },

      {
        name: "templates",
        description: "Create, manage, and customize reusable templates",
        permissions: [
          { permission: "view" },
          {
            permission: "create",
          },
          {
            permission: "delete",
          },
        ],
        icon: FaThLarge,
      },
      {
        name: "equipment_machines",
        description:
          "Manage and track equipment to ensure proper maintenance and usage.",
        permissions: [
          { permission: "view" },
          {
            permission: "create",
          },
          { permission: "delete" },
        ],
        icon: FaWrench,
      },
      {
        name: "machine_categories",
        description:
          "Manage machine categories for better organization and tracking.",
        permissions: [
          { permission: "view" },
          {
            permission: "create",
          },
          { permission: "delete" },
        ],
        icon: CgTemplate,
      },
      {
        name: "inspection_forms",
        description:
          "Manage machine inspection forms to ensure proper maintenance and compliance.",
        permissions: [
          { permission: "view" },
          {
            permission: "create",
          },
          { permission: "delete" },
        ],
        icon: GoChecklist,
      },

      {
        name: "lock_inventory",
        description:
          "Manage lock records used in work orders, ensuring proper control.",
        permissions: [
          { permission: "view" },
          {
            permission: "create",
          },
          { permission: "delete" },
        ],
        icon: FaKey,
      },
      {
        name: "members",
        description: "Manage team members, including their roles",
        permissions: [
          { permission: "view" },
          {
            permission: "create",
          },
          { permission: "delete" },
        ],
        icon: FaUserCog,
      },

      {
        name: "reports",
        description:
          "Access and manage reports to track work orders and inspections ",
        permissions: [{ permission: "view" }],
        icon: FaFileAlt,
      },
    ],
  },
  {
    name: "Supervisor",
    technicalName: "supervisor",
    modules: [
      {
        name: "dashboard",
        description:
          "View key metrics, track activities, and access important insights at a glance.",
        permissions: [{ permission: "view" }],
        icon: MdSpaceDashboard,
      },
      {
        name: "activities",
        description:
          "Oversee, assign, and track user's activities throughout the app",
        permissions: [{ permission: "view" }],
        icon: GrHistory,
      },
      {
        name: "work_sites",
        description: "Manage work sites, determining where users can operate",
        permissions: [{ permission: "view" }],
        icon: FaMapLocationDot,
      },
      {
        name: "work_orders",
        description:
          "Oversee, assign, and track work orders to ensure efficient task management.",
        permissions: [
          { permission: "view" },
          {
            permission: "create",
          },
          { permission: "delete" },
        ],
        icon: FaClipboardList,
      },

      {
        name: "templates",
        description: "Create, manage, and customize reusable templates",
        permissions: [
          { permission: "view" },
          {
            permission: "create",
          },
          {
            permission: "delete",
          },
        ],
        icon: FaThLarge,
      },
      {
        name: "equipment_machines",
        description:
          "Manage and track equipment to ensure proper maintenance and usage.",
        permissions: [
          { permission: "view" },
          {
            permission: "create",
          },
          { permission: "delete" },
        ],
        icon: FaWrench,
      },
      {
        name: "machine_categories",
        description:
          "Manage machine categories for better organization and tracking.",
        permissions: [
          { permission: "view" },
          {
            permission: "create",
          },
          { permission: "delete" },
        ],
        icon: CgTemplate,
      },
      {
        name: "inspection_forms",
        description:
          "Manage machine inspection forms to ensure proper maintenance and compliance.",
        permissions: [
          { permission: "view" },
          {
            permission: "create",
          },
          { permission: "delete" },
        ],
        icon: GoChecklist,
      },

      {
        name: "lock_inventory",
        description:
          "Manage lock records used in work orders, ensuring proper control.",
        permissions: [
          { permission: "view" },
          {
            permission: "create",
          },
          { permission: "delete" },
        ],
        icon: FaKey,
      },
      {
        name: "members",
        description: "Manage team members, including their roles",
        permissions: [{ permission: "view" }],
        icon: FaUserCog,
      },
      {
        name: "reports",
        description:
          "Access and manage reports to track work orders and inspections ",
        permissions: [{ permission: "view" }],
        icon: FaFileAlt,
      },
    ],
  },
  {
    name: "Safety Officer",
    technicalName: "safety_officer",
    modules: [
      {
        name: "dashboard",
        description:
          "View key metrics, track activities, and access important insights at a glance.",
        permissions: [{ permission: "view" }],
        icon: MdSpaceDashboard,
      },
      {
        name: "activities",
        description:
          "Oversee, assign, and track user's activities throughout the app",
        permissions: [{ permission: "view" }],
        icon: GrHistory,
      },
      {
        name: "work_sites",
        description: "Manage work sites, determining where users can operate",
        permissions: [{ permission: "view" }],
        icon: FaMapLocationDot,
      },
      {
        name: "work_orders",
        description:
          "Oversee, assign, and track work orders to ensure efficient task management.",
        permissions: [
          { permission: "view" },
          {
            permission: "create",
          },
          { permission: "delete" },
        ],
        icon: FaClipboardList,
      },
      {
        name: "templates",
        description: "Create, manage, and customize reusable templates",
        permissions: [
          { permission: "view" },
          {
            permission: "create",
          },
          {
            permission: "delete",
          },
        ],
        icon: FaThLarge,
      },
      {
        name: "equipment_machines",
        description:
          "Manage and track equipment to ensure proper maintenance and usage.",
        permissions: [{ permission: "view" }],
        icon: FaWrench,
      },
      {
        name: "machine_categories",
        description:
          "Manage machine categories for better organization and tracking.",
        permissions: [{ permission: "view" }],
        icon: CgTemplate,
      },
      {
        name: "inspection_forms",
        description:
          "Manage machine inspection forms to ensure proper maintenance and compliance.",
        permissions: [
          { permission: "view" },
          { permission: "create" },
          { permission: "delete" },
        ],
        icon: GoChecklist,
      },
      {
        name: "members",
        description: "Manage team members, including their roles",
        permissions: [{ permission: "view" }],
        icon: FaUserCog,
      },
      {
        name: "lock_inventory",
        description:
          "Manage lock records used in work orders, ensuring proper control.",
        permissions: [{ permission: "view" }],
        icon: FaKey,
      },
      {
        name: "reports",
        description:
          "Access and manage reports to track work orders and inspections ",
        permissions: [{ permission: "view" }],
        icon: FaFileAlt,
      },
    ],
  },
  {
    name: "Authorized Employee",
    technicalName: "authorized_employee",
    modules: [
      {
        name: "dashboard",
        description:
          "View key metrics, track activities, and access important insights at a glance.",
        permissions: [],
        icon: MdSpaceDashboard,
      },
      {
        name: "activities",
        description:
          "Oversee, assign, and track user's activities throughout the app",
        permissions: [],
        icon: GrHistory,
      },
      {
        name: "work_sites",
        description: "Manage work sites, determining where users can operate",
        permissions: [{ permission: "view" }],
        icon: FaMapLocationDot,
      },
      {
        name: "work_orders",
        description:
          "Oversee, assign, and track work orders to ensure efficient task management.",
        permissions: [
          {
            permission: "view_assigned",
          },
        ],
        icon: FaClipboardList,
      },

      {
        name: "templates",
        description: "Create, manage, and customize reusable templates",
        permissions: [],
        icon: FaThLarge,
      },
      {
        name: "equipment_machines",
        description:
          "Manage and track equipment to ensure proper maintenance and usage.",
        permissions: [],
        icon: FaWrench,
      },
      {
        name: "machine_categories",
        description:
          "Manage machine categories for better organization and tracking.",
        permissions: [],
        icon: CgTemplate,
      },
      {
        name: "inspection_forms",
        description:
          "Manage machine inspection forms to ensure proper maintenance and compliance.",
        permissions: [],
        icon: GoChecklist,
      },
      {
        name: "lock_inventory",
        description:
          "Manage lock records used in work orders, ensuring proper control.",
        permissions: [],
        icon: FaKey,
      },
      {
        name: "members",
        description: "Manage team members, including their roles",
        permissions: [],
        icon: FaUserCog,
      },

      {
        name: "reports",
        description:
          "Access and manage reports to track work orders and inspections ",
        permissions: [],
        icon: FaFileAlt,
      },
    ],
  },
  {
    name: "Contractor",
    technicalName: "contractor",
    modules: [
      {
        name: "dashboard",
        description:
          "View key metrics, track activities, and access important insights at a glance.",
        permissions: [],
        icon: MdSpaceDashboard,
      },
      {
        name: "activities",
        description:
          "Oversee, assign, and track user's activities throughout the app",
        permissions: [],
        icon: GrHistory,
      },
      {
        name: "work_sites",
        description: "Manage work sites, determining where users can operate",
        permissions: [{ permission: "view" }],
        icon: FaMapLocationDot,
      },
      {
        name: "work_orders",
        description:
          "Oversee, assign, and track work orders to ensure efficient task management.",
        permissions: [
          {
            permission: "view_assigned",
          },
        ],
        icon: FaClipboardList,
      },

      {
        name: "templates",
        description: "Create, manage, and customize reusable templates",
        permissions: [],
        icon: FaThLarge,
      },
      {
        name: "equipment_machines",
        description:
          "Manage and track equipment to ensure proper maintenance and usage.",
        permissions: [
          {
            permission: "view_assigned",
          },
        ],
        icon: FaWrench,
      },
      {
        name: "machine_categories",
        description:
          "Manage machine categories for better organization and tracking.",
        permissions: [],
        icon: CgTemplate,
      },
      {
        name: "inspection_forms",
        description:
          "Manage machine inspection forms to ensure proper maintenance and compliance.",
        permissions: [],
        icon: GoChecklist,
      },

      {
        name: "lock_inventory",
        description:
          "Manage lock records used in work orders, ensuring proper control.",
        permissions: [],
        icon: FaKey,
      },
      {
        name: "members",
        description: "Manage team members, including their roles",
        permissions: [],
        icon: FaUserCog,
      },

      {
        name: "reports",
        description:
          "Access and manage reports to track work orders and inspections ",
        permissions: [],
        icon: FaFileAlt,
      },
    ],
  },
  {
    name: "Affected Employee",
    technicalName: "affected_employee",
    modules: [
      {
        name: "dashboard",
        description:
          "View key metrics, track activities, and access important insights at a glance.",
        permissions: [],
        icon: MdSpaceDashboard,
      },
      {
        name: "activities",
        description:
          "Oversee, assign, and track user's activities throughout the app",
        permissions: [{ permission: "view" }],
        icon: GrHistory,
      },
      {
        name: "work_sites",
        description: "Manage work sites, determining where users can operate",
        permissions: [{ permission: "view" }],
        icon: FaMapLocationDot,
      },
      {
        name: "work_orders",
        description:
          "Oversee, assign, and track work orders to ensure efficient task management.",
        permissions: [
          {
            permission: "view_assigned",
          },
        ],
        icon: FaClipboardList,
      },

      {
        name: "templates",
        description: "Create, manage, and customize reusable templates",
        permissions: [],
        icon: FaThLarge,
      },
      {
        name: "equipment_machines",
        description:
          "Manage and track equipment to ensure proper maintenance and usage.",
        permissions: [],
        icon: FaWrench,
      },
      {
        name: "machine_categories",
        description:
          "Manage machine categories for better organization and tracking.",
        permissions: [],
        icon: CgTemplate,
      },
      {
        name: "inspection_forms",
        description:
          "Manage machine inspection forms to ensure proper maintenance and compliance.",
        permissions: [],
        icon: GoChecklist,
      },

      {
        name: "lock_inventory",
        description:
          "Manage lock records used in work orders, ensuring proper control.",
        permissions: [],
        icon: FaKey,
      },
      {
        name: "members",
        description: "Manage team members, including their roles",
        permissions: [],
        icon: FaUserCog,
      },
      {
        name: "reports",
        description:
          "Access and manage reports to track work orders and inspections ",
        permissions: [],
        icon: FaFileAlt,
      },
    ],
  },
  {
    name: "Finance",
    technicalName: "finance",
    modules: [
      {
        name: "dashboard",
        description:
          "View key metrics, track activities, and access important insights at a glance.",
        permissions: [],
        icon: MdSpaceDashboard,
      },

      {
        name: "work_sites",
        description: "Manage work sites, determining where users can operate",
        permissions: [],
        icon: FaMapLocationDot,
      },
      {
        name: "work_orders",
        description:
          "Oversee, assign, and track work orders to ensure efficient task management.",
        permissions: [],
        icon: FaClipboardList,
      },
      {
        name: "activities",
        description:
          "Oversee, assign, and track user's activities throughout the app",
        permissions: [],
        icon: GrHistory,
      },
      {
        name: "templates",
        description: "Create, manage, and customize reusable templates",
        permissions: [],
        icon: FaThLarge,
      },
      {
        name: "equipment_machines",
        description:
          "Manage and track equipment to ensure proper maintenance and usage.",
        permissions: [],
        icon: FaWrench,
      },
      {
        name: "machine_categories",
        description:
          "Manage machine categories for better organization and tracking.",
        permissions: [],
        icon: CgTemplate,
      },
      {
        name: "inspection_forms",
        description:
          "Manage machine inspection forms to ensure proper maintenance and compliance.",
        permissions: [],
        icon: GoChecklist,
      },
      {
        name: "lock_inventory",
        description:
          "Manage lock records used in work orders, ensuring proper control.",
        permissions: [],
        icon: FaKey,
      },
      {
        name: "members",
        description: "Manage team members, including their roles",
        permissions: [],
        icon: FaUserCog,
      },
      {
        name: "reports",
        description:
          "Access and manage reports to track work orders and inspections ",
        permissions: [],
        icon: FaFileAlt,
      },
    ],
  },
];
export default defaultRoleAccessibility;
