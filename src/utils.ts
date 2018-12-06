import { flow, split, join, takeRight } from 'lodash/fp';
import QueryInfo = chrome.tabs.QueryInfo;

function getDomain(url: string): string {
    return url.split(/\/+/g)[1];
}

/**
 * Extracts second level domain from url.
 */
function getSld(url: string) {
    return flow(
        getDomain,
        split('.'),
        takeRight(2),
        join('.')
    )(url);
}

export function decorateTab(tab: Tab): DecoratedTab {
    return {
        tab,
        sld: getSld(tab.url || ''),
        domain: getDomain(tab.url || '')
    };
};

export function getCurrentWindowTabs(chrome: Chrome): Promise<DecoratedTab[]> {
    let queryInfo: QueryInfo = {
        windowId: chrome.windows.WINDOW_ID_CURRENT
    };

    return new Promise(resolve => {
        chrome.tabs.query(queryInfo, tabs => resolve(tabs.map(decorateTab)));
    });
}

export function removeAllContextMenus(chrome: Chrome) {
    return new Promise((resolve) => {
        chrome.contextMenus.removeAll(resolve);
    });
}