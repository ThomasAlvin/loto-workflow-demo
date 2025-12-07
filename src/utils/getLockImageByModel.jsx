import GT5207Image from "@/assets/images/lock-images/GT5207.png";
import GT5407Image from "@/assets/images/lock-images/GT5407.png";
import GT5107Image from "@/assets/images/lock-images/GT5107.png";
import GT5209Image from "@/assets/images/lock-images/GT5209.png";
import GT5300Image from "@/assets/images/lock-images/GT5300.png";

const GetLockImageByModel = (model) => {
  switch (model) {
    case "GT5407":
      return GT5407Image;
    //blm ad
    case "GT5409":
      return GT5407Image;
    case "GT5207":
      return GT5207Image;
    case "GT5209":
      return GT5209Image;
    case "GT5107":
      return GT5107Image;
    //blm ad
    case "GT5109":
      return GT5407Image;
    case "GT5300":
      return GT5300Image;
    default:
      return GT5407Image;
  }
};
export default GetLockImageByModel;
