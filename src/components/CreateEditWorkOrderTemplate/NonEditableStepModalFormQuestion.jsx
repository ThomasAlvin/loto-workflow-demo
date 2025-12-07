import {
  Accordion,
  AccordionButton,
  AccordionItem,
  Checkbox,
  Flex,
} from "@chakra-ui/react";
import { v4 as uuid } from "uuid";
import { memo } from "react";
import StepFormQuestionInputTypeMenu from "./StepFormQuestionInputTypeMenu";
import FormQuestionAccordionPanel from "../FormQuestionAccordionPanel";

function NonEditableStepModalFormQuestionMemo({
  formikErrorRefs,
  title,
  required,
  type,
  setStepDetails,
  index,
  formik,
}) {
  function selectFormatHandler(format, event) {
    const { value } = event.target;

    setStepDetails((prevState) => {
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

  function dateTimeCheckBoxHandler(dateOrTime) {
    setStepDetails((prevState) => {
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
    setStepDetails((prevState) => {
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
    setStepDetails((prevState) => {
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
    setStepDetails((prevState) => {
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
    setStepDetails((prevState) => {
      const updatedItems = [...prevState.formQuestions];
      updatedItems.splice(index + 1, 0, newQuestion);
      return { ...prevState, formQuestions: updatedItems };
    });
    formik.setValues((prevState) => {
      const updatedItems = [...prevState.formQuestions];
      updatedItems.splice(index + 1, 0, newQuestion);
      return { ...prevState, formQuestions: updatedItems };
    });
  }

  async function deleteStep() {
    setStepDetails((prevState) => {
      const updatedItems = [...prevState.formQuestions];
      updatedItems.splice(index, 1);
      return { ...prevState, formQuestions: updatedItems };
    });

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

  // useEffect(() => {
  //   textareaRef.current.style.height = "36px";
  //   textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
  //   setTimeout(() => {
  //     textareaRef.current.style.height = "36px";
  //     textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
  //   }, 100);
  // }, [title]);

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
      <Accordion w={"100%"} allowToggle>
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
                flex={1}
                borderRight={"1px solid #ededed"}
                onClick={() => {
                  // setStepDetails((prevState) => {
                  //   return {
                  //     ...prevState,
                  //     formQuestions: prevState.formQuestions.map(
                  //       (item, mapIndex) => {
                  //         if (mapIndex === index) {
                  //           return {
                  //             ...item,
                  //             accordionOpen: !item?.accordionOpen,
                  //           };
                  //         }
                  //         return item;
                  //       }
                  //     ),
                  //   };
                  // });
                }}
                alignItems={"center"}
              >
                <Flex
                  borderRadius={"0px"}
                  fontSize={"12px"}
                  px={"10px"}
                  py={"5px"}
                  color={"black"}
                  overflow={"hidden"}
                  textAlign={"start"}
                >
                  {title}
                </Flex>
              </Flex>
              <Flex w={"120px"}>
                <StepFormQuestionInputTypeMenu
                  type={type}
                  editable={false}
                  // selectTypeHandler={selectTypeHandler}
                  index={index}
                />
              </Flex>
              <Flex w={"60px"} justify={"center"} fontSize={"12px"}>
                <Flex py={"5px"} alignItems={"center"}>
                  <Checkbox
                    size={"sm"}
                    isDisabled={true}
                    // onChange={requiredCheckBoxHandler}
                    isChecked={required}
                  />
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
            editable={false}
          />
        </AccordionItem>
      </Accordion>
    </Flex>
  );
}

const NonEditableStepModalFormQuestion = memo(
  NonEditableStepModalFormQuestionMemo,
  (prevProps, nextProps) => {
    return (
      prevProps.formikErrorRefs === nextProps.formikErrorRefs &&
      prevProps.title === nextProps.title &&
      prevProps.accordionOpen === nextProps.accordionOpen &&
      prevProps.required === nextProps.required &&
      prevProps.type === nextProps.type &&
      prevProps.setStepDetails === nextProps.setStepDetails &&
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
export default NonEditableStepModalFormQuestion;
