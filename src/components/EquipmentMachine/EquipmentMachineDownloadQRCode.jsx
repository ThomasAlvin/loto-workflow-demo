import { Flex, Tooltip } from "@chakra-ui/react";
import { QRCodeCanvas } from "qrcode.react";
import { useRef } from "react";
import DownloadQrIcon from "../Icons/DownloadQrIcon";

export default function EquipmentMachineDownloadQRCode({ UID, name }) {
  const QRCodeRef = useRef(null);
  const downloadQRCode = () => {
    const canvas = QRCodeRef.current.querySelector("canvas");
    const img = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.href = img;
    link.download = `qr-code-${name}.png`;
    link.click();
  };
  const createDownloadHandler = (UID) => () => {
    downloadQRCode(UID);
  };
  return (
    <Flex>
      <Flex display={"none"} ref={QRCodeRef}>
        <QRCodeCanvas
          value={UID}
          size={170} // Size of the QR code in pixels
          bgColor="#ffffff" // Background color
          fgColor="#000000" // Foreground (QR code) color
          level="L" // Error correction level (L, M, Q, H)
        />
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
