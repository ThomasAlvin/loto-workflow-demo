import { Box, Center, Flex, Image, Spinner } from "@chakra-ui/react";
import { useState, useEffect } from "react";
import { AiOutlineFileImage } from "react-icons/ai";

export default function ImageFocusOverlay({
  imageFocusURL,
  imageFocusDisclosure,
}) {
  const [URLError, setURLError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  // Detect when the src changes and reset states
  useEffect(() => {
    if (imageFocusURL) {
      setURLError(false);
      setImageLoading(true); // Show loading when image changes
    }
  }, [imageFocusURL]);

  function handleCloseImageFocus() {
    imageFocusDisclosure.onClose(false);
    setURLError(false);
    setImageLoading(false);
  }

  return (
    <Center
      opacity={imageFocusDisclosure.isOpen ? "1" : "0"}
      pointerEvents={imageFocusDisclosure.isOpen ? "auto" : "none"}
      transition="0.1s ease-in-out"
      position="fixed"
      top="0"
      left="0"
      w="100vw"
      h="100vh"
      bg="rgba(0, 0, 0, 0.7)" // Dark overlay
      zIndex="9999"
      onClick={handleCloseImageFocus}
    >
      <Box position="relative" bg={"white"}>
        {/* Show Loading Spinner while image is loading */}
        {imageLoading && !URLError && (
          <Center w="100%" h="100%">
            <Spinner size="xl" color="white" />
          </Center>
        )}

        {/* Show Fallback if Image Fails to Load */}
        {URLError && (
          <Center
            w="200px"
            h="200px"
            bg="#bababa"
            borderRadius="md"
            boxShadow="xl"
            flexDir="column"
            gap="20px"
          >
            <Flex
              p="5px"
              color="#f8f9fa"
              bg="#848484"
              fontWeight={700}
              fontSize="24px"
            >
              <AiOutlineFileImage />
            </Flex>
            <Flex color="white">Failed to load image</Flex>
          </Center>
        )}

        {/* Image */}
        <Image
          display={URLError || imageLoading ? "none" : "block"}
          onLoad={() => setImageLoading(false)}
          onError={() => {
            setURLError(true);
            setImageLoading(false);
          }}
          opacity={imageFocusDisclosure.isOpen ? "1" : "0"}
          transition="0.1s ease-in-out"
          src={URLError ? "" : imageFocusURL}
          maxH="80vh"
          maxW="90vw"
          borderRadius="md"
          boxShadow="xl"
        />
      </Box>
    </Center>
  );
}
