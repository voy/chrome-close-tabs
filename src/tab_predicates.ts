function tabsEqual(a: DecoratedTab, b: DecoratedTab): boolean {
    return a.tab.index === b.tab.index;
};

export const tabsFromDomain: TabPredicate = (currentTab, testedTab) => {
    return currentTab.domain === testedTab.domain;
};

export const otherTabsFromDomain: TabPredicate = (currentTab, testedTab) => {
    return testedTab.domain === currentTab.domain && !tabsEqual(testedTab, currentTab)
};

export const tabsFromSld: TabPredicate = (currentTab, testedTab) => {
    return currentTab.sld === testedTab.sld;
};

export const otherTabsFromSld: TabPredicate = (currentTab, testedTab) => {
    return currentTab.sld === testedTab.sld && !tabsEqual(testedTab, currentTab);
};