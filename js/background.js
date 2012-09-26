var b = {
    keyVersion: "version",
    url: "chrome://extensions/",
    contextMenuId: undefined,
    homePageUrl: "http://tejji.com/",
    temp: {},

    init: function () {
        o.initContextMenu();
        b.initOmniBox();
        b.initInstall();
    },

    navigate: function (url) {
        chrome.tabs.getSelected(null, function (tab) {
            chrome.tabs.update(tab.id, { url: url });
        });
    },

    initInstall: function () {
        function onInstall() {
            console.log("Extension Installed");
            openHomePage();
        }

        function onUpdate() {
            console.log("Extension Updated");
            openHomePage();
        }

        function openHomePage() {
            chrome.tabs.getAllInWindow(undefined, function (tabs) {
                var isHomeTab = false;
                for (var i = 0, tab; tab = tabs[i]; i++) {
                    if (tab.url === b.homePageUrl) {
                        //chrome.tabs.update(tab.id, { selected: true });
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
        b.contextMenuId = chrome.contextMenus.create({ "title": title, "contexts": contexts
            //,"onclick": b.userOnClick
        });
        chrome.contextMenus.create({ "title": "Close tabs to the left", "contexts": contexts
            , "parentId": b.contextMenuId
            , "onclick": b.closeTabsToTheLeft
        });
        chrome.contextMenus.create({ "title": "Close tabs to the right", "contexts": contexts
            , "parentId": b.contextMenuId
            , "onclick": b.closeTabsToTheRight
        });
        chrome.contextMenus.create({ "title": "Close other tabs", "contexts": contexts
            , "parentId": b.contextMenuId
            , "onclick": b.closeOtherTabs
        });
        chrome.contextMenus.create({ "title": "Close current tab", "contexts": contexts
            , "parentId": b.contextMenuId
            , "onclick": b.closeCurrentTab
        });
        chrome.contextMenus.create({ "title": "Close tabs from this domain" + domain, "contexts": contexts
            , "parentId": b.contextMenuId
            , "onclick": b.closeTabsFromDomain
        });
        chrome.contextMenus.create({ "title": "Close tabs from other domain" + domain, "contexts": contexts
            , "parentId": b.contextMenuId
            , "onclick": b.closeTabsFromOtherDomain
        });
        chrome.contextMenus.create({ "title": "Close window", "contexts": contexts
            , "parentId": b.contextMenuId
            , "onclick": b.closeWindow
        });
        chrome.contextMenus.create({ "title": "Options", "contexts": contexts
            , "parentId": b.contextMenuId
            , "onclick": b.openOptions
        });
    },

    initOmniBox: function () {
        chrome.omnibox.onInputChanged.addListener(
        function (text, suggest) {
            suggest([
                { content: "tejji.com", description: "tejji.com" }
            ]);
        });

        chrome.omnibox.onInputEntered.addListener(function (text) {
            b.navigate("http://tejji.com");
        });
    }
};

b.init();
