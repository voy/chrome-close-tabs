interface DecoratedTab {
    tab: chrome.tabs.Tab;
    sld: string;
    domain: string;
}

interface MenuItem {
    title: string;
    matcher: TabMatcher;
}

type TabMatcher = (tabs: DecoratedTab[], tabB: DecoratedTab) => DecoratedTab[];

type Chrome = typeof chrome;
type Tab = chrome.tabs.Tab;