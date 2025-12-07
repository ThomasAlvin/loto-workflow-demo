import {
  Box,
  Button,
  Divider,
  Flex,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Textarea,
} from "@chakra-ui/react";
import { yupResolver } from "@hookform/resolvers/yup";
import { useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { FaPlus, FaTriangleExclamation } from "react-icons/fa6";
import { VscEmptyWindow } from "react-icons/vsc";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import * as Yup from "yup";
import { api } from "../../api/api";
import convertToFormData from "../../utils/convertToFormData";
import CustomSelectionSelect from "../CustomSelectionSelect";
import SwalErrorMessages from "../SwalErrorMessages";
import CreateInspectionFormModalFormQuestion from "./CreateInspectionFormModalFormQuestion";

export default function CreateInspectionFormModal({
  fetchInspectionForms,
  abortControllerRef,
  categorySelection,
  setCategorySelection,
  selectionLoading,
  woUID,
  onClose,
  isOpen,
}) {
  const nav = useNavigate();
  const [buttonLoading, setButtonLoading] = useState(false);
  const handleChange = (newValue) => {
    setValue("categories", newValue);
  };
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
    setError,
    reset,
    formState: { errors, touchedFields },
    trigger,
  } = useForm({
    defaultValues: {
      name: "",
      description: "",
      categories: [],
      formQuestions: [
        {
          // id: Date.now(),
          title: "",
          required: true,
          type: {
            title: "Text",
            format: "Short Answer",
          },
        },
      ],
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
                    .test("unique", "Options must be unique", (value) => {
                      if (!value) return true; // Skip if undefined, let required/min handle it
                      const trimmed = value.map((v) =>
                        typeof v === "string" ? v.trim() : ""
                      );
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
                        ) // Each option must be a string
                        .min(1, "At least one option is required for Checkbox")
                        .test("unique", "Options must be unique", (value) => {
                          if (!value) return true; // Skip if undefined, let required/min handle it
                          const trimmed = value.map((v) =>
                            typeof v === "string" ? v.trim() : ""
                          );
                          const unique = new Set(trimmed);
                          return unique.size === trimmed.length;
                        }),
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
        }),
      })
    ),
    mode: "onTouched",
    reValidateMode: "onChange",
  });

  const { fields, append, remove, update } = useFieldArray({
    control,
    name: "formQuestions", // The name must match the array field in your form
  });

  function addNewQuestion() {
    append({
      id: Date.now(),
      title: "",
      required: true,
      type: { title: "Text", format: "Short Answer" },
    });
    trigger("formQuestionsSize");
  }
  async function onSubmit(data) {
    setButtonLoading(true);
    const formData = convertToFormData(data);

    await api
      .post(`inspection-form`, formData, {
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
        handleCheckNavigation();
        abortControllerRef.current.abort(); // Cancel any previous request
        abortControllerRef.current = new AbortController();
        fetchInspectionForms();
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
    if (woUID) {
      setButtonLoading(true);
      nav("/work-order/edit/" + woUID + "?redirected=1");
    } else {
      onClose();
      reset();
    }
  }
  function handleCheckNavigation() {
    if (woUID) {
      nav("/work-order/edit/" + woUID + "?redirected=1");
    }
  }
  return (
    <>
      {/* {variant === "card" ? (
        <Flex
          onClick={onOpen}
          bg={"#f8f9fa"}
          p={"20px"}
          boxShadow={"0px 0px 3px rgba(50,50,93,0.5)"}
          h={"100%"}
          w={"100%"}
          minH={"355px"}
          flexDir={"column"}
          gap={"20px"}
          justify={"center"}
          alignItems={"center"}
          cursor={"pointer"}
          transition={"background ease-in-out 0.2s"}
          _hover={{ bg: "#ededed", color: "black" }}
          //   justify={"space-between"}
        >
          <Flex fontSize={"60px"}>
            <FaPlus />
          </Flex>
          <Flex flexDir={"column"} alignItems={"center"}>
            <Flex fontSize={"20px"} fontWeight={700}>
              Add New Inspection Form
            </Flex>
            <Flex fontSize={"14px"} color={"#848484"} textAlign={"center"}>
              Click to start creating a customized form for your inspection
              needs.
            </Flex>
          </Flex>
        </Flex>
      ) : variant === "menuItem" ? (
        <MenuItem onClick={onOpen}>
          <Flex alignItems={"center"} gap={"10px"}>
            <Flex fontSize={"18px"}>
              <FaPlus />
            </Flex>
            <Flex>Add Inspection Form manually</Flex>
          </Flex>
        </MenuItem>
      ) : (
        ""
      )} */}

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
            <Flex color={"crimson"}>Create Inspection Form </Flex>

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
                    placeholder="Ex: Power Generator Inspection Form"
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
                  <Textarea
                    placeholder="Ex: an inspection form used when inspecting the power generator"
                    {...register("description")}
                  />
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
                  title={"machine category"}
                  isLoading={selectionLoading}
                  selection={categorySelection}
                  selectHandler={handleChange}
                  selectedOption={watch("categories")}
                  createNewOption={handleCreate}
                />
                {/* <Flex w={"100%"}>
                  <Controller
                    name="categories"
                    control={control}
                    render={({ field }) => (
                      <CreatableSelect
                        {...field}
                        isMulti
                        options={categorySelection}
                        createOptionPosition="first"
                        onChange={handleChange}
                        onCreateOption={handleCreate}
                        placeholder="Select or create..."
                        formatCreateLabel={(inputValue) => (
                          <Flex
                            gap={"8px"}
                            color={"#2684FF"}
                            alignItems={"center"}
                          >
                            <FaPlus />
                            <Flex>Create "{inputValue}" as new Category</Flex>
                          </Flex>
                        )}
                        styles={{
                          container: (provided) => ({
                            ...provided,
                            width: "100%",
                          }),
                        }}
                      />
                    )}
                  />
                </Flex> */}
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
                  {fields.length === 0 ? (
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
                          Create questions to gather the information needed for
                          this step.
                        </Flex>
                      </Flex>
                    </Flex>
                  ) : (
                    fields.map((field, index) => (
                      <CreateInspectionFormModalFormQuestion
                        key={field.id}
                        field={field}
                        id={field.id}
                        watch={watch}
                        register={register}
                        title={field.title}
                        required={field.required}
                        type={field.type}
                        setValue={setValue}
                        getValues={getValues}
                        index={index}
                        errors={errors}
                        trigger={trigger}
                        update={update}
                        fields={fields}
                        remove={remove}
                      />
                    ))
                  )}
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
                  {woUID ? "Back" : "Close"}
                </Button>
                <Button
                  isLoading={buttonLoading}
                  _hover={{ background: "#b80d2f" }}
                  width={"95px"}
                  border={"1px solid #dc143c"}
                  color={"white"}
                  bgColor={"#dc143c"}
                  variant="ghost"
                  onClick={handleSubmit(onSubmit)}
                >
                  Create
                </Button>
              </Flex>
            </Flex>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}
