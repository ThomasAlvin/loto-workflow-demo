import {
  Accordion,
  AccordionButton,
  AccordionItem,
  Button,
  Checkbox,
  Flex,
  InputGroup,
  InputRightElement,
  Textarea,
  Tooltip,
} from "@chakra-ui/react";
import { v4 as uuid } from "uuid";
import { memo, useCallback, useEffect, useRef } from "react";
import { FaTriangleExclamation } from "react-icons/fa6";
import { FaRegTrashAlt } from "react-icons/fa";
import { RxDragHandleDots2 } from "react-icons/rx";
import StepFormQuestionInputTypeMenu from "./StepFormQuestionInputTypeMenu";
import { LuCopyPlus } from "react-icons/lu";
import FormQuestionAccordionPanel from "../FormQuestionAccordionPanel";

function StepModalFormQuestionMemo({
  formikErrorRefs,
  title,
  required,
  accordionOpen,
  type,
  index,
  formik,
}) {
  const textareaRef = useRef(null);

  function handleInput(e) {
    const updatedQuestion = e.target.value;

    formik.setValues((prevState) => {
      return {
        ...prevState,
        formQuestions: prevState.formQuestions.map((item, mapIndex) => {
          if (mapIndex === index) {
            return {
              ...item,
              title: updatedQuestion,
            };
          }
          return item;
        }),
      };
    });
    textareaRef.current.style.height = "36px";
    textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
  }

  const selectTypeHandler = useCallback((event, newType, index) => {
    event.preventDefault();
    formik.setValues((prevState) => {
      return {
        ...prevState,
        formQuestions: prevState.formQuestions.map((item, mapIndex) => {
          if (mapIndex === index) {
            return {
              ...item,
              type: newType,
              accordionOpen: true,
            };
          }
          return item;
        }),
      };
    });
  }, []);

  function selectFormatHandler(format, event) {
    const { value } = event.target;

    formik.setValues((prevState) => {
      return {
        ...prevState,
        formQuestions: prevState.formQuestions.map((item, mapIndex) => {
          if (mapIndex === index) {
            return {
              ...item,
              type: { ...item.type, [format]: value },
            };
          }
          return item;
        }),
      };
    });
  }

  function requiredCheckBoxHandler(event) {
    const { checked } = event.target;
    formik.setValues((prevState) => {
      return {
        ...prevState,
        formQuestions: prevState.formQuestions.map((item, mapIndex) => {
          if (mapIndex === index) {
            return {
              ...item,
              required: checked,
            };
          }
          return item;
        }),
      };
    });
  }

  function dateTimeCheckBoxHandler(dateOrTime) {
    formik.setValues((prevState) => {
      return {
        ...prevState,
        formQuestions: prevState.formQuestions.map((item, mapIndex) => {
          if (mapIndex === index) {
            return {
              ...item,
              type: { ...item.type, [dateOrTime]: !item.type[dateOrTime] },
            };
          }
          return item;
        }),
      };
    });
  }

  function addOption() {
    formik.setValues((prevState) => {
      return {
        ...prevState,
        formQuestions: prevState.formQuestions.map((item, mapIndex) => {
          if (mapIndex === index) {
            const updatedOptions = [...item.type.options, ""];
            return {
              ...item,
              type: {
                ...item.type,
                options: updatedOptions,
              },
            };
          }
          return item;
        }),
      };
    });
  }

  function optionInputHandler(event, optionIndex) {
    const { value } = event.target;
    formik.setValues((prevState) => {
      return {
        ...prevState,
        formQuestions: prevState.formQuestions.map((item, mapIndex) => {
          if (mapIndex === index) {
            return {
              ...item,
              type: {
                ...item.type,
                options: item.type.options.map((option, optionMapIndex) => {
                  if (optionMapIndex === optionIndex) {
                    return value;
                  }
                  return option;
                }),
              },
            };
          }
          return item;
        }),
      };
    });
  }
  function deleteOption(optionIndex) {
    formik.setValues((prevState) => {
      return {
        ...prevState,
        formQuestions: prevState.formQuestions.map((item, mapIndex) => {
          if (mapIndex === index) {
            const updatedOptions = [...item.type.options];
            updatedOptions.splice(optionIndex, 1);
            return {
              ...item,
              type: {
                ...item.type,
                options: updatedOptions,
              },
            };
          }
          return item;
        }),
      };
    });
  }

  function duplicateStep() {
    const newQuestion = {
      id: uuid(),
      title: title,
      required: required,
      type: type,
    };
    formik.setValues((prevState) => {
      const updatedItems = [...prevState.formQuestions];
      updatedItems.splice(index + 1, 0, newQuestion);
      return { ...prevState, formQuestions: updatedItems };
    });
  }

  async function deleteStep() {
    formik.setValues((prevState) => {
      const updatedItems = [...prevState.formQuestions];
      updatedItems.splice(index, 1);
      return { ...prevState, formQuestions: updatedItems };
    });
    await formik.setTouched({
      ...formik.touched,
      formQuestions:
        formik.touched?.formQuestions?.filter((_, idx) => idx !== index) || [],
    });
    await formik.setErrors({
      ...formik.errors,
      formQuestions:
        formik.errors?.formQuestions?.filter((_, idx) => idx !== index) || [],
    });
  }

  useEffect(() => {
    textareaRef.current.style.height = "36px";
    textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    setTimeout(() => {
      textareaRef.current.style.height = "36px";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }, 100);
  }, [title]);

  return (
    <Flex
      bg={"white"}
      w={"100%"}
      color={"#848484"}
      shadow={
        formik.errors.formQuestions?.[index] &&
        formik.touched.formQuestions?.[index]
          ? ""
          : "0px 0px 3px rgba(50, 50, 93, 0.5)"
      }
      border={
        formik.errors.formQuestions?.[index] &&
        formik.touched.formQuestions?.[index]
          ? "1px solid crimson"
          : ""
      }
    >
      <Accordion index={[accordionOpen ? 0 : -1]} w={"100%"} allowToggle>
        <AccordionItem border={0}>
          <AccordionButton
            p={0}
            _expanded={{ boxShadow: "0px 1px 0px rgba(0, 0, 0, 0.2)" }}
          >
            <Flex
              w={"100%"}
              alignItems={"stretch"}
              // alignItems={"center"}
              justifyContent={"space-between"}
            >
              <Flex
                onClick={() => {
                  formik.setValues((prevState) => {
                    return {
                      ...prevState,
                      formQuestions: prevState.formQuestions.map(
                        (item, mapIndex) => {
                          if (mapIndex === index) {
                            return {
                              ...item,
                              accordionOpen: !item?.accordionOpen,
                            };
                          }
                          return item;
                        }
                      ),
                    };
                  });
                }}
                w={"50%"}
                alignItems={"center"}
              >
                <Flex fontSize={"24px"} px={"5px"}>
                  <RxDragHandleDots2 />
                </Flex>

                <InputGroup>
                  <Textarea
                    ref={textareaRef}
                    value={title}
                    onChange={handleInput}
                    id={`formQuestions[${index}].title`}
                    onBlur={formik.handleBlur}
                    borderRadius={"0px"}
                    fontSize={"14px"}
                    placeholder="What time did you arrive work today?"
                    px={"10px"}
                    py={"5px"}
                    resize={"none"}
                    minH={"36px"}
                    h={"36px"}
                    borderColor={
                      formik.errors.formQuestions?.[index]?.title &&
                      formik.touched.formQuestions?.[index]?.title
                        ? "crimson"
                        : "inherit"
                    }
                    borderTop={"none"}
                    borderBottom={
                      formik.errors.formQuestions?.[index]?.title &&
                      formik.touched.formQuestions?.[index]?.title
                        ? "1px solid crimson"
                        : "none"
                    }
                    color={"black"}
                    overflow={"hidden"}
                  ></Textarea>
                  {formik.errors.formQuestions?.[index]?.title &&
                  formik.touched.formQuestions?.[index]?.title ? (
                    <InputRightElement
                      ref={(el) =>
                        (formikErrorRefs.current[
                          `formQuestions[${index}].title`
                        ] = el)
                      }
                      h={"100%"}
                    >
                      <Tooltip
                        bg={"#dc143c"}
                        color={"white"}
                        placement="top"
                        label={formik.errors.formQuestions[index]?.title}
                        aria-label="A tooltip"
                      >
                        <Flex color={"#dc143c"}>
                          <FaTriangleExclamation />
                        </Flex>
                      </Tooltip>
                    </InputRightElement>
                  ) : (
                    ""
                  )}
                </InputGroup>
              </Flex>
              <Flex w={"25%"}>
                <StepFormQuestionInputTypeMenu
                  type={type}
                  selectTypeHandler={selectTypeHandler}
                  index={index}
                />
              </Flex>

              <Flex w={"25%"}>
                <Flex
                  w={"100%"}
                  justify={"space-between"}
                  px={"10px"}
                  gap={"10px"}
                  alignItems={"center"}
                >
                  <Flex gap={"10px"} alignItems={"center"}>
                    <Checkbox
                      onChange={requiredCheckBoxHandler}
                      defaultChecked={required}
                    />
                    <Flex>Required</Flex>
                  </Flex>
                  <Flex w={"1px"} h={"100%"} bg={"#E2E8F0"}></Flex>
                  <Flex fontSize={"20px"} gap={"5px"}>
                    <Tooltip label="Duplicate" fontSize="md">
                      <Button
                        fontSize={"inherit"}
                        borderRadius={"0px"}
                        py={"4px"}
                        px={"4px"}
                        minW={"auto"}
                        h={"auto"}
                        bg={"inherit"}
                        color={"#007bff"}
                        alignItems={"center"}
                        gap={"5px"}
                        onClick={duplicateStep}
                      >
                        <Flex>
                          <LuCopyPlus pointerEvents={"none"} />
                        </Flex>
                      </Button>
                    </Tooltip>
                    <Tooltip label="Delete" fontSize="md">
                      <Button
                        fontSize={"inherit"}
                        borderRadius={"0px"}
                        py={"4px"}
                        px={"4px"}
                        minW={"auto"}
                        h={"auto"}
                        bg={"inherit"}
                        color={"crimson"}
                        alignItems={"center"}
                        gap={"5px"}
                        onClick={() => {
                          deleteStep();
                        }}
                      >
                        <Flex>
                          <FaRegTrashAlt pointerEvents={"none"} />
                        </Flex>
                      </Button>
                    </Tooltip>
                  </Flex>
                </Flex>
              </Flex>
            </Flex>
          </AccordionButton>
          <FormQuestionAccordionPanel
            type={type}
            selectFormatFn={selectFormatHandler}
            dateTimeCheckboxFn={dateTimeCheckBoxHandler}
            optionInputFn={optionInputHandler}
            addOptionFn={addOption}
            deleteOptionFn={deleteOption}
            formikFormQuestionError={formik.errors.formQuestions}
            formikFormQuestionTouched={formik.touched.formQuestions}
            optionId={`formQuestions[${index}].type.options`}
            formikErrorRefs={formikErrorRefs}
            onBlur={formik.handleBlur}
            index={index}
          />
        </AccordionItem>
      </Accordion>
    </Flex>
  );
}

const StepModalFormQuestion = memo(
  StepModalFormQuestionMemo,
  (prevProps, nextProps) => {
    return (
      prevProps.formikErrorRefs === nextProps.formikErrorRefs &&
      prevProps.title === nextProps.title &&
      prevProps.accordionOpen === nextProps.accordionOpen &&
      prevProps.required === nextProps.required &&
      prevProps.type === nextProps.type &&
      prevProps.formik.setValues === nextProps.formik.setValues &&
      prevProps.index === nextProps.index &&
      JSON.stringify(
        prevProps.formik.errors.formQuestions?.[prevProps.index]
      ) ===
        JSON.stringify(
          nextProps.formik.errors.formQuestions?.[prevProps.index]
        ) &&
      JSON.stringify(
        prevProps.formik.touched.formQuestions?.[prevProps.index]
      ) ===
        JSON.stringify(
          nextProps.formik.touched.formQuestions?.[prevProps.index]
        )
    );
  }
);

// Export the memoized component
export default StepModalFormQuestion;
