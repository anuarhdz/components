/**
 * Calculates the total height of all child elements within the header group,
 * excluding the header element itself.
 *
 * @param {HTMLElement|null} [header=document.querySelector("#header-component")] - The header element to exclude from the calculation.
 * @param {HTMLElement|null} [headerGroup=document.querySelector("#header-group")] - The container whose children's heights are summed.
 * @returns {number} The total height in pixels of all child elements in the header group, excluding the header.
 */
export function calculateHeaderGroupHeight(
  header = document.querySelector("#header-component"),
  headerGroup = document.querySelector("#header-group")
) {
  if (!headerGroup) return 0;

  let totalHeight = 0;
  const children = headerGroup.children;

  for (let i = 0; i < children.length; i++) {
    const element = children[i];
    if (element === header || !(element instanceof HTMLElement)) continue;
    totalHeight += element.offsetHeight;
  }
  return totalHeight;
}
