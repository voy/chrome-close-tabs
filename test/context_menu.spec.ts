import 'mocha';
import { head, flow, equals, get } from 'lodash/fp';
import * as sinon from 'sinon';
import { expect } from 'chai';

import ContextMenu from '../src/context_menu';

function mockTabs() {
    let tabs: any[] = [];

    for (let i = 0; i < 4; i++) {
        tabs.push({
            domain: 'some.domain.com',
            tab: {
                id: i,
                index: i,
                url: 'http://some.domain.com/' + i + '.html'
            }
        });
    }

    tabs[1].domain = 'other.domain.org';
    tabs[1].tab.url = 'http://other.domain.org/long/path/file.html';

    return tabs;
}

function mockChromeApi() {
    return {
        tabs: {
            remove: sinon.stub()
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
            title: 'close first',
            predicate: sinon.stub()
                .returns(true)
                .onSecondCall().returns(false)
        }
    ]

}

describe('ContextMenu', function() {
    let contextMenu, tabs, chrome, menuItems, clickMenuItem, expectClosedTabs;


    beforeEach(function() {
        chrome = mockChromeApi();
        tabs = mockTabs();
        menuItems = mockMenuItems();

        contextMenu = new ContextMenu(chrome, menuItems);
        contextMenu.initialize();

        clickMenuItem = clickedTitle => {
            const item = chrome.contextMenus.create.args
                .map(head)
                .find(flow(get('title'), equals(clickedTitle)));

            if (!item) {
                throw new Error(`Cannot find item with title "${clickedTitle}!`);
            }

            item.onclick();
        };

        expectClosedTabs = expectedIndices => {
            const closedIndices = chrome.tabs.remove.args.map(head);
            expect(closedIndices).to.equal(expectedIndices);
        };
    });

    it('extracts domain from url', function() {
        expect(contextMenu.getDomain('https://www.foobar.com/obj/473')).to.equal('www.foobar.com');
    });

    it('closes tabs', function() {
        let tabIds = [0, 2, 5];
        contextMenu._closeTabs(tabIds);
        expect(chrome.tabs.remove.calledWith(tabIds));
    });

    it('enriches tabs', function() {
        let tab = { url: 'http://www.google.com/search' };
        let enriched = contextMenu.enrichTab(tab);
        expect(enriched).to.eql({ tab: tab, domain: 'www.google.com' });
    });

    it('handles clicks', function(done) {
        let tabTest = sinon.stub().returns(false);
        sinon.stub(contextMenu, 'getWindowTabs').yields(tabs);

        let handler = contextMenu.getClickHandler(tabTest, function() {
            expect(tabTest.callCount).to.equal(4);
            expect(chrome.tabs.remove).to.be.calledWithExactly([]);
            done();
        });

        handler(null, tabs[1].tab);
    });
});
