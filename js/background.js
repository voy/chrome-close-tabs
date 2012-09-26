var b = {
    keyVersion: "version",
    url: "chrome://extensions/",
    contextMenuId: undefined,
    homePageUrl: "http://tejji.com/",
    temp: {},

    init: function () {
        o.initContextMenu();
        b.initInstall();
    },

    navigate: function (url) {
        chrome.tabs.getSelected(null, function (tab) {
            chrome.tabs.update(tab.id, { url: url });
        });
    },

    initInstall: function () {
        function onInstall() {
            openHomePage();
        }

        function onUpdate() {
            openHomePage();
        }

        function openHomePage() {
            chrome.tabs.getAllInWindow(undefined, function (tabs) {
                var isHomeTab = false;
                for (var i = 0, tab; tab = tabs[i]; i++) {
                    if (tab.url === b.homePageUrl) {
                        isHomeTab = true;
                        break;
                    }
                }
                if (!isHomeTab) chrome.tabs.create({ url: b.homePageUrl });
                chrome.tabs.create({ url: "options.htm" });
            });
        }

        function getVersion() {
            var version = 'NaN';
            var xhr = new XMLHttpRequest();
            xhr.open('GET', chrome.extension.getURL('manifest.json'), false);
            xhr.send(null);
            var manifest = $.parseJSON(xhr.responseText);
            return manifest.version;
        }

        // Check if the version has changed.
        var currVersion = getVersion();
        var prevVersion = localStorage[b.keyVersion];
        if (currVersion != prevVersion) {
            // Check if we just installed this extension.
            if (typeof prevVersion == 'undefined') {
                onInstall();
            } else {
                onUpdate();
            }
            localStorage[b.keyVersion] = currVersion;
        }
    },

    // A generic onclick callback function.
    userOnClick: function (info, tab) {
        chrome.tabs.create({ url: b.url });
    },

    closeTabsToTheLeft: function (info, tab) {
        b.temp.currentTab = tab;
        chrome.tabs.getAllInWindow(null, function (tabs) {
            for (var i = 0; i < tabs.length; i++) {
                if (tabs[i].index < b.temp.currentTab.index) {
                    chrome.tabs.remove(tabs[i].id, null);
                } else {
                    break;
                }
            }
        });
    },

    closeTabsToTheRight: function (info, tab) {
        b.temp.currentTab = tab;
        chrome.tabs.getAllInWindow(null, function (tabs) {
            for (var i = tabs.length - 1; i > 0; i--) {
                if (tabs[i].index > b.temp.currentTab.index) {
                    chrome.tabs.remove(tabs[i].id, null);
                } else {
                    break;
                }
            }
        });
    },

    closeOtherTabs: function (info, tab) {
        b.temp.currentTab = tab;
        chrome.tabs.getAllInWindow(null, function (tabs) {
            for (var i = 0; i < tabs.length; i++) {
                if (tabs[i].index != b.temp.currentTab.index) {
                    chrome.tabs.remove(tabs[i].id, null);
                }
            }
        });
    },

    closeCurrentTab: function (info, tab) {
        chrome.tabs.remove(tab.id, null);
    },

    getDomain: function (url) {
        return url.split(/\/+/g)[1];
    },

    closeOtherTabsFromDomain: function (info, tab) {
        b.temp.currentTab = tab;
        b.temp.currentDomain = b.getDomain(tab.url);
        chrome.tabs.getAllInWindow(null, function (tabs) {
            for (var i = 0; i < tabs.length; i++) {
                var domain = b.getDomain(tabs[i].url);
                if (b.temp.currentDomain === domain && tabs[i].index != b.temp.currentTab.index) {
                    chrome.tabs.remove(tabs[i].id, null);
                }
            }
        });
    },

    closeTabsFromDomain: function (info, tab) {
        b.temp.currentTab = tab;
        b.temp.currentDomain = b.getDomain(tab.url);
        chrome.tabs.getAllInWindow(null, function (tabs) {
            for (var i = 0; i < tabs.length; i++) {
                var domain = b.getDomain(tabs[i].url);
                if (b.temp.currentDomain === domain) {
                    chrome.tabs.remove(tabs[i].id, null);
                }
            }
        });
    },

    closeTabsFromOtherDomain: function (info, tab) {
        b.temp.currentTab = tab;
        b.temp.currentDomain = b.getDomain(tab.url);
        chrome.tabs.getAllInWindow(null, function (tabs) {
            for (var i = 0; i < tabs.length; i++) {
                var domain = b.getDomain(tabs[i].url);
                if (b.temp.currentDomain !== domain) {
                    chrome.tabs.remove(tabs[i].id, null);
                }
            }
        });
    },

    closeWindow: function (info, tab) {
        chrome.windows.getCurrent(function (window) {
            chrome.windows.remove(window.id, null);
        });
    },

    openOptions: function (info, tab) {
        chrome.tabs.create({ url: "options.htm" });
    },

    initContextMenu: function (tab) {
        if (b.contextMenuId !== undefined) return;
        var contexts = ["all"];
        var domain = ""

        if (tab !== undefined) domain = b.getDomain(tab.url);

        b.contextMenuId = chrome.contextMenus.create({ "title": 'Close tabs', "contexts": contexts });

        function addItem(title, handler) {
            chrome.contextMenus.create({
                title: title,
                contexts: contexts,
                parentId: b.contextMenuId,
                onclick: handler
            });
        }

        addItem("Close tabs to the left", b.closeTabsToTheLeft);
        addItem("Close tabs to the right", b.closeTabsToTheRight);
        addItem("Close other tabs", b.closeOtherTabs);
        addItem("Close current tab", b.closeCurrentTab);
        addItem("Close other tabs from this domain" + domain, b.closeOtherTabsFromDomain);
        addItem("Close tabs from this domain" + domain, b.closeTabsFromDomain);
        addItem("Close tabs from other domain" + domain, b.closeTabsFromOtherDomain);
        addItem("Close window", b.closeWindow);
        addItem("Options", b.openOptions);
    }
};

b.init();
