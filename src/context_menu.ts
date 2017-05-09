import { partial } from 'lodash';
import { get, isNumber } from 'lodash/fp';

import * as TabPredicates from './tab_predicates';
import { decorateTab, getCurrentWindowTabs } from './utils';

type partialPredicate = (tab: DecoratedTab) => boolean;

const MENU_ITEMS: MenuItem[] = [
    {
        title: 'example.com',
        predicate: TabPredicates.tabsFromSld
    },
    {
        title: 'example.com (keep this tab)',
        predicate: TabPredicates.otherTabsFromSld
    },
    {
        title: '*.example.com',
        predicate: TabPredicates.tabsFromDomain
    },
    {
        title: '*.example.com (keep this tab)',
        predicate: TabPredicates.otherTabsFromDomain
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
    private getClickHandler(predicate) {
        const handler = async function(info, currentTab: Tab) {
            const tabs = await getCurrentWindowTabs(this.chrome);
            const appliedPredicate = partial(predicate, decorateTab(currentTab));
            this.removeMatchingTabs(appliedPredicate, tabs);
        };

        return handler.bind(this);
    }

    private removeMatchingTabs(predicate: partialPredicate, tabs: DecoratedTab[]) {
        const matchingTabs = tabs.filter(tab => predicate(tab));
        const tabIds = matchingTabs.map(get('tab.id')).filter(isNumber) as number[];

        if (tabIds.length) {
            this.chrome.tabs.remove(tabIds);
        }
    }

    private createMenuItem(menuItem: MenuItem) {
        const { title, predicate } = menuItem;

        this.chrome.contextMenus.create({
            title,
            contexts: ContextMenu.CONTEXTS,
            parentId: 'root',
            onclick: this.getClickHandler(predicate)
        });
    }
}