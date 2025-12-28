import {
  Avatar,
  Button,
  Center,
  Divider,
  Flex,
  Image,
  Input,
  InputGroup,
  InputLeftElement,
  Modal,
  Link as ChakraLink,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Spinner,
  Table,
  TableContainer,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
} from "@chakra-ui/react";
import { debounce } from "lodash";
import moment from "moment";
import { useCallback, useEffect, useState } from "react";
import { BsDpadFill } from "react-icons/bs";
import { CgNotes } from "react-icons/cg";
import { FaEdit, FaInfoCircle, FaTag, FaUserAlt } from "react-icons/fa";
import { FaClockRotateLeft, FaKey, FaMapLocationDot } from "react-icons/fa6";
import { IoIosLock, IoMdSearch } from "react-icons/io";
import { IoBatteryHalf } from "react-icons/io5";
import { LuNfc } from "react-icons/lu";
import { MdEvent } from "react-icons/md";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { api } from "../../api/api";
import labelizeRole from "../../utils/labelizeRole";
import formatString from "../../utils/formatString";
import getLockImageByModel from "../../utils/getLockImageByModel";
import tableStatusStyleMapper from "../../utils/tableStatusStyleMapper";
import ListEmptyState from "../ListEmptyState";
import Pagination from "../Pagination";

export default function LockDetailsModal({
  selectedLockDetails,
  onClose,
  isOpen,
  lockDetailsMenu,
  setLockDetailsMenu,
}) {
  const location = useLocation();

  const [history, setHistory] = useState([]);
  const [from, setFrom] = useState();
  const [showing, setShowing] = useState(0);
  const [totalPages, setTotalPages] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [tableLoading, setTableLoading] = useState(false);
  const nav = useNavigate();

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
  async function fetchLockHistory(controller) {
    setTableLoading(true);
    await api
      .getDummy()
      .then((response) => {
        setHistory(response.data.data);
        setFrom(response.data.from);
        setTotalPages(response.data.last_page);
        setShowing({
          current: response.data.to,
          total: response.data.total,
        });
      })
      .catch((error) => {
        console.log(error);
      })
      .finally(() => {
        setTableLoading(false);
      });
  }
  function handleCloseModal() {
    onClose();
    setSearchInput("");
    setCurrentPage(1);
  }
  useEffect(() => {
    if (lockDetailsMenu === "history") {
      const controller = new AbortController();
      fetchLockHistory(controller);
      return () => {
        controller.abort(); // Cleanup previous fetch request before new one starts
      };
    }
  }, [lockDetailsMenu, currentPage, searchInput]);
  const { bgColor, textColor, icon, text } = tableStatusStyleMapper(
    selectedLockDetails?.status
  );
  return (
    <Modal isOpen={isOpen} onClose={handleCloseModal} isCentered>
      <ModalOverlay />
      <ModalContent
        maxW={"1000px"}
        maxH={"90vh"}
        overflow={"auto"}
        bg={"white"}
      >
        <ModalHeader p={0} display={"flex"} gap={"10px"} alignItems={"center"}>
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
                <Flex
                  background={selectedLockDetails?.model ? "white" : "#848484"}
                  justifyContent={"center"}
                  alignItems={"center"}
                  h={"96px"}
                  w={"96px"}
                  border={"2px solid #dc143c"}
                  borderRadius={"100%"}
                >
                  <Flex color={"white"} fontSize={"48px"}>
                    {selectedLockDetails?.model ? (
                      <Image
                        borderRadius={"100%"}
                        src={getLockImageByModel(selectedLockDetails?.model)}
                      ></Image>
                    ) : (
                      <IoIosLock />
                    )}
                  </Flex>
                </Flex>
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
                        `/lock-inventory/edit/${selectedLockDetails?.UID}${location.search}`
                      );
                    }}
                  >
                    <Flex>
                      <FaEdit />
                    </Flex>
                    <Flex>Edit Lock</Flex>
                  </Button>
                </Flex>
              </Flex>
            </Flex>
            <Flex px={"20px"} pb={"10px"} flexDir={"column"}>
              <Flex justify={"space-between"}>
                <Flex>{selectedLockDetails?.name}</Flex>
              </Flex>
              <Flex color={"#848484"} fontSize={"16px"} fontWeight={400}>
                {selectedLockDetails?.model}
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
            <Flex alignItems={"stretch"} justify={"center"} gap={"20px"}>
              <Flex
                _hover={
                  lockDetailsMenu !== "lock"
                    ? { color: "black", borderBottom: "3px solid #848484" }
                    : ""
                }
                cursor={lockDetailsMenu !== "lock" ? "pointer" : "text"}
                px={"16px"}
                w={"180px"}
                py={"10px"}
                fontSize={"16px"}
                borderBottom={
                  lockDetailsMenu === "lock"
                    ? "3px solid #dc143c"
                    : "3px solid #ededed"
                }
                alignItems={"center"}
                gap={"5px"}
                justify={"center"}
                onClick={() => setLockDetailsMenu("lock")}
                color={lockDetailsMenu === "lock" ? "black" : "#848484"}
              >
                <Flex fontSize={"18px"} fontWeight={700}>
                  <IoIosLock />
                </Flex>
                <Flex fontWeight={700}>Lock Details</Flex>
              </Flex>
              <Flex
                _hover={
                  lockDetailsMenu !== "history"
                    ? { color: "black", borderBottom: "3px solid #848484" }
                    : ""
                }
                cursor={lockDetailsMenu !== "history" ? "pointer" : "text"}
                px={"16px"}
                w={"180px"}
                py={"5px"}
                fontSize={"16px"}
                borderBottom={
                  lockDetailsMenu === "history"
                    ? "3px solid #dc143c"
                    : "3px solid #ededed"
                }
                alignItems={"center"}
                gap={"5px"}
                color={lockDetailsMenu === "history" ? "black" : "#848484"}
                justify={"center"}
                onClick={() => setLockDetailsMenu("history")}
              >
                <Flex fontWeight={700}>
                  <FaClockRotateLeft />
                </Flex>
                <Flex fontWeight={700}>History</Flex>
              </Flex>
              <Flex
                _hover={
                  lockDetailsMenu !== "accessMethods"
                    ? { color: "black", borderBottom: "3px solid #848484" }
                    : ""
                }
                cursor={
                  lockDetailsMenu !== "accessMethods" ? "pointer" : "text"
                }
                px={"16px"}
                w={"180px"}
                py={"5px"}
                fontSize={"16px"}
                borderBottom={
                  lockDetailsMenu === "accessMethods"
                    ? "3px solid #dc143c"
                    : "3px solid #ededed"
                }
                alignItems={"center"}
                gap={"5px"}
                color={
                  lockDetailsMenu === "accessMethods" ? "black" : "#848484"
                }
                justify={"center"}
                onClick={() => setLockDetailsMenu("accessMethods")}
              >
                <Flex fontWeight={700}>
                  <FaKey />
                </Flex>
                <Flex fontWeight={700}>Access Methods</Flex>
              </Flex>
            </Flex>
            <Flex bg={"#d6d6d6"} w={"100%"} h={"1px"}></Flex>

            {lockDetailsMenu == "lock" && (
              <Flex bg={"#f8f9fa"} p={"20px"} gap={"20px"} flexDir={"column"}>
                <Flex justify={"space-between"}>
                  <Flex w={"55%"} flexDir={"column"}>
                    <Flex fontWeight={700} alignItems={"center"} gap={"5px"}>
                      <Flex color={"#848484"} fontSize={"14px"}>
                        <FaTag />
                      </Flex>
                      <Flex>Serial Number :</Flex>
                    </Flex>
                    <Flex color={"#848484"}>
                      {selectedLockDetails?.serial_number ?? "Not set"}
                    </Flex>
                  </Flex>
                  <Flex w={"45%"} flexDir={"column"}>
                    <Flex fontWeight={700} alignItems={"center"} gap={"5px"}>
                      <Flex color={"#848484"} fontSize={"20px"}>
                        <IoBatteryHalf />
                      </Flex>
                      <Flex fontWeight={700}>Battery Level :</Flex>
                    </Flex>
                    <Flex color={"#848484"}>
                      {selectedLockDetails.battery_level || 0}%
                    </Flex>
                  </Flex>
                </Flex>
                <Flex justify={"space-between"}>
                  <Flex w={"55%"} flexDir={"column"}>
                    <Flex fontWeight={700} alignItems={"center"} gap={"5px"}>
                      <Flex color={"#848484"} fontSize={"16px"}>
                        <FaInfoCircle />
                      </Flex>
                      <Flex fontWeight={700}>Status :</Flex>
                    </Flex>
                    <Flex>
                      <Flex
                        fontWeight={700}
                        borderRadius={"10px"}
                        px={"8px"}
                        py={"4px"}
                        alignItems={"center"}
                        gap={"5px"}
                        fontSize={"14px"}
                        bg={bgColor}
                        color={textColor}
                      >
                        <Flex fontSize={"16px"}>{icon}</Flex>
                        <Flex>{text}</Flex>
                      </Flex>
                    </Flex>
                  </Flex>
                  <Flex w={"45%"} flexDir={"column"}>
                    <Flex fontWeight={700} alignItems={"center"} gap={"5px"}>
                      <Flex color={"#848484"} fontSize={"16px"}>
                        <CgNotes />
                      </Flex>
                      <Flex fontWeight={700}>Additional Notes :</Flex>
                    </Flex>
                    <Flex color={"#848484"}>
                      {selectedLockDetails?.additional_notes ?? "Not set"}
                    </Flex>
                  </Flex>
                </Flex>
                <Flex justify={"space-between"}>
                  <Flex w={"55%"} flexDir={"column"}>
                    <Flex fontWeight={700} alignItems={"center"} gap={"5px"}>
                      <Flex color={"#848484"} fontSize={"20px"}>
                        <MdEvent />
                      </Flex>
                      <Flex fontWeight={700}>Registered at :</Flex>
                    </Flex>
                    <Flex color={"#848484"}>
                      {moment(selectedLockDetails?.created_at).format(
                        "DD/MM/YYYY"
                      )}
                    </Flex>
                  </Flex>
                  <Flex w={"45%"} flexDir={"column"}>
                    <Flex fontWeight={700} alignItems={"center"} gap={"5px"}>
                      <Flex color={"#848484"} fontSize={"16px"}>
                        <CgNotes />
                      </Flex>
                      <Flex fontWeight={700}>Lock Version :</Flex>
                    </Flex>
                    <Flex color={"#848484"}>
                      {selectedLockDetails?.lock_version ?? "Not set"}
                    </Flex>
                  </Flex>
                </Flex>
                <Flex justify={"space-between"}>
                  <Flex w={"100%"} flexDir={"column"}>
                    <Flex fontWeight={700} alignItems={"center"} gap={"5px"}>
                      <Flex color={"#848484"} fontSize={"20px"}>
                        <MdEvent />
                      </Flex>
                      <Flex fontWeight={700}>Assigned Work Order :</Flex>
                    </Flex>
                    <Flex flexDir={"column"}>
                      <Flex
                        display={"inline-block"}
                        overflow={"hidden"}
                        textOverflow={"ellipsis"}
                        whiteSpace={"nowrap"}
                        onClick={(e) => e.stopPropagation()}
                        fontWeight={700}
                        color={"#848484"}
                        _hover={{ color: "black" }}
                      >
                        <Link
                          to={`/work-order/${selectedLockDetails?.work_order_multi_lock_group_item?.work_order_step?.work_order?.UID}`}
                        >
                          {
                            selectedLockDetails
                              ?.work_order_multi_lock_group_item
                              ?.work_order_step?.work_order?.name
                          }
                        </Link>
                      </Flex>
                      <Flex
                        display={"inline-block"}
                        overflow={"hidden"}
                        textOverflow={"ellipsis"}
                        maxW={"240px"}
                        whiteSpace={"nowrap"}
                        fontSize={"13px"}
                        color={"#848484"}
                      >
                        {
                          selectedLockDetails?.work_order_multi_lock_group_item
                            ?.work_order_step?.work_order?.work_order_custom_id
                        }
                      </Flex>
                    </Flex>
                  </Flex>
                </Flex>
              </Flex>
            )}
            {lockDetailsMenu == "history" && (
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
                      <Flex color={"black"}>Processing your request...</Flex>
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
                          <Th borderBottomColor={"#bababa"} px={"12px"}>
                            Date & Time
                          </Th>
                          <Th borderBottomColor={"#bababa"} px={"12px"}>
                            User
                          </Th>
                          <Th borderBottomColor={"#bababa"} px={"12px"}>
                            Action
                          </Th>
                          <Th borderBottomColor={"#bababa"} px={"12px"}>
                            Method
                          </Th>
                          <Th borderBottomColor={"#bababa"} px={"12px"}>
                            Method Info
                          </Th>
                          <Th borderBottomColor={"#bababa"} px={"12px"}>
                            Location
                          </Th>
                          <Th borderBottomColor={"#bababa"} px={"12px"}>
                            Google Maps
                          </Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {history.length ? (
                          history.map((val, index) => {
                            const { bgColor, textColor, icon, text } =
                              tableStatusStyleMapper(val.status);
                            return (
                              <Tr
                                w={"100%"}
                                bg={index % 2 ? "white" : "#f8f9fa"}
                              >
                                <Td
                                  px={"12px"}
                                  borderBottomColor={"#bababa"}
                                  color={"#848484"}
                                  overflowWrap="break-word"
                                  maxWidth="50px"
                                  whiteSpace="normal"
                                  fontSize={"14px"}
                                >
                                  <Flex flexDir={"column"}>
                                    <Flex color={"black"} fontWeight={700}>
                                      {moment(val.time).format("YYYY-MM-DD")}
                                    </Flex>
                                    <Flex color={"#848484"} fontSize={"14px"}>
                                      {moment(val.time).format("hh:mm A")}
                                    </Flex>
                                  </Flex>
                                </Td>

                                <Td
                                  borderBottomColor={"#bababa"}
                                  color={"#848484"}
                                  px={"12px"}
                                  fontSize={"14px"}
                                >
                                  <Flex alignItems={"center"} gap={"10px"}>
                                    {val?.user?.first_name ? (
                                      <Avatar
                                        outline={"1px solid #dc143c"}
                                        border={"2px solid white"}
                                        name={
                                          val.user.first_name +
                                          " " +
                                          val.user.last_name
                                        }
                                        src={
                                          val.user.profile_image_url
                                            ? val.user.profile_image_url
                                            : null
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
                                      <Flex fontWeight={700} color={"black"}>
                                        {val?.user?.first_name +
                                          " " +
                                          val?.user?.last_name}
                                      </Flex>
                                      <Flex fontSize={"14px"} color={"#848484"}>
                                        {val?.user?.is_superadmin
                                          ? "Super Admin"
                                          : labelizeRole(
                                              val?.user?.member?.role
                                            ) +
                                            " - " +
                                            val?.user?.member?.employee_id}
                                      </Flex>
                                    </Flex>
                                  </Flex>
                                </Td>

                                <Td
                                  borderBottomColor={"#bababa"}
                                  fontSize={"14px"}
                                  px={"12px"}
                                >
                                  <Flex>
                                    <Flex
                                      fontWeight={700}
                                      borderRadius={"10px"}
                                      px={"8px"}
                                      py={"4px"}
                                      alignItems={"center"}
                                      gap={"8px"}
                                      bg={bgColor}
                                      color={textColor}
                                    >
                                      <Flex fontSize={"20px"}>{icon}</Flex>
                                      <Flex>{text}</Flex>
                                    </Flex>
                                  </Flex>
                                </Td>

                                <Td
                                  borderBottomColor={"#bababa"}
                                  color={"#848484"}
                                  whiteSpace="normal"
                                  wordBreak="break-word"
                                  px={"12px"}
                                  fontSize={"14px"}
                                >
                                  <Flex>{formatString(val.method)}</Flex>
                                </Td>
                                <Td
                                  borderBottomColor={"#bababa"}
                                  color={"#848484"}
                                  whiteSpace="normal"
                                  wordBreak="break-word"
                                  px={"12px"}
                                  fontSize={"14px"}
                                >
                                  <Flex>{formatString(val.method_info)}</Flex>
                                </Td>
                                <Td
                                  borderBottomColor={"#bababa"}
                                  color={"#848484"}
                                  whiteSpace="normal"
                                  wordBreak="break-word"
                                  px={"12px"}
                                  fontSize={"14px"}
                                >
                                  <Flex>{val.placemark || "-"}</Flex>
                                </Td>
                                <Td
                                  borderBottomColor={"#bababa"}
                                  color={"#006fc4"}
                                  whiteSpace="normal"
                                  wordBreak="break-word"
                                  px={"12px"}
                                  fontSize={"14px"}
                                >
                                  {val.longitude && val.latitude ? (
                                    <Flex>
                                      <ChakraLink
                                        target="_blank"
                                        href={`https://www.google.com/maps?q=${val.longitude},${val.latitude}`}
                                      >
                                        <Flex
                                          gap={"10px"}
                                          alignItems={"center"}
                                        >
                                          <Flex>Map Link</Flex>
                                          <Flex fontSize={"20px"}>
                                            <FaMapLocationDot />
                                          </Flex>
                                        </Flex>
                                      </ChakraLink>
                                    </Flex>
                                  ) : (
                                    "-"
                                  )}
                                </Td>
                              </Tr>
                            );
                          })
                        ) : (
                          <ListEmptyState
                            size={"sm"}
                            colSpan={7}
                            header1={"No history found."}
                            header2={"to begin tracking them."}
                            linkText={"Create an action"}
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
                  handleChange={handleChange}
                  showing={showing}
                  page={"history"}
                />
              </Flex>
            )}
            {lockDetailsMenu == "accessMethods" && (
              <Flex bg={"#f8f9fa"} p={"20px"} gap={"20px"} flexDir={"column"}>
                <Flex gap={"20px"}>
                  <TableContainer
                    flex={1}
                    overflow={"auto"}
                    boxShadow={"0px 0px 3px rgba(50,50,93,0.5)"}
                  >
                    <Table variant="simple">
                      <Thead bg={"#ECEFF3"}>
                        <Tr>
                          <Th borderBottomColor={"#bababa"} px={"12px"}>
                            <Flex alignItems={"center"} gap={"5px"}>
                              <Flex>NFC Tags</Flex>
                              <Flex fontSize={"18px"}>
                                <LuNfc />
                              </Flex>
                            </Flex>
                          </Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {selectedLockDetails?.nfc_tags.length ? (
                          selectedLockDetails?.nfc_tags.map((tag, tagIndex) => (
                            <Tr
                              w={"100%"}
                              bg={tagIndex % 2 ? "white" : "#f8f9fa"}
                            >
                              <Td
                                px={"12px"}
                                borderBottomColor={"#bababa"}
                                color={"#848484"}
                                overflowWrap="break-word"
                                maxWidth="50px"
                                whiteSpace="normal"
                                fontSize={"14px"}
                              >
                                <Flex fontSize={"14px"}>
                                  {tag.name + " - " + tag.tag_id}
                                </Flex>
                              </Td>
                            </Tr>
                          ))
                        ) : (
                          <ListEmptyState
                            size={"xs"}
                            colSpan={7}
                            header1={"No NFC tag found."}
                            header2={"assign one to begin tracking them"}
                            linkText={"Create an action"}
                          />
                        )}
                      </Tbody>
                    </Table>
                  </TableContainer>
                  <TableContainer
                    flex={1}
                    overflow={"auto"}
                    boxShadow={"0px 0px 3px rgba(50,50,93,0.5)"}
                  >
                    <Table variant="simple">
                      <Thead bg={"#ECEFF3"}>
                        <Tr>
                          <Th borderBottomColor={"#bababa"} px={"12px"}>
                            <Flex alignItems={"center"} gap={"5px"}>
                              <Flex>Directional Passcodes</Flex>
                              <Flex fontSize={"18px"}>
                                <BsDpadFill />
                              </Flex>
                            </Flex>
                          </Th>
                        </Tr>
                      </Thead>

                      <Tbody>
                        {selectedLockDetails?.directional_passcodes.length ? (
                          selectedLockDetails?.directional_passcodes.map(
                            (passcode, passcodeIndex) => (
                              <Tr
                                w={"100%"}
                                bg={passcodeIndex % 2 ? "white" : "#f8f9fa"}
                              >
                                <Td
                                  px={"12px"}
                                  borderBottomColor={"#bababa"}
                                  color={"#848484"}
                                  overflowWrap="break-word"
                                  maxWidth="50px"
                                  whiteSpace="normal"
                                  fontSize={"14px"}
                                >
                                  <Flex alignItems={"center"}>
                                    <Flex fontSize={"14px"}>
                                      {passcode.name}
                                    </Flex>
                                  </Flex>
                                </Td>
                              </Tr>
                            )
                          )
                        ) : (
                          <ListEmptyState
                            size={"xs"}
                            colSpan={7}
                            header1={"No directional passcode found."}
                            header2={"assign one to begin tracking them"}
                            linkText={"Create an action"}
                          />
                        )}
                      </Tbody>
                    </Table>
                  </TableContainer>
                </Flex>
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
  );
}
