import {
  Avatar,
  Button,
  Center,
  Divider,
  Flex,
  Input,
  InputGroup,
  InputLeftElement,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Spinner,
  Table,
  TableContainer,
  Tag,
  TagLabel,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
} from "@chakra-ui/react";
import { debounce } from "lodash";
import moment from "moment";
import { useCallback } from "react";
import { AiOutlineAppstore } from "react-icons/ai";
import { BsBarChartFill } from "react-icons/bs";
import { FaCog, FaEdit, FaUserAlt } from "react-icons/fa";
import { FaClock, FaMapLocationDot, FaPhone } from "react-icons/fa6";
import { IoIosMail, IoMdSearch } from "react-icons/io";
import { LuClipboardPaste } from "react-icons/lu";
import { MdEvent } from "react-icons/md";
import { useLocation, useNavigate } from "react-router-dom";
import Can from "../../components/Can";
import LabelizeAction from "../../components/LabelizeAction";
import labelizeRole from "../../utils/labelizeRole";
import AssignedRoleMapper from "../../utils/assignedRoleMapper";
import ConvertTableToRoute from "../../utils/convertTableToRoute";
import tableStatusStyleMapper from "../../utils/tableStatusStyleMapper";
import ListEmptyState from "../ListEmptyState";
import Pagination from "../Pagination";
import MemberDetailsAccessibility from "./MemberDetailsAccessibility";
export default function MemberDetailsModal({
  pageModule,
  selectedMemberDetails,
  memberDetailsMenu,
  setMemberDetailsMenu,
  activities,
  from,
  showing,
  totalPages,
  currentPage,
  setCurrentPage,
  tableLoading,
  setTableLoading,
  searchInput,
  setSearchInput,
  accessibilityLoading,
  accessibility,
  accessibilityRBAC,
  fetchActivities,
  fetchAccessibility,
  onClose,
  isOpen,
}) {
  const nav = useNavigate();
  const location = useLocation();

  const IMGURL = import.meta.env.VITE_API_IMAGE_URL;
  const debouncedSearch = useCallback(
    debounce((value) => {
      setSearchInput((prevState) => {
        if (prevState === value) {
          setTableLoading(false);
        }
        return value;
      });
      setCurrentPage(1);
    }, 1000),
    []
  );
  const handleChange = (e) => {
    const { value, id } = e.target;
    if (id === "row") {
      // setRows(value);
    } else {
      setTableLoading(true);
      debouncedSearch(value);
    }
  };

  function handleCloseModal() {
    onClose();
    setSearchInput("");
    setCurrentPage(1);
  }

  return (
    <Flex w={"100%"}>
      <Modal isOpen={isOpen} onClose={handleCloseModal} isCentered>
        <ModalOverlay />
        <ModalContent
          maxW={
            memberDetailsMenu === "profile" ||
            memberDetailsMenu === "accessibility"
              ? "900px"
              : "900px"
            // : "1100px"
          }
          maxH={"90vh"}
          overflow={"auto"}
          bg={"white"}
        >
          <ModalHeader
            p={0}
            display={"flex"}
            gap={"10px"}
            alignItems={"center"}
          >
            <Flex flexDir={"column"} w={"100%"}>
              <Flex
                borderTopLeftRadius={"8px"}
                borderTopRightRadius={"8px"}
                bgGradient="linear(to-b, #ededed 50%, white 50%)"
                gap={"20px"}
                flexDir={"column"}
                w={"100%"}
                p={"20px"}
                pb={"10px"}
              >
                <Flex justifyContent={"space-between"} alignItems={"center"}>
                  {selectedMemberDetails?.user?.first_name ? (
                    <Avatar
                      size={"xl"}
                      outline={"2px solid #dc143c"}
                      border={"4px solid white"}
                      name={
                        selectedMemberDetails?.user?.first_name +
                        " " +
                        selectedMemberDetails?.user?.last_name
                      }
                      src={
                        selectedMemberDetails?.user?.profile_image_url
                          ? IMGURL +
                            selectedMemberDetails?.user?.profile_image_url
                          : null
                      }
                    ></Avatar>
                  ) : (
                    <Flex
                      outline={"2px solid #dc143c"}
                      bg={"#bababa"}
                      borderRadius={"100%"}
                      justifyContent={"center"}
                      alignItems={"center"}
                      h={"88px"}
                      w={"88px"}
                      border={"4px solid white"}
                    >
                      <Flex color={"white"} fontSize={"44px"}>
                        <FaUserAlt />
                      </Flex>
                    </Flex>
                  )}
                  <Can
                    module={pageModule}
                    permission={[`manage_${selectedMemberDetails?.role}`]}
                  >
                    <Flex
                      alignSelf={"stretch"}
                      justify={"center"}
                      flexDir={"column"}
                    >
                      <Button
                        mt={"50px"}
                        background={"white"}
                        h={"32px"}
                        gap={"5px"}
                        px={"10px"}
                        _hover={{ background: "#dc143c", color: "white" }}
                        color={"#dc143c"}
                        alignItems={"center"}
                        border={"2px solid #dc143c"}
                        onClick={() => {
                          nav(
                            `/member/edit/${selectedMemberDetails?.UID}${location.search}`
                          );
                        }}
                      >
                        <Flex>
                          <FaEdit />
                        </Flex>
                        <Flex>Edit Member</Flex>
                      </Button>
                    </Flex>
                  </Can>
                </Flex>
              </Flex>
              <Flex px={"20px"} pb={"10px"} flexDir={"column"}>
                <Flex justify={"space-between"}>
                  <Flex>
                    {selectedMemberDetails?.user?.first_name +
                      " " +
                      selectedMemberDetails?.user?.last_name}
                  </Flex>
                </Flex>
                <Flex color={"#848484"} fontSize={"16px"} fontWeight={400}>
                  {labelizeRole(
                    selectedMemberDetails?.role,
                    selectedMemberDetails.has_custom_permissions
                  ) +
                    " - " +
                    selectedMemberDetails?.employee_id}
                </Flex>
              </Flex>
              <Flex
                px={"20px"}
                gap={"5px"}
                alignItems={"center"}
                color={"#848484"}
                fontSize={"14px"}
                fontWeight={400}
              ></Flex>
            </Flex>
          </ModalHeader>
          <Divider m={0} borderColor={"#bababa"} />

          <ModalBody p={0}>
            <Flex flexDir={"column"}>
              <Flex
                alignItems={"stretch"}
                // bg={"#f8f9fa"}
                justify={"center"}
                gap={"20px"}
              >
                <Flex
                  _hover={
                    memberDetailsMenu === "profile"
                      ? ""
                      : { color: "black", borderBottom: "3px solid #848484" }
                  }
                  cursor={memberDetailsMenu === "profile" ? "text" : "pointer"}
                  px={"16px"}
                  w={"180px"}
                  py={"10px"}
                  fontSize={"16px"}
                  borderBottom={
                    memberDetailsMenu === "profile"
                      ? "3px solid #dc143c"
                      : "3px solid #bababa"
                  }
                  alignItems={"center"}
                  gap={"5px"}
                  justify={"center"}
                  onClick={() => setMemberDetailsMenu("profile")}
                  color={memberDetailsMenu === "profile" ? "black" : "#848484"}
                >
                  <Flex fontSize={"18px"} fontWeight={700}>
                    <FaUserAlt />
                  </Flex>
                  <Flex fontWeight={700}>Profile</Flex>
                </Flex>
                <Flex bg={"#ededed"} w={"1px"} alignSelf={"stretch"}></Flex>
                <Flex
                  _hover={
                    memberDetailsMenu === "activities"
                      ? ""
                      : { color: "black", borderBottom: "3px solid #848484" }
                  }
                  cursor={
                    memberDetailsMenu === "activities" ? "text" : "pointer"
                  }
                  px={"16px"}
                  w={"180px"}
                  py={"10px"}
                  fontSize={"16px"}
                  color={
                    memberDetailsMenu === "activities" ? "black" : "#848484"
                  }
                  borderBottom={
                    memberDetailsMenu === "activities"
                      ? "3px solid #dc143c"
                      : "3px solid #ededed"
                  }
                  alignItems={"center"}
                  gap={"5px"}
                  justify={"center"}
                  onClick={() => setMemberDetailsMenu("activities")}
                >
                  <Flex fontWeight={700}>
                    <BsBarChartFill />
                  </Flex>
                  <Flex fontWeight={700}>Activities</Flex>
                </Flex>
                <Flex bg={"#ededed"} w={"1px"} alignSelf={"stretch"}></Flex>
                <Flex
                  _hover={
                    memberDetailsMenu === "accessibility"
                      ? ""
                      : { color: "black", borderBottom: "3px solid #848484" }
                  }
                  cursor={
                    memberDetailsMenu === "accessibility" ? "text" : "pointer"
                  }
                  px={"16px"}
                  w={"180px"}
                  py={"10px"}
                  fontSize={"16px"}
                  color={
                    memberDetailsMenu === "accessibility" ? "black" : "#848484"
                  }
                  borderBottom={
                    memberDetailsMenu === "accessibility"
                      ? "3px solid #dc143c"
                      : "3px solid #ededed"
                  }
                  alignItems={"center"}
                  gap={"5px"}
                  justify={"center"}
                  onClick={() => setMemberDetailsMenu("accessibility")}
                >
                  <Flex fontWeight={700}>
                    <FaCog />
                  </Flex>
                  <Flex fontWeight={700}>Accessibility</Flex>
                </Flex>
              </Flex>
              <Flex bg={"#d6d6d6"} w={"100%"} h={"1px"}></Flex>
              {memberDetailsMenu == "profile" && (
                <Flex bg={"#f8f9fa"} p={"20px"} gap={"20px"} flexDir={"column"}>
                  <Flex justify={"space-between"}>
                    <Flex w={"60%"} flexDir={"column"}>
                      <Flex fontWeight={700} alignItems={"center"} gap={"5px"}>
                        <Flex color={"#848484"} fontSize={"20px"}>
                          <IoIosMail />
                        </Flex>
                        <Flex>Email :</Flex>
                      </Flex>
                      <Flex color={"#848484"}>
                        {selectedMemberDetails?.user?.email}
                      </Flex>
                    </Flex>
                    <Flex w={"40%"} flexDir={"column"}>
                      <Flex fontWeight={700} alignItems={"center"} gap={"5px"}>
                        <Flex color={"#848484"} fontSize={"16px"}>
                          <FaPhone />
                        </Flex>
                        <Flex fontWeight={700}>Phone Number :</Flex>
                      </Flex>
                      <Flex color={"#848484"}>
                        {selectedMemberDetails?.user?.phone_number ?? "-"}
                      </Flex>
                    </Flex>
                  </Flex>
                  <Flex justify={"space-between"}>
                    <Flex w={"60%"} flexDir={"column"}>
                      <Flex fontWeight={700} alignItems={"center"} gap={"5px"}>
                        <Flex color={"#848484"} fontSize={"20px"}>
                          <AiOutlineAppstore />
                        </Flex>
                        <Flex fontWeight={700}>Department :</Flex>
                      </Flex>
                      <Flex color={"#848484"}>
                        {selectedMemberDetails?.department?.name}
                      </Flex>
                    </Flex>

                    <Flex w={"40%"} flexDir={"column"}>
                      <Flex fontWeight={700} alignItems={"center"} gap={"5px"}>
                        <Flex color={"#848484"} fontSize={"16px"}>
                          <FaClock />
                        </Flex>
                        <Flex fontWeight={700}>Last Login :</Flex>
                      </Flex>
                      <Flex color={"#848484"}>
                        {selectedMemberDetails?.user?.last_login
                          ? moment(
                              selectedMemberDetails?.user?.last_login
                            ).format("DD/MM/YYYY")
                          : "-"}
                      </Flex>
                    </Flex>
                  </Flex>
                  <Flex justify={"space-between"}>
                    <Flex w={"60%"} flexDir={"column"}>
                      <Flex fontWeight={700} alignItems={"center"} gap={"5px"}>
                        <Flex color={"#848484"} fontSize={"20px"}>
                          <MdEvent />
                        </Flex>
                        <Flex fontWeight={700}>Started at :</Flex>
                      </Flex>
                      <Flex color={"#848484"}>
                        {moment(selectedMemberDetails?.created_at).format(
                          "DD/MM/YYYY"
                        )}
                      </Flex>
                    </Flex>
                  </Flex>
                  <Flex flexDir={"column"} gap={"5px"}>
                    <Flex fontWeight={700} alignItems={"center"} gap={"5px"}>
                      <Flex color={"#848484"} fontSize={"20px"}>
                        <LuClipboardPaste />
                      </Flex>
                      <Flex fontWeight={700}>Ongoing Work Order :</Flex>
                    </Flex>
                    <TableContainer
                      width={"100%"}
                      boxShadow={"0px 0px 3px rgba(50,50,93,0.5)"}
                    >
                      <Table variant="simple">
                        <Thead bg={"#ECEFF3"}>
                          <Tr>
                            <Th
                              w={"fit-content"}
                              borderBottomColor={"#bababa"}
                              fontWeight={700}
                              px={"10px"}
                              fontSize={"12px"}
                            >
                              Work Order
                            </Th>
                            <Th
                              w={"200px"}
                              px={"10px"}
                              borderBottomColor={"#bababa"}
                              fontWeight={700}
                              fontSize={"12px"}
                            >
                              Role
                            </Th>
                            <Th
                              w={"160px"}
                              px={"10px"}
                              borderBottomColor={"#bababa"}
                              fontWeight={700}
                              fontSize={"12px"}
                            >
                              Work Site
                            </Th>
                            <Th
                              px={"10px"}
                              borderBottomColor={"#bababa"}
                              fontWeight={700}
                              fontSize={"12px"}
                            >
                              Deadline
                            </Th>
                            <Th
                              px={"10px"}
                              borderBottomColor={"#bababa"}
                              fontWeight={700}
                              fontSize={"12px"}
                            >
                              Started At
                            </Th>
                          </Tr>
                        </Thead>

                        <Tbody>
                          {selectedMemberDetails?.assigned_work_orders
                            ?.length ? (
                            selectedMemberDetails?.assigned_work_orders?.map(
                              (val) => {
                                const { bgColor, textColor, icon, text } =
                                  tableStatusStyleMapper(val.status);
                                return (
                                  <>
                                    <Tr fontSize={"14px"}>
                                      <Td
                                        fontWeight={700}
                                        borderBottomColor={"#bababa"}
                                        px={"10px"}
                                      >
                                        <Flex flexDir={"column"}>
                                          <Flex
                                            display={"inline-block"}
                                            overflow={"hidden"}
                                            textOverflow={"ellipsis"}
                                            whiteSpace={"nowrap"}
                                            maxW={"240px"}
                                            fontWeight={700}
                                            color={"black"}
                                          >
                                            {val.name}
                                          </Flex>
                                          <Flex
                                            display={"inline-block"}
                                            textOverflow={"ellipsis"}
                                            overflow={"hidden"}
                                            fontSize={"13px"}
                                            color={"#848484"}
                                            maxW={"200px"}
                                          >
                                            {val.work_order_custom_id}
                                          </Flex>
                                        </Flex>
                                      </Td>
                                      <Td
                                        fontSize={"14px"}
                                        borderBottomColor={"#bababa"}
                                        px={"10px"}
                                      >
                                        <Flex
                                          fontWeight={700}
                                          gap={"5px"}
                                          flexWrap={"wrap"}
                                        >
                                          {val.role.map((value) => {
                                            const assignedRoleStyle =
                                              AssignedRoleMapper(value);
                                            return (
                                              <Tag
                                                cursor={"pointer"}
                                                _hover={{ bg: "#dedede" }}
                                                transition={
                                                  "background 0.2s ease-in-out"
                                                }
                                                size={"sm"}
                                                borderRadius="full"
                                                variant="solid"
                                                bg={assignedRoleStyle.bgColor}
                                                color={
                                                  assignedRoleStyle.textColor
                                                }
                                                border={
                                                  assignedRoleStyle.textColor +
                                                  " 1px solid"
                                                }
                                                gap={"5px"}
                                                alignItems={"center"}
                                                fontSize={"11px"}
                                                px={"5px"}
                                                py={"2px"}
                                              >
                                                <Flex
                                                  minW={"6px"}
                                                  minH={"6px"}
                                                  bg={
                                                    assignedRoleStyle.textColor
                                                  }
                                                  borderRadius={"100%"}
                                                ></Flex>
                                                <TagLabel>
                                                  {assignedRoleStyle.text}
                                                </TagLabel>
                                              </Tag>
                                            );
                                          })}
                                        </Flex>
                                      </Td>
                                      <Td
                                        fontSize={"14px"}
                                        borderBottomColor={"#bababa"}
                                        px={"10px"}
                                      >
                                        <Flex alignItems={"center"} gap={"4px"}>
                                          <Flex
                                            color={"#dc143c"}
                                            fontSize={"18px"}
                                          >
                                            <FaMapLocationDot />
                                          </Flex>
                                          <Flex
                                            display={"inline-block"}
                                            overflow={"hidden"}
                                            textOverflow={"ellipsis"}
                                            maxW={"200px"}
                                            whiteSpace={"nowrap"}
                                            fontWeight={700}
                                          >
                                            {val.work_site.name}
                                          </Flex>
                                        </Flex>
                                      </Td>
                                      <Td
                                        fontSize={"14px"}
                                        borderBottomColor={"#bababa"}
                                        px={"10px"}
                                      >
                                        <Flex flexDir={"column"}>
                                          <Flex
                                            color={"black"}
                                            fontWeight={700}
                                          >
                                            {moment(
                                              val.deadline_date_time
                                            ).format("YYYY-MM-DD")}
                                          </Flex>
                                          <Flex color={"#848484"}>
                                            {moment(
                                              val.deadline_date_time
                                            ).format("hh:mm A")}
                                          </Flex>
                                        </Flex>
                                      </Td>

                                      <Td
                                        borderBottomColor={"#bababa"}
                                        px={"10px"}
                                      >
                                        <Flex flexDir={"column"}>
                                          <Flex
                                            color={"black"}
                                            fontWeight={700}
                                          >
                                            {moment(val.started_at).format(
                                              "YYYY-MM-DD"
                                            )}
                                          </Flex>
                                          <Flex color={"#848484"}>
                                            {moment(val.started_at).format(
                                              "HH:mm:ss"
                                            )}
                                          </Flex>
                                        </Flex>
                                      </Td>
                                    </Tr>
                                  </>
                                );
                              }
                            )
                          ) : (
                            <ListEmptyState
                              size={"sm"}
                              colSpan={5}
                              header1={"No work orders found."}
                              header2={
                                "Assign this user to begin tracking them."
                              }
                            />
                          )}
                        </Tbody>
                      </Table>
                    </TableContainer>
                  </Flex>
                </Flex>
              )}
              {memberDetailsMenu == "activities" && (
                <Flex bg={"#f8f9fa"} p={"20px"} gap={"20px"} flexDir={"column"}>
                  <Flex justify={"end"}>
                    <Flex gap={"20px"}>
                      <Flex>
                        <InputGroup>
                          <InputLeftElement pointerEvents="none">
                            <IoMdSearch color="#848484" fontSize={"20px"} />
                          </InputLeftElement>
                          <Input
                            boxShadow={"0px 0px 3px rgba(50,50,93,0.5)"}
                            placeholder="Search history..."
                            onChange={handleChange}
                          ></Input>
                        </InputGroup>
                      </Flex>
                    </Flex>
                  </Flex>
                  {tableLoading ? (
                    <Center
                      flexDir={"column"}
                      alignItems={"center"}
                      gap={"20px"}
                      height="320px"
                      overflow={"auto"}
                      opacity={1}
                    >
                      <Spinner thickness="3px" size="xl" color="#dc143c" />
                      <Center
                        flexDir={"column"}
                        color={"#dc143c"}
                        fontWeight={700}
                      >
                        <Flex fontWeight={700} fontSize={"20px"}>
                          Loading
                        </Flex>
                        <Flex color={"black"} fontSize={"16px"}>
                          Processing your request...
                        </Flex>
                      </Center>
                    </Center>
                  ) : (
                    <TableContainer
                      overflow={"auto"}
                      boxShadow={"0px 0px 3px rgba(50,50,93,0.5)"}
                    >
                      <Table variant="simple">
                        <Thead bg={"#ECEFF3"}>
                          <Tr>
                            <Th borderBottomColor={"#bababa"} px={"20px"}>
                              Date & Time
                            </Th>
                            <Th borderBottomColor={"#bababa"} px={"20px"}>
                              IP Address
                            </Th>
                            <Th borderBottomColor={"#bababa"} px={"20px"}>
                              Action
                            </Th>
                            <Th borderBottomColor={"#bababa"} px={"20px"}>
                              Description
                            </Th>
                          </Tr>
                        </Thead>
                        <Tbody>
                          {activities.length ? (
                            activities.map((val, index) => {
                              return (
                                <Tr
                                  w={"100%"}
                                  bg={index % 2 ? "white" : "#f8f9fa"}
                                >
                                  <Td
                                    px={"20px"}
                                    borderBottomColor={"#bababa"}
                                    color={"#848484"}
                                    overflowWrap="break-word"
                                    maxWidth="50px"
                                    whiteSpace="normal"
                                    fontSize={"14px"}
                                  >
                                    {/* {moment(val.created_at).format(
                                      "MMM DD YYYY, hh:mm A"
                                    )} */}
                                    <Flex flexDir={"column"}>
                                      <Flex>
                                        {moment(val.created_at).format(
                                          "YYYY-MM-DD"
                                        )}
                                      </Flex>
                                      <Flex color={"#848484"}>
                                        {moment(val.created_at).format(
                                          "HH:mm:ss"
                                        )}
                                      </Flex>
                                    </Flex>
                                  </Td>

                                  <Td
                                    borderBottomColor={"#bababa"}
                                    color={"#848484"}
                                    px={"20px"}
                                    fontSize={"14px"}
                                  >
                                    {val.ip_address}
                                  </Td>

                                  <Td
                                    borderBottomColor={"#bababa"}
                                    fontSize={"14px"}
                                    px={"20px"}
                                  >
                                    <Flex>{LabelizeAction(val.action)}</Flex>
                                  </Td>

                                  <Td
                                    borderBottomColor={"#bababa"}
                                    color={"#848484"}
                                    whiteSpace="normal"
                                    wordBreak="break-word"
                                    px={"20px"}
                                    fontSize={"14px"}
                                  >
                                    <Flex
                                      cursor={"pointer"}
                                      _hover={{ color: "#dc143c" }}
                                      onClick={() => {
                                        nav(
                                          ConvertTableToRoute(
                                            val.table_name,
                                            val.resource_UID
                                          )
                                        );
                                      }}
                                    >
                                      {val.description}
                                    </Flex>
                                  </Td>
                                </Tr>
                              );
                            })
                          ) : (
                            <ListEmptyState
                              size={"sm"}
                              colSpan={6}
                              header1={"No activities found."}
                              header2={"This member has no activities."}
                            />
                          )}
                        </Tbody>
                      </Table>
                    </TableContainer>
                  )}
                  <Pagination
                    setCurrentPage={setCurrentPage}
                    totalPages={totalPages}
                    currentPage={currentPage}
                    from={from}
                    showing={showing}
                    page={"activitiesUser"}
                  />
                </Flex>
              )}
              {memberDetailsMenu == "accessibility" && (
                <Flex bg={"#f8f9fa"} p={"20px"} gap={"20px"} flexDir={"column"}>
                  <MemberDetailsAccessibility
                    accessibility={accessibility}
                    accessibilityRBAC={accessibilityRBAC}
                    accessibilityLoading={accessibilityLoading}
                  />
                </Flex>
              )}
            </Flex>
          </ModalBody>
          <Divider m={0} borderColor={"#bababa"} />
          <ModalFooter p={"20px"} w={"100%"} justifyContent={"center"}>
            <Flex w={"100%"} justify={"end"}>
              <Button
                background={"#dc143c"}
                h={"32px"}
                color={"white"}
                gap={"10px"}
                alignItems={"center"}
                onClick={handleCloseModal}
              >
                <Flex>Close</Flex>
              </Button>
            </Flex>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Flex>
  );
}
