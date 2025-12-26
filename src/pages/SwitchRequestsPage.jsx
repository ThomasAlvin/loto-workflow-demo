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
  useDisclosure,
} from "@chakra-ui/react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { IoMdSearch } from "react-icons/io";
import { useCallback, useEffect, useRef, useState } from "react";
import { api } from "../api/api";
import { debounce } from "lodash";
import ListEmptyState from "../components/ListEmptyState";
import tableStatusStyleMapper from "../utils/tableStatusStyleMapper";
import moment from "moment";
import SwitchRequestMenu from "../components/SwitchRequest/SwitchRequestMenu";
import SwitchRequestDetailModal from "../components/SwitchRequest/SwitchRequestDetailModal";
import labelizeRole from "../utils/labelizeRole";
import { FaUserAlt } from "react-icons/fa";
import formatString from "../utils/formatString";
import UrlBasedPagination from "../components/UrlBasedPagination";
export default function SwitchRequestsPage() {
  const abortControllerRef = useRef(new AbortController()); // Persistent controller
  const [searchParams, setSearchParams] = useSearchParams();
  const statusFilterSelection = ["pending", "approved", "rejected", "skipped"];

  const nav = useNavigate();
  const switchRequestDetailDisclosure = useDisclosure();
  const [from, setFrom] = useState();
  // const [rows, setRows] = useState(10);
  const [showing, setShowing] = useState(0);
  const [totalPages, setTotalPages] = useState(null);
  // const [currentPage, setCurrentPage] = useState(1);
  const currentPage = totalPages
    ? Math.min(Number(searchParams.get("page")) || 1, totalPages)
    : Number(searchParams.get("page")) || 1;
  const searchFilter = searchParams.get("search") || "";
  const statusFilter = statusFilterSelection.includes(
    searchParams.get("status")
  )
    ? searchParams.get("status")
    : "";
  const rows = searchParams.get("rows") || 10;
  // const [statusFilter, setStatusFilter] = useState("");
  const [switchRequest, setSwitchRequest] = useState([]);
  const [tableLoading, setTableLoading] = useState(true);
  const [selectedUID, setSelectedUID] = useState([]);
  const [selectedSwitchRequest, setSelectedSwitchRequest] = useState(false);
  const [memberSelection, setMemberSelection] = useState([]);

  const checkedOnPage = selectedUID.filter((uid) =>
    switchRequest.map((lock) => lock.UID).includes(uid)
  );
  const allChecked =
    checkedOnPage.length === switchRequest.map((lock) => lock.UID).length &&
    switchRequest.map((lock) => lock.UID).length > 0;

  const isIndeterminate = checkedOnPage.length > 0 && !allChecked;

  const debouncedSearch = useCallback(
    debounce((value) => {
      if (searchFilter === value) {
        setTableLoading(false);
      } else {
        updateSearchParams({ page: 1, search: value });
      }
    }, 1000),
    [searchParams]
  );
  function resetSelected(e) {
    setSelectedUID([]);
  }
  function updateSearchParams(updates) {
    setSearchParams((prev) => {
      const params = new URLSearchParams(prev); // clone existing params
      Object.entries(updates).forEach(([key, value]) => {
        if (value) {
          if (key === "page" && value === 1) {
            params.delete(key);
          } else {
            params.set(key, value);
          }
        } else {
          params.delete(key);
        }
      });
      return params;
    });
  }
  function statusHandler(event) {
    const { id } = event.target;
    updateSearchParams({ page: 1, status: id });
  }
  async function fetchSwitchRequest() {
    setTableLoading(true);
    const localAbortController = abortControllerRef.current;

    await api
      .getSwitchRequestPagination()
      .then((response) => {
        setSwitchRequest(response.data.data);
        setFrom(response.data.from);
        setTotalPages(response.data.last_page);
        setShowing({
          current: response.data.to,
          total: response.data.total,
        });
        if (currentPage > response.data.last_page)
          updateSearchParams({ page: response.data.last_page });
      })
      .catch((error) => {
        console.log(error);
      })
      .finally(() => {
        if (localAbortController === abortControllerRef.current) {
          setTableLoading(false);
        }
      });
  }
  async function fetchMembers(controller) {
    await api
      .getMembers()
      .then((response) => {
        setMemberSelection(
          response.data.members.map((val) => ({
            ...val,
            memberId: val.id,
            label: val.user.first_name + " " + val.user.last_name,
            value: val.id,
          }))
        );
      })
      .catch((error) => {
        console.log(error);
      });
  }
  useEffect(() => {
    const controller = new AbortController();
    fetchMembers(controller);

    return () => {
      controller.abort();
    };
  }, []);
  function handleOpenSwitchRequestDetailModal(UID) {
    switchRequestDetailDisclosure.onOpen();
    const filteredSwitchRequest = switchRequest.find((val) => val.UID === UID);
    setSelectedSwitchRequest(filteredSwitchRequest);
  }

  const handleChange = (e) => {
    const { value, id } = e.target;
    if (id === "row") {
      const newTotalPages = Math.ceil(showing?.total / value);
      if (currentPage > newTotalPages) {
        updateSearchParams({ rows: value, page: newTotalPages || 1 });
      } else {
        updateSearchParams({ rows: value });
      }
    } else {
      debouncedSearch(value);
    }
  };

  useEffect(() => {
    abortControllerRef.current = new AbortController();
    fetchSwitchRequest();

    return () => {
      abortControllerRef.current.abort(); // Cleanup on unmount
    };
  }, [searchFilter, statusFilter, currentPage, rows]);
  return (
    <Flex w={"100%"} flexDir={"column"} px={"30px"} py={"20px"} gap={"20px"}>
      <Flex flexDir={"column"}>
        <Flex fontSize={"28px"} color={"#dc143c"} fontWeight={700}>
          Switch Requests List
        </Flex>
      </Flex>
      <Flex fontWeight={700} borderBottom={"2px solid #bababa"}>
        <Flex
          cursor={"pointer"}
          borderBottom={!statusFilter ? "3px solid #dc143c" : ""}
          color={!statusFilter ? "black" : "#848484"}
          px={"10px"}
          py={"2px"}
          onClick={statusHandler}
        >
          All Requests
        </Flex>
        {statusFilterSelection.map((statusOption) => (
          <Flex
            id={statusOption}
            cursor={"pointer"}
            borderBottom={
              statusFilter === statusOption ? "3px solid #dc143c" : ""
            }
            color={statusFilter === statusOption ? "black" : "#848484"}
            px={"10px"}
            py={"2px"}
            onClick={statusHandler}
          >
            {formatString(statusOption)}{" "}
          </Flex>
        ))}
      </Flex>
      <Flex justify={"end"}>
        <Flex gap={"20px"}>
          <Flex>
            <InputGroup>
              <InputLeftElement pointerEvents="none">
                <IoMdSearch color="#848484" fontSize={"20px"} />
              </InputLeftElement>
              <Input
                defaultValue={searchFilter}
                boxShadow={"0px 0px 3px rgba(50,50,93,0.5)"}
                placeholder="Search requests..."
                onChange={(event) => {
                  setTableLoading(true);
                  handleChange(event);
                }}
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
          <Table h={"1px"} variant="simple">
            <Thead bg={"#ECEFF3"}>
              <Tr>
                <Th
                  px={"16px"}
                  borderBottomColor={"#bababa"}
                  fontWeight={700}
                  fontSize={"12px"}
                >
                  No
                </Th>
                <Th
                  px={"16px"}
                  borderBottomColor={"#bababa"}
                  fontWeight={700}
                  fontSize={"12px"}
                >
                  Work Order
                </Th>
                <Th
                  px={"16px"}
                  borderBottomColor={"#bababa"}
                  fontWeight={700}
                  fontSize={"12px"}
                >
                  Requested by
                </Th>
                <Th
                  borderBottomColor={"#bababa"}
                  fontWeight={700}
                  fontSize={"12px"}
                >
                  Status
                </Th>

                <Th
                  px={"16px"}
                  borderBottomColor={"#bababa"}
                  fontWeight={700}
                  fontSize={"12px"}
                >
                  Requested at
                </Th>
                <Th
                  px={"16px"}
                  textAlign={"center"}
                  borderBottomColor={"#848484"}
                  fontWeight={700}
                  fontSize={"12px"}
                  position="sticky"
                  right="0"
                  bg={"#eceff3"}
                  p={"0px"}
                >
                  <Flex
                    p={"16px"}
                    h={"100%"}
                    borderLeft={"1px solid #bababa"}
                    justify={"center"}
                    alignItems={"center"}
                  >
                    Action
                  </Flex>
                </Th>
              </Tr>
            </Thead>
            <Tbody>
              {switchRequest?.length ? (
                switchRequest?.map((val, index) => {
                  const statusTag = tableStatusStyleMapper(
                    "review-" + val.status
                  );
                  const requester = val.requester_super_admin?.id
                    ? val.requester_super_admin
                    : {
                        ...val.requester_member,
                        first_name: val.requester_member.user.first_name,
                        last_name: val.requester_member.user.last_name,
                        profile_image_url:
                          val.requester_member.user.profile_image_url,
                      };
                  return (
                    <Tr
                      onClick={() => {
                        handleOpenSwitchRequestDetailModal(val.UID);
                      }}
                      cursor={"pointer"}
                      _hover={{ background: "#f5f5f5" }}
                      fontSize={"14px"}
                    >
                      <Td
                        px={"16px"}
                        borderBottomColor={"#bababa"}
                        fontWeight={700}
                      >
                        {index + from}.
                      </Td>
                      <Td px={"16px"} borderBottomColor={"#bababa"}>
                        <Flex flexDir={"column"}>
                          <Flex onClick={(e) => e.stopPropagation()}>
                            <Link to={`/work-order/${val.work_order.UID}`}>
                              <Flex
                                display={"inline-block"}
                                overflow={"hidden"}
                                lineHeight="1"
                                textOverflow={"ellipsis"}
                                maxW={"240px"}
                                whiteSpace={"nowrap"}
                                _hover={{ textDecor: "underline" }}
                                fontWeight={700}
                              >
                                {val.work_order.name}
                              </Flex>
                            </Link>
                          </Flex>
                          <Flex
                            display={"inline-block"}
                            textOverflow={"ellipsis"}
                            overflow={"hidden"}
                            fontSize={"13px"}
                            color={"#848484"}
                            // maxW={"200px"}
                          >
                            {val.work_order.work_order_custom_id}
                          </Flex>
                        </Flex>
                      </Td>
                      <Td
                        px={"16px"}
                        borderBottomColor={"#bababa"}
                        color={"#292D3F"}
                        fontWeight={700}
                      >
                        <Flex alignItems={"center"} gap={"10px"}>
                          {requester?.first_name ? (
                            <Avatar
                              outline={"1px solid #dc143c"}
                              border={"2px solid white"}
                              name={
                                requester?.first_name +
                                " " +
                                requester?.last_name
                              }
                              src={
                                requester?.profile_image_url
                                  ? requester?.profile_image_url
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
                            <Flex
                              display={"inline-block"}
                              overflow={"hidden"}
                              textOverflow={"ellipsis"}
                              maxW={"200px"}
                              whiteSpace={"nowrap"}
                            >
                              {requester?.first_name +
                                " " +
                                requester?.last_name}
                            </Flex>
                            <Flex
                              fontWeight={400}
                              fontSize={"14px"}
                              color={"#848484"}
                            >
                              {val?.requester_super_admin?.id
                                ? "Super Admin"
                                : labelizeRole(val?.requester_member?.role) +
                                  " - " +
                                  val?.requester_member?.employee_id}
                            </Flex>
                          </Flex>
                        </Flex>
                      </Td>
                      <Td
                        px={"16px"}
                        borderBottomColor={"#bababa"}
                        color={"#292D3F"}
                        fontWeight={700}
                      >
                        <Flex>
                          <Flex
                            borderRadius={"10px"}
                            px={"8px"}
                            py={"4px"}
                            alignItems={"center"}
                            gap={"8px"}
                            bg={statusTag.bgColor}
                            color={statusTag.textColor}
                          >
                            <Flex fontSize={"20px"}>{statusTag.icon}</Flex>
                            <Flex>{statusTag.text}</Flex>
                          </Flex>
                        </Flex>
                      </Td>

                      <Td
                        px={"16px"}
                        borderBottomColor={"#bababa"}
                        color={"#292D3F"}
                      >
                        <Flex fontWeight={700}>
                          {moment(val.created_at).format("YYYY-MM-DD")}
                        </Flex>
                        <Flex color={"#848484"} fontSize={"14px"}>
                          {moment(val.created_at).format("hh:mm A")}
                        </Flex>
                      </Td>

                      <Td
                        cursor={"default"}
                        onClick={(e) => {
                          e.stopPropagation();
                        }}
                        borderBottomColor={"#848484"}
                        position="sticky"
                        bg={"#f8f9fa"}
                        right="0"
                        p={"0px"}
                      >
                        <Flex
                          // boxShadow={"0px 0px 3px rgba(50,50,93,0.5)"}
                          p={"16px"}
                          h={"100%"}
                          borderLeft={"1px solid #bababa"}
                          justify={"center"}
                          alignItems={"center"}
                        >
                          <SwitchRequestMenu
                            status={val.status}
                            UID={val.UID}
                            handleOpenSwitchRequestDetailModal={
                              handleOpenSwitchRequestDetailModal
                            }
                          />
                        </Flex>
                      </Td>
                    </Tr>
                  );
                })
              ) : (
                <ListEmptyState
                  colSpan={6}
                  header1={"No approvals found."}
                  header2={"No pending requests at the moment."}
                />
              )}
            </Tbody>
          </Table>
        </TableContainer>
      )}
      <UrlBasedPagination
        updateSearchParams={updateSearchParams}
        totalPages={totalPages}
        currentPage={currentPage}
        rows={rows}
        from={from}
        handleChange={handleChange}
        showing={showing}
      />
      <SwitchRequestDetailModal
        abortControllerRef={abortControllerRef}
        fetchSwitchRequest={fetchSwitchRequest}
        memberSelection={memberSelection}
        selectedSwitchRequest={selectedSwitchRequest}
        onClose={switchRequestDetailDisclosure.onClose}
        isOpen={switchRequestDetailDisclosure.isOpen}
      />
    </Flex>
  );
}
