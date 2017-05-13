import 'mocha';
import { head, flow, equals, get } from 'lodash/fp';
import * as sinon from 'sinon';
import { expect } from 'chai';

import ContextMenu from '../src/ContextMenu';
import {decorateTab} from '../src/utils';

function mockTabs() {
    let tabs: any[] = [];

    for (let i = 0; i < 4; i++) {
        tabs.push({
            id: i,
            index: i,
            url: 'http://some.domain.com/' + i + '.html'
        });
    }

    tabs[1].url = 'http://other.domain.org/long/path/file.html';

    return tabs;
}

function mockChromeApi(tabs) {
    return {
        windows: {
            WINDOW_ID_CURRENT: 'foo'
        },
        tabs: {
            remove: sinon.stub(),
            query: sinon.stub().yieldsAsync(tabs)
        },
        contextMenus: {
            create: sinon.stub()
        }
    };
}

function mockMenuItems(): MenuItem[] {
    return [
        {
            title: 'close all',
            matcher: sinon.spy((tabs) => tabs)
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

describe('ContextMenu', function() {
    let contextMenu, tabs, chrome, menuItems;

    const currentTab = { url: 'http://something.com/' };

    function getContextMenuItem(title: string) {
        return chrome.contextMenus.create.args
            .map(head)
            .find(item => item.title === title);
    }

    beforeEach(function() {
        tabs = mockTabs();
        chrome = mockChromeApi(tabs);
        menuItems = mockMenuItems();

        contextMenu = new ContextMenu(chrome, menuItems);
        contextMenu.initialize();
    });

    it('creates context menu items', () => {
       expect(chrome.contextMenus.create.callCount).to.equal(4);
    });

    describe('tab closing', () => {
        it('should close all tabs', async function() {
            const menuItem = getContextMenuItem('close all');
            await menuItem.onclick(null, currentTab);
            expect(chrome.tabs.remove.args[0][0]).to.eql([0, 1, 2, 3]);
        });

        it('should close no tabs', async function() {
            const menuItem = getContextMenuItem('close none');
            await menuItem.onclick(null, currentTab);
            expect(chrome.tabs.remove.notCalled).to.equal(true);
        });

        it('should close second tab', async function() {
            const menuItem = getContextMenuItem('close second');
            await menuItem.onclick(null, currentTab);
            expect(chrome.tabs.remove.args[0][0]).to.eql([1]);
        });
    });

    describe('matcher call', () => {
        it('should be called with decorated tabs from the current window', async function() {
            const menuItem = getContextMenuItem('close all');
            await menuItem.onclick(null, currentTab);
            const calledTabs = menuItems[0].matcher.args[0][0];
            expect(calledTabs).to.eql(tabs.map(decorateTab));
        });

        it('should be called with decorated current tab', async function() {
            const menuItem = getContextMenuItem('close all');
            await menuItem.onclick(null, currentTab);
            const calledCurrentTab = menuItems[0].matcher.args[0][1];
            expect(calledCurrentTab).to.eql(decorateTab(currentTab as Tab));
        });
    });
});
