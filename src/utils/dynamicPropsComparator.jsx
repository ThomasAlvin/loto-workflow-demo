import { isEqual } from "lodash"; // much safer than JSON.stringify

export default function dynamicPropsComparator(prevProps, nextProps) {
  // Props to ignore from checking (optional)
  const ignoreProps = [];

  for (const key in prevProps) {
    if (ignoreProps.includes(key)) continue;

    const prevVal = prevProps[key];
    const nextVal = nextProps[key];

    const isObject =
      prevVal !== null &&
      typeof prevVal === "object" &&
      typeof nextVal === "object";

    const isFunction =
      typeof prevVal === "function" && typeof nextVal === "function";

    if (isFunction) {
      if (prevVal !== nextVal) return false;
      continue;
    }

    if (isObject) {
      if (!isEqual(prevVal, nextVal)) return false;
    } else {
      if (prevVal !== nextVal) return false;
    }
  }

  return true;
}
