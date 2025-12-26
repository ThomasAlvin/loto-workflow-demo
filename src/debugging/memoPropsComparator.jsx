export function memoPropsComparator(componentName) {
  return function comparator(prevProps, nextProps) {
    const changed = [];

    for (const key in prevProps) {
      if (prevProps[key] !== nextProps[key]) {
        changed.push(key);
      }
    }

    if (changed.length > 0) {
      // console.log(
      //   `%c${componentName} props changed:`,
      //   "color:red;font-weight:bold;",
      // );
      // console.log(changed);
      // console.log({
      //   before: prevProps,
      //   after: nextProps,
      // });
      return false;
    }

    // console.log(
    //   `%c${componentName} props identical (memo prevented render)`,
    //   "color:green;font-weight:bold;",
    // );
    return true;
  };
}
