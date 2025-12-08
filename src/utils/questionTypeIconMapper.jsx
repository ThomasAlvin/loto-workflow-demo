import { FaUserAlt } from "react-icons/fa";
import {
  FaFilePdf,
  FaFileWord,
  FaLock,
  FaRegCalendar,
  FaRegImage,
} from "react-icons/fa6";
import {
  IoMdCheckboxOutline,
  IoMdRadioButtonOn,
  IoMdSettings,
} from "react-icons/io";
import { PiTextTBold } from "react-icons/pi";
import { TbNumber123, TbListCheck } from "react-icons/tb";
import { VscChecklist } from "react-icons/vsc";

export default function questionTypeIconMapper(type) {
  switch (type) {
    case "Text":
      return <PiTextTBold />;
    case "Number":
      return <TbNumber123 />;
    case "Checkbox":
      return <IoMdCheckboxOutline />;
    case "Date & Time":
      return <FaRegCalendar />;
    case "Multiple Choice":
      return <IoMdRadioButtonOn />;
    case "Checklist":
      return <TbListCheck />;
    case "Image":
      return <FaRegImage />;
    case "PDF":
      return <FaFilePdf />;
    case "Word":
      return <FaFileWord />;
    case "Equipment/Machine":
      return <IoMdSettings />;
    case "Member":
      return <FaUserAlt />;
    case "Lock":
      return <FaLock />;
    default:
      return null; // Or some default icon if needed
  }
}
