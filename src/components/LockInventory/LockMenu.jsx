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
import { FaRegEdit, FaRegTrashAlt } from "react-icons/fa";
import LockDetailsModal from "./LockDetailsModal";
import { useLocation, useNavigate } from "react-router-dom";
import Can from "../../utils/Can";
import LockDownloadQRCode from "./LockDownloadQRCode";
export default function LockMenu({
  val,
  handleOpenDeleteLockModal,
  handleOpenLockDetailsModal,
  pageModule,
}) {
  const nav = useNavigate();
  const location = useLocation();

  return (
    <Flex justifyContent={"center"}>
      <Flex gap={"15px"} fontSize={"20px"} justify={"space-between"}>
        <LockDetailsModal val={val} />
        <Tooltip
          hasArrow
          placement={"top"}
          label="Details"
          aria-label="A tooltip"
          color={"white"}
        >
          <Flex
            onClick={() => {
              handleOpenLockDetailsModal(val);
            }}
            cursor={"pointer"}
          >
            <FaMagnifyingGlass />
          </Flex>
        </Tooltip>
        <Can module={pageModule} permission={["manage"]}>
          <Tooltip
            hasArrow
            placement={"top"}
            background={"#007BFF"}
            label={"Edit"}
            aria-label="A tooltip"
            color={"white"}
          >
            <Flex
              onClick={() => {
                nav(`/lock-inventory/edit/${val.UID}${location.search}`);
              }}
              cursor={"pointer"}
              color={"#007BFF"}
            >
              <FaRegEdit />
            </Flex>
          </Tooltip>
        </Can>
        <LockDownloadQRCode lock={val} />
        <Can module={pageModule} permission={["manage"]}>
          <Tooltip
            hasArrow
            placement={"top"}
            label="Delete"
            aria-label="A tooltip"
            background={"crimson"}
            color={"white"}
          >
            <Flex
              cursor={"pointer"}
              color={"crimson"}
              onClick={() => {
                handleOpenDeleteLockModal(val.UID);
              }}
            >
              <FaRegTrashAlt />
            </Flex>
          </Tooltip>
        </Can>
      </Flex>
    </Flex>
  );
}
