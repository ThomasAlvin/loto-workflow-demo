import {
  Box,
  Button,
  Flex,
  Grid,
  GridItem,
  Image,
  useDisclosure,
} from "@chakra-ui/react";
import { FaEdit, FaPlus } from "react-icons/fa";
import { BiImageAdd } from "react-icons/bi";
import { FaLeftLong, FaTriangleExclamation } from "react-icons/fa6";
import { useEffect, useRef, useState } from "react";
import { useLoading } from "../service/LoadingContext";
import { api } from "../api/api";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useNavigate, useSearchParams } from "react-router-dom";
import Swal from "sweetalert2";
import CreateEquipmentMachinePageRightSide from "../components/EquipmentMachine/CreateEquipmentMachineRightSide";
import SwalErrorMessages from "../components/SwalErrorMessages";
import { IoMdClose } from "react-icons/io";
import ImageFocusOverlay from "../components/ImageFocusOverlay";
import convertToFormData from "../utils/convertToFormData";
export default function CreateEquipmentMachinePage() {
  const nav = useNavigate();
  const [searchParams] = useSearchParams();
  const woUID = searchParams.get("wo_UID");
  const [selectionLoading, setSelectionLoading] = useState(false);
  const initialMachineInput = {
    name: "",
    description: "",
    serialNumber: "",
    machineId: "",
    model: "",
    location: "",
    status: "",
    mainImage: "",
    image1: "",
    image2: "",
    image3: "",
    image4: "",
    image5: "",
    image6: "",
    category: [],
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
        .required("Main Image File is required")
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

  const { loading, setLoading } = useLoading();
  const [options, setOptions] = useState([]);
  const [machineInput, setMachineInput] = useState(initialMachineInput);
  const [machineCategory, setMachineCategory] = useState([]);
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
  // Handle file changes
  function handleImageFocus(imageURL) {
    setImageFocusURL(imageURL);
    imageFocusDisclosure.onOpen();
  }
  const handleFileChange = (fieldName) => (event) => {
    const selectedFile = event.target.files[0];

    if (selectedFile) {
      setMachineInput((prevFiles) => ({
        ...prevFiles,
        [fieldName]: selectedFile,
      }));
      const previewUrl = URL.createObjectURL(selectedFile);
      setFileDisplay((prevFiles) => ({
        ...prevFiles,
        [fieldName]: previewUrl,
      }));
      formik.setFieldTouched(fieldName, true);
      formik.setFieldValue(fieldName, selectedFile);
    }
  };
  async function handleSubmit() {
    const allTouched = Object.keys(formik.values).reduce((acc, field) => {
      acc[field] = true;
      return acc;
    }, {});

    formik.setTouched(allTouched);
    const errors = await formik.validateForm();

    formik.handleSubmit();
  }

  function deleteImageHandler(index) {
    if (index === 0) {
      setMachineInput((prevFiles) => ({
        ...prevFiles,
        ["mainImage"]: "",
      }));
      fileInputRefs.current[0].value = ""; // Clear the input value
      setFileDisplay((prevState) => ({
        ...prevState,
        ["mainImage"]: "",
      }));

      formik.setFieldValue("mainImage", "");
    } else {
      setMachineInput((prevFiles) => ({
        ...prevFiles,
        ["image" + index]: "",
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
        .post(`equipment-machine`, formData, {
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
          handleCheckNavigation("/equipment-machine");
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
  function inputHandler(event) {
    const { id, value } = event.target;

    const tempObject = { ...machineInput, [id]: value };

    setMachineInput((prevState) => ({
      ...prevState,
      [id]: value,
    }));
    formik.setValues(tempObject);
  }
  async function fetchMachineCategory(controller) {
    setSelectionLoading(true);
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
      })
      .finally(() => {
        setSelectionLoading(false);
      });
  }
  function handleCheckNavigation(url) {
    if (woUID) {
      nav("/work-order/edit/" + woUID + "?redirected=1");
    } else {
      nav(url);
    }
  }
  useEffect(() => {
    const controller = new AbortController();
    fetchMachineCategory(controller);

    return () => {
      controller.abort(); // Cleanup previous fetch request before new one starts
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
              Add Equipment/Machinery
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
                  _hover={{ bg: "#dc143c", color: "white" }}
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
                    formik.errors.mainImage && formik.touched.mainImage
                      ? { boxShadow: "0px 0px 5px rgba(220,20,60,1))" }
                      : { boxShadow: "0px 0px 5px rgba(50,50,93,0.5)" }
                  }
                  boxShadow={
                    formik.errors.mainImage && formik.touched.mainImage
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
                onChange={handleFileChange("image1")}
                accept="image/*"
              />
              <input
                type="file"
                ref={(el) => (fileInputRefs.current[2] = el)} // Assign ref dynamically to each input
                style={{ display: "none" }}
                onChange={handleFileChange("image2")}
                accept="image/*"
              />
              <input
                type="file"
                ref={(el) => (fileInputRefs.current[3] = el)} // Assign ref dynamically to each input
                style={{ display: "none" }}
                onChange={handleFileChange("image3")}
                accept="image/*"
              />
              <input
                type="file"
                ref={(el) => (fileInputRefs.current[4] = el)} // Assign ref dynamically to each input
                style={{ display: "none" }}
                onChange={handleFileChange("image4")}
                accept="image/*"
              />
              <input
                type="file"
                ref={(el) => (fileInputRefs.current[5] = el)} // Assign ref dynamically to each input
                style={{ display: "none" }}
                onChange={handleFileChange("image5")}
                accept="image/*"
              />
              <input
                type="file"
                ref={(el) => (fileInputRefs.current[6] = el)} // Assign ref dynamically to each input
                style={{ display: "none" }}
                onChange={handleFileChange("image6")}
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

                        // onClick={() => triggerFileInput(index + 1)}
                      >
                        <Image
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
            isEdit={false}
            options={options}
            setOptions={setOptions}
            inputHandler={inputHandler}
            formik={formik}
            inspectionQuestions={machineInput.inspectionQuestions}
            setMachineInput={setMachineInput}
            machineInput={machineInput}
            machineCategory={machineCategory}
            selectionLoading={selectionLoading}
          />
        </Flex>
        <Flex justifyContent={"space-between"}>
          <Button
            onClick={() => {
              handleCheckNavigation("/equipment-machine");
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
              <Flex>Add Equipment/Machine</Flex>
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
