import {
  Button,
  Center,
  Checkbox,
  Flex,
  Grid,
  GridItem,
  Input,
  InputGroup,
  InputLeftElement,
  Menu,
  MenuButton,
  MenuGroup,
  MenuItem,
  MenuList,
  Spinner,
  Tag,
  TagLabel,
  useDisclosure,
} from "@chakra-ui/react";
import { FaPlus, FaRegTrashAlt, FaTools } from "react-icons/fa";
import { useCallback, useEffect, useRef, useState } from "react";
import { api } from "../api/api";
import { useNavigate, useSearchParams } from "react-router-dom";
import { IoMdSearch } from "react-icons/io";
import Swal from "sweetalert2";
import CreateMachineCategoryModal from "../components/MachineCategories/CreateMachineCategoryModal";
import EditMachineCategoryModal from "../components/MachineCategories/EditMachineCategoryModal";
import { FaEllipsis } from "react-icons/fa6";
import { HiMiniEllipsisHorizontal } from "react-icons/hi2";
import moment from "moment";
import ImportListModal from "../components/ImportListModal";
import { debounce } from "lodash";
import SelectedActionBar from "../components/SelectedActionBar";
import DeleteMachineCategoryConfirmationModal from "../components/MachineCategories/DeleteMachineCategoryConfirmationModal";
import SwalErrorMessages from "../components/SwalErrorMessages";
import { useSelector } from "react-redux";
import ListEmptyState from "../components/ListEmptyState";
import UrlBasedPagination from "../components/UrlBasedPagination";
import Can from "../components/Can";
export default function MachineCategoryPage() {
  const pageModule = "equipment_machines";
  const [searchParams, setSearchParams] = useSearchParams();
  const userSelector = useSelector((state) => state.login.auth);
  const abortControllerRef = useRef(new AbortController()); // Persistent controller
  const [from, setFrom] = useState();
  const [showing, setShowing] = useState(0);
  const [totalPages, setTotalPages] = useState(null);
  const [machineCategories, setMachineCategories] = useState([]);
  const currentPage = totalPages
    ? Math.min(Number(searchParams.get("page")) || 1, totalPages)
    : Number(searchParams.get("page")) || 1;
  const searchFilter = searchParams.get("search") || "";

  const rows = searchParams.get("rows") || 10;
  const [tableLoading, setTableLoading] = useState(true);
  const [inspectionFormSelection, setInspectionFormSelection] = useState([]);
  const [selectedUID, setSelectedUID] = useState([]);
  const [deleteButtonLoading, setDeleteButtonLoading] = useState(false);
  const [deleteSelectedButtonLoading, setDeleteSelectedButtonLoading] =
    useState(false);
  const [
    selectedDeleteMachineCategoryUID,
    setSelectedDeleteMachineCategoryUID,
  ] = useState("");
  const deleteMachineCategoryDisclosure = useDisclosure();
  const deleteSelectedMachineCategoryDisclosure = useDisclosure();

  const nav = useNavigate();
  const checkedOnPage = selectedUID.filter((uid) =>
    machineCategories
      .map((machineCategory) => machineCategory.UID)
      .includes(uid)
  );
  const allChecked =
    checkedOnPage.length ===
      machineCategories.map((machineCategory) => machineCategory.UID).length &&
    machineCategories.map((machineCategory) => machineCategory.UID).length > 0;

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
        const newItems = machineCategories
          .map((lock) => lock.UID)
          .filter((uid) => !prevState.includes(uid)); // Avoid duplicates
        return [...prevState, ...newItems];
      });
    } else {
      setSelectedUID((prevState) =>
        prevState.filter(
          (uid) => !machineCategories.some((lock) => lock.UID === uid)
        )
      );
    }
  }
  function handleOpenDeleteMachineCategoryModal(UID) {
    deleteMachineCategoryDisclosure.onOpen();
    setSelectedDeleteMachineCategoryUID(UID);
  }
  function resetSelected(e) {
    setSelectedUID([]);
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
  async function fetchMachineCategory() {
    setTableLoading(true);
    await api
      .getMachineCategoryPagination()
      .then((response) => {
        setMachineCategories(response?.data?.data);
        setFrom(response?.data?.from);
        setTotalPages(response?.data?.last_page);
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
  async function deleteMachineCategory(UID) {
    setDeleteButtonLoading(true);
    await api
      .testSubmit("Machine category deleted successfully")
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
        fetchMachineCategory();
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
        deleteMachineCategoryDisclosure.onClose();
        setDeleteButtonLoading(false);
      });
  }
  async function deleteSelected() {
    setDeleteSelectedButtonLoading(true);
    await api
      .testSubmit("Selected machine category deleted successfully")
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
        fetchMachineCategory();
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
        deleteSelectedMachineCategoryDisclosure.onClose();
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

  async function fetchInspectionForms(controller) {
    await api
      .getInspectionForms()
      .then((response) => {
        setInspectionFormSelection(
          response?.data?.inspectionForms.map((inspectionForm) => ({
            id: inspectionForm.id,
            value: inspectionForm,
            label: inspectionForm.name,
          }))
        );
      })
      .catch((error) => {
        console.log(error);
      });
  }

  function hasCreateMachineCategoryPermission() {
    const modulePermissions = userSelector.permissions?.find(
      (perm) => perm.name === "machine_categories"
    );
    return modulePermissions?.permissions.some(
      (perm) => perm.permission === "manage"
    );
  }
  useEffect(() => {
    const controller = new AbortController();
    abortControllerRef.current = new AbortController();
    fetchInspectionForms(controller);
    fetchMachineCategory();
    return () => {
      controller.abort();
      abortControllerRef.current.abort(); // Cleanup on unmount
    };
  }, [searchFilter, currentPage, rows]);
  return (
    <>
      <Flex w={"100%"} flexDir={"column"} px={"30px"} py={"20px"} gap={"20px"}>
        <Flex fontSize={"28px"} color={"#dc143c"} fontWeight={700}>
          Machine Categories List
        </Flex>
        <Flex h={"2px"} bg={"#bababa"}></Flex>

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
                    <Flex>Add Machine Category</Flex>
                  </Flex>
                </MenuButton>
                <MenuList bg={"#f8f9fa"} py={0}>
                  <MenuGroup title="Select Method" px={"0px"} color={"crimson"}>
                    <CreateMachineCategoryModal
                      fetchMachineCategory={fetchMachineCategory}
                      inspectionFormSelection={inspectionFormSelection}
                      abortControllerRef={abortControllerRef}
                    />

                    <ImportListModal
                      variant={"Machine Category"}
                      submitImportRoute={"machine-category/import"}
                      fetchDataFunction={fetchMachineCategory}
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
                  placeholder="Search machine category..."
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
          <>
            <Grid
              w={"100%"}
              templateColumns={
                !hasCreateMachineCategoryPermission() &&
                !machineCategories.length
                  ? "repeat(1, 1fr)"
                  : {
                      base: "repeat(1, 1fr)",
                      sm: "repeat(2, 1fr)",
                      md: "repeat(3, 1fr)",
                      lg: "repeat(3, 1fr)",
                      xl: "repeat(3, 1fr)",
                    }
              }
              gap={{ sm: 6 }}
            >
              {machineCategories.length ? (
                machineCategories.map((val, index) => (
                  <>
                    <GridItem key={index}>
                      <Flex
                        // aspectRatio={16 / 9}
                        bg={"#f8f9fa"}
                        boxShadow={"0px 0px 3px rgba(50,50,93,0.5)"}
                        outline={
                          selectedUID.includes(val.UID)
                            ? "2px solid rgb(114, 213, 255)"
                            : "none"
                        }
                        flexDir={"column"}
                        justify={"space-between"}
                        h={"100%"}
                        // w={"100%"}
                        p={"15px"}
                        gap={"15px"}
                      >
                        <Flex
                          w={"100%"}
                          h={"100%"}
                          flexDir={"column"}
                          gap={"10px"}
                          //   justify={"space-between"}
                        >
                          <Flex minH={"72px"} justify={"space-between"}>
                            <Flex gap={"10px"} alignItems={"center"}>
                              <Flex
                                bg={"black"}
                                p={"15px"}
                                borderRadius={"100%"}
                                color={"white"}
                                alignItems={"center"}
                                justify={"center"}
                                fontSize={"28px"}
                              >
                                <FaTools />
                              </Flex>
                              <Flex flexDir={"column"}>
                                <Flex fontSize={"20px"} fontWeight={700}>
                                  {val.name}
                                </Flex>
                                <Flex fontSize={"14px"} color={"#848484"}>
                                  {val.description ? (
                                    val.description.length > 60 ? (
                                      val?.description?.slice(0, 60) + "..."
                                    ) : (
                                      val?.description
                                    )
                                  ) : (
                                    <>
                                      No description available.
                                      <br />
                                      <div></div>
                                    </>
                                  )}
                                </Flex>
                              </Flex>
                            </Flex>
                            <Flex
                              gap={"10px"}
                              height={"fit-content"}
                              alignItems={"center"}
                              fontSize={"24px"}
                            >
                              <Can module={pageModule} permission={["manage"]}>
                                <Flex
                                  cursor={"pointer"}
                                  _hover={{ color: "#707070" }}
                                  transition={"background ease-in-out 0.2s"}
                                  alignItems={"center"}
                                  justify={"center"}
                                  h={"32px"}
                                  aspectRatio={1}
                                  borderRadius={"100%"}
                                  color={"#A6A7AC"}
                                  fontSize={"16px"}
                                >
                                  <Menu placement="bottom">
                                    <MenuButton p={0} fontSize={"24px"}>
                                      <FaEllipsis />
                                    </MenuButton>

                                    <MenuList>
                                      <Can
                                        module={pageModule}
                                        permission={["manage"]}
                                      >
                                        <EditMachineCategoryModal
                                          fetchMachineCategory={
                                            fetchMachineCategory
                                          }
                                          inspectionFormSelection={
                                            inspectionFormSelection
                                          }
                                          abortControllerRef={
                                            abortControllerRef
                                          }
                                          val={val}
                                          layout={"menu"}
                                        />
                                      </Can>
                                      <Can
                                        module={pageModule}
                                        permission={["manage"]}
                                      >
                                        <MenuItem
                                          color={"crimson"}
                                          icon={<FaRegTrashAlt />}
                                          onClick={() => {
                                            handleOpenDeleteMachineCategoryModal(
                                              val.UID
                                            );
                                          }}
                                        >
                                          Delete
                                        </MenuItem>
                                      </Can>
                                    </MenuList>
                                  </Menu>
                                </Flex>
                              </Can>
                              <Flex alignItems={"start"}>
                                <Checkbox
                                  size={"lg"}
                                  bg={"white"}
                                  id={val.UID}
                                  isChecked={selectedUID.includes(val.UID)}
                                  onChange={handleCheckbox}
                                ></Checkbox>
                              </Flex>
                            </Flex>
                          </Flex>
                          <Flex h={"1px"} bg={"#848484"}></Flex>
                          <Flex flexDir={"column"} gap={"10px"}>
                            <Flex gap={"5px"} flexDir={"column"}>
                              <Flex fontWeight={700} fontSize={"14px"}>
                                Associated Machines :
                              </Flex>
                              <Flex flexDir={"column"} gap={"10px"}>
                                <Flex
                                  flexWrap={"wrap"}
                                  color={"#848484"}
                                  gap={"5px"}
                                >
                                  {val.machine_category.length > 0 ? (
                                    <>
                                      {val.machine_category
                                        .slice(0, 8)
                                        .map((item, index) => (
                                          <Tag
                                            cursor={"pointer"}
                                            _hover={{ bg: "black" }}
                                            transition={
                                              "background 0.2s ease-in-out"
                                            }
                                            onClick={() => {
                                              nav(
                                                "/equipment-machine?search=" +
                                                  item?.machine?.name
                                              );
                                            }}
                                            key={index}
                                            size={"sm"}
                                            borderRadius="full"
                                            variant="solid"
                                            bg={"#848484"}
                                            color={"#f8f9fa"}
                                            overflow="hidden"
                                            textOverflow="ellipsis"
                                            whiteSpace="nowrap"
                                            gap={"5px"}
                                          >
                                            <Flex
                                              minW={"6px"}
                                              minH={"6px"}
                                              bg={"white"}
                                              borderRadius={"100%"}
                                            ></Flex>
                                            <TagLabel>
                                              {item?.machine?.name}
                                            </TagLabel>
                                          </Tag>
                                        ))}
                                      {val.machine_category.length > 8 && (
                                        <Tag
                                          size={"sm"}
                                          borderRadius="full"
                                          variant="solid"
                                          bg={"#f8f9fa"}
                                          color={"#848484"}
                                          border={"#848484 1px solid"}
                                        >
                                          <HiMiniEllipsisHorizontal />
                                        </Tag>
                                      )}
                                    </>
                                  ) : (
                                    <Flex color="#848484" fontSize="14px">
                                      No machines assigned to this category.
                                    </Flex>
                                  )}
                                </Flex>
                              </Flex>
                            </Flex>
                            <Flex gap={"5px"} flexDir={"column"}>
                              <Flex fontWeight={700} fontSize={"14px"}>
                                Inspection Forms :
                              </Flex>
                              <Flex flexDir={"column"} gap={"10px"}>
                                <Flex
                                  flexWrap={"wrap"}
                                  color={"#848484"}
                                  gap={"5px"}
                                >
                                  {val.inspection_forms.length > 0 ? (
                                    <>
                                      {val.inspection_forms
                                        .slice(0, 8)
                                        .map((item, index) => (
                                          <Tag
                                            cursor={"pointer"}
                                            _hover={{ bg: "#dedede" }}
                                            transition={
                                              "background 0.2s ease-in-out"
                                            }
                                            onClick={() => {
                                              nav(
                                                "/inspection-form?search=" +
                                                  item?.name
                                              );
                                            }}
                                            key={index}
                                            size={"sm"}
                                            borderRadius="full"
                                            variant="solid"
                                            bg={"#f8f9fa"}
                                            border={"1px solid #848484"}
                                            color={"#848484"}
                                            overflow="hidden"
                                            textOverflow="ellipsis"
                                            whiteSpace="nowrap"
                                            gap={"5px"}
                                          >
                                            <Flex
                                              minW={"6px"}
                                              minH={"6px"}
                                              bg={"#848484"}
                                              borderRadius={"100%"}
                                            ></Flex>
                                            <TagLabel>{item?.name}</TagLabel>
                                          </Tag>
                                        ))}
                                      {val.inspection_forms.length > 8 && (
                                        <Tag
                                          size={"sm"}
                                          borderRadius="full"
                                          variant="solid"
                                          bg={"#f8f9fa"}
                                          color={"#848484"}
                                          border={"#848484 1px solid"}
                                        >
                                          <HiMiniEllipsisHorizontal />
                                        </Tag>
                                      )}
                                    </>
                                  ) : (
                                    <Flex color="#848484" fontSize="14px">
                                      No inspection forms assigned to this
                                      category.
                                    </Flex>
                                  )}
                                </Flex>
                              </Flex>
                            </Flex>
                          </Flex>
                        </Flex>

                        <Flex
                          alignItems={"center"}
                          fontSize={"14px"}
                          gap={"10px"}
                          color={"#bababa"}
                        >
                          <Flex fontSize={"14px"}>
                            {moment(val.created_at).format(
                              "DD MMMM YYYY | hh:mm A"
                            )}
                          </Flex>
                        </Flex>
                      </Flex>
                    </GridItem>
                  </>
                ))
              ) : hasCreateMachineCategoryPermission() ? (
                <Can module={pageModule} permission={["manage"]}>
                  <CreateMachineCategoryModal
                    fetchMachineCategory={fetchMachineCategory}
                    inspectionFormSelection={inspectionFormSelection}
                    layout={"card"}
                    abortControllerRef={abortControllerRef}
                  />
                </Can>
              ) : (
                ""
              )}
            </Grid>
            {machineCategories.length ? (
              ""
            ) : (
              <ListEmptyState
                colSpan={6}
                header1={"No machine category found."}
                header2={"to begin tracking them."}
                linkText={"Create a machine category"}
                isTable={false}
              />
            )}
          </>
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
          variant={"machine categories"}
          pageModule={pageModule}
          resetFunction={resetSelected}
          selectedUID={selectedUID}
          deleteSelectedFunction={deleteSelected}
          deleteSelectedButtonLoading={deleteSelectedButtonLoading}
          deleteSelectedDisclosure={deleteSelectedMachineCategoryDisclosure}
        />
        <DeleteMachineCategoryConfirmationModal
          deleteButtonLoading={deleteButtonLoading}
          deleteMachineCategory={deleteMachineCategory}
          selectedDeleteMachineCategoryUID={selectedDeleteMachineCategoryUID}
          onClose={deleteMachineCategoryDisclosure.onClose}
          isOpen={deleteMachineCategoryDisclosure.isOpen}
        />
      </Flex>
    </>
  );
}
