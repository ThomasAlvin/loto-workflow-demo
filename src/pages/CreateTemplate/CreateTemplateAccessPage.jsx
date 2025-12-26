import { useEffect, useState } from "react";
import {
  Avatar,
  Button,
  Checkbox,
  Flex,
  Table,
  TableContainer,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
} from "@chakra-ui/react";
import { useSelector } from "react-redux";
import { FaChevronLeft, FaTrashAlt, FaUserAlt } from "react-icons/fa";
import CreateTemplatePageLayout from "../../components/Layout/CreateTemplateLayout";
import { ImCheckmark } from "react-icons/im";
import TemplateAssignDrawer from "../../components/CreateTemplate/TemplateAssignDrawer";
import { api } from "../../api/api";
import labelizeRole from "../utils/labelizeRole";
export default function CreateTemplateAccessPage({
  templateDetails,
  setTemplateDetails,
  currentPage,
  setCurrentPage,
  submitTemplate,
  formik,
}) {
  const userSelector = useSelector((state) => state.login.auth);
  const [memberSelection, setMemberSelection] = useState([]);
  function deleteAccess(index) {
    const tempObject = [...templateDetails.access];
    tempObject.splice(index, 1);
    setTemplateDetails((prevState) => {
      return { ...prevState, access: tempObject };
    });
  }

  function accessCheckboxHandler(event, index) {
    const { checked, id } = event.target;
    setTemplateDetails((prevState) => ({
      ...prevState,
      access: prevState.access.map((val, accessIndex) => {
        if (index === accessIndex) {
          return { ...val, [id]: checked };
        }
        return val;
      }),
    }));
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
  return (
    <Flex flexDir={"column"} justifyContent={"center"} gap={"20px"}>
      <CreateTemplatePageLayout
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        formik={formik}
        stage={"access"}
        hasSidebar={false}
        submitTemplate={submitTemplate}
        templateDetails={templateDetails}
      >
        <Flex w={"100%"} py={"40px"} flexDir={"column"} gap={"10px"}>
          <Flex px={"140px"} gap={"20px"} flexDir={"column"}>
            <Flex flexDir={"column"} gap={"20px"}>
              <Flex flexDir={"column"} color={"black"}>
                <Flex fontWeight={700} fontSize={"20px"}>
                  {templateDetails.name}
                </Flex>
                <Flex
                  color={"#dc143c"}
                  textAlign={"center"}
                  fontSize={"28px"}
                  fontWeight={700}
                >
                  Who can access this template and its inspections?
                </Flex>
              </Flex>
              <Flex>
                <Flex
                  w={"100%"}
                  p={"20px"}
                  shadow={"0px 0px 3px rgba(50,50,93,0.5)"}
                >
                  <TableContainer w={"100%"}>
                    <Table variant="simple">
                      <Thead>
                        <Tr>
                          <Th borderColor="#bababa" fontWeight={700}>
                            Template available to
                          </Th>
                          <Th borderColor="#bababa" fontWeight={700}>
                            Role
                          </Th>
                          <Th
                            textAlign={"center"}
                            borderColor="#bababa"
                            fontWeight={700}
                          >
                            Conduct
                          </Th>
                          <Th
                            textAlign={"center"}
                            borderColor="#bababa"
                            fontWeight={700}
                          >
                            Edit
                          </Th>
                          <Th
                            textAlign={"center"}
                            borderColor="#bababa"
                            fontWeight={700}
                          >
                            Delete
                          </Th>
                          <Th
                            textAlign={"center"}
                            borderColor="#bababa"
                            fontWeight={700}
                          >
                            Action
                          </Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        <Tr>
                          <Td borderColor="#bababa" textAlign={"center"}>
                            <Flex gap={"10px"}>
                              {userSelector?.first_name ? (
                                <Avatar
                                  outline={"1px solid #dc143c"}
                                  border={"2px solid white"}
                                  name={
                                    userSelector?.first_name +
                                    " " +
                                    userSelector?.last_name
                                  }
                                  src={
                                    userSelector?.profile_image_url
                                      ? userSelector?.profile_image_url
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
                              <Flex
                                justifyContent={"center"}
                                flexDir={"column"}
                                fontSize={"14px"}
                              >
                                <Flex fontWeight={700}>
                                  {userSelector.first_name +
                                    " " +
                                    userSelector.last_name}
                                </Flex>
                                <Flex color={"#848484"}>
                                  {userSelector.email}
                                </Flex>
                              </Flex>
                            </Flex>
                          </Td>

                          <Td borderColor="#bababa" textAlign={"center"}>
                            <Flex gap={"10px"}>
                              <Flex color={"#dc143c"} fontWeight={700}>
                                {labelizeRole("owner")}
                              </Flex>
                            </Flex>
                          </Td>
                          <Td borderColor="#bababa" textAlign={"center"}>
                            <Flex justifyContent={"center"}>
                              <Checkbox isDisabled isChecked />
                            </Flex>
                          </Td>
                          <Td borderColor="#bababa" textAlign={"center"}>
                            <Flex justifyContent={"center"}>
                              <Checkbox isDisabled isChecked />
                            </Flex>
                          </Td>
                          <Td borderColor="#bababa" textAlign={"center"}>
                            <Flex justifyContent={"center"}>
                              <Checkbox isDisabled isChecked />
                            </Flex>
                          </Td>
                          <Td borderColor="#bababa" textAlign={"center"}></Td>
                        </Tr>
                        {templateDetails.access.map((val, index) => {
                          return (
                            <Tr>
                              <Td borderColor="#bababa" textAlign={"center"}>
                                <Flex gap={"10px"} alignItems={"center"}>
                                  {val?.first_name ? (
                                    <Avatar
                                      outline={"1px solid #dc143c"}
                                      border={"2px solid white"}
                                      name={
                                        val?.first_name + " " + val?.last_name
                                      }
                                      src={
                                        val?.profile_image_url
                                          ? val?.profile_image_url
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
                                  <Flex
                                    justifyContent={"center"}
                                    flexDir={"column"}
                                    fontSize={"14px"}
                                  >
                                    <Flex fontWeight={700}>
                                      {val.first_name + " " + val.last_name}
                                    </Flex>
                                    <Flex color={"#848484"}>{val.email}</Flex>
                                  </Flex>
                                </Flex>
                              </Td>
                              <Td borderColor="#bababa" textAlign={"center"}>
                                <Flex gap={"10px"}>
                                  <Flex color={"#dc143c"} fontWeight={700}>
                                    {labelizeRole(val.role)}
                                  </Flex>
                                </Flex>
                              </Td>
                              <Td borderColor="#bababa" textAlign={"center"}>
                                <Flex justifyContent={"center"}>
                                  <Checkbox isDisabled isChecked />
                                </Flex>
                              </Td>
                              <Td borderColor="#bababa" textAlign={"center"}>
                                <Flex justifyContent={"center"}>
                                  <Checkbox
                                    id="edit"
                                    defaultChecked={val.edit}
                                    onChange={(e) => {
                                      accessCheckboxHandler(e, index);
                                    }}
                                  />
                                </Flex>
                              </Td>
                              <Td borderColor="#bababa" textAlign={"center"}>
                                <Flex justifyContent={"center"}>
                                  <Checkbox
                                    id="delete"
                                    defaultChecked={val.delete}
                                    onChange={(e) => {
                                      accessCheckboxHandler(e, index);
                                    }}
                                  />
                                </Flex>
                              </Td>
                              <Td borderColor="#bababa" textAlign={"center"}>
                                <Flex
                                  gap={"10px"}
                                  justify={"center"}
                                  color={"crimson"}
                                >
                                  <Flex
                                    cursor={"pointer"}
                                    onClick={() => {
                                      deleteAccess(index);
                                    }}
                                    p={"5px"}
                                    _hover={{ bg: "#ededed" }}
                                  >
                                    <FaTrashAlt />
                                  </Flex>
                                </Flex>
                              </Td>
                            </Tr>
                          );
                        })}

                        <Tr>
                          <Td borderColor="#bababa" colSpan={6}>
                            <TemplateAssignDrawer
                              filteredMemberSelection={memberSelection.filter(
                                (member) => {
                                  const accessMemberIds =
                                    templateDetails?.access?.map(
                                      (access) => access.memberId
                                    );
                                  return (
                                    !accessMemberIds?.includes(
                                      member.memberId
                                    ) &&
                                    !(
                                      member.user.email === userSelector.email
                                    ) &&
                                    member.role === "admin" &&
                                    member.hasManageWorkOrderPermission
                                  );
                                }
                              )}
                              setTemplateDetails={setTemplateDetails}
                            />
                          </Td>
                        </Tr>
                        <Tr>
                          <Td colSpan={6}>
                            <Flex
                              color={"crimson"}
                              gap={"10px"}
                              py={"5px"}
                              alignItems={"center"}
                              justifyContent={"space-between"}
                            >
                              <Button
                                bg={"white"}
                                border={"1px solid #dc143c"}
                                color={"#dc143c"}
                                gap={"10px"}
                                alignItems={"center"}
                                // onClick={() => nav("/template/create/build")}
                                onClick={() => setCurrentPage("build")}
                              >
                                <Flex>
                                  <FaChevronLeft />
                                </Flex>
                                <Flex>Prev</Flex>
                              </Button>

                              <Button
                                bg={"#dc143c"}
                                color={"white"}
                                gap={"10px"}
                                alignItems={"center"}
                                onClick={() => {
                                  submitTemplate("completed");
                                }}
                              >
                                <Flex>
                                  <ImCheckmark />
                                </Flex>
                                <Flex>Save and Apply</Flex>
                              </Button>
                            </Flex>
                          </Td>
                        </Tr>
                      </Tbody>
                    </Table>
                  </TableContainer>
                </Flex>
              </Flex>
            </Flex>
          </Flex>
        </Flex>
      </CreateTemplatePageLayout>
      <Flex
        position={"fixed"}
        left={"-9999px"}
        top={"-9999px"}
        w={"100%"}
        h={"100%"}
      ></Flex>
    </Flex>
  );
}
