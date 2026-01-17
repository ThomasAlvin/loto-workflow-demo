import {
  Button,
  Center,
  Checkbox,
  Flex,
  Input,
  InputGroup,
  InputLeftElement,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Spinner,
  Table,
  TableContainer,
  Tbody,
  useDisclosure,
} from "@chakra-ui/react";
import { IoNotificationsSharp } from "react-icons/io5";
import { useCallback, useEffect, useRef, useState } from "react";
import { api } from "../api/api";
import { debounce } from "lodash";
import { IoMdSearch } from "react-icons/io";
import ListEmptyState from "../components/ListEmptyState";
import Pagination from "../components/Pagination";
import Swal from "sweetalert2";
import NotificationCard from "../components/Notification/NotificationCard";
import NotificationMarkAllAsReadConfirmationModal from "../components/Notification/NotificationMarkAllAsReadConfirmationModal";
import { useNotifications } from "../service/NotificationContext";
import SwalErrorMessages from "../components/SwalErrorMessages";
import tinycolor from "tinycolor2";
import { FaFilter, FaMapLocationDot } from "react-icons/fa6";
import { FaRegTrashAlt } from "react-icons/fa";
import { useSearchParams } from "react-router-dom";
import SelectedActionBar from "../components/SelectedActionBar";
import ConfirmationModal from "../components/ConfirmationModal";

export default function NotificationPage() {
  const abortControllerRef = useRef(new AbortController()); // Persistent controller
  const abortControllerRef2 = useRef(new AbortController()); // Persistent controller
  const [searchParams] = useSearchParams();
  const initialWorkSiteFilter = {
    UID: searchParams.get("workSiteUID") || "",
    name: searchParams.get("workSiteName") || "",
  };
  const isFirstRender = useRef(true);
  const {
    notifications,
    setNotifications,
    notificationsPagination,
    setNotificationsPagination,
    newNotificationsCount,
    setNewNotificationsCount,
    notificationLoading,
    setNotificationLoading,
    fetchNotification,
    markAllAsRead,
  } = useNotifications();
  const [workSiteLoading, setWorkSiteLoading] = useState([]);
  const [workSiteSelection, setWorkSiteSelection] = useState([]);
  const [workSiteFilter, setWorkSiteFilter] = useState(initialWorkSiteFilter);
  const [searchInput, setSearchInput] = useState("");
  const [typeFilter, setTypeFilter] = useState(null);
  const [deleteButtonLoading, setDeleteButtonLoading] = useState(false);
  const [selectedDeleteNotificationUID, setSelectedDeleteNotificationUID] =
    useState(false);
  const [deleteSelectedButtonLoading, setDeleteSelectedButtonLoading] =
    useState("");
  const [selectedUID, setSelectedUID] = useState([]);

  const deleteNotificationDisclosure = useDisclosure();
  const deleteSelectedNotificationDisclosure = useDisclosure();
  const debouncedSearch = useCallback(
    debounce((value) => {
      setSearchInput((prevState) => {
        if (prevState === value) {
          setNotificationLoading(false);
        }
        return value;
      });
      setNotificationsPagination((prevState) => ({
        ...prevState,
        currentPage: 1,
      }));
    }, 1000),
    [],
  );
  function customSetCurrentPage(updater) {
    setNotificationsPagination((prevState) => ({
      ...prevState,
      currentPage:
        typeof updater === "function"
          ? updater(prevState.currentPage)
          : updater,
    }));
  }
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
  function handleOpenDeleteNotificationModal(e, UID) {
    e.stopPropagation();
    deleteNotificationDisclosure.onOpen();
    setSelectedDeleteNotificationUID(UID);
  }

  async function fetchAndLoadNotifications() {
    const localAbortController = abortControllerRef.current;
    try {
      setNotificationLoading(true);
      const response = await fetchNotification(
        abortControllerRef.current.signal,
        searchInput,
        notificationsPagination.currentPage,
        notificationsPagination.rows,
        typeFilter,
        workSiteFilter,
      );
    } catch (error) {
      console.log(error);

      if (error.name === "CanceledError") {
        return;
      }
      Swal.fire({
        title: "Oops...",
        text: "An error occurred",
        icon: "error",
        customClass: {
          popup: "swal2-custom-popup",
          title: "swal2-custom-title",
          content: "swal2-custom-content",
          actions: "swal2-custom-actions",
          confirmButton: "swal2-custom-confirm-button",
        },
      });
    } finally {
      if (localAbortController === abortControllerRef.current) {
        setNotificationLoading(false); // This will run regardless of success or failure
      }
    }
  }

  function roleHandler(event) {
    const { id } = event.currentTarget;
    setTypeFilter(id);
    setNotificationsPagination((prevState) => ({
      ...prevState,
      currentPage: 1,
    }));
  }

  function handleChange(e) {
    const { value, id } = e.target;
    if (id === "row") {
      setNotificationsPagination((prevState) => ({
        ...prevState,
        rows: value,
      }));
    } else {
      debouncedSearch(value);
    }
  }
  function handleCheckbox(e) {
    const itemId = e.target.id;

    setSelectedUID(
      (prevState) =>
        e.target.checked
          ? [...prevState, itemId] // Add if checked
          : prevState.filter((id) => id !== itemId), // Remove if unchecked
    );
  }
  function handleCheckAll(e) {
    if (e.target.checked) {
      setSelectedUID((prevState) => {
        const newItems = notificationsPagination.data
          .map((notification) => notification.UID)
          .filter((uid) => !prevState.includes(uid)); // Avoid duplicates
        return [...prevState, ...newItems];
      });
    } else {
      setSelectedUID((prevState) =>
        prevState.filter(
          (uid) =>
            !notificationsPagination.data.some(
              (notification) => notification.UID === uid,
            ),
        ),
      );
    }
  }
  function resetSelected() {
    setSelectedUID([]);
  }
  async function deleteNotification() {
    setDeleteButtonLoading(true);
    await api
      .testSubmit("Notification successfully deleted")
      .then((response) => {
        Swal.fire({
          title: "Success!",
          text: response.data.message,
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
        console.log(error);
      })
      .finally(() => {
        setDeleteButtonLoading(false);
        deleteNotificationDisclosure.onClose();
      });
  }
  async function deleteSelected() {
    setDeleteSelectedButtonLoading(true);
    await api
      .testSubmit("Notification successfully deleted")
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
        deleteSelectedNotificationDisclosure.onClose();
      });
  }
  const checkedOnPage = selectedUID.filter((uid) =>
    notificationsPagination.data
      ?.map((notification) => notification.UID)
      .includes(uid),
  );
  const allChecked =
    checkedOnPage.length ===
      notificationsPagination.data?.map((notification) => notification.UID)
        .length &&
    notificationsPagination.data?.map((notification) => notification.UID)
      .length > 0;

  const isIndeterminate = checkedOnPage.length > 0 && !allChecked;

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
    }
    abortControllerRef.current = new AbortController();

    fetchAndLoadNotifications();
    return () => {
      abortControllerRef.current.abort(); // Cleanup on unmount
    };
  }, [
    searchInput,
    notificationsPagination.currentPage,
    notificationsPagination.rows,
    typeFilter,
    workSiteFilter,
  ]);
  useEffect(() => {
    abortControllerRef2.current = new AbortController();
    fetchWorkSites();
    return () => abortControllerRef2.current.abort(); // Cleanup on unmount
  }, []);

  return (
    <Flex w={"100%"} flexDir={"column"} px={"30px"} py={"20px"} gap={"20px"}>
      <Flex flexDir={"column"}>
        <Flex fontSize={"28px"} color={"#dc143c"} fontWeight={700}>
          Notifications
        </Flex>
      </Flex>
      <Flex fontWeight={700} borderBottom={"2px solid #bababa"}>
        <Flex
          cursor={"pointer"}
          borderBottom={!typeFilter ? "3px solid #dc143c" : ""}
          color={!typeFilter ? "black" : "#848484"}
          px={"10px"}
          py={"2px"}
          onClick={roleHandler}
          alignItems={"center"}
          gap={"5px"}
        >
          <Flex>All</Flex>
          {newNotificationsCount ? (
            <Flex
              w={"22px"}
              p={"2px"}
              fontWeight={700}
              borderRadius={"100%"}
              justify={"center"}
              alignItems={"center"}
              bg={"#db183f"}
              color={"white"}
              top={"-3px"}
              right={"-4px"}
              fontSize={"12px"}
            >
              {newNotificationsCount}
            </Flex>
          ) : (
            ""
          )}
        </Flex>
        <Flex
          id="1"
          cursor={"pointer"}
          borderBottom={typeFilter === "1" ? "3px solid #dc143c" : ""}
          color={typeFilter === "1" ? "black" : "#848484"}
          px={"10px"}
          py={"2px"}
          onClick={roleHandler}
          alignItems={"center"}
          gap={"5px"}
        >
          <Flex>Archived</Flex>
        </Flex>
        <Flex
          id="0"
          cursor={"pointer"}
          borderBottom={typeFilter === "0" ? "3px solid #dc143c" : ""}
          color={typeFilter === "0" ? "black" : "#848484"}
          px={"10px"}
          py={"2px"}
          onClick={roleHandler}
          alignItems={"center"}
          gap={"5px"}
        >
          <Flex>New</Flex>
          {newNotificationsCount ? (
            <Flex
              w={"22px"}
              p={"2px"}
              fontWeight={700}
              borderRadius={"100%"}
              justify={"center"}
              alignItems={"center"}
              bg={"#db183f"}
              color={"white"}
              top={"-3px"}
              right={"-4px"}
              fontSize={"12px"}
            >
              {newNotificationsCount}
            </Flex>
          ) : (
            ""
          )}
        </Flex>
      </Flex>
      <Flex alignItems={"center"} justify={"space-between"}>
        <Flex gap={"20px"} alignItems={"center"}>
          <Flex
            color={"#dc143c"}
            alignItems={"center"}
            gap={"5px"}
            fontWeight={700}
          >
            <Flex fontSize={"20px"}>
              <IoNotificationsSharp />
            </Flex>
            <Flex>{notificationsPagination.showing.total} Notifications</Flex>
          </Flex>
          <NotificationMarkAllAsReadConfirmationModal
            variant={"Button"}
            markAllAsRead={markAllAsRead}
            fetchAndLoadNotifications={fetchAndLoadNotifications}
            abortControllerRef={abortControllerRef}
            notificationLoading={notificationLoading}
          />
        </Flex>

        <Flex gap={"20px"} alignItems={"center"}>
          <Flex gap={"10px"} alignItems={"center"}>
            {workSiteFilter.name ? (
              <Button
                h={"28px"}
                border={"1px solid #dc143c"}
                color={"#dc143c"}
                bg={"white"}
                gap={"5px"}
                px={"12px"}
                fontSize={"14px"}
                onClick={() => {
                  setWorkSiteFilter("");
                }}
              >
                <FaRegTrashAlt />
                Remove Filter
              </Button>
            ) : (
              ""
            )}
            <Menu>
              <MenuButton
                flexShrink={0}
                isLoading={notificationLoading}
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
                    <FaFilter />
                  </Flex>
                  <Flex>{workSiteFilter?.name || "Filter by work site"}</Flex>
                </Flex>
              </MenuButton>
              <MenuList>
                {!workSiteLoading ? (
                  workSiteSelection.map((workSite) => (
                    <MenuItem onClick={() => setWorkSiteFilter(workSite)}>
                      <Flex alignItems={"center"} gap={"10px"}>
                        <Flex fontSize={"24px"} color={"#dc143c"}>
                          <FaMapLocationDot />
                        </Flex>
                        <Flex alignItems={"center"} gap={"10px"}>
                          <Flex flexDir={"column"}>
                            <Flex fontWeight={700}>{workSite.name}</Flex>
                            <Flex
                              fontWeight={400}
                              fontSize={"14px"}
                              color={"#848484"}
                            >
                              {workSite.location}
                            </Flex>
                          </Flex>
                        </Flex>
                      </Flex>
                    </MenuItem>
                  ))
                ) : (
                  <Center gap={"10px"} py={"10px"}>
                    <Spinner color="#dc143c" />
                    <Flex fontWeight={700}>Fetching Work Sites...</Flex>
                  </Center>
                )}
              </MenuList>
            </Menu>
          </Flex>

          <InputGroup>
            <InputLeftElement pointerEvents="none">
              <IoMdSearch color="#848484" fontSize={"20px"} />
            </InputLeftElement>
            <Input
              boxShadow={"0px 0px 3px rgba(50,50,93,0.5)"}
              placeholder="Search notification"
              onChange={(event) => {
                setNotificationLoading(true);
                handleChange(event);
              }}
            ></Input>
          </InputGroup>
        </Flex>
      </Flex>

      {notificationLoading ? (
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
          {notificationsPagination.data.length ? (
            <Flex>
              <Checkbox
                isChecked={allChecked}
                isIndeterminate={isIndeterminate}
                onChange={handleCheckAll}
                fontWeight={700}
              >
                Select All
              </Checkbox>
            </Flex>
          ) : (
            ""
          )}

          <TableContainer boxShadow={"0px 0px 3px rgba(50,50,93,0.5)"}>
            <Table variant="simple">
              <Tbody>
                {notificationsPagination.data.length ? (
                  notificationsPagination.data.map((val, index) => {
                    return (
                      <NotificationCard
                        val={val}
                        setNotifications={setNotifications}
                        setNotificationsPagination={setNotificationsPagination}
                        deleteNotification={deleteNotification}
                        handleOpenDeleteNotificationModal={
                          handleOpenDeleteNotificationModal
                        }
                        handleCheckbox={handleCheckbox}
                        selectedUID={selectedUID}
                        deleteButtonLoading={deleteButtonLoading}
                        setNewNotificationsCount={setNewNotificationsCount}
                      />
                    );
                  })
                ) : (
                  <ListEmptyState
                    colSpan={6}
                    header1={"No notifications found."}
                    header2={"to begin tracking them."}
                  />
                )}
              </Tbody>
            </Table>
          </TableContainer>
        </>
      )}
      <Pagination
        setCurrentPage={customSetCurrentPage}
        totalPages={notificationsPagination.totalPages}
        currentPage={notificationsPagination.currentPage}
        rows={notificationsPagination.rows}
        from={notificationsPagination.from}
        handleChange={handleChange}
        showing={notificationsPagination.showing}
      />

      <ConfirmationModal
        header={"Delete Notification?"}
        header2={"Are you sure you want to delete this Notification?"}
        body={"deleting this notification is permanent and cannot be undone."}
        confirmationFunction={() =>
          deleteNotification(selectedDeleteNotificationUID)
        }
        buttonLoading={deleteButtonLoading}
        confirmationDisclosure={deleteNotificationDisclosure}
        confirmationLabel={"Confirm"}
      />
      <SelectedActionBar
        variant={"notifications"}
        resetFunction={resetSelected}
        selectedUID={selectedUID}
        deleteSelectedFunction={deleteSelected}
        deleteSelectedButtonLoading={deleteSelectedButtonLoading}
        deleteSelectedDisclosure={deleteSelectedNotificationDisclosure}
      />
    </Flex>
  );
}
