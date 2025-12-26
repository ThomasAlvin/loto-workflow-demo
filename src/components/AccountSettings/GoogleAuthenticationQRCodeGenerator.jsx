import { useRef } from "react";
export default function GoogleAuthenticationQRCodeGenerator({
  QRCodeValue,
  refreshQrCode,
  QRLoading,
}) {
  const QRcodeRef = useRef(null); // Reference to the QRCode container

  return (
    <>
      <Flex>
        <Flex flexDir={"column"} gap={"10px"} alignItems={"center"}>
          <Flex
            direction="column"
            alignItems="center"
            boxShadow={"0px 0px 3px rgba(50,50,93,0.5)"}
            w={"100%"}
            p={"10px"}
            bg={"#f8f9fa"}
            position={"relative"}
          >
            {QRLoading ? (
              <Flex
                w={"170px"}
                h={"170px"}
                justify={"center"}
                alignItems={"center"}
                bg={"white"}
                flexDir={"column"}
                color={"#dc143c"}
                gap={"20px"}
              >
                <Spinner size={"xl"} color="#dc143c" thickness="4px" />
                <Flex fontSize={"14px"} fontWeight={700}>
                  Loading QR Code...
                </Flex>
              </Flex>
            ) : (
              <Flex ref={QRcodeRef}>
                <QRCodeCanvas
                  value={QRCodeValue} // The data to encode
                  size={170} // Size of the QR code in pixels
                  bgColor="#ffffff" // Background color
                  fgColor="#000000" // Foreground (QR code) color
                  level="L" // Error correction level (L, M, Q, H)
                />
              </Flex>
            )}
          </Flex>
          <Flex
            opacity={QRLoading ? 0.6 : 1}
            justify={"center"}
            fontSize={"14px"}
            color={"#848484"}
            onClick={QRLoading ? "" : refreshQrCode}
          >
            &nbsp;
            <Flex
              cursor={QRLoading ? "not-allowed" : "pointer"}
              fontWeight={400}
              color={"#dc143c"}
              alignItems={"center"}
              _hover={
                QRLoading ? "" : { color: "#b80d2f", textDecor: "underline" }
              }
              gap={"5px"}
            >
              <GrPowerCycle />
              Refresh QR Code
            </Flex>
          </Flex>
        </Flex>
      </Flex>
    </>
  );
}
