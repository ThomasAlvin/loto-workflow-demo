import {
  Button,
  Center,
  Flex,
  Grid,
  GridItem,
  Radio,
  RadioGroup,
  Spinner,
  Tooltip,
  useDisclosure,
} from "@chakra-ui/react";
import { FaMapLocationDot } from "react-icons/fa6";
import { Link } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { api } from "../api/api";
import Swal from "sweetalert2";
import { useDispatch, useSelector } from "react-redux";
import CreateWorkSiteModal from "../components/WorkSite/CreateWorkSiteModal";
import EditWorkSiteModal from "../components/WorkSite/EditWorkSiteModal";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import SetDefaultWorkSiteConfirmationModal from "../components/WorkSite/SetDefaultWorkSiteConfirmationModal";
import SwitchWorkSiteConfirmationModal from "../components/WorkSite/SwitchWorkSiteConfirmationModal";
import { IoNotificationsSharp } from "react-icons/io5";
import { useNotifications } from "../service/NotificationContext";
import Can from "../components/Can";
export default function WorkSitesPage() {
  const abortControllerRef = useRef(new AbortController()); // Persistent controller
  const pageModule = "work_sites";
  const dispatch = useDispatch();
  const userSelector = useSelector((state) => state.login.auth);
  const { newNotificationsCountByWorkSite } = useNotifications();
  const editWorkSiteDisclosure = useDisclosure();
  const setDefaultWorkSiteDisclosure = useDisclosure();
  const switchWorkSiteDisclosure = useDisclosure();

  const [tableLoading, setTableLoading] = useState(false);
  const [buttonLoading, setButtonLoading] = useState(false);
  const [workSites, setWorkSites] = useState([]);
  const [selectedSetDefaultWorkSite, setSelectedSetDefaultWorkSite] =
    useState();
  const [selectedSwitchWorkSite, setSelectedSwitchWorkSite] = useState();
  const [isInitiallyDefault, setIsInitiallyDefault] = useState(false);

  const editWorkSiteForm = useForm({
    defaultValues: {
      UID: "",
      name: "",
      location: "",
      isDefault: false,
    },
    resolver: yupResolver(
      Yup.object({
        // UID: Yup.string().trim().required("Work site UID is required"),
        name: Yup.string().trim().required("Work site name is required"),
        location: Yup.string()
          .trim()
          .required("Work site location is required"),
      })
    ),
    mode: "onTouched",
    reValidateMode: "onChange",
  });

  async function fetchWorkSites(modifiedWorkSite, isDefault) {
    setTableLoading(true);
    await api
      .get(`work-sites/pagination`, {
        signal: abortControllerRef.current.signal,
      })
      .then((response) => {
        setWorkSites(response.data.data);
        // to check if the worksite that is modified when editing worksite is the same as the one that is currently selected and update its data according to its change
        if (userSelector.current_work_site?.UID === modifiedWorkSite?.UID) {
          switchWorkSite(
            response.data.data.find(
              (workSite) => workSite.UID === modifiedWorkSite.UID
            ),
            isDefault,
            false
          );
        }
      })
      .catch((error) => {
        console.log(error);
      })
      .finally(() => {
        setTableLoading(false);
      });
  }
  async function switchWorkSite(workSite, isDefault, includeSwal = true) {
    if (isDefault) {
      dispatch({
        type: "login",
        payload: {
          ...userSelector,
          current_work_site: workSite,
          main_work_site: workSite,
        },
      });
    } else {
      dispatch({
        type: "login",
        payload: {
          ...userSelector,
          current_work_site: workSite,
        },
      });
    }
    // disabled karena it looks stupid without loading because api request is removed
    // if (includeSwal) {
    //   Swal.fire({
    //     title: "Success!",
    //     text: "Successfully switched work site!",
    //     icon: "success",
    //     customClass: {
    //       popup: "swal2-custom-popup",
    //       title: "swal2-custom-title",
    //       content: "swal2-custom-content",
    //       actions: "swal2-custom-actions",
    //       confirmButton: "swal2-custom-confirm-button",
    //     },
    //   });
    // }
    switchWorkSiteDisclosure.onClose();
  }
  function handleOpenSwitchWorkSiteModal(workSite) {
    switchWorkSiteDisclosure.onOpen();
    setSelectedSwitchWorkSite(workSite);
  }
  function handleOpenEditModal(e, workSite) {
    e.stopPropagation();
    editWorkSiteForm.setValue("UID", workSite?.UID);
    editWorkSiteForm.setValue("name", workSite.name);
    editWorkSiteForm.setValue("location", workSite.location);
    editWorkSiteForm.setValue(
      "isDefault",
      userSelector.main_work_site?.UID === workSite.UID
    );
    setIsInitiallyDefault(userSelector.main_work_site?.UID === workSite.UID);
    editWorkSiteDisclosure.onOpen();
  }
  function handleOpenSetDefaultModal(e, workSite) {
    e.stopPropagation();
    setSelectedSetDefaultWorkSite(workSite);

    setDefaultWorkSiteDisclosure.onOpen();
  }
  function newNotifCountFontSize(number) {
    const length = number.toString().length;
    if (length === 1) {
      return "14px";
    } else if (length === 2) {
      return "12px";
    } else if (length === 3) {
      return "10px";
    } else {
      return "9px"; // fallback for longer numbers
    }
  }
  async function changeDefaultWorkSite() {
    setButtonLoading(true);
    await api
      .post(`work-sites/set-default/${selectedSetDefaultWorkSite.UID}`)
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
        dispatch({
          type: "login",
          payload: {
            ...userSelector,
            main_work_site: selectedSetDefaultWorkSite,
          },
        });
      })
      .catch((error) => {
        Swal.fire({
          title: "Oops...",
          // text: error.response.data.errors || "An error occurred",
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
        setDefaultWorkSiteDisclosure.onClose();
        setButtonLoading(false);
        setTableLoading(false);
      });
  }
  useEffect(() => {
    abortControllerRef.current = new AbortController();

    fetchWorkSites(); // Initial load

    return () => abortControllerRef.current.abort(); // Cleanup on unmount
  }, []);
  return (
    <Flex w={"100%"} flexDir={"column"} px={"30px"} py={"20px"} gap={"20px"}>
      <Flex
        onClick={() => {
          console.log(userSelector);
        }}
        fontSize={"28px"}
        color={"#dc143c"}
        fontWeight={700}
      >
        Work Site List
      </Flex>
      <Flex h={"2px"} bg={"#bababa"}></Flex>
      <Flex>
        <Can module={pageModule} permission={["manage"]}>
          <CreateWorkSiteModal
            abortControllerRef={abortControllerRef}
            fetchWorkSites={fetchWorkSites}
          />
        </Can>
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
        <RadioGroup value={userSelector.current_work_site?.UID}>
          <Grid templateColumns="repeat(2, 1fr)" gap={5}>
            {workSites
              ?.map((item, index) => ({
                ...item,
                originalIndex: workSites.length - 1 - index,
              }))
              .sort(
                (a, b) =>
                  (userSelector.main_work_site?.UID === b.UID ? 1 : 0) -
                  (userSelector.main_work_site?.UID === a.UID ? 1 : 0)
              ) // Sort: isDefault=true first
              .map((val, index) => {
                const isSelectedWorkSite =
                  val?.UID === userSelector.current_work_site?.UID;
                return (
                  <GridItem
                    _hover={{ bg: "#f8f9fa" }}
                    cursor={isSelectedWorkSite ? "not-allowed" : "pointer"}
                    onClick={() => {
                      if (!isSelectedWorkSite) {
                        handleOpenSwitchWorkSiteModal(val);
                      }
                    }}
                  >
                    <Flex
                      position={"relative"}
                      // boxShadow={"0px 0px 3px rgba(50,50,93,0.5)"}
                      p={"20px"}
                      justify={"space-between"}
                      boxShadow={
                        isSelectedWorkSite
                          ? "0px 0px 3px rgba(220,20,60,1)"
                          : "0px 0px 3px rgba(50,50,93,0.5)"
                      }
                      alignItems={"center"}
                    >
                      <Flex alignItems={"center"} gap={"30px"}>
                        <Flex fontSize={"40px"} color={"#dc143c"}>
                          <FaMapLocationDot />
                        </Flex>
                        <Flex flexDir={"column"} gap={"10px"}>
                          <Flex flexDir={"column"}>
                            <Flex
                              alignItems={"center"}
                              gap={"10px"}
                              fontSize={"20px"}
                              fontWeight={700}
                            >
                              <Flex gap={"5px"} alignItems={"center"}>
                                <Flex>{val.originalIndex + 1}.</Flex>
                                <Flex>{val.name}</Flex>
                              </Flex>
                              {userSelector.main_work_site?.UID === val.UID ? (
                                <Flex
                                  bg={"#dc143c"}
                                  color={"white"}
                                  fontSize={"12px"}
                                  px={"5px"}
                                  py={"2px"}
                                  borderRadius={"5px"}
                                >
                                  Default
                                </Flex>
                              ) : (
                                ""
                              )}
                            </Flex>
                            <Flex color={"#848484"}>
                              {val.location || "Location is not set"}
                              {/* 123 Main St, Springfield, IL 62701, USA */}
                            </Flex>
                          </Flex>
                          <Flex gap={"20px"}>
                            <Can module={pageModule} permission={["manage"]}>
                              <Button
                                onClick={(e) => handleOpenEditModal(e, val)}
                                border={"1px solid #dc143c"}
                                color={"#dc143c"}
                                bg={"white"}
                                h={"28px"}
                                fontSize={"14px"}
                                px={"8px"}
                                _hover={{ bg: "#dc143c", color: "white" }}
                              >
                                Edit work site
                              </Button>
                            </Can>
                            <Button
                              isDisabled={
                                userSelector.main_work_site?.UID === val.UID
                                  ? true
                                  : false
                              }
                              onClick={(e) => handleOpenSetDefaultModal(e, val)}
                              //   onClick={(e) => setDefaultWorkSite(e, val)}
                              _hover={{ background: "#b80d2f" }}
                              color={"white"}
                              bg={"#dc143c"}
                              h={"28px"}
                              px={"8px"}
                              fontSize={"14px"}
                            >
                              Set as default
                            </Button>
                            <Tooltip
                              hasArrow
                              placement="top"
                              label="Notifications"
                            >
                              <Button
                                as={Link}
                                to={`/notification?workSiteUID=${val.UID}&workSiteName=${val.name}`}
                                //   onClick={(e) => setDefaultWorkSite(e, val)}
                                _hover={{ background: "#dedede" }}
                                color={"#dc143c"}
                                bg={"white"}
                                h={"28px"}
                                w={"28px"}
                                borderRadius={"full"}
                                p={0}
                                minW={"auto"}
                                fontSize={"14px"}
                              >
                                <Flex fontSize={"24px"}>
                                  <IoNotificationsSharp />
                                </Flex>
                                {Array.isArray(
                                  newNotificationsCountByWorkSite
                                ) ? (
                                  newNotificationsCountByWorkSite.find(
                                    (newNotifCount) =>
                                      newNotifCount.work_site_name === val.name
                                  ) ? (
                                    <Flex
                                      aspectRatio={1}
                                      // p={"2px"}
                                      w={"20px"}
                                      fontWeight={700}
                                      borderRadius={"100%"}
                                      alignItems={"center"}
                                      justify={"center"}
                                      bg={"#e89d00"}
                                      color={"white"}
                                      position={"absolute"}
                                      top={"-5px"}
                                      right={"-5px"}
                                      fontSize={() =>
                                        newNotifCountFontSize(
                                          newNotificationsCountByWorkSite.find(
                                            (newNotifCount) =>
                                              newNotifCount.work_site_name ===
                                              val.name
                                          ).new_notif_count
                                        )
                                      }
                                    >
                                      {
                                        newNotificationsCountByWorkSite.find(
                                          (newNotifCount) =>
                                            newNotifCount.work_site_name ===
                                            val.name
                                        ).new_notif_count
                                      }
                                    </Flex>
                                  ) : (
                                    ""
                                  )
                                ) : (
                                  ""
                                )}
                              </Button>
                            </Tooltip>

                            {/* <Button
                              onClick={(e) => setDefaultWorkSite(e, val)}
                              _hover={{ background: "#b80d2f" }}
                              color={"white"}
                              bg={"#dc143c"}
                              h={"28px"}
                              px={"8px"}
                              fontSize={"14px"}
                            >
                              Set as default
                            </Button> */}
                          </Flex>
                        </Flex>
                      </Flex>
                      <Flex
                        cursor={isSelectedWorkSite ? "not-allowed" : "pointer"}
                        h={"10px"}
                      >
                        <Radio
                          size="lg"
                          cursor={
                            isSelectedWorkSite ? "not-allowed" : "pointer"
                          }
                          colorScheme="red"
                          name="workSite"
                          value={`${val.UID}`}
                        ></Radio>
                      </Flex>
                    </Flex>
                  </GridItem>
                );
              })}
          </Grid>
        </RadioGroup>
      )}
      <EditWorkSiteModal
        isInitiallyDefault={isInitiallyDefault}
        abortControllerRef={abortControllerRef}
        fetchWorkSites={fetchWorkSites}
        workSites={workSites}
        editWorkSiteForm={editWorkSiteForm}
        isOpen={editWorkSiteDisclosure.isOpen}
        onClose={editWorkSiteDisclosure.onClose}
      />
      <SetDefaultWorkSiteConfirmationModal
        changeDefaultWorkSite={changeDefaultWorkSite}
        buttonLoading={buttonLoading}
        // setDefaultWorkSiteDisclosure={setDefaultWorkSiteDisclosure}
        handleOpenSetDefaultModal={handleOpenSetDefaultModal}
        isOpen={setDefaultWorkSiteDisclosure.isOpen}
        onClose={setDefaultWorkSiteDisclosure.onClose}
      />
      <SwitchWorkSiteConfirmationModal
        switchWorkSite={switchWorkSite}
        buttonLoading={buttonLoading}
        selectedSwitchWorkSite={selectedSwitchWorkSite}
        onClose={switchWorkSiteDisclosure.onClose}
        isOpen={switchWorkSiteDisclosure.isOpen}
      />
    </Flex>
  );
}
