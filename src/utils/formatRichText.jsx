export default function formatRichText(segments) {
  return segments.flatMap((segment, index) => {
    if (!segment) return [];

    const keyBase = `${index}-${segment.type}-${segment.text ?? "break"}`;
    let element;

    switch (segment.type) {
      case "bold":
        element = <strong key={keyBase}>{segment.text}</strong>;
        break;

      case "italic":
        element = <em key={keyBase}>{segment.text}</em>;
        break;

      default:
        element = <span key={keyBase}>{segment.text}</span>;
    }

    if (segment.hasBreak) {
      return [<br key={`${keyBase}-br`} />, element];
    }

    return [element];
  });
}
