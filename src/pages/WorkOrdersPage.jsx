import {
  Avatar,
  AvatarGroup,
  Button,
  Center,
  Checkbox,
  Flex,
  Input,
  InputGroup,
  InputLeftElement,
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
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import { FaPlus, FaUserAlt } from "react-icons/fa";
import { IoWarning } from "react-icons/io5";
import WorkOrderMenu from "../components/WorkOrders/WorkOrderMenu";
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
import DeleteWorkOrderConfirmationModal from "../components/WorkOrders/DeleteWorkOrderConfirmationModal";
import SwalErrorMessages from "../components/SwalErrorMessages";
import DuplicateWorkOrderConfirmationModal from "../components/WorkOrders/DuplicateWorkOrderConfirmationModal";
import SelectedActionBar from "../components/SelectedActionBar";
import checkHasPermission from "../utils/checkHasPermission";
import { useWorkOrderListener } from "../hooks/useWorkOrderListener";
import { useSelector } from "react-redux";
import CustomToast from "../components/CustomToast";
import formatString from "../utils/formatString";
import UrlBasedPagination from "../components/UrlBasedPagination";
import Can from "../components/Can";

export default function WorkOrdersPage() {
  const toast = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const [cancelNextPusherToast, setCancelNextPusherToast] = useState(false);
  const abortControllerRef = useRef(new AbortController());
  const userSelector = useSelector((state) => state.login.auth);
  const workSiteUID = userSelector.current_work_site?.id;
  const nav = useNavigate();
  const location = useLocation(); // gives you { pathname, search, ... }
  const statusFilterSelection = [
    "completed",
    "ongoing",
    "under_review",
    "draft",
    "overdue",
  ];
  const IMGURL = import.meta.env.VITE_API_IMAGE_URL;
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

  // const [currentPage, setCurrentPage] = useState(searchParams.get("page") || 1);
  const [tableLoading, setTableLoading] = useState(false);
  const [deleteButtonLoading, setDeleteButtonLoading] = useState(false);
  const [duplicateButtonLoading, setDuplicateButtonLoading] = useState(false);
  const [selectedDeleteWorkOrderUID, setSelectedDeleteWorkOrderUID] =
    useState("");
  const [selectedDuplicateWorkOrderUID, setSelectedDuplicateWorkOrderUID] =
    useState("");
  const [deleteSelectedButtonLoading, setDeleteSelectedButtonLoading] =
    useState("");
  const deleteWorkOrderDisclosure = useDisclosure();
  const deleteSelectedWorkOrderDisclosure = useDisclosure();
  const duplicateWorkOrderDisclosure = useDisclosure();
  const pageModule = "work_orders";
  const canCreate = checkHasPermission(userSelector, pageModule, ["manage"]);
  const debouncedSearch = useCallback(
    debounce((value) => {
      console.log(value);
      console.log(searchFilter);
      if (searchFilter === value) {
        setTableLoading(false);
      } else {
        updateSearchParams({ page: 1, search: value });
      }
    }, 1000),
    [searchParams]
  );
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
      return params;
    });
  }

  const resetCopySuccess = useCallback(
    debounce((index) => {
      setWorkOrders((prevState) =>
        prevState.map((state, stateIndex) => {
          if (index === stateIndex) {
            return { ...state, copySuccess: false };
          }
          return state;
        })
      );
    }, 5000), // Adjust the delay as needed
    []
  );

  const checkedOnPage = selectedUID.filter((uid) =>
    workOrders.map((workOrder) => workOrder.UID).includes(uid)
  );
  const allChecked =
    checkedOnPage.length ===
      workOrders.map((workOrder) => workOrder.UID).length &&
    workOrders.map((workOrder) => workOrder.UID).length > 0;

  const isIndeterminate = checkedOnPage.length > 0 && !allChecked;

  function checkNewWorkOrderByFilter(newWorkOrder) {
    let totalCounter = 0;
    let validCounter = 0;
    if (statusFilter) {
      totalCounter++;
      if (statusFilter === newWorkOrder.status) {
        validCounter++;
      }
    }

    if (searchFilter) {
      totalCounter++;
      const lowerCaseSearchFilter = searchFilter.toLowerCase();
      const firstName = newWorkOrder.creator?.first_name || "";
      const lastName = newWorkOrder.creator?.last_name || "";
      const fullName = `${firstName} ${lastName}`.toLowerCase();

      const matches =
        newWorkOrder.name?.toLowerCase().includes(lowerCaseSearchFilter) ||
        newWorkOrder.work_order_custom_id
          ?.toLowerCase()
          .includes(lowerCaseSearchFilter) ||
        firstName.toLowerCase().includes(lowerCaseSearchFilter) ||
        lastName.toLowerCase().includes(lowerCaseSearchFilter) ||
        fullName.includes(lowerCaseSearchFilter);

      if (matches) {
        validCounter++;
      }
    }
    console.log(statusFilter);
    console.log(statusFilter);
    console.log(searchFilter);
    console.log(statusFilter);
    console.log(newWorkOrder);
    console.log(totalCounter);
    console.log(validCounter);

    return totalCounter === validCounter;
  }
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

  function resetSelected(e) {
    setSelectedUID([]);
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

  function handleOpenDeleteWorkOrderModal(UID) {
    deleteWorkOrderDisclosure.onOpen();
    setSelectedDeleteWorkOrderUID(UID);
  }

  function handleOpenDuplicateWorkOrderModal(UID) {
    duplicateWorkOrderDisclosure.onOpen();
    setSelectedDuplicateWorkOrderUID(UID);
  }

  function truncateString(str, maxLength) {
    return str.length > maxLength ? str.substring(0, maxLength) + "..." : str;
  }

  async function fetchWorkOrder() {
    setTableLoading(true);
    console.log(currentPage);
    console.log(rows);
    console.log(searchFilter);
    console.log(statusFilter);

    const localAbortController = abortControllerRef.current;
    await api
      .get(
        `work-order/pagination?page=${currentPage}
        &rows=${rows}
        &search=${searchFilter}
        &status=${statusFilter}`,
        { signal: abortControllerRef.current.signal }
      )
      .then((response) => {
        console.log(response);

        setWorkOrders([
          ...response.data.data.map((workOrders, index) => ({
            ...workOrders,
          })),
        ]);
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

  async function deleteWorkOrder(UID) {
    setCancelNextPusherToast(true);
    setDeleteButtonLoading(true);
    await api
      .delete(`work-order/${UID}`)
      .then((response) => {
        setSelectedUID((prevState) =>
          prevState.filter((selUID) => selUID !== UID)
        );
        Swal.fire({
          title: "Success!",
          text: response?.data?.message,
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
        fetchWorkOrder();
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
        console.error(error);
      })
      .finally(() => {
        deleteWorkOrderDisclosure.onClose();
        setDeleteButtonLoading(false);
      });
  }

  async function deleteSelected() {
    setCancelNextPusherToast(true);
    setDeleteSelectedButtonLoading(true);
    await api
      .delete(`work-order`, {
        data: {
          selectedUID: selectedUID,
        },
      })
      .then((response) => {
        Swal.fire({
          title: "Success!",
          text: response?.data?.message,
          icon: "success",
          customClass: {
            popup: "swal2-custom-popup",
            title: "swal2-custom-title",
            content: "swal2-custom-content",
            actions: "swal2-custom-actions",
            confirmButton: "swal2-custom-confirm-button",
          },
        });
        setSelectedUID([]);
        abortControllerRef.current.abort(); // Cancel any previous request
        abortControllerRef.current = new AbortController();
        fetchWorkOrder();
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
        setDeleteSelectedButtonLoading(false);
        deleteSelectedWorkOrderDisclosure.onClose();
      });
  }

  async function duplicateWorkOrder(UID) {
    setCancelNextPusherToast(true);
    setDuplicateButtonLoading(true);
    await api
      .post(`work-order/${UID}/duplicate-data`)
      .then((response) => {
        localStorage.setItem("duplicate", "true");
        nav(`/work-order/edit/${response.data.workOrderUID}${location.search}`);
        abortControllerRef.current.abort(); // Cancel any previous request
        abortControllerRef.current = new AbortController();
        fetchWorkOrder();
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
        console.error(error);
      })
      .finally(() => {
        duplicateWorkOrderDisclosure.onClose();
        setDuplicateButtonLoading(false);
      });
  }
  function handleWorkOrderNavigate(status, UID) {
    console.log(location.search);

    switch (status) {
      case "draft":
      case "review_rejected":
        nav(`/work-order/edit/${UID}${location.search}`);
        break;

      case "under_review":
      case "ongoing":
      case "completed":
      case "overdue":
      case "cancelled":
        nav(`/work-order/${UID}${location.search}`);
        break;

      default:
        console.warn("Unknown status", status);
    }
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
  function handlePusherData(event, pusherData) {
    console.log(pusherData);
    console.log(event);

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
            ).map((workOrders) => ({
              ...workOrders,
            })),
          ]);
          if (!cancelNextPusherToast) {
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
          setCancelNextPusherToast(false);
        }
        break;
      case "onUpdated":
        {
          const newWorkOrder = pusherData.workOrder;
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
            if (!cancelNextPusherToast) {
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
            setCancelNextPusherToast(false);
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

            if (!cancelNextPusherToast) {
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
            setCancelNextPusherToast(false);
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

            if (!cancelNextPusherToast) {
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
            setCancelNextPusherToast(false);
          }
        }
        break;
      default:
        break;
    }
  }

  useWorkOrderListener(
    `wo.user.${userSelector.id}.ws.${workSiteUID}`,
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
    [searchFilter, statusFilter, rows, workOrders, cancelNextPusherToast]

    // []
  );

  useEffect(() => {
    abortControllerRef.current = new AbortController();
    fetchWorkOrder();
    console.log(searchFilter);
    console.log(statusFilter);
    console.log(currentPage);
    console.log(rows);

    return () => {
      abortControllerRef.current.abort(); // Cleanup on unmount
    };
  }, [searchFilter, statusFilter, currentPage, rows]);
  return (
    <Flex w={"100%"} flexDir={"column"} px={"30px"} py={"20px"} gap={"20px"}>
      <Flex flexDir={"column"}>
        <Flex
          fontSize={"28px"}
          onClick={() => {
            console.log(workOrders);
          }}
          color={"#dc143c"}
          fontWeight={700}
        >
          Work Order List
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
          All Work Orders
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
      <Flex justify={"space-between"} alignItems={"center"}>
        <Flex gap={"20px"}>
          <Can module={pageModule} permission={["manage"]}>
            <Button
              onClick={() => {
                nav("/work-order/create");
              }}
              color={"#dc143c"}
              borderRadius={"20px"}
              border={"1px solid #dc143c"}
              bg={"white"}
              _hover={{ bg: "#dc143c", color: "white" }}
            >
              <Flex alignItems={"center"} gap={"10px"}>
                <Flex>
                  <FaPlus />
                </Flex>
                <Flex>Add Work Order</Flex>
              </Flex>
            </Button>
          </Can>
        </Flex>
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
                  <Checkbox
                    bg={"white"}
                    isChecked={allChecked}
                    isIndeterminate={isIndeterminate}
                    onChange={handleCheckAll}
                  ></Checkbox>
                </Th>
                <Th
                  px={"16px"}
                  borderBottomColor={"#bababa"}
                  fontWeight={700}
                  fontSize={"12px"}
                >
                  Work Order
                </Th>
                <Th fontSize={"12px"} borderBottomColor={"#bababa"}>
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
                  const { bgColor, textColor, icon, text } =
                    tableStatusStyleMapper(val.status);
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
                      onClick={
                        val?.isDeleted
                          ? ""
                          : () => {
                              handleWorkOrderNavigate(val.status, val.UID);
                            }
                      }
                    >
                      <Td
                        px={"16px"}
                        borderBottomColor={"#bababa"}
                        fontWeight={700}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Checkbox
                          bg={"white"}
                          id={val.UID}
                          isChecked={selectedUID.includes(val.UID)}
                          onChange={handleCheckbox}
                        ></Checkbox>
                      </Td>
                      <Td px={"16px"} borderBottomColor={"#bababa"}>
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
                            whiteSpace={"nowrap"}
                            maxW={"240px"}
                            fontWeight={700}
                            color={"black"}
                          >
                            {val.name}
                          </Flex>
                          <Flex
                            display={"inline-block"}
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
                          {val.work_order_steps[val.current_step - 1]
                            ?.assigned_members?.length &&
                          val.status !== "completed" &&
                          val.status !== "cancelled" ? (
                            <Flex>
                              <Tooltip
                                placement="top"
                                hasArrow
                                label={getTooltipLabel(
                                  val.work_order_steps[val.current_step - 1]
                                    ?.assigned_members
                                )}
                              >
                                <AvatarGroup max={3} size={"sm"} spacing={-3}>
                                  {val.work_order_steps[
                                    val.current_step - 1
                                  ]?.assigned_members.map(
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
                                    val.work_order_steps[val.current_step - 1]
                                      ?.assigned_members?.length
                                      ? "12px"
                                      : "14px"
                                  }
                                  color={"#848484"}
                                  fontWeight={700}
                                >
                                  {val.work_order_steps[val.current_step - 1]
                                    ?.assigned_members?.length
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
                        {val.deadline_date_time ? (
                          <>
                            <Flex
                              color={
                                val?.is_overdue ? "#dc143c" : "black"
                                // val.status === "overdue" ? "#dc143c" : "black"
                              }
                              position={"relative"}
                              fontWeight={700}
                            >
                              {val?.is_overdue ? (
                                // {val.status === "overdue" ? (
                                <Tooltip
                                  label={
                                    val.status === "completed"
                                      ? "This work order was completed past its deadline."
                                      : "This work order is overdue."
                                  }
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
                          <WorkOrderMenu
                            pageModule={pageModule}
                            val={val}
                            handleOpenDeleteWorkOrderModal={
                              handleOpenDeleteWorkOrderModal
                            }
                            handleOpenDuplicateWorkOrderModal={
                              handleOpenDuplicateWorkOrderModal
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
                  colSpan={8}
                  header1={"No work orders found"}
                  header2={
                    canCreate
                      ? "to begin tracking them."
                      : "Your work orders will appear here when available."
                  }
                  linkText={"Create a new work order"}
                  link={canCreate ? "/work-order/create" : ""}
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
      <SelectedActionBar
        variant={"work orders"}
        pageModule={pageModule}
        resetFunction={resetSelected}
        selectedUID={selectedUID}
        deleteSelectedFunction={deleteSelected}
        deleteSelectedButtonLoading={deleteSelectedButtonLoading}
        deleteSelectedDisclosure={deleteSelectedWorkOrderDisclosure}
      />
      <DeleteWorkOrderConfirmationModal
        deleteButtonLoading={deleteButtonLoading}
        deleteWorkOrder={deleteWorkOrder}
        selectedDeleteWorkOrderUID={selectedDeleteWorkOrderUID}
        onClose={deleteWorkOrderDisclosure.onClose}
        isOpen={deleteWorkOrderDisclosure.isOpen}
        cancelNextPusherToast={cancelNextPusherToast}
      />
      <DuplicateWorkOrderConfirmationModal
        duplicateButtonLoading={duplicateButtonLoading}
        duplicateWorkOrder={duplicateWorkOrder}
        selectedDuplicateWorkOrderUID={selectedDuplicateWorkOrderUID}
        onClose={duplicateWorkOrderDisclosure.onClose}
        isOpen={duplicateWorkOrderDisclosure.isOpen}
      />
    </Flex>
  );
}
