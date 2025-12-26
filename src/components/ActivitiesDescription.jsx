import { Box } from "@chakra-ui/react";

export default function ActivitiesDescription({
  action,
  description,
  navigationLink,
}) {
  return (
    <Box
      as={"span"}
      w={"fit-content"}
      cursor={action === "delete" ? "" : ""}
      _hover={
        action === "delete" ? "" : navigationLink ? { color: "#dc143c" } : {}
      }
    >
      {description}
    </Box>
  );
}
