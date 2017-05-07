import { expect } from 'chai';

import * as TabPredicates from '../src/tab_predicates';

describe('Tab predicates', function() {
    describe('#tabsFromDomain', () => {
        const tabA = { domain: 'www.foo.com' } as DecoratedTab;
        const tabB = { domain: 'www.foo.com' } as DecoratedTab;
        const tabC = { domain: 'www.bar.com' } as DecoratedTab;

        it('should return true when tabs are on the same domain', () => {
            expect(TabPredicates.tabsFromDomain(tabA, tabB)).to.be.true;
        });

        it('should return false when tabs are not on the same domain', () => {
            expect(TabPredicates.tabsFromDomain(tabB, tabC)).to.be.false;
        });
    });

    describe('#otherTabsFromDomain', () => {
        const tabA = { domain: 'www.foo.com', tab: { index: 1 } } as DecoratedTab;
        const tabB = { domain: 'www.foo.com', tab: { index: 2 } } as DecoratedTab;
        const tabC = { domain: 'www.bar.com', tab: { index: 3 } } as DecoratedTab;

        it('should return true when tabs are on the same domain and different tabs', () => {
            expect(TabPredicates.otherTabsFromDomain(tabA, tabB)).to.be.true;
        });

        it('should return false when tabs are on the same domain and same tabs', () => {
            expect(TabPredicates.otherTabsFromDomain(tabA, tabA)).to.be.false;
        });

        it('should return false when tabs are not on the same domain', () => {
            expect(TabPredicates.otherTabsFromDomain(tabA, tabC)).to.be.false;
        });
    });

    describe('#tabsFromSld', () => {
        const tabA = { sld: 'foo.com' } as DecoratedTab;
        const tabB = { sld: 'foo.com' } as DecoratedTab;
        const tabC = { sld: 'bar.com' } as DecoratedTab;

        it('should return true when tabs are on the same SLD', () => {
            expect(TabPredicates.tabsFromSld(tabA, tabB)).to.be.true;
        });

        it('should return false when tabs are not on the same SLD', () => {
            expect(TabPredicates.tabsFromSld(tabB, tabC)).to.be.false;
        });
    });

    describe('#otherTabsFromSld', () => {
        const tabA = { sld: 'foo.com', tab: { index: 1 } } as DecoratedTab;
        const tabB = { sld: 'foo.com', tab: { index: 2 } } as DecoratedTab;
        const tabC = { sld: 'bar.com', tab: { index: 3 } } as DecoratedTab;

        it('should return true when tabs are on the same SLD and different tabs', () => {
            expect(TabPredicates.otherTabsFromSld(tabA, tabB)).to.be.true;
        });

        it('should return false when tabs are on the same SLD and same tabs', () => {
            expect(TabPredicates.otherTabsFromSld(tabA, tabA)).to.be.false;
        });

        it('should return false when tabs are not on the same SLD', () => {
            expect(TabPredicates.otherTabsFromSld(tabA, tabC)).to.be.false;
        });
    });
});