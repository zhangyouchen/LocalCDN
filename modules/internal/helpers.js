/**
 * Internal Helper Module
 * Belongs to Decentraleyes.
 *
 * @author      Thomas Rientjes
 * @since       2017-10-26
 * @license     MPL 2.0
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/.
 */

'use strict';

/**
 * Helpers
 */

var helpers = {};

/**
 * Public Methods
 */

helpers.insertI18nContentIntoDocument = function (document) {

    let scriptDirection, i18nElements;

    scriptDirection = helpers.determineScriptDirection(navigator.language);
    i18nElements = document.querySelectorAll('[data-i18n-content]');

    i18nElements.forEach(function (i18nElement) {

        let i18nMessageName = i18nElement.getAttribute('data-i18n-content');

        i18nElement.innerText = chrome.i18n.getMessage(i18nMessageName);
        i18nElement.setAttribute('dir', scriptDirection);
    });
};

helpers.insertI18nTitlesIntoDocument = function (document) {

    let scriptDirection, i18nElements;

    scriptDirection = helpers.determineScriptDirection(navigator.language);
    i18nElements = document.querySelectorAll('[data-i18n-title]');

    i18nElements.forEach(function (i18nElement) {

        let i18nMessageName = i18nElement.getAttribute('data-i18n-title');

        i18nElement.setAttribute('title', chrome.i18n.getMessage(i18nMessageName));
        i18nElement.setAttribute('dir', scriptDirection);
    });
};

helpers.languageIsFullySupported = function (language) {

    let languageSupported, supportedLanguages;

    languageSupported = false;

    supportedLanguages = [
        'ar', 'bg', 'zh', 'cs', 'da', 'nl', 'en', 'eo', 'et', 'fi',
        'fr', 'de', 'el', 'he', 'hu', 'is', 'id', 'it', 'ja', 'ko',
        'nb', 'pl', 'pt', 'ro', 'ru', 'es', 'sv', 'tr'
    ];

    for (let supportedLanguage of supportedLanguages) {

        if (language.search(supportedLanguage) !== -1) {
            languageSupported = true;
        }
    }

    return languageSupported;
};

helpers.normalizeDomain = function (domain) {

    domain = domain.toLowerCase().trim();

    if (domain.startsWith(Address.WWW_PREFIX)) {
        domain = domain.slice(Address.WWW_PREFIX.length);
    }

    return domain;
};

helpers.extractDomainFromUrl = function (url = '', normalize) {

    let extractedDomain;

    try {
        extractedDomain = new URL(url).host;
    } catch (exception) {
        extractedDomain = null;
    }

    if (url.startsWith(Address.CHROME)) {
        extractedDomain = null;
    }

    if (extractedDomain === '') {
        extractedDomain = null;
    }

    if (extractedDomain !== null && normalize === true) {
        extractedDomain = helpers.normalizeDomain(extractedDomain);
    }

    return extractedDomain;
};

helpers.extractFilenameFromPath = function (path) {

    let pathSegments, filename;

    pathSegments = path.split('/');
    filename = pathSegments[pathSegments.length - 1];

    return filename;
};

helpers.generateRandomHexString = function (length) {

    let randomValues, randomHexString;

    randomValues = crypto.getRandomValues(new Uint8Array(length));
    randomHexString = '';

    for (let value of randomValues) {

        // eslint-disable-next-line no-bitwise
        let hexValue = (0 ^ value & 15 >> 0 / 4).toString(16);
        randomHexString += hexValue;
    }

    return randomHexString;
};

helpers.determineCdnName = function (domainName) {

    switch (domainName) {

    case 'ajax.googleapis.com':
        return 'Google Hosted Libraries';
    case 'ajax.aspnetcdn.com':
        return 'Microsoft Ajax CDN';
    case 'ajax.microsoft.com':
        return 'Microsoft Ajax CDN [Deprecated]';
    case 'cdnjs.cloudflare.com':
        return 'CDNJS (Cloudflare)';
    case 'code.jquery.com':
        return 'jQuery CDN (MaxCDN)';
    case 'cdn.jsdelivr.net':
        return 'jsDelivr (Cloudflare)';
    case 'yastatic.net':
        return 'Yandex CDN';
    case 'yandex.st':
        return 'Yandex CDN [Deprecated]';
    case 'apps.bdimg.com':
        return 'Baidu CDN';
    case 'libs.baidu.com':
        return 'Baidu CDN [Deprecated]';
    case 'lib.sinaapp.com':
        return 'Sina Public Resources';
    case 'upcdn.b0.upaiyun.com':
        return 'UpYun Library';
    case 'cdn.bootcss.com':
        return 'BootCDN';
    case 'sdn.geekzu.org':
        return 'Geekzu Public Service [Mirror]';
    case 'ajax.proxy.ustclug.org':
        return 'USTC Linux User Group [Mirror]';
    case 'unpkg.com':
        return 'UNPKG (Cloudflare)';
    case 'stackpath.bootstrapcdn.com':
        return 'StackPath BootstrapCDN';
    case 'maxcdn.bootstrapcdn.com':
        return 'MaxCDN Bootstrap CDN';
    case 'use.fontawesome.com':
        return 'Font Awesome CDN';
    default:
        return 'Unknown';
    }
};

helpers.determineResourceName = function (filename) {

    switch (filename) {

    case 'angular.min.jsm':
        return 'AngularJS';
    case 'angular-animate.min.jsm':
        return 'AngularJS Animate';
    case 'angular-cookies.min.jsm':
        return 'AngularJS Cookies';
    case 'angular-sanitize.min.jsm':
        return 'AngularJS Sanitize';
    case 'angular-touch.min.jsm':
        return 'AngularJS Touch';
    case 'backbone-min.jsm':
        return 'Backbone.js';
    case 'dojo.jsm':
        return 'Dojo';
    case 'ember.min.jsm':
        return 'Ember.js';
    case 'ext-core.jsm':
        return 'Ext Core';
    case 'font-awesome.min.css':
        return 'Font Awesome';
    case 'all.css':
        return 'Font Awesome';
    case 'jquery.min.jsm':
        return 'jQuery';
    case 'jquery-ui.min.jsm':
        return 'jQuery UI';
    case 'modernizr.min.jsm':
        return 'Modernizr';
    case 'mootools-yui-compressed.jsm':
        return 'MooTools';
    case 'prototype.jsm':
        return 'Prototype';
    case 'scriptaculous.jsm':
        return 'Scriptaculous';
    case 'swfobject.jsm':
        return 'SWFObject';
    case 'underscore-min.jsm':
        return 'Underscore.js';
    case 'webfont.jsm':
        return 'Web Font Loader';
    case 'bootstrap.min.css':
        return 'Bootstrap CSS';
    case 'bootstrap.min.js':
        return 'Bootstrap JS';
    case 'bootstrap-slider.min.css':
        return 'bootstrap-slider';
    default:
        return 'Unknown';
    }
};

helpers.determineScriptDirection = function (language) {

    let rightToLeftLanguages, scriptDirection;

    rightToLeftLanguages = ['ar', 'he'];

    if (rightToLeftLanguages.indexOf(language) === -1) {
        scriptDirection = 'ltr';
    } else {
        scriptDirection = 'rtl';
    }

    return scriptDirection;
};

helpers.formatNumber = function (number) {

    if (typeof number === 'number') {
        return number.toLocaleString();
    }
};

helpers.formatVersion = function (version) {

    if (version.indexOf('beta') === -1) {
        return version;
    } else {
        return 'BETA';
    }
};

helpers.setLastVersion = function (type) {

    let version;

    if (type.includes('/angularjs/1.')) {
        version = '1.7.9';
    }
    else if (type.includes('/backbone.js/0.')) {
        version = '0.9.10';
    }
    else if (type.includes('/backbone.js/1.')) {
        version = '1.3.3';
    }
    else if (type.includes('/bootstrap.js/3.')) {
        version = '3.3.7';
    }
    else if (type.includes('/bootstrap.js/4.')) {
        version = '4.4.1';
    }
    else if (type.includes('/bootstrap.css/3.')) {
        version = '3.3.7';
    }
    else if (type.includes('/bootstrap.css/4.')) {
        version = '4.4.1';
    }
    else if (type.includes('/bootstrap-slider/10.')) {
        version = '10.6.2';
    }
    else if (type.includes('/dojo/1.')) {
        version = '1.10.4';
    }
    else if (type.includes('/ember.js/1.')) {
        version = '1.5.1';
    }
    else if (type.includes('/ember.js/2.')) {
        version = '2.1.0';
    }
    else if (type.includes('/ext-core/3.')) {
        version = '3.1.0';
    }
    else if (type.includes('/fontawesome/4.')) {
        version = '4.7.0';
    }
    else if (type.includes('/fontawesome/5.')) {
        version = '5.7.2';
    }
    else if (type.includes('/jquery/1.')) {
        version = '1.12.4';
    }
    else if (type.includes('/jquery/2.')) {
        version = '2.2.4';
    }
    else if (type.includes('/jquery/3.')) {
        version = '3.4.1';
    }
    else if (type.includes('/jqueryui/1.')) {
        version = '1.11.4';
    }
    else if (type.includes('/modernizr/2.')) {
        version = '2.8.3';
    }
    else if (type.includes('/moment.js/2.')) {
        version = '2.24.0';
    }
    else if (type.includes('/mootools/1.')) {
        version = '1.5.1';
    }
    else if (type.includes('/prototype/1.')) {
        version = '1.7.3.0';
    }
    else if (type.includes('/scriptaculous/1.')) {
        version = '1.9.0';
    }
    else if (type.includes('/swfobject/2.')) {
        version = '2.2';
    }
    else if (type.includes('/underscore.js/1.')) {
        version = '1.9.1';
    }
    else if (type.includes('/webfont/1.')) {
        version = '1.5.18';
    }

    return version;


};
