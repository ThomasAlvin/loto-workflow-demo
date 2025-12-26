import {
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
  Textarea,
  useDisclosure,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { v4 as uuid } from "uuid";
import CreatableSelect from "react-select/creatable";
import { FaPlus, FaTriangleExclamation } from "react-icons/fa6";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import CreateInspectionFormModalFormQuestion from "./CreateInspectionFormModalFormQuestion";
import { api } from "../../api/api";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import { FaRegEdit } from "react-icons/fa";
import { VscEmptyWindow } from "react-icons/vsc";
import SwalErrorMessages from "../SwalErrorMessages";
import CustomSelectionSelect from "../CustomSelectionSelect";
import convertToFormData from "../../utils/convertToFormData";
import { DragDropContext, Draggable, Droppable } from "react-beautiful-dnd";

export default function EditInspectionFormModal({
  inspectionForm,
  fetchInspectionForms,
  categorySelection,
  setCategorySelection,
  isEdit,
  abortControllerRef,
  selectionLoading,
}) {
  const [buttonLoading, setButtonLoading] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const nav = useNavigate();

  const handleChange = (newValue) => {
    setValue("categories", newValue);
  };
  function onDragEnd(result) {
    if (!result.destination) return;
    const { source, destination } = result;
    const copiedItems = [...getValues("formQuestions")];
    const [removed] = copiedItems.splice(source.index, 1);
    copiedItems.splice(destination.index, 0, removed);
    setValue("formQuestions", copiedItems);
  }
  const handleCreate = (inputValue) => {
    const newOption = {
      value: inputValue,
      label: inputValue,
      newCategory: true,
    };
    setCategorySelection((prev) => [newOption, ...prev]);
    setValue("categories", [...getValues("categories"), newOption]);
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
      name: inspectionForm.name,
      description: inspectionForm.description,
      categories: inspectionForm.category.map((val) => ({
        id: val.id,
        label: val.name,
        value: val.name,
        newCategory: false,
      })),
      formQuestions: inspectionForm.inspection_questions.map((val) => ({
        id: uuid(),
        required: val.is_required,
        title: val.question,
        type: {
          options: val.options,
          title: val.question_type,
          format: val.format,
          date: val.include_date,
          time: val.include_time,
          unit: val.unit,
        },
      })),
    },
    resolver: yupResolver(
      Yup.object({
        name: Yup.string().trim().required("Name is required"),
        formQuestions: Yup.array().of(
          Yup.object().shape({
            title: Yup.string().trim().required("Question cannot be empty"),
            type: Yup.object().shape({
              options: Yup.array().when("title", {
                is: (val) => val === "Multiple Choice", // Check if type.title is 'Multiple Choice'
                then: () =>
                  Yup.array()
                    .of(Yup.string().trim().required("Option cannot be empty")) // Each option must be a string
                    .min(
                      2,
                      "At least two options are required for Multiple Choice"
                    )
                    .test("unique", "Options must be unique", function (value) {
                      if (!value) return true; // Skip if undefined, let required/min handle it
                      const trimmed = value.map((v) =>
                        typeof v === "string" ? v.trim() : ""
                      );
                      if (trimmed.some((v) => v.length === 0)) {
                        return this.createError({
                          message: "Option cannot be empty",
                        });
                      }
                      const unique = new Set(trimmed);
                      return unique.size === trimmed.length;
                    }), // At least 2 options required for Multiple Choice
                otherwise: () =>
                  Yup.array().when("title", {
                    is: (val) => val === "Checkbox" || val === "Checklist", // Check if type.title is 'Checkbox'
                    then: () =>
                      Yup.array()
                        .of(
                          Yup.string().trim().required("Option cannot be empty")
                        )
                        .min(1, "At least one option is required for Checkbox")
                        .test(
                          "unique",
                          "Options must be unique",
                          function (value) {
                            if (!value) return true; // Skip if undefined, let required/min handle it
                            const trimmed = value.map((v) =>
                              typeof v === "string" ? v.trim() : ""
                            );
                            if (trimmed.some((v) => v.length === 0)) {
                              return this.createError({
                                message: "Option cannot be empty",
                              });
                            }
                            const unique = new Set(trimmed);
                            return unique.size === trimmed.length;
                          }
                        ),
                    otherwise: () => Yup.array().nullable(), // Options are not required for other types
                  }),
              }),
            }),
          })
        ),
        formQuestionsSize: Yup.number().when("formQuestions", {
          is: (data) => {
            return data?.length < 1;
          },
          then: (schema) =>
            schema.required("At least one question is required"),
        }), // At least one question if forms is true
      })
    ),
    mode: "onTouched",
    reValidateMode: "onChange",
  });

  const { fields, append, insert, remove } = useFieldArray({
    control,
    name: "formQuestions", // The name must match the array field in your form
  });

  function addNewQuestion() {
    append({
      id: uuid(),
      title: "",
      required: true,
      type: { title: "Text", format: "Short Answer" },
    });
    // -X bekas fix the error when adding or removing shit -X
    // const newQuestion = {
    //   id: uuid(),
    //   title: "",
    //   required: false,
    //   type: {
    //     title: "Text",
    //     format: "Short Answer",
    //   },
    // };
    // const updatedItems = [...getValues("formQuestions"), newQuestion];
    // setValue("formQuestions", updatedItems);
    trigger("formQuestionsSize");
  }
  async function onSubmit(data) {
    setButtonLoading(true);
    const formData = convertToFormData(data);

    await api
      .testSubmit("Inspection form saved successfully")
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
        fetchInspectionForms();
      })
      .catch((error) => {
        console.log(error);
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
    reset(
      {
        name: inspectionForm.name,
        description: inspectionForm.description,
        categories: inspectionForm.category.map((val) => ({
          id: val.id,
          label: val.name,
          value: val.name,
          newCategory: false,
        })),
        formQuestions: inspectionForm.inspection_questions.map((val) => ({
          id: uuid(),
          required: val.is_required,
          title: val.question,
          type: {
            options: val.options,
            title: val.question_type,
            format: val.format,
            date: val.include_date,
            time: val.include_time,
            unit: val.unit,
          },
        })),
      },
      { keepDefaultValues: true }
    );
  }

  useEffect(() => {
    reset(
      {
        name: inspectionForm.name,
        description: inspectionForm.description,
        categories: inspectionForm.category.map((val) => ({
          id: val.id,
          label: val.name,
          value: val.name,
          newCategory: false,
        })),
        formQuestions: inspectionForm.inspection_questions.map((val) => ({
          id: uuid(),
          required: val.is_required,
          title: val.question,
          type: {
            options: val.options,
            title: val.question_type,
            format: val.format,
            date: val.include_date,
            time: val.include_time,
            unit: val.unit,
          },
        })),
      },
      { keepDefaultValues: true }
    );
  }, [inspectionForm]);

  return (
    <>
      {isEdit ? (
        <MenuItem onClick={onOpen} color={"#039be5"} icon={<FaRegEdit />}>
          Edit
        </MenuItem>
      ) : (
        <Button
          _hover={{ bg: "#dc143c", color: "white" }}
          bg={"white"}
          onClick={onOpen}
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
            <Flex>Add Category</Flex>
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
            <Flex color={"crimson"}>Edit Inspection Form </Flex>

            <Flex
              textAlign={"center"}
              fontSize={"14px"}
              color={"#848484"}
              justifyContent={"space-between"}
            >
              <Flex>
                Customize questions and details according to your needs
              </Flex>
            </Flex>
          </ModalHeader>
          <ModalCloseButton isDisabled={buttonLoading} color={"black"} />
          <Divider m={0} />

          <ModalBody>
            <Flex flexDir={"column"} gap={"10px"}>
              <Flex position={"relative"} pb={"20px"} flexDir={"column"}>
                <Flex flexDir={"column"}>
                  <Box fontWeight={700} as="span" flex="1" textAlign="left">
                    Inspection Form Name&nbsp;
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
                    <Flex>Give your inspection form a clear name</Flex>
                  </Flex>
                </Flex>
                <Flex>
                  <Input
                    {...register("name")}
                    border={
                      // errors.name && touchedFields.name
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
                    <Flex>Give your inspection form a description</Flex>
                  </Flex>
                </Flex>
                <Flex>
                  <Textarea {...register("description")} />
                </Flex>
              </Flex>
              <Flex position={"relative"} pb={"20px"} flexDir={"column"}>
                <Flex flexDir={"column"}>
                  <Box fontWeight={700} as="span" flex="1" textAlign="left">
                    Attach to machine categories (
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
                      Choose the machine categories where this inspection form
                      will be used.
                    </Flex>
                  </Flex>
                </Flex>
                <CustomSelectionSelect
                  title={"inspection form"}
                  isLoading={selectionLoading}
                  selection={categorySelection}
                  selectHandler={handleChange}
                  selectedOption={watch("categories")}
                  createNewOption={handleCreate}
                />
              </Flex>
              <Flex flexDir={"column"} gap={"10px"}>
                <Flex flexDir={"column"}>
                  <Flex flexDir={"column"}>
                    <Box fontWeight={700} as="span" flex="1" textAlign="left">
                      Form Questions&nbsp;
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
                      <Flex>
                        Create and customize each question to gather the exact
                        information you need.
                      </Flex>
                    </Flex>
                    {errors.formQuestionsSize?.message && (
                      <Flex
                        color="crimson"
                        fontSize="14px"
                        gap="5px"
                        alignItems="center"
                      >
                        <FaTriangleExclamation />
                        <Flex>{errors.formQuestionsSize?.message}</Flex>
                      </Flex>
                    )}
                  </Flex>
                  <Flex
                    bg={
                      errors.formQuestionsSize?.message ? "#fde2e2" : "#F8F9FA"
                    }
                    w={"100%"}
                    color={
                      errors.formQuestionsSize?.message ? "#dc143c" : "#848484"
                    }
                    fontSize={"14px"}
                    shadow={
                      errors.formQuestionsSize?.message
                        ? "0px 0px 3px rgba(220,20,60,1)"
                        : "0px 0px 3px rgba(50,50,93,0.5)"
                    }
                  >
                    <Flex
                      borderRight={"#E2E8F0 1px solid"}
                      px={"10px"}
                      py={"5px"}
                      w={"50%"}
                    >
                      Question
                    </Flex>

                    <Flex
                      borderRight={"#E2E8F0 1px solid"}
                      px={"10px"}
                      py={"5px"}
                      w={"25%"}
                    >
                      Type of response
                    </Flex>
                    <Flex px={"10px"} py={"5px"} w={"25%"}>
                      Manage
                    </Flex>
                  </Flex>
                  <DragDropContext onDragEnd={(result) => onDragEnd(result)}>
                    <Droppable droppableId={"question"} key={"question"}>
                      {(provided, snapshot) => {
                        return (
                          <Flex
                            flexDir={"column"}
                            ref={provided.innerRef}
                            {...provided.droppableProps}
                            style={{
                              width: "100%",
                              background: snapshot.isDraggingOver
                                ? "#ffb0b0"
                                : "",
                            }}
                          >
                            {watch("formQuestions").length === 0 ? (
                              <Flex
                                justifyContent={"center"}
                                flexDir={"column"}
                                p={"20px"}
                                bg={"#f8f9fa"}
                                border={
                                  errors.formQuestionsSize?.message
                                    ? "#dc143c 2px dashed"
                                    : "#848484 2px dashed"
                                }
                                color={"#848484"}
                                gap={"20px"}
                              >
                                <Flex justify={"center"} fontSize={"100px"}>
                                  <VscEmptyWindow />
                                </Flex>
                                <Flex flexDir={"column"} gap={"5px"}>
                                  <Flex
                                    justify={"center"}
                                    fontWeight={700}
                                    fontSize={"20px"}
                                  >
                                    Form Questions is Empty!
                                  </Flex>
                                  <Flex justify={"center"}>
                                    Create questions to gather the information
                                    needed for this step.
                                  </Flex>
                                </Flex>
                              </Flex>
                            ) : (
                              fields.map((field, index) => (
                                <Draggable
                                  key={field.id}
                                  draggableId={field.id}
                                  index={index}
                                >
                                  {(provided, snapshot) => (
                                    <CreateInspectionFormModalFormQuestion
                                      key={field.id}
                                      id={field.id}
                                      provided={provided}
                                      watch={watch}
                                      register={register}
                                      title={field.title}
                                      insert={insert}
                                      remove={remove}
                                      required={field.required}
                                      type={field.type}
                                      setValue={setValue}
                                      getValues={getValues}
                                      index={index}
                                      fieldErrors={
                                        errors.formQuestions?.[index]
                                      }
                                      titleErrors={
                                        errors.formQuestions?.[index]?.title
                                      }
                                      optionErrors={
                                        errors.formQuestions?.[index]?.type
                                          ?.options
                                      }
                                      trigger={trigger}
                                    />
                                  )}
                                </Draggable>
                              ))
                            )}
                            {provided.placeholder}
                          </Flex>
                        );
                      }}
                    </Droppable>
                  </DragDropContext>
                </Flex>
                <Flex justify={"space-between"} py={"5px"}>
                  <Button
                    onClick={addNewQuestion}
                    border={"dashed 2px #dc143c"}
                    p={0}
                    h={"auto"}
                  >
                    <Flex
                      py={"6px"}
                      px={"10px"}
                      bg={"white"}
                      alignItems={"center"}
                      justifyContent={"space-between"}
                    >
                      <Flex gap={"10px"} alignItems={"center"}>
                        <Flex color={"crimson"} fontWeight={700}>
                          <FaPlus />
                        </Flex>
                        <Flex color={"crimson"} fontWeight={"700"}>
                          Add Question
                        </Flex>
                      </Flex>
                    </Flex>
                  </Button>
                </Flex>
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
