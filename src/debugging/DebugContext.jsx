import { useEffect, useRef } from "react";

export default function DebugContext({ name, value }) {
  const ref = useRef(value);

  useEffect(() => {
    if (ref.current !== value) {
      ref.current = value;
    }
  });

  return null;
}
