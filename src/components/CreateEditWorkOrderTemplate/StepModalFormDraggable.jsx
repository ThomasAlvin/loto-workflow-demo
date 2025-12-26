import { Flex } from "@chakra-ui/react";
import { Draggable } from "react-beautiful-dnd";
import StepModalFormQuestion from "./StepModalFormQuestion";
import { memo } from "react";

function StepModalFormDraggableMemo({
  formikErrorRefs,
  id,
  title,
  required,
  accordionOpen,
  type,
  index,
  formik,
}) {
  // -X Future, add semua formik functions yang kepakai and pisahin semua formik errors into props for maximum performanceX-
  return (
    <>
      <Draggable key={id} draggableId={id} index={index}>
        {(provided, snapshot) => {
          return (
            <Flex
              w={"100%"}
              ref={provided.innerRef}
              {...provided.dragHandleProps}
              {...provided.draggableProps}
              style={{
                userSelect: "none",
                ...provided.draggableProps.style,
              }}
            >
              <StepModalFormQuestion
                formikErrorRefs={formikErrorRefs}
                title={title}
                required={required}
                accordionOpen={accordionOpen}
                type={type}
                index={index}
                formik={formik}
              />
            </Flex>
          );
        }}
      </Draggable>
    </>
  );
}

const StepModalFormDraggable = memo(
  StepModalFormDraggableMemo,
  (prevProps, nextProps) => {
    return (
      prevProps.formikErrorRefs === nextProps.formikErrorRefs &&
      prevProps.id === nextProps.id &&
      prevProps.title === nextProps.title &&
      prevProps.accordionOpen === nextProps.accordionOpen &&
      prevProps.required === nextProps.required &&
      prevProps.type === nextProps.type &&
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

export default StepModalFormDraggable;
