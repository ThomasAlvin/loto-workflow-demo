import {
  Avatar,
  AvatarGroup,
  Button,
  Center,
  Flex,
  Grid,
  GridItem,
  Image,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Progress,
  Spinner,
  Table,
  TableContainer,
  Tbody,
  Td,
  Th,
  Thead,
  Tooltip,
  Tr,
} from "@chakra-ui/react";

import moment from "moment";
import { useEffect, useRef, useState } from "react";
import { AiFillPlusCircle } from "react-icons/ai";
import {
  FaCheck,
  FaRegCalendarAlt,
  FaUserAlt,
  FaUsers,
  FaWrench,
} from "react-icons/fa";
import { FaChevronRight, FaMapLocationDot, FaUserLarge } from "react-icons/fa6";
import {
  LuClipboardCheck,
  LuClipboardList,
  LuClipboardPaste,
  LuClipboardPen,
} from "react-icons/lu";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import tinycolor from "tinycolor2";
import { api } from "../api/api";
import emptyIllustration from "../assets/images/EmptyStateImage.png";
import ListEmptyState from "../components/ListEmptyState";
import DashboardPageSkeleton from "../skeletons/DashboardPageSkeleton";
import formatString from "../utils/formatString";
import labelizeRole from "../utils/labelizeRole";
import tableStatusStyleMapper from "../utils/tableStatusStyleMapper";

export default function DashboardPage() {
  const abortControllerRef = useRef(new AbortController()); // Persistent controller
  const abortControllerRef2 = useRef(new AbortController()); // Persistent controller
  const userSelector = useSelector((state) => state.login.auth);
  const [workSiteSelection, setWorkSiteSelection] = useState([]);
  const [dashboardData, setDashboardData] = useState({});
  const [workSiteLoading, setWorkSiteLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const nav = useNavigate();

  const summaryCards = [
    {
      title: "Users",
      icon: <FaUsers />,
      value: dashboardData.total_users,
      bgColor: "#FDE2E2",
      color: "#dc143c",
    },
    {
      title: "Total Work Orders",
      icon: <LuClipboardList />,
      value: dashboardData.total_work_orders,
      bgColor: "#e6e6fa",
      color: "#7059ff",
    },
    {
      title: "Ongoing Work Orders",
      icon: <LuClipboardPaste />,
      value: dashboardData.ongoing_work_orders,
      bgColor: "#ffeebd",
      color: "#ff9100",
    },
    {
      title: "Finished Work Orders",
      icon: <LuClipboardCheck />,
      value: dashboardData.finished_work_orders,
      bgColor: "#DBF6CB",
      color: "#3D9666",
    },
  ];
  async function fetchWorkSites() {
    setWorkSiteLoading(true);
    await api
      .getWorkSites()
      .then((response) => {
        setWorkSiteSelection(response.data.data);
      })
      .catch((error) => {
        console.log(error);
      })
      .finally(() => {
        setWorkSiteLoading(false);
      });
  }
  async function switchWorkSite(workSite) {
    abortControllerRef.current.abort(); // Cancel any previous request
    abortControllerRef.current = new AbortController();
    fetchDashboardData();
  }
  async function fetchDashboardData() {
    setIsLoading(true);
    await api
      .getDashboard()
      .then((response) => {
        setDashboardData(response.data);
      })
      .catch((error) => {
        console.log(error);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }
  function getTooltipLabel(members) {
    const names = members?.map(
      (member) => member.user.first_name + " " + member.user.last_name
    );
    const displayedNames = names?.slice(0, 3).join(", ");
    const remainingCount = names?.length - 3;
    const tooltipLabel =
      remainingCount > 0
        ? `${displayedNames}, and ${remainingCount} more`
        : displayedNames;
    return tooltipLabel;
  }

  useEffect(() => {
    abortControllerRef.current = new AbortController();
    abortControllerRef2.current = new AbortController();
    fetchDashboardData();
    fetchWorkSites();

    return () => {
      abortControllerRef.current.abort(); // Cleanup on unmount
      abortControllerRef2.current.abort(); // Cleanup on unmount
    };
  }, []);

  return (
    <>
      {isLoading ? (
        <DashboardPageSkeleton />
      ) : (
        <Flex
          w={"100%"}
          flexDir={"column"}
          px={"30px"}
          py={"20px"}
          gap={"20px"}
        >
          <Flex alignItems={"center"} justify={"space-between"}>
            <Flex color={"#dc143c"} fontSize={"28px"} fontWeight={700}>
              Dashboard
            </Flex>
            <Menu>
              <MenuButton
                flexShrink={0}
                _hover={{
                  bg: tinycolor("#dc143c").darken(8).toString(),
                }}
                _active={{
                  bg: tinycolor("#dc143c").darken(8).toString(),
                }}
                as={Button}
                color={"white"}
                bg={"#dc143c"}
                h={"28px"}
                px={"12px"}
                alignContent={"center"}
                fontSize={"14px"}
              >
                <Flex alignItems={"center"} gap={"5px"}>
                  <Flex>
                    <FaMapLocationDot />
                  </Flex>
                  <Flex>{userSelector?.current_work_site?.name}</Flex>
                </Flex>
              </MenuButton>
              <MenuList py={"0px"}>
                {workSiteLoading ? (
                  <Center gap={"10px"} py={"10px"}>
                    <Spinner color="#dc143c" />
                    <Flex fontWeight={700}>Fetching Work Sites...</Flex>
                  </Center>
                ) : (
                  workSiteSelection.map((workSite) => {
                    const isCurrentWorkSite =
                      userSelector?.current_work_site?.name === workSite.name;
                    return (
                      <MenuItem
                        bg={"white"}
                        position={"relative"}
                        _hover={{ bg: "#ededed" }}
                        onClick={() => {
                          if (isCurrentWorkSite) return;
                          switchWorkSite(workSite);
                        }}
                      >
                        <Flex w={"100%"} alignItems={"center"} gap={"10px"}>
                          <Flex fontSize={"24px"} color={"#dc143c"}>
                            <FaMapLocationDot />
                          </Flex>
                          <Flex
                            flex={1}
                            alignItems={"center"}
                            justify={"space-between"}
                            gap={"10px"}
                          >
                            <Flex flexDir={"column"}>
                              <Flex
                                alignItems={"center"}
                                gap={"8px"}
                                fontWeight={700}
                              >
                                <Flex>{workSite.name}</Flex>
                                {userSelector.main_work_site?.UID ===
                                workSite.UID ? (
                                  <Flex
                                    bg={"#dc143c"}
                                    color={"white"}
                                    fontSize={"12px"}
                                    px={"5px"}
                                    py={"2px"}
                                    borderRadius={"5px"}
                                  >
                                    Default
                                  </Flex>
                                ) : (
                                  ""
                                )}
                              </Flex>
                              <Flex
                                fontWeight={400}
                                fontSize={"14px"}
                                color={"#848484"}
                              >
                                {workSite.location}
                              </Flex>
                            </Flex>
                            {isCurrentWorkSite ? (
                              <Flex color={"#dc143c"}>
                                <FaCheck />
                              </Flex>
                            ) : (
                              ""
                            )}
                          </Flex>
                        </Flex>
                        {isCurrentWorkSite ? (
                          <Flex
                            position={"absolute"}
                            w={"5px"}
                            bg={"#dc143c"}
                            h={"100%"}
                            left={0}
                            top={0}
                          ></Flex>
                        ) : (
                          ""
                        )}
                      </MenuItem>
                    );
                  })
                )}
              </MenuList>
            </Menu>
          </Flex>
          <Grid templateColumns="repeat(12, 1fr)" gap={"30px"}>
            {summaryCards.map((val) => (
              <GridItem
                w="100%"
                h="140px"
                bg={"#f8f9fa"}
                boxShadow={"0px 0px 3px rgba(50,50,93,0.5)"}
                colSpan={"3"}
              >
                <Flex
                  flexDir={"column"}
                  h={"100%"}
                  justify={"space-between"}
                  p={"20px"}
                >
                  <Flex justify={"space-between"} alignItems={"center"}>
                    <Flex color={"#848484"}>{val.title}</Flex>
                    <Flex
                      borderRadius={"100%"}
                      w={"40px"}
                      h={"40px"}
                      fontSize={"20px"}
                      bg={val.bgColor}
                      color={val.color}
                      justify={"center"}
                      alignItems={"center"}
                    >
                      {val.icon}
                    </Flex>
                  </Flex>
                  <Flex fontSize={"24px"} fontWeight={700}>
                    {val.value}
                  </Flex>
                </Flex>
              </GridItem>
            ))}
          </Grid>

          <Grid
            templateColumns="repeat(12, 1fr)"
            columnGap={"30px"}
            rowGap={"10px"}
          >
            <GridItem w="100%" colSpan={"8"}>
              <Flex justify={"space-between"}>
                <Flex gap={"10px"} alignItems={"center"} fontWeight={700}>
                  <Flex fontSize={"20px"}>
                    <FaRegCalendarAlt />
                  </Flex>
                  <Flex>Recent Activity</Flex>
                </Flex>
                <Flex
                  onClick={() => nav("/activity")}
                  cursor={"pointer"}
                  color={"#dc143c"}
                  fontWeight={700}
                  gap={"5px"}
                  alignItems={"center"}
                >
                  See All <FaChevronRight />
                </Flex>
              </Flex>
            </GridItem>
            <GridItem h={"100%"} w="100%" colSpan={"4"}>
              <Flex justify={"space-between"}>
                <Flex gap={"10px"} alignItems={"center"} fontWeight={700}>
                  <Flex fontSize={"20px"}>
                    <FaUserLarge />
                  </Flex>
                  <Flex>Members</Flex>
                </Flex>
                <Flex
                  color={"#dc143c"}
                  alignItems={"center"}
                  gap={"5px"}
                  fontWeight={700}
                  cursor={"pointer"}
                  fontSize={"24px"}
                >
                  <Tooltip
                    hasArrow
                    placement={"top"}
                    background={"#dc143c"}
                    label={"Add Member"}
                    aria-label="A tooltip"
                    color={"white"}
                  >
                    <Flex onClick={() => nav("/member/create")}>
                      <AiFillPlusCircle />
                    </Flex>
                  </Tooltip>
                </Flex>
              </Flex>
            </GridItem>
            <GridItem
              w="100%"
              boxShadow={"0px 0px 3px rgba(50,50,93,0.5)"}
              colSpan={"8"}
            >
              <TableContainer>
                <Table variant="simple">
                  <Thead bg={"#ECEFF3"}>
                    <Tr>
                      <Th fontSize={"12px"} borderBottomColor={"#bababa"}>
                        Name
                      </Th>
                      <Th fontSize={"12px"} borderBottomColor={"#bababa"}>
                        Section
                      </Th>
                      <Th fontSize={"12px"} borderBottomColor={"#bababa"}>
                        Activity
                      </Th>
                      <Th fontSize={"12px"} borderBottomColor={"#bababa"}>
                        Date and Time
                      </Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {dashboardData?.recent_activity?.length ? (
                      <>
                        {dashboardData?.recent_activity?.map((val) => (
                          <Tr fontSize={"14px"} color={"#848484"}>
                            <Td>
                              <Flex alignItems={"center"} gap={"10px"}>
                                {val.first_name ? (
                                  <Avatar
                                    outline={"1px solid #dc143c"}
                                    border={"2px solid white"}
                                    name={val.first_name + " " + val.last_name}
                                    src={
                                      val.profile_image_url
                                        ? val.profile_image_url
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
                                <Flex flexDir={"column"}>
                                  <Flex color={"black"} fontWeight={700}>
                                    {val.first_name + " " + val.last_name}
                                  </Flex>
                                  <Flex fontSize={"14px"} color={"#848484"}>
                                    {labelizeRole(val.role)}
                                    {val.employee_id
                                      ? " - " + (val.employee_id || "")
                                      : ""}
                                  </Flex>
                                </Flex>
                              </Flex>
                            </Td>
                            <Td>{formatString(val.table_name)}</Td>
                            <Td>{formatString(val.action)}</Td>
                            <Td>
                              {moment(val.created_at).format("Do MMMM YYYY")}
                            </Td>
                          </Tr>
                        ))}
                        {Array(3 - dashboardData?.recent_activity?.length)
                          .fill()
                          .map((_, index) => (
                            <Flex h={"72.8px"}></Flex>
                          ))}
                      </>
                    ) : (
                      <ListEmptyState
                        colSpan={6}
                        header1={"No activities found."}
                        header2={"This is where user's activities are tracked"}
                        // link={"/user/create"}
                        // linkText={"Create an action"}
                      />
                    )}
                  </Tbody>
                </Table>
              </TableContainer>
            </GridItem>
            <GridItem
              w="100%"
              boxShadow={"0px 0px 3px rgba(50,50,93,0.5)"}
              colSpan={"4"}
            >
              <Flex h={"100%"} flexDir={"column"}>
                {dashboardData?.members?.length ? (
                  dashboardData?.members?.map((val) => (
                    <Flex
                      cursor={"pointer"}
                      _hover={{ bg: "#f8f9fa" }}
                      transition={"background-color 0.2s ease"}
                      py={"11px"}
                      borderBottom={"1px solid #bababa"}
                      flexDir={"column"}
                      px={"20px"}
                    >
                      <Flex alignItems={"center"} gap={"10px"}>
                        {val.user.first_name ? (
                          <Avatar
                            outline={"1px solid #dc143c"}
                            border={"2px solid white"}
                            name={
                              val.user.first_name + " " + val.user.last_name
                            }
                            src={
                              val.user.profile_image_url
                                ? val.user.profile_image_url
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
                        <Flex flexDir={"column"}>
                          <Flex color={"black"} fontWeight={700}>
                            {val.user.first_name + " " + val.user.last_name}
                          </Flex>
                          <Flex fontSize={"14px"} color={"#848484"}>
                            {labelizeRole(val.role) + " - " + val.employee_id}
                          </Flex>
                        </Flex>
                      </Flex>
                    </Flex>
                  ))
                ) : (
                  // <ListEmptyState
                  //   colSpan={1}
                  //   header1={"No members found."}
                  //   header2={"to begin tracking them."}
                  //   link={"/member/create"}
                  //   linkText={"Create a new member"}
                  // />
                  <Flex
                    w={"100%"}
                    justifyContent={"center"}
                    py={"40px"}
                    flexDir={"column"}
                    alignItems={"center"}
                  >
                    <Image w={"200px"} src={emptyIllustration}></Image>
                    <Flex flexDir={"column"} gap={"5px"} alignItems={"center"}>
                      <Flex color={"#dc143c"} fontWeight={700}>
                        No members found.
                      </Flex>
                      <Flex color={"#848484"}>
                        <Flex
                          cursor={"pointer"}
                          onClick={() => {
                            nav("/member/create");
                          }}
                          color={"#dc143c"}
                          textDecor={"underline"}
                        >
                          Create a new member
                        </Flex>
                        <Flex>&nbsp;to begin tracking them.</Flex>
                      </Flex>
                    </Flex>
                  </Flex>
                  // <Flex h={"258.8px"}>TESLOL</Flex>
                )}
              </Flex>
            </GridItem>
          </Grid>
          <Grid
            columnGap={"30px"}
            rowGap={"10px"}
            templateColumns="repeat(12, 1fr)"
          >
            <GridItem w="100%" fontSize={"16px"} colSpan={"12"}>
              <Flex justify={"space-between"}>
                <Flex gap={"10px"} alignItems={"center"} fontWeight={700}>
                  <Flex fontSize={"20px"}>
                    <LuClipboardPen />
                  </Flex>
                  <Flex>Latest Work Orders</Flex>
                </Flex>
                <Flex
                  onClick={() => nav("/work-order")}
                  cursor={"pointer"}
                  color={"#dc143c"}
                  fontWeight={700}
                  gap={"5px"}
                  alignItems={"center"}
                >
                  See All <FaChevronRight />
                </Flex>
              </Flex>
            </GridItem>
            <GridItem
              w="100%"
              boxShadow={"0px 0px 3px rgba(50,50,93,0.5)"}
              colSpan={"12"}
            >
              <TableContainer>
                <Table variant="simple">
                  <Thead bg={"#ECEFF3"}>
                    <Tr>
                      <Th fontSize={"12px"} borderBottomColor={"#bababa"}>
                        Work Order
                      </Th>
                      <Th fontSize={"12px"} borderBottomColor={"#bababa"}>
                        Creator
                      </Th>
                      <Th fontSize={"12px"} borderBottomColor={"#bababa"}>
                        Status
                      </Th>
                      <Th fontSize={"12px"} borderBottomColor={"#bababa"}>
                        Current Assignee
                      </Th>
                      <Th fontSize={"12px"} borderBottomColor={"#bababa"}>
                        Progress
                      </Th>
                      <Th fontSize={"12px"} borderBottomColor={"#bababa"}>
                        Deadline
                      </Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {dashboardData?.latest_work_orders?.length ? (
                      dashboardData?.latest_work_orders?.map((val) => {
                        const creatorInfo = val?.creator?.is_superadmin
                          ? {
                              ...val?.creator,
                              role: labelizeRole("super_admin"),
                            }
                          : {
                              ...val?.creator,
                              role: labelizeRole(val?.creator?.member?.role),
                              employee_id: val?.creator?.member?.employee_id,
                            };
                        const { bgColor, textColor, icon, text } =
                          tableStatusStyleMapper(val.status);
                        return (
                          <Tr fontSize={"14px"}>
                            <Td>
                              <Flex flexDir={"column"}>
                                <Flex fontWeight={700}>{val.name}</Flex>
                                <Flex
                                  display={"inline-block"}
                                  textOverflow={"ellipsis"}
                                  overflow={"hidden"}
                                  fontSize={"13px"}
                                  color={"#848484"}
                                >
                                  {val.work_order_custom_id}
                                </Flex>
                              </Flex>
                            </Td>
                            <Td>
                              <Flex alignItems={"center"} gap={"10px"}>
                                {creatorInfo.first_name ? (
                                  <Avatar
                                    outline={"1px solid #dc143c"}
                                    border={"2px solid white"}
                                    name={
                                      creatorInfo.first_name +
                                      " " +
                                      creatorInfo.last_name
                                    }
                                    src={
                                      creatorInfo.profile_image_url
                                        ? creatorInfo.profile_image_url
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
                                <Flex flexDir={"column"}>
                                  <Flex color={"black"} fontWeight={700}>
                                    {creatorInfo.first_name
                                      ? creatorInfo.first_name +
                                        " " +
                                        creatorInfo.last_name
                                      : "Not Assigned Yet"}
                                  </Flex>
                                  <Flex fontSize={"14px"} color={"#848484"}>
                                    {creatorInfo.role
                                      ? labelizeRole(creatorInfo.role) +
                                        (creatorInfo?.employee_id
                                          ? " - " + creatorInfo.employee_id
                                          : "")
                                      : "Not Assigned Yet"}
                                  </Flex>
                                </Flex>
                              </Flex>
                            </Td>

                            <Td fontWeight={700}>
                              <Flex>
                                <Flex
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
                                </Flex>
                              </Flex>
                            </Td>
                            <Td fontWeight={700}>
                              <Flex
                                flexDir={"column"}
                                // alignItems={"center"}
                                gap={"5px"}
                                // justify={"space-between"}
                              >
                                {val.work_order_steps[val.current_step - 1]
                                  ?.assigned_members?.length &&
                                val.status !== "completed" &&
                                val.status !== "cancelled" ? (
                                  <Flex>
                                    <Tooltip
                                      placement="top"
                                      hasArrow
                                      label={getTooltipLabel(
                                        val.work_order_steps[
                                          val.current_step - 1
                                        ]?.assigned_members
                                      )}
                                    >
                                      <AvatarGroup
                                        max={3}
                                        size={"sm"}
                                        spacing={-3}
                                      >
                                        {val.work_order_steps[
                                          val.current_step - 1
                                        ]?.assigned_members.map(
                                          (
                                            assignedMember,
                                            indexAssignedMember
                                          ) =>
                                            assignedMember?.user.first_name ? (
                                              <Avatar
                                                size={"sm"}
                                                w="40px"
                                                h="40px"
                                                outline={"1px solid #dc143c"}
                                                border={"2px solid white"}
                                                key={
                                                  assignedMember?.user.id +
                                                  "_" +
                                                  indexAssignedMember
                                                }
                                                name={
                                                  assignedMember?.user
                                                    .first_name +
                                                  " " +
                                                  assignedMember?.user.last_name
                                                }
                                                src={
                                                  assignedMember?.user
                                                    .profile_image_url
                                                    ? assignedMember?.user
                                                        .profile_image_url
                                                    : null
                                                }
                                                // color={"white"}
                                                // {...(assignedMember.user.profile_image_url
                                                //   ? { bg: "white" }
                                                //   : { bg: "#3cc1fa" })}
                                                {...(assignedMember?.user
                                                  .profile_image_url
                                                  ? { bg: "white" }
                                                  : {})}
                                              ></Avatar>
                                            ) : (
                                              <Flex
                                                outline={"1px solid #dc143c"}
                                                bg={"#bababa"}
                                                borderRadius={"100%"}
                                                justifyContent={"center"}
                                                alignItems={"center"}
                                                h={"40px"}
                                                w={"40px"}
                                                border={"2px solid white"}
                                              >
                                                <Flex
                                                  color={"white"}
                                                  fontSize={"24px"}
                                                >
                                                  <FaUserAlt />
                                                </Flex>
                                              </Flex>
                                            )
                                        )}
                                      </AvatarGroup>
                                    </Tooltip>
                                  </Flex>
                                ) : (
                                  ""
                                )}

                                <Flex flexDir={"column"}>
                                  {val.status === "completed" ? (
                                    <>
                                      <Flex
                                        color={"#3D9666"}
                                        fontSize={"14px"}
                                        fontWeight={700}
                                      >
                                        Work Order Finished!
                                      </Flex>
                                      <Flex
                                        fontSize={"14px"}
                                        fontWeight={700}
                                        color={"#848484"}
                                      >
                                        No assignee
                                      </Flex>
                                    </>
                                  ) : val.status === "cancelled" ? (
                                    <>
                                      <Flex
                                        color={"#DC143C"}
                                        fontSize={"14px"}
                                        fontWeight={700}
                                      >
                                        Work Order Cancelled!
                                      </Flex>
                                      <Flex
                                        fontSize={"14px"}
                                        fontWeight={700}
                                        color={"#848484"}
                                      >
                                        No assignee
                                      </Flex>
                                    </>
                                  ) : (
                                    <>
                                      <Flex
                                        display={"inline-block"}
                                        overflow={"hidden"}
                                        textOverflow={"ellipsis"}
                                        maxW={"160px"}
                                        whiteSpace={"nowrap"}
                                        fontSize={
                                          val.work_order_steps[
                                            val.current_step - 1
                                          ]?.assigned_members?.length
                                            ? "12px"
                                            : "14px"
                                        }
                                        color={"#848484"}
                                        fontWeight={700}
                                      >
                                        {val.work_order_steps[
                                          val.current_step - 1
                                        ]?.assigned_members?.length
                                          ? val.work_order_steps[
                                              val.current_step - 1
                                            ]?.assigned_members.map(
                                              (
                                                assignedMember,
                                                assignedMemberIndex
                                              ) =>
                                                assignedMember.user.first_name +
                                                " " +
                                                assignedMember.user.last_name +
                                                (assignedMemberIndex ===
                                                val.work_order_steps[
                                                  val.current_step - 1
                                                ]?.assigned_members.length -
                                                  1
                                                  ? " "
                                                  : ", ")
                                            )
                                          : "No assignee"}
                                      </Flex>
                                    </>
                                  )}
                                </Flex>
                              </Flex>
                            </Td>
                            <Td>
                              <Flex
                                fontWeight={700}
                                w={"100%"}
                                flexDir={"column"}
                              >
                                <Flex>
                                  {Math.ceil(
                                    (val.finished_step_count /
                                      val.work_order_steps_count) *
                                      100
                                  ) || 0}
                                  %
                                </Flex>
                                <Progress
                                  hasStripe
                                  size={"xs"}
                                  value={
                                    Math.ceil(
                                      (val.finished_step_count /
                                        val.work_order_steps_count) *
                                        100
                                    ) || 0
                                  }
                                />
                                <Flex color={"#848484"} fontSize={"12px"}>
                                  Step {val.finished_step_count} out of{" "}
                                  {val.work_order_steps_count}
                                </Flex>
                              </Flex>
                            </Td>
                            <Td>
                              <Flex fontWeight={700}>
                                {moment(val.deadline_date_time).format(
                                  "YYYY-MM-DD"
                                )}
                              </Flex>
                              <Flex color={"#848484"} fontSize={"14px"}>
                                {moment(val.deadline_date_time).format(
                                  "hh:mm A"
                                )}
                              </Flex>
                            </Td>
                          </Tr>
                        );
                      })
                    ) : (
                      <ListEmptyState
                        colSpan={5}
                        header1={"No work orders found"}
                        header2={"to begin tracking tasks."}
                        link={"/work-order/create"}
                        linkText={"Create a new work order"}
                      />
                      // <Flex h={"291.2px"}>TESLOL</Flex>
                    )}
                  </Tbody>
                </Table>
              </TableContainer>
            </GridItem>
          </Grid>
          <Grid
            columnGap={"30px"}
            rowGap={"10px"}
            templateColumns="repeat(12, 1fr)"
          >
            <GridItem w="100%" fontSize={"16px"} colSpan={"12"}>
              <Flex justify={"space-between"}>
                <Flex gap={"10px"} alignItems={"center"} fontWeight={700}>
                  <Flex fontSize={"20px"}>
                    <FaWrench />
                  </Flex>
                  <Flex>Equipment/Machines</Flex>
                </Flex>
                <Flex
                  onClick={() => nav("/equipment-machine")}
                  cursor={"pointer"}
                  color={"#dc143c"}
                  fontWeight={700}
                  gap={"5px"}
                  alignItems={"center"}
                >
                  See All <FaChevronRight />
                </Flex>
              </Flex>
            </GridItem>
            <GridItem
              w="100%"
              boxShadow={"0px 0px 3px rgba(50,50,93,0.5)"}
              colSpan={"12"}
            >
              <TableContainer>
                <Table variant="simple">
                  <Thead bg={"#ECEFF3"}>
                    <Tr>
                      <Th fontSize={"12px"} borderBottomColor={"#bababa"}>
                        Equipment/Machine
                      </Th>
                      <Th fontSize={"12px"} borderBottomColor={"#bababa"}>
                        Machine ID
                      </Th>
                      <Th fontSize={"12px"} borderBottomColor={"#bababa"}>
                        Serial Number
                      </Th>
                      <Th fontSize={"12px"} borderBottomColor={"#bababa"}>
                        Status
                      </Th>
                      <Th fontSize={"12px"} borderBottomColor={"#bababa"}>
                        Location
                      </Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {dashboardData?.machines?.length ? (
                      dashboardData?.machines?.map((val) => {
                        const { bgColor, textColor, icon, text } =
                          tableStatusStyleMapper(val.status);
                        return (
                          <Tr fontWeight={700} fontSize={"14px"}>
                            <Td>
                              <Flex flexDir={"column"}>
                                <Flex fontWeight={700}>{val.name}</Flex>
                                <Flex
                                  fontWeight={400}
                                  display={"inline-block"}
                                  textOverflow={"ellipsis"}
                                  overflow={"hidden"}
                                  fontSize={"13px"}
                                  color={"#848484"}
                                >
                                  {val.model}
                                </Flex>
                              </Flex>
                            </Td>
                            <Td>{val.custom_machine_id}</Td>
                            <Td>
                              <Flex w={"100%"} flexDir={"column"}>
                                {val.serial_number || "-"}
                              </Flex>
                            </Td>
                            <Td fontWeight={700}>
                              <Flex>
                                <Flex
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
                                </Flex>
                              </Flex>
                            </Td>
                            <Td>{val.location}</Td>
                          </Tr>
                        );
                      })
                    ) : (
                      <ListEmptyState
                        colSpan={5}
                        header1={"No equipment/machine found."}
                        header2={"to begin tracking them."}
                        linkText={"Create a new equipment/machine"}
                        link={"/equipment-machine/create"}
                      />
                      // <Flex h={"291.2px"}>TESLOL</Flex>
                    )}
                  </Tbody>
                </Table>
              </TableContainer>
            </GridItem>
          </Grid>
        </Flex>
      )}
    </>
  );
}
