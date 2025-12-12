import {
  Checkbox,
  Flex,
  Image,
  Input,
  Radio,
  RadioGroup,
  Table,
  Tbody,
  Td,
  Textarea,
  Th,
  Thead,
  Tr,
} from "@chakra-ui/react";
import { DatePicker } from "antd";
import { useRef, useState } from "react";
import { BiImageAdd } from "react-icons/bi";
import { FaFilePdf, FaFileWord } from "react-icons/fa";
import { FaTriangleExclamation } from "react-icons/fa6";
import getDateTimeType from "../utils/getDateTimeType";
import { get } from "lodash";

export default function SubmitQuestionTypeMapper({
  type,
  options,
  register,
  registerId,
  errors,
  getValues,
  setValue,
  format,
  trigger,
  unit,
  include_date,
  include_time,
  handleImageFocus,
  isPDF,
}) {
  const fileInputRef = useRef(); // Create an array of refs
  const [fileDisplay, setFileDisplay] = useState("");
  const IMGURL = import.meta.env.VITE_API_IMAGE_URL;
  const triggerFileInput = () => {
    fileInputRef.current.click();
  };
  const handleCheckboxChange = (option) => {
    const current = getValues(registerId) || [];
    if (current.includes(option)) {
      setValue(
        registerId,
        current.filter((item) => item !== option).length === 0
          ? ""
          : current.filter((item) => item !== option),
        { shouldValidate: true }
      );
    } else {
      setValue(registerId, [...current, option], { shouldValidate: true });
    }
  };
  const handleFileChange = (event) => {
    const selectedFile = event.target?.files[0];
    if (selectedFile) {
      setValue(registerId, selectedFile, { shouldValidate: true });
      const previewUrl = URL.createObjectURL(selectedFile);
      setFileDisplay(previewUrl);
      trigger(registerId);
    }
  };
  function getDateTimePickerFormat() {
    let type = getDateTimeType(include_date, include_time);

    if (type === "date") {
      return {
        picker: "date",
        format: "YYYY-MM-DD",
        showTime: false,
        type,
      };
    } else if (type === "time") {
      return {
        picker: "time",
        showTime: false,
        format: "hh:mm A",
        type,
      };
    } else if (type === "dateTime") {
      return {
        picker: "date",
        showTime: { format: "HH A" },
        format: "YYYY-MM-DD hh:mm A",
        type,
      };
    }
  }
  function handleChecklistChange(optionIndex, choiceNumber) {
    const current = getValues(registerId) || [];
    const updated = [...current];
    if (current[optionIndex] === choiceNumber) {
      updated[optionIndex] = null;
    } else {
      updated[optionIndex] = choiceNumber;
    }

    setValue(registerId, updated, { shouldValidate: true });
  }

  switch (type) {
    case "Multiple Choice":
      return (
        <Flex flexDir={"column"} w={"100%"}>
          <Flex color={"black"}>
            <RadioGroup
              onChange={(option) => {
                setValue(registerId, option, { shouldValidate: true });
              }}
            >
              <Flex flexDirection="column" gap={"10px"}>
                {options.map((option) => (
                  <Flex alignItems={"center"} gap={"10px"}>
                    <Radio isFocusable={false} value={option} size={"lg"}>
                      <Flex fontSize={"16px"}>{option}</Flex>
                    </Radio>
                  </Flex>
                ))}
              </Flex>
            </RadioGroup>
          </Flex>
          <Input
            {...register(registerId)}
            tabIndex={-1}
            aria-hidden="true"
            style={{
              position: "absolute",
              opacity: 0,
              pointerEvents: "none",
              height: 0,
              width: 0,
            }}
          ></Input>
          {get(errors, registerId) ? (
            <>
              <Flex
                color="crimson"
                fontSize="14px"
                gap="5px"
                alignItems="center"
              >
                <FaTriangleExclamation />
                <Flex>{get(errors, registerId).message}</Flex>
              </Flex>
            </>
          ) : (
            ""
          )}
        </Flex>
      );
    case "Checkbox":
      return (
        <Flex flexDir={"column"} w={"100%"}>
          <Flex flexDir={"column"} gap={"10px"} color={"black"}>
            {options?.map((option, index) => (
              <Checkbox onChange={() => handleCheckboxChange(option)}>
                {option}
              </Checkbox>
            ))}
          </Flex>
          <Input
            {...register(registerId)}
            tabIndex={-1}
            aria-hidden="true"
            style={{
              position: "absolute",
              opacity: 0,
              pointerEvents: "none",
              height: 0,
              width: 0,
            }}
          ></Input>
          {get(errors, registerId) ? (
            <Flex color="crimson" fontSize="14px" gap="5px" alignItems="center">
              <FaTriangleExclamation />
              <Flex>{get(errors, registerId).message}</Flex>
            </Flex>
          ) : (
            ""
          )}
        </Flex>
      );
    case "Text":
      return (
        <Flex flexDir={"column"} w={"100%"}>
          <Flex>
            {format === "Short Answer" ? (
              <Input
                w={"50%"}
                variant={"flushed"}
                placeholder="Type your answer here"
                {...register(registerId)}
                borderColor={get(errors, registerId) ? "crimson" : "#bababa"}
              ></Input>
            ) : (
              <Textarea
                resize={"none"}
                w={"100%"}
                variant={"flushed"}
                placeholder="Type your answer here"
                {...register(registerId)}
                borderColor={get(errors, registerId) ? "crimson" : "#bababa"}
              />
            )}
          </Flex>
          {get(errors, registerId) ? (
            <Flex color="crimson" fontSize="14px" gap="5px" alignItems="center">
              <FaTriangleExclamation />
              <Flex>{get(errors, registerId).message}</Flex>
            </Flex>
          ) : (
            ""
          )}
        </Flex>
      );
    case "Date & Time":
      const datePickerFormat = getDateTimePickerFormat();
      return (
        <Flex w={"100%"} flexDir={"column"}>
          <DatePicker
            onChange={(date) => {
              const timestamp = date ? date.valueOf() : null;
              setValue(registerId, timestamp, { shouldValidate: true });
            }}
            style={{
              padding: "0px",
              boxShadow: "none",
              width: "200px",
              border: "none",
              borderRadius: "0px",
              borderBottom: "1px solid #bababa",
              borderColor: get(errors, registerId) ? "#dc143c" : "#bababa",
            }}
            className="custom-datepicker"
            showTime={datePickerFormat?.showTime}
            picker={datePickerFormat?.picker}
            format={datePickerFormat?.format} // ✅ Only date
          />
          <Input
            {...register(registerId)}
            tabIndex={-1}
            aria-hidden="true"
            style={{
              position: "absolute",
              opacity: 0,
              pointerEvents: "none",
              height: 0,
              width: 0,
            }}
          ></Input>
          {get(errors, registerId) ? (
            <Flex color="crimson" fontSize="14px" gap="5px" alignItems="center">
              <FaTriangleExclamation />
              <Flex>{get(errors, registerId).message}</Flex>
            </Flex>
          ) : (
            ""
          )}
        </Flex>
      );
    case "Number":
      return (
        <Flex w={"100%"} flexDir={"column"}>
          <Flex fontSize={"14px"} color={"#848484"}>
            {format === "Number"
              ? "Round numbers only"
              : format === "Decimal"
              ? "Decimal is allowed"
              : ""}
          </Flex>
          <Flex alignItems={"center"}>
            <Input
              w={"50%"}
              variant={"flushed"}
              placeholder="Enter a number"
              {...register(registerId, {
                onChange: (e) => {
                  let v = e.target.value;
                  if (format === "Decimal") {
                    v = v.replace(/[^0-9.,]/g, "");
                  } else if (format === "Number") {
                    v = v.replace(/[^0-9]/g, "");
                  }
                  e.target.value = v;
                  setValue(registerId, e.target.value);
                },
              })}
              borderColor={get(errors, registerId) ? "crimson" : "#bababa"}
            ></Input>
            <Flex>{unit === "None" ? "" : unit}</Flex>
          </Flex>{" "}
          {get(errors, registerId) ? (
            <Flex color="crimson" fontSize="14px" gap="5px" alignItems="center">
              <FaTriangleExclamation />
              <Flex>{get(errors, registerId).message}</Flex>
            </Flex>
          ) : (
            ""
          )}
        </Flex>
      );
    case "Image":
      return (
        <Flex w={"100%"} flexDir={"column"}>
          <Flex flexWrap={"wrap"}>
            {fileDisplay ? (
              <Flex
                bg={"#f8f9fa"}
                boxShadow="0px 0px 2px rgba(50,50,93,0.5)"
                justifyContent={"center"}
                w={"120px"}
                alignItems={"center"}
                aspectRatio={1}
                cursor={"pointer"}
                onClick={() => triggerFileInput()}

                // onClick={() => triggerFileInput(index + 1)}
              >
                <Image w={"100%"} h={"100%"} src={fileDisplay}></Image>
              </Flex>
            ) : (
              <Flex
                onClick={() => triggerFileInput()}
                cursor={"pointer"}
                transition="box-shadow 0.2s ease-in-out"
                //   onClick={() => triggerFileInput(index + 1)}
                w="120px"
                aspectRatio={1}
                bg={"#f8f9fa"}
                justify={"center"}
                _hover={{ boxShadow: "0px 0px 5px rgba(50,50,93,0.5)" }}
                boxShadow="0px 0px 2px rgba(50,50,93,0.5)"
              >
                <Flex
                  flexDir={"column"}
                  gap={"5px"}
                  alignItems={"center"}
                  justify={"center"}
                  h={"100%"}
                  textAlign={"center"}
                >
                  <Flex fontSize={"36px"}>
                    <BiImageAdd />
                  </Flex>
                  <Flex
                    alignItems={"center"}
                    flexDir={"column"}
                    fontSize={"12px"}
                    fontWeight={700}
                  >
                    <Flex color={"#255787"}>Upload image</Flex>
                  </Flex>
                </Flex>
              </Flex>
            )}
          </Flex>
          <Input
            {...register(registerId)}
            tabIndex={-1}
            aria-hidden="true"
            style={{
              position: "absolute",
              opacity: 0,
              pointerEvents: "none",
              height: 0,
              width: 0,
            }}
          ></Input>
          {get(errors, registerId) ? (
            <Flex color="crimson" fontSize="14px" gap="5px" alignItems="center">
              <FaTriangleExclamation />
              <Flex>{get(errors, registerId).message}</Flex>
            </Flex>
          ) : (
            ""
          )}
          <input
            type="file"
            {...register(registerId)}
            ref={(el) => (fileInputRef.current = el)}
            accept="image/*"
            style={{ display: "none" }}
            onChange={handleFileChange}
          />
        </Flex>
      );
    case "Checklist":
      return (
        <Flex w={"100%"} flexDir={"column"}>
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
                    color={"white"}
                    px={"12px"}
                    py={"5px"}
                    border={"none"}
                    fontWeight={700}
                    fontSize={"13px"}
                    textAlign={"center"}
                  >
                    No
                  </Th>
                  <Th
                    w={"45%"}
                    color={"white"}
                    px={"12px"}
                    py={"5px"}
                    border={"none"}
                    fontWeight={700}
                    fontSize={"13px"}
                    borderX={"1px solid white"}
                  >
                    Checklist
                  </Th>
                  <Th
                    w={"15%"}
                    color={"white"}
                    px={"12px"}
                    py={"5px"}
                    border={"none"}
                    fontWeight={700}
                    fontSize={"13px"}
                    textAlign={"center"}
                  >
                    Yes
                  </Th>
                  <Th
                    w={"15%"}
                    color={"white"}
                    px={"12px"}
                    py={"5px"}
                    border={"none"}
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
                    px={"12px"}
                    py={"5px"}
                    border={"none"}
                    fontWeight={700}
                    fontSize={"13px"}
                    textAlign={"center"}
                  >
                    N/A
                  </Th>
                </Tr>
              </Thead>
              <Tbody color={"black"}>
                {options.map((option, optionIndex) => (
                  <Tr>
                    <Td
                      borderRight={"1px solid #dc143c"}
                      borderColor={"#dc143c"}
                      fontWeight={700}
                      px={"12px"}
                    >
                      <Flex color={"#dc143c"} justify={"center"}>
                        {optionIndex + 1}.
                      </Flex>
                    </Td>
                    <Td
                      px={"12px"}
                      borderColor={"#dc143c"}
                      borderRight={"1px solid #dc143c"}
                    >
                      {option}
                    </Td>

                    <Td
                      px={"12px"}
                      borderRight={"1px solid #dc143c"}
                      borderColor={"#dc143c"}
                    >
                      <Flex justify={"center"}>
                        <Checkbox
                          isChecked={getValues(registerId)?.[optionIndex] === 0}
                          onChange={() => handleChecklistChange(optionIndex, 0)}
                        />
                      </Flex>
                    </Td>
                    <Td
                      px={"12px"}
                      borderRight={"1px solid #dc143c"}
                      borderColor={"#dc143c"}
                    >
                      <Flex justify={"center"}>
                        <Checkbox
                          isChecked={getValues(registerId)?.[optionIndex] === 1}
                          onChange={() => handleChecklistChange(optionIndex, 1)}
                        />
                      </Flex>
                    </Td>
                    <Td px={"12px"} borderColor={"#dc143c"}>
                      <Flex justify={"center"}>
                        <Checkbox
                          isChecked={getValues(registerId)?.[optionIndex] === 2}
                          onChange={() => handleChecklistChange(optionIndex, 2)}
                        />
                      </Flex>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </Flex>
          <Input
            {...register(registerId)}
            tabIndex={-1}
            aria-hidden="true"
            style={{
              position: "absolute",
              opacity: 0,
              pointerEvents: "none",
              height: 0,
              width: 0,
            }}
          ></Input>
          {get(errors, registerId) ? (
            <Flex color="crimson" fontSize="14px" gap="5px" alignItems="center">
              <FaTriangleExclamation />
              <Flex>{get(errors, registerId).message}</Flex>
            </Flex>
          ) : (
            ""
          )}
        </Flex>
      );
    case "PDF":
      return (
        <Flex
          cursor={"pointer"}
          role="group"
          alignItems={"center"}
          gap={"10px"}
          p={"10px"}
        >
          <Flex fontSize={"36px"} color={"#dc143c"}>
            <FaFilePdf />
          </Flex>
          <Flex flexDir={"column"}>
            <Flex _groupHover={{ color: "#dc143c", textDecor: "underline" }}>
              dik
            </Flex>
            <Flex color={"#848484"} fontSize={"14px"}>
              Size: 1.40 kb
            </Flex>
          </Flex>
        </Flex>
      );
    case "Word":
      return (
        <Flex
          role="group"
          cursor={"pointer"}
          alignItems={"center"}
          gap={"10px"}
          p={"10px"}
        >
          <Flex fontSize={"36px"} color={"#1857B8"}>
            <FaFileWord />
          </Flex>
          <Flex flexDir={"column"}>
            <Flex _groupHover={{ color: "#1857b8", textDecor: "underline" }}>
              lolod
            </Flex>
            <Flex color={"#848484"} fontSize={"14px"}>
              Size: 1.40 kb
            </Flex>
          </Flex>
        </Flex>
      );
    case "Equipment/Machine":
      return (
        <Flex gap={"10px"} py={"10px"} flexDir={"column"}>
          <Flex fontWeight={700}>Selected Machine</Flex>
          <Flex gap={"10px"} alignItems={"center"}>
            <Flex
              p={"5px"}
              boxShadow={"0px 0px 3px rgba(50,50,93,0.5)"}
              justify={"center"}
              alignItems={"center"}
              w={"100px"}
              h={"100px"}
            ></Flex>
            <Flex
              flexDir={"column"}
              justify={"space-between"}
              h={"100%"}
              gap={"10px"}
            >
              sda
            </Flex>
          </Flex>
        </Flex>
      );
    case "Member":
      return (
        <Flex gap={"10px"} py={"10px"} flexDir={"column"}>
          <Flex fontWeight={700}>Selected Member</Flex>
          <Flex
            bg={"#f8f9fa"}
            p={"10px"}
            boxShadow={"0px 0px 3px rgba(50,50,93,0.5)"}
            alignItems={"center"}
            gap={"10px"}
          >
            caz{" "}
          </Flex>
        </Flex>
      );
    case "Lock":
      return (
        <Flex gap={"10px"} py={"10px"} flexDir={"column"}>
          <Flex fontWeight={700}>Selected Lock</Flex>
          <Flex gap={"10px"} alignItems={"center"}>
            <Flex
              p={"5px"}
              boxShadow={"0px 0px 3px rgba(50,50,93,0.5)"}
              justify={"center"}
              alignItems={"center"}
              w={"100px"}
              h={"100px"}
            >
              <Image w={"100%"} h={"100%"}></Image>
            </Flex>
            dscas
          </Flex>
        </Flex>
      );

    default:
      return <Flex></Flex>;
  }
}
