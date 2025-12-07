import {
  Avatar,
  Button,
  Flex,
  Grid,
  GridItem,
  Tooltip,
} from "@chakra-ui/react";
import { memo, useState } from "react";
import { FaRegBell, FaUserAlt } from "react-icons/fa";
import dynamicPropsComparator from "../utils/dynamicPropsComparator";
import labelizeRole from "../utils/labelizeRole";

function MemberGroupList({
  memberArray,
  handleOpenSendReminder,
  hasManagePermission,
  fullWidth = false,
  grayBg = true,
  hasShowMore = true,
  isPDF = false,
  isDataUserFirst = false,
  isReport = false,
  emptyMessage = "Not Assigned Yet",
}) {
  const IMGURL = import.meta.env.VITE_API_IMAGE_URL;
  const [showMore, setShowMore] = useState(false);
  const showMoreLimit = 5;
  const modifiedMemberArray = isDataUserFirst
    ? memberArray.map((memArr) => ({ ...memArr.member, user: memArr }))
    : isReport
    ? memberArray.map((memArr) => ({
        ...memArr,
        user: {
          first_name: memArr.first_name,
          last_name: memArr.last_name,
          profile_image_url: memArr.profile_image_url,
          is_superadmin: memArr?.is_superadmin,
        },
      }))
    : memberArray;
  const summarizedMember =
    showMore || !hasShowMore
      ? modifiedMemberArray
      : modifiedMemberArray.slice(0, showMoreLimit - 1);

  return (
    <Flex flexDir={"column"} gap={"10px"}>
      {summarizedMember.length ? (
        <Grid templateColumns={`repeat(${fullWidth ? 1 : 2}, 1fr)`} gap={4}>
          {summarizedMember.map((member, memberIndex) => (
            <GridItem>
              <Flex
                w={"100%"}
                p={"10px"}
                bg={grayBg ? "#f8f9fa" : "white"}
                boxShadow={isPDF ? "" : "0px 0px 3px rgba(50,50,93,0.5)"}
                border={isPDF ? "1px solid #bababa" : ""}
                justify={"space-between"}
                alignItems={"center"}
              >
                <Flex alignItems={"center"} gap={"10px"}>
                  {member?.user.first_name ? (
                    <Flex
                      borderRadius={"full"}
                      border={isPDF ? "1px solid #dc143c" : ""}
                    >
                      <Avatar
                        outline={"1px solid #dc143c"}
                        border={"2px solid white"}
                        key={member?.id + "_" + memberIndex}
                        name={
                          member.user.first_name + " " + member.user.last_name
                        }
                        src={
                          member?.user.profile_image_url
                            ? IMGURL + member?.user.profile_image_url
                            : null
                        }
                        onClick={() => {
                          console.log(member?.user.id + "_" + memberIndex);
                          console.log(member?.user.id);
                          console.log(member);
                        }}
                      ></Avatar>
                    </Flex>
                  ) : (
                    <Flex
                      outline={"1px solid #dc143c"}
                      bg={"#bababa"}
                      borderRadius={"100%"}
                      justifyContent={"center"}
                      alignItems={"center"}
                      h={"48px"}
                      w={"48px"}
                      border={"2px solid white"}
                    >
                      <Flex color={"white"} fontSize={"24px"}>
                        <FaUserAlt />
                      </Flex>
                    </Flex>
                  )}
                  <Flex flexDir={"column"}>
                    <Flex fontWeight={700} wordBreak={"break-word"}>
                      {member
                        ? member?.user.first_name + " " + member?.user.last_name
                        : "-"}
                    </Flex>
                    <Flex fontWeight={400} fontSize={"14px"} color={"#848484"}>
                      {member.user.is_superadmin
                        ? "Super Admin"
                        : labelizeRole(member?.role)}
                      {member?.employee_id ? " - " + member?.employee_id : ""}
                    </Flex>
                  </Flex>
                </Flex>
                {handleOpenSendReminder && hasManagePermission ? (
                  <Flex>
                    <Tooltip
                      hasArrow
                      openDelay={300}
                      closeDelay={100}
                      bg={"#dc143c"}
                      placement="top"
                      label="Send Reminder"
                    >
                      <Button
                        onClick={() =>
                          handleOpenSendReminder(member, "assignee")
                        }
                        position={"static"}
                        _hover={{ bg: "#dc143c", color: "white" }}
                        boxShadow={"0px 0px 3px rgba(50,50,93,0.5)"}
                        bg={"white"}
                        color={"#dc143c"}
                        h={"auto"}
                        p={"12px"}
                        borderRadius={"100%"}
                      >
                        <Flex w={"16px"} h={"16px"}>
                          <FaRegBell />
                        </Flex>
                      </Button>
                    </Tooltip>
                  </Flex>
                ) : (
                  ""
                )}
              </Flex>
            </GridItem>
          ))}
        </Grid>
      ) : (
        <Flex alignItems={"center"} gap={"10px"}>
          <Flex
            outline={"1px solid #dc143c"}
            bg={"#bababa"}
            borderRadius={"100%"}
            justifyContent={"center"}
            alignItems={"center"}
            h={"48px"}
            w={"48px"}
            border={"2px solid white"}
          >
            <Flex color={"white"} fontSize={"24px"}>
              <FaUserAlt />
            </Flex>
          </Flex>
          <Flex color={"#848484"}>{emptyMessage}</Flex>
        </Flex>
      )}

      {memberArray.length >= showMoreLimit && hasShowMore ? (
        <>
          <Flex
            h={summarizedMember.length < showMoreLimit ? "20px" : "0px"}
            pl={"5px"}
            color={"#848484"}
          >
            {summarizedMember.length < showMoreLimit ? "..." : ""}
          </Flex>

          <Flex
            fontSize={"14px"}
            color={"#dc143c"}
            textDecor={"underline"}
            cursor={"pointer"}
            onClick={() => setShowMore((prevState) => !prevState)}
          >
            {showMore ? "Show Less" : "Show More"}
          </Flex>
        </>
      ) : (
        ""
      )}
    </Flex>
  );
}
export default memo(MemberGroupList, dynamicPropsComparator);
