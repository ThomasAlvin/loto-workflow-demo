import {
  Accordion,
  AccordionButton,
  AccordionItem,
  AccordionPanel,
  Button,
  Checkbox,
  Flex,
  Input,
  InputGroup,
  InputRightElement,
  Menu,
  MenuButton,
  MenuGroup,
  MenuItem,
  MenuList,
  Select,
  Table,
  Tbody,
  Td,
  Textarea,
  Th,
  Thead,
  Tooltip,
  Tr,
} from "@chakra-ui/react";
import { v4 as uuid } from "uuid";
import { memo, useState } from "react";
import { FaChevronRight, FaPlus, FaTriangleExclamation } from "react-icons/fa6";
import { FaRegTrashAlt } from "react-icons/fa";
import { RxDragHandleDots2 } from "react-icons/rx";
import { IoClose } from "react-icons/io5";
import { LuCopyPlus } from "react-icons/lu";
import { inputOptions, unitOptions } from "../../utils/optionsUtils";
import questionTypeIconMapper from "../../utils/questionTypeIconMapper";

function CreateInspectionFormModalFormQuestionMemo({
  id,
  provided,
  watch,
  register,
  title,
  insert,
  remove,
  required,
  type,
  setValue,
  getValues,
  index,
  fieldErrors,
  titleErrors,
  optionErrors,
  trigger,
}) {
  const [accordionOpen, setAccordionOpen] = useState(true);

  function selectTypeHandler(event, newType, index) {
    event.preventDefault();
    setAccordionOpen(true);

    const prevValue = getValues("formQuestions"); // Get the current value
    setValue(
      "formQuestions",
      prevValue.map((item, mapIndex) => {
        if (mapIndex === index) {
          return {
            ...item,
            type: newType,
          };
        }
        return item;
      })
    );
  }

  function selectFormatHandler(format, event) {
    const { value } = event.target;

    setValue(`formQuestions[${index}].type.${format}`, value);
  }

  function requiredCheckBoxHandler(event) {
    const { checked } = event.target;
    const prevValue = getValues("formQuestions"); // Get the current value
    setValue(
      "formQuestions",
      prevValue.map((item, mapIndex) => {
        if (mapIndex === index) {
          return {
            ...item,
            required: checked,
          };
        }
        return item;
      })
    );
  }

  function dateTimeCheckBoxHandler(dateOrTime) {
    const prevValue = getValues("formQuestions"); // Get the current value
    setValue(
      "formQuestions",
      prevValue.map((item, mapIndex) => {
        if (mapIndex === index) {
          return {
            ...item,
            type: { ...item.type, [dateOrTime]: !item.type[dateOrTime] },
          };
        }
        return item;
      })
    );
  }

  function addOption() {
    const prevValue = getValues("formQuestions"); // Get the current value
    setValue(
      "formQuestions",
      prevValue.map((item, mapIndex) => {
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
      })
      // { shouldValidate: true }
    );
  }

  async function deleteOption(optionIndex) {
    const prevValue = getValues("formQuestions");
    setValue(
      "formQuestions",
      prevValue.map((item, mapIndex) => {
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
      })
    );
    await trigger("formQuestions");
  }

  function duplicateStep() {
    const newQuestion = {
      id: uuid(),
      title: title,
      required: required,
      type: type,
    };

    insert(index + 1, newQuestion);
  }

  function deleteStep() {
    remove(index);
  }
  return (
    <Flex
      key={id}
      bg={"white"}
      w={"100%"}
      color={"#848484"}
      ref={provided.innerRef}
      {...provided.dragHandleProps}
      {...provided.draggableProps}
      style={{
        userSelect: "none",
        ...provided.draggableProps.style,
      }}
      shadow={fieldErrors ? "" : "0px 0px 3px rgba(50, 50, 93, 0.5)"}
      border={fieldErrors ? "1px solid crimson" : ""}
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
              justifyContent={"space-between"}
            >
              <Flex
                onClick={() => {
                  setAccordionOpen((prevState) => !prevState);
                }}
                w={"50%"}
                alignItems={"center"}
              >
                <Flex fontSize={"24px"} px={"5px"}>
                  <RxDragHandleDots2 />
                </Flex>
                <InputGroup>
                  <Textarea
                    {...register(`formQuestions[${index}].title`, {
                      onChange: (e) => {
                        const textarea = e.target; // Use the event target (textarea itself)
                        textarea.style.height = "36px"; // Reset to initial height
                        textarea.style.height = `${textarea.scrollHeight}px`;
                      },
                    })}
                    borderRadius={"0px"}
                    fontSize={"14px"}
                    placeholder="What time did you arrive work today?"
                    px={"10px"}
                    py={"5px"}
                    resize={"none"}
                    minH={"36px"}
                    color={"black"}
                    borderColor={titleErrors ? "crimson" : "inherit"}
                    borderBottom={titleErrors ? "1px solid crimson" : "none"}
                    borderTop={"none"}
                    height={"36px"}
                    overflow={"hidden"}
                  ></Textarea>
                  {titleErrors ? (
                    <InputRightElement h={"100%"}>
                      <Tooltip
                        bg={"#dc143c"}
                        color={"white"}
                        placement="top"
                        label={titleErrors.message}
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
              <Menu placement="right">
                <MenuButton
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                  borderRight={"#E2E8F0 1px solid"}
                  textAlign={"start"}
                  px={"10px"}
                  py={"5px"}
                  w={"25%"}
                >
                  <Flex alignItems={"center"} gap={"10px"}>
                    <Flex
                      bg={"#FFF3E5"}
                      color={"#FE8500"}
                      borderRadius={"20px"}
                      p={"5px"}
                    >
                      {questionTypeIconMapper(type.title)}
                    </Flex>
                    <Flex>{type.title}</Flex>
                  </Flex>
                </MenuButton>
                <MenuList>
                  {inputOptions.map((val) => {
                    return (
                      <MenuGroup
                        textAlign={"left"}
                        fontWeight={400}
                        title={val.title}
                      >
                        {val.options.map((val2) => {
                          return (
                            <MenuItem
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
                                  {questionTypeIconMapper(val2.title)}
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
              </Menu>
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
                  <Flex w={"1px"} h={"100%"} bg={"#bababa"}></Flex>
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
          <AccordionPanel py={"0px"}>
            <Flex flexDir={"column"} gap={"10px"}>
              <Flex gap={"20px"}>
                {(() => {
                  switch (type.title) {
                    case "Text":
                      return (
                        <Flex py={"10px"} alignItems={"center"} gap={"10px"}>
                          <Flex>Format :</Flex>
                          <Flex>
                            <Select
                              onChange={(event) => {
                                selectFormatHandler("format", event);
                              }}
                              defaultValue={type.format}
                              h={"26px"}
                              fontSize={"14px"}
                            >
                              <option value={"Short Answer"}>
                                Short Answer
                              </option>
                              <option value={"Paragraph"}>Paragraph</option>
                            </Select>
                          </Flex>
                        </Flex>
                      );
                    case "Date & Time":
                      return (
                        <Flex py={"10px"} gap={"20px"}>
                          <Flex alignItems={"center"} gap={"10px"}>
                            <Flex gap={"10px"} alignItems={"center"}>
                              <Checkbox
                                onChange={() => {
                                  dateTimeCheckBoxHandler("date");
                                }}
                                isChecked={type.date}
                                isDisabled={type.time ? false : true}
                              />
                              <Flex>Date</Flex>
                            </Flex>
                          </Flex>
                          <Flex alignItems={"center"} gap={"10px"}>
                            <Flex gap={"10px"} alignItems={"center"}>
                              <Checkbox
                                onChange={() => {
                                  dateTimeCheckBoxHandler("time");
                                }}
                                isChecked={type.time}
                                isDisabled={type.date ? false : true}
                              />
                              <Flex>Time</Flex>
                            </Flex>
                          </Flex>
                        </Flex>
                      );
                    case "Number":
                      return (
                        <Flex py={"10px"} gap={"20px"}>
                          <Flex alignItems={"center"} gap={"10px"}>
                            <Flex>Format :</Flex>
                            <Flex>
                              <Select
                                onChange={(event) => {
                                  selectFormatHandler("format", event);
                                }}
                                defaultValue={type.format}
                                h={"26px"}
                                fontSize={"14px"}
                              >
                                <option>Number</option>
                                <option>Decimal</option>
                              </Select>
                            </Flex>
                          </Flex>
                          <Flex alignItems={"center"} gap={"10px"}>
                            <Flex>Unit :</Flex>
                            <Menu placement="right">
                              <MenuButton h={"auto"} textAlign={"start"}>
                                <Flex
                                  px={"10px"}
                                  py={"4px"}
                                  borderRadius={"5px"}
                                  border={"1px solid #E2E8F0"}
                                  // shadow={"0px 0px 3px rgba(50,50,93,0.5)"}
                                  alignItems={"center"}
                                  gap={"10px"}
                                >
                                  <Flex>
                                    {watch(`formQuestions[${index}].type.unit`)}
                                  </Flex>
                                  <Flex fontSize={"12px"}>
                                    <FaChevronRight />
                                  </Flex>
                                </Flex>
                              </MenuButton>
                              <MenuList maxH={"300px"} overflow={"auto"}>
                                {unitOptions.map((val) => {
                                  return (
                                    <MenuGroup
                                      fontWeight={400}
                                      title={val.title}
                                    >
                                      {val.options.map((val2) => {
                                        return (
                                          <MenuItem
                                            onClick={() => {
                                              selectFormatHandler("unit", {
                                                target: { value: val2.title },
                                              });
                                            }}
                                          >
                                            <Flex
                                              w={"100%"}
                                              alignItems={"center"}
                                              gap={"10px"}
                                              justifyContent={"space-between"}
                                            >
                                              <Flex color={"black"}>
                                                {val2.title}
                                              </Flex>
                                              <Flex>
                                                {val2.shortTitle === "m3"
                                                  ? "m"
                                                  : val2.shortTitle}
                                                {val2.shortTitle === "m3" ? (
                                                  <sup
                                                    style={{
                                                      marginTop: "10px",
                                                    }}
                                                  >
                                                    3
                                                  </sup>
                                                ) : (
                                                  ""
                                                )}
                                              </Flex>
                                            </Flex>
                                          </MenuItem>
                                        );
                                      })}
                                    </MenuGroup>
                                  );
                                })}
                              </MenuList>
                            </Menu>
                          </Flex>
                        </Flex>
                      );
                    case "Multiple Choice":
                      return (
                        <Flex
                          py={"10px"}
                          flexDir={"column"}
                          w={"100%"}
                          gap={"10px"}
                        >
                          {optionErrors ? (
                            <Flex
                              py={"4px"}
                              px={"8px"}
                              bg={"#FDE2E2"}
                              alignItems={"center"}
                              gap={"5px"}
                              color={"#dc143c"}
                            >
                              <Flex>
                                <FaTriangleExclamation />
                              </Flex>
                              <Flex>
                                {Array.isArray(optionErrors)
                                  ? // Use find to get the first truthy value
                                    optionErrors.find((val) => val?.message)
                                      .message || ""
                                  : optionErrors.message}
                              </Flex>
                            </Flex>
                          ) : (
                            ""
                          )}
                          {type.options.map((val, optionIndex) => {
                            return (
                              <Flex alignItems={"center"} gap={"10px"}>
                                <Flex
                                  border={"2px solid #848484"}
                                  borderRadius={"100%"}
                                  h={"20px"}
                                  w={"20px"}
                                ></Flex>

                                <Input
                                  {...register(
                                    `formQuestions[${index}].type.options[${optionIndex}]`
                                  )}
                                  placeholder={"Option " + (optionIndex + 1)}
                                  color={"black"}
                                  onBlur={() => {
                                    trigger(
                                      `formQuestions[${index}].type.options`
                                    );
                                  }}
                                  variant={"flushed"}
                                ></Input>
                                <Flex>
                                  <Button
                                    p={0}
                                    w={"auto"}
                                    minW={"auto"}
                                    height={"auto"}
                                    color={"inherit"}
                                    bg={"inherit"}
                                    fontSize={"28px"}
                                    onClick={() => {
                                      deleteOption(optionIndex);
                                    }}
                                  >
                                    <Flex>
                                      <IoClose pointerEvents={"none"} />
                                    </Flex>
                                  </Button>
                                </Flex>
                              </Flex>
                            );
                          })}
                          <Flex>
                            <Button
                              fontSize={"14px"}
                              borderRadius={"0px"}
                              py={"4px"}
                              px={"8px"}
                              h={"auto"}
                              bg={"white"}
                              color={"#dc143c"}
                              alignItems={"center"}
                              gap={"5px"}
                              onClick={() => {
                                addOption();
                              }}
                            >
                              <Flex>Add Option</Flex>
                              <Flex pointerEvents={"none"}>
                                <FaPlus />
                              </Flex>
                            </Button>
                          </Flex>
                        </Flex>
                      );
                    case "Checkbox":
                      return (
                        <Flex
                          py={"10px"}
                          flexDir={"column"}
                          w={"100%"}
                          gap={"10px"}
                        >
                          {optionErrors ? (
                            <Flex
                              py={"4px"}
                              px={"8px"}
                              bg={"#FDE2E2"}
                              alignItems={"center"}
                              gap={"5px"}
                              color={"#dc143c"}
                            >
                              <Flex>
                                <FaTriangleExclamation />
                              </Flex>
                              <Flex>
                                {Array.isArray(optionErrors)
                                  ? // Use find to get the first truthy value
                                    optionErrors.find((val) => val?.message)
                                      .message || ""
                                  : optionErrors.message}
                              </Flex>
                            </Flex>
                          ) : (
                            ""
                          )}

                          {type?.options?.map((val, optionIndex) => {
                            const field = register(
                              `formQuestions[${index}].type.options[${optionIndex}]`
                            );
                            return (
                              <Flex alignItems={"center"} gap={"10px"}>
                                <Flex
                                  border={"2px solid #848484"}
                                  borderRadius={"3px"}
                                  h={"20px"}
                                  w={"20px"}
                                />
                                <Input
                                  {...field}
                                  placeholder={"Option " + (optionIndex + 1)}
                                  color={"black"}
                                  variant={"flushed"}
                                  onBlur={(e) => {
                                    // field.onBlur(e);
                                    trigger(
                                      `formQuestions[${index}].type.options`
                                    );
                                  }}
                                ></Input>
                                <Flex>
                                  <Button
                                    p={0}
                                    w={"auto"}
                                    minW={"auto"}
                                    height={"auto"}
                                    color={"inherit"}
                                    bg={"inherit"}
                                    fontSize={"28px"}
                                    onClick={() => {
                                      deleteOption(optionIndex);
                                    }}
                                  >
                                    <Flex>
                                      <IoClose pointerEvents={"none"} />
                                    </Flex>
                                  </Button>
                                </Flex>
                              </Flex>
                            );
                          })}
                          <Flex>
                            <Button
                              fontSize={"14px"}
                              borderRadius={"0px"}
                              py={"4px"}
                              px={"8px"}
                              h={"auto"}
                              bg={"white"}
                              color={"#dc143c"}
                              alignItems={"center"}
                              gap={"5px"}
                              onClick={() => {
                                addOption();
                              }}
                            >
                              <Flex>Add Option</Flex>
                              <Flex pointerEvents={"none"}>
                                <FaPlus />
                              </Flex>
                            </Button>
                          </Flex>
                        </Flex>
                      );
                    case "Checklist":
                      return (
                        <Flex
                          py={"10px"}
                          flexDir={"column"}
                          w={"100%"}
                          gap={"10px"}
                        >
                          {optionErrors ? (
                            <Flex
                              py={"4px"}
                              px={"8px"}
                              bg={"#FDE2E2"}
                              alignItems={"center"}
                              gap={"5px"}
                              color={"#dc143c"}
                            >
                              <Flex>
                                <FaTriangleExclamation />
                              </Flex>
                              <Flex>
                                {Array.isArray(optionErrors)
                                  ? optionErrors.find((val) => val?.message)
                                      .message || ""
                                  : optionErrors.message}
                              </Flex>
                            </Flex>
                          ) : (
                            ""
                          )}

                          <Flex
                            w={"100%"}
                            flexDir={"column"}
                            borderX={"1px solid #dc143c"}
                            borderBottom={"1px solid #dc143c"}
                          >
                            <Table variant="simple">
                              <Thead bg={"#dc143c"}>
                                <Tr>
                                  <Th
                                    w={"5%"}
                                    color={"white"}
                                    px={"10px"}
                                    py={"5px"}
                                    borderBottomColor={"#bababa"}
                                    fontWeight={700}
                                    fontSize={"13px"}
                                    textAlign={"center"}
                                  >
                                    No
                                  </Th>
                                  <Th
                                    w={"45%"}
                                    color={"white"}
                                    px={"10px"}
                                    py={"5px"}
                                    borderBottomColor={"#bababa"}
                                    fontWeight={700}
                                    fontSize={"13px"}
                                    borderX={"1px solid white"}
                                  >
                                    Checklist
                                  </Th>
                                  <Th
                                    w={"15%"}
                                    color={"white"}
                                    px={"10px"}
                                    py={"5px"}
                                    borderBottomColor={"#bababa"}
                                    fontWeight={700}
                                    fontSize={"13px"}
                                    textAlign={"center"}
                                  >
                                    Yes
                                  </Th>
                                  <Th
                                    w={"15%"}
                                    color={"white"}
                                    px={"10px"}
                                    py={"5px"}
                                    borderBottomColor={"#bababa"}
                                    fontWeight={700}
                                    fontSize={"13px"}
                                    borderX={"1px solid white"}
                                    textAlign={"center"}
                                  >
                                    No
                                  </Th>
                                  <Th
                                    w={"15%"}
                                    color={"white"}
                                    px={"10px"}
                                    py={"5px"}
                                    borderBottomColor={"#bababa"}
                                    fontWeight={700}
                                    fontSize={"13px"}
                                    borderRight={"1px solid white"}
                                    textAlign={"center"}
                                  >
                                    N/A
                                  </Th>

                                  <Th
                                    w={"5%"}
                                    px={"10px"}
                                    py={"5px"}
                                    textAlign={"center"}
                                    borderBottomColor={"#bababa"}
                                    fontWeight={700}
                                    fontSize={"13px"}
                                  ></Th>
                                </Tr>
                              </Thead>
                              <Tbody color={"black"}>
                                {type?.options?.map((val, optionIndex) => {
                                  return (
                                    <Tr>
                                      <Td
                                        p={0}
                                        borderBottomColor={"#bababa"}
                                        fontWeight={700}
                                      >
                                        <Flex
                                          color={"#dc143c"}
                                          justify={"center"}
                                        >
                                          {optionIndex + 1}.
                                        </Flex>
                                      </Td>
                                      <Td
                                        borderX={"1px solid #bababa"}
                                        p={0}
                                        borderBottomColor={"#bababa"}
                                      >
                                        <Flex flexDir={"column"}>
                                          <Input
                                            {...register(
                                              `formQuestions[${index}].type.options[${optionIndex}]`
                                            )}
                                            px={"10px"}
                                            placeholder={
                                              "Option " + (optionIndex + 1)
                                            }
                                            onBlur={() => {
                                              trigger(
                                                `formQuestions[${index}].type.options`
                                              );
                                            }}
                                            color={"black"}
                                            variant={"flushed"}
                                          ></Input>
                                        </Flex>
                                      </Td>
                                      <Td
                                        p={0}
                                        borderBottomColor={"#bababa"}
                                        color={"#292D3F"}
                                        fontWeight={700}
                                      >
                                        <Flex justify={"center"}>
                                          <Checkbox isDisabled />
                                        </Flex>
                                      </Td>
                                      <Td
                                        p={0}
                                        borderBottomColor={"#bababa"}
                                        borderX={"1px solid #bababa"}
                                        color={"#292D3F"}
                                        fontWeight={700}
                                      >
                                        <Flex justify={"center"}>
                                          <Checkbox isDisabled />
                                        </Flex>
                                      </Td>
                                      <Td
                                        p={0}
                                        borderBottomColor={"#bababa"}
                                        color={"#292D3F"}
                                        borderRight={"1px solid #bababa"}
                                        fontWeight={700}
                                      >
                                        <Flex justify={"center"}>
                                          <Checkbox isDisabled />
                                        </Flex>
                                      </Td>
                                      <Td
                                        p={0}
                                        borderBottomColor={"#bababa"}
                                        color={"#292D3F"}
                                        fontWeight={700}
                                        textAlign={"center"}
                                      >
                                        <Button
                                          justifyContent={"center"}
                                          p={0}
                                          w={"auto"}
                                          minW={"auto"}
                                          height={"auto"}
                                          color={"#848484"}
                                          bg={"inherit"}
                                          fontSize={"28px"}
                                          onClick={() => {
                                            deleteOption(optionIndex);
                                          }}
                                        >
                                          <Flex>
                                            <IoClose pointerEvents={"none"} />
                                          </Flex>
                                        </Button>
                                      </Td>
                                    </Tr>
                                  );
                                })}
                              </Tbody>
                            </Table>
                          </Flex>
                          <Flex>
                            <Button
                              fontSize={"14px"}
                              borderRadius={"0px"}
                              py={"4px"}
                              px={"8px"}
                              h={"auto"}
                              bg={"white"}
                              color={"#dc143c"}
                              alignItems={"center"}
                              gap={"5px"}
                              onClick={() => {
                                addOption();
                              }}
                            >
                              <Flex>Add Option</Flex>
                              <Flex pointerEvents={"none"}>
                                <FaPlus />
                              </Flex>
                            </Button>
                          </Flex>
                        </Flex>
                      );
                    default:
                      return "";
                  }
                })()}
              </Flex>
            </Flex>
          </AccordionPanel>
        </AccordionItem>
      </Accordion>
    </Flex>
  );
}
// Export the memoized component
const CreateInspectionFormModalFormQuestion = memo(
  CreateInspectionFormModalFormQuestionMemo
);
export default CreateInspectionFormModalFormQuestion;
