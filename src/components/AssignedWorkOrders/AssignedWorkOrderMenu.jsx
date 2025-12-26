import { Flex, Tooltip } from "@chakra-ui/react";
import { useLocation, useNavigate } from "react-router-dom";
import { LuClipboardCopy, LuCopyPlus } from "react-icons/lu";
import { FaMagnifyingGlass } from "react-icons/fa6";
export default function AssignedWorkOrderMenu({
  stepUID,
  val,
  isDisabled,
  handleWorkOrderNavigate,
  showResponseIcon,
  showRequireMobileSwalError,
  isDeleted,
}) {
  const nav = useNavigate();
  const location = useLocation(); // gives you { pathname, search, ... }

  return (
    <Flex w={"100%"} justify={"center"}>
      <Flex
        pointerEvents={isDeleted ? "none" : "auto"}
        w={"100%"}
        justify={"center"}
      >
        <Flex gap={"15px"} fontSize={"20px"} justify={"center"}>
          <Tooltip
            hasArrow
            placement={"top"}
            label="Details"
            aria-label="A tooltip"
          >
            <Flex
              onClick={() => {
                nav(
                  `/work-order/${val.UID}${
                    location.search ? location.search + "&" : "?"
                  }from=assigned-work-order`
                );
              }}
              cursor={"pointer"}
            >
              <FaMagnifyingGlass />
            </Flex>
          </Tooltip>
          {showResponseIcon ? (
            <Tooltip
              hasArrow
              placement={"top"}
              label="Respond"
              aria-label="A tooltip"
            >
              <Flex
                onClick={() => {
                  if (isDisabled) {
                    showRequireMobileSwalError();
                  } else {
                    handleWorkOrderNavigate(
                      val.action_status,
                      val.status === "under_review" ? true : false,
                      val.UID,
                      val?.latest_work_order_review?.UID,
                      stepUID,
                      isDisabled
                    );
                  }
                }}
                color={"#007BFF"}
                cursor={"pointer"}
              >
                <LuClipboardCopy />
              </Flex>
            </Tooltip>
          ) : (
            ""
          )}
        </Flex>
      </Flex>
    </Flex>
  );
}
