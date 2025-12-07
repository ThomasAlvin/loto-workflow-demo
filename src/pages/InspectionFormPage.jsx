import {
  Box,
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
  Tag,
  TagLabel,
  useDisclosure,
} from "@chakra-ui/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { IoMdSearch } from "react-icons/io";
import { FaEllipsis, FaPlus, FaWrench } from "react-icons/fa6";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Grid, GridItem } from "@chakra-ui/react";
import { FaRegTrashAlt } from "react-icons/fa";
import { HiMiniEllipsisHorizontal } from "react-icons/hi2";
import CreateInspectionFormModal from "../components/MachineInspectionForms/CreateInspectionFormModal";
import { api } from "../api/api";
import InspectionFormDetailsModal from "../components/MachineInspectionForms/InspectionFormDetailsModal";
import moment from "moment";
import EditInspectionFormModal from "../components/MachineInspectionForms/EditInspectionFormModal";
import ImportListModal from "../components/ImportListModal";
import { debounce } from "lodash";
import SelectedActionBar from "../components/SelectedActionBar";
import Swal from "sweetalert2";
import DeleteInspectionFormConfirmationModal from "../components/MachineInspectionForms/DeleteInspectionFormConfirmationModal";
import SwalErrorMessages from "../components/SwalErrorMessages";
import ListEmptyState from "../components/ListEmptyState";
import { useSelector } from "react-redux";
import UrlBasedPagination from "../components/UrlBasedPagination";
import Can from "../components/Can";

export default function InspectionFormPage() {
  const pageModule = "equipment_machines";
  const userSelector = useSelector((state) => state.login.auth);
  const abortControllerRef = useRef(new AbortController()); // Persistent controller
  const [searchParams, setSearchParams] = useSearchParams();
  const woUID = searchParams.get("wo_UID");

  const [inspectionForms, setInspectionForms] = useState([]);
  const [tableLoading, setTableLoading] = useState(true);
  const [categorySelection, setCategorySelection] = useState([]);
  const [selectionLoading, setSelectionLoading] = useState(false);
  const [from, setFrom] = useState();
  const [showing, setShowing] = useState(0);
  const [totalPages, setTotalPages] = useState(null);
  const currentPage = totalPages
    ? Math.min(Number(searchParams.get("page")) || 1, totalPages)
    : Number(searchParams.get("page")) || 1;
  const searchFilter = searchParams.get("search") || "";

  const rows = searchParams.get("rows") || 10;
  const [selectedUID, setSelectedUID] = useState([]);
  const [deleteButtonLoading, setDeleteButtonLoading] = useState(false);
  const [deleteSelectedButtonLoading, setDeleteSelectedButtonLoading] =
    useState(false);
  const [selectedDeleteInspectionFormUID, setSelectedDeleteInspectionFormUID] =
    useState("");
  const deleteInspectionFormDisclosure = useDisclosure();
  const deleteSelectedInspectionFormDisclosure = useDisclosure();
  const createInspectionFormDisclosure = useDisclosure();
  const checkedOnPage = selectedUID.filter((uid) =>
    inspectionForms.map((inspectionForm) => inspectionForm.UID).includes(uid)
  );
  const allChecked =
    checkedOnPage.length ===
      inspectionForms.map((inspectionForm) => inspectionForm.UID).length &&
    inspectionForms.map((inspectionForm) => inspectionForm.UID).length > 0;

  const isIndeterminate = checkedOnPage.length > 0 && !allChecked;

  const nav = useNavigate();

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
        const newItems = inspectionForms
          .map((lock) => lock.UID)
          .filter((uid) => !prevState.includes(uid)); // Avoid duplicates
        return [...prevState, ...newItems];
      });
    } else {
      setSelectedUID((prevState) =>
        prevState.filter(
          (uid) => !inspectionForms.some((lock) => lock.UID === uid)
        )
      );
    }
  }
  function resetSelected(e) {
    setSelectedUID([]);
  }

  function handleOpenDeleteInspectionFormModal(UID) {
    deleteInspectionFormDisclosure.onOpen();
    setSelectedDeleteInspectionFormUID(UID);
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
  async function deleteInspectionForm(UID) {
    setDeleteButtonLoading(true);
    await api
      .delete(`inspection-form/${UID}`)
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
        fetchInspectionForms();
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
        setDeleteButtonLoading(false);
        deleteInspectionFormDisclosure.onClose();
      });
  }
  async function deleteSelected() {
    setDeleteSelectedButtonLoading(true);
    await api
      .delete(`inspection-form`, {
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
        fetchInspectionForms();
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
        deleteSelectedInspectionFormDisclosure.onClose();
      });
  }
  async function fetchInspectionForms() {
    setTableLoading(true);
    await api
      .get(
        `inspection-form/pagination?search=${searchFilter}&page=${currentPage}&rows=${rows}`,
        { signal: abortControllerRef.current.signal }
      )
      .then((response) => {
        setInspectionForms(response.data.data);
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
  async function fetchMachineCategory(controller) {
    setSelectionLoading(true);
    await api
      .get(`machine-category`, { signal: controller.signal })
      .then((response) => {
        setCategorySelection(
          response?.data?.machineCategory.map((category) => ({
            id: category.id,
            value: category.name,
            label: category.name,
            newCategory: false,
          }))
        );
      })
      .catch((error) => {
        console.log(error);
      })
      .finally(() => {
        setSelectionLoading(false);
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

  function hasCreateInspectionFormPermission() {
    const modulePermissions = userSelector.permissions?.find(
      (perm) => perm.name === "inspection_forms"
    );
    return (
      modulePermissions?.permissions.some(
        (perm) => perm.permission === "manage"
      ) || userSelector.is_superadmin
    );
  }
  useEffect(() => {
    if (woUID) {
      createInspectionFormDisclosure.onOpen();
    }
    const controller = new AbortController();
    fetchMachineCategory(controller);

    return () => {
      controller.abort();
    };
  }, []);
  useEffect(() => {
    abortControllerRef.current = new AbortController();
    fetchInspectionForms();
    return () => {
      abortControllerRef.current.abort(); // Cleanup on unmount
    };
  }, [searchFilter, rows, currentPage]);
  return (
    <>
      <Flex w={"100%"} flexDir={"column"} px={"30px"} py={"20px"} gap={"20px"}>
        <Flex fontSize={"28px"} color={"#dc143c"} fontWeight={700}>
          Inspection Form List
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
                    <Flex>Add Inspection Form</Flex>
                  </Flex>
                </MenuButton>
                <MenuList bg={"#f8f9fa"} py={0}>
                  <MenuGroup title="Select Method" px={"0px"} color={"crimson"}>
                    <MenuItem onClick={createInspectionFormDisclosure.onOpen}>
                      <Flex alignItems={"center"} gap={"10px"}>
                        <Flex fontSize={"18px"}>
                          <FaPlus />
                        </Flex>
                        <Flex>Add Inspection Form manually</Flex>
                      </Flex>
                    </MenuItem>

                    <ImportListModal
                      variant={"Inspection Form"}
                      submitImportRoute={"inspection-form/import"}
                      fetchDataFunction={fetchInspectionForms}
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
                  placeholder="Search inspection forms..."
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
          <Flex flexDir={"column"} justifyContent={"center"}>
            <Grid
              w={"100%"}
              templateColumns={
                !hasCreateInspectionFormPermission() && !inspectionForms.length
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
              {inspectionForms.length ? (
                inspectionForms.map((val, index) => (
                  <GridItem key={index}>
                    <Flex
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
                      p={"15px"}
                      gap={"15px"}
                    >
                      <Flex
                        w={"100%"}
                        h={"100%"}
                        flexDir={"column"}
                        gap={"20px"}
                        //   justify={"space-between"}
                      >
                        <Flex justify={"space-between"}>
                          <Flex
                            bg={"black"}
                            p={"15px"}
                            borderRadius={"100%"}
                            color={"white"}
                            alignItems={"center"}
                            justify={"center"}
                            fontSize={"28px"}
                          >
                            <FaWrench />
                          </Flex>
                          <Flex
                            height={"fit-content"}
                            gap={"10px"}
                            fontSize={"24px"}
                            alignItems={"center"}
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
                                    <InspectionFormDetailsModal
                                      inspectionForm={val}
                                    />
                                    <Can
                                      module={pageModule}
                                      permission={["manage"]}
                                    >
                                      <EditInspectionFormModal
                                        inspectionForm={val}
                                        categorySelection={categorySelection}
                                        setCategorySelection={
                                          setCategorySelection
                                        }
                                        fetchInspectionForms={
                                          fetchInspectionForms
                                        }
                                        isEdit={true}
                                        abortControllerRef={abortControllerRef}
                                        selectionLoading={selectionLoading}
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
                                          handleOpenDeleteInspectionFormModal(
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
                        <Flex flexDir={"column"} gap={"10px"}>
                          <Flex flexDir={"column"}>
                            <Flex fontSize={"20px"} fontWeight={700}>
                              {val.name}
                            </Flex>

                            <Flex fontSize={"14px"} color={"#848484"}>
                              {val.description || "No description available."}
                            </Flex>
                          </Flex>
                          <Flex w={"100%"} gap={"5px"} flexDir={"column"}>
                            <Flex fontWeight={700} fontSize={"14px"}>
                              Questions:
                            </Flex>
                            {val.inspection_questions
                              .slice(0, 2)
                              .map((item, index) => (
                                <Flex
                                  key={index}
                                  bg={"white"}
                                  w={"100%"}
                                  px={"8px"}
                                  py={"4px"}
                                  fontSize={"14px"}
                                  boxShadow={"0px 0px 3px rgba(50,50,93,0.5)"}
                                >
                                  <Box
                                    as="span"
                                    color={"crimson"}
                                    fontWeight={700}
                                  >
                                    {index + 1}.
                                  </Box>
                                  &nbsp;{" "}
                                  {item.question.length > 50
                                    ? item.question.slice(0, 50) + " ..."
                                    : item.question}
                                </Flex>
                              ))}
                            {val.inspection_questions.length > 2 && (
                              <Flex fontSize={"20px"} color={"#848484"}>
                                <HiMiniEllipsisHorizontal />
                              </Flex>
                            )}
                          </Flex>
                          <Flex gap={"5px"} flexDir={"column"}>
                            <Flex fontWeight={700} fontSize={"14px"}>
                              Categories:
                            </Flex>
                            <Flex flexDir={"column"} gap={"10px"}>
                              <Flex
                                flexWrap={"wrap"}
                                color={"#848484"}
                                gap={"5px"}
                              >
                                {val.category.length > 0 ? (
                                  val.category.map((item, index) => (
                                    <Tag
                                      cursor={"pointer"}
                                      _hover={{ bg: "#dedede" }}
                                      transition={"background 0.2s ease-in-out"}
                                      onClick={() => {
                                        nav(
                                          "/machine-categories?search=" +
                                            item?.name
                                        );
                                      }}
                                      key={index}
                                      size={"sm"}
                                      borderRadius="full"
                                      variant="solid"
                                      bg={"#f8f9fa"}
                                      color={"#848484"}
                                      border={"#848484 1px solid"}
                                      gap={"5px"}
                                      alignItems={"center"}
                                    >
                                      <Flex
                                        minW={"6px"}
                                        minH={"6px"}
                                        bg={"#848484"}
                                        borderRadius={"100%"}
                                      ></Flex>
                                      <TagLabel>{item.name}</TagLabel>
                                    </Tag>
                                  ))
                                ) : (
                                  <Flex color={"#848484"} fontSize={"14px"}>
                                    No categories selected.
                                  </Flex>
                                )}
                              </Flex>
                              <Flex>
                                <Can
                                  module={pageModule}
                                  permission={["manage"]}
                                >
                                  <EditInspectionFormModal
                                    inspectionForm={val}
                                    categorySelection={categorySelection}
                                    setCategorySelection={setCategorySelection}
                                    fetchInspectionForms={fetchInspectionForms}
                                    isEdit={false}
                                    abortControllerRef={abortControllerRef}
                                    selectionLoading={selectionLoading}
                                  />
                                </Can>
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
                          Updated {moment(val.updated_at).fromNow()}
                        </Flex>
                      </Flex>
                    </Flex>
                  </GridItem>
                ))
              ) : hasCreateInspectionFormPermission() ? (
                <>
                  <Can module={pageModule} permission={["manage"]}>
                    <GridItem>
                      <Flex
                        onClick={createInspectionFormDisclosure.onOpen}
                        bg={"#f8f9fa"}
                        p={"20px"}
                        boxShadow={"0px 0px 3px rgba(50,50,93,0.5)"}
                        h={"100%"}
                        w={"100%"}
                        minH={"355px"}
                        flexDir={"column"}
                        gap={"20px"}
                        justify={"center"}
                        alignItems={"center"}
                        cursor={"pointer"}
                        transition={"background ease-in-out 0.2s"}
                        _hover={{ bg: "#ededed", color: "black" }}
                        //   justify={"space-between"}
                      >
                        <Flex fontSize={"60px"}>
                          <FaPlus />
                        </Flex>
                        <Flex flexDir={"column"} alignItems={"center"}>
                          <Flex fontSize={"20px"} fontWeight={700}>
                            Add New Inspection Form
                          </Flex>
                          <Flex
                            fontSize={"14px"}
                            color={"#848484"}
                            textAlign={"center"}
                          >
                            Click to start creating a customized form for your
                            inspection needs.
                          </Flex>
                        </Flex>
                      </Flex>
                      {/* <CreateInspectionFormModal
                      variant={"card"}
                      fetchInspectionForms={fetchInspectionForms}
                      abortControllerRef={abortControllerRef}
                      categorySelection={categorySelection}
                      setCategorySelection={setCategorySelection}
                    /> */}
                    </GridItem>
                  </Can>
                </>
              ) : (
                ""
              )}
            </Grid>
            {!inspectionForms?.length &&
            !hasCreateInspectionFormPermission() ? (
              <ListEmptyState
                colSpan={6}
                header1={"No inspection form found."}
                header2={"to begin tracking them."}
                linkText={"Create an inspection form"}
                isTable={false}
              />
            ) : (
              ""
            )}
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
          variant={"inspection forms"}
          pageModule={pageModule}
          resetFunction={resetSelected}
          selectedUID={selectedUID}
          deleteSelectedFunction={deleteSelected}
          deleteSelectedButtonLoading={deleteSelectedButtonLoading}
          deleteSelectedDisclosure={deleteSelectedInspectionFormDisclosure}
        />
        <DeleteInspectionFormConfirmationModal
          deleteButtonLoading={deleteButtonLoading}
          deleteInspectionForm={deleteInspectionForm}
          selectedDeleteInspectionFormUID={selectedDeleteInspectionFormUID}
          onClose={deleteInspectionFormDisclosure.onClose}
          isOpen={deleteInspectionFormDisclosure.isOpen}
        />
        <CreateInspectionFormModal
          onClose={createInspectionFormDisclosure.onClose}
          isOpen={createInspectionFormDisclosure.isOpen}
          fetchInspectionForms={fetchInspectionForms}
          abortControllerRef={abortControllerRef}
          categorySelection={categorySelection}
          woUID={woUID}
          setCategorySelection={setCategorySelection}
          selectionLoading={selectionLoading}
        />
      </Flex>
    </>
  );
}
