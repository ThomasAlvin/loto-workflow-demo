import { Flex, Tooltip } from "@chakra-ui/react";
import { QRCodeCanvas } from "qrcode.react";
import { useRef } from "react";
import DownloadQrIcon from "../Icons/DownloadQrIcon";

export default function WorkOrderDownloadQRCode({ UID }) {
  const QRCodeRef = useRef(null);
  const downloadQRCode = (UID) => {
    const canvas = QRCodeRef.current.querySelector("canvas");
    const img = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.href = img;
    link.download = `qr-code-${UID}.png`;
    link.click();
  };
  const createDownloadHandler = (UID) => () => {
    downloadQRCode(UID);
  };
  return (
    <Flex>
      <Flex display={"none"} ref={QRCodeRef}>
        <Flex bg={"#dedede"} p={"10px"}>
          <QRCodeCanvas
            value={UID}
            size={170} // Size of the QR code in pixels
            bgColor="#ffffff" // Background color
            fgColor="#000000" // Foreground (QR code) color
            level="L" // Error correction level (L, M, Q, H)
          />
        </Flex>
      </Flex>
      <Tooltip
        hasArrow
        placement={"top"}
        label="Download QR Code"
        aria-label="A tooltip"
        bg={"#2dba4d"}
        color={"white"}
      >
        <Flex
          color={"#2dba4d"}
          onClick={createDownloadHandler(UID)}
          cursor={"pointer"}
        >
          <DownloadQrIcon />
        </Flex>
      </Tooltip>
    </Flex>
  );
}
