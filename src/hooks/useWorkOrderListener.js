import { useEffect } from "react";

export function useWorkOrderListener(channelName, handlers = {}, dependancy) {
  useEffect(() => {
    console.log("echo fetched");

    console.log(echo);

    if (!echo || !echo.connector) return;
    const channel = echo.private(channelName);

    if (handlers.onCreated) {
      channel.listen(".create", handlers.onCreated);
    }
    if (handlers.onUpdated) {
      channel.listen(".update", handlers.onUpdated);
    }
    if (handlers.onDeleted) {
      channel.listen(".delete", handlers.onDeleted);
    }
    if (handlers.onGroupDeleted) {
      channel.listen(".group_delete", handlers.onGroupDeleted);
    }

    return () => {
      channel.stopListening(".create");
      channel.stopListening(".update");
      channel.stopListening(".delete");
      channel.stopListening(".group_delete");

      echo.leave(channelName);
    };
  }, dependancy);
}
