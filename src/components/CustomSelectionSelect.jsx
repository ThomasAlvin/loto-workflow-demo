import {
  Button,
  Center,
  Divider,
  Flex,
  Input,
  InputGroup,
  InputLeftElement,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Spinner,
  useDisclosure,
  useOutsideClick,
} from "@chakra-ui/react";
import { useEffect, useRef, useState } from "react";
import { FaRegTrashAlt } from "react-icons/fa";
import { FaChevronDown, FaPlus } from "react-icons/fa6";
import { RiCloseFill } from "react-icons/ri";
import {
  IoMdClose,
  IoMdCloseCircle,
  IoMdInformationCircleOutline,
  IoMdSearch,
} from "react-icons/io";
import { components } from "react-select";
export default function CustomSelectionSelect({
  title,
  isLoading,
  selection,
  selectHandler,
  selectedOption,
  createNewOption,
  onBlur = () => "",
  border,
  isSearchable = true,
  optionColor = "#005FDB",
  optionFontWeight = 700,
  isDisabled = false,
}) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [searchTerm, setSearchTerm] = useState("");
  const popoverRef = useRef(null);
  const triggerRef = useRef(null); // For Popover Trigger
  const deleteRef = useRef(null); // For Popover Trigger
  const deleteAllRef = useRef(null); // For Popover Trigger

  let newOption = "";

  const filteredSelection = isDisabled
    ? []
    : selection.filter((option) => {
        const isArray = Array.isArray(option.value);
        const isSelectedArray = Array.isArray(selectedOption); // Check if selectedOption is an array

        return (
          option.label.toLowerCase().includes(searchTerm.toLowerCase()) &&
          (isSelectedArray
            ? !selectedOption.some(
                (selected) =>
                  isArray
                    ? option.value.includes(selected.value) // Check overlap if option.value is an array
                    : selected.value === option.value, // Direct match if option.value is a string
              )
            : selectedOption !== option.value) // If selectedOption is a string, compare directly
        );
      });
  let hasExactSearch = !selection.filter(
    (option) => option.label.toLowerCase() === searchTerm.toLowerCase(),
  ).length;
  if (hasExactSearch) {
    newOption = searchTerm;
  }
  function handleOpen() {
    onOpen();
    setSearchTerm("");
  }
  function handleClose(willBlur = true) {
    onClose();
    if (willBlur) {
      onBlur();
    }
  }
  const inputHandler = (e) => {
    setSearchTerm(e.target.value);
  };
  function handleSelect(option, isDelete = false) {
    if (Array.isArray(selectedOption)) {
      selectHandler([...selectedOption, option]);
    } else {
      selectHandler(option);
    }
    handleClose(false);
  }
  function handleDelete(option) {
    if (Array.isArray(selectedOption)) {
      selectHandler(selectedOption.filter((opt) => opt.value !== option.value));
    } else {
      selectHandler("");
    }
  }
  function handleDeleteAll() {
    if (Array.isArray(selectedOption)) {
      selectHandler([]);
    } else {
      selectHandler("");
    }
  }

  function handleCreateNewOption(option) {
    createNewOption(option);
    handleClose(false);
  }

  useOutsideClick({
    ref: popoverRef, // Main ref for content
    handler: (event) => {
      if (
        triggerRef.current?.contains(event.target) ||
        deleteRef.current?.contains(event.target) ||
        deleteAllRef.current?.contains(event.target)
      ) {
        return; // Do nothing if the click was on the trigger
      }
      if (isOpen) {
        handleClose();
      } else {
        handleClose(false);
      }
    },
  });

  return (
    <>
      <Popover
        isOpen={isOpen}
        onOpen={handleOpen}
        onClose={handleClose}
        placement="bottom"
        modifiers={[{ name: "flip", enabled: false }]}
        matchWidth
      >
        <PopoverTrigger cursor={"default"}>
          <Button
            isDisabled={isDisabled}
            ref={triggerRef}
            display={"flex"}
            bg={"white"}
            px={"10px"}
            h={"auto"}
            py={"10px"}
            fontWeight={400}
            border={border || "1px solid #E2E8F0"}
            // boxShadow={"0px 0px 3px rgba(50,50,93,0.5)"}
            cursor={"default !important"}
            _hover={{ bg: "white", borderColor: "#cbd5e0" }}
            justifyContent={"start"}
            color={
              selectedOption?.length > 0 ||
              (typeof selectedOption === "string" &&
                selectedOption.trim() !== "")
                ? "black"
                : "#B7AEC0"
            }
          >
            <Flex alignItems={"stretch"} w={"100%"} justify={"space-between"}>
              {Array.isArray(selectedOption) ? (
                <>
                  {selectedOption.length ? (
                    <>
                      <Flex gap={"10px"} wrap="wrap">
                        {selectedOption.map((val) => (
                          <Flex
                            bg={"#ededed"}
                            boxShadow={"0px 0px 3px rgba(50,50,93,0.5)"}
                            borderRadius={"1px"}
                            fontSize={"14px"}
                            alignItems={"center"}
                          >
                            <Flex px={"4px"} py={"4px"}>
                              {val.value}
                            </Flex>
                            <Flex
                              ref={deleteRef}
                              onClick={(e) => {
                                handleDelete(val);
                                e.stopPropagation();
                              }}
                              cursor={"pointer"}
                              _hover={{ bg: "#fde2e2", color: "#dc143c" }}
                              px={"4px"}
                              py={"4px"}
                              alignItems={"center"}
                              justify={"center"}
                            >
                              <RiCloseFill />
                            </Flex>
                          </Flex>
                        ))}
                      </Flex>
                      <Flex gap={"10px"} alignItems={"stretch"}>
                        <Flex
                          ref={deleteAllRef}
                          onClick={(e) => {
                            handleDeleteAll();
                            e.stopPropagation();
                          }}
                          cursor={"pointer"}
                          _hover={{ color: "black" }}
                          px={"2px"}
                          alignItems={"center"}
                          justify={"center"}
                          fontSize={"20px"}
                          h={"100%"}
                          color={"#848484"}
                        >
                          <RiCloseFill />
                        </Flex>
                        <Flex w={"1px"} h={"100%"} bg={"#bababa"}></Flex>
                        <Flex
                          cursor={"pointer"}
                          h={"100%"}
                          alignItems={"center"}
                          justify={"center"}
                          _hover={{ color: "black" }}
                          px={"2px"}
                          color={"#848484"}
                          fontSize={"12px"}
                        >
                          <FaChevronDown />
                        </Flex>
                      </Flex>
                    </>
                  ) : (
                    <Flex>Select {title}</Flex>
                  )}
                </>
              ) : (
                <>
                  {selectedOption ? (
                    selectedOption
                  ) : (
                    <Flex>Select {title}</Flex>
                  )}
                  <Flex color={"black"} fontSize={"12px"}>
                    <FaChevronDown />
                  </Flex>
                </>
              )}
            </Flex>
          </Button>
        </PopoverTrigger>

        <PopoverContent
          ref={popoverRef}
          tabIndex={0}
          color="#005FDB"
          width={"auto"}
          border={"1px solid #bababa"}
          p={0}
        >
          {isSearchable ? (
            <>
              <Flex
                borderTopRadius={"10px"}
                bg={"#f8f9fa"}
                color={"black"}
                p={"10px"}
              >
                <InputGroup>
                  <InputLeftElement pointerEvents="none">
                    <IoMdSearch color="#848484" fontSize={"20px"} />
                  </InputLeftElement>
                  <Input
                    bg={"white"}
                    border={"1px solid #bababa"}
                    value={searchTerm}
                    onChange={inputHandler}
                    placeholder={`Search or create a ${title}`}
                  ></Input>
                </InputGroup>
              </Flex>
              <Divider borderColor={"#bababa"} m={0} />
            </>
          ) : (
            ""
          )}

          {isLoading ? (
            <Center
              gap={"10px"}
              py={"40px"}
              color={"#848484"}
              flexDir={"column"}
            >
              <Spinner
                color="#dc143c"
                size={"lg"}
                // emptyColor="gray.200"
                thickness="3px"
              />
              <Flex>Fetching {title}...</Flex>
            </Center>
          ) : (
            <>
              {newOption ? (
                <>
                  <Divider borderColor={"#bababa"} m={0} />
                  <Flex
                    onClick={() => {
                      handleCreateNewOption(newOption);
                    }}
                    cursor={"pointer"}
                    _hover={{ bg: "#e8f2ff" }}
                    alignItems={"center"}
                    gap={"8px"}
                    p={"10px"}
                  >
                    <Flex>
                      <FaPlus />
                    </Flex>
                    <Flex>
                      Create "{newOption}" as new {title}
                    </Flex>
                  </Flex>
                </>
              ) : (
                ""
              )}
              <Flex flexDir={"column"} maxH={"160px"} overflowY={"auto"}>
                {filteredSelection.length ? (
                  filteredSelection.map((val) => (
                    <>
                      <Flex
                        color={optionColor}
                        cursor={"pointer"}
                        fontWeight={optionFontWeight}
                        onClick={() => handleSelect(val)}
                        _hover={{ bg: "#e8f2ff" }}
                        p={"10px"}
                      >
                        {val.label}
                      </Flex>
                    </>
                  ))
                ) : !newOption ? (
                  <Center flexDir={"column"} h={"100px"}>
                    <Flex fontWeight={700} color={"#dc143c"}>
                      No {title} available
                    </Flex>
                    <Flex fontSize={"14px"} color={"#848484"}>
                      Please create a new {title} by typing.
                    </Flex>
                  </Center>
                ) : (
                  ""
                )}
              </Flex>
            </>
          )}
          {isSearchable
            ? !searchTerm && (
                <Flex
                  borderBottomRadius="10px"
                  p={"8px"}
                  gap={"8px"}
                  fontSize={"14px"}
                  bg={"#f8f9fa"}
                  alignItems={"center"}
                  color={"#848484"}
                  borderTop={"1px solid #bababa"}
                >
                  <Flex fontSize={"20px"}>
                    <IoMdInformationCircleOutline />
                  </Flex>

                  <Flex>
                    Don't see the option you need? Start typing to create a new
                    one!{" "}
                  </Flex>
                </Flex>
              )
            : ""}
        </PopoverContent>
      </Popover>
    </>
  );
}
