"use strict";

// @param {Promise<number>} count
// @returns {Promise<void>}
async function writeTabCountToSession(count) {
    return new Promise((resolve, reject) => {
        chrome.storage.local.set({'count': count}, () => { resolve(); });
    });
}

// @returns {Promise<number|null>}
async function readTabCountFromSession() {
    return new Promise((resolve, reject) => {
        chrome.storage.local.get('count', (items) => {
            resolve(items['count'] ?? null);
        });
    });
}

// @param {number} count
// @returns {Promise<void>}
async function setTabCountToBadge(count) {
    chrome.action.setBadgeText({text: `${count}`});
}

// @param {number} count
// @returns {Promise<void>}
async function setWindowCountToTooltip(count) {
    return chrome.action.setTitle({title: `window count: ${count}`});
}


// @returns {Promise<void>}
async function updateTabCount() {
    const windows = await chrome.windows.getAll({populate: true});
    const tabCount = windows.reduce((acc, win) => acc + win.tabs.length, 0);

    await writeTabCountToSession(tabCount);
    await setTabCountToBadge(tabCount);
    await setWindowCountToTooltip(windows.length);
}

// @param {number} countDelta
// @returns {Promise<void>}
async function addTabCount(countDelta) {
    let count = await readTabCountFromSession();
    if (count === null) {
        chrome.action.setBadgeText({text: 'ERR'});
    } else {
        count += countDelta;
        await writeTabCountToSession(count);
        await setTabCountToBadge(count);
    }
}

// @returns {Promise<void>}
async function updateWindowCount() {
    const count = await chrome.windows.getAll();
    setWindowCountToTooltip(windows.length);
}


chrome.action.setBadgeText({text: 'init'});
updateTabCount();

chrome.tabs.onCreated.addListener(async(tab) => {
    addTabCount(+1);
});

chrome.tabs.onRemoved.addListener(async(tabId, removeInfo) => {
    addTabCount(-1);
});

chrome.windows.onCreated.addListener(async(window) => {
    updateWindowCount();
});

chrome.windows.onRemoved.addListener(async(windowId) => {
    updateWindowCount();
});
