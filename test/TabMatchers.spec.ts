import { expect } from 'chai';

import * as TabMatchers from '../src/TabMatchers';

describe('Tab matchers', function() {
    const tabA = {
        domain: 'www.foo.com',
        sld: 'foo.com',
        tab: {
            url: 'http://www.foo.com/index.html',
            index: 1
        }
    } as DecoratedTab;

    const tabB = {
        domain: 'www.foo.com',
        sld: 'foo.com',
        tab: {
            url: 'http://www.foo.com/detail.html',
            index: 2
        }
    } as DecoratedTab;

    const tabC = {
        domain: 'www.bar.com',
        sld: 'bar.com',
        tab: {
            url: 'http://www.bar.com/',
            index: 3
        }
    } as DecoratedTab;

    const tabs = [tabA, tabB, tabC];

    describe('#tabsFromDomain', () => {
        it('should return tabs on the same domain including current tab', () => {
            expect(TabMatchers.tabsFromDomain(tabs, tabB)).to.eql([tabA, tabB]);
        });
    });

    describe('#otherTabsFromDomain', () => {
        it('should return tabs on the same domain excluding current tab', () => {
            expect(TabMatchers.otherTabsFromDomain(tabs, tabB)).to.eql([tabA]);
        });
    });

    describe('#tabsFromSld', () => {
        it('should return tabs on the same SLD including current tab', () => {
            expect(TabMatchers.tabsFromSld(tabs, tabB)).to.eql([tabA, tabB]);
        });
    });

    describe('#otherTabsFromSld', () => {
        it('should return tabs on the same domain excluding current tab', () => {
            expect(TabMatchers.otherTabsFromSld(tabs, tabB)).to.eql([tabA]);
        });
    });

    describe('#duplicates', () => {
        it('should return tabs with duplicated urls', () => {
            const tabD = {
                domain: 'www.foo.com',
                sld: 'foo.com',
                tab: {
                    url: 'http://www.foo.com/index.html',
                    index: 1
                }
            } as DecoratedTab;

            const extendedTabs = [...tabs, tabD];
            expect(TabMatchers.duplicates(extendedTabs, tabD)).to.eql([tabA]);
        });
    });
});