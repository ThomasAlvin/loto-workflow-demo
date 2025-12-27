import {
  Button,
  Divider,
  Flex,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  useDisclosure,
} from "@chakra-ui/react";
import { useFormik } from "formik";
import { useEffect, useRef } from "react";
import { DragDropContext, Droppable } from "react-beautiful-dnd";
import { FaPlus } from "react-icons/fa";
import { FaTriangleExclamation } from "react-icons/fa6";
import { VscEmptyWindow } from "react-icons/vsc";
import { v4 as uuid } from "uuid";
import * as Yup from "yup";
import setAllFieldsTouched from "../../utils/setAllFieldsTouched";
import UnsavedChangesModal from "../CreateTemplate/UnsavedChangesModal";
import StepModalFormDraggable from "./StepModalFormDraggable";
// this component is used in Create Template Page, Create Template Sidebar and Create workOrder Page
export default function EditStepQuestionModal({
  editStepQuestionsDisclosure,
  selectedEditQuestions,
  editStepDrawerFormik,
}) {
  const formikErrorRefs = useRef([]);
  const modalBodyRef = useRef();
  const modalUnsavedChanges = useDisclosure();
  const formik = useFormik({
    initialValues: {
      formQuestions: selectedEditQuestions,
      formQuestionsSize: "",
    },
    validateOnChange: false,
    validationSchema: Yup.object().shape({
      formQuestions: Yup.array() // Return a Yup array schema
        .of(
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
                        }), // At least 1 option required for Checkbox
                    otherwise: () => Yup.array().nullable(), // Options are not required for other types
                  }),
              }),
            }),
          })
        ), // At least one question if forms is true
      formQuestionsSize: Yup.number().when(["form", "formQuestions"], {
        is: (formVal, formQuestionsVal) => {
          return formVal === true && formQuestionsVal?.length < 1;
        },
        then: (schema) => schema.required("At least one question is required"),
      }),
    }),
    onSubmit: () => {
      saveChanges();
    },
  });
  const feedbackDisclosure = useDisclosure();

  function onDragEnd(result) {
    if (!result.destination) return;
    const { source, destination } = result;
    const copiedItems = [...formik.values?.formQuestions];
    const [removed] = copiedItems.splice(source.index, 1);
    copiedItems.splice(destination.index, 0, removed);

    formik.setValues((prevState) => {
      return {
        ...prevState,
        formQuestions: copiedItems,
      };
    });
  }

  async function addNewQuestion() {
    const newQuestion = {
      id: uuid(),
      title: "",
      required: true,
      type: {
        title: "Text",
        format: "Short Answer",
      },
    };
    let updatedFormQuestions = [...formik.values?.formQuestions, newQuestion];

    formik.setValues((prevState) => ({
      ...prevState,
      formQuestions: updatedFormQuestions,
    }));
    formik.validateForm();
  }

  async function saveChanges() {
    await editStepDrawerFormik.setFieldValue(
      "formQuestions",
      formik.values.formQuestions.map((formQuestion, index) => ({
        ...formQuestion,
        accordionOpen: selectedEditQuestions?.[index]?.accordionOpen ?? false,
      }))
    );
    editStepDrawerFormik.validateForm();
    closeModal();
  }
  async function handleSubmit(e) {
    e.preventDefault();
    formik.setTouched(setAllFieldsTouched(formik.values));
    const errors = await formik.validateForm();
    const errorPaths = getFieldPaths(errors);

    if (errorPaths.length > 0) {
      scrollToFirstError(errorPaths);
    } else {
      formik.handleSubmit();
    }
  }
  function getFieldPaths(obj, prefix = "") {
    let paths = [];
    for (const key in obj) {
      const value = obj[key];
      const path = prefix
        ? Array.isArray(obj)
          ? `${prefix}[${key}]`
          : `${prefix}.${key}`
        : key;
      if (value && typeof value === "object") {
        paths = paths.concat(getFieldPaths(value, path));
      } else {
        paths.push(path);
      }
    }

    return paths;
  }
  function scrollToFirstError(errorKeys) {
    for (const key of errorKeys) {
      const ref = formikErrorRefs.current[key];
      if (ref) {
        const match = key.match(/^formQuestions\[(\d+)\]/);
        const formQuestionsIndex = match ? parseInt(match[1], 10) : null;

        if (formQuestionsIndex !== null) {
          formik.setValues((prevState) => {
            return {
              ...prevState,
              formQuestions: prevState.formQuestions.map(
                (formQuestion, questionIndex) => {
                  if (questionIndex === formQuestionsIndex) {
                    return {
                      ...formQuestion,
                      accordionOpen: true,
                    };
                  }
                  return formQuestion;
                }
              ),
            };
          });
        }
        // ✅ Scroll the field into view
        ref.scrollIntoView({ behavior: "auto", block: "center" });
        break;
      }
    }
  }
  function checkUnsavedChanges() {
    if (
      JSON.stringify(formik.values) !== JSON.stringify(selectedEditQuestions)
    ) {
      closeModal();
      // modalUnsavedChanges.onOpen();
    } else {
      closeModal();
    }
  }

  function closeModal() {
    modalUnsavedChanges.onClose();
    feedbackDisclosure.onClose();
    formik.resetForm();
    editStepQuestionsDisclosure.onClose();
    // if (modalBodyRef.current) {
    //   modalBodyRef.current.scrollTop = 0;
    // }
  }

  useEffect(() => {
    formik.validateForm();
    formik.setValues({ formQuestions: selectedEditQuestions });
  }, [selectedEditQuestions]);
  return (
    <>
      <Modal
        isOpen={editStepQuestionsDisclosure.isOpen}
        onClose={checkUnsavedChanges}
        isCentered
        closeOnOverlayClick={false}
      >
        <ModalOverlay />
        <ModalContent
          ref={modalBodyRef}
          bg={"white"}
          maxW="60%"
          maxH={"90vh"}
          overflow={"auto"}
        >
          <ModalHeader
            py={"5px"}
            px={"16px"}
            display={"flex"}
            flexDir={"column"}
          >
            <Flex color={"crimson"}>Edit Form Questions</Flex>
            <Flex
              textAlign={"center"}
              fontSize={"14px"}
              color={"#848484"}
              justifyContent={"space-between"}
            >
              <Flex>Check the components you want to add</Flex>
            </Flex>
          </ModalHeader>
          <ModalCloseButton color={"black"} />
          <Divider m={0} />

          <ModalBody>
            <Flex flexDir={"column"} gap={"10px"}>
              <Flex gap={"15px"} flexDir={"column"}>
                <Flex flexDir={"column"} gap={"20px"}>
                  <Flex flexDir={"column"} gap={"10px"}>
                    <Flex flexDir={"column"}>
                      <Flex fontSize={"14px"} color={"#848484"}>
                        Questions can be dragged and dropped to adjust their
                        order.
                      </Flex>
                      {formik.touched.formQuestionsSize &&
                        formik.errors.formQuestionsSize && (
                          <Flex
                            ref={(el) =>
                              (formikErrorRefs.current[`formQuestionsSize`] =
                                el)
                            }
                            color="crimson"
                            fontSize="14px"
                            gap="5px"
                            alignItems="center"
                          >
                            <FaTriangleExclamation />
                            <Flex>{formik.errors.formQuestionsSize}</Flex>
                          </Flex>
                        )}
                    </Flex>
                    <Flex
                      pb={"10px"}
                      fontSize={"14px"}
                      flexDir={"column"}
                      w={"100%"}
                    >
                      <Flex
                        bg={
                          formik.touched.formQuestionsSize &&
                          formik.errors.formQuestionsSize
                            ? "#fde2e2"
                            : "#F8F9FA"
                        }
                        w={"100%"}
                        color={
                          formik.touched.formQuestionsSize &&
                          formik.errors.formQuestionsSize
                            ? "#dc143c"
                            : "#848484"
                        }
                        fontSize={"14px"}
                        shadow={
                          formik.touched.formQuestionsSize &&
                          formik.errors.formQuestionsSize
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
                      <DragDropContext
                        onDragEnd={(result) => onDragEnd(result)}
                      >
                        <Droppable
                          droppableId={"editQuestion"}
                          key={"editQuestion"}
                        >
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
                                {!formik.values?.formQuestions?.length ? (
                                  <Flex
                                    justifyContent={"center"}
                                    flexDir={"column"}
                                    p={"20px"}
                                    bg={"#f8f9fa"}
                                    border={
                                      formik.touched.formQuestionsSize &&
                                      formik.errors.formQuestionsSize
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
                                        Create questions to gather the
                                        information needed for this step.
                                      </Flex>
                                    </Flex>
                                  </Flex>
                                ) : (
                                  formik.values?.formQuestions?.map(
                                    (val2, index) => {
                                      return (
                                        <StepModalFormDraggable
                                          formikErrorRefs={formikErrorRefs}
                                          id={val2.id}
                                          title={val2.title}
                                          required={val2.required}
                                          accordionOpen={val2?.accordionOpen}
                                          type={val2.type}
                                          index={index}
                                          formik={formik}
                                        />
                                      );
                                    }
                                  )
                                )}
                                {provided.placeholder}
                              </Flex>
                            );
                          }}
                        </Droppable>
                      </DragDropContext>
                    </Flex>
                    <Flex justify={"space-between"}>
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
              </Flex>
            </Flex>
          </ModalBody>
          <Divider m={0} />
          <ModalFooter w={"100%"} justifyContent={"center"}>
            <Flex w={"100%"} alignItems={"center"} justifyContent={"end"}>
              <Flex>
                <Button
                  _hover={{ background: "#b80d2f", color: "white" }}
                  width={"95px"}
                  color={"#dc143c"}
                  background={"transparent"}
                  border={"1px solid #dc143c"}
                  mr={3}
                  onClick={checkUnsavedChanges}
                >
                  Cancel
                </Button>
                <Button
                  _hover={{ background: "#b80d2f" }}
                  width={"95px"}
                  border={"1px solid #dc143c"}
                  color={"white"}
                  bgColor={"#dc143c"}
                  onClick={handleSubmit}
                >
                  Save
                </Button>
              </Flex>
            </Flex>
          </ModalFooter>
        </ModalContent>
      </Modal>
      <UnsavedChangesModal
        modalUnsavedChanges={modalUnsavedChanges}
        closeModal={closeModal}
      />
    </>
  );
}
