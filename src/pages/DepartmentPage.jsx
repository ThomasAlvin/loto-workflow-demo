import {
  Center,
  Checkbox,
  Flex,
  Input,
  InputGroup,
  InputLeftElement,
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
import { useCallback, useEffect, useRef, useState } from "react";
import { IoMdSearch } from "react-icons/io";
import { FaRegUser } from "react-icons/fa6";
import { useSearchParams } from "react-router-dom";
import { api } from "../api/api";
import moment from "moment";
import { debounce } from "lodash";
import SelectedActionBar from "../components/SelectedActionBar";
import Swal from "sweetalert2";
import SwalErrorMessages from "../components/SwalErrorMessages";
import ListEmptyState from "../components/ListEmptyState";
import DepartmentMenu from "../components/Department/DepartmentMenu";
import DeleteDepartmentConfirmationModal from "../components/Department/DeleteDepartmentConfirmationModal";
import EditDepartmentModal from "../components/Department/EditDepartmentModal";
import DepartmentDetailsModal from "../components/Department/DepartmentDetailsModal";
import CreateDepartmentModal from "../components/Department/CreateDepartmentModal";
import UrlBasedPagination from "../components/UrlBasedPagination";
import Can from "../components/Can";

export default function DepartmentPage() {
  const pageModule = "members";
  const abortControllerRef = useRef(new AbortController()); // Persistent controller
  const [searchParams, setSearchParams] = useSearchParams();
  const [departments, setDepartments] = useState([]);
  const [tableLoading, setTableLoading] = useState(true);
  const [from, setFrom] = useState();
  // const [rows, setRows] = useState(10);
  const [showing, setShowing] = useState(0);
  const [totalPages, setTotalPages] = useState(null);
  // const [currentPage, setCurrentPage] = useState(1);
  // const [searchInput, setSearchInput] = useState(searchQuery);
  const currentPage = totalPages
    ? Math.min(Number(searchParams.get("page")) || 1, totalPages)
    : Number(searchParams.get("page")) || 1;
  const searchFilter = searchParams.get("search") || "";

  const rows = searchParams.get("rows") || 10;
  const [selectedUID, setSelectedUID] = useState([]);

  const [deleteSelectedButtonLoading, setDeleteSelectedButtonLoading] =
    useState(false);
  const [deleteButtonLoading, setDeleteButtonLoading] = useState(false);
  const [selectedDeleteDepartmentUID, setSelectedDeleteDepartmentUID] =
    useState("");
  const deleteSelectedDepartmentDisclosure = useDisclosure();

  const deleteDepartmentDisclosure = useDisclosure();

  const [editButtonLoading, setEditButtonLoading] = useState(false);
  const [selectedEditDepartment, setSelectedEditDepartment] = useState({
    name: "",
    description: "",
  });
  const editDepartmentDisclosure = useDisclosure();

  const [selectedDepartmentDetails, setSelectedDepartmentDetails] =
    useState("");
  const departmentDetailsDisclosure = useDisclosure();
  const createDepartmentDisclosure = useDisclosure();

  const checkedOnPage = selectedUID.filter((uid) =>
    departments.map((department) => department.UID).includes(uid)
  );
  const allChecked =
    checkedOnPage.length ===
      departments.map((department) => department.UID).length &&
    departments.map((department) => department.UID).length > 0;

  const isIndeterminate = checkedOnPage.length > 0 && !allChecked;

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
        const newItems = departments
          .map((lock) => lock.UID)
          .filter((uid) => !prevState.includes(uid)); // Avoid duplicates
        return [...prevState, ...newItems];
      });
    } else {
      setSelectedUID((prevState) =>
        prevState.filter((uid) => !departments.some((lock) => lock.UID === uid))
      );
    }
  }
  function resetSelected(e) {
    setSelectedUID([]);
  }

  function handleOpenDeleteDepartmentModal(UID) {
    deleteDepartmentDisclosure.onOpen();
    setSelectedDeleteDepartmentUID(UID);
  }
  function handleOpenEditDepartmentModal(UID) {
    editDepartmentDisclosure.onOpen();
    setSelectedEditDepartment(
      departments.find((dept) => dept.UID === UID) || null
    );
  }
  function handleOpenDepartmentDetailsModal(UID) {
    setSelectedDepartmentDetails(
      departments.find((dept) => dept.UID === UID) || null
    );

    departmentDetailsDisclosure.onOpen();
  }
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
  async function fetchDepartments() {
    setTableLoading(true);
    await api
      .get(
        `department/pagination?search=${searchFilter}&page=${currentPage}&rows=${rows}`,
        { signal: abortControllerRef.current.signal }
      )
      .then((response) => {
        setDepartments(response.data.data);
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
        setTableLoading(false);
      });
  }
  async function deleteDepartment(UID) {
    setDeleteButtonLoading(true);
    await api
      .delete(`department/${UID}`)
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
        abortControllerRef.current.abort();
        abortControllerRef.current = new AbortController();
        fetchDepartments();
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
        console.log(error);
      })
      .finally(() => {
        deleteDepartmentDisclosure.onClose();
        setDeleteButtonLoading(false);
      });
  }
  async function deleteSelected() {
    setDeleteSelectedButtonLoading(true);
    await api
      .delete(`department`, {
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
        abortControllerRef.current.abort();
        abortControllerRef.current = new AbortController();
        fetchDepartments();
      })
      .catch((error) => {
        Swal.fire({
          title: "Oops...",
          html: SwalErrorMessages(error.response.data.message),
          icon: "error",
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
        deleteSelectedDepartmentDisclosure.onClose();
      });
  }
  async function editDepartment(data, UID) {
    setEditButtonLoading(true);
    await api
      .post(`department/${UID}`, data)
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
        abortControllerRef.current.abort(); // Cancel any previous request
        abortControllerRef.current = new AbortController();
        fetchDepartments();
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
        console.log(error);
      })
      .finally(() => {
        editDepartmentDisclosure.onClose();
        setEditButtonLoading(false);
      });
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

  useEffect(() => {
    abortControllerRef.current = new AbortController();
    fetchDepartments();
    return () => {
      abortControllerRef.current.abort(); // Cleanup on unmount
    };
  }, [searchFilter, rows, currentPage]);
  return (
    <>
      <Flex w={"100%"} flexDir={"column"} px={"30px"} py={"20px"} gap={"20px"}>
        <Flex fontSize={"28px"} color={"#dc143c"} fontWeight={700}>
          Department List
        </Flex>
        <Flex h={"2px"} bg={"#bababa"}></Flex>
        <Flex justify={"space-between"}>
          <Flex>
            <Can
              module={pageModule}
              permission={["manage_admin", "manage_member", "manage_finance"]}
            >
              <CreateDepartmentModal
                createDepartmentDisclosure={createDepartmentDisclosure}
                fetchDepartments={fetchDepartments}
                abortControllerRef={abortControllerRef}
              />
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
                  placeholder="Search departments..."
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
            overflowX={"hidden"}
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
                    Department
                  </Th>
                  <Th
                    px={"16px"}
                    borderBottomColor={"#bababa"}
                    fontWeight={700}
                    fontSize={"12px"}
                  >
                    Description
                  </Th>
                  <Th
                    px={"16px"}
                    borderBottomColor={"#bababa"}
                    fontWeight={700}
                    fontSize={"12px"}
                  >
                    Members
                  </Th>
                  <Th
                    px={"16px"}
                    borderBottomColor={"#bababa"}
                    fontWeight={700}
                    fontSize={"12px"}
                  >
                    Published At
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
                {departments.length ? (
                  departments.map((val, index) => {
                    return (
                      <Tr
                        onClick={() => {
                          handleOpenDepartmentDetailsModal(val.UID);
                        }}
                        cursor={"pointer"}
                        _hover={{ background: "#f5f5f5" }}
                        fontSize={"14px"}
                      >
                        <Td
                          px={"16px"}
                          borderBottomColor={"#bababa"}
                          onClick={(e) => e.stopPropagation()}
                          fontWeight={700}
                        >
                          <Checkbox
                            bg={"white"}
                            id={val.UID}
                            isChecked={selectedUID.includes(val.UID)}
                            onChange={handleCheckbox}
                          ></Checkbox>
                        </Td>
                        <Td px={"16px"} borderBottomColor={"#bababa"}>
                          <Flex
                            display={"inline-block"}
                            overflow={"hidden"}
                            textOverflow={"ellipsis"}
                            maxW={"200px"}
                            whiteSpace={"nowrap"}
                            fontWeight={700}
                          >
                            {val.name}
                          </Flex>
                        </Td>
                        <Td
                          px={"16px"}
                          borderBottomColor={"#bababa"}
                          color={val.description ? "#292D3F" : "#848484"}
                          fontWeight={700}
                        >
                          <Flex
                            display={"inline-block"}
                            overflow={"hidden"}
                            textOverflow={"ellipsis"}
                            maxW={"400px"}
                            whiteSpace={"nowrap"}
                          >
                            {val?.description || "No Description Set"}
                          </Flex>
                        </Td>
                        <Td
                          px={"16px"}
                          borderBottomColor={"#bababa"}
                          color={"#292D3F"}
                          fontWeight={700}
                        >
                          <Flex gap={"5px"} alignItems={"center"}>
                            <Flex>
                              <FaRegUser />
                            </Flex>
                            <Flex fontSize={"16px"}>{val.members.length}</Flex>
                          </Flex>
                        </Td>

                        <Td
                          px={"16px"}
                          borderBottomColor={"#bababa"}
                          color={"#292D3F"}
                        >
                          <Flex fontWeight={700}>
                            {moment(val.created_at).format("YYYY-MM-DD")}
                          </Flex>
                          <Flex color={"#848484"} fontSize={"14px"}>
                            {moment(val.created_at).format("hh:mm A")}
                          </Flex>
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
                            <DepartmentMenu
                              UID={val.UID}
                              membersCount={val.members.length}
                              pageModule={pageModule}
                              handleOpenDeleteDepartmentModal={
                                handleOpenDeleteDepartmentModal
                              }
                              handleOpenEditDepartmentModal={
                                handleOpenEditDepartmentModal
                              }
                              handleOpenDepartmentDetailsModal={
                                handleOpenDepartmentDetailsModal
                              }
                            />
                          </Flex>
                        </Td>
                      </Tr>
                    );
                  })
                ) : (
                  <ListEmptyState
                    colSpan={6}
                    header1={"No department found."}
                    header2={"Departments will appear here when available."}
                    linkText={"Create a new department"}

                    // link={"/equipment-machine/create"}
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
          variant={"departments"}
          pageModule={pageModule}
          resetFunction={resetSelected}
          selectedUID={selectedUID}
          deleteSelectedFunction={deleteSelected}
          deleteSelectedButtonLoading={deleteSelectedButtonLoading}
          deleteSelectedDisclosure={deleteSelectedDepartmentDisclosure}
        />
        <DepartmentDetailsModal
          selectedDepartmentDetails={selectedDepartmentDetails}
          onClose={departmentDetailsDisclosure.onClose}
          isOpen={departmentDetailsDisclosure.isOpen}
        />
        <DeleteDepartmentConfirmationModal
          deleteButtonLoading={deleteButtonLoading}
          deleteDepartment={deleteDepartment}
          selectedDeleteDepartmentUID={selectedDeleteDepartmentUID}
          onClose={deleteDepartmentDisclosure.onClose}
          isOpen={deleteDepartmentDisclosure.isOpen}
        />
        <EditDepartmentModal
          editButtonLoading={editButtonLoading}
          editDepartment={editDepartment}
          selectedEditDepartment={selectedEditDepartment}
          onClose={editDepartmentDisclosure.onClose}
          isOpen={editDepartmentDisclosure.isOpen}
        />
      </Flex>
    </>
  );
}
