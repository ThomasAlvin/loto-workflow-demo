import { useSelector } from "react-redux";
import checkHasPermission from "./checkHasPermission";

export default function Can({ children, module, permission, roles }) {
  const userSelector = useSelector((state) => state.login.auth);
  if (
    roles?.length &&
    roles?.some((role) => {
      return userSelector.role === role;
    })
  ) {
    return children;
  }

  return checkHasPermission(userSelector, module, permission) ? children : null;
}
