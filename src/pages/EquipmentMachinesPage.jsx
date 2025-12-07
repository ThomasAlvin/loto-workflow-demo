import {
  Button,
  Center,
  Checkbox,
  Flex,
  Image,
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
import { FaPlus, FaTools } from "react-icons/fa";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { IoMdSearch } from "react-icons/io";
import { useCallback, useEffect, useRef, useState } from "react";
import { api } from "../api/api";
import tableStatusStyleMapper from "../utils/tableStatusStyleMapper";
import EquipmentMachineMenu from "../components/EquipmentMachine/EquipmentMachineMenu";
import { debounce } from "lodash";
import ListEmptyState from "../components/ListEmptyState";
import Swal from "sweetalert2";
import ImportListModal from "../components/ImportListModal";
import SelectedActionBar from "../components/SelectedActionBar";
import DeleteEquipmentMachineConfirmationModal from "../components/EquipmentMachine/DeleteEquipmentMachineConfirmationModal";
import SwalErrorMessages from "../components/SwalErrorMessages";
import ImageFocusOverlay from "../components/ImageFocusOverlay";
import EquipmentMachineDetailsModal from "../components/EquipmentMachine/EquipmentMachineDetailsModal";
import checkHasPermission from "../utils/checkHasPermission";
import { useSelector } from "react-redux";
import formatString from "../utils/formatString";
import UrlBasedPagination from "../components/UrlBasedPagination";
import Can from "../components/Can";

export default function EquipmentMachinesPage() {
  const nav = useNavigate();
  const pageModule = "equipment_machines";
  const location = useLocation();

  const userSelector = useSelector((state) => state.login.auth);
  const statusFilterSelection = [
    "operational",
    "ongoing_inspection",
    "out_of_order",
    "decomissioned",
    "under_maintenance",
  ];
  const [searchParams, setSearchParams] = useSearchParams();

  const rows = searchParams.get("rows") || 10;
  const canCreate = checkHasPermission(userSelector, pageModule, ["manage"]);
  const abortControllerRef = useRef(new AbortController()); // Persistent controller
  const [from, setFrom] = useState();
  const [showing, setShowing] = useState(0);
  const [totalPages, setTotalPages] = useState(null);
  const currentPage = totalPages
    ? Math.min(Number(searchParams.get("page")) || 1, totalPages)
    : Number(searchParams.get("page")) || 1;
  const searchFilter = searchParams.get("search") || "";
  const statusFilter = statusFilterSelection.includes(
    searchParams.get("status")
  )
    ? searchParams.get("status")
    : "";
  const [tableLoading, setTableLoading] = useState(true);
  const [equipmentMachines, setEquipmentMachines] = useState([]);
  const [selectedUID, setSelectedUID] = useState([]);
  const [selectedEquipmentMachineDetails, setSelectedEquipmentMachineDetails] =
    useState([]);
  const [deleteButtonLoading, setDeleteButtonLoading] = useState(false);
  const [deleteSelectedButtonLoading, setDeleteSelectedButtonLoading] =
    useState(false);
  const [selectedDeleteMachineUID, setSelectedDeleteMachineUID] = useState("");
  const deleteMachineDisclosure = useDisclosure();
  const deleteSelectedMachineDisclosure = useDisclosure();
  const equipmentMachineDetailsDisclosure = useDisclosure();
  const [imageFocusURL, setImageFocusURL] = useState();
  const imageFocusDisclosure = useDisclosure();
  const checkedOnPage = selectedUID.filter((uid) =>
    equipmentMachines
      .map((equipmentMachine) => equipmentMachine.UID)
      .includes(uid)
  );
  const allChecked =
    checkedOnPage.length ===
      equipmentMachines.map((equipmentMachine) => equipmentMachine.UID)
        .length &&
    equipmentMachines.map((equipmentMachine) => equipmentMachine.UID).length >
      0;

  const isIndeterminate = checkedOnPage.length > 0 && !allChecked;

  const IMGURL = import.meta.env.VITE_API_IMAGE_URL;
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
  function handleCheckbox(e) {
    const itemId = e.target.id;

    setSelectedUID(
      (prevState) =>
        e.target.checked
          ? [...prevState, itemId] // Add if checked
          : prevState.filter((id) => id !== itemId) // Remove if unchecked
    );
  }
  function handleImageFocus(imageURL) {
    setImageFocusURL(imageURL);
    imageFocusDisclosure.onOpen();
  }
  function handleCheckAll(e) {
    if (e.target.checked) {
      setSelectedUID((prevState) => {
        const newItems = equipmentMachines
          .map((equipmentMachine) => equipmentMachine.UID)
          .filter((uid) => !prevState.includes(uid)); // Avoid duplicates
        return [...prevState, ...newItems];
      });
    } else {
      setSelectedUID((prevState) =>
        prevState.filter(
          (uid) => !equipmentMachines.some((lock) => lock.UID === uid)
        )
      );
    }
  }

  function resetSelected(e) {
    setSelectedUID([]);
  }

  async function fetchEquipmentMachines() {
    setTableLoading(true);
    const localAbortController = abortControllerRef.current;
    await api
      .get(
        `equipment-machine/pagination?search=${searchFilter}&status=${statusFilter}&page=${currentPage}&rows=${rows}`,
        { signal: abortControllerRef.current.signal }
      )
      .then((response) => {
        setEquipmentMachines(response.data.data);
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
  async function deleteEquipmentMachine(UID) {
    setDeleteButtonLoading(true);
    await api
      .delete(`equipment-machine/${UID}`)
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
        fetchEquipmentMachines();
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
        deleteMachineDisclosure.onClose();
        setDeleteButtonLoading(false);
      });
  }
  async function deleteSelected() {
    setDeleteSelectedButtonLoading(true);
    await api
      .delete(`equipment-machine`, {
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
        fetchEquipmentMachines();
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
        deleteSelectedMachineDisclosure.onClose();
      });
  }
  function statusHandler(event) {
    const { id } = event.target;
    updateSearchParams({ page: 1, status: id });
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
  function handleOpenDeleteEquipmentMachineModal(UID) {
    deleteMachineDisclosure.onOpen();
    setSelectedDeleteMachineUID(UID);
  }
  function handleOpenEquipmentMachineDetailsModal(equipmentMachine) {
    equipmentMachineDetailsDisclosure.onOpen();
    setSelectedEquipmentMachineDetails(equipmentMachine);
  }
  useEffect(() => {
    abortControllerRef.current = new AbortController();
    fetchEquipmentMachines();

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [searchFilter, statusFilter, rows, currentPage]);
  return (
    <Flex w={"100%"} flexDir={"column"} px={"30px"} py={"20px"} gap={"20px"}>
      <Flex flexDir={"column"}>
        <Flex fontSize={"28px"} color={"#dc143c"} fontWeight={700}>
          Equipment/Machine List
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
          All Machines
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
                  <Flex>Add Equipment/Machine</Flex>
                </Flex>
              </MenuButton>
              <MenuList bg={"#f8f9fa"} py={0}>
                <MenuGroup title="Select Method" px={"0px"} color={"crimson"}>
                  <MenuItem onClick={() => nav("/equipment-machine/create")}>
                    <Flex alignItems={"center"} gap={"10px"}>
                      <Flex fontSize={"18px"}>
                        <FaPlus />
                      </Flex>
                      <Flex>Add Equipment/Machine manually</Flex>
                    </Flex>
                  </MenuItem>
                  <ImportListModal
                    variant={"Equipment/Machine"}
                    submitImportRoute={"equipment-machine/import"}
                    fetchDataFunction={fetchEquipmentMachines}
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
                placeholder="Search machines..."
                onChange={(event) => {
                  setTableLoading(true);
                  handleChange(event);
                }}
              ></Input>
            </InputGroup>
            {/* <Input
              placeholder="search"
              onChange={(event) => {
                setTableLoading(true);
                handleChange(event);
              }}
            ></Input> */}
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
                  Equipment/Machine
                </Th>
                <Th
                  px={"16px"}
                  borderBottomColor={"#bababa"}
                  fontWeight={700}
                  fontSize={"12px"}
                >
                  Machine ID
                </Th>
                <Th
                  px={"16px"}
                  borderBottomColor={"#bababa"}
                  fontWeight={700}
                  fontSize={"12px"}
                >
                  Serial Number
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
                  Location
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
              {equipmentMachines.length ? (
                equipmentMachines.map((val, index) => {
                  const { bgColor, textColor, icon, text } =
                    tableStatusStyleMapper(val.status); // Move this outside of JSX

                  return (
                    <Tr
                      onClick={() => {
                        nav(
                          `/equipment-machine/edit/${val.UID}${location.search}`
                        );
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
                            background={val.main_image_url ? "" : "#848484"}
                            justifyContent={"center"}
                            alignItems={"center"}
                            border={"2px solid white"}
                            // borderRadius={"100%"}
                          >
                            <Flex
                              h={"40px"}
                              w={"40px"}
                              color={"white"}
                              fontSize={"20px"}
                            >
                              {val.main_image_url ? (
                                <Image
                                  h={"40px"}
                                  w={"40px"}
                                  cursor={"pointer"}
                                  onClick={() => {
                                    handleImageFocus(
                                      IMGURL + val.main_image_url
                                    );
                                  }}
                                  onError={() => {
                                    setEquipmentMachines((prevState) => {
                                      return prevState.map((val, index2) => {
                                        if (index2 === index) {
                                          return { ...val, main_image_url: "" };
                                        }
                                        return val;
                                      });
                                    });
                                  }}
                                  // borderRadius={"100%"}
                                  src={IMGURL + val.main_image_url}
                                ></Image>
                              ) : (
                                <Flex
                                  justify={"center"}
                                  alignItems={"center"}
                                  h={"40px"}
                                  w={"40px"}
                                  bg={"#848484"}
                                  cursor={"pointer"}
                                  onClick={() => {
                                    handleImageFocus("");
                                  }}
                                >
                                  <FaTools />
                                </Flex>
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
                        <Flex
                          display={"inline-block"}
                          overflow={"hidden"}
                          textOverflow={"ellipsis"}
                          maxW={"200px"}
                          whiteSpace={"nowrap"}
                        >
                          {val.custom_machine_id}
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
                          maxW={"200px"}
                          whiteSpace={"nowrap"}
                        >
                          {val.serial_number || "-"}
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
                          {val.location}
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
                          <EquipmentMachineMenu
                            pageModule={pageModule}
                            handleOpenEquipmentMachineDetailsModal={
                              handleOpenEquipmentMachineDetailsModal
                            }
                            deleteEquipmentMachine={deleteEquipmentMachine}
                            handleOpenDeleteEquipmentMachineModal={
                              handleOpenDeleteEquipmentMachineModal
                            }
                            val={val}
                          />
                        </Flex>
                      </Td>
                    </Tr>
                  );
                })
              ) : (
                <ListEmptyState
                  colSpan={7}
                  header1={"No equipment/machine found."}
                  header2={
                    canCreate
                      ? "to begin tracking them."
                      : "Equipment and machines will appear here when available."
                  }
                  linkText={"Create a new equipment/machine"}
                  link={canCreate ? "/equipment-machine/create" : ""}
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
        variant={"equipment/machines"}
        pageModule={pageModule}
        resetFunction={resetSelected}
        selectedUID={selectedUID}
        deleteSelectedFunction={deleteSelected}
        deleteSelectedButtonLoading={deleteSelectedButtonLoading}
        deleteSelectedDisclosure={deleteSelectedMachineDisclosure}
      />
      <DeleteEquipmentMachineConfirmationModal
        deleteButtonLoading={deleteButtonLoading}
        deleteEquipmentMachine={deleteEquipmentMachine}
        selectedDeleteMachineUID={selectedDeleteMachineUID}
        onClose={deleteMachineDisclosure.onClose}
        isOpen={deleteMachineDisclosure.isOpen}
      />
      <EquipmentMachineDetailsModal
        selectedEquipmentMachineDetails={selectedEquipmentMachineDetails}
        onClose={equipmentMachineDetailsDisclosure.onClose}
        isOpen={equipmentMachineDetailsDisclosure.isOpen}
      />
      <ImageFocusOverlay
        imageFocusDisclosure={imageFocusDisclosure}
        imageFocusURL={imageFocusURL}
      />
    </Flex>
  );
}
