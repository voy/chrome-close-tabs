import * as winston from 'winston';
import { isNumber } from 'lodash';

import * as TabMatchers from './TabMatchers';
import { decorateTab, getCurrentWindowTabs, removeAllContextMenus } from './utils';
import { createLogger } from './logging';

const MENU_ITEM_TEMPLATES: MenuItem[] = [
    {
        title: 'Close "*.{sld}"',
        matcher: TabMatchers.tabsFromSld
    },
    {
        title: 'Close "*.{sld}", but keep this tab',
        matcher: TabMatchers.otherTabsFromSld
    },
    {
        title: 'Close "{domain}"',
        matcher: TabMatchers.tabsFromDomain
    },
    {
        title: 'Close "{domain}", but keep this tab',
        matcher: TabMatchers.otherTabsFromDomain
    },
    {
        title: 'Close duplicates, but keep one of each',
        matcher: TabMatchers.duplicates
    }
];

const ALL_CONTEXTS = ['all'];

export default class ContextMenu {

    private logger: winston.Logger;

    constructor(private chrome: Chrome, private itemTemplates = MENU_ITEM_TEMPLATES) {
        this.logger = createLogger();
    }

    async initialize(tab: chrome.tabs.Tab) {
        this.logger.log('debug', `Initializing context menu ${tab.url}`);

        await removeAllContextMenus(this.chrome);

        const decoratedTab = decorateTab(tab);

        this.itemTemplates.forEach((itemTemplate) => {
            const menuItem = this.createMenuItem(itemTemplate, decoratedTab);
            this.logger.log('debug', 'Creating submenu item', { menuItem });
            this.chrome.contextMenus.create(menuItem)
        });
    }

    private createMenuItem(menuItem: MenuItem, activeTab: DecoratedTab): chrome.contextMenus.CreateProperties {
        let replacedTitle = menuItem.title
            .replace('{domain}', activeTab.domain)
            .replace('{sld}', activeTab.sld);

        return {
            title: replacedTitle,
            contexts: ALL_CONTEXTS,
            onclick: this.getClickHandler(menuItem.matcher),
        };
    }

    /**
     * Given a predicate function returns a context menu click handler item which runs
     * that test against all tabs in the current window and closes those tabs for
     * which the test function returns true.
     */
    private getClickHandler(matcher: TabMatcher) {
        const handler = async function(this: ContextMenu, _info: any, activeTab: Tab) {
            const tabs = await getCurrentWindowTabs(this.chrome);

            const matchingTabs = matcher(tabs, decorateTab(activeTab));

            const tabsIdsToRemove = matchingTabs.map(({ tab }) => tab.id).filter(isNumber);
            this.chrome.tabs.remove(tabsIdsToRemove);
        };

        return handler.bind(this);
    }
}