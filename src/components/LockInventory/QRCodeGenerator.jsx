import { Button, Flex, Image } from "@chakra-ui/react";
import { QRCodeCanvas } from "qrcode.react";
import { useRef } from "react";
import { MdFileDownload } from "react-icons/md";
const QRCodeGenerator = ({ QRCodeValue, QrCodeFileName }) => {
  const QRcodeRef = useRef(null); // Reference to the QRCode container

  const downloadQRCode = () => {
    const svgElement = QRcodeRef.current.querySelector("svg");
    const svgData = new XMLSerializer().serializeToString(svgElement);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();

    const svgBlob = new Blob([svgData], {
      type: "image/svg+xml;charset=utf-8",
    });
    const url = URL.createObjectURL(svgBlob);

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      const link = document.createElement("a");
      link.download = `${QRCodeValue}.png`; // Name of the downloaded image
      link.href = canvas.toDataURL("image/png");
      link.click();

      URL.revokeObjectURL(url); // Clean up object URL
    };

    img.src = url;
  };
  const handleDownload = () => {
    const canvas = document.querySelector("canvas");
    const img = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.href = img;
    link.download = `qr-code-${QrCodeFileName}.png`;
    link.click();
  };

  return (
    <>
      <Flex>
        <Flex>
          <Flex
            direction="column"
            alignItems="center"
            boxShadow={"0px 0px 3px rgba(50,50,93,0.5)"}
            w={"100%"}
            p={"15px"}
          >
            <Flex ref={QRcodeRef}>
              <QRCodeCanvas
                value={QRCodeValue} // The data to encode
                size={170} // Size of the QR code in pixels
                bgColor="#ffffff" // Background color
                fgColor="#000000" // Foreground (QR code) color
                level="L" // Error correction level (L, M, Q, H)
              />
            </Flex>
          </Flex>
        </Flex>
      </Flex>
      <Flex w={"100%"} gap={"20px"}>
        <Button
          py={"4px"}
          px={"8px"}
          h={"32px"}
          onClick={handleDownload}
          color={"#dc143c"}
          bg={"white"}
          border={"1px solid #dc143c"}
        >
          <Flex alignItems={"center"} gap={"5px"}>
            <Flex fontSize={"20px"}>
              <MdFileDownload />
            </Flex>
            <Flex>Download</Flex>
          </Flex>
        </Button>
      </Flex>
    </>
  );
};

export default QRCodeGenerator;
