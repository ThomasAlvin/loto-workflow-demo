export default async function copyToClipboard(toast, text) {
  try {
    await navigator.clipboard.writeText(text);
    toast({
      title: "Copied to clipboard successfully",
      status: "success",
      duration: 3000,
      position: "top",
      isClosable: true,
    });
  } catch (err) {
    console.error("Failed to copy", err);
  }
}
