import { expect } from 'chai';
import { head } from 'lodash';
import { spy, stub, SinonSpy, SinonStub } from 'sinon';

import ContextMenu from '../src/ContextMenu';
import { decorateTab } from '../src/utils';

function mockTabs() {
    let tabs = Object.keys(Array(4).fill(true)).map<chrome.tabs.Tab>((i) => {
        const id = parseInt(i, 10);
        return {
            id: id,
            index: id,
            url: `http://some.domain.com/${id}.html`
        } as any;
    });

    tabs[1].url = 'http://other.domain.org/long/path/file.html';

    return tabs;
}

function mockChromeApi(tabs: chrome.tabs.Tab[]): Chrome {
    return {
        windows: {
            WINDOW_ID_CURRENT: 'foo'
        },
        tabs: {
            remove: stub(),
            query: stub().yieldsAsync(tabs),
            getCurrent: stub().yieldsAsync({} as Tab)
        },
        contextMenus: {
            removeAll: stub().yieldsAsync(),
            create: stub()
        }
    } as any;
}

function mockMenuItems(): MenuItem[] {
    return [
        {
            title: 'close all',
            matcher: spy((tabs: unknown) => tabs)
        }, {
            title: 'close none',
            matcher: () => []
        }, {
            title: 'close second',
            matcher: (tabs) => {
                return tabs.filter(testedTab => testedTab.tab.index === 1);
            }
        }
    ]

}

async function clickMenuItem(menuItem: chrome.contextMenus.CreateProperties, tab: chrome.tabs.Tab) {
    menuItem.onclick && await menuItem.onclick(null as any, tab);
}

describe('ContextMenu', function() {
    let contextMenu;
    let tabs: chrome.tabs.Tab[];
    let chrome: Chrome;
    let menuItems: MenuItem[];

    const currentTab: chrome.tabs.Tab = { url: 'http://something.com/' } as any;

    function getContextMenuItem(title: string): chrome.contextMenus.CreateProperties {
        return (chrome.contextMenus.create as SinonSpy).args
            .map(head)
            .find(item => item.title.startsWith(title));
    }

    beforeEach(async function() {
        tabs = mockTabs();
        chrome = mockChromeApi(tabs);
        menuItems = mockMenuItems();

        contextMenu = new ContextMenu(chrome, menuItems);
        await contextMenu.initialize(currentTab);
    });

    it('removes all existing context menus', () => {
        expect(chrome.contextMenus.removeAll).to.be.calledOnce;
    });

    it('creates context menu items', () => {
        expect(chrome.contextMenus.create).to.be.calledThrice;
    });

    describe('tab closing', () => {
        it('should close all tabs', async function() {
            const menuItem = getContextMenuItem('close all');
            await clickMenuItem(menuItem, currentTab);
            expect(chrome.tabs.remove).to.be.calledWith([0, 1, 2, 3]);
        });

        it('should close no tabs', async function() {
            const menuItem = getContextMenuItem('close none');
            await clickMenuItem(menuItem, currentTab);
            expect(chrome.tabs.remove).to.be.calledWith([]);
        });

        it('should close second tab', async function() {
            const menuItem = getContextMenuItem('close second');
            await clickMenuItem(menuItem, currentTab);
            expect(chrome.tabs.remove).to.be.calledWith([1]);
        });
    });

    describe('matcher call', () => {
        it('should be passed decorated tabs from the current window and the current tab', async function() {
            const menuItem = getContextMenuItem('close all');
            await clickMenuItem(menuItem, currentTab);

            expect(menuItems[0].matcher).to.be.calledWith(tabs.map(decorateTab), decorateTab(currentTab));
        });
    });
});
