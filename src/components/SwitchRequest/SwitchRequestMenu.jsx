import React, { useState } from "react";
import {
  Flex,
  useDisclosure,
  Icon,
  Divider,
  ModalOverlay,
  ModalContent,
  ModalCloseButton,
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Box,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  TableContainer,
  Table,
  TableCaption,
  Thead,
  Tr,
  Th,
  Tbody,
  Td,
  Tfoot,
  Tooltip,
} from "@chakra-ui/react";
import { FaEllipsisVertical, FaMagnifyingGlass } from "react-icons/fa6";
import { FaRegEdit, FaRegTrashAlt, FaVoteYea } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import Can from "../../utils/Can";
import { LuClipboardCopy, LuVote } from "react-icons/lu";
import { BsFileEarmarkText } from "react-icons/bs";
export default function SwitchRequestMenu({
  handleOpenSwitchRequestDetailModal,
  status,
  UID,
}) {
  const nav = useNavigate();

  return (
    <Flex justifyContent={"center"}>
      <Flex gap={"15px"} fontSize={"20px"} justify={"space-between"}>
        <Tooltip
          hasArrow
          background={status === "pending" ? "#007BFF" : "black"}
          placement={"top"}
          label={status === "pending" ? "Respond" : "Details"}
          aria-label="A tooltip"
          color={"white"}
        >
          <Flex
            color={status === "pending" ? "#007BFF" : "black"}
            onClick={() => {
              handleOpenSwitchRequestDetailModal(UID);
            }}
            cursor={"pointer"}
          >
            {status === "pending" ? <LuClipboardCopy /> : <FaMagnifyingGlass />}
          </Flex>
        </Tooltip>
      </Flex>
    </Flex>
  );
}
