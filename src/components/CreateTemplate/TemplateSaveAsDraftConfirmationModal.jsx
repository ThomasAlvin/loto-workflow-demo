import {
  Box,
  Button,
  Divider,
  Flex,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  useDisclosure,
} from "@chakra-ui/react";
import { useState } from "react";

import { MdOutlineDriveFolderUpload } from "react-icons/md";
import { api } from "../../api/api";
import Swal from "sweetalert2";
import SwalErrorMessages from "../SwalErrorMessages";
import { useNavigate, useParams } from "react-router-dom";
import { RiDraftLine } from "react-icons/ri";

export default function TemplateSaveAsDraftConfirmationModal({
  submitTemplate,
  templateDetails,
}) {
  const { isOpen, onClose, onOpen } = useDisclosure();
  const [titleInput, setTitleInput] = useState("");
  const [showTitleInput, setShowTitleInput] = useState(false);
  const [buttonLoading, setButtonLoading] = useState(false);
  async function submitHandler() {
    if (templateDetails.name || titleInput) {
      submitTemplate("draft", setButtonLoading, handleClose, titleInput);
    } else {
      setButtonLoading(true);
      setTimeout(() => {
        setButtonLoading(false);
        setShowTitleInput(true);
      }, 1000);
    }
  }
  function inputHandler(event) {
    const { value } = event.target;
    setTitleInput(value);
  }
  function handleClose() {
    setTitleInput("");
    setShowTitleInput(false);
    onClose();
  }
  return (
    <>
      <Button
        onClick={onOpen}
        gap={"5px"}
        fontSize={"14px"}
        bg={"#dc143c"}
        color={"white"}
        h={"auto"}
        p={"6px 12px"}
        alignItems={"center"}
      >
        <Flex fontSize={"18px"}>
          <RiDraftLine />
        </Flex>
        <Flex>Save as draft</Flex>
      </Button>

      <Modal
        closeOnOverlayClick={!buttonLoading}
        isOpen={isOpen}
        onClose={handleClose}
        isCentered
        closeOnEsc={!buttonLoading}
      >
        <ModalOverlay />
        <ModalContent bg={"white"} overflow={"auto"}>
          <ModalHeader
            display={"flex"}
            gap={"10px"}
            alignItems={"center"}
            color={"#dc143c"}
          >
            <Flex flexDir={"column"}>
              <Flex>Save as draft?</Flex>
              <Box
                fontWeight={700}
                color={"#848484"}
                fontSize={"16px"}
                as="span"
                flex="1"
                textAlign="left"
              ></Box>
            </Flex>
          </ModalHeader>
          <ModalCloseButton isDisabled={buttonLoading} color={"black"} />
          <Divider m={0} />

          <ModalBody>
            <Flex flexDir={"column"} gap={"20px"}>
              <Flex flexDir={"column"} gap={"10px"}>
                <Flex flexDir={"column"}>
                  <Box fontWeight={700} as="span" flex="1" textAlign="left">
                    {showTitleInput ? `` : "Save this template as draft?"}
                  </Box>
                  <Flex fontSize={"14px"} color={"#848484"}>
                    {showTitleInput
                      ? `Before saving it as draft, Please provide a name for the template`
                      : `You can edit the template anytime through the template list`}
                  </Flex>
                </Flex>
              </Flex>
              {showTitleInput ? (
                <Flex flexDir={"column"}>
                  <Flex fontWeight={700}>Template Title</Flex>
                  <Input
                    value={titleInput}
                    onChange={inputHandler}
                    placeholder="LOTO General Work Flow"
                  ></Input>
                </Flex>
              ) : (
                ""
              )}
            </Flex>
          </ModalBody>
          <Divider m={0} />
          <ModalFooter gap={"10px"} w={"100%"} justifyContent={"end"}>
            <Button
              _hover={{ background: "#dc143c", color: "white" }}
              background={"white"}
              border={"1px solid #dc143c"}
              color={"#dc143c"}
              onClick={handleClose}
              isLoading={buttonLoading}
            >
              Cancel
            </Button>
            <Button
              isDisabled={showTitleInput && !titleInput ? true : false}
              _hover={{ background: "#b51031" }}
              background={"#dc143c"}
              color={"white"}
              onClick={() => {
                submitHandler();
              }}
              isLoading={buttonLoading}
            >
              Save as draft
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}
