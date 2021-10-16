/**
 * Interceptor
 * Belongs to LocalCDN (since 2020-02-26)
 * (Origin: Decentraleyes)
 *
 * @author      Thomas Rientjes
 * @since       2016-04-06
 *
 * @author      nobody
 * @since       2020-02-26
 *
 * @license     MPL 2.0
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/.
 */

'use strict';


/**
 * Interceptor
 */

var interceptor = {};


/**
 * Public Methods
 */

interceptor.handleRequest = function (requestDetails, tabIdentifier, tab) {
    let validCandidate, targetDetails, targetPath, targetDetailURL;

    validCandidate = requestAnalyzer.isValidCandidate(requestDetails, tab);

    if (!validCandidate) {
        return {
            'cancel': false
        };
    }

    if (interceptor._isBadResource(requestDetails.url)) {
        console.log(`[ LocalCDN ] Evil resource blocked: ${requestDetails.url}`);
        log.append(tab.url, requestDetails.url, '-', true);
        return {
            'cancel': true
        };
    }

    targetDetails = requestAnalyzer.getLocalTarget(requestDetails, tab.url);
    targetPath = targetDetails.path;


    if (Regex.GOOGLE_FONTS.test(requestDetails.url)) {
        let initiatorDomain, isListed;

        initiatorDomain = helpers.extractDomainFromUrl(tab.url, true);
        isListed = helpers.checkAllowlisted(initiatorDomain, interceptor.allowedDomainsGoogleFonts);
        // Check if the website is allowed to load Google Fonts
        if (interceptor.blockGoogleFonts === true && isListed === false) {
            return {
                'cancel': true
            };
        } else if (interceptor.blockGoogleFonts === false || isListed === true) {
            return {
                'cancel': false
            };
        }
    }

    targetDetailURL = helpers.extractDomainFromUrl(requestDetails.url, true);

    if (targetDetails === false && !IgnoredHost[targetDetailURL]) {
        ++stateManager.tabs[tabIdentifier].missing;
    }

    if (!targetDetails) {
        return interceptor._handleMissingCandidate(requestDetails.url, tabIdentifier);
    }

    stateManager.requests[requestDetails.requestId] = {
        tabIdentifier, targetDetails
    };

    return {
        'redirectUrl': chrome.runtime.getURL(targetPath + fileGuard.secret)
    };
};


/**
 * Private Methods
 */

interceptor._handleMissingCandidate = function (requestUrl, tabIdentifier) {
    let requestUrlSegments, injectionCount, missingCount;

    if (stateManager.showIconBadge === true) {
        injectionCount = Object.keys(stateManager.tabs[tabIdentifier].injections).length || 0;
        if (stateManager.changeBadgeColorMissingResources === true) {
            missingCount = stateManager.tabs[tabIdentifier].missing || 0;
            if (missingCount > 0 && injectionCount === 0) {
                wrappers.setBadgeText(tabIdentifier, injectionCount);
            }
        } else {
            wrappers.setBadgeText(tabIdentifier, injectionCount);
        }
    }

    if (interceptor.blockMissing === true) {
        return {
            'cancel': true
        };
    }

    requestUrlSegments = new URL(requestUrl);

    if (requestUrlSegments.protocol === Address.HTTP) {
        requestUrlSegments.protocol = Address.HTTPS;
        requestUrl = requestUrlSegments.toString();

        return {
            'redirectUrl': requestUrl
        };
    } else {
        return {
            'cancel': false
        };
    }
};

interceptor._handleStorageChanged = function (changes) {
    if (Setting.XHR_TEST_DOMAIN in changes) {
        interceptor.xhrTestDomain = changes.xhrTestDomain.newValue;
    }

    if (Setting.BLOCK_MISSING in changes) {
        interceptor.blockMissing = changes.blockMissing.newValue;
    }

    if (Setting.BLOCK_GOOGLE_FONTS in changes) {
        interceptor.blockGoogleFonts = changes.blockGoogleFonts.newValue;
    }

    if (Setting.ALLOWED_DOMAINS_GOOGLE_FONTS in changes) {
        interceptor.allowedDomainsGoogleFonts = changes.allowedDomainsGoogleFonts.newValue;
    }
};

interceptor._isBadResource = function (requestUrl) {
    requestUrl = requestUrl.replace(/(^\w+:|^)\/\//, '');
    return Object.keys(BadResources).filter((path) => requestUrl.startsWith(path)).length !== 0;
};

/**
 * Event Handlers
 */

chrome.storage.onChanged.addListener(interceptor._handleStorageChanged);
