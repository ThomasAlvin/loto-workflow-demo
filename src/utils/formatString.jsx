export default function formatString(
  input,
  capitalizeFirst = true,
  replaceUnderscores = true,
  capitalizeAllWords = false,
) {
  if (!input) return "";

  let formatted = input;

  if (replaceUnderscores) {
    formatted = formatted.replace(/_/g, " "); // Replace underscores with spaces
  }

  if (capitalizeAllWords) {
    formatted = formatted
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  } else if (capitalizeFirst) {
    formatted = formatted.replace(/\b\w/, (char) => char.toUpperCase()); // Capitalize first letter
  }

  return formatted;
}
