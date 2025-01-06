// Copyright (c) 2025 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

let activeListener;
let closedTabs = []; // Array to store closed tabs
let lastOptionsId = null;

chrome.runtime.onInstalled.addListener(async function(details){
    await chrome.tabs.create({
        url: "setup.html"
    });
});

chrome.runtime.onStartup.addListener(async function(){
    chrome.storage.local.get(['key'], (result) => {
        if(result.key) {
            closeAllTabs();
            chrome.tabs.create({ url: chrome.runtime.getURL("unlock.html") }, (tab) => {
                let currentWindowId = tab.id;
                lastOptionsId = tab.id;
                activeListener = createOnTabActivated(currentWindowId);
                chrome.tabs.onActivated.addListener(activeListener);
                chrome.tabs.onUpdated.addListener(onTabUpdated);
            });
        } else {
            chrome.tabs.create({ url: chrome.runtime.getURL("setup.html") });
        }
    });
});

function onTabUpdated(tabId, changeInfo, tab) {
    if (tabId === lastOptionsId) {
        if (changeInfo.url && changeInfo.url !== chrome.runtime.getURL("unlock.html")) {
            chrome.tabs.remove(tabId); // Bezárja az opcionális tab-ot
        }
    }
}

function createOnTabActivated(currentWindowId) {
    return function(activeInfo) {
        chrome.tabs.get(activeInfo.tabId, (tabs) => {
            if (tabs.id !== currentWindowId) {
                chrome.windows.getCurrent({}, function(window) {
                    chrome.windows.remove(window.id);
                });
            }
        });
    };
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "removeListener") {
        removeListeners();
        reopenClosedTabs();
        sendResponse({ success: true });
    }
});

function removeListeners() {
    if (activeListener) {
        chrome.tabs.onActivated.removeListener(activeListener);
        chrome.tabs.onUpdated.removeListener(onTabUpdated);
        activeListener = null; // Nullázza a referenciát
    }
}

function reopenClosedTabs() {
    if (closedTabs.length === 0) {
        chrome.tabs.query({ url: chrome.runtime.getURL("unlock.html") }, (tabs) => {
            tabs.forEach((tab) => {
                chrome.tabs.remove(tab.id);
            });
        });
        chrome.tabs.create({ url: "about:blank" });
        closeAllTabs();
    } else {
        closedTabs.forEach(tab => {
            chrome.tabs.create({
                url: tab.url,
                windowId: tab.windowId,
                index: tab.index
            });
        });
        closedTabs = null;
    }
}

function closeAllTabs() {
    chrome.tabs.query({}, (tabs) => {
        closedTabs = tabs
        .filter(tab => tab.url !== chrome.runtime.getURL("unlock.html"))
        .filter(tab => tab.url !== chrome.runtime.getURL("setup.html"))
        .map(tab => ({
            url: tab.url,
            windowId: tab.windowId,
            index: tab.index,
        }));

        tabs.forEach(tab => {
            chrome.tabs.remove(tab.id);
        });
    });
}
