// @ts-check

/**
 * Map hostnames to their back/forward elements.
 * @type {Object.<string, {
 *  type: "id" | "class"; back: string; forward: string;
 * }>}
 */
const webcomicTags = {
  "www.cosmoknights.space": {
    type: "class",
    back: "w-pagination-previous",
    forward: "w-pagination-next",
  },
};

const tags = webcomicTags[window.location.hostname];

if (tags) {
  console.log("Webcomic Navigator found a match for this page!");
}

/** @type {HTMLElement | null} */
let backElement = null;
/** @type {HTMLElement | null} */
let forwardElement = null;
if (!tags) {
  // noop
} else if (tags.type === "id") {
  backElement = document.getElementById(tags.back);
  forwardElement = document.getElementById(tags.forward);
} else if (tags.type === "class") {
  const maybeBackElement = document.getElementsByClassName(tags.back)[0];
  if (maybeBackElement && maybeBackElement instanceof HTMLElement) {
    backElement = maybeBackElement;
  }
  const maybeForwardElement = document.getElementsByClassName(tags.forward)[0];
  if (maybeForwardElement && maybeForwardElement instanceof HTMLElement) {
    forwardElement = maybeForwardElement;
  }
}

if (backElement || forwardElement) {
  addEventListener("keydown", (e) => {
    if (e.keyCode === 37) {
      // left arrow key
      if (backElement) backElement.click();
    } else if (e.keyCode === 39) {
      // right arrow key
      if (forwardElement) forwardElement.click();
    }
  });
}
