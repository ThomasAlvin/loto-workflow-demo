import { Flex } from "@chakra-ui/react";
import formatString from "../../utils/formatString";
import moment from "moment";

export default function SubscriptionStatus({ subscription }) {
  return (
    <Flex flexDir={"column"}>
      <Flex fontSize={"24px"} fontWeight={700}>
        {subscription?.status ? formatString(subscription?.status) : "Inactive"}
      </Flex>
      {(() => {
        switch (subscription.status) {
          case "active":
            return (
              <Flex fontSize={"14px"} alignItems={"center"} color={"#848484"}>
                Your free trial ends on
                {moment(subscription?.current_period_end).format(
                  "MMMM D, YYYY"
                )}
              </Flex>
            );
          case "cancelled":
            return (
              <Flex fontSize={"14px"} alignItems={"center"} color={"#848484"}>
                Your subscription has been canceled, but you'll continue to have
                access until
                {moment(subscription?.current_period_end).format(
                  "MMMM D, YYYY"
                )}
              </Flex>
            );
          case "past_due":
            return (
              <Flex fontSize={"14px"} alignItems={"center"} color={"#848484"}>
                Your subscription is past due. If payment isn’t completed soon,
                access may be restricted.
                {moment(subscription?.current_period_end).format(
                  "MMMM D, YYYY"
                )}
              </Flex>
            );
          case "unpaid":
            return (
              <Flex fontSize={"14px"} alignItems={"center"} color={"#848484"}>
                Your payment has failed multiple times, and your subscription is
                now unpaid. Update your billing information to restore access.
                {moment(subscription?.current_period_end).format(
                  "MMMM D, YYYY"
                )}
              </Flex>
            );
          default:
            return (
              <Flex fontSize={"14px"} alignItems={"center"} color={"#848484"}>
                Your subscription is currently inactive. To restore full access,
                please renew or update your plan
              </Flex>
            );
        }
      })()}
    </Flex>
  );
}
