interface DecoratedTab {
    tab: chrome.tabs.Tab;
    sld: string;
    domain: string;
}

interface MenuItem {
    title: string;
    predicate: TabPredicate;
}

type TabPredicate = (tabA: DecoratedTab, tabB: DecoratedTab) => boolean;

type Chrome = typeof chrome;
type Tab = chrome.tabs.Tab;