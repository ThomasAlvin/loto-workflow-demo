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
  Tr,
} from "@chakra-ui/react";
import {
  Link,
  useLocation,
  useNavigate,
  useSearchParams,
} from "react-router-dom";
import { IoMdSearch } from "react-icons/io";
import { useCallback, useEffect, useRef, useState } from "react";
import { api } from "../api/api";
import { debounce } from "lodash";
import ListEmptyState from "../components/ListEmptyState";
import tableStatusStyleMapper from "../utils/tableStatusStyleMapper";
import ReviewMenu from "../components/Review/ReviewMenu";
import moment from "moment";
import formatString from "../utils/formatString";
import UrlBasedPagination from "../components/UrlBasedPagination";
export default function ReviewsAndApprovalsPage() {
  const location = useLocation(); // gives you { pathname, search, ... }

  const pageModule = "reviews";
  const abortControllerRef = useRef(new AbortController()); // Persistent controller
  const [searchParams, setSearchParams] = useSearchParams();

  const statusFilterSelection = ["pending", "approved", "rejected"];

  const nav = useNavigate();

  const [from, setFrom] = useState();
  // const [rows, setRows] = useState(10);
  const [showing, setShowing] = useState(0);
  const [totalPages, setTotalPages] = useState(null);
  // const [currentPage, setCurrentPage] = useState(1);
  const [reviews, setReviews] = useState([]);
  // const [searchInput, setSearchInput] = useState("");
  const [tableLoading, setTableLoading] = useState(true);
  // const [statusFilter, setStatusFilter] = useState("");
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
  const [selectedUID, setSelectedUID] = useState([]);
  const checkedOnPage = selectedUID.filter((uid) =>
    reviews.map((lock) => lock.UID).includes(uid)
  );
  const allChecked =
    checkedOnPage.length === reviews.map((lock) => lock.UID).length &&
    reviews.map((lock) => lock.UID).length > 0;

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
  async function fetchReview() {
    setTableLoading(true);
    const localAbortController = abortControllerRef.current;

    await api
      .getReviewPagination()
      .then((response) => {
        setReviews(response.data.data);
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
    fetchReview();

    return () => {
      abortControllerRef.current.abort(); // Cleanup on unmount
    };
  }, [searchFilter, statusFilter, currentPage, rows]);
  return (
    <Flex w={"100%"} flexDir={"column"} px={"30px"} py={"20px"} gap={"20px"}>
      <Flex flexDir={"column"}>
        <Flex fontSize={"28px"} color={"#dc143c"} fontWeight={700}>
          Reviews List
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
          All Reviews
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
                placeholder="Search reviews..."
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
                  Type
                </Th>
                <Th
                  borderBottomColor={"#bababa"}
                  fontWeight={700}
                  fontSize={"12px"}
                >
                  My Response
                </Th>
                <Th
                  borderBottomColor={"#bababa"}
                  fontWeight={700}
                  fontSize={"12px"}
                >
                  Review Result
                </Th>

                <Th
                  px={"16px"}
                  borderBottomColor={"#bababa"}
                  fontWeight={700}
                  fontSize={"12px"}
                >
                  Started at
                </Th>
                <Th
                  px={"16px"}
                  textAlign={"center"}
                  borderBottomColor={"#bababa"}
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
              {reviews?.length ? (
                reviews?.map((val, index) => {
                  const statusTag = tableStatusStyleMapper(
                    "review-" + val.status
                  );
                  const myResponseTag = tableStatusStyleMapper(
                    "review-" +
                      val.work_order_reviewer?.work_order_reviewer_response
                        ?.status
                  );
                  const typeLabel =
                    val?.work_order_review?.type === "single" ||
                    val.type === "single"
                      ? "Single Approval"
                      : "Multi Approval";
                  return (
                    <Tr
                      onClick={() => {
                        nav(`/review/${val.UID}${location.search}`);
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
                            <Link
                              style={{ lineHeight: "14px" }}
                              to={`/work-order/${
                                val?.work_order_review?.work_order?.UID ||
                                val.work_order.UID
                              }`}
                            >
                              <Flex
                                display={"inline-block"}
                                overflow={"hidden"}
                                textOverflow={"ellipsis"}
                                maxW={"240px"}
                                whiteSpace={"nowrap"}
                                _hover={{ textDecor: "underline" }}
                                fontWeight={700}
                              >
                                {val?.work_order_review?.work_order?.name ||
                                  val.work_order.name}
                              </Flex>
                            </Link>
                          </Flex>
                          <Flex
                            display={"inline-block"}
                            textOverflow={"ellipsis"}
                            overflow={"hidden"}
                            fontSize={"13px"}
                            color={"#848484"}
                            maxW={"200px"}
                          >
                            {val?.work_order_review?.work_order
                              ?.work_order_custom_id ||
                              val.work_order.work_order_custom_id}
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
                            bg={"#e3f4ff"}
                            color={"#19a3ff"}
                          >
                            <Flex>{typeLabel}</Flex>
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
                            bg={myResponseTag.bgColor}
                            color={myResponseTag.textColor}
                          >
                            <Flex fontSize={"20px"}>{myResponseTag.icon}</Flex>
                            <Flex>{myResponseTag.text}</Flex>
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
                        onClick={(e) => e.stopPropagation()}
                        borderBottomColor={"#bababa"}
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
                          <ReviewMenu
                            status={
                              val.work_order_reviewer
                                ?.work_order_reviewer_response?.status
                            }
                            UID={val.UID}
                          />
                        </Flex>
                      </Td>
                    </Tr>
                  );
                })
              ) : (
                <ListEmptyState
                  colSpan={7}
                  header1={"No reviews found."}
                  header2={"No pending reviews at the moment."}
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
