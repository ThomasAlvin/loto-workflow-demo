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
  Tooltip,
  Tr,
  useDisclosure,
} from "@chakra-ui/react";
import { FaPlus, FaUserAlt } from "react-icons/fa";
import TemplateMenu from "../components/Templates/TemplateMenu";
import { useCallback, useEffect, useRef, useState } from "react";
import { api } from "../api/api";
import moment from "moment";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import tableStatusStyleMapper from "../utils/tableStatusStyleMapper";
import { IoMdSearch } from "react-icons/io";
import { debounce } from "lodash";
import ListEmptyState from "../components/ListEmptyState";
import Swal from "sweetalert2";
import DeleteTemplateConfirmationModal from "../components/Templates/DeleteTemplateConfirmationModal";
import SwalErrorMessages from "../components/SwalErrorMessages";
import SelectedActionBar from "../components/SelectedActionBar";
import ImportListModal from "../components/ImportListModal";
import TemplateDetailsModal from "../components/Templates/TemplateDetailsModal";
import { useSelector } from "react-redux";
import checkHasPermission from "../utils/checkHasPermission";
import formatString from "../utils/formatString";
import UrlBasedPagination from "../components/UrlBasedPagination";
import labelizeRole from "../utils/labelizeRole";
import formatAvatarGroupTooltip from "../utils/formatAvatarGroupTooltip";
import Can from "../components/Can";
export default function TemplatesPage() {
  const userSelector = useSelector((state) => state.login.auth);
  const abortControllerRef = useRef(new AbortController());
  const pageModule = "work_orders";
  const canCreate = checkHasPermission(userSelector, pageModule, ["manage"]);
  const statusFilterSelection = ["completed", "draft"];
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();

  const nav = useNavigate();
  const [templates, setTemplates] = useState([]);
  const [selectedUID, setSelectedUID] = useState([]);
  const [tableLoading, setTableLoading] = useState(false);
  const [showing, setShowing] = useState(0);
  const [totalPages, setTotalPages] = useState(null);
  const IMGURL = import.meta.env.VITE_API_IMAGE_URL;

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
  const [from, setFrom] = useState();
  const [deleteSelectedButtonLoading, setDeleteSelectedButtonLoading] =
    useState(false);
  const [deleteButtonLoading, setDeleteButtonLoading] = useState(false);
  const [selectedDeleteTemplateUID, setSelectedDeleteTemplateUID] =
    useState("");
  const [selectedTemplateDetails, setSelectedTemplateDetails] = useState("");
  const deleteTemplateDisclosure = useDisclosure();
  const templateDetailsDisclosure = useDisclosure();
  const deleteSelectedTemplateDisclosure = useDisclosure();
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
      return params;
    });
  }
  const checkedOnPage = selectedUID.filter((uid) =>
    templates.map((template) => template.UID).includes(uid)
  );
  const allChecked =
    checkedOnPage.length === templates.map((template) => template.UID).length &&
    templates.map((template) => template.UID).length > 0;

  const isIndeterminate = checkedOnPage.length > 0 && !allChecked;

  function handleCheckAll(e) {
    if (e.target.checked) {
      setSelectedUID((prevState) => {
        const newItems = templates
          .map((template) => template.UID)
          .filter((uid) => !prevState.includes(uid)); // Avoid duplicates
        return [...prevState, ...newItems];
      });
    } else {
      setSelectedUID((prevState) =>
        prevState.filter(
          (uid) => !templates.some((template) => template.UID === uid)
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

  function handleOpenDeleteTemplateModal(UID) {
    deleteTemplateDisclosure.onOpen();
    setSelectedDeleteTemplateUID(UID);
  }
  function handleOpenTemplateDetailsModal(template) {
    templateDetailsDisclosure.onOpen();
    setSelectedTemplateDetails(template);
  }

  async function fetchTemplates() {
    setTableLoading(true);
    const localAbortController = abortControllerRef.current;
    await api
      .get(
        `template/pagination?type=all&step_type=only_saved&search=${searchFilter}&status=${statusFilter}&page=${currentPage}&rows=${rows}`,
        { signal: abortControllerRef.current.signal }
      )
      .then((response) => {
        console.log(response.data);
        setTemplates(response.data.data);
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
        console.error(error);
      })
      .finally(() => {
        if (localAbortController === abortControllerRef.current) {
          setTableLoading(false);
        }
      });
  }
  async function deleteTemplate(UID) {
    setDeleteButtonLoading(true);
    await api
      .delete(`template/${UID}`)
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
        fetchTemplates();
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
        setDeleteButtonLoading(false);
        deleteTemplateDisclosure.onClose();
      });
  }
  async function deleteSelected() {
    setDeleteSelectedButtonLoading(true);
    await api
      .delete(`template`, {
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
        fetchTemplates();
      })
      .catch((error) => {
        console.log(error);

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
        deleteSelectedTemplateDisclosure.onClose();
      });
  }

  function statusHandler(event) {
    const { id } = event.target;
    updateSearchParams({ page: 1, status: id });
  }

  const handleChange = (e) => {
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
  };
  function handleListClick(template) {
    if (template.status === "draft") {
      nav(`/template/edit/${template.UID}${location.search}`);
    } else {
      handleOpenTemplateDetailsModal(template);
    }
  }

  useEffect(() => {
    abortControllerRef.current = new AbortController();
    fetchTemplates();

    return () => {
      abortControllerRef.current.abort(); // Cleanup on unmount
    };
  }, [currentPage, rows, searchFilter, statusFilter]);
  return (
    <Flex w={"100%"} flexDir={"column"} px={"30px"} py={"20px"} gap={"20px"}>
      <Flex flexDir={"column"}>
        <Flex fontSize={"28px"} color={"#dc143c"} fontWeight={700}>
          Template List
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
          All Templates
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
      <Flex justify={"space-between"}>
        <Flex>
          <Can module={pageModule} permission={["manage"]}>
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
                  <Flex>Add Template</Flex>
                </Flex>
              </MenuButton>
              <MenuList bg={"#f8f9fa"} py={0}>
                <MenuGroup title="Select Method" px={"0px"} color={"crimson"}>
                  <MenuItem
                    onClick={() => {
                      console.log(location.search);

                      nav(`/template/create${location.search}`);
                    }}
                  >
                    <Flex alignItems={"center"} gap={"10px"}>
                      <Flex fontSize={"18px"}>
                        <FaPlus />
                      </Flex>
                      <Flex>Add Template manually</Flex>
                    </Flex>
                  </MenuItem>
                  <ImportListModal
                    variant={"Template"}
                    submitImportRoute={"template/import"}
                    fetchDataFunction={fetchTemplates}
                    abortControllerRef={abortControllerRef}
                  />
                </MenuGroup>
              </MenuList>
            </Menu>
          </Can>
        </Flex>
        <Flex gap={"20px"}>
          <Flex>
            <InputGroup>
              <InputLeftElement pointerEvents="none">
                <IoMdSearch color="#848484" fontSize={"20px"} />
              </InputLeftElement>
              <Input
                defaultValue={searchFilter}
                boxShadow={"0px 0px 3px rgba(50,50,93,0.5)"}
                placeholder="Search templates..."
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
        <TableContainer boxShadow={"0px 0px 3px rgba(50,50,93,0.5)"}>
          <Table h={"1px"} variant="simple">
            <Thead bg={"#ECEFF3"}>
              <Tr>
                <Th
                  w={"5%"}
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
                  w={"16.66%"}
                  borderBottomColor={"#bababa"}
                  fontWeight={700}
                  px={"16px"}
                  fontSize={"12px"}
                >
                  Template
                </Th>
                <Th
                  w={"16.66%"}
                  borderBottomColor={"#bababa"}
                  fontWeight={700}
                  px={"16px"}
                  fontSize={"12px"}
                >
                  Creator
                </Th>
                <Th
                  w={"16.66%"}
                  borderBottomColor={"#bababa"}
                  fontWeight={700}
                  px={"16px"}
                  fontSize={"12px"}
                >
                  Access
                </Th>
                <Th
                  w={"16.66%"}
                  borderBottomColor={"#bababa"}
                  fontWeight={700}
                  px={"16px"}
                  fontSize={"12px"}
                >
                  Status
                </Th>
                <Th
                  w={"16.66%"}
                  borderBottomColor={"#bababa"}
                  fontWeight={700}
                  px={"16px"}
                  fontSize={"12px"}
                >
                  Last Published
                </Th>
                <Th
                  w={"16.66%"}
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
              {templates.length ? (
                templates.map((val, index) => {
                  const { bgColor, textColor, icon, text } =
                    tableStatusStyleMapper(val.status);
                  const currentUserAccess = val.template_access.find(
                    (templateAccess) =>
                      templateAccess?.member?.userId === userSelector.id
                  );
                  const creator = val.template_access.find(
                    (user) => user.role === "owner"
                  );
                  const creatorInfo = creator?.super_admin
                    ? {
                        ...creator?.super_admin,
                        role: labelizeRole("super_admin"),
                      }
                    : {
                        ...creator?.member,
                        first_name: creator?.member?.user.first_name,
                        last_name: creator?.member?.user.last_name,
                        role: labelizeRole(creator?.member?.role),
                        employee_id: creator?.member?.employee_id,
                      };
                  const templateAccessMembers = val.template_access
                    .filter((tempAccess) => tempAccess.role !== "owner")
                    .map((tempAccess2) => tempAccess2.member);
                  // const creatorInfo = { first_name: "" };
                  return (
                    <Tr
                      fontSize={"14px"}
                      onClick={() => {
                        handleListClick(val);
                      }}
                      cursor={"pointer"}
                      _hover={{ background: "#f5f5f5" }}
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
                          <Flex
                            fontWeight={700}
                            display={"inline-block"}
                            overflow={"hidden"}
                            textOverflow={"ellipsis"}
                            maxW={"200px"}
                            whiteSpace={"nowrap"}
                          >
                            {val.name}
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
                                : "No Creator"}
                            </Flex>
                            <Flex fontSize={"14px"} color={"#848484"}>
                              {creatorInfo.role
                                ? labelizeRole(creatorInfo.role) +
                                  (creatorInfo?.employee_id
                                    ? " - " + creatorInfo.employee_id
                                    : "")
                                : "No Creator"}
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
                        <Flex flexDir={"column"} gap={"5px"}>
                          {templateAccessMembers.length ? (
                            <>
                              <Flex>
                                <Tooltip
                                  placement="top"
                                  hasArrow
                                  label={formatAvatarGroupTooltip(
                                    templateAccessMembers
                                  )}
                                >
                                  <AvatarGroup max={3} size={"sm"} spacing={-3}>
                                    {templateAccessMembers.map(
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
                              <Flex
                                display={"inline-block"}
                                overflow={"hidden"}
                                textOverflow={"ellipsis"}
                                maxW={"160px"}
                                whiteSpace={"nowrap"}
                                fontSize={
                                  templateAccessMembers.length ? "12px" : "14px"
                                }
                                color={"#848484"}
                                fontWeight={700}
                              >
                                {templateAccessMembers.length
                                  ? templateAccessMembers.map(
                                      (assignedMember, assignedMemberIndex) =>
                                        assignedMember.user.first_name +
                                        " " +
                                        assignedMember.user.last_name +
                                        (assignedMemberIndex ===
                                        templateAccessMembers.length - 1
                                          ? " "
                                          : ", ")
                                    )
                                  : "No assignee"}
                              </Flex>
                            </>
                          ) : (
                            <Flex color={"#848484"}>No access granted</Flex>
                          )}
                        </Flex>
                        {/* All Admin */}
                      </Td>
                      <Td
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
                        <Flex fontWeight={700}>
                          {moment(val.updated_at).format("YYYY-MM-DD")}
                        </Flex>
                        <Flex color={"#848484"} fontSize={"14px"}>
                          {moment(val.updated_at).format("hh:mm A")}
                        </Flex>
                      </Td>
                      <Td
                        cursor={"default"}
                        onClick={(e) => {
                          e.stopPropagation();
                        }}
                        px={"16px"}
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
                          <TemplateMenu
                            pageModule={pageModule}
                            handleOpenTemplateDetailsModal={
                              handleOpenTemplateDetailsModal
                            }
                            // deleteTemplate={deleteTemplate}
                            handleOpenDeleteTemplateModal={
                              handleOpenDeleteTemplateModal
                            }
                            val={val}
                            hasDeleteAccess={
                              currentUserAccess?.delete ||
                              userSelector.is_superadmin
                            }
                            hasEditAccess={
                              currentUserAccess?.edit ||
                              userSelector.is_superadmin
                            }
                          />
                        </Flex>
                      </Td>
                    </Tr>
                  );
                })
              ) : (
                <ListEmptyState
                  colSpan={7}
                  header1={"No templates found."}
                  header2={
                    canCreate
                      ? "to begin tracking them."
                      : "Templates will appear here when available."
                  }
                  linkText={"Create a new template"}
                  link={canCreate ? "/template/create" : ""}
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
        variant={"templates"}
        pageModule={pageModule}
        resetFunction={resetSelected}
        selectedUID={selectedUID}
        deleteSelectedFunction={deleteSelected}
        deleteSelectedButtonLoading={deleteSelectedButtonLoading}
        deleteSelectedDisclosure={deleteSelectedTemplateDisclosure}
      />
      <DeleteTemplateConfirmationModal
        deleteButtonLoading={deleteButtonLoading}
        deleteTemplate={deleteTemplate}
        selectedDeleteTemplateUID={selectedDeleteTemplateUID}
        onClose={deleteTemplateDisclosure.onClose}
        isOpen={deleteTemplateDisclosure.isOpen}
      />
      <TemplateDetailsModal
        selectedTemplateDetails={selectedTemplateDetails}
        onClose={templateDetailsDisclosure.onClose}
        isOpen={templateDetailsDisclosure.isOpen}
      />
    </Flex>
  );
}
