import { debounce } from 'lodash';

import ContextMenu from './ContextMenu';
import { createLogger } from './logging';

const contextMenu = new ContextMenu(chrome);
const logger = createLogger();

// Protection against duplicate items, a really strange issue I experienced at one point.
const updateContextMenu = debounce((tab: chrome.tabs.Tab) => {
    contextMenu.initialize(tab);
}, 200);

chrome.tabs.onUpdated.addListener((_tabId, _changedInfo, tab) => {
    if (tab.active) {
        logger.log('info', 'Initializing context menu on updated tab');
        updateContextMenu(tab);
    }
});

chrome.windows.onFocusChanged.addListener((windowId) => {
    chrome.tabs.query({ windowId }, (tabs) => {
        const tab = tabs.find(tab => tab.active);

        if (tab) {
            logger.log('info', 'Initializing context menu on tab focus change');
            updateContextMenu(tab);
        }
    })
});

chrome.tabs.onActivated.addListener((info) => {
    const { tabId, windowId } = info;
    chrome.tabs.query({ windowId }, (tabs) => {
        const tab = tabs.find(tab => tab.id === tabId);

        if (tab) {
            logger.log('info', 'Initializing context menu on tab activate');
            updateContextMenu(tab);
        }
    })
});