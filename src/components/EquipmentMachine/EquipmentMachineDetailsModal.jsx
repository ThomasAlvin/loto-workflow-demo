import {
  Button,
  Divider,
  Flex,
  Image,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Tag,
  TagLabel,
} from "@chakra-ui/react";
import { CgNotes } from "react-icons/cg";
import { FaInfoCircle, FaTag, FaThLarge } from "react-icons/fa";
import { FaHashtag, FaMapLocation, FaScrewdriverWrench } from "react-icons/fa6";
import { useNavigate } from "react-router-dom";
import tableStatusStyleMapper from "../../utils/tableStatusStyleMapper";

export default function EquipmentMachineDetailsModal({
  selectedEquipmentMachineDetails,
  onClose,
  isOpen,
}) {
  const nav = useNavigate();
  const IMGURL = import.meta.env.VITE_API_IMAGE_URL;

  function handleCloseModal() {
    onClose();
  }
  const { bgColor, textColor, icon, text } = tableStatusStyleMapper(
    selectedEquipmentMachineDetails?.status
  );
  return (
    <Modal isOpen={isOpen} onClose={handleCloseModal} isCentered>
      <ModalOverlay />
      <ModalContent maxW={"800px"} maxH={"90vh"} overflow={"auto"} bg={"white"}>
        <ModalHeader p={0} display={"flex"} gap={"10px"} alignItems={"center"}>
          <Flex flexDir={"column"} w={"100%"}>
            <Flex
              borderTopLeftRadius={"8px"}
              borderTopRightRadius={"8px"}
              bgGradient="linear(to-b, #ededed 50%, white 50%)"
              gap={"20px"}
              flexDir={"column"}
              w={"100%"}
              p={"20px"}
              pb={"10px"}
            >
              <Flex justifyContent={"space-between"} alignItems={"center"}>
                <Flex
                  background={
                    selectedEquipmentMachineDetails?.main_image_url
                      ? "white"
                      : "#848484"
                  }
                  justifyContent={"center"}
                  alignItems={"center"}
                  border={"2px solid #dc143c"}
                  borderRadius={"100%"}
                >
                  <Flex color={"white"} fontSize={"48px"}>
                    {selectedEquipmentMachineDetails?.main_image_url ? (
                      <Image
                        h={"96px"}
                        w={"96px"}
                        borderRadius={"100%"}
                        src={
                          IMGURL +
                          selectedEquipmentMachineDetails?.main_image_url
                        }
                      ></Image>
                    ) : (
                      <FaScrewdriverWrench />
                    )}
                  </Flex>
                </Flex>
                <Flex
                  alignSelf={"stretch"}
                  justify={"center"}
                  flexDir={"column"}
                >
                  {/* <Button
                    mt={"50px"}
                    background={"white"}
                    h={"32px"}
                    gap={"5px"}
                    px={"10px"}
                    _hover={{ background: "#dc143c", color: "white" }}
                    color={"#dc143c"}
                    alignItems={"center"}
                    border={"2px solid #dc143c"}
                    onClick={() => {
                      nav(`/lock/edit/${selectedEquipmentMachineDetails?.UID}`);
                    }}
                  >
                    <Flex>
                      <FaEdit />
                    </Flex>
                    <Flex>Edit Lock</Flex>
                  </Button> */}
                </Flex>
              </Flex>
            </Flex>
            <Flex px={"20px"} pb={"10px"} flexDir={"column"}>
              <Flex justify={"space-between"}>
                <Flex>{selectedEquipmentMachineDetails?.name}</Flex>
              </Flex>
              <Flex color={"#848484"} fontSize={"16px"} fontWeight={400}>
                {selectedEquipmentMachineDetails?.model}
              </Flex>
            </Flex>
            <Flex
              px={"20px"}
              gap={"5px"}
              alignItems={"center"}
              color={"#848484"}
              fontSize={"14px"}
              fontWeight={400}
            ></Flex>
          </Flex>
        </ModalHeader>
        <Divider m={0} borderColor={"#bababa"} />

        <ModalBody p={0}>
          <Flex flexDir={"column"}>
            <Flex alignItems={"stretch"} justify={"center"} gap={"20px"}></Flex>
            <Flex bg={"#d6d6d6"} w={"100%"} h={"1px"}></Flex>

            <Flex bg={"#f8f9fa"} p={"20px"} gap={"20px"} flexDir={"column"}>
              <Flex justify={"space-between"}>
                <Flex w={"55%"} flexDir={"column"}>
                  <Flex fontWeight={700} alignItems={"center"} gap={"5px"}>
                    <Flex color={"#848484"} fontSize={"14px"}>
                      <FaTag />
                    </Flex>
                    <Flex>Machine ID :</Flex>
                  </Flex>
                  <Flex color={"#848484"}>
                    {selectedEquipmentMachineDetails?.custom_machine_id ??
                      "Not set"}
                  </Flex>
                </Flex>
                <Flex w={"45%"} flexDir={"column"}>
                  <Flex fontWeight={700} alignItems={"center"} gap={"5px"}>
                    <Flex color={"#848484"} fontSize={"20px"}>
                      <FaHashtag />
                    </Flex>
                    <Flex fontWeight={700}>Serial Number :</Flex>
                  </Flex>
                  <Flex color={"#848484"}>
                    {selectedEquipmentMachineDetails?.serial_number ??
                      "Not Set"}
                  </Flex>
                </Flex>
              </Flex>
              <Flex justify={"space-between"}>
                <Flex w={"55%"} flexDir={"column"}>
                  <Flex fontWeight={700} alignItems={"center"} gap={"5px"}>
                    <Flex color={"#848484"} fontSize={"16px"}>
                      <FaInfoCircle />
                    </Flex>
                    <Flex fontWeight={700}>Status :</Flex>
                  </Flex>
                  <Flex>
                    <Flex
                      fontWeight={700}
                      borderRadius={"10px"}
                      px={"8px"}
                      py={"4px"}
                      alignItems={"center"}
                      gap={"5px"}
                      fontSize={"14px"}
                      bg={bgColor}
                      color={textColor}
                    >
                      <Flex fontSize={"16px"}>{icon}</Flex>
                      <Flex>{text}</Flex>
                    </Flex>
                  </Flex>
                </Flex>
                <Flex w={"45%"} flexDir={"column"}>
                  <Flex fontWeight={700} alignItems={"center"} gap={"5px"}>
                    <Flex color={"#848484"} fontSize={"16px"}>
                      <FaMapLocation />
                    </Flex>
                    <Flex fontWeight={700}>Location :</Flex>
                  </Flex>
                  <Flex color={"#848484"}>
                    {selectedEquipmentMachineDetails?.location ?? "Not set"}
                  </Flex>
                </Flex>
              </Flex>
              <Flex justify={"space-between"}>
                <Flex w={"55%"} flexDir={"column"}>
                  <Flex fontWeight={700} alignItems={"center"} gap={"5px"}>
                    <Flex color={"#848484"} fontSize={"16px"}>
                      <FaThLarge />
                    </Flex>
                    <Flex fontWeight={700}>Category :</Flex>
                  </Flex>
                  <Flex color={"#848484"}>
                    <Flex
                      pt={"5px"}
                      flexWrap={"wrap"}
                      color={"#848484"}
                      gap={"5px"}
                    >
                      {selectedEquipmentMachineDetails?.categories?.length >
                      0 ? (
                        selectedEquipmentMachineDetails.categories.map(
                          (item, index) => (
                            <Tag
                              transition={"background 0.2s ease-in-out"}
                              key={index}
                              size={"sm"}
                              borderRadius="full"
                              variant="solid"
                              bg={"#f8f9fa"}
                              color={"#848484"}
                              border={"#848484 1px solid"}
                              gap={"5px"}
                              alignItems={"center"}
                            >
                              <Flex
                                minW={"6px"}
                                minH={"6px"}
                                bg={"#848484"}
                                borderRadius={"100%"}
                              ></Flex>
                              <TagLabel>{item.name}</TagLabel>
                            </Tag>
                          )
                        )
                      ) : (
                        <Flex color={"#848484"} fontSize={"14px"}>
                          No categories selected.
                        </Flex>
                      )}
                    </Flex>
                    {/* {selectedEquipmentMachineDetails?.categories} */}
                  </Flex>
                </Flex>
                <Flex w={"45%"} flexDir={"column"}>
                  <Flex fontWeight={700} alignItems={"center"} gap={"5px"}>
                    <Flex color={"#848484"} fontSize={"16px"}>
                      <CgNotes />
                    </Flex>
                    <Flex fontWeight={700}>Additional Notes :</Flex>
                  </Flex>
                  <Flex color={"#848484"}>
                    {selectedEquipmentMachineDetails?.additional_notes ??
                      "Not set"}
                  </Flex>
                </Flex>
              </Flex>
            </Flex>
          </Flex>
        </ModalBody>
        <Divider m={0} borderColor={"#bababa"} />
        <ModalFooter p={"20px"} w={"100%"} justifyContent={"center"}>
          <Flex w={"100%"} justify={"end"}>
            <Button
              background={"#dc143c"}
              h={"32px"}
              color={"white"}
              gap={"10px"}
              alignItems={"center"}
              onClick={handleCloseModal}
            >
              <Flex>Close</Flex>
            </Button>
          </Flex>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
