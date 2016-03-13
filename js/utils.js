'use strict';

function tabsEqual(a, b) {
    return a.tab.index === b.tab.index;
}

let decorateTab = (tab) => ({
    tab,
    sld: getSLD(tab.url),
    domain: getDomain(tab.url)
});

let getDomain = (url) => url.split(/\/+/g)[1]

/**
 * Extracts second level domain from url.
 */
function getSLD(url) {
    let domain = getDomain(url);
    let parts = domain.split('.');
    return parts.slice(parts.length - 2).join('.');
}

function getCurrentWindowTabs(chrome) {
    let queryInfo = {
        windowId: chrome.windows.WINDOW_ID_CURRENT
    };

    return new Promise(resolve => {
        chrome.tabs.query(queryInfo, tabs => {
            resolve(tabs.map(decorateTab));
        });
    });
}