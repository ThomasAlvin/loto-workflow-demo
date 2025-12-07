export default function base64ToFile(base64, filename = "file.png") {
  const [header, data] = base64.split(",");
  const contentType = header.split(":")[1].split(";")[0];

  const byteCharacters = atob(data);
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }

  const byteArray = new Uint8Array(byteNumbers);

  return new File([byteArray], filename, {
    type: contentType,
    lastModified: Date.now(),
  });
}
