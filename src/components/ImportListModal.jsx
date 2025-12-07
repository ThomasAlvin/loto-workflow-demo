import {
  Button,
  Center,
  Divider,
  Flex,
  MenuItem,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Spinner,
  useDisclosure,
} from "@chakra-ui/react";
import { BiExport } from "react-icons/bi";

import { yupResolver } from "@hookform/resolvers/yup";
import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { AiOutlineCloudUpload } from "react-icons/ai";
import { FaFileCsv, FaTriangleExclamation } from "react-icons/fa6";
import { LuUpload } from "react-icons/lu";
import Swal from "sweetalert2";
import * as Yup from "yup";
import { api } from "../api/api";

export default function ImportListModal({
  variant,
  exportLoading,
  downloadTemplateFunction,
  submitImportRoute,
  fetchDataFunction,
  abortControllerRef,
}) {
  const fileInputRef = useRef();
  const [dragCounter, setDragCounter] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [buttonLoading, setButtonLoading] = useState(false);
  const [showAllError, setShowAllError] = useState(false);
  const [importError, setImportError] = useState([]);
  const { isOpen, onClose, onOpen } = useDisclosure();
  const {
    control,
    register,
    handleSubmit,
    setValue,
    getValues,
    watch,
    clearErrors,
    reset,
    formState: { errors, touchedFields },
    trigger,
  } = useForm({
    defaultValues: {
      CSVFile: null, // Initialize CSVFile field
    },
    resolver: yupResolver(
      Yup.object({
        CSVFile: Yup.mixed()
          .required("A CSV file is required")
          .test("is-csv", "Only .csv files are allowed", (value) => {
            if (!value) return false; // If no file is uploaded
            return value?.name?.endsWith(".csv"); // Validate file extension
          }),
      })
    ),
    mode: "onTouched",
    reValidateMode: "onChange",
  });
  const CSVFile = watch("CSVFile");

  function handleFileInputClick() {
    fileInputRef.current.click();
  }

  function fileHandler(event) {
    const selectedFile = event.target.files[0];
    setValue("CSVFile", selectedFile);
    trigger();
  }

  function handleModalClose() {
    onClose();
    setImportError([]);
    setValue("CSVFile", null);
  }

  async function submitImport() {
    setButtonLoading(true);
    try {
      const formData = new FormData();

      formData.append("file", CSVFile);
      await api
        .post(submitImportRoute, formData, {
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
          abortControllerRef.current.abort(); // Cancel any previous request
          abortControllerRef.current = new AbortController();
          fetchDataFunction();
          handleModalClose();
        })
        .catch((error) => {
          console.log(error);
          setImportError(error.response.data.message);
        })
        .finally(() => {
          setButtonLoading(false);
        });
    } catch (error) {
      console.error("Error:", error);
    } finally {
      // setLoading(false);
    }
  }
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    // setIsDragging(true);
  };

  function handleDragEnter(e) {
    e.preventDefault();
    e.stopPropagation();
    setDragCounter((prev) => prev + 1);
    setIsDragging(true);
  }

  function handleDragLeave(e) {
    e.preventDefault();
    e.stopPropagation();
    setDragCounter((prev) => {
      const newCounter = prev - 1;
      if (newCounter === 0) setIsDragging(false);
      return newCounter;
    });
  }

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const droppedFiles = Array.from(e.dataTransfer.files)[0];
    setValue("CSVFile", droppedFiles);
    trigger();

    // setFiles((prevFiles) => [...prevFiles, ...droppedFiles]);
  };

  const handleFileSelect = (e) => {
    const selectedFiles = Array.from(e.target.files);
    // setFiles((prevFiles) => [...prevFiles, ...selectedFiles]);
  };
  return (
    <>
      <MenuItem onClick={onOpen}>
        <Flex alignItems={"center"} gap={"10px"}>
          <Flex fontSize={"18px"}>
            <LuUpload />
          </Flex>
          <Flex>Import from CSV file</Flex>
        </Flex>
      </MenuItem>

      <Modal
        closeOnOverlayClick={false}
        isOpen={isOpen}
        onClose={handleModalClose}
        isCentered
        closeOnEsc={!buttonLoading}
      >
        <ModalOverlay />
        <ModalContent
          onDragEnter={handleDragEnter}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          maxH={"90vh"}
          maxW={"700px"}
          bg={"white"}
          overflow={"auto"}
        >
          <ModalHeader
            display={"flex"}
            gap={"10px"}
            alignItems={"center"}
            color={"#dc143c"}
          >
            Import {variant} Table Data
          </ModalHeader>
          <ModalCloseButton isDisabled={buttonLoading} color={"black"} />
          <Divider m={0} />

          <ModalBody>
            <Flex flexDir={"column"} gap={"10px"}>
              <Flex
                flexDir={"column"}
                py={"10px"}
                px={"10px"}
                bg={"#f8f9fa"}
                color={"#848484"}
                fontSize={"14px"}
                boxShadow={"0px 0px 3px rgba(50,50,93,0.5)"}
              >
                <Flex>
                  1. Download the template file and fill it with proper data.
                </Flex>
                <Flex>
                  2. Once you have downloaded and filled the file, upload it in
                  the form below and submit.
                </Flex>
                <Flex>
                  3. If you have encounter an error, please adjust the data
                  accordingly.
                </Flex>
              </Flex>
              <Flex gap={"15px"} flexDir={"column"}>
                <input
                  ref={fileInputRef}
                  type="file"
                  style={{ display: "none" }}
                  onChange={fileHandler}
                  accept=".xlsx, .csv"
                ></input>
                <Center
                  flexDir={"column"}
                  border={"2px dashed #848484"}
                  h={"200px"}
                  gap={"10px"}
                  cursor={"pointer"}
                  onDrop={handleDrop}
                  onClick={handleFileInputClick}
                  transition={"background-color 0.2s ease"}
                  _hover={{ bg: "#FDE2E2", borderColor: "#dc143c" }}
                  bg={isDragging ? "#FDE2E2" : ""}
                  borderColor={isDragging ? "#dc143c" : ""}
                  role="group"
                >
                  {/* <Flex w={"150px"}>
                    <img src={uploadImage}></img>
                  </Flex> */}
                  <Flex
                    fontSize={"76px"}
                    p={"10px"}
                    bg={isDragging ? "#dc143c" : "#ededed"}
                    color={isDragging ? "white" : "#848484"}
                    borderRadius={"100%"}
                    _groupHover={{
                      bg: "#dc143c", // Change the background when parent is hovered
                      color: "white", // Change the text color when parent is hovered
                    }}
                  >
                    <AiOutlineCloudUpload />
                  </Flex>
                  {isDragging ? (
                    <Center
                      color={"#dc143c"}
                      fontSize={"24px"}
                      fontWeight={700}
                    >
                      Drop Your CSV File Here!
                    </Center>
                  ) : (
                    <Center
                      _groupHover={{
                        color: "#dc143c", // Change the text color when parent is hovered
                      }}
                      color={"#848484"}
                      flexDir={"column"}
                    >
                      <Flex fontSize={"16px"} fontWeight={700}>
                        Select a CSV file to upload
                      </Flex>
                      <Flex fontSize={"16px"}>or drag and drop here!</Flex>
                    </Center>
                  )}
                </Center>

                <Flex justify={"space-between"} pt={"5px"}>
                  <Flex fontWeight={700}>Or select a CSV file here</Flex>
                  {exportLoading ? (
                    <Flex
                      opacity={0.6}
                      color={"#dc143c"}
                      gap={"10px"}
                      alignItems={"center"}
                    >
                      <Flex fontSize={"20px"}>
                        <Spinner />
                      </Flex>
                      <Flex>Downloading...</Flex>
                    </Flex>
                  ) : (
                    <Flex
                      onClick={downloadTemplateFunction}
                      cursor={"pointer"}
                      color={"#dc143c"}
                      gap={"5px"}
                      alignItems={"center"}
                      _hover={{ textDecor: "underline" }}
                    >
                      <Flex fontSize={"20px"}>
                        <BiExport />
                      </Flex>
                      <Flex>Download Template</Flex>
                    </Flex>
                  )}
                </Flex>
                {errors.CSVFile ? (
                  <Flex
                    left={0}
                    top={0}
                    color="crimson"
                    fontSize="14px"
                    gap="5px"
                    alignItems="center"
                  >
                    <FaTriangleExclamation />
                    <Flex>{errors.CSVFile.message}</Flex>
                  </Flex>
                ) : (
                  ""
                )}
                <Flex
                  position={"relative"}
                  bg={errors.CSVFile ? "#fde2e2" : "#f8f9fa"}
                  justify={"space-between"}
                  color={errors.CSVFile ? "#dc143c" : "#848484"}
                  boxShadow={"0px 0px 3px rgba(50,50,93,0.5)"}
                  alignItems={"center"}
                  px={"10px"}
                  py={"8px"}
                >
                  <Flex gap={"10px"} alignItems={"center"}>
                    <Flex fontSize={"20px"} color={"#34A853"}>
                      <FaFileCsv />
                    </Flex>
                    <Flex>{CSVFile?.name || "No file selected"}</Flex>
                    {/* <Flex>equipment_machine_template (4)</Flex> */}
                  </Flex>
                  <Flex>
                    <Button
                      minH={"none"}
                      minW={"none"}
                      h={"32px"}
                      fontSize={"14px"}
                      color={"#848484"}
                      bg={"white"}
                      boxShadow={"0px 0px 3px rgba(50,50,93,0.5)"}
                      _hover={{
                        color: "#dc143c",
                        boxShadow: "0px 0px 3px rgba(220, 20, 60,1)",
                      }}
                      onClick={handleFileInputClick}
                    >
                      Upload
                    </Button>
                  </Flex>
                </Flex>
              </Flex>

              {importError.length ? (
                <Flex
                  flexDir={"column"}
                  bg={"#fde2e2"}
                  p={"10px"}
                  fontSize={"14px"}
                >
                  {Array.isArray(importError) ? (
                    importError?.length > 4 ? (
                      showAllError ? (
                        <>
                          {importError?.map((val) => (
                            <Flex
                              alignItems={"center"}
                              color={"#dc143c"}
                              gap={"10px"}
                            >
                              <Flex>
                                <FaTriangleExclamation />
                              </Flex>
                              <Flex>{val}</Flex>
                            </Flex>
                          ))}
                          <Flex
                            pt={"12px"}
                            cursor={"pointer"}
                            _hover={{ textDecor: "underline" }}
                            onClick={() => {
                              setShowAllError(false);
                            }}
                            fontWeight={700}
                            color={"#a10e30"}
                          >
                            Show less
                          </Flex>
                        </>
                      ) : (
                        <>
                          {importError?.slice(0, 3)?.map((val) => (
                            <Flex
                              alignItems={"center"}
                              color={"#dc143c"}
                              gap={"10px"}
                            >
                              <Flex>
                                <FaTriangleExclamation />
                              </Flex>
                              <Flex>{val}</Flex>
                            </Flex>
                          ))}
                          <Flex color={"#dc143c"}>...</Flex>
                          <Flex
                            cursor={"pointer"}
                            _hover={{ textDecor: "underline" }}
                            onClick={() => {
                              setShowAllError(true);
                            }}
                            fontWeight={700}
                            color={"#a10e30"}
                          >
                            Show more
                          </Flex>
                        </>
                      )
                    ) : (
                      importError?.map((val) => (
                        <Flex
                          alignItems={"center"}
                          color={"#dc143c"}
                          gap={"10px"}
                        >
                          <Flex>
                            <FaTriangleExclamation />
                          </Flex>
                          <Flex>{val}</Flex>
                        </Flex>
                      ))
                    )
                  ) : (
                    <Flex alignItems={"center"} color={"#dc143c"} gap={"10px"}>
                      <Flex>
                        <FaTriangleExclamation />
                      </Flex>
                      <Flex>{importError}</Flex>
                    </Flex>
                  )}
                </Flex>
              ) : (
                ""
              )}
            </Flex>
          </ModalBody>
          <Divider m={0} />
          <ModalFooter gap={"10px"} w={"100%"} justifyContent={"end"}>
            <Button
              isLoading={buttonLoading}
              _hover={{ background: "#dc143c", color: "white" }}
              background={"white"}
              border={"1px solid #dc143c"}
              color={"#dc143c"}
              onClick={handleModalClose}
            >
              Cancel
            </Button>
            <Button
              isLoading={buttonLoading}
              _hover={{ background: "#b51031" }}
              background={"#dc143c"}
              color={"white"}
              onClick={handleSubmit(submitImport)}
            >
              Confirm
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}
