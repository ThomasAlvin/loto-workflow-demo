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
import { yupResolver } from "@hookform/resolvers/yup";
import parsePhoneNumberFromString from "libphonenumber-js";
import { useCallback, useEffect, useRef, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { FaTrashAlt } from "react-icons/fa";
import { FaTriangleExclamation } from "react-icons/fa6";
import { FcGoogle } from "react-icons/fc";
import { HiMiniPencilSquare } from "react-icons/hi2";
import { IoIosCheckmarkCircle } from "react-icons/io";
import { MdOutlineMailLock } from "react-icons/md";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useSearchParams } from "react-router-dom";
import Swal from "sweetalert2";
import tinycolor from "tinycolor2";
import * as Yup from "yup";
import { api } from "../api/api";
import ChangePasswordModal from "../components/AccountSettings/ChangePasswordModal";
import ChangesDetectedWarning from "../components/AccountSettings/ChangesDetectedWarning";
import ConnectGoogleAuthModal from "../components/AccountSettings/ConnectGoogleAuthModal";
import DeleteMethodConfirmationModal from "../components/AccountSettings/DeleteMethodConfirmationModal";
import SetToDefaultTFAConfirmationModal from "../components/AccountSettings/SetToDefaultTFAConfirmationModal";
import SubscriptionStatus from "../components/AccountSettings/SubscriptionStatus";
import Can from "../components/Can";
import CountryPhoneNumberInput from "../components/CountryPhoneNumberInput";
import SwalErrorMessages from "../components/SwalErrorMessages";
import checkHasPermission from "../utils/checkHasPermission";
import convertToFormData from "../utils/convertToFormData";
import getPhoneCountryDetailsByCountryCode from "../utils/getPhoneCountryDetailsByCountryCode";
import removeCountryCode from "../utils/removeCountryCode";
export default function AccountSettingsPage() {
  const pageModule = "subscription";
  const [searchParams] = useSearchParams();
  const [QRLoading, setQRLoading] = useState(false);
  const [deleteGoogle2FALoading, setDeleteGoogle2FALoading] = useState(false);
  const [QRCodeUrl, setQRCodeURL] = useState("");
  const paramsTab = searchParams.get("tab");
  const [tab, setTab] = useState("");
  const userSelector = useSelector((state) => state.login.auth);
  const [storageUsage, setStorageUsage] = useState(20000000);
  const [selectedTFA, setSelectedTFA] = useState({
    label: "email verification",
    value: "email",
  });
  const [buttonLoading, setButtonLoading] = useState();
  const [TFASwitchLoading, setTFASwitchLoading] = useState(false);
  const [TFAButtonLoading, setTFAButtonLoading] = useState(false);
  const [profileImagePreview, setProfileImagePreview] = useState(
    userSelector.profile_image_url ? userSelector.profile_image_url : ""
  );
  const setToDefaultTFADisclosure = useDisclosure();
  const nav = useNavigate();
  const dispatch = useDispatch();
  const profileImageInputRef = useRef(null);
  const initialValue = {
    firstName: userSelector.first_name,
    lastName: userSelector.last_name,
    phoneNumber: removeCountryCode(userSelector.phone_number) || "",
    phoneCountry: getPhoneCountryDetailsByCountryCode(
      userSelector.phone_country
    ) || {
      value: "US",
      name: "United States",
      callingCode: "+1",
    },
    profileImage: "",
    deleteProfileImage: userSelector.profile_image_url ? false : true,
  };

  const {
    reset,
    control,
    watch,
    register,
    handleSubmit,
    getValues,
    setValue,
    trigger,
    formState: { errors, touchedFields, isDirty },
  } = useForm({
    defaultValues: initialValue,
    resolver: yupResolver(
      Yup.object({
        firstName: Yup.string().trim().required("First name is required"),
        lastName: Yup.string().trim().required("Last name is required"),
        phoneNumber: Yup.string()
          .nullable()
          .transform((value) => (value === "" ? null : value))
          .test(
            "is-valid-phone",
            "Phone number is not valid",
            function (value) {
              const { phoneCountry } = this.parent;

              // If phone number is empty, allow it (optional field)
              if (!value) return true;

              // If number exists but country does not, fail
              if (!phoneCountry.value) return false;

              const phoneNumber = parsePhoneNumberFromString(
                value,
                phoneCountry.value
              );

              return phoneNumber ? phoneNumber.isValid() : false;
            }
          ),
      })
    ),
    mode: "onTouched",
    reValidateMode: "onChange",
  });
  const selectedCountryCode = useWatch({
    control,
    name: "phoneCountry",
  });
  const connectGoogleAuthDisclosure = useDisclosure();

  function tabHandler(event) {
    const { id } = event.target;
    nav("/account-settings?tab=" + id);
  }

  function handleProfileInputClick() {
    profileImageInputRef.current.click();
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
        setValue("profileImage", file);
        setValue("deleteProfileImage", false);
        const imageUrl = URL.createObjectURL(file);
        setProfileImagePreview(imageUrl);
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
  function deleteImageProfile(e) {
    const id = e.target.id;
    setValue("profileImage", "");
    setValue("deleteProfileImage", true);
    setProfileImagePreview("");
  }

  async function submitEditAccount(data) {
    setButtonLoading(true);
    const phoneCountry = data.phoneNumber ? data.phoneCountry.value : "";
    const editInput = {
      ...data,
      phoneNumber: data.phoneNumber
        ? selectedCountryCode.callingCode + data.phoneNumber
        : null,
      phoneCountry,
    };
    const formData = convertToFormData(editInput);
    await api
      .testSubmit("Changes Saved Successfully")
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
        setButtonLoading(false);
      });
  }
  const handleOpenConnectGoogleAuth = (e) => {
    e.stopPropagation();
    refreshQrCode();
    connectGoogleAuthDisclosure.onOpen();
  };
  async function handleToggleTFA(event) {
    const { checked } = event.target;
    setTFASwitchLoading(true);
    await api
      .testSubmit("")
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
      .testSubmit(
        "Your default two-factor authentication method has been updated."
      )
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
      })
      .finally(() => {
        setTFAButtonLoading(false);
        closeSetToDefaultTFAModal();
      });
  };

  async function refreshQrCode() {
    setQRLoading(true);
    await api
      .testSubmit()
      .then(() => {
        setQRCodeURL("DemoQrCode");
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
      .testSubmit("Google Authenticator method has been deleted successfully.")
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
        <Can roles={["guest"]} module={pageModule} permission={["full_access"]}>
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
      {tab === "subscription" &&
      checkHasPermission(
        userSelector,
        pageModule,
        ["full_access"],
        ["guest"]
      ) ? (
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
              <Flex w={"100%"} flexDir={"column"} border={"1px solid #bababa"}>
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
                  <SubscriptionStatus
                    subscription={{
                      status: "active",
                      current_period_end: 1911747599000,
                    }}
                  />
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
                        <Flex justify={"space-between"} alignItems={"center"}>
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
                                (storageUsage / 50 / 1024 / 1024 / 1024) * 100
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
            </Flex>
          </Flex>
        </Flex>
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
                      onClick={deleteImageProfile}
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
                      <Box fontWeight={700} as="span" flex="1" textAlign="left">
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
                      <Box fontWeight={700} as="span" flex="1" textAlign="left">
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
                      <Box fontWeight={700} as="span" flex="1" textAlign="left">
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
                      <Box fontWeight={700} as="span" flex="1" textAlign="left">
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
                      <CountryPhoneNumberInput
                        selectedCountryCodeValue={selectedCountryCode.value}
                        selectedCountryCodeCallingCode={
                          selectedCountryCode.callingCode
                        }
                        setSelectedCountryCode={setValue}
                        registerId={"phoneCountry"}
                        variant={"RHF"}
                        trigger={trigger}
                        border={
                          errors.phoneNumber
                            ? "1px solid crimson"
                            : "1px solid #E2E8F0"
                        }
                        placeholder="555-123-123"
                        {...register("phoneNumber", {
                          onChange: (e) => {
                            e.target.value = e.target.value.replace(
                              /[^\d() -]/g,
                              ""
                            );
                          },
                        })}
                      />
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
                  {isDirty ? <ChangesDetectedWarning /> : ""}
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
                        Adds an extra layer of security by requiring a one-time
                        code when signing in.
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
                          {userSelector.two_factor_type_default === "email" ? (
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
                          A verification code will be sent to your email address
                          for secure sign-in.
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
                      userSelector.two_factor_type_default !== "google_auth" &&
                      userSelector.is_valid_2fa
                        ? () => handleOpenSetToDefaultTFAModal("google_auth")
                        : handleOpenConnectGoogleAuth
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
                            !(userSelector.is_2fa_enabled && !TFASwitchLoading)
                          }
                          isOpen={connectGoogleAuthDisclosure.isOpen}
                          onClose={connectGoogleAuthDisclosure.onClose}
                          onOpen={connectGoogleAuthDisclosure.onOpen}
                          handleOpenConnectGoogleAuth={
                            handleOpenConnectGoogleAuth
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
              </Flex>
            </Flex>
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
                  Change your password regularly to enhance security and protect
                  your account.
                </Flex>
              </Flex>
              <ChangePasswordModal />
            </Flex>
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
    </Flex>
  );
}
