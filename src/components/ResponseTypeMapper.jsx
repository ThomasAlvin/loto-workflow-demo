import {
  Avatar,
  Button,
  Checkbox,
  Flex,
  Image,
  Input,
  Radio,
  RadioGroup,
  Stack,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
} from "@chakra-ui/react";
import { AiOutlineWarning } from "react-icons/ai";
import { FaFilePdf, FaFileWord, FaTag, FaUserAlt } from "react-icons/fa";
import { FaRegClock } from "react-icons/fa6";
import { FiCheckCircle, FiZoomIn } from "react-icons/fi";
import { ImCheckmark } from "react-icons/im";
import { IoChatbubbleEllipsesOutline, IoClose } from "react-icons/io5";
import { MdBrokenImage, MdOutlineBrokenImage } from "react-icons/md";
import { RiDraftLine } from "react-icons/ri";
import { TbClockX } from "react-icons/tb";
import labelizeRole from "../utils/labelizeRole";
import moment from "moment";
import getLockImageByModel from "../utils/getLockImageByModel";
import getDateTimeType from "../utils/getDateTimeType";

export default function ResponseTypeMapper({
  type,
  submissions,
  submissionIndex,
  options,
  format,
  unit,
  include_date,
  include_time,
  handleImageFocus,
  isPDF,
}) {
  const IMGURL = import.meta.env.VITE_API_IMAGE_URL;

  switch (type) {
    case "Multiple Choice":
      return (
        <Flex color={"black"} pt={"10px"}>
          <RadioGroup
            value={submissions?.[submissionIndex]?.response?.[0]}
            pointerEvents={"none"}
          >
            <Flex flexDirection="column" gap={"10px"}>
              {options.map((option) => (
                <Flex alignItems={"center"} gap={"10px"}>
                  <Radio isFocusable={false} value={option} size={"lg"}></Radio>
                  <Flex>{option}</Flex>
                </Flex>
              ))}
            </Flex>
          </RadioGroup>
        </Flex>
      );
    case "Checkbox":
      return (
        <Flex flexDir={"column"} gap={"10px"} color={"black"} pt={"10px"}>
          {options?.map((option, index) => (
            <Checkbox
              isChecked={
                submissions?.[submissionIndex]?.response?.some(
                  (num) => num === option
                )
                  ? true
                  : false
              }
              pointerEvents={"none"}
            >
              {option}
            </Checkbox>
          ))}
        </Flex>
      );
    case "Text":
      return (
        <Flex wordBreak={"break-word"}>
          {submissions?.[submissionIndex]?.response?.[0]
            ? submissions?.[submissionIndex]?.response[0]
            : "Not answered"}
        </Flex>
      );

    case "Date & Time":
      let type = getDateTimeType(include_date, include_time);

      return submissions?.[submissionIndex]?.response?.[0] ? (
        <Flex wordBreak={"break-word"} flexDir={"column"}>
          {type === "dateTime" ? (
            <>
              {" "}
              <Flex color={"black"}>
                {moment(submissions?.[submissionIndex]?.response[0]).format(
                  "YYYY-MM-DD"
                )}
              </Flex>
              <Flex color={"#848484"} fontSize={"14px"}>
                {moment(submissions?.[submissionIndex]?.response[0]).format(
                  "hh:mm A"
                )}
              </Flex>
            </>
          ) : type === "date" ? (
            <>
              {" "}
              <Flex color={"black"}>
                {moment(submissions?.[submissionIndex]?.response[0]).format(
                  "YYYY-MM-DD"
                )}
              </Flex>
            </>
          ) : type === "time" ? (
            <>
              {" "}
              <Flex color={"black"}>
                {moment(submissions?.[submissionIndex]?.response[0]).format(
                  "hh:mm A"
                )}
              </Flex>
            </>
          ) : (
            <Flex color={"black"}>
              {moment(submissions?.[submissionIndex]?.response[0]).format(
                "YYYY-MM-DD"
              )}
            </Flex>
          )}
        </Flex>
      ) : (
        "Not answered"
      );
    case "Number":
      return (
        <Flex wordBreak={"break-word"}>
          {submissions?.[submissionIndex]?.response?.[0]
            ? submissions?.[submissionIndex]?.response +
              " " +
              (unit === "None" ? "" : unit)
            : "Not answered"}
        </Flex>
      );
    case "Image":
      return submissions?.[submissionIndex]?.response?.[0] ? (
        <Flex pt={"10px"} flexWrap={"wrap"} gap={"20px"}>
          {submissions?.[submissionIndex]?.response?.map((val) => (
            <Flex
              onClick={
                handleImageFocus
                  ? () => {
                      handleImageFocus(IMGURL + val);
                    }
                  : ""
              }
              cursor={"pointer"}
              position={"relative"}
              role="group"
            >
              {handleImageFocus ? (
                <>
                  <Flex
                    _groupHover={{ display: "block" }}
                    w={"100%"}
                    display={"none"}
                    h={"100%"}
                    bg={"black"}
                    opacity={0.1}
                    position={"absolute"}
                  ></Flex>
                  <Flex
                    p={"3px"}
                    _groupHover={{ display: "block" }}
                    display={"none"}
                    top={0}
                    right={0}
                    position={"absolute"}
                    fontSize={"32px"}
                    color={"#f8f9fa"}
                  >
                    <FiZoomIn />
                  </Flex>
                </>
              ) : (
                ""
              )}

              <Image
                w={"120px"}
                bg={"#f5f5f5"}
                h={"100px"}
                boxShadow={"0px 0px 3px rgba(50,50,93,0.5)"}
                src={val ? (isPDF ? val : IMGURL + val) : ""}
              ></Image>
            </Flex>
          ))}
        </Flex>
      ) : (
        "Not Answered"
      );
    case "Checklist":
      return (
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
                  textAlign={"center"}
                >
                  N/A
                </Th>
              </Tr>
            </Thead>
            <Tbody color={"black"}>
              {options.map((val, optionIndex) => {
                return (
                  <Tr>
                    <Td p={0} borderBottomColor={"#bababa"} fontWeight={700}>
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
                          px={"10px"}
                          py={"4px"}
                          placeholder={"Option " + (optionIndex + 1)}
                          color={"black"}
                          variant={"flushed"}
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
                        <Checkbox
                          pointerEvents={"none"}
                          isChecked={
                            submissions?.[submissionIndex]?.response?.[
                              optionIndex
                            ] == 0
                          }
                        />
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
                        <Checkbox
                          pointerEvents={"none"}
                          isChecked={
                            submissions?.[submissionIndex]?.response?.[
                              optionIndex
                            ] == 1
                          }
                        />
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
                        <Checkbox
                          pointerEvents={"none"}
                          isChecked={
                            submissions?.[submissionIndex]?.response?.[
                              optionIndex
                            ] == 2
                          }
                        />
                      </Flex>
                    </Td>
                  </Tr>
                );
              })}
            </Tbody>
          </Table>
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
              {submissions?.[submissionIndex]?.response
                ? submissions?.[submissionIndex]?.response
                : "Not answered"}
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
              {submissions?.[submissionIndex]?.response
                ? submissions?.[submissionIndex]?.response
                : "Not answered"}
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
            >
              <Image
                w={"100%"}
                h={"100%"}
                src={
                  IMGURL +
                  submissions?.[submissionIndex]?.response[0].main_image_url
                }
              ></Image>
            </Flex>
            <Flex
              flexDir={"column"}
              justify={"space-between"}
              h={"100%"}
              gap={"10px"}
            >
              <Flex fontWeight={700}>
                {submissions?.[submissionIndex]?.response[0].name}
              </Flex>
              <Flex flexDir={"column"} justify={"space-between"}>
                <Flex fontSize={"14px"} color={"#848484"}>
                  <Flex w={"100px"}>Model</Flex>:{" "}
                  {submissions?.[submissionIndex]?.response[0].model}{" "}
                </Flex>
                <Flex fontSize={"14px"} color={"#848484"}>
                  <Flex w={"100px"}>Machine ID</Flex>:{" "}
                  {
                    submissions?.[submissionIndex]?.response[0]
                      .custom_machine_id
                  }{" "}
                </Flex>
                <Flex fontSize={"14px"} color={"#848484"}>
                  <Flex w={"100px"}>Serial Number</Flex>:{" "}
                  {submissions?.[submissionIndex]?.response[0].serial_number}{" "}
                </Flex>
              </Flex>
              {/* <Flex gap={"10px"}>
                <Flex
                  borderRadius={"10px"}
                  fontSize={"14px"}
                  px={"8px"}
                  py={"2px"}
                  color={"#3d9666"}
                  alignItems={"center"}
                  gap={"5px"}
                  bg={"#DBF6CB"}
                >
                  <Flex>
                    <FaTag />
                  </Flex>
                  <Flex>Machine ID: Machine-001</Flex>
                </Flex>
                <Flex
                  borderRadius={"10px"}
                  fontSize={"14px"}
                  px={"8px"}
                  py={"2px"}
                  color={"#3d9666"}
                  alignItems={"center"}
                  gap={"5px"}
                  bg={"#DBF6CB"}
                >
                  <Flex>
                    <FaTag />
                  </Flex>
                  <Flex>Machine ID: Machine-001</Flex>
                </Flex>
              </Flex> */}
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
            {submissions?.[submissionIndex]?.response[0]?.user?.first_name ? (
              <Avatar
                outline={"1px solid #dc143c"}
                border={"2px solid white"}
                name={
                  submissions?.[submissionIndex]?.response[0]?.user
                    ?.first_name +
                  " " +
                  submissions?.[submissionIndex]?.response[0]?.user.last_name
                }
                src={
                  IMGURL +
                  submissions?.[submissionIndex]?.response[0]?.user
                    ?.profile_image_url
                }
              ></Avatar>
            ) : (
              <Flex
                outline={"1px solid #dc143c"}
                bg={"#bababa"}
                borderRadius={"100%"}
                justifyContent={"center"}
                alignItems={"center"}
                h={"48px"}
                w={"48px"}
                border={"2px solid white"}
              >
                <Flex color={"white"} fontSize={"24px"}>
                  <FaUserAlt />
                </Flex>
              </Flex>
            )}

            <Flex flexDir={"column"}>
              <Flex alignItems={"center"} fontWeight={700}>
                <Flex>
                  {submissions?.[submissionIndex]?.response[0].user
                    ?.first_name +
                    " " +
                    submissions?.[submissionIndex]?.response[0].user?.last_name}
                </Flex>
              </Flex>
              <Flex
                color={"#848484"}
                fontWeight={400}
                fontSize={"14px"}
                alignItems={"center"}
              >
                {labelizeRole(
                  submissions?.[submissionIndex]?.response[0]?.role
                ) +
                  " - " +
                  submissions?.[submissionIndex]?.response[0]?.employee_id}
              </Flex>
            </Flex>
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
              <Image
                w={"100%"}
                h={"100%"}
                src={getLockImageByModel(
                  submissions?.[submissionIndex]?.response[0].model
                )}
              ></Image>
            </Flex>
            <Flex flexDir={"column"} justify={"space-between"} h={"100%"}>
              <Flex fontWeight={700}>
                {submissions?.[submissionIndex]?.response[0].name}
              </Flex>
              <Flex flexDir={"column"}>
                <Flex fontSize={"14px"} color={"#848484"}>
                  <Flex w={"100px"}>Model</Flex>:{" "}
                  {submissions?.[submissionIndex]?.response[0].model}{" "}
                </Flex>
                <Flex fontSize={"14px"} color={"#848484"}>
                  <Flex w={"100px"}>Serial Number</Flex>:{" "}
                  {submissions?.[submissionIndex]?.response[0].serial_number}{" "}
                </Flex>
                <Flex visibility={"hidden"} fontSize={"14px"} color={"#848484"}>
                  a
                </Flex>
              </Flex>
            </Flex>
          </Flex>
        </Flex>
      );

    default:
      return (
        <Flex>
          {submissions?.[submissionIndex]?.response
            ? submissions?.[submissionIndex]?.response
            : "Not answered"}
        </Flex>
      );
  }
}
