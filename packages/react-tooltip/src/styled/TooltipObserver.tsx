import { useEffect, useRef } from "react";
import { createRoot, type Root } from "react-dom/client";
import { TooltipStyled } from "./TooltipStyled";

function TooltipWrapper({ el, label }: { el: HTMLElement; label: string }) {
  return (
    <TooltipStyled content={label}>
      {el as unknown as React.ReactElement}
    </TooltipStyled>
  );
}

export function TooltipObserver() {
  const rootsRef = useRef<Map<HTMLElement, Root>>(new Map());

  useEffect(() => {
    function process(node: HTMLElement) {
      const label = node.getAttribute("data-tooltip");
      if (!label) return;
      if (rootsRef.current.has(node)) return;

      const wrapper = document.createElement("span");
      wrapper.style.display = "contents";
      node.parentNode?.insertBefore(wrapper, node);
      wrapper.appendChild(node);

      const root = createRoot(wrapper);
      root.render(<TooltipWrapper el={node} label={label} />);
      rootsRef.current.set(node, root);
    }

    function cleanup(node: HTMLElement) {
      const root = rootsRef.current.get(node);
      if (!root) return;
      root.unmount();
      rootsRef.current.delete(node);
    }

    document.querySelectorAll<HTMLElement>("[data-tooltip]").forEach(process);

    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type === "childList") {
          mutation.addedNodes.forEach((n) => {
            if (n instanceof HTMLElement) {
              if (n.hasAttribute("data-tooltip")) process(n);
              n.querySelectorAll<HTMLElement>("[data-tooltip]").forEach(process);
            }
          });
          mutation.removedNodes.forEach((n) => {
            if (n instanceof HTMLElement) {
              if (n.hasAttribute("data-tooltip")) cleanup(n);
              n.querySelectorAll<HTMLElement>("[data-tooltip]").forEach(cleanup);
            }
          });
        } else if (mutation.type === "attributes") {
          const el = mutation.target as HTMLElement;
          const label = el.getAttribute("data-tooltip");
          if (label) process(el);
          else cleanup(el);
        }
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["data-tooltip"],
    });

    return () => {
      observer.disconnect();
      rootsRef.current.forEach((root) => root.unmount());
      rootsRef.current.clear();
    };
  }, []);

  return null;
}
