import {
  Avatar,
  AvatarGroup,
  Center,
  Flex,
  Input,
  InputGroup,
  InputLeftElement,
  Progress,
  Spinner,
  Table,
  TableContainer,
  Tag,
  TagLabel,
  Tbody,
  Td,
  Th,
  Thead,
  Tooltip,
  Tr,
  useToast,
} from "@chakra-ui/react";
import { FaUserAlt } from "react-icons/fa";
import { IoWarning } from "react-icons/io5";
import { useCallback, useEffect, useRef, useState } from "react";
import { api } from "../api/api";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import tableStatusStyleMapper from "../utils/tableStatusStyleMapper";
import { debounce } from "lodash";
import { IoMdSearch } from "react-icons/io";
import ListEmptyState from "../components/ListEmptyState";
import Swal from "sweetalert2";
import labelizeRole from "../utils/labelizeRole";
import moment from "moment";
import SwalErrorMessages from "../components/SwalErrorMessages";
import AssignedWorkOrderMenu from "../components/AssignedWorkOrders/AssignedWorkOrderMenu";
import { useSelector } from "react-redux";
import formatString from "../utils/formatString";
import assignedRoleMapper from "../utils/assignedRoleMapper";
import { useWorkOrderListener } from "../hooks/useWorkOrderListener";
import CustomToast from "../components/CustomToast";
import UrlBasedPagination from "../components/UrlBasedPagination";
import { FaMapLocationDot } from "react-icons/fa6";
export default function AssignedWorkOrdersPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const statusFilterSelection = ["completed"];
  const location = useLocation(); // gives you { pathname, search, ... }

  const abortControllerRef = useRef(new AbortController()); // Persistent controller
  const userSelector = useSelector((state) => state.login.auth);
  const toast = useToast();
  const nav = useNavigate();
  const IMGURL = import.meta.env.VITE_API_IMAGE_URL;
  const workSiteUID = userSelector.current_work_site?.id;
  const [from, setFrom] = useState(0);
  const [showing, setShowing] = useState(0);
  const [totalPages, setTotalPages] = useState(null);
  const [workOrders, setWorkOrders] = useState([]);
  const [selectedUID, setSelectedUID] = useState([]);
  const currentPage = totalPages
    ? Math.min(Number(searchParams.get("page")) || 1, totalPages)
    : Number(searchParams.get("page")) || 1;

  const searchFilter = searchParams.get("search") || "";
  const statusFilter = statusFilterSelection.includes(
    searchParams.get("status")
  )
    ? searchParams.get("status")
    : "";
  const rows = searchParams.get("rows") || 10;
  const [tableLoading, setTableLoading] = useState(false);
  const pageModule = "assigned_work_orders";
  const debouncedSearch = useCallback(
    debounce((value) => {
      if (searchFilter === value) {
        setTableLoading(false);
      } else {
        updateSearchParams({ page: 1, search: value });
      }
    }, 1000),
    [searchParams]
  );
  function updateSearchParams(updates) {
    setSearchParams((prev) => {
      const params = new URLSearchParams(prev); // clone existing params
      Object.entries(updates).forEach(([key, value]) => {
        if (value) {
          console.log(key);
          console.log(value);
          if (key === "page" && value === 1) {
            params.delete(key);
          } else {
            params.set(key, value);
          }
        } else {
          params.delete(key);
        }
      });
      console.log(params.toString());

      return params;
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
  const checkedOnPage = selectedUID.filter((uid) =>
    workOrders.map((workOrder) => workOrder.UID).includes(uid)
  );
  const allChecked =
    checkedOnPage.length ===
      workOrders.map((workOrder) => workOrder.UID).length &&
    workOrders.map((workOrder) => workOrder.UID).length > 0;

  const isIndeterminate = checkedOnPage.length > 0 && !allChecked;

  function handleCheckAll(e) {
    if (e.target.checked) {
      setSelectedUID((prevState) => {
        const newItems = workOrders
          .map((workOrder) => workOrder.UID)
          .filter((uid) => !prevState.includes(uid)); // Avoid duplicates
        return [...prevState, ...newItems];
      });
    } else {
      setSelectedUID((prevState) =>
        prevState.filter(
          (uid) => !workOrders.some((workOrder) => workOrder.UID === uid)
        )
      );
    }
  }

  function handleCheckbox(e) {
    const itemId = e.target.id;

    setSelectedUID(
      (prevState) =>
        e.target.checked
          ? [...prevState, itemId] // Add if checked
          : prevState.filter((id) => id !== itemId) // Remove if unchecked
    );
  }

  function statusHandler(event) {
    const { id } = event.target;
    updateSearchParams({ page: 1, status: id });
  }

  async function fetchAssignedWorkOrder() {
    setTableLoading(true);
    const localAbortController = abortControllerRef.current;
    await api
      .get(
        `assigned-work-order/pagination?search=${searchFilter}&page=${currentPage}&status=${statusFilter}
      &rows=${rows}`,
        {
          signal: abortControllerRef.current.signal,
        }
      )
      .then((response) => {
        setWorkOrders(response.data.data);
        setFrom(response.data.from);
        setTotalPages(response.data.last_page);
        setShowing({
          current: response.data.to,
          total: response.data.total,
        });
        if (currentPage > response.data.last_page)
          updateSearchParams({ page: response.data.last_page });
      })
      .catch((error) => {
        console.log(error);
      })
      .finally(() => {
        if (localAbortController === abortControllerRef.current) {
          setTableLoading(false);
        }
      });
  }

  function handleWorkOrderNavigate(
    status,
    isReview,
    UID,
    reviewUID,
    currentStepUID,
    disableResponse
  ) {
    switch (status) {
      case "action_required":
        if (disableResponse) {
          showRequireMobileSwalError();
        } else if (isReview) {
          nav(
            `/review/${reviewUID}${
              location.search ? location.search + "&" : "?"
            }from=assigned-work-order`
          );
        } else {
          nav(`/submit-step/${UID}/${currentStepUID}${location.search}`);
        }
        break;
      case "completed":
      case "pending":
      case "ongoing":
      case "under_review":
      case "overdue":
        nav(
          `/work-order/${UID}${
            location.search ? location.search + "&" : "?"
          }from=assigned-work-order`
        );
        break;

      default:
        "Unknown";
        break;
    }
  }
  function showRequireMobileSwalError() {
    Swal.fire({
      title: "Oops...",
      html: SwalErrorMessages(
        "This step includes a lock access feature that requires the mobile app to complete. Please use the mobile app to finish this step"
      ),
      icon: "error",
      customClass: {
        popup: "swal2-custom-popup",
        title: "swal2-custom-title",
        content: "swal2-custom-content",
        actions: "swal2-custom-actions",
        confirmButton: "swal2-custom-confirm-button",
      },
    });
  }
  const handleChange = (e) => {
    const { value, id } = e.target;
    console.log(value);

    if (id === "row") {
      const newTotalPages = Math.ceil(showing?.total / value);
      if (currentPage > newTotalPages) {
        updateSearchParams({ rows: value, page: newTotalPages || 1 });
      } else {
        updateSearchParams({ rows: value });
      }
    } else {
      debouncedSearch(value);
    }
  };
  function checkNewWorkOrderByFilter(newWorkOrder) {
    let totalCounter = 0;
    let validCounter = 0;
    if (newWorkOrder.status === "completed" || statusFilter === "completed") {
      totalCounter++;
      if (statusFilter === newWorkOrder.status) {
        validCounter++;
      }
    }

    if (searchFilter) {
      totalCounter++;
      const searchFilter = searchFilter.toLowerCase();
      const firstName = newWorkOrder.creator?.first_name || "";
      const lastName = newWorkOrder.creator?.last_name || "";
      const fullName = `${firstName} ${lastName}`.toLowerCase();

      const matches =
        newWorkOrder.name?.toLowerCase().includes(searchFilter) ||
        newWorkOrder.work_order_custom_id
          ?.toLowerCase()
          .includes(searchFilter) ||
        firstName.toLowerCase().includes(searchFilter) ||
        lastName.toLowerCase().includes(searchFilter) ||
        fullName.includes(searchFilter);

      if (matches) {
        validCounter++;
      }
    }
    console.log(searchFilter);
    console.log(statusFilter);
    console.log(newWorkOrder);
    console.log(totalCounter);
    console.log(validCounter);

    return totalCounter === validCounter;
  }

  useEffect(() => {
    abortControllerRef.current = new AbortController();
    fetchAssignedWorkOrder();

    return () => {
      abortControllerRef.current.abort(); // Cleanup on unmount
    };
  }, [searchFilter, statusFilter, currentPage, rows]);

  function handlePusherData(event, pusherData) {
    switch (event) {
      case "onCreated":
        {
          const newWorkOrder = pusherData.workOrder;
          const matchFilter = checkNewWorkOrderByFilter(newWorkOrder);
          if (!matchFilter) return;
          if (tableLoading) return;
          if (currentPage !== 1) return;
          if (
            workOrders.filter((workOrder) => workOrder.UID === newWorkOrder.UID)
              .length
          )
            return;
          setWorkOrders((prevState) => [
            {
              ...newWorkOrder,
              isNew: true,
              isUpdated: false,
              isDeleted: false,
            },
            ...(prevState.length === rows
              ? prevState.slice(0, -1) // remove last item
              : prevState
            ).map((workOrder) => ({
              ...workOrder,
            })),
          ]);
          toast({
            duration: 5000,
            position: "top",
            render: ({ onClose }) => (
              <CustomToast
                onClose={onClose}
                title={"A new work order has been added"}
                description={"Please check and review the newest work order."}
              />
            ),
          });
        }
        break;
      case "onUpdated":
        {
          const newWorkOrder = pusherData.workOrder;
          const matchFilter = checkNewWorkOrderByFilter(newWorkOrder);
          console.log(matchFilter);

          if (matchFilter && newWorkOrder.status === "completed") {
            setWorkOrders((prevState) => [
              {
                ...newWorkOrder,
                isNew: true,
                isUpdated: false,
                isDeleted: false,
              },
              ...(prevState.length === rows
                ? prevState.slice(0, -1) // remove last item
                : prevState
              ).map((workOrder) => ({
                ...workOrder,
              })),
            ]);
          }
          if (
            workOrders.filter((workOrder) => workOrder.UID === newWorkOrder.UID)
              .length
          ) {
            setWorkOrders((prevState) => {
              return prevState.map((wo) =>
                wo.UID === newWorkOrder.UID
                  ? {
                      ...newWorkOrder,
                      isUpdated: true,
                      isDeleted: false,
                      isNew: false,
                    }
                  : wo
              );
            });
            toast({
              duration: 5000,
              position: "top",
              render: ({ onClose }) => (
                <CustomToast
                  onClose={onClose}
                  title={"A work order has been updated"}
                  description={"Please check and review the latest changes."}
                />
              ),
            });
          }
        }
        break;
      case "onDeleted":
        {
          const deletedWorkOrder = pusherData.workOrder;
          if (
            workOrders.filter(
              (workOrder) => workOrder.UID === deletedWorkOrder.UID
            ).length
          ) {
            setWorkOrders((prevState) => {
              return prevState.map((wo) =>
                wo.UID === deletedWorkOrder.UID
                  ? { ...wo, isDeleted: true, isUpdated: false, isNew: false }
                  : wo
              );
            });

            toast({
              duration: 5000,
              position: "top",
              render: ({ onClose }) => (
                <CustomToast
                  onClose={onClose}
                  title={"A work order has been deleted"}
                  description={"Please check and review the latest changes."}
                />
              ),
            });
          }
        }
        break;
      case "onGroupDeleted":
        {
          const deletedWorkOrders = pusherData.workOrder;
          if (
            workOrders.some((workOrder) =>
              deletedWorkOrders.some((delWO) => delWO.UID === workOrder.UID)
            )
          ) {
            setWorkOrders((prevState) => {
              return prevState.map((wo) =>
                deletedWorkOrders.some((delWO) => delWO.UID === wo.UID)
                  ? { ...wo, isDeleted: true, isUpdated: false, isNew: false }
                  : wo
              );
            });
            toast({
              duration: 5000,
              position: "top",
              render: ({ onClose }) => (
                <CustomToast
                  onClose={onClose}
                  title={"A work order has been deleted"}
                  description={"Please check and review the latest changes."}
                />
              ),
            });
          }
        }
        break;
      default:
        break;
    }
  }
  useWorkOrderListener(
    `awo.user.${userSelector.id}.ws.${workSiteUID}`,
    {
      onCreated: (pusherData) => {
        return handlePusherData("onCreated", pusherData);
      },
      onUpdated: (pusherData) => {
        return handlePusherData("onUpdated", pusherData);
      },
      onDeleted: (pusherData) => {
        return handlePusherData("onDeleted", pusherData);
      },
      onGroupDeleted: (pusherData) => {
        return handlePusherData("onGroupDeleted", pusherData);
      },
    },
    [searchFilter, statusFilter, rows, workOrders]
  );
  return (
    <Flex w={"100%"} flexDir={"column"} px={"30px"} py={"20px"} gap={"20px"}>
      <Flex flexDir={"column"}>
        <Flex
          onClick={() => {
            console.log(workOrders);
          }}
          fontSize={"28px"}
          color={"#dc143c"}
          fontWeight={700}
        >
          Assigned Work Order List
        </Flex>
      </Flex>
      <Flex fontWeight={700} borderBottom={"2px solid #bababa"}>
        <Flex
          cursor={"pointer"}
          borderBottom={!statusFilter ? "3px solid #dc143c" : ""}
          color={!statusFilter ? "black" : "#848484"}
          px={"10px"}
          py={"2px"}
          onClick={statusHandler}
        >
          Ongoing
        </Flex>
        {statusFilterSelection.map((statusOption) => (
          <Flex
            id={statusOption}
            cursor={"pointer"}
            borderBottom={
              statusFilter === statusOption ? "3px solid #dc143c" : ""
            }
            color={statusFilter === statusOption ? "black" : "#848484"}
            px={"10px"}
            py={"2px"}
            onClick={statusHandler}
          >
            {formatString(statusOption)}
          </Flex>
        ))}
      </Flex>
      <Flex justify={"end"} alignItems={"center"}>
        <Flex gap={"20px"} alignItems={"center"}>
          <Flex>
            <InputGroup>
              <InputLeftElement pointerEvents="none">
                <IoMdSearch color="#848484" fontSize={"20px"} />
              </InputLeftElement>
              <Input
                defaultValue={searchFilter}
                boxShadow={"0px 0px 3px rgba(50,50,93,0.5)"}
                placeholder="Search work orders..."
                onChange={(event) => {
                  setTableLoading(true);
                  handleChange(event);
                }}
              ></Input>
            </InputGroup>
          </Flex>
        </Flex>
      </Flex>
      {tableLoading ? (
        <Center
          flexDir={"column"}
          alignItems={"center"}
          gap={"20px"}
          height="500px"
          opacity={1}
        >
          <Spinner thickness="4px" size="xl" color="#dc143c" />
          <Center flexDir={"column"} color={"#dc143c"} fontWeight={700}>
            <Flex fontWeight={700} fontSize={"20px"}>
              Loading
            </Flex>
            <Flex color={"black"}>Processing your request...</Flex>
          </Center>
        </Center>
      ) : (
        <TableContainer
          overflowX={"auto"}
          boxShadow={"0px 0px 3px rgba(50,50,93,0.5)"}
        >
          <Table h={"1px"} variant="simple">
            <Thead bg={"#ECEFF3"}>
              <Tr>
                <Th
                  px={"16px"}
                  borderBottomColor={"#bababa"}
                  fontWeight={700}
                  fontSize={"12px"}
                >
                  Work Order Name
                </Th>
                <Th
                  px={"16px"}
                  borderBottomColor={"#bababa"}
                  fontWeight={700}
                  fontSize={"12px"}
                >
                  My Role
                </Th>
                <Th
                  px={"16px"}
                  borderBottomColor={"#bababa"}
                  fontWeight={700}
                  fontSize={"12px"}
                >
                  Creator
                </Th>
                <Th
                  px={"16px"}
                  borderBottomColor={"#bababa"}
                  fontWeight={700}
                  fontSize={"12px"}
                >
                  Status
                </Th>
                <Th
                  px={"16px"}
                  borderBottomColor={"#bababa"}
                  fontWeight={700}
                  fontSize={"12px"}
                >
                  Current Assignee
                </Th>

                <Th
                  px={"16px"}
                  borderBottomColor={"#bababa"}
                  fontWeight={700}
                  fontSize={"12px"}
                  minW={"150px"}
                >
                  Progress
                </Th>
                <Th
                  px={"16px"}
                  borderBottomColor={"#bababa"}
                  fontWeight={700}
                  fontSize={"12px"}
                >
                  Work Site
                </Th>
                <Th fontSize={"12px"} borderBottomColor={"#bababa"}>
                  Deadline
                </Th>
                <Th
                  textAlign={"center"}
                  borderBottomColor={"#bababa"}
                  fontWeight={700}
                  fontSize={"12px"}
                  position="sticky"
                  right="0"
                  bg={"#eceff3"}
                  p={"0px"}
                >
                  <Flex
                    p={"16px"}
                    h={"100%"}
                    borderLeft={"1px solid #bababa"}
                    justify={"center"}
                    alignItems={"center"}
                  >
                    Action
                  </Flex>
                </Th>
              </Tr>
            </Thead>
            <Tbody>
              {workOrders.length ? (
                workOrders.map((val, index) => {
                  const creatorInfo = val?.creator?.is_superadmin
                    ? { ...val?.creator, role: labelizeRole("super_admin") }
                    : {
                        ...val?.creator,
                        first_name: val?.creator?.first_name,
                        last_name: val?.creator?.last_name,
                        role: labelizeRole(val?.creator?.member?.role),
                        employee_id: val?.creator?.member?.employee_id,
                      };
                  const currentAssignee =
                    val.work_order_steps[val.current_step - 1]
                      ?.assigned_members;

                  const { bgColor, textColor, icon, text } =
                    tableStatusStyleMapper(val.action_status);
                  const currentStep =
                    val.work_order_steps[val.current_step - 1];
                  const disableResponse =
                    (currentStep?.access_lock ||
                      currentStep?.multi_access_lock) &&
                    currentAssignee?.some(
                      (curAssignee) =>
                        curAssignee.user?.email === userSelector.email
                    );

                  return (
                    <Tr
                      fontSize={"14px"}
                      cursor={val?.isDeleted ? "not-allowed" : "pointer"}
                      opacity={val?.isDeleted ? 0.6 : 1}
                      bg={
                        val?.isNew
                          ? "#f7f7ff"
                          : val?.isUpdated
                          ? "#fffbf0"
                          : val?.isDeleted
                          ? "#fff5f5"
                          : "white"
                      }
                      _hover={{
                        background: val?.isNew
                          ? "#ededff"
                          : val?.isUpdated
                          ? "#fff7e0"
                          : val?.isDeleted
                          ? ""
                          : "#f5f5f5",
                      }}
                      onClick={() => {
                        val?.isDeleted
                          ? ""
                          : handleWorkOrderNavigate(
                              val.action_status,
                              val.status === "under_review" ? true : false,
                              val.UID,
                              val?.latest_work_order_review?.UID,
                              currentStep?.UID,
                              disableResponse
                            );
                      }}
                    >
                      <Td px={"24px"} borderBottomColor={"#bababa"}>
                        <Flex flexDir={"column"}>
                          {val?.isNew ? (
                            <Flex
                              color={"#755FFF"}
                              fontSize={"13px"}
                              lineHeight={"8px"}
                              fontWeight={700}
                            >
                              New!
                            </Flex>
                          ) : (
                            ""
                          )}
                          {val?.isUpdated ? (
                            <Flex
                              color={"#ff9100"}
                              fontSize={"13px"}
                              lineHeight={"8px"}
                              fontWeight={700}
                            >
                              Updated!
                            </Flex>
                          ) : (
                            ""
                          )}
                          {val?.isDeleted ? (
                            <Flex
                              color={"#dc143c"}
                              fontSize={"13px"}
                              lineHeight={"8px"}
                              fontWeight={700}
                            >
                              Deleted!
                            </Flex>
                          ) : (
                            ""
                          )}
                          <Flex
                            display={"inline-block"}
                            overflow={"hidden"}
                            textOverflow={"ellipsis"}
                            maxW={"240px"}
                            fontWeight={700}
                          >
                            <Flex
                              color={val.status === "overdue" ? "#dc143c" : ""}
                              alignItems={"center"}
                              gap={"2px"}
                            >
                              {val.name}
                              {val.status === "overdue" ? (
                                <Tooltip
                                  label="This work order is overdue."
                                  hasArrow
                                  placement="top"
                                  bg={"#dc143c"}
                                >
                                  <Flex fontSize={"16px"}>
                                    <IoWarning />
                                  </Flex>
                                </Tooltip>
                              ) : (
                                ""
                              )}
                            </Flex>
                          </Flex>

                          <Flex
                            display={"block"}
                            textOverflow={"ellipsis"}
                            overflow={"hidden"}
                            fontSize={"13px"}
                            color={"#848484"}
                            maxW={"200px"}
                          >
                            {val.work_order_custom_id}
                          </Flex>
                        </Flex>
                      </Td>
                      <Td
                        px={"16px"}
                        borderBottomColor={"#bababa"}
                        color={"#292D3F"}
                        minW={val.role.length > 1 ? "220px" : "120px"}
                      >
                        <Flex fontWeight={700} gap={"5px"} flexWrap={"wrap"}>
                          {val.role.map((value) => {
                            const assignedRoleStyle = assignedRoleMapper(value);
                            return (
                              <Tag
                                cursor={"pointer"}
                                _hover={{ bg: "#dedede" }}
                                transition={"background 0.2s ease-in-out"}
                                size={"sm"}
                                borderRadius="full"
                                variant="solid"
                                bg={assignedRoleStyle.bgColor}
                                color={assignedRoleStyle.textColor}
                                border={
                                  assignedRoleStyle.textColor + " 1px solid"
                                }
                                gap={"5px"}
                                alignItems={"center"}
                                fontSize={"11px"}
                                px={"5px"}
                                py={"2px"}
                              >
                                <Flex
                                  minW={"6px"}
                                  minH={"6px"}
                                  bg={assignedRoleStyle.textColor}
                                  borderRadius={"100%"}
                                ></Flex>
                                <TagLabel>{assignedRoleStyle.text}</TagLabel>
                              </Tag>
                            );
                          })}
                        </Flex>
                      </Td>
                      <Td
                        px={"16px"}
                        borderBottomColor={"#bababa"}
                        color={"#292D3F"}
                      >
                        <Flex alignItems={"center"} gap={"10px"}>
                          {creatorInfo.first_name ? (
                            <Avatar
                              key={creatorInfo.UID + val.UID}
                              outline={"1px solid #dc143c"}
                              border={"2px solid white"}
                              name={
                                creatorInfo.first_name +
                                " " +
                                creatorInfo.last_name
                              }
                              src={
                                creatorInfo?.profile_image_url
                                  ? IMGURL + creatorInfo?.profile_image_url
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
                            <Flex
                              display={"inline-block"}
                              overflow={"hidden"}
                              textOverflow={"ellipsis"}
                              maxW={"200px"}
                              whiteSpace={"nowrap"}
                              color={"black"}
                              fontWeight={700}
                            >
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
                      <Td
                        px={"16px"}
                        borderBottomColor={"#bababa"}
                        color={"#292D3F"}
                        fontWeight={700}
                      >
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
                      <Td
                        px={"16px"}
                        borderBottomColor={"#bababa"}
                        color={"#292D3F"}
                      >
                        <Flex
                          flexDir={"column"}
                          // alignItems={"center"}
                          gap={"5px"}
                          // justify={"space-between"}
                        >
                          {currentAssignee?.length &&
                          val.status !== "completed" &&
                          val.status !== "cancelled" ? (
                            <Flex>
                              <Tooltip
                                placement="top"
                                hasArrow
                                label={getTooltipLabel(currentAssignee)}
                              >
                                <AvatarGroup max={3} size={"sm"} spacing={-3}>
                                  {currentAssignee.map(
                                    (assignedMember, indexAssignedMember) =>
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
                                            assignedMember?.user.first_name +
                                            " " +
                                            assignedMember?.user.last_name
                                          }
                                          src={
                                            assignedMember?.user
                                              .profile_image_url
                                              ? IMGURL +
                                                assignedMember?.user
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
                                    currentAssignee?.length ? "12px" : "14px"
                                  }
                                  color={"#848484"}
                                  fontWeight={700}
                                >
                                  {currentAssignee?.length
                                    ? val.work_order_steps[
                                        val.current_step - 1
                                      ]?.assigned_members.map(
                                        (assignedMember, assignedMemberIndex) =>
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

                      <Td
                        px={"16px"}
                        borderBottomColor={"#bababa"}
                        color={"#292D3F"}
                        fontWeight={700}
                      >
                        <Flex w={"100%"} flexDir={"column"}>
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
                            background={"#dedede"}
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
                      <Td
                        px={"16px"}
                        borderBottomColor={"#bababa"}
                        color={"#292D3F"}
                      >
                        <Flex alignItems={"center"} gap={"5px"}>
                          <Flex color={"#dc143c"} fontSize={"18px"}>
                            <FaMapLocationDot />
                          </Flex>
                          <Flex
                            display={"inline-block"}
                            overflow={"hidden"}
                            textOverflow={"ellipsis"}
                            maxW={"200px"}
                            whiteSpace={"nowrap"}
                            fontWeight={700}
                          >
                            {val.work_site.name}
                          </Flex>
                        </Flex>
                      </Td>
                      <Td
                        px={"16px"}
                        borderBottomColor={"#bababa"}
                        color={"#292D3F"}
                      >
                        {val.deadline_date_time ? (
                          <>
                            <Flex
                              position={"relative"}
                              fontWeight={700}
                              onClick={() => {
                                console.log(val);
                              }}
                              color={
                                // val.is_overdue ? "#dc143c" : "black"
                                val.status === "overdue" || val.is_overdue
                                  ? "#dc143c"
                                  : "black"
                              }
                            >
                              {/* {val?.is_overdue ? ( */}
                              {val.status === "overdue" || val.is_overdue ? (
                                <Tooltip
                                  label={
                                    val.is_overdue
                                      ? "This work order was completed past its deadline."
                                      : "This work order is overdue."
                                  }
                                  // label={"This work order is overdue."}
                                  hasArrow
                                  placement="top"
                                  bg={"#dc143c"}
                                >
                                  <Flex
                                    fontSize={"16px"}
                                    left={"-20px"}
                                    top={"3px"}
                                    position={"absolute"}
                                  >
                                    <IoWarning />
                                  </Flex>
                                </Tooltip>
                              ) : (
                                ""
                              )}

                              {moment(val.deadline_date_time).format(
                                "YYYY-MM-DD"
                              )}
                            </Flex>
                            <Flex color={"#848484"} fontSize={"14px"}>
                              {moment(val.deadline_date_time).format("hh:mm A")}
                            </Flex>
                          </>
                        ) : (
                          <Flex
                            fontSize={"20px"}
                            w={"100%"}
                            justifyContent={"center"}
                          >
                            -
                          </Flex>
                        )}
                      </Td>
                      <Td
                        cursor={val?.isDeleted ? "not-allowed" : "default"}
                        onClick={(e) => {
                          e.stopPropagation();
                        }}
                        px={"16px"}
                        borderBottomColor={"#bababa"}
                        color={"#292D3F"}
                        fontWeight={700}
                        position="sticky"
                        bg={"#f8f9fa"}
                        right="0"
                        p={"0px"}
                      >
                        <Flex
                          p={"16px"}
                          h={"100%"}
                          borderLeft={"1px solid #bababa"}
                          justify={"center"}
                          alignItems={"center"}
                        >
                          <AssignedWorkOrderMenu
                            stepUID={currentStep?.UID}
                            val={val}
                            isDisabled={disableResponse}
                            handleWorkOrderNavigate={handleWorkOrderNavigate}
                            showResponseIcon={
                              val.action_status === "action_required"
                            }
                            showRequireMobileSwalError={
                              showRequireMobileSwalError
                            }
                            isDeleted={val?.isDeleted}
                          />
                        </Flex>
                      </Td>
                    </Tr>
                  );
                })
              ) : (
                <ListEmptyState
                  colSpan={9}
                  header1={"No assigned work orders found"}
                  header2={
                    "There are currently no work orders assigned to you."
                  }
                />
              )}
            </Tbody>
          </Table>
        </TableContainer>
      )}
      <UrlBasedPagination
        updateSearchParams={updateSearchParams}
        totalPages={totalPages}
        currentPage={currentPage}
        rows={rows}
        from={from}
        handleChange={handleChange}
        showing={showing}
      />
    </Flex>
  );
}
