import { Button, Flex, Tooltip } from "@chakra-ui/react";
import { FaRegTrashAlt } from "react-icons/fa";
import DeleteSelectedConfirmationModal from "./DeleteSelectedConfirmationModal";

export default function SelectedActionBar({
  variant,
  resetFunction,
  pageModule,
  deleteSelectedFunction,
  deleteSelectedButtonLoading,
  selectedUID,
  deleteSelectedDisclosure,
}) {
  const sidebarWidth = 280;
  return (
    <Flex
      opacity={selectedUID?.length ? 1 : 0}
      pointerEvents={selectedUID?.length ? "auto" : "none"}
      transition={"opacity ease-in-out 0.1s"}
      borderRadius={"10px"}
      position="fixed"
      bottom="20px"
      left={`calc(${sidebarWidth / 2}px + 50%)`}
      transform="translate(-50%, 0%)"
      width="400px"
      bg="gray.700"
      color="white"
      p={4}
      justify="space-between"
      align="center"
    >
      <Flex>{selectedUID?.length} Items Selected</Flex>
      <Flex gap={2}>
        <Button
          color={"#dc143c"}
          bg={"white"}
          border={"1px solid #dc143c"}
          size="sm"
          isLoading={deleteSelectedButtonLoading}
          onClick={resetFunction}
        >
          Reset
        </Button>
        <DeleteSelectedConfirmationModal
          variant={variant}
          pageModule={pageModule}
          selectedCount={selectedUID?.length}
          deleteSelectedFunction={deleteSelectedFunction}
          deleteSelectedButtonLoading={deleteSelectedButtonLoading}
          deleteSelectedDisclosure={deleteSelectedDisclosure}
        />
      </Flex>
    </Flex>
  );
}
