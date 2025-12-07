import React from "react";
import { Flex, Tooltip } from "@chakra-ui/react";
import { FaRegEdit, FaRegTrashAlt } from "react-icons/fa";
import { useLocation, useNavigate } from "react-router-dom";
import Can from "../../utils/Can";
import EquipmentMachineDownloadQRCode from "./EquipmentMachineDownloadQRCode";
import { FaMagnifyingGlass } from "react-icons/fa6";
export default function EquipmentMachineMenu({
  pageModule,
  val,
  handleOpenEquipmentMachineDetailsModal,
  handleOpenDeleteEquipmentMachineModal,
}) {
  const location = useLocation();

  const nav = useNavigate();
  return (
    <Flex>
      <Flex gap={"15px"} fontSize={"20px"} justify={"space-between"}>
        <Tooltip
          hasArrow
          placement={"top"}
          label="Details"
          aria-label="A tooltip"
          color={"white"}
        >
          <Flex
            onClick={() => {
              handleOpenEquipmentMachineDetailsModal(val);
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
                nav(`/equipment-machine/edit/${val?.UID}${location.search}`);
              }}
              cursor={"pointer"}
              color={"#007BFF"}
            >
              <FaRegEdit />
            </Flex>
          </Tooltip>
        </Can>
        <EquipmentMachineDownloadQRCode UID={val?.UID} name={val.name} />
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
              onClick={() => {
                handleOpenDeleteEquipmentMachineModal(val.UID);
              }}
              cursor={"pointer"}
              color={"crimson"}
            >
              <FaRegTrashAlt />
            </Flex>
          </Tooltip>
        </Can>
      </Flex>
    </Flex>
  );
}
