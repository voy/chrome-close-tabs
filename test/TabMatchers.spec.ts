import { expect } from 'chai';

import * as TabPredicates from '../src/TabMatchers';

describe('Tab matchers', function() {
    const tabA = {
        domain: 'www.foo.com',
        sld: 'foo.com',
        tab: {
            index: 1
        }
    } as DecoratedTab;

    const tabB = {
        domain: 'www.foo.com',
        sld: 'foo.com',
        tab: {
            index: 2
        }
    } as DecoratedTab;

    const tabC = {
        domain: 'www.bar.com',
        sld: 'bar.com',
        tab: {
            index: 3
        }
    } as DecoratedTab;

    const tabs = [tabA, tabB, tabC];

    describe('#tabsFromDomain', () => {
        it('should return tabs on the same domain including current tab', () => {
            expect(TabPredicates.tabsFromDomain(tabs, tabB)).to.eql([tabA, tabB]);
        });
    });

    describe('#otherTabsFromDomain', () => {
        it('should return tabs on the same domain excluding current tab', () => {
            expect(TabPredicates.otherTabsFromDomain(tabs, tabB)).to.eql([tabA]);
        });
    });

    describe('#tabsFromSld', () => {
        it('should return tabs on the same SLD including current tab', () => {
            expect(TabPredicates.tabsFromSld(tabs, tabB)).to.eql([tabA, tabB]);
        });
    });

    describe('#otherTabsFromSld', () => {
        it('should return tabs on the same domain excluding current tab', () => {
            expect(TabPredicates.otherTabsFromSld(tabs, tabB)).to.eql([tabA]);
        });
    });
});