import * as TabMatchers from './TabMatchers';
import { decorateTab, getCurrentWindowTabs } from './utils';

const MENU_ITEMS: MenuItem[] = [
    {
        title: 'www.example.com',
        matcher: TabMatchers.tabsFromDomain
    },
    {
        title: 'www.example.com (keep this tab)',
        matcher: TabMatchers.otherTabsFromDomain
    },
    {
        title: '*.example.com',
        matcher: TabMatchers.tabsFromSld
    },
    {
        title: '*.example.com (keep this tab)',
        matcher: TabMatchers.otherTabsFromSld
    }
];

export default class ContextMenu {

    static CONTEXTS = ['all'];

    constructor(private chrome: Chrome,
                private menuItems: MenuItem[] = MENU_ITEMS) {}

    initialize() {
        this.chrome.contextMenus.create({
            id: 'root',
            title: 'TabEraser',
            contexts: ContextMenu.CONTEXTS
        });

        this.menuItems.forEach(menuItem => this.createMenuItem(menuItem));
    }

    /**
     * Given a predicate function returns a context menu click handler item which runs
     * that test against all tabs in the current window and closes those tabs for
     * which the test function returns true.
     */
    private getClickHandler(matcher: TabMatcher) {
        const handler = async function(info, activeTab: Tab) {
            const tabs = await getCurrentWindowTabs(this.chrome);

            const matchingTabs = matcher(tabs, decorateTab(activeTab));

            const tabIds = matchingTabs.map(decoratedTab => decoratedTab.tab.id);

            if (tabIds.length) {
                this.chrome.tabs.remove(tabIds);
            }
        };

        return handler.bind(this);
    }

    private createMenuItem(menuItem: MenuItem) {
        const { title, matcher } = menuItem;

        this.chrome.contextMenus.create({
            title,
            contexts: ContextMenu.CONTEXTS,
            parentId: 'root',
            onclick: this.getClickHandler(matcher)
        });
    }
}