function tabsEqual(a: DecoratedTab, b: DecoratedTab): boolean {
    return a.tab.index === b.tab.index;
};

export const tabsFromDomain: TabMatcher = (tabs, activeTab) => {
    return tabs.filter(testedTab => {
        return activeTab.domain === testedTab.domain;
    });
};

export const otherTabsFromDomain: TabMatcher = (tabs, activeTab) => {
    return tabs.filter(testedTab => {
        return testedTab.domain === activeTab.domain && !tabsEqual(testedTab, activeTab)
    });
};

export const tabsFromSld: TabMatcher = (tabs, activeTab) => {
    return tabs.filter(testedTab => {
        return activeTab.sld === testedTab.sld;
    });
};

export const otherTabsFromSld: TabMatcher = (tabs, activeTab) => {
    return tabs.filter(testedTab => {
        return activeTab.sld === testedTab.sld && !tabsEqual(testedTab, activeTab);
    })
};