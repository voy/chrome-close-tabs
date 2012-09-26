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
        var params = { windowId: this.chrome.windows.WINDOW_ID_CURRENT };
        this.chrome.tabs.query(params, function(tabs) {
            var result = tabs.map(this.enrichTab, this);
            callback(result);
        }.bind(this));
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

    /**
     * Determines what tabs should be closed using supplied test function and
     * returns their ids.
     */
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
    getClickHandler: function(tabTest, callback) {
        var clickHandler = function(info, tab) {
            var execute = function(allTabs) {
                var currentTab = this.enrichTab(tab);

                var tabsToClose = this.getTabsToClose(currentTab, allTabs, tabTest);
                this._closeTabs(tabsToClose);

                callback && callback();
            }.bind(this);

            this.getWindowTabs(execute);
        }.bind(this);

        return clickHandler;
    },

    addItem: function(title, tabTest) {
        this.chrome.contextMenus.create({
            title: title,
            contexts: this.contexts,
            parentId: this.contextMenuId,
            onclick: this.getClickHandler(tabTest).bind(this)
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
        if (this.contextMenuId) return;

        this.contextMenuId = this.chrome.contextMenus.create({
            title: 'Close tabs',
            contexts: this.contexts
        });

        this.addItem('Other', this.tabTests.otherTabs);
        this.addItem('To the ←', this.tabTests.tabsToTheLeft);
        this.addItem('To the →', this.tabTests.tabsToTheRight);
        this.addSeparator();

        this.addItem('From domain', this.tabTests.tabsFromDomain);
        this.addItem('Other from domain', this.tabTests.otherTabsFromDomain);
        this.addItem('From other domain', this.tabTests.tabsFromOtherDomain);
        this.addSeparator();

        this.addItem('About', this.openAbout);
    },

    openAbout: function(info, tab) {
        this.chrome.tabs.create({ url: 'about.html' });
    }
};

// only instantiate when in chrome environment
if (typeof chrome !== 'undefined') {
    var contextMenu = new ContextMenu();
    contextMenu.init();
}

// only export when run from node
if (typeof module !== 'undefined') {
    module.exports = ContextMenu;
}
