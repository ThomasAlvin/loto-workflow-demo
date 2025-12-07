import {
  Accordion,
  AccordionButton,
  AccordionItem,
  AccordionPanel,
  Box,
  Button,
  Center,
  Divider,
  Flex,
  Input,
  MenuItem,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Spinner,
  Switch,
  Table,
  TableContainer,
  Tbody,
  Td,
  Textarea,
  Th,
  Thead,
  Tooltip,
  Tr,
  useDisclosure,
} from "@chakra-ui/react";
import ReactSelect from "react-select";
import { FaChevronDown, FaPlus, FaTriangleExclamation } from "react-icons/fa6";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import { api } from "../../api/api";
import Swal from "sweetalert2";
import { useEffect, useState } from "react";
import WorkOrderDetailsFormQuestion from "../WorkOrders/WorkOrderDetailsFormQuestion";
import { FaRegTrashAlt } from "react-icons/fa";
import SwalErrorMessages from "../SwalErrorMessages";
import {
  IoIosInformation,
  IoIosInformationCircle,
  IoIosInformationCircleOutline,
  IoMdInformationCircleOutline,
  IoMdRefresh,
} from "react-icons/io";
import tinycolor from "tinycolor2";
import CustomizeMemberPermissionCard from "./CustomizeMemberPermissionCard";
import formatString from "../../utils/formatString";

export default function CustomizeMemberPermissionModal({
  memberRole,
  isOpen,
  onClose,
  setMemberInput,
  customPermissions,
  setCustomPermissions,
  accessibilityOptions,
  defaultAccessibility,
  customAccessibilityLoading,
  getNewRoleSettingsByRole,
}) {
  const [buttonLoading, setButtonLoading] = useState(false);
  function handleCloseModal() {
    onClose();
  }

  const roleAccessibility = accessibilityOptions?.find(
    (role) => role.name === memberRole,
  );
  function permissionSwitchHandler(module, permission) {
    setCustomPermissions((prevState) => {
      let removeManageWorkOrder;
      const updatedModules = prevState.map((prevModule) => {
        if (prevModule.name === module.name) {
          // Check if permission exists

          const permissionExists = prevModule.permissions.some(
            (perm) => perm.permission === permission.permission,
          );

          let updatedPermissions;
          if (permissionExists) {
            // Remove it
            updatedPermissions = prevModule.permissions.filter(
              (perm) => perm.permission !== permission.permission,
            );
            // if (module.name === "work_orders") {

            // } else
            if (
              permission.permission === "view" ||
              permission.permission === "view_owned" ||
              permission.permission === "view_assigned"
            ) {
              const dependentPerms = [
                "manage",
                "manage_admin",
                "manage_member",
                "manage_finance",
              ];

              updatedPermissions = updatedPermissions.filter(
                (perm) => !dependentPerms.includes(perm.permission),
              );
            }
            if (
              permission.permission === "view" &&
              (prevModule.name === "equipment_machines" ||
                prevModule.name === "lock_inventory" ||
                prevModule.name === "members")
            ) {
              removeManageWorkOrder = true;
            }
          } else {
            // Add it
            updatedPermissions = [...prevModule.permissions, permission];

            // Mutual exclusion
            if (module.name === "work_orders") {
              const hasWorkOrderManage = updatedPermissions.some(
                (p) => p.permission === "manage",
              );
              if (!hasWorkOrderManage) {
                updatedPermissions = [
                  ...updatedPermissions,
                  { permission: "manage" },
                ];
              }
            }
            if (permission.permission === "view") {
              updatedPermissions = updatedPermissions.filter(
                (p) => p.permission !== "view_assigned",
              );
              updatedPermissions = updatedPermissions.filter(
                (p) => p.permission !== "view_owned",
              );
            } else if (permission.permission === "view_owned") {
              updatedPermissions = updatedPermissions.filter(
                (p) => p.permission !== "view_assigned",
              );
              if (
                prevModule.name === "equipment_machines" ||
                prevModule.name === "lock_inventory" ||
                prevModule.name === "members"
              ) {
                removeManageWorkOrder = true;
              }
              updatedPermissions = updatedPermissions.filter(
                (p) => p.permission !== "view",
              );
            } else if (permission.permission === "view_assigned") {
              updatedPermissions = updatedPermissions.filter(
                (p) => p.permission !== "view_owned",
              );
              updatedPermissions = updatedPermissions.filter(
                (p) => p.permission !== "view",
              );
              if (
                prevModule.name === "equipment_machines" ||
                prevModule.name === "lock_inventory" ||
                prevModule.name === "members"
              ) {
                removeManageWorkOrder = true;
              }
              updatedPermissions = updatedPermissions.filter(
                (p) => p.permission !== "manage",
              );
            }

            // Dependencies: create/delete needs view
            const needsView = [
              "manage",
              "manage_admin",
              "manage_member",
              "manage_finance",
            ];

            if (needsView.includes(permission.permission)) {
              const hasViewOrViewOwned = updatedPermissions.some(
                (p) => p.permission === "view" || p.permission === "view_owned",
              );

              if (!hasViewOrViewOwned) {
                updatedPermissions = updatedPermissions.filter(
                  (p) => p.permission !== "view_assigned",
                );

                if (
                  module.permissions.some(
                    (modulePerm) => modulePerm.permission === "view_owned",
                  )
                ) {
                  updatedPermissions.push({ permission: "view_owned" });
                } else if (
                  module.permissions.some(
                    (modulePerm) => modulePerm.permission === "view",
                  )
                ) {
                  updatedPermissions.push({ permission: "view" });
                }
              }
            }
          }
          console.log(updatedPermissions);

          return {
            ...prevModule,
            permissions: updatedPermissions,
          };
        }

        return prevModule;
      });
      if (module.name === "work_orders") {
        const permissionExists = prevState
          .find((prevModule) => prevModule.name === "work_orders")
          .permissions.some(
            (perm) => perm.permission === permission.permission,
          );
        console.log(permissionExists);

        if (!permissionExists) {
          const newUpdatedModules = updatedModules.map((prevModule) => {
            if (
              prevModule.name === "lock_inventory" ||
              prevModule.name === "equipment_machines" ||
              prevModule.name === "members"
            ) {
              console.log(permission);

              const permissionExists2 = prevState
                .find((prevModule2) => prevModule2.name === prevModule.name)
                .permissions.some((perm) => perm.permission === "view");
              console.log(permissionExists2);

              if (!permissionExists2) {
                let updatedPermissions;
                updatedPermissions = [
                  ...prevModule.permissions,
                  { permission: "view" },
                ];

                updatedPermissions = updatedPermissions.filter(
                  (p) => p.permission !== "view_assigned",
                );
                updatedPermissions = updatedPermissions.filter(
                  (p) => p.permission !== "view_owned",
                );

                return {
                  ...prevModule,
                  permissions: updatedPermissions,
                };
              }
              return prevModule;
            }
            return prevModule;
          });

          return newUpdatedModules;
        }
        console.log("dh sampai2");

        return updatedModules;
      }
      console.log(removeManageWorkOrder);

      if (removeManageWorkOrder) {
        const newUpdatedModules = updatedModules.map((prevModule) => {
          if (prevModule.name === "work_orders") {
            const permissionExists2 = prevState
              .find((prevModule2) => prevModule2.name === "work_orders")
              .permissions.some(
                (perm) =>
                  perm.permission === "view" ||
                  perm.permission === "view_owned",
              );
            //terakhir edit the work orders dibilang gk ad permission manage??
            console.log(prevState);
            console.log(permissionExists2);

            if (permissionExists2) {
              let updatedPermissions;
              updatedPermissions = [...prevModule.permissions];

              updatedPermissions = updatedPermissions.filter(
                (p) =>
                  !(
                    p.permission === "view" ||
                    p.permission === "view_owned" ||
                    p.permission === "manage"
                  ),
              );
              console.log(updatedPermissions);

              return {
                ...prevModule,
                permissions: updatedPermissions,
              };
            }
            return prevModule;
          }
          return prevModule;
        });
        console.log(newUpdatedModules);

        return newUpdatedModules;
      }
      return updatedModules;
    });
  }
  function saveCustomPermissions() {
    setMemberInput((prevState) => ({
      ...prevState,
      hasCustomPermissions: true,
      accessibility: customPermissions,
    }));
    onClose();
  }

  return (
    <>
      <Modal
        closeOnOverlayClick={false}
        isOpen={isOpen}
        onClose={handleCloseModal}
        isCentered
        closeOnEsc={!buttonLoading}
      >
        <ModalOverlay />
        <ModalContent bg={"white"} maxW="800px" maxH={"90vh"} overflow={"auto"}>
          <ModalHeader
            py={"5px"}
            px={"16px"}
            display={"flex"}
            flexDir={"column"}
          >
            <Flex
              onClick={() => {
                console.log(customPermissions);
              }}
              color={"crimson"}
            >
              Permission & Accessibility{" "}
            </Flex>

            <Flex
              textAlign={"center"}
              fontSize={"14px"}
              color={"#848484"}
              justifyContent={"space-between"}
            >
              <Flex>
                Customize permissions and access levels to align with their
                responsibilities.
              </Flex>
            </Flex>
          </ModalHeader>
          <ModalCloseButton color={"black"} isDisabled={buttonLoading} />
          <Divider m={0} />

          <ModalBody py={"20px"}>
            {customAccessibilityLoading ? (
              <Center
                gap={"20px"}
                py={"40px"}
                color={"#848484"}
                flexDir={"column"}
              >
                <Spinner
                  color="#dc143c"
                  size={"xl"}
                  // emptyColor="gray.200"
                  thickness="4px"
                />
                <Flex>Fetching permissions...</Flex>
              </Center>
            ) : (
              <Flex flexDir={"column"} gap={"20px"}>
                <Flex
                  w={"100%"}
                  justify={"space-between"}
                  alignItems={"center"}
                >
                  <Flex
                    gap={"5px"}
                    fontWeight={700}
                    fontSize={"20px"}
                    alignItems={"center"}
                  >
                    <Flex>{formatString(memberRole)} Permission</Flex>
                    <Flex color={"#848484"}>
                      <Tooltip
                        hasArrow
                        placement="top"
                        maxW={"none"}
                        label={
                          <Box maxW={"400px"}>
                            Each role supports a limited set of customizable
                            permissions, therefore some permissions may be
                            unavailable.
                          </Box>
                        }
                      >
                        <Flex
                          _hover={{ color: "black" }}
                          color={"#848484"}
                          fontSize={"20px"}
                        >
                          <IoMdInformationCircleOutline />
                        </Flex>
                      </Tooltip>
                    </Flex>
                  </Flex>
                  <Flex>
                    <Button
                      onClick={() => {
                        setCustomPermissions(
                          getNewRoleSettingsByRole(memberRole),
                        );
                      }}
                      _hover={{
                        bg: tinycolor("#dc143c").darken(8).toString(),
                      }}
                      color={"white"}
                      // border={"1px solid #dc143c"}
                      bg={"#dc143c"}
                      h={"28px"}
                      fontSize={"14px"}
                      px={"8px"}
                    >
                      <Flex alignItems={"center"} gap={"5px"}>
                        <Flex fontSize={"18px"}>
                          <IoMdRefresh />
                        </Flex>
                        <Flex>Reset All</Flex>
                      </Flex>
                    </Button>
                  </Flex>
                </Flex>
                <Divider my={0} borderColor={"#848484"} />
                <Flex flexDir={"column"} gap={"20px"}>
                  {/* {Array.from({ length: 3 }).map((module, index) => ( */}
                  {roleAccessibility?.modules?.map((module, index) =>
                    module.permissions.length ? (
                      <Flex flexDir={"column"} gap={"10px"}>
                        <Flex justify={"space-between"}>
                          <Flex
                            fontWeight={700}
                            fontSize={"18px"}
                            gap={"10px"}
                            alignItems={"center"}
                          >
                            <Flex>
                              {formatString(module.name, true, true, true)}
                            </Flex>
                          </Flex>
                        </Flex>
                        <Flex flexDir={"column"} borderY={"1px solid #bababa"}>
                          {/* {Array.from({ length: 3 }).map((_, index2) => ( */}
                          {module.permissions.map((permission, index2) => {
                            if (!customPermissions) {
                              console.warn("Member role not found");
                              return;
                            }

                            const accessibilityModule = customPermissions.find(
                              (moduleValue) => moduleValue.name === module.name,
                            );
                            let hasPermission =
                              !!accessibilityModule?.permissions?.find(
                                (perm) => {
                                  return (
                                    perm.permission === permission.permission
                                  );
                                },
                              );
                            if (module === "work_orders") {
                              hasPermission =
                                !!accessibilityModule.permissions.find(
                                  (perm) => {
                                    return (
                                      perm.permission ===
                                        permission.permission &&
                                      perm.permission === "manage"
                                    );
                                  },
                                );
                            }

                            return (
                              <CustomizeMemberPermissionCard
                                index={index}
                                module={module}
                                permissionLength={module.permissions.length}
                                permission={permission}
                                index2={index2}
                                value={hasPermission}
                                permissionSwitchHandler={
                                  permissionSwitchHandler
                                }
                              />
                            );
                          })}
                        </Flex>
                      </Flex>
                    ) : (
                      ""
                    ),
                  )}
                </Flex>
              </Flex>
            )}
          </ModalBody>
          <Divider m={0} />
          <ModalFooter w={"100%"} justifyContent={"center"}>
            <Flex w={"100%"} alignItems={"center"} justifyContent={"end"}>
              <Flex>
                <Button
                  isLoading={buttonLoading}
                  _hover={{ background: "#c40a2f", color: "white" }}
                  width={"95px"}
                  color={"#dc143c"}
                  background={"transparent"}
                  border={"1px solid #dc143c"}
                  mr={3}
                  onClick={handleCloseModal}
                >
                  Close
                </Button>
                <Button
                  isLoading={buttonLoading}
                  _hover={{ background: "#c40a2f" }}
                  width={"95px"}
                  border={"1px solid #dc143c"}
                  color={"white"}
                  bgColor={"#dc143c"}
                  variant="ghost"
                  onClick={() => {
                    saveCustomPermissions();
                  }}
                >
                  Save
                </Button>
              </Flex>
            </Flex>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}
