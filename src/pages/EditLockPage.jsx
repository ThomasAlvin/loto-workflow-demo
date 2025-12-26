import {
  Box,
  Button,
  Flex,
  Image,
  Input,
  Table,
  TableContainer,
  Tbody,
  Td,
  Textarea,
  Th,
  Thead,
  Tooltip,
  Tr,
  useDisclosure,
} from "@chakra-ui/react";
import { BiImageAdd } from "react-icons/bi";
import { FaPlus, FaRegEdit, FaRegTrashAlt } from "react-icons/fa";
import { FaLeftLong, FaTriangleExclamation } from "react-icons/fa6";
import { useEffect, useRef, useState } from "react";
import { useLoading } from "../service/LoadingContext";
import * as Yup from "yup";
import { ImCheckmark } from "react-icons/im";
import { useFormik } from "formik";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { api } from "../api/api";
import Swal from "sweetalert2";
import QRCodeGenerator from "../components/LockInventory/QRCodeGenerator";
import { MdImageNotSupported } from "react-icons/md";
import SwalErrorMessages from "../components/SwalErrorMessages";
import { IoMdClose } from "react-icons/io";
import setAllFieldsTouched from "../utils/setAllFieldsTouched";
import getLockImageByModel from "../utils/getLockImageByModel";
import { FiZoomIn } from "react-icons/fi";
import ImageFocusOverlay from "../components/ImageFocusOverlay";
import convertToFormData from "../utils/convertToFormData";
import ListEmptyState from "../components/ListEmptyState";
import { LuNfc } from "react-icons/lu";
import { BsDpadFill } from "react-icons/bs";
import LockAccessMethodModal from "../components/LockInventory/LockAccessMethodModal";
import tinycolor from "tinycolor2";
export default function EditLockPage() {
  const nav = useNavigate();
  const imageFocusDisclosure = useDisclosure();

  const { UID } = useParams();
  const [imageFocusURL, setImageFocusURL] = useState();
  const { loading, setLoading } = useLoading();
  const location = useLocation();

  const initialLockInput = {
    name: "",
    model: "",
    serialNumber: "",
    imageFile: null,
    imageUrl: null,
    deleteImageFile: false,
  };
  const fileInputRef = useRef(); // Create an array of refs
  const [lockInput, setLockInput] = useState(initialLockInput);
  const triggerFileInput = (index) => {
    fileInputRef.current.click();
  };
  // Handle file changes
  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];

    if (selectedFile) {
      const previewUrl = URL.createObjectURL(selectedFile);
      setLockInput((prevFiles) => ({
        ...prevFiles,
        imageFile: selectedFile,
        imageUrl: previewUrl,
        deleteImageFile: false,
      }));
    }
  };
  function handleImageFocus(imageURL) {
    setImageFocusURL(imageURL);
    imageFocusDisclosure.onOpen();
  }
  function deleteImageHandler() {
    setLockInput((prevFiles) => ({
      ...prevFiles,
      imageFile: "",
      imageUrl: "",
      deleteImageFile: true,
    }));
    fileInputRef.current.value = ""; // Clear the input value
  }

  const formik = useFormik({
    initialValues: { name: "" },
    validationSchema: Yup.object().shape({
      name: Yup.string().trim().required("Lock name is required"),
    }),
    onSubmit: () => {
      submitEditLock();
    },
  });
  function inputHandler(event) {
    const { id, value } = event.target;
    if (id === "password") {
      let inputValue = value.replace(/[^0-9]/g, "");
      setLockInput((prevState) => ({ ...prevState, [id]: inputValue }));
    } else {
      setLockInput((prevState) => ({ ...prevState, [id]: value }));
    }
    formik.setFieldValue(id, value);
  }
  async function submitEditLock() {
    setLoading(true);
    try {
      const formData = convertToFormData(lockInput);

      await api
        .testSubmit("Lock saved successfully")
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
          nav("/lock-inventory");
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
  async function fetchLock(controller) {
    setLoading(true);
    await api
      .getLockByUID(UID)
      .then(async (response) => {
        setLockInput({
          name: response.data.lock.name,
          serialNumber: response.data.lock.serial_number,
          model: response.data.lock.model,
          imageUrl: response.data.lock.image_url
            ? response.data.lock.image_url
            : "",
          imageFile: "",
          deleteImageFile: false,
          additionalNotes: response.data.lock.additional_notes,
          nfcTags: response.data.lock.nfc_tags,
          directionalPasscodes: response.data.lock.directional_passcodes,
        });
        formik.setValues({
          name: response.data.lock.name,
        });
      })
      .catch((err) => {
        console.log(err);
      })
      .finally(() => {
        setLoading(false);
      });
  }
  useEffect(() => {
    const controller = new AbortController();
    fetchLock(controller);

    return () => {
      controller.abort(); // Cleanup previous fetch request before new one starts
    };
  }, []);
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
              Edit Lock
            </Flex>
            <Flex gap={"10px"} flexDir={"column"}>
              <Flex fontWeight={700} justify={"space-between"}>
                <Flex>Lock Image</Flex>
              </Flex>
              <Flex
                position={"relative"}
                role="group"
                cursor={"pointer"}
                background={"#f8f9fa"}
                _hover={{ boxShadow: "0px 0px 5px rgba(50,50,93,0.5)" }}
                boxShadow="0px 0px 2px rgba(50,50,93,0.5)"
                // minH={"300px"}
                transition="box-shadow 0.2s ease-in-out"
              >
                {lockInput.model ? (
                  <>
                    <Flex
                      // onClick={() => triggerFileInput(0)}
                      bg={"#f8f9fa"}
                      justifyContent={"center"}
                      w={"100%"}
                      alignItems={"center"}
                    >
                      <Flex
                        onClick={() => {
                          handleImageFocus(
                            getLockImageByModel(lockInput.model)
                          );
                        }}
                        cursor={"pointer"}
                        position={"relative"}
                        role="group"
                      >
                        <Flex
                          _groupHover={{ display: "block" }}
                          w={"100%"}
                          display={"none"}
                          h={"100%"}
                          bg={"black"}
                          opacity={0.1}
                          position={"absolute"}
                        ></Flex>
                        <Flex
                          p={"3px"}
                          _groupHover={{ display: "block" }}
                          display={"none"}
                          top={0}
                          right={0}
                          position={"absolute"}
                          fontSize={"32px"}
                          color={"#f8f9fa"}
                        >
                          <FiZoomIn />
                        </Flex>
                        <Image
                          w={"100%"}
                          bg={"#f5f5f5"}
                          boxShadow={"0px 0px 3px rgba(50,50,93,0.5)"}
                          src={getLockImageByModel(lockInput.model)}
                        ></Image>
                      </Flex>
                    </Flex>
                  </>
                ) : (
                  <Flex
                    onClick={() => triggerFileInput(0)}
                    justifyContent={"center"}
                    w={"100%"}
                    alignItems={"center"}
                  >
                    <Flex flexDir={"column"} gap={"5px"} alignItems={"center"}>
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
            </Flex>
            <input
              type="file"
              ref={fileInputRef} // Assign ref dynamically to each input
              style={{ display: "none" }}
              onChange={handleFileChange}
              accept="image/*"
            />
          </Flex>

          <Flex mx={"20px"} w={"1px"} h={"100%"} bg={"#d6d6df"}></Flex>
          <Flex w={"60%"} h={"100%"}>
            <Flex flexDir={"column"} w={"100%"} gap={"20px"}>
              <Flex h={"40px"}></Flex>
              <Flex position={"relative"} flexDir={"column"}>
                <Flex flexDir={"column"}>
                  <Box fontWeight={700} as="span" flex="1" textAlign="left">
                    Lock Name&nbsp;
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
                    <Flex>Give your Lock a short and clear name</Flex>
                  </Flex>
                </Flex>
                <Flex>
                  <Input
                    id="name"
                    value={lockInput.name}
                    onBlur={formik.handleBlur}
                    onChange={inputHandler}
                    placeholder="Boiler Room LOTO Lock"
                  ></Input>
                </Flex>
                {formik.errors.name && formik.touched.name ? (
                  <Flex
                    position={"absolute"}
                    left={0}
                    bottom={"-20px"}
                    color="crimson"
                    fontSize="14px"
                    gap="5px"
                    alignItems="center"
                  >
                    <FaTriangleExclamation />
                    <Flex>{formik.errors.name}</Flex>
                  </Flex>
                ) : (
                  ""
                )}
              </Flex>
              <Flex flexDir={"column"}>
                <Flex flexDir={"column"}>
                  <Box fontWeight={700} as="span" flex="1" textAlign="left">
                    Model
                  </Box>
                  <Flex
                    textAlign={"center"}
                    fontSize={"14px"}
                    color={"#848484"}
                    justifyContent={"space-between"}
                  >
                    <Flex>The model for the lock</Flex>
                  </Flex>
                </Flex>
                <Flex>
                  <Input isDisabled value={lockInput.model}></Input>
                </Flex>
              </Flex>
              <Flex flexDir={"column"}>
                <Flex flexDir={"column"}>
                  <Box fontWeight={700} as="span" flex="1" textAlign="left">
                    Serial Number
                  </Box>
                  <Flex
                    textAlign={"center"}
                    fontSize={"14px"}
                    color={"#848484"}
                    justifyContent={"space-between"}
                  >
                    <Flex>The serial number for the lock</Flex>
                  </Flex>
                </Flex>
                <Flex>
                  <Input isDisabled value={lockInput.serialNumber}></Input>
                </Flex>
              </Flex>
              <Flex flexDir={"column"}>
                <Flex flexDir={"column"}>
                  <Box fontWeight={700} as="span" flex="1" textAlign="left">
                    Additional Notes (
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
                    <Flex>Give your Lock a additional notes</Flex>
                  </Flex>
                </Flex>
                <Flex>
                  <Textarea
                    border={"1px solid #E2E8F0"}
                    onBlur={formik.handleBlur}
                    onChange={inputHandler}
                    value={lockInput.additionalNotes}
                    placeholder="Add safety or handling notes for this lock"
                    id="additionalNotes"
                  />
                </Flex>
                {formik.errors.additionalNotes &&
                formik.touched.additionalNotes ? (
                  <Flex color={"crimson"}>{formik.errors.additionalNotes}</Flex>
                ) : (
                  ""
                )}
              </Flex>
              <Flex flexDir={"column"} gap={"10px"}>
                <Flex flexDir={"column"}>
                  <Box fontWeight={700} as="span" flex="1" textAlign="left">
                    Lock Access Methods
                  </Box>

                  <Flex
                    textAlign={"center"}
                    fontSize={"14px"}
                    color={"#848484"}
                    justifyContent={"space-between"}
                  >
                    <Flex>
                      Set up and control the different unlocking methods
                      supported by this lock.
                    </Flex>
                  </Flex>
                </Flex>
                <Flex flexDir={"column"} gap={"20px"}>
                  <TableContainer
                    overflow={"auto"}
                    boxShadow={"0px 0px 3px rgba(50,50,93,0.5)"}
                  >
                    <Table variant="simple">
                      <Thead bg={"#ECEFF3"}>
                        <Tr>
                          <Th borderBottomColor={"#bababa"} px={"12px"}>
                            <Flex alignItems={"center"} gap={"5px"}>
                              <Flex>NFC Tags</Flex>
                              <Flex fontSize={"18px"}>
                                <LuNfc />
                              </Flex>
                            </Flex>
                          </Th>{" "}
                          <Th
                            w={"100px"}
                            borderBottomColor={"#bababa"}
                            px={"12px"}
                          >
                            <Flex alignItems={"center"} gap={"5px"}>
                              <Flex>Action</Flex>
                            </Flex>
                          </Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {lockInput?.nfcTags?.length ? (
                          <>
                            {lockInput?.nfcTags.map((tag, tagIndex) => {
                              return (
                                <Tr
                                  cursor={"pointer"}
                                  _hover={{
                                    background: "#f5f5f5",
                                  }}
                                  w={"100%"}
                                  bg={tagIndex % 2 ? "white" : "#f8f9fa"}
                                >
                                  <Td
                                    px={"12px"}
                                    borderBottomColor={"#bababa"}
                                    color={"#848484"}
                                    overflowWrap="break-word"
                                    maxWidth="50px"
                                    whiteSpace="normal"
                                    fontSize={"14px"}
                                  >
                                    <Flex fontSize={"14px"}>
                                      {tag.name + " - " + tag.tag_id}
                                    </Flex>
                                  </Td>
                                  <Td
                                    px={"12px"}
                                    borderBottomColor={"#bababa"}
                                    color={"#848484"}
                                    overflowWrap="break-word"
                                    maxWidth="50px"
                                    whiteSpace="normal"
                                    fontSize={"14px"}
                                  >
                                    <Flex
                                      gap={"16px"}
                                      alignItems={"center"}
                                      fontSize={"18px"}
                                    >
                                      <Flex>
                                        <Tooltip
                                          hasArrow
                                          placement={"top"}
                                          background={"#007BFF"}
                                          label={"Edit"}
                                          aria-label="A tooltip"
                                          color={"white"}
                                        >
                                          <Flex
                                            cursor={"pointer"}
                                            color={"#007BFF"}
                                          >
                                            <FaRegEdit />
                                          </Flex>
                                        </Tooltip>
                                      </Flex>
                                      <Flex>
                                        <Tooltip
                                          hasArrow
                                          placement={"top"}
                                          background={"#dc143c"}
                                          label={"Delete"}
                                          aria-label="A tooltip"
                                          color={"white"}
                                        >
                                          <Flex
                                            cursor={"pointer"}
                                            color={"#dc143c"}
                                          >
                                            <FaRegTrashAlt />
                                          </Flex>
                                        </Tooltip>
                                      </Flex>
                                    </Flex>
                                  </Td>
                                </Tr>
                              );
                            })}
                            <Tr
                              w={"100%"}
                              bg={
                                lockInput?.nfcTags.length % 2
                                  ? "white"
                                  : "#f8f9fa"
                              }
                            >
                              <Td
                                px={"12px"}
                                color={"#848484"}
                                overflowWrap="break-word"
                                maxWidth="50px"
                                whiteSpace="normal"
                                fontSize={"14px"}
                              >
                                <LockAccessMethodModal />
                              </Td>
                              <Td></Td>
                            </Tr>
                          </>
                        ) : (
                          <ListEmptyState
                            size={"xs"}
                            colSpan={7}
                            header1={"No NFC tag found."}
                            header2={"assign one to begin tracking them"}
                            linkText={"Create an action"}
                          />
                        )}
                      </Tbody>
                    </Table>
                  </TableContainer>

                  <TableContainer
                    overflow={"auto"}
                    boxShadow={"0px 0px 3px rgba(50,50,93,0.5)"}
                  >
                    <Table variant="simple">
                      <Thead bg={"#ECEFF3"}>
                        <Tr>
                          <Th
                            // w={"80%"}
                            borderBottomColor={"#bababa"}
                            px={"12px"}
                          >
                            <Flex alignItems={"center"} gap={"10px"}>
                              <Flex>Directional Passcodes</Flex>
                              <Flex fontSize={"18px"}>
                                <BsDpadFill />
                              </Flex>
                            </Flex>
                          </Th>
                          <Th
                            w={"100px"}
                            borderBottomColor={"#bababa"}
                            px={"12px"}
                          >
                            <Flex alignItems={"center"} gap={"5px"}>
                              <Flex>Action</Flex>
                            </Flex>
                          </Th>
                        </Tr>
                      </Thead>

                      <Tbody>
                        {lockInput?.directionalPasscodes?.length ? (
                          <>
                            {lockInput?.directionalPasscodes?.map(
                              (passcode, passcodeIndex) => (
                                <Tr
                                  w={"100%"}
                                  bg={passcodeIndex % 2 ? "white" : "#f8f9fa"}
                                >
                                  <Td
                                    px={"12px"}
                                    borderBottomColor={"#bababa"}
                                    color={"#848484"}
                                    overflowWrap="break-word"
                                    maxWidth="50px"
                                    whiteSpace="normal"
                                    fontSize={"14px"}
                                  >
                                    <Flex alignItems={"center"}>
                                      <Flex fontSize={"14px"}>
                                        {passcode.name}
                                      </Flex>
                                    </Flex>
                                  </Td>
                                  <Td
                                    px={"12px"}
                                    borderBottomColor={"#bababa"}
                                    color={"#848484"}
                                    overflowWrap="break-word"
                                    maxWidth="50px"
                                    whiteSpace="normal"
                                    fontSize={"14px"}
                                  >
                                    <Flex
                                      gap={"16px"}
                                      alignItems={"center"}
                                      fontSize={"18px"}
                                    >
                                      <Flex>
                                        <Tooltip
                                          hasArrow
                                          placement={"top"}
                                          background={"#007BFF"}
                                          label={"Edit"}
                                          aria-label="A tooltip"
                                          color={"white"}
                                        >
                                          <Flex
                                            cursor={"pointer"}
                                            color={"#007BFF"}
                                          >
                                            <FaRegEdit />
                                          </Flex>
                                        </Tooltip>
                                      </Flex>
                                      <Flex>
                                        <Tooltip
                                          hasArrow
                                          placement={"top"}
                                          background={"#dc143c"}
                                          label={"Delete"}
                                          aria-label="A tooltip"
                                          color={"white"}
                                        >
                                          <Flex
                                            cursor={"pointer"}
                                            color={"#dc143c"}
                                          >
                                            <FaRegTrashAlt />
                                          </Flex>
                                        </Tooltip>
                                      </Flex>
                                    </Flex>
                                  </Td>
                                </Tr>
                              )
                            )}
                            <Tr
                              w={"100%"}
                              bg={
                                lockInput?.directionalPasscodes.length % 2
                                  ? "white"
                                  : "#f8f9fa"
                              }
                            >
                              <Td
                                px={"12px"}
                                color={"#848484"}
                                overflowWrap="break-word"
                                maxWidth="50px"
                                whiteSpace="normal"
                                fontSize={"14px"}
                              >
                                <LockAccessMethodModal />
                              </Td>
                              <Td></Td>
                            </Tr>
                          </>
                        ) : (
                          <ListEmptyState
                            size={"xs"}
                            colSpan={7}
                            header1={"No directional passcode found."}
                            header2={"assign one to begin tracking them"}
                            linkText={"Create an action"}
                          />
                        )}
                      </Tbody>
                    </Table>
                  </TableContainer>
                </Flex>
              </Flex>
              <Flex gap={"20px"} flexDir={"column"}>
                <Flex flexDir={"column"}>
                  <Box fontWeight={700} as="span" flex="1" textAlign="left">
                    QR Code
                  </Box>
                  <Flex
                    textAlign={"center"}
                    fontSize={"14px"}
                    color={"#848484"}
                    justifyContent={"space-between"}
                  >
                    <Flex>
                      A QR Code that encodes the lock's unique serial number for
                      easy identification.
                    </Flex>
                  </Flex>
                </Flex>
                <QRCodeGenerator QRCodeValue={lockInput.serialNumber} />
              </Flex>
            </Flex>
          </Flex>
        </Flex>
        <Flex justifyContent={"space-between"}>
          <Button
            onClick={() => {
              nav(`/lock-inventory${location.search}`);
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
      <ImageFocusOverlay
        imageFocusDisclosure={imageFocusDisclosure}
        imageFocusURL={imageFocusURL}
      />
    </Flex>
  );
}
