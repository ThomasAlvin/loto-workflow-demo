import {
  Avatar,
  Button,
  Center,
  Checkbox,
  Flex,
  Input,
  InputGroup,
  InputLeftElement,
  Menu,
  MenuButton,
  MenuGroup,
  MenuItem,
  MenuList,
  Spinner,
  Table,
  TableContainer,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  useDisclosure,
} from "@chakra-ui/react";
import { FaPlus, FaUserAlt } from "react-icons/fa";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useCallback, useEffect, useRef, useState } from "react";
import { api } from "../api/api";
import labelizeRole from "../utils/labelizeRole";
import { debounce } from "lodash";
import { IoMdSearch } from "react-icons/io";
import ListEmptyState from "../components/ListEmptyState";
import Swal from "sweetalert2";
import ImportListModal from "../components/ImportListModal";
import MemberMenu from "../components/Member/MemberMenu";
import moment from "moment";
import SelectedActionBar from "../components/SelectedActionBar";
import tableStatusStyleMapper from "../utils/tableStatusStyleMapper";
import RemoveMemberConfirmationModal from "../components/Member/RemoveMemberConfirmationModal";
import MemberDetailsModal from "../components/Member/MemberDetailsModal";
import SwalErrorMessages from "../components/SwalErrorMessages";
import ImageFocusOverlay from "../components/ImageFocusOverlay";
import { IoEllipsisHorizontalSharp } from "react-icons/io5";
import ResendEmailMemberConfirmationModal from "../components/Member/ResendEmailMemberConfirmationModal";
import checkHasPermission from "../utils/checkHasPermission";
import { useSelector } from "react-redux";
import formatString from "../utils/formatString";
import UrlBasedPagination from "../components/UrlBasedPagination";
import Can from "../components/Can";

export default function MembersPage() {
  const abortControllerRef = useRef(new AbortController()); // Persistent controller
  const abortControllerRef2 = useRef(new AbortController()); // Persistent controller
  const firstActivitiesUpdate = useRef(true);
  const firstAccessibilityUpdate = useRef(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const statusFilterSelection = ["admin", "member", "finance", "customized"];

  const nav = useNavigate();
  const [from, setFrom] = useState();
  const [showing, setShowing] = useState(0);
  const [totalPages, setTotalPages] = useState(null);

  const [members, setMembers] = useState([]);
  const [tableLoading, setTableLoading] = useState(true);
  const currentPage = totalPages
    ? Math.min(Number(searchParams.get("page")) || 1, totalPages)
    : Number(searchParams.get("page")) || 1;
  const searchFilter = searchParams.get("search") || "";
  const roleFilter = statusFilterSelection.includes(searchParams.get("role"))
    ? searchParams.get("role")
    : "";
  const rows = searchParams.get("rows") || 10;
  const [selectedUID, setSelectedUID] = useState([]);
  const [activities, setActivities] = useState([]);
  const [activitiesFrom, setActivitiesFrom] = useState();
  const [activitiesShowing, setActivitiesShowing] = useState(0);
  const [activitiesTotalPages, setActivitiesTotalPages] = useState(null);
  const [activitiesCurrentPage, setActivitiesCurrentPage] = useState(1);
  const [activitiesTableLoading, setActivitiesTableLoading] = useState(false);
  const [activitiesSearchInput, setActivitiesSearchInput] = useState("");
  const [accessibility, setAccessibility] = useState([]);
  const [accessibilityRBAC, setAccessibilityRBAC] = useState([]);
  const [accessibilityLoading, setAccessibilityLoading] = useState(false);
  const userSelector = useSelector((state) => state.login.auth);

  const [deleteSelectedButtonLoading, setDeleteSelectedButtonLoading] =
    useState(false);
  const [removeButtonLoading, setRemoveButtonLoading] = useState(false);
  const [resendEmailButtonLoading, setResendEmailButtonLoading] =
    useState(false);
  const [selectedRemoveMemberUID, setSelectedRemoveMemberUID] = useState(false);
  const [selectedResendEmailMemberUID, setSelectedResendEmailMemberUID] =
    useState(false);
  const [selectedMemberDetails, setSelectedMemberDetails] = useState("");
  const [memberDetailsMenu, setMemberDetailsMenu] = useState("profile");
  const removeMemberDisclosure = useDisclosure();
  const deleteSelectedMemberDisclosure = useDisclosure();
  const resendEmailMemberDisclosure = useDisclosure();
  const memberDetailsDisclosure = useDisclosure();

  const [imageFocusURL, setImageFocusURL] = useState();
  const imageFocusDisclosure = useDisclosure();
  const checkedOnPage = selectedUID.filter((uid) =>
    members.map((member) => member.UID).includes(uid)
  );
  const allChecked =
    checkedOnPage.length === members.map((member) => member.UID).length &&
    members.map((member) => member.UID).length > 0;

  const isIndeterminate = checkedOnPage.length > 0 && !allChecked;
  const allowedCreateAndEditRoles = ["super_admin", "admin"];
  const pageModule = "members";
  const canCreate = checkHasPermission(userSelector, pageModule, ["manage"]);
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

  function handleCheckbox(e) {
    const itemId = e.target.id;

    setSelectedUID(
      (prevState) =>
        e.target.checked
          ? [...prevState, itemId] // Add if checked
          : prevState.filter((id) => id !== itemId) // Remove if unchecked
    );
  }
  function handleCheckAll(e) {
    if (e.target.checked) {
      setSelectedUID((prevState) => {
        const newItems = members
          .map((lock) => lock.UID)
          .filter((uid) => !prevState.includes(uid)); // Avoid duplicates
        return [...prevState, ...newItems];
      });
    } else {
      setSelectedUID((prevState) =>
        prevState.filter((uid) => !members.some((lock) => lock.UID === uid))
      );
    }
  }
  function resetSelected() {
    setSelectedUID([]);
  }

  function handleImageFocus(imageURL) {
    setImageFocusURL(imageURL);
    imageFocusDisclosure.onOpen();
  }

  async function removeMember(UID) {
    setRemoveButtonLoading(true);
    await api
      .testSubmit("Member deleted successfully")
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
        fetchMembers();
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
        removeMemberDisclosure.onClose();
        setRemoveButtonLoading(false);
      });
  }
  async function deleteSelected() {
    setDeleteSelectedButtonLoading(true);
    await api
      .testSubmit("Selected member deleted successfully")
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
        fetchMembers();
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
        deleteSelectedMemberDisclosure.onClose();
      });
  }
  async function resendEmailMember(UID) {
    setResendEmailButtonLoading(true);
    await api
      .testSubmit("Email sent successfully")
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
        resendEmailMemberDisclosure.onClose();
        setResendEmailButtonLoading(false);
      });
  }
  function roleHandler(event) {
    const { id } = event.target;
    updateSearchParams({ page: 1, role: id });
  }

  function handleChange(e) {
    const { value, id } = e.target;
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
  }
  function handleOpenRemoveMemberModal(UID) {
    removeMemberDisclosure.onOpen();
    setSelectedRemoveMemberUID(UID);
  }
  function handleOpenResendEmailMemberModal(UID) {
    resendEmailMemberDisclosure.onOpen();
    setSelectedResendEmailMemberUID(UID);
  }
  function handleOpenMemberDetailsModal(member) {
    memberDetailsDisclosure.onOpen();
    setMemberDetailsMenu("profile");
    setSelectedMemberDetails(member);
  }

  async function fetchMembers() {
    setTableLoading(true);
    const localAbortController = abortControllerRef.current;
    await api
      .getMemberPagination()
      .then((response) => {
        setMembers(response.data.data);
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
  async function fetchActivities() {
    setActivitiesTableLoading(true);
    const localAbortController = abortControllerRef2.current;
    await api
      .getMemberActivities(selectedMemberDetails?.UID)
      .then((response) => {
        setActivities(response.data.data);
        setActivitiesFrom(response.data.from);
        setActivitiesTotalPages(response.data.last_page);
        setActivitiesShowing({
          current: response.data.to,
          total: response.data.total,
        });
      })
      .catch((error) => {
        console.log(error);
      })
      .finally(() => {
        if (localAbortController === abortControllerRef2.current) {
          setActivitiesTableLoading(false);
        }
      });
  }
  async function fetchAccessibility(controller) {
    setAccessibilityLoading(true);
    await api
      .getMemberAccessibility(selectedMemberDetails?.UID)
      .then((response) => {
        setAccessibility(response.data.accessibility);
        setAccessibilityRBAC(response.data.RBACRole);
      })
      .catch((error) => {
        console.log(error);
      })
      .finally(() => {
        setAccessibilityLoading(false);
      });
  }
  useEffect(() => {
    abortControllerRef.current = new AbortController();
    fetchMembers();

    return () => {
      abortControllerRef.current.abort(); // Cleanup on unmount
    };
  }, [searchFilter, roleFilter, currentPage, rows]);
  useEffect(() => {
    if (firstActivitiesUpdate.current) {
      firstActivitiesUpdate.current = false; // Skip first render
      return;
    }
    abortControllerRef2.current = new AbortController();
    fetchActivities();

    return () => {
      abortControllerRef2.current.abort(); // Cleanup on unmount
    };
  }, [activitiesCurrentPage, activitiesSearchInput, selectedMemberDetails]);

  useEffect(() => {
    if (firstAccessibilityUpdate.current) {
      firstAccessibilityUpdate.current = false; // Skip first render
      return;
    }
    const controller = new AbortController();
    fetchAccessibility(controller);

    return () => {
      controller.abort();
    };
  }, [selectedMemberDetails]);
  return (
    <Flex w={"100%"} flexDir={"column"} px={"30px"} py={"20px"} gap={"20px"}>
      <Flex flexDir={"column"}>
        <Flex fontSize={"28px"} color={"#dc143c"} fontWeight={700}>
          Member List
        </Flex>
      </Flex>
      <Flex fontWeight={700} borderBottom={"2px solid #bababa"}>
        <Flex
          cursor={"pointer"}
          borderBottom={!roleFilter ? "3px solid #dc143c" : ""}
          color={!roleFilter ? "black" : "#848484"}
          px={"10px"}
          py={"2px"}
          onClick={roleHandler}
        >
          All
        </Flex>
        {statusFilterSelection.map((statusOption) => (
          <Flex
            id={statusOption}
            cursor={"pointer"}
            borderBottom={
              roleFilter === statusOption ? "3px solid #dc143c" : ""
            }
            color={roleFilter === statusOption ? "black" : "#848484"}
            px={"10px"}
            py={"2px"}
            onClick={roleHandler}
          >
            {formatString(statusOption)}
          </Flex>
        ))}
      </Flex>

      <Flex justify={"space-between"}>
        <Flex>
          <Can
            module={pageModule}
            permission={["manage_member", "manage_admin", "manage_finance"]}
          >
            <Menu>
              <MenuButton
                as={Button}
                //   onClick={onOpen}
                px={"12px"}
                color={"#dc143c"}
                borderRadius={"50px"}
                border={"1px solid #dc143c"}
                bg={"white"}
                _hover={{ bg: "#dc143c", color: "white" }}
              >
                <Flex alignItems={"center"} gap={"10px"}>
                  <Flex fontSize={"20px"}>
                    <FaPlus />
                  </Flex>
                  <Flex>Add Member</Flex>
                </Flex>
              </MenuButton>
              <MenuList bg={"#f8f9fa"} py={0}>
                <MenuGroup title="Select Method" px={"0px"} color={"crimson"}>
                  <MenuItem onClick={() => nav("/member/create")}>
                    <Flex alignItems={"center"} gap={"10px"}>
                      <Flex fontSize={"18px"}>
                        <FaPlus />
                      </Flex>
                      <Flex>Add member manually</Flex>
                    </Flex>
                  </MenuItem>

                  <ImportListModal
                    variant={"Member"}
                    submitImportRoute={"member/import"}
                    fetchDataFunction={fetchMembers}
                    abortControllerRef={abortControllerRef}
                  />
                </MenuGroup>
              </MenuList>
            </Menu>
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
                placeholder="Search members..."
                onChange={(event) => {
                  setTableLoading(true);
                  handleChange(event);
                }}
              ></Input>
            </InputGroup>
          </Flex>
        </Flex>{" "}
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
        <Flex position={"relative"}>
          <TableContainer
            w={"100%"}
            boxShadow={"0px 0px 3px rgba(50,50,93,0.5)"}
          >
            <Table h={"1px"} variant="simple">
              <Thead bg={"#ECEFF3"}>
                <Tr>
                  <Th
                    borderBottomColor={"#bababa"}
                    fontWeight={700}
                    fontSize={"12px"}
                    px={"16px"}
                  >
                    <Checkbox
                      bg={"white"}
                      isChecked={allChecked}
                      isIndeterminate={isIndeterminate}
                      onChange={handleCheckAll}
                    ></Checkbox>
                  </Th>
                  <Th
                    borderBottomColor={"#bababa"}
                    fontWeight={700}
                    fontSize={"12px"}
                    px={"16px"}
                  >
                    Member
                  </Th>

                  <Th
                    borderBottomColor={"#bababa"}
                    fontWeight={700}
                    fontSize={"12px"}
                    px={"16px"}
                  >
                    Current Work Order
                  </Th>
                  <Th
                    borderBottomColor={"#bababa"}
                    fontWeight={700}
                    fontSize={"12px"}
                    px={"16px"}
                  >
                    Email
                  </Th>
                  <Th
                    borderBottomColor={"#bababa"}
                    fontWeight={700}
                    fontSize={"12px"}
                    px={"16px"}
                  >
                    Status
                  </Th>
                  <Th
                    borderBottomColor={"#bababa"}
                    fontWeight={700}
                    fontSize={"12px"}
                    px={"16px"}
                  >
                    Department
                  </Th>
                  <Th
                    borderBottomColor={"#bababa"}
                    fontWeight={700}
                    fontSize={"12px"}
                    px={"16px"}
                  >
                    Last Login
                  </Th>

                  <Th
                    textAlign={"center"}
                    borderBottomColor={"#848484"}
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
                {members.length ? (
                  members.map((val, index) => {
                    const { bgColor, textColor, icon, text } =
                      tableStatusStyleMapper(val.user.status); // Move this outside of JSX

                    return (
                      <Tr
                        onClick={() => {
                          handleOpenMemberDetailsModal(val);
                        }}
                        cursor={"pointer"}
                        _hover={{ background: "#f5f5f5" }}
                        fontSize={"14px"}
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
                          <Flex alignItems={"center"} gap={"10px"}>
                            {val.user.first_name ? (
                              <Avatar
                                cursor={"pointer"}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleImageFocus(val.user.profile_image_url);
                                }}
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
                              <Flex
                                fontWeight={700}
                                display={"inline-block"}
                                overflow={"hidden"}
                                textOverflow={"ellipsis"}
                                maxW={"200px"}
                                whiteSpace={"nowrap"}
                              >
                                {val.user.first_name + " " + val.user.last_name}
                              </Flex>
                              <Flex fontSize={"14px"} color={"#848484"}>
                                {labelizeRole(
                                  val.role,
                                  val.has_custom_permissions
                                ) +
                                  " - " +
                                  val.employee_id}
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
                          {val.assigned_work_orders.length ? (
                            <Flex fontSize={"13px"} flexDir={"column"}>
                              {val.assigned_work_orders
                                .slice(0, 2)
                                .map((workOrder, index) => (
                                  <Flex
                                    display={"inline-block"}
                                    overflow={"hidden"}
                                    textOverflow={"ellipsis"}
                                    maxW={"200px"}
                                    whiteSpace={"nowrap"}
                                  >
                                    {index + 1}. {workOrder.name}
                                  </Flex>
                                ))}
                              {val.assigned_work_orders.length > 2 ? (
                                <Flex
                                  onClick={() => {
                                    handleOpenMemberDetailsModal(val);
                                  }}
                                  cursor={"pointer"}
                                  px={"6px"}
                                  fontSize={"16px"}
                                  borderRadius={"full"}
                                  bg={"#ededed"}
                                  color={"#848484"}
                                  w={"fit-content"}
                                >
                                  <IoEllipsisHorizontalSharp />
                                </Flex>
                              ) : null}
                            </Flex>
                          ) : (
                            <Flex fontWeight={700} color={"#848484"}>
                              None
                            </Flex>
                          )}
                        </Td>
                        <Td
                          px={"16px"}
                          borderBottomColor={"#bababa"}
                          color={"#292D3F"}
                          fontWeight={700}
                        >
                          <Flex
                            display={"inline-block"}
                            overflow={"hidden"}
                            textOverflow={"ellipsis"}
                            maxW={"200px"}
                            whiteSpace={"nowrap"}
                          >
                            {val.user.email}
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
                          fontWeight={700}
                          borderBottomColor={"#bababa"}
                          color={"#292D3F"}
                        >
                          <Flex
                            display={"inline-block"}
                            overflow={"hidden"}
                            textOverflow={"ellipsis"}
                            maxW={"200px"}
                            whiteSpace={"nowrap"}
                          >
                            {val?.department?.name}
                          </Flex>
                        </Td>
                        <Td
                          px={"16px"}
                          borderBottomColor={"#bababa"}
                          color={"#292D3F"}
                        >
                          <Flex fontWeight={700}>
                            {val?.user?.last_login
                              ? moment(val.user.last_login).format("YYYY-MM-DD")
                              : "-"}
                          </Flex>
                          {val?.user?.last_login ? (
                            <Flex color={"#848484"} fontSize={"14px"}>
                              {moment(val.user.last_login).format("hh:mm A")}
                            </Flex>
                          ) : null}
                        </Td>
                        <Td
                          cursor={"default"}
                          onClick={(e) => {
                            e.stopPropagation();
                          }}
                          borderBottomColor={"#848484"}
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
                            <MemberMenu
                              removeMember={removeMember}
                              handleOpenMemberDetailsModal={
                                handleOpenMemberDetailsModal
                              }
                              handleOpenRemoveMemberModal={
                                handleOpenRemoveMemberModal
                              }
                              handleOpenResendEmailMemberModal={
                                handleOpenResendEmailMemberModal
                              }
                              member={val}
                              pageModule={pageModule}
                            />
                          </Flex>
                        </Td>
                      </Tr>
                    );
                  })
                ) : (
                  <ListEmptyState
                    colSpan={8}
                    header1={"No members found."}
                    header2={
                      canCreate
                        ? "to begin tracking them."
                        : "Members will appear here when available."
                    }
                    linkText={"Create a new member"}
                    link={canCreate ? "/member/create" : ""}
                  />
                )}
              </Tbody>
            </Table>
          </TableContainer>
        </Flex>
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
        variant={"members"}
        pageModule={pageModule}
        resetFunction={resetSelected}
        selectedUID={selectedUID}
        deleteSelectedButtonLoading={deleteSelectedButtonLoading}
        deleteSelectedFunction={deleteSelected}
        deleteSelectedDisclosure={deleteSelectedMemberDisclosure}
      />
      <RemoveMemberConfirmationModal
        removeButtonLoading={removeButtonLoading}
        removeMember={removeMember}
        selectedRemoveMemberUID={selectedRemoveMemberUID}
        onClose={removeMemberDisclosure.onClose}
        isOpen={removeMemberDisclosure.isOpen}
      />
      <ResendEmailMemberConfirmationModal
        resendEmailButtonLoading={resendEmailButtonLoading}
        resendEmailMember={resendEmailMember}
        selectedResendEmailMemberUID={selectedResendEmailMemberUID}
        onClose={resendEmailMemberDisclosure.onClose}
        isOpen={resendEmailMemberDisclosure.isOpen}
      />
      <MemberDetailsModal
        pageModule={pageModule}
        selectedMemberDetails={selectedMemberDetails}
        memberDetailsMenu={memberDetailsMenu}
        setMemberDetailsMenu={setMemberDetailsMenu}
        activities={activities}
        from={activitiesFrom}
        showing={activitiesShowing}
        totalPages={activitiesTotalPages}
        currentPage={activitiesCurrentPage}
        setCurrentPage={setActivitiesCurrentPage}
        tableLoading={activitiesTableLoading}
        setTableLoading={setActivitiesTableLoading}
        searchInput={activitiesSearchInput}
        setSearchInput={setActivitiesSearchInput}
        accessibility={accessibility}
        accessibilityRBAC={accessibilityRBAC}
        accessibilityLoading={accessibilityLoading}
        fetchAccessibility={fetchAccessibility}
        fetchActivities={fetchActivities}
        onClose={memberDetailsDisclosure.onClose}
        isOpen={memberDetailsDisclosure.isOpen}
      />
      <ImageFocusOverlay
        imageFocusDisclosure={imageFocusDisclosure}
        imageFocusURL={imageFocusURL}
      />
    </Flex>
  );
}
