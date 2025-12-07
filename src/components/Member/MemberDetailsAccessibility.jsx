import { Center, Flex, Spinner } from "@chakra-ui/react";
import formatString from "../../utils/formatString";
import MemberDetailsPermissionCard from "./MemberDetailsPermissionCard";

export default function MemberDetailsAccessibility({
  accessibility,
  accessibilityRBAC,
  accessibilityLoading,
}) {
  return (
    <Flex flexDir={"column"}>
      {accessibilityLoading ? (
        <Center gap={"20px"} py={"40px"} color={"#848484"} flexDir={"column"}>
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
          <Flex flexDir={"column"} gap={"20px"}>
            {/* {Array.from({ length: 3 }).map((module, index) => ( */}
            {accessibilityRBAC?.modules?.map((module, index) =>
              module.permissions.length ? (
                <Flex flexDir={"column"} gap={"10px"}>
                  <Flex justify={"space-between"}>
                    <Flex
                      fontWeight={700}
                      fontSize={"18px"}
                      gap={"10px"}
                      alignItems={"center"}
                    >
                      <Flex>{formatString(module.name, true, true, true)}</Flex>
                    </Flex>
                  </Flex>
                  <Flex flexDir={"column"} borderY={"1px solid #bababa"}>
                    {/* {Array.from({ length: 3 }).map((_, index2) => ( */}
                    {module.permissions.map((permission, index2) => {
                      if (!accessibility) {
                        console.warn("Member role not found");
                        return;
                      }

                      const accessibilityModule = accessibility?.modules?.find(
                        (moduleValue) => moduleValue.name === module.name
                      );
                      let hasPermission =
                        !!accessibilityModule?.permissions?.find((perm) => {
                          return perm.permission === permission.permission;
                        });
                      if (module === "work_orders") {
                        hasPermission = !!accessibilityModule.permissions.find(
                          (perm) => {
                            return (
                              perm.permission === permission.permission &&
                              perm.permission === "manage"
                            );
                          }
                        );
                      }

                      return (
                        <MemberDetailsPermissionCard
                          module={module}
                          permissionLength={module.permissions.length}
                          permission={permission}
                          index2={index2}
                          value={hasPermission}
                        />
                      );
                    })}
                  </Flex>
                </Flex>
              ) : (
                ""
              )
            )}
          </Flex>
        </Flex>
      )}
    </Flex>
  );
}
