import { useEffect } from "react";

export default function RouteFix() {
  useEffect(() => {
    const { location } = window;

    if (location.search[1] === "/") {
      const decoded = location.search
        .slice(1)
        .split("&")
        .map((s) => s.replace(/~and~/g, "&"))
        .join("?");

      window.history.replaceState(
        null,
        "",
        location.pathname.slice(0, -1) + decoded + location.hash
      );
    }
  }, []);

  return null;
}
