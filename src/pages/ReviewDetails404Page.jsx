import { Button, Center, Flex, Image } from "@chakra-ui/react";
import image404 from "../assets/images/404-page.png";
import { FaArrowLeftLong } from "react-icons/fa6";
import { Link } from "react-router-dom";

export default function ReviewDetails404Page() {
  return (
    <Center flexDir={"column"} w={"100%"} h={"100vh"}>
      <Flex color={"#dc143c"} fontSize={"56px"} fontWeight={700}>
        OOPS...
      </Flex>
      <Image w={"30%"} src={image404}></Image>
      <Center flexDir={"column"} gap={"20px"}>
        <Center flexDir={"column"}>
          <Flex color={"#dc143c"} fontWeight={700} fontSize={"32px"}>
            The review you are looking for doesn't exist
          </Flex>
          <Flex fontSize={"16px"} color={"#848484"}>
            The review might be deleted or it never existed
          </Flex>
        </Center>
        <Link to="/review">
          <Button color={"white"} bg={"#dc143c"}>
            <Flex alignItems={"center"} gap={"10px"}>
              <FaArrowLeftLong />
              Back to home
            </Flex>
          </Button>
        </Link>
      </Center>
    </Center>
  );
}
