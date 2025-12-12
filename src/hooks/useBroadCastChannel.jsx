import { useEffect } from "react";

export function useBroadcastChannel(channelName, onMessage) {
  useEffect(() => {
    const bc = new BroadcastChannel(channelName);

    bc.onmessage = (event) => {
      if (typeof onMessage === "function") {
        onMessage(event.data);
      }
    };

    return () => {
      bc.close(); // clean up on unmount
    };
  }, [channelName]);
}
