import {
  Avatar,
  Box,
  Button,
  Flex,
  IconButton,
  Input,
  Select,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import { FaRegEdit } from "react-icons/fa";
import { FaCamera, FaLeftLong, FaTriangleExclamation } from "react-icons/fa6";
import { useEffect, useRef, useState } from "react";
import { useLoading } from "../service/LoadingContext";
import { api } from "../api/api";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import Swal from "sweetalert2";
import { ImCheckmark } from "react-icons/im";
import SwalErrorMessages from "../components/SwalErrorMessages";
import ImageFocusOverlay from "../components/ImageFocusOverlay";
import { IoMdClose } from "react-icons/io";
import CustomSelectionSelect from "../components/CustomSelectionSelect";
import setAllFieldsTouched from "../utils/setAllFieldsTouched";
import CustomizeMemberPermissionModal from "../components/Member/CustomizeMemberPermissionModal";
import newRoleSelection from "../constants/NewRoleSelection";
import formatString from "../utils/formatString";
import checkHasPermission from "../utils/checkHasPermission";
import { useSelector } from "react-redux";
import convertToFormData from "../utils/convertToFormData";

export default function EditMemberPage() {
  const pageModule = "members";
  const toast = useToast();
  const location = useLocation();

  const nav = useNavigate();
  const userSelector = useSelector((state) => state.login.auth);
  const filteredNewRoleSelection = newRoleSelection.filter((newRoleOption) => {
    return checkHasPermission(userSelector, pageModule, [
      `manage_${newRoleOption.value}`,
    ]);
  });
  const customizeMemberPermissionDisclosure = useDisclosure();
  const creatableSelectStyles = {
    control: (provided, state) => ({
      ...provided,
      borderColor:
        formik.touched.department && formik.errors.department
          ? "crimson"
          : menuOpen
          ? "blue"
          : "#E2E8F0",
      boxShadow: state.isFocused ? "0 0 0 1px blue" : "none",
      width: "100%",
    }),
    container: (provided) => ({
      ...provided,
      width: "100%",
    }),
    menuList: (base) => ({
      ...base,
      paddingTop: 0, // Remove padding
      paddingBottom: 0,
      width: "100%",
    }),
  };
  const IMGURL = import.meta.env.VITE_API_IMAGE_URL;
  const { UID } = useParams();
  const initialMemberInput = {
    firstName: "",
    lastName: "",
    phoneNumber: "",
    department: "",
    role: "member",
    profileImage: "",
    hasCustomPermissions: false,
    accessibility: [],
    profileImageUrl: "",
  };

  const avatarInput = useRef(); // Create an array of refs
  const [menuOpen, setMenuOpen] = useState(false);
  const [accessibilityOptions, setAccessibilityOptions] = useState([]);
  const [defaultAccessibility, setDefaultAccessibility] = useState([]);
  const [customPermissions, setCustomPermissions] = useState();
  const [customAccessibilityLoading, setCustomAccessibilityLoading] =
    useState(false);
  const [memberInput, setMemberInput] = useState(initialMemberInput);
  const [departmentSelection, setDepartmentSelection] = useState([]);
  const [filteredDepartmentSelection, setFilteredDepartmentSelection] =
    useState([]);
  const [imageFocusURL, setImageFocusURL] = useState();
  const [departmentSelectionLoading, setDepartmentSelectionLoading] =
    useState(false);
  const imageFocusDisclosure = useDisclosure();
  const accessibilitySelection = [
    {
      value: "false",
      // label: `Authorized Employee (By Role)`,
      label: `${formatString(memberInput.role)} (By Role)`,
    },
    {
      value: "true",
      label: `Custom Permissions`,
      permissions: [],
    },
  ];
  const formik = useFormik({
    initialValues: initialMemberInput,
    validationSchema: Yup.object().shape({
      firstName: Yup.string().trim().required("First name is required"),
      lastName: Yup.string().trim().required("Last name is required"),
      department: Yup.object().required("Department is required"),
      // employeeId: Yup.string().trim().required("Employee ID is required"),
      role: Yup.string().trim().required("Role is required"),
      phoneNumber: Yup.string()
        .notRequired()
        .trim()
        .matches(
          /^(\+?[1-9]{1}[0-9]{1,2})?(\s|-|\.)?(\(?[0-9]{1,4}\)?[\s.-]?)?([0-9]{1,4}[\s.-]?[0-9]{1,4})+$/,
          { message: "Invalid phone number format", excludeEmptyString: true }
        ),
    }),
    onSubmit: () => {
      submitMember();
    },
  });
  const { loading, setLoading } = useLoading();

  const triggerAvatarInput = () => {
    avatarInput.current.click();
  };
  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    setMemberInput((prevFiles) => ({
      ...prevFiles,
      [event.target.id]: selectedFile,
    }));
    if (selectedFile) {
      const previewUrl = URL.createObjectURL(selectedFile);
      setMemberInput((prevState) => ({
        ...prevState,
        profileImageUrl: previewUrl,
        deleteProfileImage: false,
      }));
    }
  };
  function deleteImageHandler() {
    setMemberInput((prevState) => ({
      ...prevState,
      profileImage: "",
      profileImageUrl: "",
      deleteProfileImage: true,
    }));
    avatarInput.current.value = ""; // Clear the input value
  }
  function handleImageFocus(imageURL) {
    setImageFocusURL(imageURL);
    imageFocusDisclosure.onOpen();
  }
  async function submitMember() {
    setLoading(true);
    try {
      const formData = convertToFormData(memberInput);
      await api
        .post(`member/${memberInput.userUID}`, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        })
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
          nav(`/member${location.search}`);
        })
        .catch((error) => {
          Swal.fire({
            title: "Oops...",
            // text: error.response.data.error || "An error occurred",
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
        });
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false); // Set loading to false after 3 seconds
    }
  }
  async function handleSubmit() {
    const errors = await formik.validateForm();

    formik.setTouched(setAllFieldsTouched(formik.values));
    if (Object.keys(errors).length === 0) {
      formik.handleSubmit();
    } else {
      console.log(errors); // Optional: log the errors for debugging
    }
  }
  function inputHandler(event) {
    let { id, value } = event.target;
    if (id === "phoneNumber") value = value.replace(/[^0-9-]/g, "");
    let tempObject = { ...memberInput, [id]: value };
    if (id === "role") {
      console.log("it is");

      tempObject = {
        ...tempObject,
        hasCustomPermissions: false,
        accessibility: [],
      };
    }
    setMemberInput(tempObject);
    formik.setValues(tempObject);
  }
  function getNewRoleSettingsByRole(inputRole) {
    console.log(memberInput.accessibility);
    console.log(
      defaultAccessibility?.find((role) => role.name === inputRole)?.modules
    );
    // const newRoleSettingsValue = memberInput.hasCustomPermissions
    //   ? memberInput.accessibility
    //   : defaultAccessibility?.find((role) => role.name === inputRole)?.modules;
    const newRoleSettingsValue = defaultAccessibility?.find(
      (role) => role.name === inputRole
    )?.modules;

    const newRoleSettingsOptions = accessibilityOptions?.find(
      (role) => role.name === inputRole
    )?.modules;

    // Step 1: Build a Map of option modules and their allowed permissions
    const permissionMap = new Map();

    newRoleSettingsOptions?.forEach((item) => {
      permissionMap.set(
        item.name,
        item.permissions?.map((perm) => perm.permission) || []
      );
    });

    // Step 2: Filter newRoleSettingsValue based on item.name AND filter its permissions
    const result = newRoleSettingsValue
      ?.filter((item) => permissionMap.has(item.name)) // keep only modules that exist in options
      .map((item) => {
        const allowedPermissions = permissionMap.get(item.name);
        const filteredPermissions =
          item.permissions?.filter((perm) =>
            allowedPermissions.includes(perm.permission)
          ) || [];

        return {
          ...item,
          permissions: filteredPermissions, // can be empty
        };
      });

    return result;
  }
  function departmentSelectHandler(event) {
    const tempObject = { ...memberInput, department: event };
    setMemberInput(tempObject);
    formik.setValues(tempObject);
  }
  function accessibilitySelectHandler(event) {
    if (event.target.value === "true") {
      handleOpenCustomPermission();
      // customizeMemberPermissionDisclosure.onOpen();
    } else if (event.target.value === "false") {
      const tempObject = {
        ...memberInput,
        hasCustomPermissions: false,
        accessibility: [],
      };
      setMemberInput(tempObject);
      formik.setValues(tempObject);
    }
  }

  function handleOpenCustomPermission() {
    if (memberInput.accessibility.length) {
      setCustomPermissions(memberInput.accessibility);
    } else {
      setCustomPermissions(getNewRoleSettingsByRole(memberInput.role));
    }
    customizeMemberPermissionDisclosure.onOpen();
  }
  function createDepartmentHandler(newOption) {
    const newOptionObj = {
      label: newOption,
      value: newOption,
      newDepartment: true,
    };
    setDepartmentSelection((prevState) => [...prevState, newOptionObj]);
    setMemberInput((prevState) => ({ ...prevState, department: newOptionObj }));
    formik.setValues((prevState) => ({
      ...prevState,
      department: newOptionObj,
    }));
  }
  async function fetchMember(controller) {
    setLoading(true);
    await api
      .get(`member/${UID}?withAccessibility=true`, {
        signal: controller.signal,
      })
      .then(async (response) => {
        if (
          !checkHasPermission(userSelector, pageModule, [
            `manage_${response.data.member.role}`,
          ])
        ) {
          toast({
            title: "Unauthorized Access",
            description: "Sorry, you are not authorized to edit this member.",
            status: "error",
            duration: 5000,
            position: "top",
            isClosable: true,
          });
          nav("/member");
        }
        setDefaultAccessibility(response.data.accessibility.accessibility);
        setAccessibilityOptions(response.data.accessibility.RBAC);

        const newRoleSettingsValue =
          response.data.member?.accessibility?.modules;
        const newRoleSettingsOptions = response.data.accessibility.RBAC?.find(
          (role) => role.name === response.data.member.role
        )?.modules;

        const permissionMap = new Map();

        newRoleSettingsOptions?.forEach((item) => {
          permissionMap.set(
            item.name,
            item.permissions?.map((perm) => perm.permission) || []
          );
        });

        const result = newRoleSettingsValue
          ?.filter((item) => permissionMap.has(item.name)) // keep only modules that exist in options
          .map((item) => {
            const allowedPermissions = permissionMap.get(item.name);
            const filteredPermissions =
              item.permissions?.filter((perm) =>
                allowedPermissions.includes(perm.permission)
              ) || [];

            return {
              ...item,
              permissions: filteredPermissions, // can be empty
            };
          });

        setMemberInput({
          firstName: response.data.member.user.first_name,
          lastName: response.data.member.user.last_name,
          email: response.data.member.user.email,
          phoneNumber: response.data.member.user.phone_number,
          role: response.data.member.role,
          profileImageUrl: response.data.member.user.profile_image_url
            ? IMGURL + response.data.member.user.profile_image_url
            : null,
          deleteProfileImage: false,
          employeeId: response.data.member.employee_id,
          department: {
            id: response.data.member.department.id,
            value: response.data.member.department.name,
            label: response.data.member.department.name,
            newDepartment: false,
          },
          hasCustomPermissions: !!response.data.member.has_custom_permissions,
          accessibility: !!response.data.member.has_custom_permissions
            ? result
            : [],
          userUID: response.data.member.user.UID,
        });

        formik.setValues({
          firstName: response.data.member.user.first_name,
          lastName: response.data.member.user.last_name,
          phoneNumber: response.data.member.user.phone_number,
          role: response.data.member.role,
          profileImageUrl: response.data.member.profile_image_url
            ? IMGURL + response.data.member.profile_image_url
            : null,
          employeeId: response.data.member.employee_id,
          department: {
            id: response.data.member.department.id,
            value: response.data.member.department.name,
            label: response.data.member.department.name,
            newDepartment: false,
          },
        });
      })
      .catch((err) => {
        console.log(err);
      })
      .finally(() => {
        setLoading(false);
      });
  }

  async function fetchDepartment(controller) {
    setDepartmentSelectionLoading(true);
    await api
      .get(`department`, { signal: controller.signal })
      .then((response) => {
        setDepartmentSelection(
          response?.data?.department.map((department) => ({
            id: department?.id,
            value: department?.name,
            label: department?.name,
            newDepartment: false,
          }))
        );
      })
      .catch((error) => {
        console.log(error);
      })
      .finally(() => {
        setDepartmentSelectionLoading(false);
      });
  }

  useEffect(() => {
    const controller = new AbortController();
    const controller2 = new AbortController();
    fetchDepartment(controller);
    fetchMember(controller2);
    return () => {
      controller.abort();
      controller2.abort();
    };
  }, []);

  useEffect(() => {
    setCustomPermissions(getNewRoleSettingsByRole(memberInput.role));
  }, [defaultAccessibility, accessibilityOptions]);
  return (
    <Flex w={"100%"} flexDir={"column"} px={"30px"} py={"20px"}>
      <Flex flexDir={"column"} pb={"60px"} gap={"20px"} w={"100%"}>
        <Flex w={"100%"} alignItems={"center"} gap={"20px"}>
          <Flex w={"100%"} flexDir={"column"} gap={"60px"}>
            <Flex flexDir={"column"} gap={"20px"}>
              <Flex color={"crimson"} fontSize={"24px"} fontWeight={700}>
                Edit Member
              </Flex>
              <Flex px={"80px"} flexDir={"column"}>
                <Flex pb={"20px"} w={"100%"} justifyContent={"center"}>
                  <Flex border={"2px solid #dc143c"} borderRadius={"100%"}>
                    <Flex
                      w={"120px"}
                      h={"120px"}
                      role="group"
                      position={"relative"}
                      borderRadius={"100%"}
                    >
                      {memberInput.profileImageUrl ? (
                        <Avatar
                          sx={{
                            "> div": {
                              // Target the placeholder wrapper div
                              fontSize: "40px", // Adjust text size
                              fontWeight: "bold", // Make it bold if needed
                            },
                          }}
                          id="avatar1"
                          cursor={"pointer"}
                          onClick={() => {
                            handleImageFocus(memberInput.profileImageUrl);
                          }}
                          h={"100%"}
                          w={"100%"}
                          outline={"2px solid #dc143c"}
                          border={"3px solid white"}
                          name={
                            memberInput.firstName + " " + memberInput.lastName
                          }
                          src={memberInput.profileImageUrl}
                        ></Avatar>
                      ) : (
                        <>
                          <Avatar
                            sx={{
                              "> div": {
                                // Target the placeholder wrapper div
                                fontSize: "40px", // Adjust text size
                                fontWeight: "bold", // Make it bold if needed
                              },
                            }}
                            cursor={"pointer"}
                            onClick={triggerAvatarInput}
                            id="avatar12"
                            h={"100%"}
                            w={"100%"}
                            outline={"2px solid #dc143c"}
                            border={"3px solid white"}
                            name={
                              memberInput.firstName + " " + memberInput.lastName
                            }
                          ></Avatar>
                        </>
                      )}

                      <IconButton
                        onClick={triggerAvatarInput}
                        icon={<FaCamera />}
                        borderRadius="full"
                        color="white"
                        bg="#dc143c"
                        _hover={{ bg: "#b51031" }}
                        position="absolute"
                        bottom="5px" // 👈 Position at the bottom
                        right="5px" // 👈 Position at the right
                        transform="translate(25%, 25%)" // 👈 Slightly moves the button outside
                        boxShadow="md"
                      />
                      <IconButton
                        _groupHover={
                          memberInput.profileImageUrl ? { opacity: "0.6" } : ""
                        }
                        pointerEvents={
                          memberInput.profileImageUrl ? "auto" : "none"
                        }
                        opacity={"0"}
                        onClick={deleteImageHandler}
                        icon={<IoMdClose />}
                        borderRadius="full"
                        color="white"
                        bg="#dc143c"
                        _hover={
                          memberInput.profileImageUrl
                            ? { bg: "#b51031", opacity: "1 !important" }
                            : ""
                        }
                        position="absolute"
                        top="5px" // 👈 Position at the bottom
                        right="5px" // 👈 Position at the right
                        transform="translate(25%, -25%)" // 👈 Slightly moves the button outside
                        boxShadow="md"
                        fontSize={"24px"}
                      />
                    </Flex>
                    {/* <Flex
                      bg={"#bababa"}
                      borderRadius={"100%"}
                      justifyContent={"center"}
                      alignItems={"center"}
                      h={"120px"}
                      w={"120px"}
                      border={"2px solid white"}
                      position={"relative"}
                    >
                      <Flex color={"white"} fontSize={"68px"}>
                        <FaUserAlt />
                      </Flex>
                    </Flex> */}
                  </Flex>
                </Flex>
                <input
                  onChange={handleFileChange}
                  id="profileImage"
                  ref={avatarInput}
                  type="file"
                  style={{ display: "none" }}
                  accept="image/*"
                />
              </Flex>
              <Flex px={"80px"} gap={"30px"} alignItems={"center"}>
                <Flex
                  pb={"20px"}
                  position={"relative"}
                  w={"50%"}
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
                      <Flex>Enter the member's first name</Flex>
                    </Flex>
                  </Flex>
                  <Flex>
                    <Input
                      border={
                        formik.errors.firstName && formik.touched.firstName
                          ? "1px solid crimson"
                          : "1px solid #E2E8F0"
                      }
                      placeholder="William"
                      onBlur={formik.handleBlur}
                      value={memberInput.firstName}
                      id="firstName"
                      onChange={inputHandler}
                    ></Input>
                  </Flex>
                  {formik.errors.firstName && formik.touched.firstName ? (
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
                      <Flex>{formik.errors.firstName}</Flex>
                    </Flex>
                  ) : (
                    ""
                  )}
                </Flex>
                <Flex
                  pb={"20px"}
                  position={"relative"}
                  w={"50%"}
                  flexDir={"column"}
                >
                  <Flex flexDir={"column"}>
                    <Box fontWeight={700} as="span" flex="1" textAlign="left">
                      Last name&nbsp;
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
                      <Flex>Enter the member's employee Last name</Flex>
                    </Flex>
                  </Flex>
                  <Flex>
                    <Input
                      border={
                        formik.errors.lastName && formik.touched.lastName
                          ? "1px solid crimson"
                          : "1px solid #E2E8F0"
                      }
                      placeholder="Anthony"
                      onBlur={formik.handleBlur}
                      id="lastName"
                      value={memberInput.lastName}
                      onChange={inputHandler}
                    ></Input>
                  </Flex>
                  {formik.errors.lastName && formik.touched.lastName ? (
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
                      <Flex>{formik.errors.lastName}</Flex>
                    </Flex>
                  ) : (
                    ""
                  )}
                </Flex>
              </Flex>
              <Flex px={"80px"} gap={"30px"} alignItems={"center"}>
                <Flex
                  pb={"20px"}
                  position={"relative"}
                  w={"50%"}
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
                      <Flex>Enter the member's email</Flex>
                    </Flex>
                  </Flex>
                  <Flex>
                    <Input
                      isDisabled
                      border={"1px solid #E2E8F0"}
                      value={memberInput.email}
                    ></Input>
                  </Flex>
                </Flex>
                <Flex
                  pb={"20px"}
                  position={"relative"}
                  w={"50%"}
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
                      <Flex>Enter the member's phone number</Flex>
                    </Flex>
                  </Flex>
                  <Flex>
                    <Input
                      type="text"
                      border={
                        formik.errors.phoneNumber && formik.touched.phoneNumber
                          ? "1px solid crimson"
                          : "1px solid #E2E8F0"
                      }
                      placeholder="555-123-123"
                      onBlur={formik.handleBlur}
                      value={memberInput.phoneNumber}
                      id="phoneNumber"
                      onChange={inputHandler}
                    ></Input>
                  </Flex>
                  {formik.errors.phoneNumber && formik.touched.phoneNumber ? (
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
                      <Flex>{formik.errors.phoneNumber}</Flex>
                    </Flex>
                  ) : (
                    ""
                  )}
                </Flex>
              </Flex>
              <Flex px={"80px"} position={"relative"} gap={"30px"}>
                <Flex
                  flexDir={"column"}
                  w={"50%"}
                  pb={"20px"}
                  position={"relative"}
                >
                  <Flex flexDir={"column"}>
                    <Box fontWeight={700} as="span" flex="1" textAlign="left">
                      Department&nbsp;
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
                      <Flex>Select or create the member's department</Flex>
                    </Flex>
                  </Flex>
                  <CustomSelectionSelect
                    title={"department"}
                    isLoading={departmentSelectionLoading}
                    selection={departmentSelection}
                    selectHandler={departmentSelectHandler}
                    createNewOption={createDepartmentHandler}
                    selectedOption={memberInput?.department.label}
                    onBlur={() => {
                      formik.setFieldTouched("department", true);
                      formik.validateForm();
                    }}
                    border={
                      formik.errors.department && formik.touched.department
                        ? "1px solid #dc143c"
                        : ""
                    }
                  />

                  <Flex w={"100%"}></Flex>
                  {formik.errors.department && formik.touched.department ? (
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
                      <Flex>{formik.errors.department}</Flex>
                    </Flex>
                  ) : (
                    ""
                  )}
                </Flex>
                <Flex
                  pb={"20px"}
                  position={"relative"}
                  w={"50%"}
                  flexDir={"column"}
                >
                  <Flex flexDir={"column"}>
                    <Box fontWeight={700} as="span" flex="1" textAlign="left">
                      Employee ID
                    </Box>
                    <Flex
                      textAlign={"center"}
                      fontSize={"14px"}
                      color={"#848484"}
                      justifyContent={"space-between"}
                    >
                      <Flex>Enter the member's employee ID</Flex>
                    </Flex>
                  </Flex>
                  <Flex>
                    <Input
                      border={"1px solid #E2E8F0"}
                      isDisabled={true}
                      placeholder="555-6102"
                      // onBlur={formik.handleBlur}
                      value={memberInput.employeeId}
                      id="employeeId"
                      onChange={inputHandler}
                    ></Input>
                  </Flex>
                  {/* {formik.errors.employeeId && formik.touched.employeeId ? (
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
                      <Flex>{formik.errors.employeeId}</Flex>
                    </Flex>
                  ) : (
                    ""
                  )} */}
                </Flex>
              </Flex>
              <Flex px={"80px"} position={"relative"} gap={"30px"}>
                <Flex
                  w={"50%"}
                  flexDir={"column"}
                  pb={"20px"}
                  position={"relative"}
                >
                  <Flex flexDir={"column"}>
                    <Box fontWeight={700} as="span" flex="1" textAlign="left">
                      Role&nbsp;
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
                      <Flex>Select the member's role and accessibility</Flex>
                    </Flex>
                  </Flex>
                  <Flex>
                    <Select
                      border={
                        formik.errors.role && formik.touched.role
                          ? "1px solid crimson"
                          : "1px solid #E2E8F0"
                      }
                      onBlur={formik.handleBlur}
                      id="role"
                      onChange={inputHandler}
                      value={memberInput.role}
                    >
                      {filteredNewRoleSelection.map((val) => (
                        <option value={val.value}>{val.label}</option>
                      ))}
                    </Select>
                  </Flex>
                  {formik.errors.role && formik.touched.role ? (
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
                      <Flex>{formik.errors.role}</Flex>
                    </Flex>
                  ) : (
                    ""
                  )}
                </Flex>
                <Flex
                  w={"50%"}
                  flexDir={"column"}
                  pb={"20px"}
                  position={"relative"}
                >
                  <Flex flexDir={"column"}>
                    <Box
                      onClick={() => {
                        console.log(memberInput.accessibility);
                      }}
                      fontWeight={700}
                      as="span"
                      flex="1"
                      textAlign="left"
                    >
                      Access & Permissions
                    </Box>
                    <Flex
                      textAlign={"center"}
                      fontSize={"14px"}
                      color={"#848484"}
                      justifyContent={"space-between"}
                    >
                      <Flex>Adjust the member's permission and access</Flex>
                    </Flex>
                  </Flex>
                  <Select
                    onChange={accessibilitySelectHandler}
                    value={memberInput.hasCustomPermissions}
                  >
                    {accessibilitySelection.map((accessibilityOption) => (
                      <option value={accessibilityOption.value}>
                        {accessibilityOption.label}
                      </option>
                    ))}
                  </Select>
                  {memberInput.hasCustomPermissions ? (
                    <Flex>
                      <Flex
                        onClick={() => {
                          handleOpenCustomPermission();
                          // customizeMemberPermissionDisclosure.onOpen();
                        }}
                        cursor={"pointer"}
                        _hover={{ textDecor: "underline" }}
                        py={"5px"}
                        alignItems={"center"}
                        gap={"5px"}
                        fontSize={"16px"}
                        color={"#dc143c"}
                      >
                        <Flex>
                          <FaRegEdit />
                        </Flex>
                        <Flex>Edit Custom Permission</Flex>
                      </Flex>
                    </Flex>
                  ) : (
                    ""
                  )}

                  {/* <CustomSelectionSelect
                                      title={"accessibility"}
                                      selection={accessibilitySelection}
                                      selectHandler={accessibilitySelectHandler}
                                      selectedOption={memberInput?.accessibility?.label}
                                      isSearchable={false}
                                      optionColor="black"
                                      optionFontWeight={400}
                                    /> */}

                  {formik.errors.role && formik.touched.role ? (
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
                      <Flex>{formik.errors.role}</Flex>
                    </Flex>
                  ) : (
                    ""
                  )}
                </Flex>
              </Flex>
            </Flex>
            <Flex px={"80px"} justifyContent={"space-between"}>
              <Button
                onClick={() => {
                  nav(`/member${location.search}`);
                }}
                bg={"white"}
                border={"1px solid #dc143c"}
              >
                <Flex gap={"10px"} alignItems={"center"} color={"crimson"}>
                  <Flex>
                    <FaLeftLong />
                  </Flex>
                  <Flex>Back</Flex>
                </Flex>
              </Button>

              <Button onClick={handleSubmit} bg={"#dc143c"}>
                <Flex gap={"10px"} alignItems={"center"} color={"white"}>
                  <Flex>
                    <ImCheckmark />
                  </Flex>
                  <Flex>Save Changes</Flex>
                </Flex>
              </Button>
            </Flex>
          </Flex>
        </Flex>
      </Flex>
      <ImageFocusOverlay
        imageFocusDisclosure={imageFocusDisclosure}
        imageFocusURL={imageFocusURL}
      />
      <CustomizeMemberPermissionModal
        memberRole={memberInput.role}
        isOpen={customizeMemberPermissionDisclosure.isOpen}
        onClose={customizeMemberPermissionDisclosure.onClose}
        setMemberInput={setMemberInput}
        customPermissions={customPermissions}
        setCustomPermissions={setCustomPermissions}
        accessibilityOptions={accessibilityOptions}
        defaultAccessibility={defaultAccessibility}
        customAccessibilityLoading={customAccessibilityLoading}
        getNewRoleSettingsByRole={getNewRoleSettingsByRole}
      />
    </Flex>
  );
}
