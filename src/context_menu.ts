import { partial } from 'lodash';
import { get, isNumber } from 'lodash/fp';

import * as TabPredicates from './tab_predicates';
import { decorateTab, getCurrentWindowTabs } from './utils';

type partialPredicate = (tab: DecoratedTab) => boolean;

const MENU_ITEMS: MenuItem[] = [
    {
        title: 'From domain',
        predicate: TabPredicates.tabsFromDomain
    }, {
        title: 'All other from domain',
        predicate: TabPredicates.otherTabsFromDomain
    }, {
        title: 'From SLD',
        predicate: TabPredicates.tabsFromSld
    }, {
        title: 'All other from SLD',
        predicate: TabPredicates.otherTabsFromSld
    }
];

export default class ContextMenu {

    static CONTEXTS = ['all'];

    constructor(private chrome: Chrome,
                private menuItems: MenuItem[] = MENU_ITEMS) {}

    initialize() {
        this.chrome.contextMenus.create({
            id: 'root',
            title: 'Close tabs',
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

        this.chrome.tabs.remove(tabIds);
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