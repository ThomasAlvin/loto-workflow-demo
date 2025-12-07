import { Flex, Switch, Tooltip } from "@chakra-ui/react";
import { IoMdInformationCircleOutline } from "react-icons/io";
import tinycolor from "tinycolor2";
import formatString from "../../utils/formatString";

export default function CustomizeMemberPermissionCard({
  module,
  permission,
  permissionLength,
  index,
  index2,
  value,
  permissionSwitchHandler,
}) {
  const hasViewOption = module.permissions.some(
    (modulePerm) => modulePerm.permission === "view"
  );
  const hasViewOwnedOption = module.permissions.some(
    (modulePerm) => modulePerm.permission === "view_owned"
  );
  const hasViewAssignedOption = module.permissions.some(
    (modulePerm) => modulePerm.permission === "view_assigned"
  );
  function getTooltipDescription(permission) {
    let manageExtraDescription;
    if (hasViewOption && hasViewOwnedOption) {
      manageExtraDescription = `"View All" or "View Owned"`;
    } else if (hasViewOption) {
      manageExtraDescription = `"View All"`;
    } else if (hasViewOwnedOption) {
      manageExtraDescription = `"View Owned"`;
    }
    // if (permission === "manage") {
    //   if (manageExtraDescription) {
    //     return `You must enable ${manageExtraDescription} to select this permission.`;
    //   }
    // } else
    if (permission === "view_assigned")
      return `This permission cannot be combined with "Manage" permission.`;
    return "";
  }
  function isWorkOrderViewOwnedOrViewAll(module, permission) {
    if (module.name !== "work_orders") return "";
    if (permission.permission === "view_owned") return "manage_own";
    if (permission.permission === "view") return "manage_all";
    if (permission.permission === "manage") return "none";

    return "none";
  }
  function isWorkOrderViewOwnedOrViewDescription(module, permission) {
    if (module.name !== "work_orders") return "";
    if (permission.permission === "view_owned")
      return "Grant access to create and manage owned work orders";
    if (permission.permission === "view")
      return "Grant access to create and manage all work orders";
    if (permission.permission === "manage") return "";

    return "";
  }
  function isWorkOrderViewOwnedOrViewRequirement(module, permission) {
    if (module.name !== "work_orders") return "";
    if (permission.permission === "view_owned")
      return "View All Equipment Machines, View All Members, View All Locks";
    if (permission.permission === "view")
      return "View All Equipment Machines, View All Members, View All Locks";
    if (permission.permission === "manage") return "";

    return "";
  }
  function isWorkOrderViewOwnedOrViewAllChecked(module, permission) {
    if (module.name !== "work_orders") return "";
    if (permission.permission === "view_owned") return "manage_own";
    if (permission.permission === "view") return "manage_all";
    if (permission.permission === "manage") return "none";

    return "none";
  }
  function formatRequirement(requirements) {
    console.log(requirements);

    return requirements
      ?.map((requirement) => {
        const words = formatString(
          (requirement?.permission === "view"
            ? "view_all"
            : requirement?.permission) +
            " " +
            requirement?.module,
          true,
          true,
          true
        );
        return words; // module.name added once here
      })
      .join(", ");
  }

  return isWorkOrderViewOwnedOrViewAll(module, permission) === "none" ? (
    ""
  ) : (
    <Flex
      onClick={() => {
        permissionSwitchHandler(module, permission);
      }}
      borderBottom={
        isWorkOrderViewOwnedOrViewAll(module, permission) === "manage_own" ||
        permissionLength - 1 === index2
          ? ""
          : "1px solid #bababa"
      }
      cursor={"pointer"}
      opacity={value ? 1 : 0.7}
      bg={"#f8f9fa"}
      _hover={{
        background: tinycolor("#f8f9fa").darken(5).toString(),
      }}
      alignItems={"center"}
      justify={"space-between"}
      p={"10px"}
    >
      <Flex flexDir={"column"}>
        <Flex alignItems={"center"} gap={"5px"}>
          <Flex fontWeight={700} color={value ? "black" : "#373737ff"}>
            {formatString(
              (isWorkOrderViewOwnedOrViewAll(module, permission)
                ? isWorkOrderViewOwnedOrViewAll(module, permission)
                : permission.permission === "view"
                ? "view_all"
                : permission.permission +
                  (module.name === "members" && permission.permission !== "view"
                    ? "s"
                    : "")) +
                "_" +
                (module.name === "members" && permission.permission !== "view"
                  ? ""
                  : module.name),
              true,
              true,
              true
            )}
          </Flex>
          {getTooltipDescription(permission.permission) ? (
            <Tooltip
              placement="top"
              hasArrow
              label={getTooltipDescription(permission.permission)}
            >
              <Flex fontSize={"20px"} color={"#848484"}>
                <IoMdInformationCircleOutline />
              </Flex>
            </Tooltip>
          ) : (
            ""
          )}
        </Flex>
        <Flex fontSize={"14px"} color={"#848484"}>
          {isWorkOrderViewOwnedOrViewDescription(module, permission) ||
            permission?.description}
        </Flex>
        {isWorkOrderViewOwnedOrViewRequirement(module, permission) ||
        formatRequirement(permission?.requirement, module) ? (
          <Flex alignItems={"center"} fontSize={"14px"} color={"#dc143c"}>
            <Flex fontWeight={700}>Requires:&nbsp;</Flex>
            <Flex color={"black"} alignItems={"center"}>
              {isWorkOrderViewOwnedOrViewRequirement(module, permission) ||
                formatRequirement(permission?.requirement)}
            </Flex>
          </Flex>
        ) : (
          ""
        )}
        {/* {isWorkOrderViewOwnedOrViewRequirement(module, permission) ||
        formatRequirement(permission?.conflicts) ? (
          <Flex alignItems={"center"} fontSize={"14px"} color={"#7059ff"}>
            <Flex fontWeight={700}>Conflicts:&nbsp;</Flex>
            <Flex color={"black"}>
              {isWorkOrderViewOwnedOrViewRequirement(module, permission) ||
                formatRequirement(permission?.conflicts)}
            </Flex>
          </Flex>
        ) : (
          ""
        )} */}
      </Flex>
      <Flex
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        <Switch
          onChange={(e) => {
            permissionSwitchHandler(module, permission);
          }}
          onClick={(e) => e.stopPropagation()}
          isChecked={value}
          // isChecked={switchToggle}
        />
      </Flex>
    </Flex>
  );
}
