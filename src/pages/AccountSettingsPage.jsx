import {
  Avatar,
  Box,
  Button,
  Flex,
  Input,
  Spinner,
  Switch,
  useDisclosure,
  VStack,
} from "@chakra-ui/react";
import { useCallback, useEffect, useRef, useState } from "react";
import * as Yup from "yup";
import { FcGoogle } from "react-icons/fc";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useDispatch, useSelector } from "react-redux";
import ChangePasswordModal from "../components/AccountSettings/ChangePasswordModal";
import { HiMiniPencilSquare } from "react-icons/hi2";
import { FaTriangleExclamation } from "react-icons/fa6";
import { api } from "../api/api";
import Swal from "sweetalert2";
import { MdOutlineMailLock } from "react-icons/md";
import ChangesDetectedWarning from "../components/AccountSettings/ChangesDetectedWarning";
import SwalErrorMessages from "../components/SwalErrorMessages";
import { useNavigate, useSearchParams } from "react-router-dom";
import { FaTrashAlt } from "react-icons/fa";
import { IoIosCheckmarkCircle } from "react-icons/io";
import SubscriptionSettingsSkeleton from "../skeletons/SubscriptionSettingsSkeleton";
import LoadingOverlay from "../components/LoadingOverlay";
import CancelSubscriptionConfirmationModal from "../components/AccountSettings/CancelSubscriptionConfirmationModal";
import SubscriptionStatus from "../components/AccountSettings/SubscriptionStatus";
import tinycolor from "tinycolor2";
import ConnectGoogleAuthModal from "../components/AccountSettings/ConnectGoogleAuthModal";
import SetToDefaultTFAConfirmationModal from "../components/AccountSettings/SetToDefaultTFAConfirmationModal";
import DeleteMethodConfirmationModal from "../components/AccountSettings/DeleteMethodConfirmationModal";
import checkHasPermission from "../utils/checkHasPermission";
import convertToFormData from "../utils/convertToFormData";
import Can from "../components/Can";

export default function AccountSettingsPage() {
  const pageModule = "subscription";
  const [searchParams] = useSearchParams();
  const [QRLoading, setQRLoading] = useState(false);
  const [deleteGoogle2FALoading, setDeleteGoogle2FALoading] = useState(false);
  const [QRCodeUrl, setQRCodeURL] = useState("");
  const paramsTab = searchParams.get("tab");
  const [tab, setTab] = useState("");
  const [loading, setLoading] = useState(true);
  const [tableLoading, setTableLoading] = useState(false);
  const userSelector = useSelector((state) => state.login.auth);
  const [from, setFrom] = useState();
  const [rows, setRows] = useState(10);
  const [showing, setShowing] = useState(0);
  const [totalPages, setTotalPages] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [storageUsage, setStorageUsage] = useState("");
  const [subscription, setSubscription] = useState("");
  const [subscriptionLoading, setSubscriptionLoading] = useState(false);
  const [selectedTFA, setSelectedTFA] = useState({
    label: "email verification",
    value: "email",
  });
  const [buttonLoading, setButtonLoading] = useState();
  const [TFASwitchLoading, setTFASwitchLoading] = useState(false);
  const [TFAButtonLoading, setTFAButtonLoading] = useState(false);
  const [enableTFA, setEnableTFA] = useState();
  const [cancelSubscriptionButtonLoading, setCancelSubscriptionButtonLoading] =
    useState();
  const IMGURL = import.meta.env.VITE_API_IMAGE_URL;
  const [profileImagePreview, setProfileImagePreview] = useState(
    userSelector.profile_image_url
      ? IMGURL + userSelector.profile_image_url
      : ""
  );
  const setToDefaultTFADisclosure = useDisclosure();

  const [companyLogoImagePreview, setCompanyLogoImagePreview] = useState(
    userSelector.company_logo_image_url
      ? IMGURL + userSelector.company_logo_image_url
      : ""
  );
  const nav = useNavigate();
  const dispatch = useDispatch();
  const profileImageInputRef = useRef(null);
  const companyImageInputRef = useRef(null);
  const capitalizeFirst = (str) =>
    str ? str[0].toUpperCase() + str.slice(1) : "";

  const initialValue = {
    firstName: userSelector.first_name,
    lastName: userSelector.last_name,
    phoneNumber: userSelector.phone_number || "",
    profileImage: "",
    deleteProfileImage: userSelector.profile_image_url ? false : true,
    companyLogoImage: "",
    deleteCompanyLogoImage: userSelector.company_logo_image_url ? false : true,
    companyName: userSelector.company_name || "",
  };

  const {
    reset,
    watch,
    register,
    handleSubmit,
    getValues,
    setValue,
    formState: { errors, touchedFields },
  } = useForm({
    defaultValues: initialValue,
    resolver: yupResolver(
      Yup.object({
        firstName: Yup.string().trim().required("First name is required"),
        lastName: Yup.string().trim().required("Last name is required"),
        phoneNumber: Yup.string()
          .notRequired()
          .trim()
          .matches(
            /^(\+?[1-9]{1}[0-9]{1,2})?(\s|-|\.)?(\(?[0-9]{1,4}\)?[\s.-]?)?([0-9]{1,4}[\s.-]?[0-9]{1,4})+$/,
            {
              message: "Invalid phone number format",
              excludeEmptyString: true,
            }
          ),
      })
    ),
    mode: "onTouched",
    reValidateMode: "onChange",
  });
  const cancelSubscriptionModalDisclosure = useDisclosure();

  function handleOpenCancelSubscriptionModal() {
    cancelSubscriptionModalDisclosure.onOpen();
  }
  function tabHandler(event) {
    setTableLoading(true);
    const { id } = event.target;
    nav("/account-settings?tab=" + id);
  }

  function handleProfileInputClick() {
    profileImageInputRef.current.click();
  }
  function handleCompanyInputClick() {
    companyImageInputRef.current.click();
  }
  function closeSetToDefaultTFAModal() {
    setToDefaultTFADisclosure.onClose();
  }
  const handleOpenSetToDefaultTFAModal = useCallback(
    (TFA) => {
      setToDefaultTFADisclosure.onOpen();
      if (TFA === "email")
        setSelectedTFA({ label: "email verification", value: "email" });
      else if (TFA === "google_auth")
        setSelectedTFA({ label: "Google Authenticator", value: "google_auth" });
    },
    [setSelectedTFA]
  );

  function handleFileChange(e) {
    const id = e.target.id; // Get the selected file
    const file = e.target.files[0]; // Get the selected file

    if (file) {
      // Check file size (2MB limit)
      if (file.size > 2 * 1024 * 1024) {
        // Trigger SweetAlert error if file size is larger than 2MB
        Swal.fire({
          title: "File too large!",
          text: "The file size exceeds the 2MB limit. Please select a smaller file.",
          icon: "error",
          customClass: {
            popup: "swal2-custom-popup",
            title: "swal2-custom-title",
            content: "swal2-custom-content",
            actions: "swal2-custom-actions",
            confirmButton: "swal2-custom-confirm-button",
          },
        });

        // Clear the file input (optional)
        e.target.value = "";
      } else if (
        !["image/jpeg", "image/jpg", "image/png"].includes(file.type)
      ) {
        // Trigger SweetAlert error for invalid file type
        Swal.fire({
          title: "Invalid file type!",
          text: "Only JPEG, JPG, or PNG files are allowed. Please select a valid image file.",
          icon: "error",
          customClass: {
            popup: "swal2-custom-popup",
            title: "swal2-custom-title",
            content: "swal2-custom-content",
            actions: "swal2-custom-actions",
            confirmButton: "swal2-custom-confirm-button",
          },
        });

        // Clear the file input (optional)
        e.target.value = "";
      } else {
        if (id === "profileImage") {
          setValue("profileImage", file);
          setValue("deleteProfileImage", false);
          const imageUrl = URL.createObjectURL(file);
          setProfileImagePreview(imageUrl);
        } else if (id === "companyLogo") {
          setValue("companyLogoImage", file);
          setValue("deleteCompanyLogoImage", false);
          const imageUrl = URL.createObjectURL(file);
          setCompanyLogoImagePreview(imageUrl);
        }
      }
    }
  }
  function formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return "0 Bytes";

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;

    const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB"];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
  }
  function deleteImage(e) {
    const id = e.target.id; // Get the selected file
    if (id === "profile") {
      setValue("profileImage", "");
      setValue("deleteProfileImage", true);
      setProfileImagePreview("");
    } else if (id === "companyLogo") {
      setValue("companyLogoImage", "");
      setValue("deleteCompanyLogoImage", true);
      setCompanyLogoImagePreview("");
    }
  }

  async function submitEditAccount(data) {
    setButtonLoading(true);

    const formData = convertToFormData(data);

    await api
      .post(`user/edit`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      .then(async (response) => {
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
            first_name: data.firstName,
            last_name: data.lastName,
            phone_number: data.phoneNumber,
            profile_image_url: response.data.profile_image_url,
          },
        });
        const newValues = {
          ...data,
          profileImage: "",
        };
        reset(newValues);
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
      })
      .finally(() => {
        setButtonLoading(false);
      });
  }
  function handleChange(e) {
    const { value, id } = e.target;
    if (id === "row") {
      setRows(value);
    } else {
      debouncedSearch(value);
    }
  }

  async function handleToggleTFA(event) {
    const { checked } = event.target;
    setTFASwitchLoading(true);
    await api
      .post(`user/enable-or-disable-2fa`, { status: checked })
      .then((response) => {
        dispatch({
          type: "login",
          payload: {
            ...userSelector,
            is_2fa_enabled: checked,
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
      })
      .finally(() => {
        setTFASwitchLoading(false);
      });
  }
  const submitDefaultTFA = async (method) => {
    setTFAButtonLoading(true);
    await api
      .post(`user/set-default-2fa`, { type: method })
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
            two_factor_type_default: method,
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
      })
      .finally(() => {
        setTFAButtonLoading(false);
        closeSetToDefaultTFAModal();
      });
  };
  async function submitCompanyProfile() {
    setButtonLoading(true);
    const submittedData = {
      logoImage: getValues("companyLogoImage"),
      deleteLogoImage: getValues("deleteCompanyLogoImage"),
      companyName: getValues("companyName"),
    };
    const formData = convertToFormData(submittedData);

    await api
      .post(`/user/upload-logo`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      .then(async (response) => {
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
            company_logo_image_url: response.data.company_logo_image_url,
            company_name: response.data.company_name,
          },
        });
        const newValues = {
          ...getValues(),
          companyLogoImage: "",
        };

        reset(newValues);
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
      })
      .finally(() => {
        setButtonLoading(false);
      });
  }

  async function fetchSubscription(controller) {
    setSubscriptionLoading(true);
    await api
      .get(`subscription`, { signal: controller.signal })
      .then((response) => {
        setSubscription(response?.data?.subscription);
        setStorageUsage(response?.data?.totalStorageUsage);
      })
      .catch((error) => {
        console.log(error);
      })
      .finally(() => {
        setSubscriptionLoading(false);
        setLoading(false);
      });
  }

  async function cancelSubscriptionAtPeriodEnd() {
    setCancelSubscriptionButtonLoading(true);
    await api
      .post(`/user/subscription/cancel`, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      .then(async (response) => {
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
      })
      .finally(() => {
        cancelSubscriptionModalDisclosure.onClose();
        setCancelSubscriptionButtonLoading(false);
      });
  }

  async function changePaymentMethod() {
    try {
      setLoading(true);

      const response = await api.post(`/user/change-payment-method`, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      window.location.href = response.data.url;
    } catch (error) {
      setLoading(false);
      Swal.fire({
        title: "Oops...",
        icon: "error",
        html: SwalErrorMessages(
          error.response?.data?.message || "An error occurred"
        ),
        customClass: {
          popup: "swal2-custom-popup",
          title: "swal2-custom-title",
          content: "swal2-custom-content",
          actions: "swal2-custom-actions",
          confirmButton: "swal2-custom-confirm-button",
        },
      });
    }
  }
  async function refreshQrCode() {
    setQRLoading(true);
    await api
      .get(`user/refresh-qr-url`)
      .then((response) => {
        setQRCodeURL(response.data.qr);
      })
      .catch((error) => {
        console.error(error);
      })
      .finally(() => {
        setQRLoading(false);
      });
  }
  async function deleteGoogle2FA() {
    setDeleteGoogle2FALoading(true);
    await api
      .post(`user/delete-google-2fa`)
      .then((response) => {
        dispatch({
          type: "login",
          payload: {
            ...userSelector,
            is_valid_2fa: false,
          },
        });
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
          html: SwalErrorMessages(
            error.response?.data?.message || "An error occurred"
          ),
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
        setDeleteGoogle2FALoading(false);
      });
  }
  const accountInitial = {
    firstName: userSelector.first_name,
    lastName: userSelector.last_name,
    phoneNumber: userSelector.phone_number || "",
    profileImage: "",
    deleteProfileImage: userSelector.profile_image_url ? false : true,
  };

  const accountCurrent = {
    firstName: watch("firstName"),
    lastName: watch("lastName"),
    phoneNumber: watch("phoneNumber"),
    profileImage: watch("profileImage"),
    deleteProfileImage: watch("deleteProfileImage"),
  };

  const isAccountInputChanged =
    JSON.stringify(accountInitial) !== JSON.stringify(accountCurrent);

  const companyInitial = {
    companyLogoImage: "",
    deleteCompanyLogoImage: userSelector.company_logo_image_url ? false : true,
    companyName: userSelector?.company_name || "",
  };

  const companyCurrent = {
    companyLogoImage: watch("companyLogoImage"),
    deleteCompanyLogoImage: watch("deleteCompanyLogoImage"),
    companyName: watch("companyName"),
  };

  const isCompanyDetailsChanged =
    JSON.stringify(companyInitial) !== JSON.stringify(companyCurrent);

  useEffect(() => {
    const controller = new AbortController();
    fetchSubscription(controller);

    return () => {
      controller.abort(); // Cleanup previous fetch request before new one starts
    };
  }, []);
  useEffect(() => {
    if (
      paramsTab === "subscription" &&
      checkHasPermission(userSelector, pageModule, ["full_access"], ["guest"])
    )
      setTab(paramsTab);
    else {
      setTab("");
    }
  }, [paramsTab]);

  if (loading) {
    return LoadingOverlay();
  } else {
    return (
      <Flex w={"100%"} flexDir={"column"} px={"30px"} py={"20px"} gap={"20px"}>
        <Flex fontSize={"28px"} color={"#dc143c"} fontWeight={700}>
          Account Settings
        </Flex>
        <Flex fontWeight={700} borderBottom={"2px solid #bababa"}>
          <Flex
            cursor={"pointer"}
            borderBottom={!tab ? "3px solid #dc143c" : ""}
            color={!tab ? "black" : "#848484"}
            px={"10px"}
            py={"2px"}
            onClick={tabHandler}
          >
            Profile Settings
          </Flex>
          <Can
            roles={["guest"]}
            module={pageModule}
            permission={["full_access"]}
          >
            <Flex
              id="subscription"
              cursor={"pointer"}
              borderBottom={tab === "subscription" ? "3px solid #dc143c" : ""}
              color={tab === "subscription" ? "black" : "#848484"}
              px={"10px"}
              py={"2px"}
              onClick={tabHandler}
            >
              Subscription
            </Flex>
          </Can>{" "}
        </Flex>
        {/* <Flex h={"2px"} bg={"#bababa"}></Flex> */}
        {tab === "subscription" &&
        checkHasPermission(
          userSelector,
          pageModule,
          ["full_access"],
          ["guest"]
        ) ? (
          subscriptionLoading ? (
            <SubscriptionSettingsSkeleton />
          ) : (
            <Flex flexDir={"column"} w={"100%"} gap={"30px"} pb={"100px"}>
              <Flex flexDir={"column"} gap={"10px"}>
                <Flex flexDir={"column"}>
                  <Flex color={"#dc143c"} fontSize={"20px"} fontWeight={700}>
                    Current Plan
                  </Flex>
                  <Flex color={"#848484"}>
                    Manage current plan and billing information.
                  </Flex>
                </Flex>
                <Flex
                  bg={"#f8f9fa"}
                  boxShadow={"0px 0px 3px rgba(50,50,93,0.5)"}
                  flexDir={"column"}
                  w={"50%"}
                >
                  <Flex
                    w={"100%"}
                    flexDir={"column"}
                    border={"1px solid #bababa"}
                  >
                    <Flex
                      flexDir={"column"}
                      borderRight={"1px solid #bababa"}
                      borderBottom={"1px solid #bababa"}
                      w={"100%"}
                      p={"20px"}
                      gap={"10px"}
                      justify={"space-between"}
                    >
                      <Flex color={"#848484"}>STATUS</Flex>
                      <SubscriptionStatus subscription={subscription} />
                      {/* <Flex
                        w={"fit-content"}
                        _hover={{ textDecor: "underline" }}
                        color={"#dc143c"}
                      >
                        <Flex
                          visibility={
                            subscription.status ? "visible" : "hidden"
                          }
                          cursor={"pointer"}
                          _hover={{ textDecor: "underline" }}
                          onClick={handleOpenCancelSubscriptionModal}
                        >
                          Cancel subscription
                        </Flex>
                      </Flex> */}
                    </Flex>
                    <Flex
                      flexDir={"column"}
                      borderRight={"1px solid #bababa"}
                      w={"100%"}
                      p={"20px"}
                      gap={"10px"}
                      justify={"space-between"}
                    >
                      <Flex flexDir={"column"} gap={"10px"}>
                        <Flex color={"#848484"}>STORAGE USAGE</Flex>
                        <Flex flexDir={"column"}>
                          <Flex flexDir={"column"}>
                            <Flex
                              justify={"space-between"}
                              alignItems={"center"}
                            >
                              <Flex fontSize={"20px"} fontWeight={700}>
                                {Math.trunc(
                                  (storageUsage / 50 / 1024 / 1024 / 1024) *
                                    100 *
                                    100
                                ) / 100}
                                %
                              </Flex>
                              <Flex fontSize={"14px"} color={"#848484"}>
                                {formatBytes(storageUsage)} / 50 GB
                              </Flex>
                            </Flex>

                            <VStack align="stretch" spacing={4}>
                              <Flex
                                w="100%"
                                h="12px"
                                overflow="hidden"
                                boxShadow="sm"
                                bg={"#dedede"}
                              >
                                <Box
                                  w={`${
                                    (storageUsage / 50 / 1024 / 1024 / 1024) *
                                    100
                                  }%`}
                                  bg={"#dc143c"}
                                  transition="width 0.3s ease"
                                />
                              </Flex>
                            </VStack>
                          </Flex>
                          <Flex fontSize={"14px"} color={"#848484"}>
                            Can be upgraded from current plan
                          </Flex>
                        </Flex>
                      </Flex>
                    </Flex>
                  </Flex>
                  {/* <Flex w={"100%"} border={"1px solid #bababa"}>
                    <Flex
                      flexDir={"column"}
                      borderRight={"1px solid #bababa"}
                      w={"50%"}
                      p={"20px"}
                      gap={"10px"}
                      justify={"space-between"}
                    >
                      <Flex color={"#848484"}>PLAN</Flex>
                      <Flex flexDir={"column"}>
                        <Flex fontSize={"24px"} fontWeight={700}>
                          {subscription?.subscription_plan?.name
                            ? subscription?.subscription_plan?.name
                            : "No active subscription"}
                        </Flex>
                        <Flex fontSize={"14px"} color={"#848484"}>
                          {subscription?.subscription_plan?.name
                            ? `Includes up to 10 users, 100 padlocks, and 5 layers of
                          multi approval and 50GB Storage`
                            : "No Subscription Selected"}
                        </Flex>
                      </Flex>

                      <Flex
                        w={"fit-content"}
                        _hover={{ textDecor: "underline" }}
                        color={"#dc143c"}
                      >
                        <Link to={"/subscription-plan"}>
                          {subscription?.subscription_plan?.name
                            ? "Switch plan"
                            : "Activate subscription"}
                        </Link>
                      </Flex>
                    </Flex>
                    <Flex
                      flexDir={"column"}
                      borderRight={"1px solid #bababa"}
                      w={"50%"}
                      p={"20px"}
                      gap={"10px"}
                      justify={"space-between"}
                    >
                      <Flex color={"#848484"}>BILLING CYCLE</Flex>
                      <Flex flexDir={"column"}>
                        <Flex fontSize={"24px"} fontWeight={700}>
                          {subscription?.billing_interval
                            ? capitalizeFirst(subscription?.billing_interval)
                            : "No active subscription"}
                        </Flex>

                        <Flex
                          fontSize={"14px"}
                          alignItems={"center"}
                          color={"#848484"}
                        >
                          <Flex>
                            {subscription?.billing_interval
                              ? "Switch to annual for"
                              : "No Subscription Selected"}
                            &nbsp;
                          </Flex>
                          <Tag
                            visibility={
                              subscription?.billing_interval
                                ? "visible"
                                : "hidden"
                            }
                            fontSize={"14px"}
                            bg={"#E2FDE2"}
                            color={"#28a745"}
                          >
                            $
                            {subscription?.billing_interval == "monthly"
                              ? subscription?.subscription_plan
                                  ?.amount_monthly + " / Month"
                              : subscription?.subscription_plan?.amount_yearly +
                                " / Year"}
                          </Tag>
                        </Flex>
                      </Flex>

                      <Flex
                        w={"fit-content"}
                        _hover={{ textDecor: "underline" }}
                        color={"#dc143c"}
                      >
                        <Link to={"/subscription-plan"}>
                          {subscription?.billing_interval
                            ? "Switch to annual plan"
                            : "Activate Subscription"}
                        </Link>
                      </Flex>
                    </Flex>
                  </Flex>
                  <Flex
                    w={"100%"}
                    border={"1px solid #bababa"}
                    borderTop={"none"}
                  >
                    <Flex
                      flexDir={"column"}
                      borderRight={"1px solid #bababa"}
                      w={"50%"}
                      p={"20px"}
                      gap={"10px"}
                      justify={"space-between"}
                    >
                      <Flex color={"#848484"}>BILLING DATE</Flex>
                      <Flex gap={"30px"} alignItems={"center"}>
                        <Flex fontWeight={700} flexDir={"column"}>
                          <Flex color={"#dc143c"}>Last Billing</Flex>
                          <Flex fontSize={"24px"}>
                            {subscription?.current_period_start
                              ? moment(
                                  subscription?.current_period_start
                                ).format("MMM D, YYYY")
                              : "-"}
                          </Flex>
                        </Flex>
                        <Flex fontSize={"24px"} color={"#848484"}>
                          <BsArrows />
                        </Flex>
                        <Flex fontWeight={700} flexDir={"column"}>
                          <Flex color={"#dc143c"}>Upcoming Billing</Flex>
                          <Flex fontSize={"24px"}>
                            {subscription?.current_period_end
                              ? moment(subscription?.current_period_end).format(
                                  "MMM D, YYYY"
                                )
                              : "-"}
                          </Flex>
                        </Flex>
                      </Flex>
                      <Flex
                        visibility={
                          subscription?.current_period_end
                            ? "visible"
                            : "hidden"
                        }
                        w={"fit-content"}
                        _hover={{ textDecor: "underline" }}
                        color={"#dc143c"}
                      >
                        <Flex
                          cursor={"pointer"}
                          onClick={() =>
                            window.open(
                              subscription?.user?.billing_history[0]
                                .hosted_invoice_url || "#",
                              "_blank",
                              "noopener,noreferrer"
                            )
                          }
                        >
                          Download invoice
                        </Flex>
                      </Flex>
                    </Flex>
                    <Flex
                      flexDir={"column"}
                      borderRight={"1px solid #bababa"}
                      w={"50%"}
                      p={"20px"}
                      gap={"10px"}
                      justify={"space-between"}
                    >
                      <Flex color={"#848484"}>STATUS</Flex>
                      <SubscriptionStatus subscription={subscription} />
                      <Flex
                        w={"fit-content"}
                        _hover={{ textDecor: "underline" }}
                        color={"#dc143c"}
                      >
                        <Flex
                          visibility={
                            subscription.status ? "visible" : "hidden"
                          }
                          cursor={"pointer"}
                          _hover={{ textDecor: "underline" }}
                          onClick={handleOpenCancelSubscriptionModal}
                        >
                          Cancel subscription
                        </Flex>
                      </Flex>
                    </Flex>
                  </Flex>
                  <Flex
                    w={"100%"}
                    border={"1px solid #bababa"}
                    borderTop={"none"}
                  >
                    <Flex
                      flexDir={"column"}
                      borderRight={"1px solid #bababa"}
                      w={"50%"}
                      p={"20px"}
                      gap={"12px"}
                      // justify={"space-between"}
                    >
                      <Flex color={"#848484"}>PAYMENT METHOD</Flex>

                      {subscription.last4_card ? (
                        <Flex justify={"space-between"} alignItems={"center"}>
                          <Flex alignItems={"center"} gap={"20px"}>
                            <Flex
                              p={"5px"}
                              boxShadow={"0px 0px 3px rgba(50,50,93,0.5)"}
                            >
                              <Image h={"32px"} src={VisaLogo} />
                            </Flex>
                            <Flex flexDir={"column"}>
                              <Flex fontSize={"12px"}>
                                <LuAsterisk />
                                <LuAsterisk />
                                <LuAsterisk />
                                <LuAsterisk />
                                &nbsp; &nbsp; &nbsp;
                                <LuAsterisk />
                                <LuAsterisk />
                                <LuAsterisk />
                                <LuAsterisk />
                                &nbsp; &nbsp; &nbsp;
                                <LuAsterisk />
                                <LuAsterisk />
                                <LuAsterisk />
                                <LuAsterisk />
                                &nbsp; &nbsp; &nbsp;
                                <Flex
                                  fontSize={"14px"}
                                  letterSpacing={"4px"}
                                  fontWeight={700}
                                >
                                  {subscription?.last4_card}
                                </Flex>
                              </Flex>
                              <Flex color={"#848484"} fontSize={"14px"}>
                                Expiry in {subscription?.expired}
                              </Flex>
                            </Flex>
                          </Flex>
                        </Flex>
                      ) : (
                        <Flex flexDir={"column"}>
                          <Flex alignItems={"center"} gap={"20px"}>
                            <Flex>
                              <Flex
                                fontSize={"36px"}
                                p={"12px"}
                                bg={"#ededed"}
                                borderRadius={"full"}
                                color={"#848484"}
                              >
                                <FaRegCreditCard />
                              </Flex>
                            </Flex>
                            <Flex flexDir={"column"}>
                              <Flex fontWeight={700}>No Payment Setup</Flex>
                              <Flex color={"#848484"} fontSize={"14px"}>
                                Subscribe to a plan first to add and manage your
                                payment method.
                              </Flex>
                            </Flex>
                          </Flex>
                        </Flex>
                      )}

                      <Flex
                        w={"fit-content"}
                        _hover={{ textDecor: "underline" }}
                        color={"#dc143c"}
                      >
                        <Flex
                          visibility={
                            subscription.status ? "visible" : "hidden"
                          }
                          cursor={"pointer"}
                          _hover={{ textDecor: "underline" }}
                          onClick={changePaymentMethod}
                        >
                          Manage payment method
                        </Flex>
                      </Flex>
                    </Flex>
                    <Flex
                      flexDir={"column"}
                      borderRight={"1px solid #bababa"}
                      w={"50%"}
                      p={"20px"}
                      gap={"10px"}
                      justify={"space-between"}
                    >
                      <Flex flexDir={"column"} gap={"10px"}>
                        <Flex color={"#848484"}>STORAGE USAGE</Flex>
                        <Flex flexDir={"column"}>
                          <Flex flexDir={"column"}>
                            <Flex
                              justify={"space-between"}
                              alignItems={"center"}
                            >
                              <Flex fontSize={"20px"} fontWeight={700}>
                                {Math.trunc(
                                  (storageUsage / 50 / 1024 / 1024 / 1024) *
                                    100 *
                                    100
                                ) / 100}
                                %
                              </Flex>
                              <Flex fontSize={"14px"} color={"#848484"}>
                                {formatBytes(storageUsage)} / 50 GB
                              </Flex>
                            </Flex>

                            <VStack align="stretch" spacing={4}>
                              <Flex
                                w="100%"
                                h="12px"
                                overflow="hidden"
                                boxShadow="sm"
                                bg={"#dedede"}
                              >
                                <Box
                                  w={`${
                                    (storageUsage / 50 / 1024 / 1024 / 1024) *
                                    100
                                  }%`}
                                  bg={"#dc143c"}
                                  transition="width 0.3s ease"
                                />
                              </Flex>
                            </VStack>
                          </Flex>
                          <Flex fontSize={"14px"} color={"#848484"}>
                            Can be upgraded from current plan
                          </Flex>
                        </Flex>
                      </Flex>
                    </Flex>
                  </Flex> */}
                </Flex>
              </Flex>

              {/* <Flex
                w={"50%"}
                flexDir={"column"}
                gap={"10px"}
                justify={"space-between"}
              >
                <Flex flexDir={"column"}>
                  <Flex color={"#dc143c"} fontSize={"20px"} fontWeight={700}>
                    Storage Usage
                  </Flex>
                  <Flex color={"#848484"}>
                    Manage payment method and billing information.
                  </Flex>
                </Flex>
                <Flex flexDir={"column"}>
                  <Flex justify={"space-between"} alignItems={"center"}>
                    <Flex fontSize={"20px"} fontWeight={700}>
                      33%
                    </Flex>
                    <Flex fontSize={"14px"} color={"#848484"}>
                      24GB / 500GB
                    </Flex>
                  </Flex>

                  <VStack align="stretch" spacing={4}>
                    <Flex
                      w="100%"
                      h="12px"
                      overflow="hidden"
                      boxShadow="sm"
                      bg={"#ededed"}
                    >
                      {storageUsage.map((item, index) => (
                        <Box
                          key={index}
                          w={`${(item.byte / 500 / 1024 / 1024 / 1024) * 100}%`}
                          bg={item.color}
                          transition="width 0.3s ease"
                        />
                      ))}
                    </Flex>
                  </VStack>
                </Flex>
                <Flex flexDir={"column"} gap={"10px"}>
                  {storageUsage.map((item, index) => (
                    <Flex
                      key={index}
                      fontSize={"14px"}
                      color={"#848484"}
                      alignItems={"center"}
                      justify={"space-between"}
                    >
                      <Flex alignItems={"center"} gap={"10px"}>
                        <Flex h={"16px"} w={"16px"} bg={item.color}></Flex>
                        <Flex color={"black"} fontWeight={700}>
                          {item.label}
                        </Flex>
                      </Flex>
                      <Flex>7.34 GB</Flex>
                    </Flex>
                  ))}
                </Flex>
              </Flex>
              <Flex flexDir={"column"} gap={"10px"}>
                <Flex justify={"space-between"} alignItems={"center"}>
                  <Flex flexDir={"column"}>
                    <Flex color={"#dc143c"} fontSize={"20px"} fontWeight={700}>
                      Payment Method
                    </Flex>
                    <Flex color={"#848484"}>
                      Manage payment method and billing information.
                    </Flex>
                  </Flex>
                </Flex>
                {subscription.last4_card ? (
                  <Flex justify={"space-between"} alignItems={"center"}>
                    <Flex alignItems={"center"} gap={"20px"}>
                      <Flex
                        p={"5px"}
                        boxShadow={"0px 0px 3px rgba(50,50,93,0.5)"}
                      >
                        <Image h={"32px"} src={VisaLogo} />
                      </Flex>
                      <Flex flexDir={"column"}>
                        <Flex fontSize={"12px"}>
                          <LuAsterisk />
                          <LuAsterisk />
                          <LuAsterisk />
                          <LuAsterisk />
                          &nbsp; &nbsp; &nbsp;
                          <LuAsterisk />
                          <LuAsterisk />
                          <LuAsterisk />
                          <LuAsterisk />
                          &nbsp; &nbsp; &nbsp;
                          <LuAsterisk />
                          <LuAsterisk />
                          <LuAsterisk />
                          <LuAsterisk />
                          &nbsp; &nbsp; &nbsp;
                          <Flex
                            fontSize={"14px"}
                            letterSpacing={"4px"}
                            fontWeight={700}
                          >
                            {subscription?.last4_card}
                          </Flex>
                        </Flex>
                        <Flex color={"#848484"} fontSize={"14px"}>
                          Expiry in {subscription?.expired}
                        </Flex>
                      </Flex>
                    </Flex>
                    <Flex>
                      <Button
                        bg={"white"}
                        color={"#dc143c"}
                        h={"32px"}
                        fontSize={"14px"}
                        px={"10px"}
                        _hover={{ bg: "#dc143c", color: "white" }}
                        border={"1px solid #dc143c"}
                        onClick={() => {
                          changePaymentMethod();
                        }}
                      >
                        Manage
                      </Button>
                    </Flex>
                  </Flex>
                ) : (
                  <Flex flexDir={"column"}>
                    <Flex alignItems={"center"} gap={"20px"}>
                      <Flex>
                        <Flex
                          fontSize={"36px"}
                          p={"12px"}
                          bg={"#ededed"}
                          borderRadius={"full"}
                          color={"#848484"}
                        >
                          <FaRegCreditCard />
                        </Flex>
                      </Flex>
                      <Flex flexDir={"column"}>
                        <Flex fontWeight={700}>No Payment Setup</Flex>
                        <Flex color={"#848484"} fontSize={"14px"}>
                          Subscribe to a plan first to add and manage your
                          payment method.
                        </Flex>
                      </Flex>
                    </Flex>
                  </Flex>
                )}
              </Flex> */}
              {/* <Flex flexDir={"column"} gap={"10px"}>
                <Flex justify={"space-between"} alignItems={"center"}>
                  <Flex flexDir={"column"}>
                    <Flex color={"#dc143c"} fontSize={"20px"} fontWeight={700}>
                      Billing History
                    </Flex>

                    <Flex color={"#848484"}>
                      View your past payments and invoices.
                    </Flex>
                  </Flex>
                  <Flex>
                    <Button
                      h={"32px"}
                      color={"#dc143c"}
                      bg={"white"}
                      fontSize={"14px"}
                      px={"10px"}
                      border={"1px solid #dc143c"}
                    >
                      <Flex alignItems={"center"} gap={"5px"}>
                        <Flex>
                          <IoMdDownload />
                        </Flex>
                        <Flex>Download All</Flex>
                      </Flex>
                    </Button>
                  </Flex>
                </Flex>
                <Flex position={"relative"}>
                  <TableContainer
                    w={"100%"}
                    boxShadow={"0px 0px 3px rgba(50,50,93,0.5)"}
                  >
                    <Table variant="simple">
                      <Thead bg={"#ECEFF3"}>
                        <Tr>
                          <Th
                            borderBottomColor={"#bababa"}
                            fontWeight={700}
                            fontSize={"12px"}
                            w={"55%"}
                          >
                            Invoice
                          </Th>
                          <Th
                            borderBottomColor={"#bababa"}
                            fontWeight={700}
                            fontSize={"12px"}
                            w={"15%"}
                          >
                            Amount
                          </Th>

                          <Th
                            borderBottomColor={"#bababa"}
                            fontWeight={700}
                            fontSize={"12px"}
                            w={"15%"}
                          >
                            Date
                          </Th>
                          <Th
                            borderBottomColor={"#bababa"}
                            fontWeight={700}
                            fontSize={"12px"}
                            w={"10%"}
                          >
                            Status
                          </Th>
                          <Th
                            borderBottomColor={"#bababa"}
                            fontWeight={700}
                            fontSize={"12px"}
                            w={"5%"}
                          >
                            Download
                          </Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {subscription?.user?.billing_history.length ? (
                          subscription?.user?.billing_history?.map(
                            (billing, index) => (
                              <Tr fontSize={"14px"}>
                                <Td
                                  borderBottomColor={"#bababa"}
                                  fontWeight={700}
                                >
                                  {billing.plan} Plan -{" "}
                                  {moment(billing?.webhook_delivered_at).format(
                                    "MMM YYYY"
                                  )}
                                </Td>

                                <Td
                                  borderBottomColor={"#bababa"}
                                  color={"#292D3F"}
                                  fontWeight={700}
                                >
                                  {billing.currency} ${billing.amount}
                                </Td>
                                <Td
                                  borderBottomColor={"#bababa"}
                                  color={"#292D3F"}
                                  fontWeight={700}
                                >
                                  {moment(billing?.webhook_delivered_at).format(
                                    "Do MMMM YYYY"
                                  )}
                                </Td>
                                <Td
                                  borderBottomColor={"#bababa"}
                                  color={"#292D3F"}
                                  fontWeight={700}
                                >
                                  {capitalizeFirst(billing.status)}
                                </Td>
                                <Td
                                  borderBottomColor={"#bababa"}
                                  color={"#292D3F"}
                                  fontWeight={700}
                                >
                                  <Flex justify={"center"}>
                                    <Tooltip
                                      hasArrow
                                      placement={"top"}
                                      label="Download QR Code"
                                      aria-label="A tooltip"
                                      bg={"#28A745"}
                                      color={"white"}
                                    >
                                      <Flex
                                        color={"#28A745"}
                                        justify={"center"}
                                        fontSize={"20px"}
                                        onClick={() =>
                                          window.open(
                                            billing?.hosted_invoice_url || "#",
                                            "_blank",
                                            "noopener,noreferrer"
                                          )
                                        }
                                        cursor={"pointer"}
                                      >
                                        <IoMdDownload />
                                      </Flex>
                                    </Tooltip>
                                  </Flex>
                                </Td>
                              </Tr>
                            )
                          )
                        ) : (
                          <ListEmptyState
                            colSpan={5}
                            header1={"No billing history found."}
                            header2={
                              "Subscribe to our plans to begin tracking them."
                            }
                            // linkText={"Subscribe to our plans"}
                          />
                        )}
                      </Tbody>
                    </Table>
                  </TableContainer>
                </Flex>
                <Pagination
                  setCurrentPage={setCurrentPage}
                  totalPages={totalPages}
                  currentPage={currentPage}
                  from={from}
                  rows={rows}
                  handleChange={handleChange}
                  showing={showing}
                />
              </Flex> */}
            </Flex>
          )
        ) : (
          <Flex w={"100%"} gap={"30px"} pb={"60px"}>
            <Flex w={"65%"} flexDir={"column"} gap={"20px"}>
              <Flex flexDir={"column"} gap={"20px"}>
                <Flex position={"relative"} flexDir={"column"} gap={"10px"}>
                  <Flex color={"#dc143c"} fontSize={"20px"} fontWeight={700}>
                    Account
                  </Flex>
                  <Flex justify={"space-between"} alignItems={"center"}>
                    <Flex gap={"10px"} alignItems={"center"}>
                      <Flex borderRadius={"100%"} border={"2px solid #dc143c"}>
                        <Avatar
                          outline={"1px solid #dc143c"}
                          cursor={"pointer"}
                          onClick={handleProfileInputClick}
                          size={"lg"}
                          color={"black"}
                          bg={profileImagePreview ? "white" : "gray.400"}
                          src={profileImagePreview}
                          border={"2px solid white"}
                        />
                      </Flex>
                      <Flex flexDir={"column"}>
                        <Flex fontWeight={700} alignItems={"center"}>
                          <Flex>Profile Picture&nbsp;</Flex>
                          <Flex
                            fontSize={"14px"}
                            fontWeight={400}
                            color={"#848484"}
                          >
                            ( Max 2 MB ){" "}
                          </Flex>
                        </Flex>
                        <Flex fontSize={"14px"}>
                          {/* <Flex fontWeight={700}>Profile Picture</Flex> */}
                          <Flex color={"#848484"}>JPG, PNG, JPEG Only</Flex>
                        </Flex>
                      </Flex>
                    </Flex>
                    {errors.profileImage ? (
                      <Flex
                        position={"absolute"}
                        left={0}
                        bottom={0}
                        color="crimson"
                        fontSize="14px"
                        gap="5px"
                        alignItems="center"
                      >
                        <FaTriangleExclamation />
                        <Flex>{errors.profileImage.message}</Flex>
                      </Flex>
                    ) : (
                      ""
                    )}
                    <Input
                      id="profileImage"
                      {...register("profileImage")}
                      ref={(e) => {
                        profileImageInputRef.current = e;
                        register("profileImage").ref(e);
                      }}
                      onChange={(e) => {
                        handleFileChange(e);
                      }}
                      display={"none"}
                      type="file"
                      accept="image/png, image/jpeg"
                    ></Input>

                    <Flex gap={"10px"}>
                      <Button
                        display={profileImagePreview ? "none" : "block"}
                        fontSize={"14px"}
                        h={"28px"}
                        bg={"#dc143c"}
                        color={"white"}
                        px={"8px"}
                        onClick={handleProfileInputClick}
                      >
                        Upload New Picture
                      </Button>
                      <Button
                        id="profile"
                        _hover={{ background: "#dc143c", color: "white" }}
                        fontSize={"14px"}
                        h={"28px"}
                        bg={"white"}
                        border={"1px solid #dc143c"}
                        color={"#dc143c"}
                        px={"8px"}
                        onClick={deleteImage}
                      >
                        <Flex gap={"5px"} alignItems={"center"}>
                          <Flex>
                            <FaTrashAlt />
                          </Flex>
                          <Flex>Delete</Flex>
                        </Flex>
                      </Button>
                    </Flex>
                  </Flex>
                </Flex>

                <Flex gap={"10px"} flexDir={"column"}>
                  <Flex w={"100%"} gap={"20px"} justify={"space-between"}>
                    <Flex
                      w={"100%"}
                      position={"relative"}
                      pb={"20px"}
                      flexDir={"column"}
                    >
                      <Flex flexDir={"column"}>
                        <Box
                          fontWeight={700}
                          as="span"
                          flex="1"
                          textAlign="left"
                        >
                          First Name&nbsp;
                          <Box as="span" color={"#dc143c"}>
                            *
                          </Box>
                        </Box>
                        <Flex
                          textAlign={"center"}
                          fontSize={"14px"}
                          color={"#848484"}
                          justifyContent={"space-between"}
                        >
                          <Flex>Enter your first name.</Flex>
                        </Flex>
                      </Flex>
                      <Flex>
                        <Input
                          {...register("firstName")}
                          border={
                            errors.firstName
                              ? "1px solid crimson"
                              : "1px solid #E2E8F0"
                          }
                          placeholder="First Name"
                        ></Input>
                      </Flex>
                      {errors.firstName ? (
                        <Flex
                          position={"absolute"}
                          left={0}
                          bottom={0}
                          color="crimson"
                          fontSize="14px"
                          gap="5px"
                          alignItems="center"
                        >
                          <FaTriangleExclamation />
                          <Flex>{errors.firstName.message}</Flex>
                        </Flex>
                      ) : (
                        ""
                      )}
                    </Flex>
                    <Flex
                      w={"100%"}
                      position={"relative"}
                      pb={"20px"}
                      flexDir={"column"}
                    >
                      <Flex flexDir={"column"}>
                        <Box
                          fontWeight={700}
                          as="span"
                          flex="1"
                          textAlign="left"
                        >
                          Last Name&nbsp;
                          <Box as="span" color={"#dc143c"}>
                            *
                          </Box>
                        </Box>
                        <Flex
                          textAlign={"center"}
                          fontSize={"14px"}
                          color={"#848484"}
                          justifyContent={"space-between"}
                        >
                          <Flex>Enter your last name.</Flex>
                        </Flex>
                      </Flex>
                      <Flex>
                        <Input
                          {...register("lastName")}
                          border={
                            errors.lastName
                              ? "1px solid crimson"
                              : "1px solid #E2E8F0"
                          }
                          placeholder="Last Name"
                        ></Input>
                      </Flex>
                      {errors.lastName ? (
                        <Flex
                          position={"absolute"}
                          left={0}
                          bottom={0}
                          color="crimson"
                          fontSize="14px"
                          gap="5px"
                          alignItems="center"
                        >
                          <FaTriangleExclamation />
                          <Flex>{errors.lastName.message}</Flex>
                        </Flex>
                      ) : (
                        ""
                      )}
                    </Flex>
                  </Flex>
                  <Flex gap={"20px"}>
                    <Flex
                      w={"100%"}
                      position={"relative"}
                      pb={"20px"}
                      flexDir={"column"}
                    >
                      <Flex flexDir={"column"}>
                        <Box
                          fontWeight={700}
                          as="span"
                          flex="1"
                          textAlign="left"
                        >
                          Email
                        </Box>
                        <Flex
                          textAlign={"center"}
                          fontSize={"14px"}
                          color={"#848484"}
                          justifyContent={"space-between"}
                        >
                          <Flex>You're account's email address.</Flex>
                        </Flex>
                      </Flex>
                      <Flex>
                        <Input
                          bg={"#ededed"}
                          isDisabled={true}
                          // {...register("email")}
                          // border={
                          //   errors.email ? "1px solid crimson" : "1px solid #E2E8F0"
                          // }
                          // placeholder="Email"
                          value={userSelector.email}
                        ></Input>
                      </Flex>
                    </Flex>
                    <Flex
                      w={"100%"}
                      position={"relative"}
                      pb={"20px"}
                      flexDir={"column"}
                    >
                      <Flex flexDir={"column"}>
                        <Box
                          fontWeight={700}
                          as="span"
                          flex="1"
                          textAlign="left"
                        >
                          Phone Number (
                          <Box as="span" color={"#848484"}>
                            Optional
                          </Box>
                          )
                        </Box>
                        <Flex
                          textAlign={"center"}
                          fontSize={"14px"}
                          color={"#848484"}
                          justifyContent={"space-between"}
                        >
                          <Flex>Enter your phone number.</Flex>
                        </Flex>
                      </Flex>
                      <Flex>
                        <Input
                          {...register("phoneNumber")}
                          border={
                            errors.phoneNumber
                              ? "1px solid crimson"
                              : "1px solid #E2E8F0"
                          }
                          placeholder="Phone Number"
                        ></Input>
                      </Flex>
                      {errors.phoneNumber ? (
                        <Flex
                          position={"absolute"}
                          left={0}
                          bottom={0}
                          color="crimson"
                          fontSize="14px"
                          gap="5px"
                          alignItems="center"
                        >
                          <FaTriangleExclamation />
                          <Flex>{errors.phoneNumber.message}</Flex>
                        </Flex>
                      ) : (
                        ""
                      )}
                    </Flex>
                  </Flex>

                  <Flex justify={"end"} alignItems={"center"} gap={"20px"}>
                    {isAccountInputChanged ? <ChangesDetectedWarning /> : ""}
                    <Button
                      isLoading={buttonLoading}
                      _hover={{
                        background: tinycolor("#dc143c").darken(5).toString(),
                      }}
                      fontSize={"14px"}
                      h={"32px"}
                      px={"8px"}
                      gap={"5px"}
                      color={"white"}
                      bg={"#dc143c"}
                      onClick={handleSubmit(submitEditAccount)}
                    >
                      <Flex fontSize={"18px"}>
                        <HiMiniPencilSquare />
                      </Flex>
                      <Flex>Save Profile</Flex>
                    </Button>
                  </Flex>
                </Flex>
              </Flex>
              <Flex flexDir={"column"} gap={"10px"}>
                <Flex color={"#dc143c"} fontSize={"20px"} fontWeight={700}>
                  Security
                </Flex>
                <Flex flexDir={"column"} gap={"20px"}>
                  <Flex alignItems={"center"} justify={"space-between"}>
                    <Flex gap={"10px"} alignItems={"center"}>
                      <Flex flexDir={"column"}>
                        <Flex fontWeight={700}>Two Factor Authentication</Flex>
                        <Flex color={"#848484"} fontSize={"14px"}>
                          Adds an extra layer of security by requiring a
                          one-time code when signing in.
                        </Flex>
                      </Flex>
                    </Flex>
                    <Flex alignItems={"center"} gap={"10px"}>
                      {TFASwitchLoading ? (
                        <Flex alignItems={"center"} gap={"5px"}>
                          <Spinner
                            color="#848484"
                            thickness="3px"
                            emptyColor="#ededed"
                          />
                        </Flex>
                      ) : (
                        ""
                      )}
                      <Switch
                        isDisabled={TFASwitchLoading}
                        size="lg"
                        isChecked={userSelector.is_2fa_enabled}
                        onChange={handleToggleTFA}
                      />
                    </Flex>
                    {/* <Button
                      border={"1px solid #dc143c"}
                      color={"#dc143c"}
                      bg={"white"}
                      h={"32px"}
                      px={"8px"}
                      fontSize={"14px"}
                    >
                      Change Method
                    </Button> */}
                  </Flex>
                  <Flex
                    opacity={
                      userSelector.is_2fa_enabled && !TFASwitchLoading ? 1 : 0.6
                    }
                    pl={"10px"}
                    fontSize={"14px"}
                    flexDir={"column"}
                  >
                    <Flex
                      cursor={
                        userSelector.is_2fa_enabled && !TFASwitchLoading
                          ? "pointer"
                          : "not-allowed"
                      }
                      _hover={
                        userSelector.is_2fa_enabled && !TFASwitchLoading
                          ? { bg: "#ededed" }
                          : ""
                      }
                      p={"10px"}
                      justify={"space-between"}
                      onClick={
                        userSelector.is_2fa_enabled &&
                        !TFASwitchLoading &&
                        userSelector.two_factor_type_default !== "email"
                          ? () => handleOpenSetToDefaultTFAModal("email")
                          : ""
                      }
                      alignItems={"center"}
                    >
                      <Flex gap={"10px"}>
                        <Flex fontSize={"24px"}>
                          <MdOutlineMailLock />
                        </Flex>
                        <Flex flexDir={"column"}>
                          <Flex gap={"5px"} alignItems={"center"}>
                            <Flex fontWeight={700}>Email Verification</Flex>
                            <Flex color={"#3D9666"} fontSize={"20px"}>
                              <IoIosCheckmarkCircle />
                            </Flex>
                            {userSelector.two_factor_type_default ===
                            "email" ? (
                              <Flex
                                fontWeight={700}
                                fontSize={"12px"}
                                color={"#dc143c"}
                                border={"2px solid #dc143c"}
                                px={"4px"}
                                py={"0px"}
                              >
                                Default
                              </Flex>
                            ) : (
                              ""
                            )}
                          </Flex>
                          <Flex color={"#848484"}>
                            A verification code will be sent to your email
                            address for secure sign-in.
                          </Flex>
                        </Flex>
                      </Flex>
                    </Flex>
                    <Flex
                      role="group"
                      cursor={
                        userSelector.is_2fa_enabled && !TFASwitchLoading
                          ? "pointer"
                          : "not-allowed"
                      }
                      _hover={
                        userSelector.is_2fa_enabled && !TFASwitchLoading
                          ? { bg: "#ededed" }
                          : ""
                      }
                      onClick={
                        userSelector.is_2fa_enabled &&
                        !TFASwitchLoading &&
                        userSelector.two_factor_type_default !==
                          "google_auth" &&
                        userSelector.is_valid_2fa
                          ? () => handleOpenSetToDefaultTFAModal("google_auth")
                          : ""
                      }
                      justify={"space-between"}
                      p={"10px"}
                      alignItems={"center"}
                      gap={"10px"}
                    >
                      <Flex gap={"10px"}>
                        <Flex fontSize={"24px"}>
                          <FcGoogle />
                        </Flex>
                        <Flex flexDir={"column"}>
                          <Flex gap={"5px"} alignItems={"center"}>
                            <Flex fontWeight={700}>Google Authenticator</Flex>

                            <Flex alignItems={"center"} gap={"5px"}>
                              {userSelector.is_valid_2fa ? (
                                <Flex color={"#3D9666"} fontSize={"20px"}>
                                  <IoIosCheckmarkCircle />
                                </Flex>
                              ) : (
                                ""
                              )}
                              {userSelector.two_factor_type_default ===
                              "google_auth" ? (
                                <Flex
                                  fontWeight={700}
                                  fontSize={"12px"}
                                  color={"#dc143c"}
                                  border={"2px solid #dc143c"}
                                  px={"4px"}
                                  py={"0px"}
                                >
                                  Default
                                </Flex>
                              ) : (
                                ""
                              )}
                            </Flex>
                          </Flex>
                          <Flex color={"#848484"}>
                            Use the Google Authenticator app to generate secure
                            one-time codes for signing in.
                          </Flex>
                        </Flex>
                      </Flex>
                      <Flex alignItems={"center"} gap={"10px"}>
                        {!userSelector.is_valid_2fa ? (
                          <ConnectGoogleAuthModal
                            isDisabled={
                              !(
                                userSelector.is_2fa_enabled && !TFASwitchLoading
                              )
                            }
                            refreshQrCode={refreshQrCode}
                            QRLoading={QRLoading}
                            QRCodeUrl={QRCodeUrl}
                          />
                        ) : (
                          <Flex
                            alignItems={"center"}
                            gap={"5px"}
                            fontSize={"24px"}
                          >
                            <DeleteMethodConfirmationModal
                              buttonLoading={deleteGoogle2FALoading}
                              submitFn={deleteGoogle2FA}
                            />
                          </Flex>
                        )}
                      </Flex>
                    </Flex>
                  </Flex>
                  {/* </Collapse> */}
                </Flex>
              </Flex>
              {/* -X Hide for production */}
              {/* {userSelector.role === "super_admin" && (
                <>
                  <Flex w={"100%"} bg={"#ededed"} h={"1px"}></Flex>
                  <Flex flexDir={"column"} gap={"20px"}>
                    <Flex position={"relative"} flexDir={"column"} gap={"10px"}>
                      <Flex flexDir={"column"}>
                        <Flex
                          color={"#dc143c"}
                          fontSize={"20px"}
                          fontWeight={700}
                        >
                          Company Profile (
                          <Box as="span" color={"#848484"}>
                            Optional
                          </Box>
                          )
                        </Flex>
                        <Flex fontSize={"14px"} color={"#848484"}>
                          * This information will be used in reports, invoices,
                          and emails when needed.
                        </Flex>
                      </Flex>
                      <Flex justify={"space-between"} alignItems={"center"}>
                        <Flex gap={"10px"} alignItems={"center"}>
                          <Flex
                            borderRadius={"100%"}
                            border={"2px solid #dc143c"}
                          >
                            <Flex
                              background={
                                companyLogoImagePreview ? "" : "#A0AEC0"
                              }
                              justifyContent={"center"}
                              alignItems={"center"}
                              h={"60px"}
                              w={"60px"}
                              borderRadius={"100%"}
                              border={"3px solid white"}
                            
                            >
                              <Flex color={"white"} fontSize={"28px"}>
                                {companyLogoImagePreview ? (
                                  <Avatar
                                    outline={"1px solid #dc143c"}
                                    cursor={"pointer"}
                                    onClick={handleCompanyInputClick}
                                    size={"lg"}
                                    color={"black"}
                                    bg={
                                      companyLogoImagePreview
                                        ? "white"
                                        : "gray.400"
                                    }
                                    src={companyLogoImagePreview}
                                    border={"2px solid white"}
                                  />
                                ) : (
                                  <MdWork />
                                )}
                              </Flex>
                            </Flex>
                          </Flex>
                          <Flex flexDir={"column"}>
                            <Flex fontWeight={700} alignItems={"center"}>
                              <Flex>Company Logo&nbsp;</Flex>
                              <Flex
                                fontSize={"14px"}
                                fontWeight={400}
                                color={"#848484"}
                              >
                                ( Max 2 MB ){" "}
                              </Flex>
                            </Flex>
                            <Flex fontSize={"14px"}>
                              <Flex color={"#848484"}>JPG, PNG, JPEG Only</Flex>
                            </Flex>
                          </Flex>
                        </Flex>
                        <Input
                          id="companyLogo"
                          ref={(e) => {
                            companyImageInputRef.current = e;
                          }}
                          onChange={(e) => {
                            handleFileChange(e);
                          }}
                          display={"none"}
                          type="file"
                          accept="image/png, image/jpeg"
                        ></Input>

                        <Flex gap={"10px"}>
                          <Button
                            fontSize={"14px"}
                            h={"28px"}
                            bg={"#dc143c"}
                            color={"white"}
                            px={"8px"}
                            onClick={handleCompanyInputClick}
                          >
                            Upload New Picture
                          </Button>
                          <Button
                            id="companyLogo"
                            fontSize={"14px"}
                            h={"28px"}
                            bg={"white"}
                            border={"1px solid #dc143c"}
                            color={"#dc143c"}
                            px={"8px"}
                            onClick={deleteImage}
                          >
                            Delete
                          </Button>
                        </Flex>
                      </Flex>
                    </Flex>

                    <Flex gap={"10px"} flexDir={"column"}>
                      <Flex w={"100%"} flexDir={"column"}>
                        <Flex
                          w={"100%"}
                          position={"relative"}
                          pb={"20px"}
                          flexDir={"column"}
                        >
                          <Flex flexDir={"column"}>
                            <Box
                              fontWeight={700}
                              as="span"
                              flex="1"
                              textAlign="left"
                            >
                              Company Name
                            </Box>
                            <Flex
                              textAlign={"center"}
                              fontSize={"14px"}
                              color={"#848484"}
                              justifyContent={"space-between"}
                            >
                              <Flex>Enter your company's name.</Flex>
                            </Flex>
                          </Flex>
                          <Flex>
                            <Input
                              {...register("companyName")}
                              placeholder="Company Name"
                            ></Input>
                          </Flex>
                        </Flex>
                      </Flex>

                      <Flex justify={"end"} alignItems={"center"} gap={"20px"}>
                        {isCompanyDetailsChanged ? (
                          <ChangesDetectedWarning />
                        ) : (
                          ""
                        )}
                        <Button
                          isLoading={buttonLoading}
                          fontSize={"14px"}
                          h={"32px"}
                          px={"8px"}
                          gap={"5px"}
                          color={"white"}
                          bg={"#dc143c"}
                          onClick={submitCompanyProfile}
                        >
                          <Flex fontSize={"18px"}>
                            <HiMiniPencilSquare />
                          </Flex>
                          <Flex>Save Company</Flex>
                        </Button>
                      </Flex>
                    </Flex>
                  </Flex>
                </>
              )}
              <Flex w={"100%"} bg={"#ededed"} h={"1px"}></Flex>
              <Flex flexDir={"column"} gap={"10px"}>
                <Flex color={"#dc143c"} fontSize={"20px"} fontWeight={700}>
                  Preferences
                </Flex>
                <Flex flexDir={"column"} gap={"20px"}>
                  <Flex alignItems={"center"} justify={"space-between"}>
                    <Flex flexDir={"column"}>
                      <Flex fontWeight={700}>Language</Flex>
                      <Flex color={"#848484"}>English (United States)</Flex>
                    </Flex>
                    <Button
                      border={"1px solid #dc143c"}
                      color={"#dc143c"}
                      bg={"white"}
                      h={"32px"}
                      px={"8px"}
                      fontSize={"14px"}
                    >
                      Change
                    </Button>
                  </Flex>
                  <Flex alignItems={"center"} justify={"space-between"}>
                    <Flex flexDir={"column"}>
                      <Flex fontWeight={700}>Theme</Flex>
                      <Flex color={"#848484"}>Default </Flex>
                    </Flex>
                    <Button
                      border={"1px solid #dc143c"}
                      color={"#dc143c"}
                      bg={"white"}
                      h={"32px"}
                      px={"8px"}
                      fontSize={"14px"}
                    >
                      Change
                    </Button>
                  </Flex>
                </Flex>
              </Flex> */}
            </Flex>
            <Flex h={"100%"} w={"1px"} bg={"#ededed"}></Flex>
            <Flex w={"35%"} flexDir={"column"} gap={"20px"}>
              <Flex
                bg={"#f8f9fa"}
                p={"20px"}
                boxShadow={"0px 0px 3px rgba(50,50,93,0.5)"}
                flexDir={"column"}
                gap={"10px"}
              >
                <Flex flexDir={"column"}>
                  <Flex color={"#dc143c"} fontSize={"20px"} fontWeight={700}>
                    Change Password
                  </Flex>
                  <Flex fontSize={"14px"} color={"#848484"}>
                    Change your password regularly to enhance security and
                    protect your account.
                  </Flex>
                </Flex>
                <ChangePasswordModal />
              </Flex>
              {/* 
              <Flex
                bg={"#f8f9fa"}
                p={"20px"}
                boxShadow={"0px 0px 3px rgba(50,50,93,0.5)"}
                flexDir={"column"}
                gap={"10px"}
              >
                <Flex flexDir={"column"}>
                  <Flex color={"#dc143c"} fontSize={"20px"} fontWeight={700}>
                    Delete Account
                  </Flex>
                  <Flex fontSize={"14px"} color={"#848484"}>
                    Permanently delete your account, along with all associated
                    data. This action cannot be undone.
                  </Flex>
                </Flex>
                <Button
                  h={"32px"}
                  bg={"white"}
                  border={"1px solid #dc143c"}
                  color={"#dc143c"}
                  px={"8px"}
                >
                  Delete Account
                </Button>
              </Flex> */}
            </Flex>
          </Flex>
        )}
        <SetToDefaultTFAConfirmationModal
          setToDefaultTFADisclosure={setToDefaultTFADisclosure}
          selectedTFA={selectedTFA}
          buttonLoading={TFAButtonLoading}
          closeSetToDefaultTFAModal={closeSetToDefaultTFAModal}
          submitFn={submitDefaultTFA}
        />
        <CancelSubscriptionConfirmationModal
          cancelSubscriptionAtPeriodEnd={cancelSubscriptionAtPeriodEnd}
          onClose={cancelSubscriptionModalDisclosure.onClose}
          isOpen={cancelSubscriptionModalDisclosure.isOpen}
          buttonLoading={cancelSubscriptionButtonLoading}
        />
      </Flex>
    );
  }
}
