export default function setAllFieldsTouched(obj) {
  const touched = {};
  Object.keys(obj).forEach((key) => {
    if (Array.isArray(obj[key])) {
      if (obj[key].length === 0) {
        touched[key] = true;
      } else {
        touched[key] = obj[key].map((item) =>
          typeof item === "object" && item !== null
            ? setAllFieldsTouched(item)
            : true
        );
      }
    } else if (typeof obj[key] === "object" && obj[key] !== null) {
      touched[key] = setAllFieldsTouched(obj[key]);
    } else {
      touched[key] = true;
    }
  });
  return touched;
}
