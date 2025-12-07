import {
  Avatar,
  Box,
  Button,
  Flex,
  IconButton,
  Input,
  Select,
  useDisclosure,
} from "@chakra-ui/react";
import { FaPlus, FaRegEdit, FaUserAlt } from "react-icons/fa";
import { FaCamera, FaLeftLong, FaTriangleExclamation } from "react-icons/fa6";
import { useEffect, useRef, useState } from "react";
import { useLoading } from "../service/LoadingContext";
import { api } from "../api/api";
import { useFormik } from "formik";
import * as Yup from "yup";
import Swal from "sweetalert2";
import { useNavigate, useSearchParams } from "react-router-dom";
import YupPassword from "yup-password";
import newRoleSelection from "../constants/NewRoleSelection";
import SwalErrorMessages from "../components/SwalErrorMessages";
import { IoMdClose } from "react-icons/io";
import ImageFocusOverlay from "../components/ImageFocusOverlay";
import CustomSelectionSelect from "../components/CustomSelectionSelect";
import setAllFieldsTouched from "../utils/setAllFieldsTouched";
import CustomizeMemberPermissionModal from "../components/Member/CustomizeMemberPermissionModal";
import formatString from "../utils/formatString";
import { useSelector } from "react-redux";
import checkHasPermission from "../utils/checkHasPermission";
import convertToFormData from "../utils/convertToFormData";

export default function CreateMemberPage() {
  const nav = useNavigate();
  const pageModule = "members";
  const userSelector = useSelector((state) => state.login.auth);
  const filteredNewRoleSelection = newRoleSelection.filter((newRoleOption) => {
    return checkHasPermission(userSelector, pageModule, [
      `manage_${newRoleOption.value}`,
    ]);
  });
  const customizeMemberPermissionDisclosure = useDisclosure();
  const [searchParams] = useSearchParams();
  const woUID = searchParams.get("wo_UID"); // "pending"

  const initialMemberInput = {
    firstName: "",
    lastName: "",
    phoneNumber: "",
    email: "",
    department: "",
    role: "member",
    employeeId: "",
    profileImage: "",
    hasCustomPermissions: false,
    accessibility: [],
    profileImageUrl: "",
  };

  const { loading, setLoading } = useLoading();
  const [accessibilityOptions, setAccessibilityOptions] = useState([]);
  const [defaultAccessibility, setDefaultAccessibility] = useState([]);
  const [memberInput, setMemberInput] = useState(initialMemberInput);
  const [customAccessibilityLoading, setCustomAccessibilityLoading] =
    useState(false);
  const [departmentSelection, setDepartmentSelection] = useState([]);
  const [imageFocusURL, setImageFocusURL] = useState();
  const [departmentSelectionLoading, setDepartmentSelectionLoading] =
    useState(false);
  const [customPermissions, setCustomPermissions] = useState();
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
  const creatableSelectStyles = {
    control: (provided, state) => ({
      ...provided,
      borderColor:
        formik.touched.department && formik.errors.department
          ? "none"
          : state.isFocused
          ? "blue"
          : "#E2E8F0",
      outline:
        formik.touched.department && formik.errors.department
          ? "1px solid crimson"
          : state.isFocused
          ? "1px solid blue"
          : "1px solid #E2E8F0",
      boxShadow: state.isFocused ? "0 0 0 1px blue" : "none",
      width: "100%",
    }),
    container: (provided) => ({
      ...provided,
      width: "100%",
    }),
  };
  YupPassword(Yup);

  const avatarInput = useRef(); // Create an array of refs
  const formik = useFormik({
    initialValues: initialMemberInput,
    validationSchema: Yup.object().shape({
      firstName: Yup.string().trim().required("First name is required"),
      lastName: Yup.string().trim().required("Last name is required"),
      email: Yup.string()
        .email("Must be a valid email")
        .trim()
        .required("Email is required"),
      department: Yup.object().required("Department is required"),
      employeeId: Yup.string().trim().required("Employee ID is required"),
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
  const triggerAvatarInput = () => {
    avatarInput.current.click();
  };
  function deleteImageHandler() {
    setMemberInput((prevState) => ({
      ...prevState,
      profileImage: "",
      profileImageUrl: "",
    }));
    avatarInput.current.value = ""; // Clear the input value
  }
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
      }));
    }
  };
  function handleImageFocus(imageURL) {
    setImageFocusURL(imageURL);
    imageFocusDisclosure.onOpen();
  }
  async function submitMember() {
    setLoading(true);
    try {
      const formData = convertToFormData(memberInput);

      await api
        .post(`member`, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        })
        .then((response) => {
          if (!woUID) {
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
          }
          handleCheckNavigation("/member");
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
    let tempObject = { ...memberInput, [id]: value };
    if (id === "phoneNumber") value = value.replace(/[^0-9-]/g, "");
    if (id === "role") {
      // setCustomPermissions(getNewRoleSettingsByRole(value));
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
    const newRoleSettingsValue = memberInput.hasCustomPermissions
      ? memberInput.accessibility
      : defaultAccessibility?.find((role) => role.name === inputRole)?.modules;

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
  function handleCheckNavigation(url) {
    if (woUID) {
      nav("/work-order/edit/" + woUID + "?redirected=1");
    } else {
      nav(url);
    }
  }
  async function fetchCustomAccessibility(controller) {
    setCustomAccessibilityLoading(true);
    await api
      .get(`accessibility`, { signal: controller.signal })
      .then((response) => {
        setDefaultAccessibility(response.data.accessibility);
        setAccessibilityOptions(response.data.RBAC);
      })
      .catch((error) => {
        console.log(error);
      })
      .finally(() => {
        setCustomAccessibilityLoading(false);
      });
  }
  useEffect(() => {
    const controller = new AbortController();
    fetchDepartment(controller);
    const controller2 = new AbortController();
    fetchCustomAccessibility(controller2);
    return () => {
      controller.abort(); // Cleanup previous fetch request before new one starts
      controller2.abort(); // Cleanup previous fetch request before new one starts
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
                Add Member
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
                        <>
                          <Avatar
                            cursor={"pointer"}
                            onClick={() => {
                              handleImageFocus(memberInput.profileImageUrl);
                            }}
                            h={"100%"}
                            w={"100%"}
                            outline={"2px solid #dc143c"}
                            border={"3px solid white"}
                            // name={
                            //   memberInput.firstName + " " + memberInput.lastName
                            // }
                            src={memberInput.profileImageUrl}
                          ></Avatar>
                        </>
                      ) : (
                        <Flex
                          outline={"2px solid #dc143c"}
                          cursor={"pointer"}
                          onClick={triggerAvatarInput}
                          bg={"#bababa"}
                          borderRadius={"100%"}
                          justifyContent={"center"}
                          alignItems={"center"}
                          h={"100%"}
                          w={"100%"}
                          border={"3px solid white"}
                        >
                          <Flex color={"white"} fontSize={"68px"}>
                            <FaUserAlt />
                          </Flex>
                        </Flex>
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
                      Email&nbsp;
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
                      <Flex>Enter the member's email</Flex>
                    </Flex>
                  </Flex>
                  <Flex>
                    <Input
                      border={
                        formik.errors.email && formik.touched.email
                          ? "1px solid crimson"
                          : "1px solid #E2E8F0"
                      }
                      placeholder="test@gmail.com"
                      onBlur={formik.handleBlur}
                      id="email"
                      onChange={inputHandler}
                    ></Input>
                  </Flex>
                  {formik.errors.email && formik.touched.email ? (
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
                      <Flex>{formik.errors.email}</Flex>
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
                      border={
                        formik.errors.phoneNumber && formik.touched.phoneNumber
                          ? "1px solid crimson"
                          : "1px solid #E2E8F0"
                      }
                      placeholder="555-123-123"
                      onBlur={formik.handleBlur}
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
                    <Flex fontWeight={700} alignItems={"center"} gap={"5px"}>
                      <Flex>
                        Department&nbsp;
                        <Box as="span" color={"#dc143c"}>
                          *
                        </Box>
                      </Flex>
                    </Flex>
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
                      Employee ID&nbsp;
                      <Box as="span" color={"#dc143c"}>
                        *
                      </Box>
                      {/* (
                      <Box as="span" color={"#848484"}>
                        Optional
                      </Box>
                      ) */}
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
                      border={
                        formik.errors.employeeId && formik.touched.employeeId
                          ? "1px solid crimson"
                          : "1px solid #E2E8F0"
                      }
                      placeholder="555-6102"
                      onBlur={formik.handleBlur}
                      id="employeeId"
                      onChange={inputHandler}
                    ></Input>
                  </Flex>
                  {formik.errors.employeeId && formik.touched.employeeId ? (
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
                  )}
                </Flex>
              </Flex>{" "}
              <Flex px={"80px"} position={"relative"} gap={"30px"}>
                <Flex
                  flexDir={"column"}
                  w={"50%"}
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
                      onClick={() => console.log(customPermissions)}
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
                  handleCheckNavigation("/member");
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
                    <FaPlus />
                  </Flex>
                  <Flex>Add Member</Flex>
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
