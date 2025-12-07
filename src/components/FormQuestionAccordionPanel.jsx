import {
  AccordionPanel,
  Button,
  Checkbox,
  Flex,
  Input,
  Menu,
  MenuButton,
  MenuGroup,
  MenuItem,
  MenuList,
  Select,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tooltip,
  Tr,
} from "@chakra-ui/react";
import { FaChevronRight, FaPlus } from "react-icons/fa";
import { FaTriangleExclamation } from "react-icons/fa6";
import { IoClose } from "react-icons/io5";
import { UnitOptions } from "../utils/OptionsUtils";

export default function FormQuestionAccordionPanel({
  type,
  selectFormatFn,
  dateTimeCheckboxFn,
  optionInputFn,
  addOptionFn,
  deleteOptionFn,
  formikFormQuestionError,
  formikFormQuestionTouched,
  formikErrorRefs,
  optionId,
  onBlur,
  index,
  editable = true,
}) {
  return (
    <AccordionPanel py={"0px"}>
      <Flex>
        {(() => {
          switch (type.title) {
            case "Text":
              return (
                <Flex
                  py={editable ? "10px" : "8px"}
                  alignItems={"center"}
                  gap={"10px"}
                >
                  <Flex fontSize={editable ? "14px" : "12px"}>Format :</Flex>
                  <Flex>
                    {editable ? (
                      <Select
                        opacity={"1 !important"}
                        onChange={(event) => {
                          selectFormatFn("format", event);
                        }}
                        defaultValue={type.format}
                        h={"26px"}
                        fontSize={"14px"}
                      >
                        <option value={"Short Answer"}>Short Answer</option>
                        <option value={"Paragraph"}>Paragraph</option>
                      </Select>
                    ) : (
                      <Flex
                        h={"22px"}
                        bg={"white"}
                        px={"8px"}
                        borderRadius={"5px"}
                        border={"1px solid #bababa"}
                        color={"#848484"}
                        fontWeight={400}
                        fontSize={"12px"}
                      >
                        {type.format}
                      </Flex>
                    )}
                  </Flex>
                </Flex>
              );
            case "Date & Time":
              return (
                <Flex
                  py={"10px"}
                  gap={editable ? "20px" : "10px"}
                  fontSize={editable ? "14px" : "12px"}
                >
                  <Tooltip
                    hasArrow
                    placement="top"
                    label={
                      type.time ? "" : "Requires at least date or time enabled"
                    }
                  >
                    <Flex alignItems={"center"} gap={"10px"}>
                      <Flex
                        gap={editable ? "10px" : "5px"}
                        alignItems={"center"}
                      >
                        <Checkbox
                          size={editable ? "md" : "sm"}
                          onChange={() => {
                            dateTimeCheckboxFn("date");
                          }}
                          isChecked={type.date}
                          isDisabled={type.time ? false : true}
                        />
                        <Flex>Date</Flex>
                      </Flex>
                    </Flex>
                  </Tooltip>
                  <Tooltip
                    hasArrow
                    placement="top"
                    label={
                      type.date
                        ? ""
                        : "Requires at least date or time to be enabled"
                    }
                  >
                    <Flex gap={editable ? "10px" : "5px"} alignItems={"center"}>
                      <Checkbox
                        size={editable ? "md" : "sm"}
                        onChange={() => {
                          dateTimeCheckboxFn("time");
                        }}
                        isChecked={type.time}
                        isDisabled={type.date ? false : true}
                      />
                      <Flex>Time</Flex>
                    </Flex>
                  </Tooltip>
                </Flex>
              );
            case "Number":
              return editable ? (
                <Flex py={"10px"} gap={"20px"}>
                  <Flex alignItems={"center"} gap={"10px"}>
                    <Flex>Format :</Flex>
                    <Flex>
                      <Select
                        onChange={(event) => {
                          selectFormatFn("format", event);
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
                          <Flex>{type.unit}</Flex>
                          <Flex fontSize={"12px"}>
                            <FaChevronRight />
                          </Flex>
                        </Flex>
                      </MenuButton>
                      <MenuList maxH={"300px"} overflow={"auto"}>
                        {UnitOptions.map((val) => {
                          return (
                            <MenuGroup fontWeight={400} title={val.title}>
                              {val.options.map((val2) => {
                                return (
                                  <MenuItem
                                    onClick={() => {
                                      selectFormatFn("unit", {
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
                                      <Flex color={"black"}>{val2.title}</Flex>
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
              ) : (
                <Flex py={"8px"} fontSize={"12px"} gap={"20px"}>
                  <Flex alignItems={"center"} gap={"10px"}>
                    <Flex>Format :</Flex>
                    <Flex
                      h={"22px"}
                      bg={"white"}
                      px={"8px"}
                      borderRadius={"5px"}
                      border={"1px solid #bababa"}
                      color={"#848484"}
                      fontWeight={400}
                      fontSize={"12px"}
                    >
                      {type.format}
                    </Flex>
                  </Flex>
                  <Flex alignItems={"center"} gap={"10px"}>
                    <Flex>Unit :</Flex>
                    <Flex
                      h={"22px"}
                      bg={"white"}
                      px={"8px"}
                      borderRadius={"5px"}
                      border={"1px solid #bababa"}
                      color={"#848484"}
                      fontWeight={400}
                      fontSize={"12px"}
                    >
                      {type.unit}
                    </Flex>
                  </Flex>
                </Flex>
              );
            case "Multiple Choice":
              return editable ? (
                <Flex py={"10px"} flexDir={"column"} w={"100%"} gap={"10px"}>
                  {formikFormQuestionError?.[index]?.type?.options &&
                  formikFormQuestionTouched?.[index] ? (
                    <Flex
                      ref={
                        formikErrorRefs
                          ? (el) => (formikErrorRefs.current[optionId] = el)
                          : ""
                      }
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
                        {Array.isArray(
                          formikFormQuestionError[index]?.type?.options,
                        )
                          ? // Use find to get the first truthy value
                            formikFormQuestionError[index]?.type.options.find(
                              (val) => val,
                            ) || ""
                          : formikFormQuestionError[index]?.type?.options}
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
                          ref={
                            formikErrorRefs
                              ? (el) =>
                                  (formikErrorRefs.current[
                                    `${optionId}[${optionIndex}]`
                                  ] = el)
                              : ""
                          }
                          onChange={(e) => {
                            optionInputFn(e, optionIndex);
                          }}
                          id={optionId}
                          onBlur={onBlur}
                          placeholder={"Option " + (optionIndex + 1)}
                          color={"black"}
                          variant={"flushed"}
                          value={val}
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
                              deleteOptionFn(optionIndex);
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
                        addOptionFn();
                      }}
                    >
                      <Flex>Add Option</Flex>
                      <Flex pointerEvents={"none"}>
                        <FaPlus />
                      </Flex>
                    </Button>
                  </Flex>
                </Flex>
              ) : (
                <Flex
                  pt={"10px"}
                  pb={"16px"}
                  flexDir={"column"}
                  w={"100%"}
                  gap={"10px"}
                  fontSize={"12px"}
                >
                  {type.options.map((val, optionIndex) => {
                    return (
                      <Flex alignItems={"center"} gap={"10px"}>
                        <Flex
                          border={"2px solid #848484"}
                          borderRadius={"100%"}
                          aspectRatio={1}
                          h={"16px"}
                          w={"16px"}
                        ></Flex>
                        <Flex
                          w={"100%"}
                          py={"4px"}
                          borderBottom={"1px solid #dedede"}
                          color={"black"}
                        >
                          {val}
                        </Flex>
                      </Flex>
                    );
                  })}
                </Flex>
              );
            case "Checkbox":
              return editable ? (
                <Flex py={"10px"} flexDir={"column"} w={"100%"} gap={"10px"}>
                  {formikFormQuestionError?.[index]?.type?.options &&
                  formikFormQuestionTouched?.[index] ? (
                    <Flex
                      ref={
                        formikErrorRefs
                          ? (el) => (formikErrorRefs.current[optionId] = el)
                          : ""
                      }
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
                        {Array.isArray(
                          formikFormQuestionError[index]?.type?.options,
                        )
                          ? // Use find to get the first truthy value
                            formikFormQuestionError[index]?.type.options.find(
                              (val) => val,
                            ) || ""
                          : formikFormQuestionError[index]?.type?.options}
                      </Flex>
                    </Flex>
                  ) : (
                    ""
                  )}
                  {type?.options?.map((val, optionIndex) => {
                    return (
                      <Flex alignItems={"center"} gap={"10px"}>
                        <Flex
                          border={"2px solid #848484"}
                          borderRadius={"3px"}
                          h={"20px"}
                          w={"20px"}
                        />
                        <Input
                          ref={
                            formikErrorRefs
                              ? (el) =>
                                  (formikErrorRefs.current[
                                    `${optionId}[${optionIndex}]`
                                  ] = el)
                              : ""
                          }
                          onChange={(e) => {
                            optionInputFn(e, optionIndex);
                          }}
                          id={optionId}
                          onBlur={onBlur}
                          placeholder={"Option " + (optionIndex + 1)}
                          color={"black"}
                          variant={"flushed"}
                          value={val}
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
                              deleteOptionFn(optionIndex);
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
                        addOptionFn();
                      }}
                    >
                      <Flex>Add Option</Flex>
                      <Flex pointerEvents={"none"}>
                        <FaPlus />
                      </Flex>
                    </Button>
                  </Flex>
                </Flex>
              ) : (
                <Flex
                  pt={"10px"}
                  pb={"16px"}
                  flexDir={"column"}
                  w={"100%"}
                  gap={"10px"}
                  fontSize={"12px"}
                >
                  {type.options.map((val, optionIndex) => {
                    return (
                      <Flex alignItems={"center"} gap={"10px"}>
                        <Flex
                          border={"2px solid #848484"}
                          // borderRadius={"100%"}
                          aspectRatio={1}
                          h={"16px"}
                          w={"16px"}
                        ></Flex>
                        <Flex
                          w={"100%"}
                          py={"4px"}
                          borderBottom={"1px solid #dedede"}
                          color={"black"}
                        >
                          {val}
                        </Flex>
                      </Flex>
                    );
                  })}
                </Flex>
              );
            case "Checklist":
              return editable ? (
                <Flex py={"10px"} flexDir={"column"} w={"100%"} gap={"10px"}>
                  {formikFormQuestionError?.[index]?.type?.options &&
                  formikFormQuestionTouched?.[index] ? (
                    <Flex
                      ref={
                        formikErrorRefs
                          ? (el) => (formikErrorRefs.current[optionId] = el)
                          : ""
                      }
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
                        {Array.isArray(
                          formikFormQuestionError[index]?.type?.options,
                        )
                          ? // Use find to get the first truthy value
                            formikFormQuestionError[index]?.type.options.find(
                              (val) => val,
                            ) || ""
                          : formikFormQuestionError[index]?.type?.options}
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
                                ref={
                                  formikErrorRefs
                                    ? (el) =>
                                        (formikErrorRefs.current[
                                          `${optionId}[${optionIndex}]`
                                        ] = el)
                                    : ""
                                }
                                p={0}
                                borderBottomColor={"#bababa"}
                                fontWeight={700}
                              >
                                <Flex color={"#dc143c"} justify={"center"}>
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
                                    px={"10px"}
                                    onChange={(e) => {
                                      optionInputFn(e, optionIndex);
                                    }}
                                    id={optionId}
                                    onBlur={onBlur}
                                    placeholder={"Option " + (optionIndex + 1)}
                                    color={"black"}
                                    variant={"flushed"}
                                    value={val}
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
                                    deleteOptionFn(optionIndex);
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
                        addOptionFn();
                      }}
                    >
                      <Flex>Add Option</Flex>
                      <Flex pointerEvents={"none"}>
                        <FaPlus />
                      </Flex>
                    </Button>
                  </Flex>
                </Flex>
              ) : (
                <Flex
                  pt={"10px"}
                  pb={"16px"}
                  flexDir={"column"}
                  w={"100%"}
                  gap={"10px"}
                >
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
                            fontSize={"11px"}
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
                            fontSize={"11px"}
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
                            fontSize={"11px"}
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
                            fontSize={"11px"}
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
                            fontSize={"11px"}
                            borderRight={"1px solid white"}
                            textAlign={"center"}
                          >
                            N/A
                          </Th>
                        </Tr>
                      </Thead>
                      <Tbody fontSize={"12px"} color={"black"}>
                        {type?.options?.map((val, optionIndex) => {
                          return (
                            <Tr>
                              <Td
                                ref={
                                  formikErrorRefs
                                    ? (el) =>
                                        (formikErrorRefs.current[
                                          `${optionId}[${optionIndex}]`
                                        ] = el)
                                    : ""
                                }
                                p={0}
                                borderBottomColor={"#bababa"}
                                fontWeight={700}
                              >
                                <Flex color={"#dc143c"} justify={"center"}>
                                  {optionIndex + 1}.
                                </Flex>
                              </Td>
                              <Td
                                borderX={"1px solid #bababa"}
                                p={0}
                                borderBottomColor={"#bababa"}
                              >
                                <Flex flexDir={"column"}>
                                  <Flex
                                    px={"6px"}
                                    w={"100%"}
                                    py={"8px"}
                                    borderBottom={"1px solid #dedede"}
                                    color={"black"}
                                  >
                                    {val}
                                  </Flex>
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
                            </Tr>
                          );
                        })}
                      </Tbody>
                    </Table>
                  </Flex>
                </Flex>
              );
            default:
              return "";
          }
        })()}
      </Flex>
    </AccordionPanel>
  );
}
