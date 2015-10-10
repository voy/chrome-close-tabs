'use strict';

class ContextMenu {
    constructor(chromeObj) {
        if (chromeObj) {
            this.chrome = chromeObj;
        } else if (typeof chrome !== 'undefined') {
            this.chrome = chrome;
        }

        this.contexts = ['all'];
        this.contextMenuId = null;

        this.tabTests = {
            tabsToTheLeft(currentTab, testedTab) {
                return testedTab.tab.index < currentTab.tab.index;
            },

            tabsToTheRight(currentTab, testedTab) {
                return testedTab.tab.index > currentTab.tab.index;
            },

            otherTabs(currentTab, testedTab) {
                return testedTab.tab.index !== currentTab.tab.index;
            },

            tabsFromDomain(currentTab, testedTab) {
                return currentTab.domain === testedTab.domain;
            },

            tabsFromOtherDomain(currentTab, testedTab) {
                return testedTab.domain !== currentTab.domain;
            },

            otherTabsFromDomain(currentTab, testedTab) {
                return testedTab.domain === currentTab.domain && testedTab.tab.index !== currentTab.tab.index;
            }
        };
    }

    init() {
        this.initContextMenu();
    }

    getDomain(url) {
        return url.split(/\/+/g)[1];
    }

    enrichTab(tab) {
        return {
            tab: tab,
            domain: this.getDomain(tab.url)
        };
    }

    getWindowTabs(callback) {
        var params = { windowId: this.chrome.windows.WINDOW_ID_CURRENT };
        this.chrome.tabs.query(params, (tabs) => {
            var result = tabs.map(this.enrichTab, this);
            callback(result);
        });
    }

    /**
     * Determines what tabs should be closed using supplied test function and
     * returns their ids.
     */
    getTabsToClose(currentTab, allTabs, tabTest) {
        var tabsToClose = allTabs.filter(function(testedTab) {
            return tabTest(currentTab, testedTab);
        });

        tabsToClose = tabsToClose.map(function(tab) { return tab.tab.id; });

        return tabsToClose;
    }

    _closeTabs(tabIds) {
        this.chrome.tabs.remove(tabIds);
    }

    /**
     * Given a tab test function returns a context menu click handler item which runs
     * that test against all tabs in the current window and closes those tabs for
     * which the test function returns true.
     */
    getClickHandler(tabTest, callback) {
        var clickHandler = (info, tab) => {
            var execute = (allTabs) => {
                var currentTab = this.enrichTab(tab);

                var tabsToClose = this.getTabsToClose(currentTab, allTabs, tabTest);
                this._closeTabs(tabsToClose);

                callback && callback();
            };

            this.getWindowTabs(execute);
        };

        return clickHandler;
    }

    addItem(title, tabTest) {
        this.chrome.contextMenus.create({
            title,
            contexts: this.contexts,
            parentId: this.contextMenuId,
            onclick: callback => this.getClickHandler(tabTest, callback)
        });
    }

    addSeparator() {
        this.chrome.contextMenus.create({
            type: 'separator',
            parentId: this.contextMenuId,
            contexts: this.contexts
        });
    }

    initContextMenu(tab) {
        if (this.contextMenuId) return;

        this.contextMenuId = this.chrome.contextMenus.create({
            title: 'Close tabs',
            contexts: this.contexts
        });

        this.addItem('Other in this window', this.tabTests.otherTabs);
        this.addItem('To the ←', this.tabTests.tabsToTheLeft);
        this.addItem('To the →', this.tabTests.tabsToTheRight);
        this.addSeparator();

        this.addItem('From site', this.tabTests.tabsFromDomain);
        this.addItem('All other from site', this.tabTests.otherTabsFromDomain);
        this.addItem('All from other site', this.tabTests.tabsFromOtherDomain);
    }
}

// only instantiate when in chrome environment
if (typeof chrome !== 'undefined') {
    var contextMenu = new ContextMenu();
    contextMenu.init();
}

// only export when run from node
if (typeof module !== 'undefined') {
    module.exports = ContextMenu;
}
