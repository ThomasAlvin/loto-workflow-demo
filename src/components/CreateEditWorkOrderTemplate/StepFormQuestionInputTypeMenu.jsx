import {
  Flex,
  Menu,
  MenuButton,
  MenuGroup,
  MenuItem,
  MenuList,
  Portal,
} from "@chakra-ui/react";
import QuestionTypeIconMapper from "../../utils/QuestionTypeIconMapper";
import { memo } from "react";
import { InputOptions } from "../../utils/OptionsUtils";

function StepFormQuestionInputTypeMenu({
  type,
  selectTypeHandler,
  index,
  editable = true,
}) {
  return (
    <Menu placement="right">
      <MenuButton
        onClick={(e) => {
          e.stopPropagation();
        }}
        cursor={editable ? "cursor" : "default !important"}
        borderRight={"#E2E8F0 1px solid"}
        textAlign={"start"}
        px={"5px"}
        py={"5px"}
        w={"100%"}
      >
        <Flex
          alignItems={"center"}
          gap={editable ? "10px" : "5px"}
          fontSize={editable ? "16px" : "12px"}
        >
          <Flex
            bg={"#FFF3E5"}
            color={"#FE8500"}
            borderRadius={"20px"}
            p={"3px"}
          >
            {QuestionTypeIconMapper(type.title)}
          </Flex>
          <Flex>{type.title}</Flex>
        </Flex>
      </MenuButton>
      {editable ? (
        <Portal>
          <MenuList zIndex={2000}>
            {InputOptions.map((val) => {
              return (
                <MenuGroup
                  color={"#848484"}
                  textAlign={"left"}
                  fontWeight={400}
                  title={val.title}
                >
                  {val.options.map((val2) => {
                    return (
                      <MenuItem
                        color={"#848484"}
                        onClick={(event) =>
                          selectTypeHandler(event, val2, index)
                        }
                      >
                        <Flex alignItems={"center"} gap={"10px"}>
                          <Flex
                            bg={"#FFF3E5"}
                            color={"#FE8500"}
                            borderRadius={"20px"}
                            p={"5px"}
                          >
                            {QuestionTypeIconMapper(val2.title)}
                          </Flex>
                          <Flex>{val2.title}</Flex>
                        </Flex>
                      </MenuItem>
                    );
                  })}
                </MenuGroup>
              );
            })}
          </MenuList>
        </Portal>
      ) : (
        ""
      )}
    </Menu>
  );
}
export default memo(StepFormQuestionInputTypeMenu);
