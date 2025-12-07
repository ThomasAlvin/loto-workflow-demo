import {
  Box,
  Button,
  Flex,
  Grid,
  GridItem,
  Image,
  useDisclosure,
} from "@chakra-ui/react";
import { BiImageAdd } from "react-icons/bi";
import { FaLeftLong, FaTriangleExclamation } from "react-icons/fa6";
import { FaEdit } from "react-icons/fa";
import { useEffect, useRef, useState } from "react";
import { useLoading } from "../service/LoadingContext";
import { api } from "../api/api";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import CreateEquipmentMachinePageRightSide from "../components/EquipmentMachine/CreateEquipmentMachineRightSide";
import Swal from "sweetalert2";
import { ImCheckmark } from "react-icons/im";
import SwalErrorMessages from "../components/SwalErrorMessages";
import { IoMdClose } from "react-icons/io";
import ImageFocusOverlay from "../components/ImageFocusOverlay";
import convertToFormData from "../utils/convertToFormData";
export default function EditEquipmentMachinePage() {
  const nav = useNavigate();
  const location = useLocation();

  const IMGURL = import.meta.env.VITE_API_IMAGE_URL;
  const { UID } = useParams();
  const { loading, setLoading } = useLoading();
  const initialMachineInput = {
    name: "",
    description: "",
    serialNumber: "",
    model: "",
    status: "",
    category: [],
    machineId: "",
    mainImage: "",
    deleteMainImage: false,
    image1: "",
    deleteImage1: false,
    image2: "",
    deleteImage2: false,
    image3: "",
    deleteImage3: false,
    image4: "",
    deleteImage4: false,
    image5: "",
    deleteImage5: false,
    image6: "",
    deleteImage6: false,
  };
  const formik = useFormik({
    initialValues: initialMachineInput,
    validationSchema: Yup.object().shape({
      name: Yup.string().trim().required("Equipment/Machine name is required"),
      machineId: Yup.string().trim().required("Machine ID is required"),
      model: Yup.string().trim().required("Model is required"),
      status: Yup.string().trim().required("Status is required"),
      location: Yup.string().trim().required("Location is required"),
      category: Yup.array()
        .min(1, "Category is required")
        .required("Category is required"),
      mainImage: Yup.mixed()
        .nullable()
        // .required("A file is required")
        .test("fileSize", "File size is too large", (value) => {
          if (value) {
            return value.size <= 2000000; // Validate file size (2MB limit)
          }
          return true;
        })
        .test("fileType", "Unsupported file format", (value) => {
          if (value) {
            const supportedFormats = ["image/jpg", "image/jpeg", "image/png"];
            return supportedFormats.includes(value.type);
          }
          return true;
        }),
      deleteMainImage: Yup.boolean()
        .oneOf([false], "Main Image File is required") // Ensures the value is `true`
        .required("Main Image File is require"),
      image1: Yup.mixed()
        .nullable()
        .test("fileSize", "File size is too large", (value) => {
          if (value) {
            return value.size <= 2000000; // Validate file size (2MB limit)
          }
          return true;
        })
        .test("fileType", "Unsupported file format", (value) => {
          if (value) {
            const supportedFormats = ["image/jpg", "image/jpeg", "image/png"];
            return supportedFormats.includes(value.type);
          }
          return true;
        }),
      image2: Yup.mixed()
        .nullable()
        .test("fileSize", "File size is too large", (value) => {
          if (value) {
            return value.size <= 2000000; // Validate file size (2MB limit)
          }
          return true;
        })
        .test("fileType", "Unsupported file format", (value) => {
          if (value) {
            const supportedFormats = ["image/jpg", "image/jpeg", "image/png"];
            return supportedFormats.includes(value.type);
          }
          return true;
        }),
      image3: Yup.mixed()
        .nullable()
        .test("fileSize", "File size is too large", (value) => {
          if (value) {
            return value.size <= 2000000; // Validate file size (2MB limit)
          }
          return true;
        })
        .test("fileType", "Unsupported file format", (value) => {
          if (value) {
            const supportedFormats = ["image/jpg", "image/jpeg", "image/png"];
            return supportedFormats.includes(value.type);
          }
          return true;
        }),
      image4: Yup.mixed()
        .nullable()
        .test("fileSize", "File size is too large", (value) => {
          if (value) {
            return value.size <= 2000000; // Validate file size (2MB limit)
          }
          return true;
        })
        .test("fileType", "Unsupported file format", (value) => {
          if (value) {
            const supportedFormats = ["image/jpg", "image/jpeg", "image/png"];
            return supportedFormats.includes(value.type);
          }
          return true;
        }),
      image5: Yup.mixed()
        .nullable()
        .test("fileSize", "File size is too large", (value) => {
          if (value) {
            return value.size <= 2000000; // Validate file size (2MB limit)
          }
          return true;
        })
        .test("fileType", "Unsupported file format", (value) => {
          if (value) {
            const supportedFormats = ["image/jpg", "image/jpeg", "image/png"];
            return supportedFormats.includes(value.type);
          }
          return true;
        }),
      image6: Yup.mixed()
        .nullable()
        .test("fileSize", "File size is too large", (value) => {
          if (value) {
            return value.size <= 2000000; // Validate file size (2MB limit)
          }
          return true;
        })
        .test("fileType", "Unsupported file format", (value) => {
          if (value) {
            const supportedFormats = ["image/jpg", "image/jpeg", "image/png"];
            return supportedFormats.includes(value.type);
          }
          return true;
        }),
    }),
    onSubmit: () => {
      submitEquipmentMachine();
    },
  });

  const [machineCategory, setMachineCategory] = useState([]);
  const [options, setOptions] = useState([]);
  const [machineInput, setMachineInput] = useState(initialMachineInput);
  const fileInputRefs = useRef([]); // Create an array of refs
  const [imageFocusURL, setImageFocusURL] = useState();
  const imageFocusDisclosure = useDisclosure();
  const [editMode, setEditMode] = useState(false);

  const [fileDisplay, setFileDisplay] = useState({
    image1: null,
    image2: null,
    image3: null,
    image4: null,
    image5: null,
    image6: null,
    image7: null,
  });
  const hasAnyImage = Object.values(fileDisplay).some(Boolean);

  const triggerFileInput = (index) => {
    fileInputRefs.current[index].click();
  };

  function handleImageFocus(imageURL) {
    setImageFocusURL(imageURL);
    imageFocusDisclosure.onOpen();
  }
  // Handle file changes
  const handleFileChange = (fieldName) => (event) => {
    const selectedFile = event.target.files[0];
    if (fieldName === "mainImage") {
      setMachineInput((prevFiles) => ({
        ...prevFiles,
        ["mainImage"]: selectedFile,
        ["deleteMainImage"]: false,
      }));

      formik.setFieldTouched("mainImage", true);
      formik.setFieldValue("mainImage", selectedFile);
      formik.setFieldValue("deleteMainImage", false);
    } else {
      setMachineInput((prevFiles) => ({
        ...prevFiles,
        ["image" + fieldName]: selectedFile,
        ["deleteImage" + fieldName]: false,
      }));

      formik.setFieldTouched("image" + fieldName, true);
      formik.setFieldValue("image" + fieldName, selectedFile);
    }

    if (selectedFile) {
      const previewUrl = URL.createObjectURL(selectedFile);
      if (fieldName === "mainImage") {
        setFileDisplay((prevFiles) => ({
          ...prevFiles,
          ["mainImage"]: previewUrl,
        }));
      } else {
        setFileDisplay((prevFiles) => ({
          ...prevFiles,
          ["image" + fieldName]: previewUrl,
        }));
      }
    }
  };
  function inputHandler(event) {
    const { id, value } = event.target;
    const tempObject = { ...machineInput, [id]: value };
    setMachineInput(tempObject);
    formik.setValues(tempObject);
  }
  async function handleSubmit() {
    const allTouched = Object.keys(formik.values).reduce((acc, field) => {
      acc[field] = true;
      return acc;
    }, {});

    formik.setTouched(allTouched);
    formik.handleSubmit();
  }
  function deleteImageHandler(index) {
    if (index === 0) {
      setMachineInput((prevFiles) => ({
        ...prevFiles,
        ["mainImage"]: "",
        ["deleteMainImage"]: true,
      }));
      fileInputRefs.current[0].value = ""; // Clear the input value
      setFileDisplay((prevState) => ({
        ...prevState,
        ["mainImage"]: "",
      }));

      formik.setFieldValue("mainImage", "");
      formik.setFieldValue("deleteMainImage", true);
    } else {
      setMachineInput((prevFiles) => ({
        ...prevFiles,
        ["image" + index]: "",
        ["deleteImage" + index]: true,
      }));

      fileInputRefs.current[index].value = ""; // Clear the input value

      setFileDisplay((prevState) => ({
        ...prevState,
        ["image" + index]: "",
      }));

      formik.setFieldValue("image" + index, "");
    }
  }
  async function submitEquipmentMachine() {
    setLoading(true);
    try {
      const formData = convertToFormData(machineInput);

      await api
        .post(`equipment-machine/${UID}`, formData, {
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
          nav("/equipment-machine");
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
  async function fetchMachine(controller) {
    setLoading(true);
    await api
      .get(`equipment-machine/${UID}`, { signal: controller.signal })
      .then(async (response) => {
        const imageUrls = [
          response.data.machine.main_image_url,
          response.data.machine.side_image_1_url,
          response.data.machine.side_image_2_url,
          response.data.machine.side_image_3_url,
          response.data.machine.side_image_4_url,
          response.data.machine.side_image_5_url,
          response.data.machine.side_image_6_url,
        ];

        setMachineInput({
          UID: response?.data?.machine?.UID,
          name: response?.data?.machine?.name,
          description: response?.data?.machine?.description,
          serialNumber: response?.data?.machine?.serial_number,
          machineId: response?.data?.machine?.custom_machine_id,
          model: response?.data?.machine?.model,
          location: response?.data?.machine?.location,
          additionalNotes: response?.data?.machine?.additional_notes,
          status: response?.data?.machine?.status,
          category: response?.data?.machine?.categories.map((val) => ({
            id: val?.id,
            value: val?.name,
            label: val?.name,
            newCategory: false,
          })),
          mainImage: "",
          deleteMainImage: false,
          image1: "",
          deleteImage1: false,
          image2: "",
          deleteImage2: false,
          image3: "",
          deleteImage3: false,
          image4: "",
          deleteImage4: false,
          image5: "",
          deleteImage5: false,
          image6: "",
          deleteImage6: false,
        });

        formik.setValues({
          name: response.data.machine.name,
          description: response.data.machine.description,
          serialNumber: response.data.machine.serial_number,
          machineId: response.data.machine.custom_machine_id,
          model: response.data.machine.model,
          location: response?.data?.machine?.location,
          status: response.data.machine.status,
          category: response.data.machine.categories.map((val) => ({
            id: val.id,
            value: val.name,
            label: val.name,
            newCategory: false,
          })),
          mainImage: "",
          deleteMainImage: response.data.machine.main_image_url ? false : true,
        });
        setFileDisplay({
          mainImage: response.data.machine.main_image_url
            ? IMGURL + response.data.machine.main_image_url
            : null,
          image1: response.data.machine.side_image_1_url
            ? IMGURL + response.data.machine.side_image_1_url
            : null,
          image2: response.data.machine.side_image_2_url
            ? IMGURL + response.data.machine.side_image_2_url
            : null,
          image3: response.data.machine.side_image_3_url
            ? IMGURL + response.data.machine.side_image_3_url
            : null,
          image4: response.data.machine.side_image_4_url
            ? IMGURL + response.data.machine.side_image_4_url
            : null,
          image5: response.data.machine.side_image_5_url
            ? IMGURL + response.data.machine.side_image_5_url
            : null,
          image6: response.data.machine.side_image_6_url
            ? IMGURL + response.data.machine.side_image_6_url
            : null,
        });
      })
      .catch((err) => {
        console.log(err);
      })
      .finally(() => {
        setLoading(false);
      });
  }
  async function fetchMachineCategory(controller) {
    await api
      .get(`machine-category`, { signal: controller.signal })
      .then((response) => {
        setMachineCategory(response?.data?.machineCategory);
        setOptions(
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
      });
  }
  useEffect(() => {
    const controller = new AbortController();
    const controller2 = new AbortController();
    fetchMachine(controller);
    fetchMachineCategory(controller2);
    return () => {
      controller.abort(); // Cleanup previous fetch request before new one starts
      controller2.abort(); // Cleanup previous fetch request before new one starts
    };
  }, []);
  useEffect(() => {
    if (!hasAnyImage) {
      setEditMode(false);
    }
  }, [fileDisplay]);
  return (
    <Flex w={"100%"} flexDir={"column"} px={"30px"} py={"20px"}>
      <Flex flexDir={"column"} gap={"20px"} w={"100%"}>
        <Flex w={"100%"} gap={"20px"}>
          <Flex w={"40%"} flexDir={"column"} gap={"20px"}>
            <Flex
              h={"40px"}
              color={"crimson"}
              fontSize={"20px"}
              fontWeight={700}
            >
              Edit Equipment/Machinery
            </Flex>
            <Flex gap={"10px"} flexDir={"column"}>
              <Flex fontWeight={700} justify={"space-between"}>
                <Flex>
                  Main Image&nbsp;
                  <Box as="span" color={"#dc143c"}>
                    *
                  </Box>
                </Flex>
                <Flex
                  display={hasAnyImage ? "flex" : "none"}
                  gap={"3px"}
                  px={"8px"}
                  py={"2px"}
                  _hover={
                    editMode
                      ? { bg: "#b51031" }
                      : { bg: "#dc143c", color: "white" }
                  }
                  transition={"0.2s ease-in-out"}
                  cursor={"pointer"}
                  borderRadius={"3px"}
                  outline={"1px solid #dc143c"}
                  color={editMode ? "white" : "#dc143c"}
                  alignItems={"center"}
                  fontSize={"14px"}
                  onClick={() => setEditMode((prevState) => !prevState)}
                  bg={editMode ? "#dc143c" : "white"}
                >
                  <Flex>
                    <FaEdit />
                  </Flex>
                  <Flex>{editMode ? "Stop Editing" : "Edit Image"}</Flex>
                </Flex>
              </Flex>
              <Flex flexDir={"column"}>
                <Flex
                  position={"relative"}
                  cursor={"pointer"}
                  background={"#f8f9fa"}
                  _hover={
                    (formik.errors.mainImage && formik.touched.mainImage) ||
                    (formik.errors.deleteMainImage &&
                      formik.touched.deleteMainImage)
                      ? { boxShadow: "0px 0px 5px rgba(220,20,60,1))" }
                      : { boxShadow: "0px 0px 5px rgba(50,50,93,0.5)" }
                  }
                  boxShadow={
                    (formik.errors.mainImage && formik.touched.mainImage) ||
                    (formik.errors.deleteMainImage &&
                      formik.touched.deleteMainImage)
                      ? "0px 0px 2px rgba(220, 20, 60, 1)"
                      : "0px 0px 2px rgba(50,50,93,0.5)"
                  }
                  minH={"300px"}
                  transition="box-shadow 0.2s ease-in-out"
                >
                  {fileDisplay["mainImage"] ? (
                    <>
                      <Flex
                        onClick={() =>
                          editMode
                            ? triggerFileInput(0)
                            : handleImageFocus(fileDisplay["mainImage"])
                        }
                        bg={"white"}
                        justifyContent={"center"}
                        w={"100%"}
                        alignItems={"center"}
                        p={"10px"}
                      >
                        <Image
                          bg={"#ededed"}
                          onError={() => {
                            setFileDisplay((prevState) => {
                              return { ...prevState, mainImage: "" };
                            });
                          }}
                          w={"100%"}
                          height={"auto"}
                          src={fileDisplay["mainImage"]}
                        ></Image>
                      </Flex>
                      <Flex
                        opacity={editMode ? "1" : "0"}
                        pointerEvents={editMode ? "auto" : "none"}
                        _hover={{ bg: "#dedede" }}
                        bg={"white"}
                        p={"2px"}
                        // _groupHover={{ opacity: 1, pointerEvents: "auto" }}
                        transition={"0.2s ease-in-out"}
                        cursor={"pointer"}
                        top={"0px"}
                        right={"0px"}
                        color={"#848484"}
                        onClick={() => {
                          deleteImageHandler(0);
                        }}
                        fontSize={"32px"}
                        position={"absolute"}
                      >
                        <IoMdClose />
                      </Flex>
                      <Flex
                        gap={"3px"}
                        p={"2px"}
                        pl={"5px"}
                        onClick={() => triggerFileInput(0)}
                        pointerEvents={editMode ? "auto" : "none"}
                        opacity={editMode ? "1" : "0"}
                        transition={"0.2s ease-in-out"}
                        cursor={"pointer"}
                        bottom={"4px"}
                        right={"4px"}
                        borderRadius={"3px"}
                        color={"#dc143c"}
                        alignItems={"center"}
                        bg={"white"}
                        fontSize={"20px"}
                        position={"absolute"}
                      >
                        <Flex>
                          <FaEdit />
                        </Flex>
                        {/* <Flex>Edit</Flex> */}
                      </Flex>
                    </>
                  ) : (
                    <Flex
                      onClick={() => triggerFileInput(0)}
                      justifyContent={"center"}
                      w={"100%"}
                      alignItems={"center"}
                    >
                      <Flex
                        flexDir={"column"}
                        gap={"5px"}
                        alignItems={"center"}
                      >
                        <Flex fontSize={"60px"}>
                          <BiImageAdd />
                        </Flex>
                        <Flex fontWeight={700}>
                          <Flex color={"#255787"}>
                            Drop your image here, or&nbsp;
                          </Flex>
                          <Flex textDecor={"underline"} color={"#dc143c"}>
                            Browse
                          </Flex>
                        </Flex>
                        <Flex
                          fontSize={"14px"}
                          color={"#bababa"}
                          fontWeight={700}
                        >
                          <Flex>Supports: JPEG, PNG, JPG</Flex>
                        </Flex>
                      </Flex>
                    </Flex>
                  )}
                </Flex>
                {formik.errors.mainImage && formik.touched.mainImage ? (
                  <Flex
                    color="crimson"
                    fontSize="14px"
                    gap="5px"
                    alignItems="center"
                  >
                    <FaTriangleExclamation />
                    <Flex>{formik.errors.mainImage}</Flex>
                  </Flex>
                ) : (
                  ""
                )}
                {formik.errors.deleteMainImage &&
                formik.touched.deleteMainImage ? (
                  <Flex
                    color="crimson"
                    fontSize="14px"
                    gap="5px"
                    alignItems="center"
                  >
                    <FaTriangleExclamation />
                    <Flex>{formik.errors.deleteMainImage}</Flex>
                  </Flex>
                ) : (
                  ""
                )}
              </Flex>
            </Flex>
            <Flex gap={"10px"} flexDir={"column"}>
              <Flex fontWeight={700} justify={"space-between"}>
                <Flex>Other Image</Flex>
              </Flex>
              {Array.from({ length: 6 }).map((_, index) =>
                formik.errors[`image${index + 1}`] &&
                formik.touched[`image${index + 1}`] ? (
                  <Flex
                    color="crimson"
                    fontSize="14px"
                    gap="5px"
                    alignItems="center"
                    bg={"#FDE2E2"}
                    px={"8px"}
                    py={"2px"}
                  >
                    <FaTriangleExclamation />
                    <Flex>
                      {`Image ${index + 1} ` +
                        formik.errors[`image${index + 1}`]}
                    </Flex>
                  </Flex>
                ) : (
                  ""
                )
              )}
              <input
                type="file"
                ref={(el) => (fileInputRefs.current[0] = el)} // Assign ref dynamically to each input
                style={{ display: "none" }}
                onChange={handleFileChange("mainImage")}
                accept="image/*"
              />
              <input
                type="file"
                ref={(el) => (fileInputRefs.current[1] = el)} // Assign ref dynamically to each input
                style={{ display: "none" }}
                onChange={handleFileChange(1)}
                accept="image/*"
              />
              <input
                type="file"
                ref={(el) => (fileInputRefs.current[2] = el)} // Assign ref dynamically to each input
                style={{ display: "none" }}
                onChange={handleFileChange(2)}
                accept="image/*"
              />
              <input
                type="file"
                ref={(el) => (fileInputRefs.current[3] = el)} // Assign ref dynamically to each input
                style={{ display: "none" }}
                onChange={handleFileChange(3)}
                accept="image/*"
              />
              <input
                type="file"
                ref={(el) => (fileInputRefs.current[4] = el)} // Assign ref dynamically to each input
                style={{ display: "none" }}
                onChange={handleFileChange(4)}
                accept="image/*"
              />
              <input
                type="file"
                ref={(el) => (fileInputRefs.current[5] = el)} // Assign ref dynamically to each input
                style={{ display: "none" }}
                onChange={handleFileChange(5)}
                accept="image/*"
              />
              <input
                type="file"
                ref={(el) => (fileInputRefs.current[6] = el)} // Assign ref dynamically to each input
                style={{ display: "none" }}
                onChange={handleFileChange(6)}
                accept="image/*"
              />

              <Grid templateColumns="repeat(3, 1fr)" gap={"20px"}>
                {Array.from({ length: 6 }).map((fileKey, index) =>
                  fileDisplay["image" + (index + 1)] ? (
                    <GridItem
                      position={"relative"}
                      role="group"
                      _hover={{
                        boxShadow: "0px 0px 5px rgba(50,50,93,0.5)",
                      }}
                      transition="box-shadow 0.2s ease-in-out"
                    >
                      <Flex
                        bg={"#f8f9fa"}
                        transition="box-shadow 0.2s ease-in-out"
                        _hover={{
                          boxShadow: "0px 0px 5px rgba(50,50,93,0.5)",
                        }}
                        boxShadow="0px 0px 2px rgba(50,50,93,0.5)"
                        justifyContent={"center"}
                        w={"100%"}
                        alignItems={"center"}
                        cursor={"pointer"}
                        onClick={() =>
                          editMode
                            ? triggerFileInput(index + 1)
                            : handleImageFocus(
                                fileDisplay["image" + (index + 1)]
                              )
                        }
                      >
                        <Image
                          onError={() => {
                            setFileDisplay((prevState) => ({
                              ...prevState,
                              ["image" + (index + 1)]: "",
                            }));
                          }}
                          p={"10px"}
                          w={"100%"}
                          height={"auto"}
                          src={fileDisplay["image" + (index + 1)]}
                        ></Image>
                      </Flex>
                      <Flex
                        opacity={editMode ? "1" : "0"}
                        pointerEvents={editMode ? "auto" : "none"}
                        _hover={{ bg: "#dedede" }}
                        bg={"white"}
                        p={"2px"}
                        // _groupHover={{ opacity: 1, pointerEvents: "auto" }}
                        transition={"0.2s ease-in-out"}
                        cursor={"pointer"}
                        top={"0px"}
                        right={"0px"}
                        color={"#848484"}
                        onClick={() => {
                          deleteImageHandler(index + 1);
                        }}
                        fontSize={"24px"}
                        position={"absolute"}
                      >
                        <IoMdClose />
                      </Flex>
                      <Flex
                        gap={"3px"}
                        p={"2px"}
                        pl={"5px"}
                        pointerEvents={editMode ? "auto" : "none"}
                        opacity={editMode ? "1" : "0"}
                        // _hover={{ bg: "#dc143c", color: "white" }}
                        transition={"0.2s ease-in-out"}
                        cursor={"pointer"}
                        bottom={"4px"}
                        right={"4px"}
                        borderRadius={"3px"}
                        // outline={"1px solid black"}
                        color={"#dc143c"}
                        alignItems={"center"}
                        // onClick={() => {
                        //   deleteImageHandler(index + 1);
                        // }}
                        bg={"white"}
                        fontSize={"20px"}
                        position={"absolute"}
                      >
                        <Flex>
                          <FaEdit />
                        </Flex>
                        {/* <Flex>Edit</Flex> */}
                      </Flex>
                    </GridItem>
                  ) : (
                    <GridItem
                      cursor={"pointer"}
                      transition="box-shadow 0.2s ease-in-out"
                      onClick={() => triggerFileInput(index + 1)}
                      w="100%"
                      aspectRatio={1}
                      bg={"#f8f9fa"}
                      _hover={{ boxShadow: "0px 0px 5px rgba(50,50,93,0.5)" }}
                      boxShadow="0px 0px 2px rgba(50,50,93,0.5)"
                    >
                      <Flex
                        flexDir={"column"}
                        gap={"5px"}
                        alignItems={"center"}
                        justify={"center"}
                        h={"100%"}
                        textAlign={"center"}
                      >
                        <Flex fontSize={"36px"}>
                          <BiImageAdd />
                        </Flex>
                        <Flex
                          alignItems={"center"}
                          flexDir={"column"}
                          fontSize={"12px"}
                          fontWeight={700}
                        >
                          <Flex color={"#255787"}>Upload image here</Flex>
                        </Flex>
                      </Flex>
                    </GridItem>
                  )
                )}
              </Grid>
            </Flex>
          </Flex>
          <Flex mx={"20px"} w={"1px"} h={"100%"} bg={"#d6d6df"}></Flex>
          <CreateEquipmentMachinePageRightSide
            isEdit={true}
            inputHandler={inputHandler}
            formik={formik}
            options={options}
            setOptions={setOptions}
            inspectionQuestions={machineInput.inspectionQuestions}
            setMachineInput={setMachineInput}
            machineInput={machineInput}
            machineCategory={machineCategory}
          />
        </Flex>
        <Flex justifyContent={"space-between"}>
          <Button
            bg={"white"}
            border={"1px solid #dc143c"}
            onClick={() => {
              nav(`/equipment-machine${location.search}`);
            }}
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
      <ImageFocusOverlay
        imageFocusDisclosure={imageFocusDisclosure}
        imageFocusURL={imageFocusURL}
      />
    </Flex>
  );
}
