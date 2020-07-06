// @ts-check

/** @type {HTMLElement | null} */
let backElement = null;
/** @type {HTMLElement | null} */
let forwardElement = null;

/** @param {KeyboardEvent} e */
function onKeyDown(e) {
  if (e.keyCode === 37) {
    // left arrow key
    if (backElement) backElement.click();
  } else if (e.keyCode === 39) {
    // right arrow key
    if (forwardElement) forwardElement.click();
  }
}

/**
 * @param {HTMLElement} element
 * Given an HTML element, returns a classname that belongs
 * to it and no other elements in the document. Useful for
 * finding unique identifiers for forward/back buttons.
 */
function getExclusiveClass(element) {
  for (const className of element.classList.values()) {
    if (document.getElementsByClassName(className).length === 1) {
      return className;
    }
  }
  return null;
}

/** @type {{
 *  type: "id" | "class"; back: string | null; forward: string | null;
 * }}
 * This is the data that's stored in our cookie for this site.
 */
let currentConfig;

// @ts-ignore
browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === "webcomic-navigator-loaded-cookie") {
    // if this site has one of our cookies, we need to figure
    // out which elements the cookie data refers to
    const cookieConfig = request.value;
    if (!cookieConfig) return;
    if (cookieConfig.type === "id") {
      backElement = document.getElementById(cookieConfig.back);
      forwardElement = document.getElementById(cookieConfig.forward);
    } else if (cookieConfig.type === "class") {
      const maybeBackElement = document.getElementsByClassName(
        cookieConfig.back
      )[0];
      if (maybeBackElement && maybeBackElement instanceof HTMLElement) {
        backElement = maybeBackElement;
      }
      const maybeForwardElement = document.getElementsByClassName(
        cookieConfig.forward
      )[0];
      if (maybeForwardElement && maybeForwardElement instanceof HTMLElement) {
        forwardElement = maybeForwardElement;
      }
    }
    // if there's no cookie data yet, then we haven't set a
    // keydown listener yet either, so set that up here
    if (!currentConfig) {
      addEventListener("keydown", onKeyDown);
    }
    currentConfig = cookieConfig;
  } else if (request.type === "webcomic-navigator-set-button") {
    // the user has set a forward or back button, so we need to
    // figure out how to identify it (with an id/classname)
    // @ts-ignore
    const element = browser.menus.getTargetElement(request.targetElementId);
    if (!(element instanceof HTMLElement)) {
      alert("Error: this element is not an HTML element.");
      return;
    }

    // the id or classname we'll use to identify the button in the future
    let newTag;

    if (currentConfig) {
      // we have cookie data, so update it with the identifier
      // for the clicked-on element
      if (currentConfig.type === "id") {
        newTag = element.id;
      } else {
        newTag = getExclusiveClass(element);
      }
      if (!newTag) {
        alert("Error: unable to get identifier for this link");
        return;
      }
    } else {
      // we don't have any cookie data, so create a new one
      /** @type {"id" | "class"} */
      let newType;
      if (element.id) {
        newTag = element.id;
        newType = "id";
      } else {
        newTag = getExclusiveClass(element);
        newType = "class";
      }
      if (!newTag) {
        alert("Error: unable to get identifier for this link");
        return;
      }

      currentConfig = { type: newType, back: null, forward: null };
      addEventListener("keydown", onKeyDown);
    }

    if (request.menuItemId === "set_forward") {
      currentConfig.forward = newTag;
      forwardElement = element;
    } else {
      currentConfig.back = newTag;
      backElement = element;
    }
    // send back the updated cookie data to save in our cookie
    sendResponse(currentConfig);
  }
});
