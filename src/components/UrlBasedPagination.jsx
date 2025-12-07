import {
  Button,
  Flex,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  useDisclosure,
} from "@chakra-ui/react";
import {
  FaAngleLeft,
  FaAngleRight,
  FaAnglesLeft,
  FaAnglesRight,
  FaCaretDown,
} from "react-icons/fa6";

export default function UrlBasedPagination({
  // setCurrentPage,
  updateSearchParams,
  totalPages,
  currentPage,
  from,
  rows,
  handleChange,
  showing,
  page,
}) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const handleFirstPage = () => updateSearchParams({ page: 1 });
  const handleLastPage = () => updateSearchParams({ page: totalPages });
  const handlePrevious = () =>
    updateSearchParams({ page: Math.max(currentPage - 1, 1) });
  const handleNext = () =>
    updateSearchParams({ page: Math.min(currentPage + 1, totalPages) });

  const getPageNumbers = () => {
    const pageNumbers = [];
    if (totalPages <= 3) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      if (currentPage <= 2) {
        pageNumbers.push(1, 2, 3);
      } else if (currentPage >= totalPages - 1) {
        pageNumbers.push(totalPages - 2, totalPages - 1, totalPages);
      } else {
        pageNumbers.push(currentPage - 1, currentPage, currentPage + 1);
      }
    }
    return pageNumbers;
  };

  const handleRowsChange = (newRows) => {
    onClose();
    handleChange({ target: { value: newRows, id: "row" } });
    // const newTotalPages = Math.ceil(showing?.total / newRows);

    // if (currentPage > newTotalPages) {
    //   updateSearchParams({ page: newTotalPages || 1 });
    // }
  };
  return (
    <Flex
      position={"relative"}
      width="100%"
      align="center"
      justify="space-between"
    >
      {/* <Flex
        onClick={() => {
          console.log(showing);
          console.log(from);
          console.log(totalPages);
          console.log(currentPage);
          console.log(rows);
          console.log(handleChange);
        }}
      >
        saldasldsalld
      </Flex> */}
      <Flex>
        {page !== "activitiesUser" && page !== "history" && (
          <Menu isOpen={isOpen} onClose={onClose}>
            <MenuButton
              as={Button}
              onClick={onOpen}
              borderRadius="20px"
              border="1px solid #9F9F9F"
              color="#9F9F9F"
              background="transparent"
              opacity={0.5}
              _hover={{ opacity: 1 }}
              _active={{ opacity: 1, bg: "transparent" }}
              fontSize={"14px"}
              px="15px"
              py="0px"
              rightIcon={<FaCaretDown />}
            >
              {rows ?? "All"}
            </MenuButton>
            <MenuList display={isOpen ? "block" : "none"}>
              <MenuItem onClick={() => handleRowsChange(10)}>10</MenuItem>
              <MenuItem onClick={() => handleRowsChange(20)}>20</MenuItem>
              <MenuItem onClick={() => handleRowsChange(100)}>100</MenuItem>
              <MenuItem onClick={() => handleRowsChange("All")}>All</MenuItem>
            </MenuList>
          </Menu>
        )}
      </Flex>
      <Flex
        position="absolute"
        top="50%"
        left="50%"
        transform="translate(-50%, -50%)"
        textAlign={"center"}
        fontWeight={400}
        fontSize={"14px"}
        color={"#848484"}
      >
        Showing {from} to {showing?.current || "0"} out of{" "}
        {showing?.total || "0"} Results
      </Flex>
      {totalPages ? (
        <Flex textAlign={"right"} fontSize={"14px"} gap={"4px"}>
          <Button
            px={"8px"}
            onClick={handleFirstPage}
            // isDisabled={currentPage === 1}
            display={currentPage > 2 ? "block" : "none"}
            borderRadius={"40px"}
            border={"1px solid #E3EAF1"}
            bg={"transparent"}
            color={"#C22223"}
          >
            <Flex justify={"center"}>
              <FaAnglesLeft />
            </Flex>
          </Button>
          <Button
            px={"8px"}
            onClick={handlePrevious}
            // isDisabled={currentPage === 1}
            display={currentPage > 1 ? "block" : "none"}
            border={"1px solid #E3EAF1"}
            borderRadius={"50px"}
            color={"#C22223"}
            bg={"transparent"}
          >
            <Flex justify={"center"}>
              <FaAngleLeft />
            </Flex>
          </Button>
          {getPageNumbers().map((page) => (
            <Button
              px={"8px"}
              key={page}
              onClick={() => updateSearchParams({ page: page })}
              borderRadius="100px"
              color={currentPage === page ? "white" : "#C22223"}
              variant={currentPage === page ? "solid" : "outline"}
              bg={currentPage === page ? "#C22223" : "transparent"}
              cursor={currentPage === page ? "default" : "pointer"}
              _hover={{
                bg: currentPage === page ? "#C22223" : "gray.200",
                cursor: currentPage === page ? "default" : "pointer",
                color: currentPage === page ? "white" : "#C22223",
              }}
              _active={{
                bg: currentPage === page ? "#C22223" : "gray.200",
                cursor: currentPage === page ? "default" : "pointer",
                color: currentPage === page ? "white" : "#C22223",
              }}
            >
              {page}
            </Button>
          ))}
          <Button
            px={"8px"}
            onClick={handleNext}
            // isDisabled={currentPage === totalPages}
            display={currentPage === totalPages ? "none" : "block"}
            border={"1px solid #E3EAF1"}
            color={"#C22223"}
            bg={"transparent"}
            justifyContent={"center"}
            borderRadius={"50px"}
          >
            <Flex justify={"center"}>
              <FaAngleRight />
            </Flex>
          </Button>
          <Button
            px={"8px"}
            onClick={handleLastPage}
            display={currentPage < totalPages - 1 ? "block" : "none"}
            // display={currentPage === totalPages ? "none" : "block"}
            // isDisabled={currentPage === totalPages}
            color={"#C22223"}
            justifyContent={"center"}
            border={"1px solid #E3EAF1"}
            borderRadius={"40px"}
            bg={"transparent"}
          >
            <Flex justify={"center"}>
              <FaAnglesRight />
            </Flex>
          </Button>
        </Flex>
      ) : (
        ""
      )}
    </Flex>
  );
}
