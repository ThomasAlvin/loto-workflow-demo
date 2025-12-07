import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Avatar,
  Badge,
  Box,
  Button,
  Center,
  Divider,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  Flex,
  Icon,
  Image,
  Input,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Slide,
  Spinner,
  Text,
  Tooltip,
  useDisclosure,
} from "@chakra-ui/react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { CgTemplate } from "react-icons/cg";
import "moment-timezone";
import {
  IoIosListBox,
  IoIosLock,
  IoIosPaper,
  IoIosSwap,
  IoMdClose,
  IoMdSettings,
} from "react-icons/io";
import { api } from "../api/api";
import logoEgeeTouch from "../assets/images/logo-egeetouch.png";
import {
  FaArrowLeftLong,
  FaBook,
  FaCaretLeft,
  FaChevronLeft,
  FaClipboardList,
  FaGear,
  FaMapLocationDot,
  FaRegBellSlash,
  FaScrewdriverWrench,
  FaWrench,
} from "react-icons/fa6";
import {
  MdEmail,
  MdOutlineEmail,
  MdRepeatOn,
  MdSpaceDashboard,
  MdSwapHorizontalCircle,
} from "react-icons/md";
import { GrHistory } from "react-icons/gr";
import {
  FaBell,
  FaBuilding,
  FaCheckCircle,
  FaChevronCircleLeft,
  FaChevronRight,
  FaDatabase,
  FaFileAlt,
  FaGlobeAmericas,
  FaKey,
  FaRegCreditCard,
  FaThLarge,
  FaUserCog,
  FaUserPlus,
} from "react-icons/fa";
import { GoChecklist } from "react-icons/go";
import { getAuth, signOut } from "firebase/auth";
import { useEffect, useRef, useState } from "react";
import {
  IoChevronForward,
  IoChevronForwardSharp,
  IoHome,
  IoMegaphone,
  IoMenuSharp,
  IoNotificationsSharp,
  IoWarning,
} from "react-icons/io5";
import { TbCircleChevronRight } from "react-icons/tb";
import { deleteToken, getToken } from "firebase/messaging";
import { messaging, onMessage } from "../firebase/firebase";
import { ImCog, ImPriceTag } from "react-icons/im";
import { ChevronDownIcon, ChevronRightIcon } from "@chakra-ui/icons";
import labelizeRole from "../utils/labelizeRole";
import { useNotifications } from "../service/NotificationContext";
import NotificationMarkAllAsReadConfirmationModal from "./Notification/NotificationMarkAllAsReadConfirmationModal";
import LogoutConfirmationModal from "./LogoutConfirmationModal";
import { HiWrenchScrewdriver } from "react-icons/hi2";
import {
  BsBuilding,
  BsBuildingFill,
  BsBuildingFillAdd,
  BsCreditCard2FrontFill,
  BsFillClipboard2CheckFill,
  BsFilterRight,
} from "react-icons/bs";
import { HiTemplate } from "react-icons/hi";
import { RiSwapBoxFill } from "react-icons/ri";
import { RxGlobe } from "react-icons/rx";
import Can from "../utils/Can";
import NotificationDetailsModal from "./Notification/NotificationDetailsModal";
import Swal from "sweetalert2";
import SwalErrorMessages from "./SwalErrorMessages";
import { AiOutlineMenu } from "react-icons/ai";
export default function NavSidebar({ hideSidebar, setHideSidebar }) {
  const abortControllerRef = useRef(new AbortController()); // Persistent controller
  const {
    notifications,
    setNotifications,
    newNotificationsCount,
    setNewNotificationsCount,
    setNotificationsPagination,
    notificationLoading,
    setNotificationLoading,
    markAllAsRead,
    fetchNotification,
  } = useNotifications();
  const auth = getAuth();

  const announcementArray = [
    {
      title: "Upcoming maintenance in July 24th",
      description:
        "A duplicate of the work order has been created by Super Admin Test and is currently in draft status.",
      date: "17th March 2025",
    },
    {
      title: "Now Supporting Google Login",
      description:
        "A duplicate of the work order has been created by Super Admin Test and is currently in draft status.",
      date: " 12th February 2025",
    },
    {
      title: "New Dashboard Layout Released",
      description:
        "A duplicate of the work order has been created by Super Admin Test and is currently in draft status.",
      date: "1st January 2025",
    },
  ];
  const exampleArr = [
    {
      name: "Work Sites",
      icon: FaMapLocationDot,
      options: [{ name: "Work Sites", icon: FaClipboardList }],
    },
    {
      name: "Work Orders",
      icon: FaClipboardList,
      options: [
        { name: "Work Order", icon: FaClipboardList },
        { name: "Template", icon: FaThLarge },
        { name: "Reviews & Approval", icon: IoIosPaper },
      ],
    },
    {
      name: "Equipment/Machines",
      icon: FaWrench,
      options: [
        { name: "Equipment/Machines", icon: FaWrench },
        { name: "Machine Category", icon: HiTemplate },
        { name: "Inspection Forms", icon: IoIosListBox },
      ],
    },
  ];
  const { isOpen, onOpen, onClose } = useDisclosure();
  const notificationDetailsModalDisclosure = useDisclosure();
  const systemAnnouncementDisclosure = useDisclosure();
  const btnRef = useRef();
  const location = useLocation();
  const userSelector = useSelector((state) => state.login.auth);
  const IMGURL = import.meta.env.VITE_API_IMAGE_URL;
  const pathSegments = location.pathname.split("/");
  const firstRouteSegment = pathSegments[1];
  const secondRouteSegment = pathSegments[2];
  const nav = useNavigate();
  const dispatch = useDispatch();
  const containerRef = useRef();
  const [showNotifWarning, setShowNotifWarning] = useState(
    localStorage.getItem("showNotificationWarning") &&
      localStorage.getItem("showNotificationWarning") === "true"
  );
  const [buttonLoading, setButtonLoading] = useState(false);
  const [deleteNotificationButtonLoading, setDeleteNotificationButtonLoading] =
    useState(false);
  const [selectedNotificationDetails, setSelectedNotificationDetails] =
    useState({});
  const [showMenu, setShowMenu] = useState(false);
  const [menuList, setMenuList] = useState("");
  const sidebarDrawer = useDisclosure();
  const closeTimeout = useRef(null);
  const accountMenuItems = [{ title: "", icon: "" }];

  const dashboardMenu = [
    {
      name: "Starter Guide",
      icon: FaBook,
      link: "/starter-guide",
      roles: [
        "super_admin",
        "admin",
        "member",
        "finance",
        "guest",
        "guest_member",
      ],
    },
    {
      name: "Dashboard",
      icon: MdSpaceDashboard,
      link: "/",
      module: "dashboard",
      permission: ["view"],
    },
    {
      name: "Assigned Work Orders",
      icon: BsFillClipboard2CheckFill,
      link: "/assigned-work-order",
      module: "assigned_work_orders",
      permission: ["full_access"],
    },
    {
      name: "Work Sites",
      icon: FaMapLocationDot,
      link: "/work-site",
      // module: "work_sites",
      // permission: ["view", "view_assigned", "create"],
      isMenu: true,
      options: [
        {
          name: "Work Sites",
          isMenu: true,
          icon: FaMapLocationDot,
          options: [
            {
              name: "Work Site List",
              icon: FaMapLocationDot,
              link: "/work-site",
              module: "work_sites",
              permission: ["view"],
            },
          ],
        },
        {
          name: "Work Orders",
          isMenu: true,
          icon: FaClipboardList,
          options: [
            {
              name: "Work Order List",
              icon: FaClipboardList,
              link: "/work-order",
              module: "work_orders",
              permission: ["view", "view_owned"],
            },

            {
              name: "Reviews List",
              icon: IoIosPaper,
              link: "/review",
              module: "reviews",
              permission: ["view_assigned"],
            },
            {
              name: "Switch Requests List",
              icon: RiSwapBoxFill,
              link: "/switch-request",
              module: "switch_requests",
              permission: ["view_owned"],
            },
          ],
        },
        {
          name: "Equipment/Machines",
          isMenu: true,
          icon: FaWrench,
          options: [
            {
              name: "Equipment/Machines List",
              icon: FaWrench,
              link: "/equipment-machine",
              module: "equipment_machines",
              permission: ["view", "view_assigned"],
            },
            {
              name: "Machine Category List",
              icon: CgTemplate,
              link: "/machine-categories",
              module: "equipment_machines",
              permission: ["view"],
            },
            {
              name: "Inspection Form List",
              icon: GoChecklist,
              link: "/inspection-form",
              module: "equipment_machines",
              permission: ["view"],
            },
          ],
        },
      ],
    },
    {
      name: "Template List",
      icon: FaThLarge,
      link: "/template",
      module: "work_orders",
      permission: ["view_owned", "view"],
    },
    {
      name: "Members",
      isMenu: true,
      icon: FaUserCog,
      options: [
        {
          name: "Members",
          icon: FaUserCog,
          isMenu: true,
          options: [
            {
              name: "Member List",
              icon: FaUserCog,
              link: "/member",
              module: "members",
              permission: ["view"],
            },
          ],
        },
        {
          name: "Departments",
          icon: BsBuildingFill,
          link: "/department",
          isMenu: true,
          options: [
            {
              name: "Department List",
              icon: BsBuildingFill,
              link: "/department",
              module: "members",
              permission: ["view"],
            },
          ],
        },
        // -X disable role settings page X-
        // {
        //   name: "Role Settings",
        //   icon: FaKey,
        //   link: "/role",
        //   roles: ["super_admin"],
        //   // module: ["role_settings"],
        //   // permission: ["all"],
        //   options: [
        //     {
        //       name: "Role Settings",
        //       icon: FaKey,
        //       link: "/role",
        //       // module: ["role_settings"],
        //       // permission: ["view", "view_assigned", "create", "delete"],
        //     },
        //   ],
        // },
      ],
    },
    {
      name: "Lock Inventory",
      icon: IoIosLock,
      link: "/lock-inventory",
      module: "lock_inventory",
      permission: ["view", "view_assigned"],
    },
    {
      name: "Reports",
      icon: FaFileAlt,
      link: "/report",
      module: "reports",
      permission: ["view", "view_owned"],
    },
    // Disabled for request demo feature
    // {
    //   name: "Subscription Plan",
    //   icon: ImPriceTag,
    //   link:
    //     userSelector.role === "guest"
    //       ? "/subscription-plan"
    //       : "/account-settings?tab=subscription",
    //   roles: ["super_admin", "finance", "guest"],
    // },
  ];
  function newNotifCountFontSize(number) {
    const length = number.toString().length;
    if (length === 1) {
      return "14px";
    } else if (length === 2) {
      return "12px";
    } else if (length === 3) {
      return "10px";
    } else {
      return "9px"; // fallback for longer numbers
    }
  }
  function getMenuForRole(role, userPermissions = []) {
    return dashboardMenu
      .map((menu) => {
        if (userSelector.role === "super_admin") {
          if (menu.name === "Assigned Work Orders") {
            return null;
          }
          return menu;
        }
        if (menu.isMenu) {
          const filteredOptions = menu.options
            .map((option) => {
              if (option.isMenu) {
                const filteredOptions2 = option.options.filter((option2) => {
                  const hasRoleAccess =
                    Array.isArray(option2.roles) && option2.roles.length > 0
                      ? option2.roles.includes(role)
                      : false;

                  const modulePermissions =
                    userPermissions
                      .find((mod) => mod.name === option2.module)
                      ?.permissions.map((perm) => perm.permission) || [];

                  // const hasModuleAccess = modulePermissions.some((perm) =>
                  //   ["view", "view_assigned"].includes(perm)
                  // );
                  const hasModuleAccess = modulePermissions.some((perm) =>
                    option2.permission.includes(perm)
                  );

                  return hasRoleAccess || hasModuleAccess;
                });

                if (filteredOptions2.length > 0) {
                  return {
                    ...option,
                    options: filteredOptions2,
                  };
                }
                return null;
              }
              return null;
            })
            .filter(Boolean); // removes all nulls

          if (filteredOptions.length > 0) {
            return { ...menu, options: filteredOptions };
          }
          return null;
          // if (filteredOptions.length > 0) {
          //   return { ...menu, options: filteredOptions };
          // }
          // return null;
        }

        const hasRoleAccess =
          Array.isArray(menu.roles) && menu.roles.length > 0
            ? menu.roles.includes(role)
            : false;

        const modulePermissions =
          userPermissions
            .find((mod) => mod.name === menu.module)
            ?.permissions.map((perm) => perm.permission) || [];

        const hasModuleAccess = modulePermissions.some((perm) =>
          ["view", "view_assigned", "view_owned", "full_access"].includes(perm)
        );

        return hasRoleAccess || hasModuleAccess ? menu : null;
      })
      .filter(Boolean);
  }

  function listenForNotifications() {
    try {
      const unsubscribe = onMessage(messaging, (payload) => {
        const newNotification = JSON.parse(payload.data.data);

        setNotifications((prevState) => [newNotification, ...prevState]);

        setNotificationsPagination((prevState) => {
          console.log(prevState);

          if (
            prevState.currentPage == 1 &&
            (prevState.data.length <= prevState.rows ||
              prevState.rows === "All")
          ) {
            const updatedData = [newNotification, ...prevState.data];
            if (updatedData.length > prevState.rows) {
              updatedData.pop();
            }
            return {
              ...prevState,
              data: updatedData,
              showing: {
                current:
                  prevState.showing.current >= 10
                    ? prevState.showing.current
                    : prevState.showing.current + 1,
                total: prevState.showing.total + 1,
              },
            };
          } else {
            return prevState;
          }
        });

        setNewNotificationsCount((prevCount) => prevCount + 1);
      });
      return unsubscribe;
    } catch (error) {
      console.warn("Notification denied or error:", error);
    }
  }

  async function logout() {
    try {
      setButtonLoading(true);
      dispatch({ type: "logout" });
    } catch (error) {
      setButtonLoading(false);
      console.error("Error logging out:", error);
    }
  }
  async function deleteNotification(UID) {
    setDeleteNotificationButtonLoading(true);
    await api
      .delete(`notification/${UID}`)
      .then((response) => {
        Swal.fire({
          title: "Success!",
          text: response.data.message,
          icon: "success",
          customClass: {
            popup: "swal2-custom-popup",
            title: "swal2-custom-title",
            content: "swal2-custom-content",
            actions: "swal2-custom-actions",
            confirmButton: "swal2-custom-confirm-button",
          },
        });
        abortControllerRef.current.abort(); // Cancel any previous request
        abortControllerRef.current = new AbortController();
        fetchAndLoadNotifications();
      })
      .catch((error) => {
        Swal.fire({
          title: "Oops...",
          icon: "error",
          html: SwalErrorMessages(error.response.data.message),
          customClass: {
            popup: "swal2-custom-popup",
            title: "swal2-custom-title",
            content: "swal2-custom-content",
            actions: "swal2-custom-actions",
            confirmButton: "swal2-custom-confirm-button",
          },
        });
      })
      .finally(() => {
        setDeleteNotificationButtonLoading(false);
        notificationDetailsModalDisclosure.onClose();
        // deleteNotificationDisclosure.onClose();
      });
  }

  function handleNotifNavigation(navRoute) {
    nav(navRoute);
    onClose();
  }
  async function fetchAndLoadNotifications(controller) {
    try {
      setNotificationLoading(true);
      const response = await fetchNotification(
        abortControllerRef.current.signal,
        "",
        1,
        10,
        null
      );
    } catch (error) {
      console.log(error);
    } finally {
      setNotificationLoading(false); // This will run regardless of success or failure
    }
  }
  async function handleOpenNotificationDetailsModal(val) {
    setNotifications((prevState) =>
      prevState.map((notification) =>
        notification.UID === val.UID
          ? { ...notification, is_read: 1 } // Mark as read
          : notification
      )
    );
    setNotificationsPagination((prevState) => ({
      ...prevState,
      data: prevState.data.map((notification) =>
        notification.UID === val.UID
          ? { ...notification, is_read: 1 } // Mark as read
          : notification
      ),
    }));
    setNewNotificationsCount((prevState) => {
      return prevState > 0 ? prevState - 1 : 0;
    });
    setSelectedNotificationDetails(val);
    notificationDetailsModalDisclosure.onOpen();
    await api
      .post(`notification/mark-single/${val.UID}`)
      .then((response) => {})
      .catch((error) => {
        console.log(error);
      });
  }
  async function handleOpen(val) {
    setShowMenu(true);
    setMenuList(val);
    sidebarDrawer.onOpen();
    if (closeTimeout.current) {
      clearTimeout(closeTimeout.current);
    }
  }
  async function handleClose() {
    sidebarDrawer.onClose();
    closeTimeout.current = setTimeout(() => {
      setShowMenu(false);
      setMenuList("");
    }, 200);
  }
  useEffect(() => {
    fetchAndLoadNotifications();
    const unsubscribe = listenForNotifications();
    return () => {
      abortControllerRef.current.abort(); // Cleanup on unmount
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  return (
    <nav class="navbar sticky-top sticky-left justify-content-center w-100 p-0">
      <Flex w={"100%"} flexDir={"column"}>
        <Flex
          background={"#dc143c"}
          py={"8px"}
          color={"white"}
          justifyContent={"space-between"}
          width={{ md: "100%", lg: "100%", base: "100%" }}
          pr={{ md: "30px", lg: "30px", base: "30px" }}
          // paddingLeft={hideSidebar ? "30px" : "310px"}
          paddingLeft={hideSidebar ? "90px" : "310px"}
          transition="padding-left 0.2s"
          height={"76px"}
          shadow="0px 0px 3px rgba(50, 50, 93, 0.5)"
        >
          <Box className="d-flex align-items-center gap-3">
            <button
              class="navbar-toggler d-sm-none"
              type="button"
              data-bs-toggle="offcanvas"
              data-bs-target="#offcanvasNavbar"
              aria-controls="offcanvasNavbar"
              aria-label="Toggle navigation"
            >
              <span class="navbar-toggler-icon"></span>
            </button>
            {/* {hideSidebar ? (
              ""
            ) : (
              <Flex
                onClick={() => {
                  setHideSidebar((prevState) => !prevState);
                }}
                cursor={"pointer"}
                fontSize={"28px"}
              >
                <IoMenuSharp />
              </Flex>
            )} */}

            <Flex
              onClick={() => {
                console.log(userSelector);
              }}
              fontSize={"20px"}
              fontWeight={700}
            >
              eGeeTouch Smart LOTO Management System Version 1.2.209.5
            </Flex>
          </Box>

          <Flex>
            <Flex gap={"20px"} alignItems={"center"}>
              <Menu isOpen={isOpen} onClose={onClose} placement="bottom">
                <Tooltip label="Notifications" hasArrow>
                  <MenuButton
                    onFocus={(e) => e.preventDefault()}
                    onClick={onOpen}
                    aspectRatio={1}
                    borderRadius={"100%"}
                    minH={"none"}
                    minW={"none"}
                    // h={"auto"}
                    p={"5px"}
                    bg={"inherit"}
                    cursor={"pointer"}
                    color="white"
                    _hover={{ background: "#db183f" }}
                    position={"relative"}
                  >
                    <IoNotificationsSharp fontSize={"24px"} />
                    {newNotificationsCount ? (
                      <Flex
                        aspectRatio={1}
                        // p={"2px"}
                        w={"20px"}
                        fontWeight={700}
                        borderRadius={"100%"}
                        alignItems={"center"}
                        justify={"center"}
                        bg={"#e89d00"}
                        color={"white"}
                        position={"absolute"}
                        top={"-3px"}
                        right={"-3px"}
                        fontSize={() =>
                          newNotifCountFontSize(newNotificationsCount)
                        }
                      >
                        {newNotificationsCount}
                      </Flex>
                    ) : (
                      ""
                    )}
                  </MenuButton>
                </Tooltip>
                <MenuList
                  p={0}
                  bg={"white"}
                  boxShadow={"0px 0px 3px rgba(50,50,93,0.5)"}
                  w={"400px"}
                  color={"#dc143c"}
                >
                  <Flex flexDir={"column"}>
                    <Flex
                      px={"20px"}
                      alignItems={"center"}
                      justify={"space-between"}
                      borderBottom={"1px solid #bababa"}
                      py={"10px"}
                    >
                      <Flex fontWeight={700} fontSize={"20px"} color={"black"}>
                        Notifications
                      </Flex>
                      <NotificationMarkAllAsReadConfirmationModal
                        variant={"Text"}
                        fetchAndLoadNotifications={fetchAndLoadNotifications}
                        markAllAsRead={markAllAsRead}
                        abortControllerRef={abortControllerRef}
                      />
                    </Flex>
                    {notificationLoading ? (
                      <Center
                        py={"20px"}
                        flexDir={"column"}
                        alignItems={"center"}
                        gap={"20px"}
                        height="100%"
                        opacity={1}
                      >
                        <Spinner thickness="4px" size="lg" color="#dc143c" />
                        <Center
                          flexDir={"column"}
                          color={"#dc143c"}
                          fontWeight={700}
                        >
                          <Flex color={"black"} fontSize={"16px"}>
                            Fetching notifications...
                          </Flex>
                        </Center>
                      </Center>
                    ) : notifications.length ? (
                      notifications.slice(0, 3).map((val) => (
                        <Flex
                          borderBottom={"1px solid #bababa"}
                          py={"10px"}
                          px={"20px"}
                          flexDir={"column"}
                          onClick={() => {
                            handleOpenNotificationDetailsModal(val);
                          }}
                          cursor={"pointer"}
                          bg={val.is_read ? "#ededed" : "white"}
                          _hover={{ bg: "#dedede" }}
                          transition={"background-color 0.2s ease"}
                        >
                          <Flex
                            alignItems={"center"}
                            gap={"10px"}
                            justify={"space-between"}
                          >
                            <Flex gap={"10px"} alignItems={"center"}>
                              {val.type === "system" ? (
                                <Flex
                                  bg={"#bababa"}
                                  minW={"48px"}
                                  minH={"48px"}
                                  borderRadius={"100%"}
                                  justifyContent={"center"}
                                  alignItems={"center"}
                                >
                                  <Flex color={"white"} fontSize={"24px"}>
                                    <HiWrenchScrewdriver />
                                  </Flex>
                                </Flex>
                              ) : (
                                <Avatar
                                  key={val.from_user.id}
                                  outline={"1px solid #dc143c"}
                                  name={
                                    val.from_user.first_name +
                                    " " +
                                    val.from_user.last_name
                                  }
                                  src={
                                    val.from_user.profile_image_url
                                      ? IMGURL + val.from_user.profile_image_url
                                      : undefined
                                  }
                                  border={"2px solid white"}
                                ></Avatar>
                              )}
                              <Flex flexDir={"column"}>
                                <Flex
                                  color={"black"}
                                  gap={"5px"}
                                  alignItems={"center"}
                                >
                                  <Flex fontWeight={700}>
                                    {val.type === "system"
                                      ? "System Notification"
                                      : val.from_user.first_name +
                                        " " +
                                        val.from_user.last_name}
                                  </Flex>
                                  {val.is_read ? (
                                    <Flex
                                      color={"white"}
                                      bg={"#bababa"}
                                      p={"2px 5px"}
                                      fontSize={"11px"}
                                      fontWeight={700}
                                      borderRadius={"5px"}
                                    >
                                      Read
                                    </Flex>
                                  ) : (
                                    <Flex
                                      color={"white"}
                                      bg={"#dc143c"}
                                      p={"2px 5px"}
                                      fontSize={"11px"}
                                      fontWeight={700}
                                      borderRadius={"5px"}
                                    >
                                      New!
                                    </Flex>
                                  )}
                                </Flex>
                                <Flex fontSize={"14px"} color={"#848484"}>
                                  {val.message}
                                </Flex>
                              </Flex>
                            </Flex>
                            <Flex fontSize={"28px"}>
                              <TbCircleChevronRight />
                            </Flex>
                          </Flex>
                        </Flex>
                      ))
                    ) : (
                      <Center bg={"#F5F5F5"} py={"20px"} flexDir={"column"}>
                        <Flex fontSize={"60px"}>
                          <FaRegBellSlash />
                        </Flex>
                        <Flex color={"#848484"}>
                          No new notification available
                        </Flex>
                      </Center>
                    )}

                    <Center
                      borderTop={"1px solid #BABABA"}
                      p={"10px"}
                      fontSize={"16px"}
                      fontWeight={700}
                      px={"20px"}
                      cursor={"pointer"}
                      _hover={{ bg: "#dedede" }}
                      onClick={() => {
                        handleNotifNavigation("/notification");
                      }}
                    >
                      View All Notifications
                    </Center>
                  </Flex>
                </MenuList>
              </Menu>
              <Menu>
                <MenuButton
                  px={"5px"}
                  bg={"inherit"}
                  color={"white"}
                  borderRadius={"20px"}
                  as={Button}
                  _hover={{ background: "#db183f" }}
                  _active={{ background: "#db183f" }}
                  fontSize={"14px"}
                >
                  <Flex gap={"10px"} alignItems={"center"}>
                    <Flex>
                      <Avatar
                        p={"1px"}
                        src={
                          userSelector.profile_image_url
                            ? IMGURL + userSelector.profile_image_url
                            : null
                        }
                        // size={"sm"}
                        border={"2px solid white"}
                        outline={"1px solid #dc143c"}
                        bg={
                          userSelector.profile_image_url ? "white" : "gray.400"
                        }
                      />
                    </Flex>
                    <Flex flexDir={"column"}>
                      <Flex>
                        {userSelector.first_name + " " + userSelector.last_name}
                      </Flex>
                      <Flex
                        fontSize={"13px"}
                        color={"#f8f9fa"}
                        fontWeight={400}
                      >
                        {labelizeRole(userSelector.role)}
                      </Flex>
                    </Flex>
                    <Flex fontSize={"20px"}>
                      <ChevronDownIcon />
                    </Flex>
                  </Flex>
                </MenuButton>

                <MenuList color={"#dc143c"}>
                  <MenuItem
                    onClick={() => {
                      nav("/account-settings");
                    }}
                  >
                    <Flex gap={"10px"} alignItems={"center"}>
                      <Flex>
                        <FaGear />
                      </Flex>
                      <Flex>Account Settings</Flex>
                    </Flex>
                  </MenuItem>
                  <Can
                    roles={["guest"]}
                    module={"subscription"}
                    permission={["full_access"]}
                  >
                    <MenuItem
                      onClick={() => {
                        nav("/account-settings?tab=subscription");
                      }}
                    >
                      <Flex gap={"10px"} alignItems={"center"}>
                        <Flex>
                          <FaRegCreditCard />
                        </Flex>
                        <Flex>My Subscription Plan</Flex>
                      </Flex>
                    </MenuItem>
                  </Can>
                  <MenuItem
                    onClick={() => {
                      nav("/activity");
                    }}
                  >
                    <Flex gap={"10px"} alignItems={"center"}>
                      <Flex>
                        <GrHistory />
                      </Flex>
                      <Flex>User Activities</Flex>
                    </Flex>
                  </MenuItem>
                  <LogoutConfirmationModal
                    buttonLoading={buttonLoading}
                    logoutFunction={logout}
                  />
                </MenuList>
              </Menu>
            </Flex>
          </Flex>
        </Flex>
        {showNotifWarning ? (
          <Flex
            py={"4px"}
            paddingLeft={"290px"}
            paddingRight={"10px"}
            bg={"#fff0bd"}
            color={"#ff9b0d"}
            justify={"space-between"}
            alignItems={"center"}
          >
            <Flex alignItems={"center"} gap={"3px"}>
              <Flex fontSize={"20px"}>
                <IoWarning />
              </Flex>
              <Box as="span" fontWeight={700}>
                Warning :
              </Box>
              &nbsp;Our real time notification system is disabled in some
              browsers such as :&nbsp;
              <Box as="span" fontWeight={700}>
                Safari, Internet Explorer (IE11 and earlier), and older versions
                of Microsoft Edge.
              </Box>
            </Flex>
            <Flex
              borderRadius={"100%"}
              cursor={"pointer"}
              p={"2px"}
              _hover={{ bg: "#ffe075" }}
              fontSize={"20px"}
              onClick={() => {
                setShowNotifWarning("");
                localStorage.removeItem("showNotificationWarning");
              }}
            >
              <IoMdClose />
            </Flex>
          </Flex>
        ) : (
          ""
        )}
      </Flex>

      <div
        class="offcanvas border-none offcanvas-start w-auto gap-0 transform-none visible z-index-0"
        style={{
          border: "none",
          backgroundColor: "transparent",
        }}
      >
        <Flex flexDir={"column"} position={"relative"}>
          <Flex h={"100vh"}>
            <Flex
              zIndex={11}
              width={hideSidebar ? "60px" : "280px"}
              transition="width 0.2s ease"
            >
              <Flex w={"100%"}>
                <Flex background={"white"} w={"100%"}>
                  <Flex position={"relative"} flex={1} flexDir={"column"}>
                    <div
                      style={{
                        backgroundColor: "#ad1d1d",
                      }}
                      class="offcanvas-header d-flex justify-content-center"
                    >
                      <h5 class="offcanvas-title">
                        <Flex
                          justify={"center"}
                          pl={hideSidebar ? "0px" : "20px"}
                          alignItems={"center"}
                          color={"white"}
                          h={"44.75px"}
                        >
                          {hideSidebar ? (
                            <Flex
                              onClick={() => {
                                setHideSidebar((prevState) => !prevState);
                              }}
                              cursor={"pointer"}
                              fontSize={"28px"}
                            >
                              <IoMenuSharp />
                            </Flex>
                          ) : (
                            ""
                          )}
                          <Image
                            cursor={"pointer"}
                            opacity={hideSidebar ? 0 : 1}
                            onClick={() => nav("/starter-guide")}
                            w={hideSidebar ? "0px" : "200px"}
                            transition={"opacity 0.5s ease"}
                            src={logoEgeeTouch}
                          ></Image>
                          {hideSidebar ? (
                            ""
                          ) : (
                            <Flex
                              onClick={() => {
                                setHideSidebar((prevState) => !prevState);
                              }}
                              cursor={"pointer"}
                              fontSize={"32px"}
                            >
                              <BsFilterRight />
                            </Flex>
                          )}

                          {/* <Flex
                          position={"absolute"}
                          right={"-20px"}
                          onClick={() => {
                            setHideSidebar((prevState) => !prevState);
                          }}
                        >
                          <FaChevronCircleLeft />
                        </Flex> */}
                        </Flex>
                      </h5>
                    </div>
                    <Divider margin={"0px"} />

                    <Box
                      h={"100%"}
                      borderRight={"1px solid #bababa"}
                      class="offcanvas-body p-0"
                    >
                      <Flex
                        bg={"#f8f9fa"}
                        flexDir={"column"}
                        className="navbar-nav justify-content-end flex-grow-1 "
                      >
                        {getMenuForRole(
                          userSelector.role,
                          userSelector.permissions
                        ).map((val) => {
                          return val?.isMenu ? (
                            <>
                              {" "}
                              <Button
                                border={"none"}
                                bg={
                                  val.name === menuList?.name
                                    ? "white"
                                    : "inherit"
                                }
                                borderLeft={
                                  val.name === menuList?.name
                                    ? "8px solid #dc143c"
                                    : "none"
                                }
                                borderBottom={"1px solid #bababa"}
                                borderRadius={"0px"}
                                color={"#dc143c"}
                                lineHeight={""}
                                _hover={{
                                  borderLeft: "8px solid #dc143c",
                                  bg: "white",
                                }}
                                onMouseEnter={() => {
                                  handleOpen(val);
                                }}
                                onMouseLeave={() => handleClose()}
                                h={"auto"}
                                py={"14px"}
                                px={"10px"}
                                fontWeight={400}
                                justifyContent={
                                  hideSidebar ? "center" : "space-between"
                                }
                                fontSize={hideSidebar ? "20px" : "16px"}
                              >
                                <Flex gap={"10px"} alignItems={"center"}>
                                  <Icon as={val?.icon}></Icon>
                                  {hideSidebar ? "" : <Flex>{val?.name}</Flex>}
                                </Flex>
                                {hideSidebar ? (
                                  ""
                                ) : (
                                  <Flex>
                                    <FaChevronRight />
                                  </Flex>
                                )}

                                {/* <AccordionIcon fontSize={"24px"} /> */}
                              </Button>
                            </>
                          ) : firstRouteSegment === val?.link?.split("/")[1] ? (
                            <>
                              {/* <Link to={val?.link} replace> */}
                              <Flex
                                cursor={"pointer"}
                                border={0}
                                onClick={() => {
                                  nav(
                                    `${location.pathname}?refresh=${Date.now()}`
                                  );
                                }}
                                borderLeft={"8px solid #dc143c"}
                                alignItems={"center"}
                                py={"14px"}
                                px={"10px"}
                                color={"#dc143c"}
                                gap={"10px"}
                                w={"100%"}
                                justifyContent={
                                  hideSidebar ? "center" : "start"
                                }
                                fontSize={hideSidebar ? "20px" : "16px"}
                              >
                                <Icon as={val?.icon}></Icon>
                                {hideSidebar ? "" : <Flex>{val?.name}</Flex>}
                              </Flex>
                              {/* </Link> */}

                              <Divider m={0} borderColor={"#bababa"} />
                            </>
                          ) : (
                            <>
                              <Link to={val?.link}>
                                <Flex
                                  cursor={"pointer"}
                                  _hover={{
                                    bg: "white",
                                    color: "#dc143c",
                                    borderLeft: "8px solid #dc143c",
                                  }}
                                  alignItems={"center"}
                                  py={"14px"}
                                  px={"10px"}
                                  color={"#dc143c"}
                                  gap={"10px"}
                                  w={"100%"}
                                  justifyContent={
                                    hideSidebar ? "center" : "start"
                                  }
                                  fontSize={hideSidebar ? "20px" : "16px"}
                                >
                                  <Icon as={val?.icon}></Icon>
                                  {hideSidebar ? "" : <Flex>{val?.name}</Flex>}
                                </Flex>
                              </Link>

                              <Divider m={0} borderColor={"#bababa"} />
                            </>
                          );
                        })}
                      </Flex>
                    </Box>
                  </Flex>
                </Flex>
              </Flex>
            </Flex>
            <Flex
              h={"100%"}
              position={"relative"}
              bg={"transparent"}
              ref={containerRef}
            >
              <Slide
                direction="left"
                in={sidebarDrawer.isOpen}
                style={{
                  height: "100%",
                  position: "",
                  left: 0,
                  top: 0,
                  background: "white",
                  zIndex: 10,
                }}
                containerRef={containerRef}
                borderRight={"100px solid white"}
              >
                <Flex
                  onMouseEnter={() => handleOpen((prevState) => prevState)}
                  onMouseLeave={() => handleClose()}
                  display={showMenu ? "flex" : "none"}
                  width={"fit-content"}
                  h={"100%"}
                  w={"250px"}
                  color={"#dc143c"}
                >
                  <Flex flexDir={"column"} w={"100%"}>
                    <Flex
                      px={"20px"}
                      h={"77px"}
                      color={"white"}
                      bg={"#C22223"}
                      fontWeight={700}
                      fontSize={"20px"}
                      w={"100%"}
                      alignItems={"center"}
                      borderBottom={"1px solid #bababa"}
                    >
                      {menuList?.name}
                    </Flex>
                    {menuList?.name === "Work Sites" && (
                      <Flex flexDir={"column"} py={"10px"} px={"20px"}>
                        <Flex
                          color={"#848484"}
                          fontWeight={400}
                          fontSize={"14px"}
                        >
                          Current work site:
                        </Flex>
                        <Flex
                          alignItems={"center"}
                          fontWeight={700}
                          color={"black"}
                          // px={"20px"}
                          // py={"10px"}
                          gap={"10px"}
                        >
                          <Flex>
                            <FaMapLocationDot />
                          </Flex>
                          <Flex flexDir={"column"} alignItems="center">
                            <Flex>{userSelector.current_work_site?.name}</Flex>

                            {/* <Badge colorScheme="green" fontSize="0.7rem" px="2">
                        Current
                      </Badge> */}
                          </Flex>
                        </Flex>
                      </Flex>
                    )}

                    <Flex py={"0px"} flexDir={"column"} gap={"30px"}>
                      {menuList?.options?.map((val) => (
                        <Flex flexDir={"column"}>
                          <Flex
                            justify={"space-between"}
                            px={"20px"}
                            py={"10px"}
                            alignItems={"center"}
                            borderY={"1px solid #bababa"}
                            fontWeight={700}
                          >
                            <Flex>{val.name}</Flex>
                            <Flex>
                              <Icon as={val.icon}></Icon>
                            </Flex>
                          </Flex>
                          <Flex
                            flexDir={"column"}
                            // borderBottom={"1px solid #bababa"}
                          >
                            {val?.options?.map((val2) => (
                              <Button
                                border={"none"}
                                borderRadius={"0px"}
                                bg={"white"}
                                color={"#848484"}
                                lineHeight={""}
                                fontSize={"14px"}
                                _hover={{ color: "#dc143c", bg: "#ededed" }}
                                h={"auto"}
                                py={"6px"}
                                px={"20px"}
                                fontWeight={400}
                                justifyContent={"space-between"}
                                onClick={() => {
                                  handleClose();
                                  nav(val2.link);
                                }}
                              >
                                <Flex gap={"10px"} alignItems={"center"}>
                                  <Icon as={val2.icon}></Icon>
                                  <Flex>{val2.name}</Flex>
                                </Flex>
                                {/* <AccordionIcon fontSize={"24px"} /> */}
                              </Button>
                            ))}
                          </Flex>
                        </Flex>
                      ))}
                    </Flex>
                  </Flex>
                </Flex>
              </Slide>
            </Flex>
          </Flex>
          {showMenu && (
            <div
              style={{
                position: "fixed",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                backgroundColor: "rgba(0, 0, 0, 0.5)", // Dark overlay color with transparency
                zIndex: 0, // Ensure the overlay is on top of other content
              }}
              onClick={handleClose} // Close the menu when clicking the overlay
            />
          )}
        </Flex>
      </div>

      <NotificationDetailsModal
        val={selectedNotificationDetails}
        isOpen={notificationDetailsModalDisclosure.isOpen}
        onClose={notificationDetailsModalDisclosure.onClose}
        deleteNotification={deleteNotification}
        deleteButtonLoading={deleteNotificationButtonLoading}
      />
    </nav>
  );
}
