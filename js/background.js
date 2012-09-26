function ContextMenu(chromeObj) {
    if (chromeObj) {
        this.chrome = chromeObj;
    } else if (typeof chrome !== 'undefined') {
        this.chrome = chrome;
    }

    this.contexts = ['all'];
    this.contextMenuId = null;
}

ContextMenu.prototype = {

    init: function() {
        this.initContextMenu();
    },

    getDomain: function(url) {
        return url.split(/\/+/g)[1];
    },

    enrichTab: function(tab) {
        return {
            tab: tab,
            domain: this.getDomain(tab.url)
        };
    },

    getWindowTabs: function(callback) {
        this.chrome.tabs.query({ windowId: this.chrome.windows.WINDOW_ID_CURRENT }, function(tabs) {
            var result = tabs.map(this.enrichTab);
            callback(result);
        });
    },

    tabTests: {
        tabsToTheLeft: function(currentTab, testedTab) {
            return testedTab.tab.index < currentTab.tab.index;
        },

        tabsToTheRight: function(currentTab, testedTab) {
            return testedTab.tab.index > currentTab.tab.index;
        },

        otherTabs: function(currentTab, testedTab) {
            return testedTab.tab.index !== currentTab.tab.index;
        },

        tabsFromDomain: function(currentTab, testedTab) {
            return currentTab.domain === testedTab.domain;
        },

        tabsFromOtherDomain: function(currentTab, testedTab) {
            return testedTab.domain !== currentTab.domain;
        },

        otherTabsFromDomain: function(currentTab, testedTab) {
            return testedTab.domain === currentTab.domain && testedTab.tab.index !== currentTab.tab.index;
        }
    },

    getTabsToClose: function(currentTab, allTabs, tabTest) {
        var tabsToClose = allTabs.filter(function(testedTab) {
            return tabTest(currentTab, testedTab);
        });

        tabsToClose = tabsToClose.map(function(tab) { return tab.tab.id; });

        return tabsToClose;
    },

    _closeTabs: function(tabIds) {
        this.chrome.tabs.remove(tabIds);
    },

    /**
     * Given a tab test function returns a context menu click handler item which runs
     * that test against all tabs in the current window and closes those tabs for
     * which the test function returns true.
     */
    getClickHandler: function(tabTest) {
        var contextMenu = this;

        function clickHandler(info, tab) {
            currentTab = b.enrichTab(tab)
            this.getWindowTabs(function(allTabs) {
                var tabsToClose = contextMenu.closeTabs(currentTab, allTabs, tabTest);
                contextMenu._closeTabs(tabsToClose);
            });
        }

        return clickHandler;
    },

    addItem: function(title, tabTest) {
        this.chrome.contextMenus.create({
            title: title,
            contexts: this.contexts,
            parentId: this.contextMenuId,
            onclick: this.getClickHandler(tabTest)
        });
    },

    addSeparator: function() {
        this.chrome.contextMenus.create({
            type: 'separator',
            parentId: this.contextMenuId,
            contexts: this.contexts
        });
    },

    initContextMenu: function(tab) {
        if (!this.contextMenuId) return;

        this.contextMenuId = this.chrome.contextMenus.create({ title: 'Close tabs', contexts: contexts });

        this.addItem("Other tabs", b.tabTests.otherTabs);
        this.addItem("Tabs to the left", b.tabTests.tabsToTheLeft);
        this.addItem("Tabs to the right", b.tabTests.tabsToTheRight);
        this.addSeparator();

        this.addItem("Tabs from this domain" + domain, b.tabTests.tabsFromDomain);
        this.addItem("Other tabs from this domain" + domain, b.tabTests.otherTabsFromDomain);
        this.addItem("Tabs from other domain" + domain, b.tabTests.tabsFromOtherDomain);
        this.addSeparator();

        this.addItem("Options", this.openOptions);
    },

    openOptions: function(info, tab) {
        this.chrome.tabs.create({ url: "options.htm" });
    }
};

// don't instantiate anything during test runs
if (typeof chrome !== undefined) {
   var contextMenu = new ContextMenu();
   contextMenu.init();
}

if (typeof module !== undefined) {
    module.exports = { ContextMenu: ContextMenu };
}
