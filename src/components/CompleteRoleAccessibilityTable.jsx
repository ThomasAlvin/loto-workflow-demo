import {
  Flex,
  Icon,
  Table,
  TableContainer,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
} from "@chakra-ui/react";
import { IoMdCheckmark, IoMdClose } from "react-icons/io";
import starterGuideMemberAccessibility from "../constants/StarterGuideMemberAccessibility";
import starterGuideMemberRoleAccessibilityValue from "../constants/StarterGuideMemberRoleAccessibilityValue";
import defaultRoles from "../utils/defaultRoles";
import formatString from "../utils/formatString";

export default function CompleteRoleAccessibilityTable() {
  const isPermissionChecked = (role, moduleName, permissionName) => {
    const roleModule = role.modules.find((mod) => mod.name === moduleName);
    return (
      roleModule?.permissions?.some(
        (perm) => perm.permission === permissionName
      ) ?? false
    );
  };

  return (
    <>
      <TableContainer
        width={"100%"}
        boxShadow={"0px 0px 3px rgba(50,50,93,0.5)"}
      >
        <Table variant="simple">
          <Thead bg={"#ECEFF3"}>
            <Tr>
              <Th
                minW={"300px"}
                borderBottomColor={"#bababa"}
                fontWeight={700}
                fontSize={"12px"}
                borderRight={"1px solid #bababa"}
              >
                Modules
              </Th>
              {defaultRoles.map((val) => (
                <Th
                  w={"200px"}
                  px={"0px"}
                  whiteSpace={"wrap"}
                  wordBreak={"break-word"}
                  textAlign={"center"}
                  borderBottomColor={"#bababa"}
                  fontWeight={700}
                  fontSize={"12px"}
                  borderRight={"1px solid #bababa"}
                >
                  {formatString(val.name)}
                </Th>
              ))}
            </Tr>
          </Thead>

          <Tbody>
            {starterGuideMemberAccessibility.map((valModule, index) => (
              <>
                <Tr
                  borderRight={"1px solid #bababa"}
                  borderBottomColor={"#bababa"}
                  bg={"#f8f9fa"}
                  py={"8px"}
                >
                  <Td
                    color={"#dc143c"}
                    borderBottomColor={"#bababa"}
                    colSpan={8}
                  >
                    <Flex alignItems={"center"} gap={"10px"}>
                      <Icon as={valModule?.icon} />
                      <Flex fontWeight={700} color={"black"}>
                        {formatString(valModule.name, true, true, true)}
                      </Flex>
                    </Flex>
                  </Td>
                </Tr>

                {valModule.permissions.map((valPermission, permIndex) => (
                  <Tr key={`perm-${index}-${permIndex}`}>
                    <Td
                      borderRight={"1px solid #bababa"}
                      borderBottomColor={"#bababa"}
                      color={"#292D3F"}
                    >
                      <Flex gap={"5px"} alignItems={"center"}>
                        <Flex>
                          {" "}
                          {formatString(
                            (valPermission.permission === "view" &&
                            valModule.name !== "dashboard"
                              ? "view_all"
                              : valPermission.permission === "full_access"
                              ? "access"
                              : valPermission.permission +
                                (valModule.name === "members" &&
                                valPermission.permission !== "view"
                                  ? "s"
                                  : "")) +
                              "_" +
                              (valModule.name === "members" &&
                              valPermission.permission !== "view"
                                ? ""
                                : valModule.name),
                            true,
                            true,
                            true
                          )}
                        </Flex>
                      </Flex>
                    </Td>

                    {starterGuideMemberRoleAccessibilityValue.map(
                      (valRole, roleIndex) => {
                        return (
                          <Td
                            key={`role-${index}-${permIndex}-${roleIndex}`}
                            borderRight={"1px solid #bababa"}
                            borderBottomColor={"#bababa"}
                            color={"#292D3F"}
                            textAlign={"center"}
                            fontWeight={700}
                          >
                            {isPermissionChecked(
                              valRole,
                              valModule.name,
                              valPermission?.permission
                            ) === true ? (
                              <Flex
                                justify={"center"}
                                fontSize={"24px"}
                                color={"#3D9666"}
                              >
                                <IoMdCheckmark />
                              </Flex>
                            ) : isPermissionChecked(
                                valRole,
                                valModule.name,
                                valPermission?.permission
                              ) === false ? (
                              <Flex
                                justify={"center"}
                                fontSize={"24px"}
                                color={"#dc143c"}
                              >
                                <IoMdClose />
                              </Flex>
                            ) : (
                              ""
                            )}
                          </Td>
                        );
                      }
                    )}
                  </Tr>
                ))}
              </>
            ))}
          </Tbody>
        </Table>
      </TableContainer>
    </>
  );
}
