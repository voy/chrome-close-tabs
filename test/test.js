var assert = require('assert');
var sinon = require('sinon');
var ContextMenu = require('../js/context_menu.js');

function createTabs() {
    var tabs = [];
    for (var i = 0; i < 4; i++) {
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

describe('ContextMenu', function() {
    var contextMenu, tabs, chrome;

    beforeEach(function() {
        chrome = { tabs: { remove: sinon.spy() } };
        contextMenu = new ContextMenu(chrome);
        tabs = createTabs();
    });

    it('extracts domain from url', function() {
        assert.equal('www.foobar.com', contextMenu.getDomain('https://www.foobar.com/obj/473'));
    });

    it('closes tabs', function() {
        var tabIds = [0, 2, 5];
        contextMenu._closeTabs(tabIds);
        assert.equal(true, chrome.tabs.remove.calledWith(tabIds));
    });

    it('enriches tabs', function() {
        var tab = { url: 'http://www.google.com/search' };
        var enriched = contextMenu.enrichTab(tab);
        assert.deepEqual({ tab: tab, domain: 'www.google.com' }, enriched);
    });

    describe('tab tests', function() {
        it('closes tabs to the left', function() {
            var closed = contextMenu.getTabsToClose(tabs[2], tabs, contextMenu.tabTests.tabsToTheLeft);
            assert.deepEqual([0, 1], closed);
        });

        it('closes tabs to the right', function() {
            var closed = contextMenu.getTabsToClose(tabs[1], tabs, contextMenu.tabTests.tabsToTheRight);
            assert.deepEqual([2, 3], closed);
        });

        it('closes other tabs', function() {
            var closed = contextMenu.getTabsToClose(tabs[0], tabs, contextMenu.tabTests.otherTabs);
            assert.deepEqual([1, 2, 3], closed);
            var closed = contextMenu.getTabsToClose(tabs[2], tabs, contextMenu.tabTests.otherTabs);
            assert.deepEqual([0, 1, 3], closed);
        });

        it('closes tabs from the same domain', function() {
            var closed = contextMenu.getTabsToClose(tabs[3], tabs, contextMenu.tabTests.tabsFromDomain);
            assert.deepEqual([0, 2, 3], closed);
        });

        it('closes other tabs from the same domain', function() {
            var closed = contextMenu.getTabsToClose(tabs[3], tabs, contextMenu.tabTests.otherTabsFromDomain);
            assert.deepEqual([0, 2], closed);
        });

        it('closes tabs from other domain', function() {
            var closed = contextMenu.getTabsToClose(tabs[1], tabs, contextMenu.tabTests.tabsFromOtherDomain);
            assert.deepEqual([0, 2, 3], closed);
            var closed = contextMenu.getTabsToClose(tabs[0], tabs, contextMenu.tabTests.tabsFromOtherDomain);
            assert.deepEqual([1], closed);
        });
    });

    it('handles clicks', function(done) {
        var tabTest = sinon.stub().returns(false);
        sinon.stub(contextMenu, 'getWindowTabs').yields(tabs);

        var handler = contextMenu.getClickHandler(tabTest, function() {
            assert.equal(4, tabTest.callCount);
            assert.equal(true, chrome.tabs.remove.calledWith([]));
            done();
        });

        handler(null, tabs[1].tab);
    });
});
