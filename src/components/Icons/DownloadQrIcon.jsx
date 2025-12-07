import { Flex } from "@chakra-ui/react";
import { BsQrCode } from "react-icons/bs";
import { IoMdDownload } from "react-icons/io";

export default function DownloadQrIcon() {
  return (
    <Flex position={"relative"}>
      <BsQrCode />
      <Flex
        bg={"#F8F9FA"}
        position={"absolute"}
        // scale={0.5}
        fontSize={"13px"}
        bottom={"-4px"}
        right={"-4px"}
        borderRadius={"full"}
      >
        <IoMdDownload />
      </Flex>
    </Flex>
  );
}
