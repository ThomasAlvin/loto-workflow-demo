import { Flex, Icon, Tooltip, useDisclosure } from "@chakra-ui/react";
import { useReactFlow } from "@xyflow/react";
import { FaExpand, FaTrashAlt } from "react-icons/fa";
import { FiZoomIn, FiZoomOut } from "react-icons/fi";
import { IoIosLock, IoIosUnlock } from "react-icons/io";
import { LuLayoutGrid } from "react-icons/lu";
import { MdOutlineZoomInMap, MdOutlineZoomOutMap } from "react-icons/md";
import autoArrangeNodes from "../utils/autoArrangeNodes";
import ConfirmationModal from "./ConfirmationModal";

export default function CustomReactFlowControls({
  isFullScreen,
  setIsFullScreen,
  fullScreen,
  lockInteractivity,
  setLockInteractivity,
  editable,
  formikSetValues,
  variant,
}) {
  const {
    zoomIn,
    zoomOut,
    fitView,
    setViewport,
    getNodes,
    getEdges,
    setCenter,
    setNodes,
    setEdges,
  } = useReactFlow();
  const deleteAllDisclosure = useDisclosure();
  const buttonOptions = [
    ...(fullScreen
      ? ""
      : [
          {
            label: isFullScreen ? "Exit Full Screen" : "Full Screen",
            icon: isFullScreen ? MdOutlineZoomInMap : MdOutlineZoomOutMap,
            onClick: () => setIsFullScreen((prevState) => !prevState),
          },
        ]),
    {
      label: "Zoom In",
      icon: FiZoomIn,
      onClick: () => zoomIn(),
    },
    {
      label: "Zoom Out",
      icon: FiZoomOut,
      onClick: () => zoomOut(),
    },
    {
      label: "Fit Screen",
      icon: FaExpand,
      onClick: () =>
        fitView({
          padding: 0.2,
          duration: 800,
          easing: "smooth",
        }),
    },
    ...(editable
      ? [
          {
            label: "Auto Arrange",
            icon: LuLayoutGrid,
            onClick: () => handleReorganize(),
          },
        ]
      : []),
    ...(editable
      ? [
          {
            label: lockInteractivity ? "Unlock Screen" : "Lock Screen",
            icon: lockInteractivity ? IoIosUnlock : IoIosLock,
            onClick: () => setLockInteractivity((prevState) => !prevState),
          },
        ]
      : []),
    ...(editable
      ? [
          {
            label: "Delete All",
            icon: FaTrashAlt,
            onClick: () => deleteAllDisclosure.onOpen(),
            fontSize: "20px",
          },
        ]
      : []),
  ];

  async function handleReorganize() {
    const newNodes = await autoArrangeNodes(
      getNodes(),
      getEdges().filter((edge) => edge.sourceHandle !== "loop-back"),
      "TB"
    );

    setNodes(newNodes);
    fitView({
      padding: 0.2,
      duration: 800, // in ms
      easing: "smooth",
    });
  }

  function deleteAll() {
    setNodes([]);
    setEdges([]);
    formikSetValues((prevState) => ({
      ...prevState,
      [variant === "template" ? "templateSteps" : "workOrderSteps"]: [],
    }));
    deleteAllDisclosure.onClose();
  }
  return (
    <>
      <Flex
        position={"absolute"}
        bottom={isFullScreen ? "20px" : "10px"}
        left={isFullScreen ? "20px" : "10px"}
        zIndex={10}
        gap={"10px"}
      >
        {buttonOptions.map((val) => (
          <Tooltip placement="top" hasArrow label={val.label}>
            <Flex
              p={"5px"}
              w={"34px"}
              h={"34px"}
              _hover={{ color: "#dc143c" }}
              bg={"white"}
              boxShadow={"0px 0px 3px rgba(50,50,93,0.5)"}
              cursor={"pointer"}
              onClick={val.onClick}
              justifyContent={"center"}
              alignItems={"center"}
            >
              <Flex
                fontSize={val?.fontSize || "24px"}
                flexDir={"column"}
                gap={"10px"}
              >
                <Icon as={val?.icon}></Icon>
              </Flex>
            </Flex>
          </Tooltip>
        ))}
      </Flex>

      <ConfirmationModal
        header={"Delete All?"}
        header2={"Are you sure you want to delete all nodes and connections?"}
        body={"This action cannot be undone"}
        confirmationLabel={"Delete"}
        confirmationFunction={deleteAll}
        confirmationDisclosure={deleteAllDisclosure}
      />
    </>
  );
}
