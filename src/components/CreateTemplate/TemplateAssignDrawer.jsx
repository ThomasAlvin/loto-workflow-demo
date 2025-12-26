import {
  Box,
  Button,
  Checkbox,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  Flex,
  Text,
  Tooltip,
  useDisclosure,
} from "@chakra-ui/react";
import ReactSelect from "react-select";
import { useRef, useState } from "react";
import { FaPlus, FaRegCircleQuestion } from "react-icons/fa6";
import { AiFillInfoCircle } from "react-icons/ai";
import ReactSelectMemberSelection from "../ReactSelectMemberSelection";
import { useSelector } from "react-redux";

export default function TemplateAssignDrawer({
  setTemplateDetails,
  filteredMemberSelection,
}) {
  const userSelector = useSelector((state) => state.login.auth);
  const { isOpen, onOpen, onClose } = useDisclosure();

  // -X All admin X-
  // const allAdminOption = {
  //   first_name: "All Admin",
  //   label: "All Admin",
  //   is_all_admin: true,
  // };
  const initialNewAccessInput = {
    members: [{ memberId: "", name: "", email: "" }],
    conduct: true,
    edit: false,
    delete: false,
  };
  const btnRef = useRef();
  const [newAccessInput, setNewAccessInput] = useState(initialNewAccessInput);
  function selectHandler(event) {
    const tempArr = [];
    event.map((val) => {
      const tempObject = {
        memberId: val.memberId,
        first_name: val.user.first_name,
        profile_image_url: val.user.profile_image_url,
        last_name: val.user.last_name,
        email: val.user.email,
        role: val.role,
      };
      tempArr.push(tempObject);
    });

    setNewAccessInput((prevState) => {
      return { ...prevState, members: tempArr };
    });
  }
  function accessLevelCheckBoxHandler(event, access) {
    const { checked } = event.target;

    setNewAccessInput((prevState) => ({
      ...prevState,
      [access]: checked,
    }));
  }
  function createNewAccessRule() {
    const tempArr = newAccessInput.members.map((val) => {
      // -X All admin X-
      // if (val.label === "All Admin") {
      //   return {
      //     label: "All Admin",
      //     email: val.email,
      //     role: "authorized_user",
      //     conduct: true,
      //     edit: newAccessInput.edit,
      //     delete: newAccessInput.delete,
      //   };
      // }

      return {
        memberId: val.memberId,
        first_name: val.first_name,
        last_name: val.last_name,
        profile_image_url: val.profile_image_url,
        email: val.email,
        role: "authorized_user",
        conduct: true,
        edit: newAccessInput.edit,
        delete: newAccessInput.delete,
      };
    });

    onClose();
    setTemplateDetails((prevState) => ({
      ...prevState,
      access: [...prevState.access, ...tempArr],
    }));
    setNewAccessInput(initialNewAccessInput);
  }

  return (
    <Flex>
      <Flex
        cursor={"pointer"}
        gap={"10px"}
        py={"5px"}
        color={"crimson"}
        alignItems={"center"}
        textDecor={"underline"}
        ref={btnRef}
        onClick={onOpen}
      >
        <Flex>
          <FaPlus />
        </Flex>
        <Flex>New Access Rule</Flex>
      </Flex>
      <Drawer
        isOpen={isOpen}
        placement="right"
        onClose={onClose}
        finalFocusRef={btnRef}
        size={"md"}
      >
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader
            borderBottom={"1px solid #bababa"}
            bg={"#f8f9fa"}
            color={"#dc143c"}
          >
            Add New Access Rule
          </DrawerHeader>

          <DrawerBody>
            <Flex flexDir={"column"}>
              <Flex flexDir={"column"} py={"40px"} gap={"60px"}>
                <Flex flexDir={"column"} gap={"10px"}>
                  <Flex alignItems={"center"} gap={"5px"}>
                    <Flex color={"black"} fontWeight={700} fontSize={"16px"}>
                      Template is available to
                    </Flex>
                    <Tooltip
                      hasArrow
                      placement={"top"}
                      maxW={"none"}
                      label={
                        <Flex _hover={{ color: "black" }} whiteSpace={"nowrap"}>
                          You can only assign admins with the "Manage Work
                          Order" permission
                        </Flex>
                      }
                    >
                      <Flex _hover={{ color: "black" }} color={"#848484"}>
                        <FaRegCircleQuestion />
                      </Flex>
                    </Tooltip>
                  </Flex>
                  <ReactSelect
                    isSearchable
                    isClearable
                    isMulti
                    onChange={(event) => {
                      selectHandler(event);
                    }}
                    options={filteredMemberSelection}
                    // options={[allAdminOption, ...filteredMemberSelection]}
                    components={{ Option: ReactSelectMemberSelection }}
                  />
                  <Flex gap={"20px"}>
                    <Flex color={"#dc143c"} fontWeight={700}>
                      Access :
                    </Flex>
                    <Flex alignItems={"center"} gap={"10px"}>
                      <Checkbox isDisabled isChecked />
                      <Flex>Conduct</Flex>
                    </Flex>
                    <Flex alignItems={"center"} gap={"10px"}>
                      <Checkbox
                        onChange={(e) => {
                          accessLevelCheckBoxHandler(e, "edit");
                        }}
                      />
                      <Flex>Edit</Flex>
                    </Flex>
                    <Flex alignItems={"center"} gap={"10px"}>
                      <Checkbox
                        onChange={(e) => {
                          accessLevelCheckBoxHandler(e, "delete");
                        }}
                      />
                      <Flex>Delete</Flex>
                    </Flex>
                  </Flex>
                </Flex>

                <Flex gap={"5px"}>
                  <Flex color={"#dc143c"} fontSize={"20px"} pt={"1px"}>
                    <AiFillInfoCircle />
                  </Flex>
                  <Box lineHeight={1.2}>
                    <Text as="span" color={"#dc143c"} fontWeight="bold">
                      Access rules
                    </Text>{" "}
                    configure who can use this template to conduct inspections,
                    and who automatically receives the results of those
                    inspections. Members are always able to see and edit any
                    inspections they have conducted themselves.
                  </Box>
                </Flex>
              </Flex>
            </Flex>
            <Flex justify={"end"} pb={"40px"} gap={"20px"}>
              <Button
                bg={"white"}
                color={"#dc143c"}
                border={"1px solid #dc143c"}
                onClick={() => {
                  onClose();
                  setNewAccessInput(initialNewAccessInput);
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  createNewAccessRule();
                }}
                bg={"#dc143c"}
                color={"white"}
              >
                Save
              </Button>
            </Flex>
          </DrawerBody>

          <DrawerFooter></DrawerFooter>
        </DrawerContent>
      </Drawer>
    </Flex>
  );
}
