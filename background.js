browser.menus.create({
  id: "set_forward",
  title: "Set 'forward' button",
  documentUrlPatterns: ["https://*/*", "http://*/*"],
  contexts: ["link"],
});
browser.menus.create({
  id: "set_back",
  title: "Set 'back' button",
  documentUrlPatterns: ["https://*/*", "http://*/*"],
  contexts: ["link"],
});

/** @typedef {{
 *  type: "id" | "class"; back: string; forward: string;
 * }} CookieValue */

const COOKIE_NAME = "webcomic-navigator";

browser.menus.onClicked.addListener(async (info, tab) => {
  const [currentTab] = await browser.tabs.query({
    active: true,
    currentWindow: true,
  });
  if (tab.id !== currentTab.id) return;
  const { menuItemId, targetElementId } = info;
  /** @type {CookieValue | undefined} */
  const newCookieData = await browser.tabs.sendMessage(tab.id, {
    type: "webcomic-navigator-set-button",
    menuItemId,
    targetElementId,
  });
  if (newCookieData) {
    browser.cookies.set({
      url: tab.url,
      name: COOKIE_NAME,
      value: JSON.stringify(newCookieData),
    });
  }
});

async function checkForCookie() {
  const [currentTab] = await browser.tabs.query({
    active: true,
    currentWindow: true,
  });
  const cookie = await browser.cookies.get({
    url: currentTab.url,
    name: COOKIE_NAME,
  });
  if (cookie) {
    /** @type CookieValue */
    const value = JSON.parse(cookie.value);
    browser.tabs.sendMessage(currentTab.id, {
      type: "webcomic-navigator-loaded-cookie",
      value,
    });
  }
}

// update when the tab is updated
browser.tabs.onUpdated.addListener(checkForCookie);
// update when the tab is activated
browser.tabs.onActivated.addListener(checkForCookie);
