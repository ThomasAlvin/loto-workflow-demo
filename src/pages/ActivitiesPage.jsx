import {
  Avatar,
  Center,
  Flex,
  Input,
  InputGroup,
  InputLeftElement,
  Spinner,
  Table,
  TableContainer,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
} from "@chakra-ui/react";
import { FaUserAlt } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useCallback, useEffect, useState } from "react";
import { api } from "../api/api";
import labelizeRole from "../utils/labelizeRole";
import { debounce } from "lodash";
import { IoMdSearch } from "react-icons/io";
import ListEmptyState from "../components/ListEmptyState";
import Pagination from "../components/Pagination";
import moment from "moment";
import convertTableToRoute from "../utils/convertTableToRoute";
import tableStatusStyleMapper from "../utils/tableStatusStyleMapper";

export default function ActivitiesPage() {
  const nav = useNavigate();
  const [from, setFrom] = useState();
  const [rows, setRows] = useState(10);
  const [showing, setShowing] = useState(0);
  const [totalPages, setTotalPages] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const IMGURL = import.meta.env.VITE_API_IMAGE_URL;
  const [activities, setActivities] = useState([]);
  const [searchInput, setSearchInput] = useState("");
  const [tableLoading, setTableLoading] = useState(true);
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
  async function fetchActivities(controller) {
    setTableLoading(true);
    await api
      .get(
        `activity/pagination?search=${searchInput}&page=${currentPage}
          &rows=${rows}`,
        { signal: controller.signal }
      )
      .then((response) => {
        setActivities(response.data.data);
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

  const handleChange = (e) => {
    const { value, id } = e.target;
    if (id === "row") {
      setRows(value);
    } else {
      debouncedSearch(value);
    }
  };

  useEffect(() => {
    const controller = new AbortController();
    fetchActivities(controller);

    return () => {
      controller.abort(); // Cleanup previous fetch request before new one starts
    };
  }, [searchInput, currentPage, rows]);
  return (
    // <PageLayout>
    <Flex w={"100%"} flexDir={"column"} px={"30px"} py={"20px"} gap={"20px"}>
      <Flex fontSize={"28px"} color={"#dc143c"} fontWeight={700}>
        Activities
      </Flex>
      <Flex h={"2px"} bg={"#bababa"}></Flex>

      <Flex alignItems={"center"} justify={"end"}>
        <Flex gap={"20px"}>
          <Flex>
            <InputGroup>
              <InputLeftElement pointerEvents="none">
                <IoMdSearch color="#848484" fontSize={"20px"} />
              </InputLeftElement>
              <Input
                boxShadow={"0px 0px 3px rgba(50,50,93,0.5)"}
                placeholder="Search activity"
                onChange={(event) => {
                  setTableLoading(true);
                  handleChange(event);
                }}
              ></Input>
            </InputGroup>
          </Flex>
        </Flex>{" "}
      </Flex>
      {tableLoading ? (
        <Center
          flexDir={"column"}
          alignItems={"center"}
          gap={"20px"}
          height="500px"
          opacity={1}
        >
          <Spinner thickness="4px" size="xl" color="#dc143c" />
          <Center flexDir={"column"} color={"#dc143c"} fontWeight={700}>
            <Flex fontWeight={700} fontSize={"20px"}>
              Loading
            </Flex>
            <Flex color={"black"}>Processing your request...</Flex>
          </Center>
        </Center>
      ) : (
        <TableContainer boxShadow={"0px 0px 3px rgba(50,50,93,0.5)"}>
          <Table variant="simple">
            <Thead bg={"#ECEFF3"}>
              <Tr>
                {/* <Th borderBottomColor={"#bababa"}>No</Th> */}
                <Th borderBottomColor={"#bababa"}>Date & Time</Th>
                <Th borderBottomColor={"#bababa"}>User</Th>
                <Th borderBottomColor={"#bababa"}>IP Address</Th>
                <Th borderBottomColor={"#bababa"}>Action</Th>
                <Th borderBottomColor={"#bababa"}>Description</Th>
              </Tr>
            </Thead>
            <Tbody>
              {activities.length ? (
                activities.map((val, index) => {
                  const { bgColor, icon, textColor, text } =
                    tableStatusStyleMapper(val.action);
                  return (
                    <Tr w={"100%"} bg={index % 2 ? "white" : "#f8f9fa"}>
                      {/* <Td borderBottomColor={"#bababa"} fontWeight={700}>
                        {index + from}.
                      </Td> */}
                      <Td borderBottomColor={"#bababa"} color={"#848484"}>
                        {moment(val.created_at).format("MMM DD YYYY, hh:mm A")}
                      </Td>
                      <Td borderBottomColor={"#bababa"}>
                        <Flex alignItems={"center"} gap={"10px"}>
                          {/* <Flex
                              bg={"#848484"}
                              w={"40px"}
                              h={"40px"}
                              borderRadius={"100px"}
                            ></Flex> */}
                          {val.first_name ? (
                            <Avatar
                              outline={"1px solid #dc143c"}
                              border={"2px solid white"}
                              name={val.first_name + " " + val.last_name}
                              src={
                                val.profile_image_url
                                  ? IMGURL + val.profile_image_url
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
                            <Flex fontWeight={700}>
                              {val.first_name + " " + val.last_name}
                            </Flex>
                            <Flex fontSize={"14px"} color={"#848484"}>
                              {labelizeRole(val.role)}
                            </Flex>
                          </Flex>
                        </Flex>
                      </Td>
                      <Td borderBottomColor={"#bababa"} color={"#848484"}>
                        {val.ip_address}
                      </Td>

                      <Td borderBottomColor={"#bababa"}>
                        <Flex>
                          <Flex
                            fontWeight={700}
                            borderRadius={"10px"}
                            px={"8px"}
                            py={"4px"}
                            alignItems={"center"}
                            gap={"8px"}
                            bg={bgColor}
                            fontSize={"16px"}
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
                        // color={"#292D3F"}
                        whiteSpace="normal" // Allow text to break
                        wordBreak="break-word"
                      >
                        <Flex
                          w={"fit-content"}
                          cursor={
                            val.action === "delete"
                              ? ""
                              : convertTableToRoute(
                                  val.table_name,
                                  val.resource_UID
                                )
                              ? "pointer"
                              : "default"
                          }
                          _hover={
                            val.action === "delete"
                              ? ""
                              : convertTableToRoute(
                                  val.table_name,
                                  val.resource_UID
                                )
                              ? { color: "#dc143c" }
                              : {}
                          }
                          onClick={
                            val.action === "delete"
                              ? ""
                              : () => {
                                  convertTableToRoute(
                                    val.table_name,
                                    val.resource_UID
                                  )
                                    ? nav(
                                        convertTableToRoute(
                                          val.table_name,
                                          val.resource_UID
                                        )
                                      )
                                    : "";
                                }
                          }
                        >
                          {val.description}
                        </Flex>
                      </Td>
                    </Tr>
                  );
                })
              ) : (
                <ListEmptyState
                  colSpan={6}
                  header1={"No activities found."}
                  header2={"to begin tracking them."}
                  // link={"/user/create"}
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
        rows={rows}
        handleChange={handleChange}
        showing={showing}
      />
    </Flex>
    // </PageLayout>
  );
}
