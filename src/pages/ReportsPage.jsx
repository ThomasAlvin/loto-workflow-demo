import {
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
  Tooltip,
  Tr,
} from "@chakra-ui/react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { IoCheckmarkSharp, IoWarning } from "react-icons/io5";
import { IoMdSearch } from "react-icons/io";
import { useCallback, useEffect, useState } from "react";
import { api } from "../api/api";
import moment from "moment";
import { debounce } from "lodash";
import { LuCopy } from "react-icons/lu";
import TableStatusStyleMapper from "../utils/tableStatusStyleMapper";
import ReportMenu from "../components/Report/ReportMenu";
import ListEmptyState from "../components/ListEmptyState";
import SwalErrorMessages from "../components/SwalErrorMessages";
import { FaMapLocationDot } from "react-icons/fa6";
import formatString from "../utils/formatString";
import UrlBasedPagination from "../components/UrlBasedPagination";
import Swal from "sweetalert2";
export default function ReportsPage() {
  const nav = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const statusFilterSelection = ["completed", "ongoing", "draft", "overdue"];
  const location = useLocation();

  const [from, setFrom] = useState();
  const [showing, setShowing] = useState(0);
  const [reports, setReports] = useState([]);
  const [totalPages, setTotalPages] = useState(null);
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
  const [tableLoading, setTableLoading] = useState(true);
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

  function updateSearchParams(updates) {
    setSearchParams((prev) => {
      const params = new URLSearchParams(prev); // clone existing params
      Object.entries(updates).forEach(([key, value]) => {
        if (value) {
          console.log(key);
          console.log(value);
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
  async function deleteReport(UID) {
    await api
      .delete(`report/${UID}`)
      .then((response) => {
        Swal.fire({
          title: "Success!",
          text: response?.data?.message,
          icon: "success",
          customClass: {
            popup: "swal2-custom-popup",
            title: "swal2-custom-title",
            content: "swal2-custom-content",
            actions: "swal2-custom-actions",
            confirmButton: "swal2-custom-confirm-button",
          },
        });
        abortControllerRef.current.abort(); // Cancel any previous request
        abortControllerRef.current = new AbortController();
        fetchMembers();
      })
      .catch((error) => {
        Swal.fire({
          title: "Oops...",
          icon: "error",
          html: SwalErrorMessages(error.response.data.message),
          customClass: {
            popup: "swal2-custom-popup",
            title: "swal2-custom-title",
            content: "swal2-custom-content",
            actions: "swal2-custom-actions",
            confirmButton: "swal2-custom-confirm-button",
          },
        });
        console.error(error);
      });
  }
  async function fetchReport(controller) {
    setTableLoading(true);
    await api
      .get(
        `report/pagination?search=${searchFilter}&page=${currentPage}&rows=${rows}&status=${statusFilter}`,
        { signal: controller.signal }
      )
      .then((response) => {
        setReports(response.data.data);
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
        setTableLoading(false);
      });
  }
  const resetCopySuccess = useCallback(
    debounce((index) => {
      setReports((prevState) =>
        prevState.map((state, stateIndex) => {
          if (index === stateIndex) {
            return { ...state, copySuccess: false };
          }
          return state;
        })
      );
    }, 5000), // Adjust the delay as needed
    []
  );
  function handleCopy(text, index) {
    navigator.clipboard.writeText(text).then(
      () => {
        setReports((prevState) =>
          prevState.map((state, stateIndex) => {
            if (index === stateIndex) {
              return { ...state, copySuccess: true };
            }
            return state;
          })
        );
        resetCopySuccess(index);
      },
      (err) => {
        console.log(err);
      }
    );
  }
  function statusHandler(event) {
    const { id } = event.target;
    updateSearchParams({ page: 1, status: id });
  }
  function truncateString(str, maxLength) {
    return str.length > maxLength ? str.substring(0, maxLength) + "..." : str;
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
    const controller = new AbortController();
    fetchReport(controller);

    return () => {
      controller.abort(); // Cleanup previous fetch request before new one starts
    };
  }, [searchFilter, statusFilter, currentPage, rows]);
  return (
    <Flex w={"100%"} flexDir={"column"} px={"30px"} py={"20px"} gap={"20px"}>
      <Flex
        onClick={() => {
          console.log(reports);
        }}
        fontSize={"28px"}
        color={"#dc143c"}
        fontWeight={700}
      >
        Report List
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
          All Reports
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
            {formatString(statusOption)}
          </Flex>
        ))}
      </Flex>
      <Flex justify={"right"} gap={"20px"}>
        <Flex>
          <InputGroup>
            <InputLeftElement pointerEvents="none">
              <IoMdSearch color="#848484" fontSize={"20px"} />
            </InputLeftElement>
            <Input
              defaultValue={searchFilter}
              boxShadow={"0px 0px 3px rgba(50,50,93,0.5)"}
              placeholder="Search reports..."
              onChange={(event) => {
                setTableLoading(true);
                handleChange(event);
              }}
            ></Input>
          </InputGroup>
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
                  borderBottomColor={"#bababa"}
                  fontWeight={700}
                  px={"16px"}
                  fontSize={"12px"}
                >
                  No
                </Th>
                <Th
                  borderBottomColor={"#bababa"}
                  fontWeight={700}
                  px={"16px"}
                  fontSize={"12px"}
                >
                  Report
                </Th>
                <Th
                  borderBottomColor={"#bababa"}
                  fontWeight={700}
                  px={"16px"}
                  fontSize={"12px"}
                >
                  Report ID
                </Th>
                <Th
                  borderBottomColor={"#bababa"}
                  fontWeight={700}
                  px={"16px"}
                  fontSize={"12px"}
                >
                  Status
                </Th>
                <Th
                  borderBottomColor={"#bababa"}
                  fontWeight={700}
                  px={"16px"}
                  fontSize={"12px"}
                >
                  Work Site
                </Th>
                <Th
                  borderBottomColor={"#bababa"}
                  fontWeight={700}
                  px={"16px"}
                  fontSize={"12px"}
                >
                  Completion Time
                </Th>
                <Th
                  borderBottomColor={"#bababa"}
                  fontWeight={700}
                  px={"16px"}
                  fontSize={"12px"}
                >
                  Deadline
                </Th>

                <Th
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
              {reports.length ? (
                reports.map((val, index) => {
                  const { bgColor, textColor, icon, text } =
                    TableStatusStyleMapper(val.status);
                  return (
                    <Tr
                      onClick={() => {
                        nav(`/report/${val.UID}${location.search}`);
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
                      <Td
                        fontSize={"14px"}
                        borderBottomColor={"#bababa"}
                        px={"16px"}
                      >
                        <Flex alignItems={"center"} gap={"10px"}>
                          <Flex flexDir={"column"}>
                            <Flex
                              display={"inline-block"}
                              overflow={"hidden"}
                              textOverflow={"ellipsis"}
                              maxW={"240px"}
                              whiteSpace={"nowrap"}
                              fontWeight={700}
                            >
                              {val.name}
                            </Flex>
                            <Flex color={"#848484"}>
                              {moment(val.created_at).format(
                                "MMMM Do YYYY, hh:mm A"
                              )}
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
                        <Flex gap={"10px"} alignItems={"center"}>
                          <Flex
                            display={"inline-block"}
                            overflow={"hidden"}
                            textOverflow={"ellipsis"}
                            maxW={"240px"}
                            whiteSpace={"nowrap"}
                          >
                            {truncateString(val.report_custom_id, 22)}
                          </Flex>
                          <Flex
                            position={"relative"}
                            alignItems={"center"}
                            gap={"5px"}
                            color={val?.copySuccess ? "#048027" : "#848484"}
                          >
                            <Flex
                              cursor={"pointer"}
                              onClick={() => {
                                handleCopy(val.report_custom_id, index);
                              }}
                              fontSize={"20px"}
                              _hover={{ color: "black" }}
                            >
                              <Tooltip
                                hasArrow
                                placement="top"
                                label={"Copy to clipboard"}
                              >
                                <Flex>
                                  <LuCopy />
                                </Flex>
                              </Tooltip>
                            </Flex>
                            {val?.copySuccess ? (
                              <Flex
                                position={"absolute"}
                                right={"-28px"}
                                fontSize={"20px"}
                                fontWeight={700}
                              >
                                <IoCheckmarkSharp />
                              </Flex>
                            ) : (
                              ""
                            )}
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
                        px={"16px"}
                        borderBottomColor={"#bababa"}
                        color={"#292D3F"}
                      >
                        <Flex alignItems={"center"} gap={"5px"}>
                          <Flex color={"#dc143c"} fontSize={"18px"}>
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
                        px={"16px"}
                        borderBottomColor={"#bababa"}
                        color={"#292D3F"}
                      >
                        <Flex
                          color={val.status === "overdue" ? "#dc143c" : "black"}
                          fontWeight={700}
                          position={"relative"}
                        >
                          {val.status === "overdue" ? (
                            <Tooltip
                              label={
                                "This work order was completed past its deadline."
                              }
                              hasArrow
                              placement="top"
                              bg={"#dc143c"}
                            >
                              <Flex
                                fontSize={"16px"}
                                left={"-20px"}
                                top={"3px"}
                                position={"absolute"}
                              >
                                <IoWarning />
                              </Flex>
                            </Tooltip>
                          ) : (
                            ""
                          )}
                          {moment(val.finished_at).format("YYYY-MM-DD")}
                        </Flex>
                        <Flex color={"#848484"} fontSize={"14px"}>
                          {moment(val.finished_at).format("hh:mm A")}
                        </Flex>
                      </Td>
                      <Td
                        px={"16px"}
                        borderBottomColor={"#bababa"}
                        color={"#292D3F"}
                      >
                        <Flex fontWeight={700}>
                          {moment(val.deadline_date_time).format("YYYY-MM-DD")}
                        </Flex>
                        <Flex color={"#848484"} fontSize={"14px"}>
                          {moment(val.deadline_date_time).format("hh:mm A")}
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
                          p={"16px"}
                          h={"100%"}
                          borderLeft={"1px solid #bababa"}
                          justify={"center"}
                          alignItems={"center"}
                        >
                          <ReportMenu
                            reportUID={val.UID}
                            reportName={val.name}
                            deleteReport={deleteReport}
                          />
                        </Flex>
                      </Td>
                    </Tr>
                  );
                })
              ) : (
                <ListEmptyState
                  colSpan={8}
                  header1={"There are no reports available."}
                  header2={"Report will appear here when available."}
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
    </Flex>
  );
}
