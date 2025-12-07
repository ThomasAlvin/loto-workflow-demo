import { Flex, Image, Td, Tr } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import emptyIllustration from "../assets/images/EmptyStateImage.png";

export default function ListEmptyState({
  size = "md",
  colSpan,
  header1,
  header2,
  link,
  linkText,
  isTable = true,
}) {
  const nav = useNavigate();
  return (
    <>
      {isTable ? (
        <Tr>
          <Td colSpan={colSpan}>
            <Flex
              w={"100%"}
              justifyContent={"center"}
              py={size === "xs" ? "20px" : "40px"}
              flexDir={"column"}
              alignItems={"center"}
              fontSize={size === "xs" ? "14px" : "16px"}
            >
              <Image
                w={
                  size === "xs"
                    ? "120px"
                    : size === "sm"
                    ? "150px"
                    : size === "md"
                    ? "200px"
                    : "200px"
                }
                src={emptyIllustration}
              ></Image>
              <Flex flexDir={"column"} gap={"5px"} alignItems={"center"}>
                <Flex color={"#dc143c"} fontWeight={700}>
                  {header1}
                </Flex>
                <Flex color={"#848484"}>
                  {link && linkText ? (
                    <Flex
                      cursor={"pointer"}
                      onClick={() => {
                        nav(link);
                      }}
                      color={"#dc143c"}
                      textDecor={"underline"}
                    >
                      {linkText}
                    </Flex>
                  ) : (
                    ""
                  )}
                  <Flex>&nbsp;{header2}</Flex>
                </Flex>
              </Flex>
            </Flex>
          </Td>
        </Tr>
      ) : (
        <Flex
          w={"100%"}
          justifyContent={"center"}
          py={"40px"}
          flexDir={"column"}
          alignItems={"center"}
        >
          <Image
            w={size === "sm" ? "150px" : size === "md" ? "200px" : "200px"}
            src={emptyIllustration}
          ></Image>
          <Flex flexDir={"column"} gap={"5px"} alignItems={"center"}>
            <Flex color={"#dc143c"} fontWeight={700}>
              {header1}
            </Flex>
            <Flex color={"#848484"}>
              {linkText ? (
                <Flex
                  cursor={link ? "pointer" : "default"}
                  onClick={
                    link
                      ? () => {
                          nav(link);
                        }
                      : ""
                  }
                  color={link ? "#dc143c" : "#848484"}
                  textDecor={link ? "underline" : "none"}
                >
                  {linkText}
                </Flex>
              ) : (
                ""
              )}
              <Flex>&nbsp;{header2}</Flex>
            </Flex>
          </Flex>
        </Flex>
      )}
    </>
  );
}
