import {
  Center,
  Checkbox,
  Flex,
  Image,
  Input,
  InputGroup,
  InputLeftElement,
  Link,
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
import LockMenu from "../components/LockInventory/LockMenu";
import { useNavigate, useSearchParams } from "react-router-dom";
import { IoIosInformationCircle, IoIosLock, IoMdSearch } from "react-icons/io";
import { useCallback, useEffect, useRef, useState } from "react";
import { api } from "../api/api";
import { debounce } from "lodash";
import ListEmptyState from "../components/ListEmptyState";
import Swal from "sweetalert2";
import tableStatusStyleMapper from "../utils/tableStatusStyleMapper";
import SelectedActionBar from "../components/SelectedActionBar";
import DeleteLockConfirmationModal from "../components/LockInventory/DeleteLockConfirmationModal";
import SwalErrorMessages from "../components/SwalErrorMessages";
import getLockImageByModel from "../utils/getLockImageByModel";
import LockDetailsModal from "../components/LockInventory/LockDetailsModal";
import formatString from "../utils/formatString";
import UrlBasedPagination from "../components/UrlBasedPagination";
export default function LockInventoryPage() {
  const pageModule = "lock_inventory";
  const abortControllerRef = useRef(new AbortController()); // Persistent controller
  const [searchParams, setSearchParams] = useSearchParams();
  const statusFilterSelection = [
    "available",
    "assigned",
    "out_of_order",
    "awaiting_sync",
  ];

  const nav = useNavigate();
  const [from, setFrom] = useState();
  const [showing, setShowing] = useState(0);
  const [totalPages, setTotalPages] = useState(null);
  const [locks, setLocks] = useState([]);
  const [tableLoading, setTableLoading] = useState(true);
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
  const [selectedUID, setSelectedUID] = useState([]);
  const [deleteButtonLoading, setDeleteButtonLoading] = useState(false);
  const [selectedDeleteLockUID, setSelectedDeleteLockUID] = useState("");
  const [selectedLockDetails, setSelectedLockDetails] = useState("");
  const [lockDetailsMenu, setLockDetailsMenu] = useState("lock");
  const [deleteSelectedButtonLoading, setDeleteSelectedButtonLoading] =
    useState(false);
  const deleteLockDisclosure = useDisclosure();
  const lockDetailsDisclosure = useDisclosure();
  const deleteSelectedLockDisclosure = useDisclosure();
  const checkedOnPage = selectedUID.filter((uid) =>
    locks.map((lock) => lock.UID).includes(uid)
  );
  const allChecked =
    checkedOnPage.length === locks.map((lock) => lock.UID).length &&
    locks.map((lock) => lock.UID).length > 0;

  const isIndeterminate = checkedOnPage.length > 0 && !allChecked;

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
        const newItems = locks
          .map((lock) => lock.UID)
          .filter((uid) => !prevState.includes(uid)); // Avoid duplicates
        return [...prevState, ...newItems];
      });
    } else {
      setSelectedUID((prevState) =>
        prevState.filter((uid) => !locks.some((lock) => lock.UID === uid))
      );
    }
  }
  function resetSelected(e) {
    setSelectedUID([]);
  }

  function handleOpenDeleteLockModal(UID) {
    deleteLockDisclosure.onOpen();
    setSelectedDeleteLockUID(UID);
  }
  function handleOpenLockDetailsModal(lock) {
    lockDetailsDisclosure.onOpen();
    setSelectedLockDetails(lock);
    setLockDetailsMenu("lock");
  }
  function statusHandler(event) {
    const { id } = event.target;
    updateSearchParams({ page: 1, status: id });
  }
  async function fetchLock() {
    setTableLoading(true);
    const localAbortController = abortControllerRef.current;

    await api
      .getLockPagination()
      .then((response) => {
        setLocks(response.data.data);
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
  async function deleteLock(UID) {
    setDeleteButtonLoading(true);
    await api
      .testSubmit("Lock deleted successfully")
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
        fetchLock();
      })
      .catch((error) => {
        Swal.fire({
          title: "Oops...",
          // text: error.response.data.message || "An error occurred",
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
        deleteLockDisclosure.onClose();
      });
  }
  async function deleteSelected() {
    setDeleteSelectedButtonLoading(true);
    await api
      .testSubmit("Selected lock deleted successfully")

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
        fetchLock();
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
        deleteSelectedLockDisclosure.onClose();
      });
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

  useEffect(() => {
    abortControllerRef.current = new AbortController();
    fetchLock();

    return () => {
      abortControllerRef.current.abort(); // Cleanup on unmount
    };
  }, [searchFilter, statusFilter, currentPage, rows]);
  return (
    <Flex w={"100%"} flexDir={"column"} px={"30px"} py={"20px"} gap={"20px"}>
      <Flex flexDir={"column"}>
        <Flex fontSize={"28px"} color={"#dc143c"} fontWeight={700}>
          Lock List
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
          All Locks
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
          <Flex gap={"8px"} alignItems={"center"}>
            <Flex color={"#dc143c"}>
              <IoIosInformationCircle />
            </Flex>{" "}
            <Flex color={"#848484"} fontSize={"16px"} fontWeight={700}>
              Note: To add locks, please use our mobile app. This feature is not
              available on the web version.
            </Flex>
          </Flex>
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
                placeholder="Search locks..."
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
                  Lock
                </Th>
                <Th
                  px={"16px"}
                  borderBottomColor={"#bababa"}
                  fontWeight={700}
                  fontSize={"12px"}
                >
                  Assigned Work Order
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
                  Battery
                </Th>

                <Th
                  borderBottomColor={"#bababa"}
                  fontWeight={700}
                  fontSize={"12px"}
                >
                  Serial Number
                </Th>

                <Th
                  px={"16px"}
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
              {locks.length ? (
                locks?.map((val, index) => {
                  const { bgColor, textColor, icon, text } =
                    tableStatusStyleMapper(val.status);
                  return (
                    <Tr
                      onClick={() => {
                        handleOpenLockDetailsModal(val);
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
                          <Flex
                            background={val.model ? "" : "#848484"}
                            justifyContent={"center"}
                            alignItems={"center"}
                            h={"40px"}
                            w={"40px"}
                            border={"2px solid white"}
                            borderRadius={"100%"}
                          >
                            <Flex color={"white"} fontSize={"20px"}>
                              {val.model ? (
                                <Image
                                  borderRadius={"100%"}
                                  onError={() => {
                                    setLocks((prevState) => {
                                      return prevState.map((val, index2) => {
                                        if (index2 === index) {
                                          return { ...val, image_url: "" };
                                        }
                                        return val;
                                      });
                                    });
                                  }}
                                  src={getLockImageByModel(val.model)}
                                ></Image>
                              ) : (
                                <IoIosLock />
                              )}
                            </Flex>
                          </Flex>
                          <Flex flexDir={"column"}>
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
                            <Flex
                              display={"inline-block"}
                              overflow={"hidden"}
                              textOverflow={"ellipsis"}
                              maxW={"200px"}
                              whiteSpace={"nowrap"}
                              fontSize={"14px"}
                              color={"#848484"}
                            >
                              {val.model}
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
                        {val?.work_order_multi_lock_group_item?.work_order_step
                          ?.work_order?.name ? (
                          <Flex flexDir={"column"}>
                            <Flex
                              display={"inline-block"}
                              overflow={"hidden"}
                              textOverflow={"ellipsis"}
                              maxW={"240px"}
                              whiteSpace={"nowrap"}
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Link
                                href={`/work-order/${val?.work_order_multi_lock_group_item?.work_order_step?.work_order?.UID}`}
                                fontWeight={700}
                              >
                                {
                                  val?.work_order_multi_lock_group_item
                                    ?.work_order_step?.work_order?.name
                                }
                              </Link>
                            </Flex>
                            <Flex
                              display={"inline-block"}
                              overflow={"hidden"}
                              textOverflow={"ellipsis"}
                              maxW={"240px"}
                              whiteSpace={"nowrap"}
                              fontSize={"13px"}
                              color={"#848484"}
                            >
                              {
                                val?.work_order_multi_lock_group_item
                                  ?.work_order_step?.work_order
                                  ?.work_order_custom_id
                              }
                            </Flex>
                          </Flex>
                        ) : (
                          <Flex fontSize={"14px"} color={"#848484"}>
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
                        borderBottomColor={"#bababa"}
                        color={"#292D3F"}
                        fontWeight={700}
                      >
                        <Flex alignItems={"center"} gap={"5px"}>
                          <Flex
                            h={"16px"}
                            w={"16px"}
                            bg={"#00C853"}
                            // bg={"#FFEB3B"}
                            // bg={"#FF5722"}
                            // bg={"#D32F2F"}
                            borderRadius={"100%"}
                          ></Flex>
                          <Flex>90%</Flex>
                        </Flex>
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
                          maxW={"240px"}
                          whiteSpace={"nowrap"}
                        >
                          {val.serial_number}
                        </Flex>
                      </Td>

                      <Td
                        cursor={"default"}
                        onClick={(e) => e.stopPropagation()}
                        borderBottomColor={"#848484"}
                        position="sticky"
                        bg={"#f8f9fa"}
                        right="0"
                        p={"0px"}
                      >
                        <Flex
                          // boxShadow={"0px 0px 3px rgba(50,50,93,0.5)"}
                          p={"16px"}
                          h={"100%"}
                          borderLeft={"1px solid #bababa"}
                          justify={"center"}
                          alignItems={"center"}
                        >
                          <LockMenu
                            val={val}
                            pageModule={pageModule}
                            handleOpenDeleteLockModal={
                              handleOpenDeleteLockModal
                            }
                            handleOpenLockDetailsModal={
                              handleOpenLockDetailsModal
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
                  header1={"No locks found."}
                  header2={"Locks will appear here when available."}
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
        variant={"locks"}
        pageModule={pageModule}
        resetFunction={resetSelected}
        selectedUID={selectedUID}
        deleteSelectedFunction={deleteSelected}
        deleteSelectedButtonLoading={deleteSelectedButtonLoading}
        deleteSelectedDisclosure={deleteSelectedLockDisclosure}
      />
      <DeleteLockConfirmationModal
        deleteButtonLoading={deleteButtonLoading}
        deleteLock={deleteLock}
        selectedDeleteLockUID={selectedDeleteLockUID}
        onClose={deleteLockDisclosure.onClose}
        isOpen={deleteLockDisclosure.isOpen}
      />
      <LockDetailsModal
        selectedLockDetails={selectedLockDetails}
        onClose={lockDetailsDisclosure.onClose}
        isOpen={lockDetailsDisclosure.isOpen}
        lockDetailsMenu={lockDetailsMenu}
        setLockDetailsMenu={setLockDetailsMenu}
      />
    </Flex>
  );
}
