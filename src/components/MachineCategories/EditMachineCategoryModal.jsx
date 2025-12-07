import {
  Accordion,
  AccordionButton,
  AccordionItem,
  AccordionPanel,
  Box,
  Button,
  Divider,
  Flex,
  Input,
  MenuItem,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
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
import ReactSelect from "react-select";
import { FaChevronDown, FaPlus, FaTriangleExclamation } from "react-icons/fa6";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import { api } from "../../api/api";
import Swal from "sweetalert2";
import { useState } from "react";
import { FaRegEdit, FaRegTrashAlt } from "react-icons/fa";
import WorkOrderDetailsFormQuestion from "../WorkOrders/WorkOrderDetailsFormQuestion";
import SwalErrorMessages from "../SwalErrorMessages";
import convertToFormData from "../../utils/ConvertToFormData";

export default function EditMachineCategoryModal({
  fetchMachineCategory,
  inspectionFormSelection,
  val,
  layout,
  abortControllerRef,
}) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [openAccordions, setOpenAccordions] = useState([]);
  const [buttonLoading, setButtonLoading] = useState(false);

  const handleChange = (newValue) => {
    setValue("inspectionForm", newValue);
  };

  const toggleAccordion = (index) => {
    setOpenAccordions(
      (prev) =>
        prev.includes(index)
          ? prev.filter((i) => i !== index) // Close accordion if it's already open
          : [...prev, index], // Open accordion if it's closed
    );
  };

  const handleDeleteInspection = (index) => {
    const currentInspections = getValues("inspectionForm");
    const updatedInspections = currentInspections.filter((_, i) => i !== index);
    setValue("inspectionForm", updatedInspections, { shouldValidate: true });
  };

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
      name: "",
      inspectionForm: [],
    },
    resolver: yupResolver(
      Yup.object({
        name: Yup.string().trim().required("Name is required"),
      }),
    ),
    mode: "onTouched",
    reValidateMode: "onChange",
  });

  const filteredOptions = inspectionFormSelection.filter(
    (option) =>
      !watch("inspectionForm").some(
        (selected) => selected.label === option.label,
      ),
  );

  async function onSubmit(data) {
    setButtonLoading(true);
    const formData = convertToFormData(data);

    await api
      .post(`machine-category/${val.UID}`, formData, {
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
        fetchMachineCategory();
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
        handleCloseModal();
      });
  }

  function handleCloseModal() {
    onClose();
    reset({
      name: "",
      inspectionForm: [],
    });
  }

  function handleOpenModal() {
    onOpen();
    setValue("name", val.name);
    setValue("description", val.description);
    setValue(
      "inspectionForm",
      val.inspection_forms.map((form) => ({
        id: form.id,
        label: form.name,
        value: form,
      })),
    );
  }

  return (
    <>
      {layout == "menu" ? (
        <MenuItem
          onClick={handleOpenModal}
          color={"#039be5"}
          icon={<FaRegEdit />}
        >
          Edit
        </MenuItem>
      ) : (
        <Button
          _hover={{ bg: "#dc143c", color: "white" }}
          bg={"white"}
          onClick={handleOpenModal}
          border={"1px solid #dc143c"}
          color={"#dc143c"}
          h={"auto"}
          fontSize={"14px"}
          py={"4px"}
          px={"8px"}
        >
          <Flex alignItems={"center"} gap={"5px"}>
            <Flex>
              <FaPlus />
            </Flex>
            <Flex>Add Inspection Form</Flex>
          </Flex>
        </Button>
      )}
      <Modal
        closeOnOverlayClick={false}
        isOpen={isOpen}
        onClose={handleCloseModal}
        isCentered
        closeOnEsc={!buttonLoading}
      >
        <ModalOverlay />
        <ModalContent bg={"white"} maxW="60%" maxH={"90vh"} overflow={"auto"}>
          <ModalHeader
            py={"5px"}
            px={"16px"}
            display={"flex"}
            flexDir={"column"}
          >
            <Flex color={"crimson"}>Edit Machine Category</Flex>

            <Flex
              textAlign={"center"}
              fontSize={"14px"}
              color={"#848484"}
              justifyContent={"space-between"}
            >
              <Flex>
                Provide a name for the machine category and select the
                inspections that belong to it.
              </Flex>
            </Flex>
          </ModalHeader>
          <ModalCloseButton color={"black"} isDisabled={buttonLoading} />
          <Divider m={0} />

          <ModalBody>
            <Flex flexDir={"column"} gap={"10px"}>
              <Flex position={"relative"} pb={"20px"} flexDir={"column"}>
                <Flex flexDir={"column"}>
                  <Box fontWeight={700} as="span" flex="1" textAlign="left">
                    Machine Category Name&nbsp;
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
                    <Flex>Give your Machine Category a clear name</Flex>
                  </Flex>
                </Flex>
                <Flex>
                  <Input
                    placeholder="CVD Machine"
                    {...register("name")}
                    border={
                      errors.name ? "1px solid crimson" : "1px solid #E2E8F0"
                    }
                  ></Input>
                </Flex>
                {errors.name ? (
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
                    <Flex>{errors.name.message}</Flex>
                  </Flex>
                ) : (
                  ""
                )}
              </Flex>
              <Flex position={"relative"} pb={"20px"} flexDir={"column"}>
                <Flex flexDir={"column"}>
                  <Box fontWeight={700} as="span" flex="1" textAlign="left">
                    Description (
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
                    <Flex>Give your Machine Category a description</Flex>
                  </Flex>
                </Flex>
                <Flex>
                  <Textarea
                    placeholder="A CVD (Chemical Vapor Deposition) machine is an advanced processing system used to deposit thin films or coatings onto a substrate through chemical reactions of vapor-phase precursors."
                    {...register("description")}
                  />
                </Flex>
              </Flex>
              <Flex position={"relative"} pb={"20px"} flexDir={"column"}>
                <Flex flexDir={"column"}>
                  <Box fontWeight={700} as="span" flex="1" textAlign="left">
                    Attach to Inspection Form (
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
                    <Flex>
                      Choose the inspection forms where this machine category
                      will be used.
                    </Flex>
                  </Flex>
                </Flex>
                <Flex w={"100%"} pb={"10px"}>
                  <Controller
                    name="inspectionForm"
                    control={control}
                    render={({ field }) => (
                      <ReactSelect
                        {...field}
                        isMulti
                        options={filteredOptions}
                        onChange={handleChange}
                        placeholder="Select..."
                        styles={{
                          control: (provided, state) => ({
                            ...provided,
                            // borderColor: "#3cc1fa",
                            width: "100%",
                          }),
                          container: (provided) => ({
                            ...provided,
                            width: "100%",
                          }),
                        }}
                      />
                    )}
                  />
                </Flex>
                <TableContainer overflowX={"hidden"} w={"100%"}>
                  <Table w={"100%"} variant="simple">
                    <Thead>
                      <Tr bg={"#ECEFF3"}>
                        <Th color={"black"} px={"12px"}>
                          No
                        </Th>
                        <Th color={"black"} px={"12px"}>
                          Inspection Form
                        </Th>
                        <Th px={"12px"}>Action</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {watch("inspectionForm")?.length === 0 ||
                      !watch("inspectionForm") ? (
                        <Tr>
                          <Td colSpan={3} bg={"#f8f9fa"}>
                            <Flex
                              w={"100%"}
                              h={"200px"}
                              justify={"center"}
                              flexDir={"column"}
                              gap={"5px"}
                            >
                              <Flex
                                fontSize={"16px"}
                                fontWeight={700}
                                justify={"center"}
                                alignItems={"center"}
                                color={"#dc143c"}
                              >
                                <Flex>No Inspection Form selected yet!</Flex>
                              </Flex>
                              <Flex
                                justify={"center"}
                                // color={"#848484"}
                                fontWeight={700}
                              >
                                Please select the Inspection Form needed for
                                this step.
                              </Flex>
                            </Flex>
                          </Td>
                        </Tr>
                      ) : (
                        watch("inspectionForm")?.map(
                          (selectedMachine, index) => {
                            const isOpen = openAccordions.includes(index); // Check if this accordion is open
                            return (
                              <>
                                <Tr
                                // cursor={"pointer"}
                                // bg={"#f9f9f9"}
                                // onClick={() => toggleAccordion(index)} // Toggle open/close on click
                                // _hover={{ background: "#ededed" }}
                                // transition={"background ease-in-out 0.1s"}
                                >
                                  <Td fontWeight={700} px={"12px"}>
                                    {index + 1}.
                                  </Td>
                                  <Td whiteSpace={"normal"} px={"12px"}>
                                    {selectedMachine.value.name}
                                  </Td>
                                  <Td textAlign="center" verticalAlign="middle">
                                    <Flex>
                                      <Tooltip
                                        hasArrow
                                        placement="top"
                                        label="Delete"
                                        aria-label="A tooltip"
                                        background="crimson"
                                        color="white"
                                      >
                                        <Flex
                                          justifyContent="center"
                                          alignItems="center"
                                          cursor="pointer"
                                          color="crimson"
                                          onClick={() => {
                                            handleDeleteInspection(index);
                                          }}
                                        >
                                          <FaRegTrashAlt />
                                        </Flex>
                                      </Tooltip>
                                    </Flex>
                                  </Td>
                                </Tr>
                                {/* <Tr>
                                  <Td
                                    borderX={"1px solid #EDF2F7"}
                                    colSpan={7}
                                    p={0}
                                  >
                                    <Accordion
                                      index={isOpen ? 0 : -1}
                                      allowMultiple
                                    >
                                      <AccordionItem>
                                        <AccordionButton
                                          display={"none"}
                                          p={0}
                                        ></AccordionButton>
                                        <AccordionPanel px={"10px"} py={"10px"}>
                                          <Flex flexDir={"column"} gap={"10px"}>
                                            <Flex alignItems={"center"}>
                                              <Flex fontWeight={700}>
                                                Inspection Form :
                                              </Flex>
                                            </Flex>
                                            <Flex
                                              fontSize={"14px"}
                                              flexDir={"column"}
                                              w={"100%"}
                                            >
                                              <Flex
                                                bg={"#F8F9FA"}
                                                w={"100%"}
                                                color={"#848484"}
                                                fontSize={"14px"}
                                                shadow={
                                                  "0px 0px 3px rgba(50,50,93,0.5)"
                                                }
                                              >
                                                <Flex
                                                  borderRight={
                                                    "#E2E8F0 1px solid"
                                                  }
                                                  px={"10px"}
                                                  py={"5px"}
                                                  w={"50%"}
                                                >
                                                  Question
                                                </Flex>

                                                <Flex
                                                  borderRight={
                                                    "#E2E8F0 1px solid"
                                                  }
                                                  px={"10px"}
                                                  py={"5px"}
                                                  w={"25%"}
                                                >
                                                  Type of response
                                                </Flex>
                                                <Flex
                                                  px={"10px"}
                                                  py={"5px"}
                                                  w={"25%"}
                                                >
                                                  Setup
                                                </Flex>
                                              </Flex>
                                              {selectedMachine.value
                                                .inspection_questions.length ? (
                                                selectedMachine.value.inspection_questions.map(
                                                  (inspectionQuestion, idx) => (
                                                    <WorkOrderDetailsFormQuestion
                                                      val={inspectionQuestion}
                                                      index={idx}
                                                    />
                                                  )
                                                )
                                              ) : (
                                                <Flex
                                                  w={"100%"}
                                                  justifyContent={"center"}
                                                  py={"40px"}
                                                  boxShadow={
                                                    "0px 0px 3px rgba(50,50,93,0.5)"
                                                  }
                                                  flexDir={"column"}
                                                  alignItems={"center"}
                                                >
                                                  <Flex
                                                    color={"#dc143c"}
                                                    fontWeight={700}
                                                  >
                                                    No questions assigned!
                                                  </Flex>
                                                  <Flex color={"#848484"}>
                                                    There are no assigned
                                                    inspection questions for
                                                    this machine.
                                                  </Flex>
                                                </Flex>
                                              )}
                                            </Flex>
                                          </Flex>
                                        </AccordionPanel>
                                      </AccordionItem>
                                    </Accordion>
                                  </Td>
                                </Tr> */}
                              </>
                            );
                          },
                        )
                      )}
                    </Tbody>
                  </Table>
                </TableContainer>
              </Flex>
            </Flex>
          </ModalBody>
          <Divider m={0} />
          <ModalFooter w={"100%"} justifyContent={"center"}>
            <Flex w={"100%"} alignItems={"center"} justifyContent={"end"}>
              <Flex>
                <Button
                  isLoading={buttonLoading}
                  _hover={{ background: "#dc143c", color: "white" }}
                  width={"95px"}
                  color={"#dc143c"}
                  background={"transparent"}
                  border={"1px solid #dc143c"}
                  mr={3}
                  onClick={handleCloseModal}
                >
                  Close
                </Button>
                <Button
                  isLoading={buttonLoading}
                  _hover={{ background: "#c40a2f" }}
                  width={"95px"}
                  border={"1px solid #dc143c"}
                  color={"white"}
                  bgColor={"#dc143c"}
                  variant="ghost"
                  onClick={handleSubmit(onSubmit)}
                >
                  Save
                </Button>
              </Flex>
            </Flex>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}
