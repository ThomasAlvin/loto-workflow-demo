export default function convertToFormData(convertedObject) {
  const formData = new FormData();
  Object.entries(convertedObject).forEach(([key, value]) => {
    if (value instanceof File) {
      formData.append(key, value);
    } else if (value === null || value === undefined) {
      formData.append(key, "");
    } else if (
      Array.isArray(value) ||
      (typeof value === "object" && value !== null)
    ) {
      formData.append(key, JSON.stringify(value));
    } else {
      formData.append(key, value);
    }
  });
  return formData;
}
