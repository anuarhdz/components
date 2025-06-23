import { calculateHeaderGroupHeight } from "./header-height";
import { setMetaThemeColor } from "./helpers";

export function HeaderObserver() {
  const header = document.querySelector("#header-component");
    const headerGroup = document.querySelector("#header-group");
  
    if (header instanceof HTMLElement) setMetaThemeColor(header);
  
    if (headerGroup instanceof HTMLElement) {
      const resizeObserver = new ResizeObserver(() =>
        calculateHeaderGroupHeight(
          header instanceof HTMLElement ? header : null,
          headerGroup instanceof HTMLElement ? headerGroup : null
        )
      );
  
      // Observe all children of the header group
      const children = headerGroup.children;
      for (let i = 0; i < children.length; i++) {
        const element = children[i];
        if (element === header || !(element instanceof HTMLElement)) continue;
        resizeObserver.observe(element);
      }
  
      const mutationObserver = new MutationObserver(mutations => {
        for (const mutation of mutations) {
          if (mutation.type === "childList") {
            const children = headerGroup.children;
            for (let i = 0; i < children.length; i++) {
              const element = children[i];
              if (element === header || !(element instanceof HTMLElement))
                continue;
              resizeObserver.observe(element);
            }
          }
        }
      });
  
      mutationObserver.observe(headerGroup, { childList: true });
    }
}