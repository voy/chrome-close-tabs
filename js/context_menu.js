'use strict';

const TAB_PREDICATES = {
    tabsFromDomain(currentTab, testedTab) {
        return currentTab.domain === testedTab.domain;
    },

    otherTabsFromDomain(currentTab, testedTab) {
        return testedTab.domain === currentTab.domain && !tabsEqual(testedTab, currentTab)
    },

    tabsFromSLD(currentTab, testedTab) {
        return currentTab.sld === testedTab.sld;
    },

    otherTabsFromSLD(currentTab, testedTab) {
        return currentTab.sld === testedTab.sld && !tabsEqual(testedTab, currentTab);
    }
};

class ContextMenu {
    constructor(chromeInstance) {
        this.chrome = chromeInstance;

        this.contexts = ['all'];
        this.contextMenuId = null;
    }

    init() {
        if (this.contextMenuId) {
            return;
        }

        this.contextMenuId = this.chrome.contextMenus.create({
            title: 'Close tabs',
            contexts: this.contexts
        });

        this.createMenuItem('From domain', TAB_PREDICATES.tabsFromDomain);
        this.createMenuItem('All other from domain', TAB_PREDICATES.otherTabsFromDomain);

        this.createMenuItem('From SLD', TAB_PREDICATES.tabsFromSLD);
        this.createMenuItem('All other from SLD', TAB_PREDICATES.otherTabsFromSLD);
    }

    /**
     * Given a predicate function returns a context menu click handler item which runs
     * that test against all tabs in the current window and closes those tabs for
     * which the test function returns true.
     */
    getClickHandler(predicate) {
        let closeMatchingTabs = (currentTab, allTabs) => {
            let tabsToClose = allTabs.filter(testedTab => predicate(currentTab, testedTab));
            let tabIds = tabsToClose.map(wrappedTab => wrappedTab.tab.id);
            this.chrome.tabs.remove(tabIds);
        };

        return (info, tab) => {
            getCurrentWindowTabs(this.chrome).then(allTabs => {
                closeMatchingTabs(decorateTab(tab), allTabs);
            });
        }
    }

    createMenuItem(title, predicate) {
        this.chrome.contextMenus.create({
            title,
            contexts: this.contexts,
            parentId: this.contextMenuId,
            onclick: this.getClickHandler(predicate)
        });
    }
}

// only export when run from node
if (typeof module !== 'undefined') {
    module.exports = ContextMenu;
}