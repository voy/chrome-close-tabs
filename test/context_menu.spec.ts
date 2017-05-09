import 'mocha';
import { head, flow, equals, get } from 'lodash/fp';
import * as sinon from 'sinon';
import { expect } from 'chai';

import ContextMenu from '../src/context_menu';

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

function mockMenuItems() {
    return [
        {
            title: 'close all',
            predicate: () => true
        }, {
            title: 'close none',
            predicate: () => false
        }, {
            title: 'close second',
            predicate: (activeTab, testedTab) => {
                return testedTab.tab.index === 1;
            }
        }
    ]

}

describe('ContextMenu', function() {
    let contextMenu, tabs, chrome, menuItems;

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
        const currentTab = { url: 'http://something.com/' };

        function getContextMenuItem(title: string) {
            return chrome.contextMenus.create.args
                .map(head)
                .find(item => item.title === title);
        }

        it('should close all tabs', async function() {
            const menuItem = getContextMenuItem('close all');
            await menuItem.onclick(null, currentTab);
            expect(chrome.tabs.remove.args[0][0]).to.eql([0, 1, 2, 3]);
        });

        it('should close no tabs', async function() {
            const menuItem = getContextMenuItem('close none');
            await menuItem.onclick(null, currentTab);
            menuItem.onclick();
            expect(chrome.tabs.remove.notCalled).to.equal(true);
        });

        it('should close second tab', async function() {
            const menuItem = getContextMenuItem('close second');
            await menuItem.onclick(null, currentTab);
            menuItem.onclick();
            expect(chrome.tabs.remove.args[0][0]).to.eql([1]);
        });

        it('should pass correct params to the predicate');
    });
});
