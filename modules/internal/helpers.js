/**
 * Internal Helper Module
 * Belongs to Decentraleyes/LocalCDN.
 *
 * @author      Thomas Rientjes
 * @since       2017-10-26
 *
 * @author      nobody42
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
 * Helpers
 */

var helpers = {};

/**
 * Public Methods
 */

helpers.insertI18nContentIntoDocument = function (document) {

    let scriptDirection, defaultScriptDirection, i18nElements, translationComplete;

    translationComplete = true;
    scriptDirection = helpers.determineScriptDirection(navigator.language);
    defaultScriptDirection = helpers.determineScriptDirection('en_US');
    i18nElements = document.querySelectorAll('[data-i18n-content]');

    i18nElements.forEach(function (i18nElement) {

        let i18nMessageName = i18nElement.getAttribute('data-i18n-content');

        if(chrome.i18n.getMessage(i18nMessageName) !== '') {
            if (i18nElement.type === "button") {
                i18nElement.value = chrome.i18n.getMessage(i18nMessageName);
            } else {
                i18nElement.innerText = chrome.i18n.getMessage(i18nMessageName);
            }
            i18nElement.setAttribute('dir', scriptDirection);
        } else {
            translationComplete = false;
        }
    });

    return translationComplete;

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

    if (/^(?!(http[s]?|file):\/\/).*/.test(url)) {
        return null;
    }

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
    case 'ajax.cloudflare.com':
        return 'Cloudflare CDN';
    case 'akamai-webcdn.kgstatic.net':
        return 'Akamai WebCDN';
    case 'netdna.bootstrapcdn.com':
        return 'NetDNA';
    case 'pagecdn.io':
        return 'PageCDN';
    default:
        return 'Unknown';
    }
};

helpers.determineResourceName = function (filename) {

    switch (filename) {

    case 'algoliasearch.min.jsm':
        return 'AlgoliaSearch';
    case 'angucomplete-alt.min.jsm':
        return 'AngulComplete';
    case 'rzslider.min.jsm':
        return 'AngularJS slider';
    case 'angular-animate.min.jsm':
        return 'AngularJS Animate';
    case 'angular-aria.min.jsm':
        return 'AngularJS Aria';
    case 'angular-cookies.min.jsm':
        return 'AngularJS Cookies';
    case 'angular-loader.min.jsm':
        return 'AngularJS Loader';
    case 'angular-message-format.min.jsm':
        return 'AngularJS Message Format';
    case 'angular-messages.min.jsm':
        return 'AngularJS Messages';
    case 'angular-parse-ext.min.jsm':
        return 'AngularJS ParseExt';
    case 'angular-resource.min.jsm':
        return 'AngularJS Resource';
    case 'angular-route.min.jsm':
        return 'AngularJS Route';
    case 'angular-sanitize.min.jsm':
        return 'AngularJS Sanitize';
    case 'angular-touch.min.jsm':
        return 'AngularJS Touch';
    case 'angular.min.jsm':
        return 'AngularJS';
    case 'autocomplete.min.jsm':
        return 'autocomplete.js';
    case 'toaster.min.css':
        return 'AngularJS Toaster (CSS)';
    case 'toaster.min.jsm':
        return 'AngularJS Toaster (JS)';
    case 'angular-ui-router.min.jsm':
        return 'Angular UI Router';
    case 'angular-payments.jsm':
        return 'Angular Payments';
    case 'angular-stripe-checkout.jsm':
        return 'Angular Stripe Checkout';
    case 'angular-sanitize.min.js':
        return 'Angular Sanitize';
    case 'animate.min.css':
        return 'Animate CSS';
    case 'angular-material.min.jsm':
        return 'AngularJS Material Design';
    case 'angular-material.min.css':
        return 'AngularJS Material Design';
    case 'backbone-min.jsm':
        return 'Backbone.js';
    case 'bootstrap.min.css':
        return 'Bootstrap CSS';
    case 'bootstrap.min.css':
        return 'Bootstrap CSS';
    case 'bootstrap.min.jsm':
        return 'Bootstrap JS';
    case 'daterangepicker.min.jsm':
        return 'Bootstrap Daterangepicker';
    case 'bootstrap-datepicker.min.jsm':
        return 'Bootstrap Datepicker JS';
    case 'bootstrap-datepicker.standalone.min.css':
        return 'Bootstrap Datepicker CSS';
    case 'bootstrap-select.min.css':
        return 'Bootstrap-select CSS';
    case 'bootstrap-select.min.jsm':
        return 'Bootstrap-select JS';
    case 'bootstrap-slider.min.jsm':
        return 'bootstrap-slider JS';
    case 'bootstrap-slider.min.css':
        return 'bootstrap-slider CSS';
    case 'clipboard.min.jsm':
        return 'clipboard.js';
    case 'd3.min.jsm':
        return 'D3.js';
    case 'dojo.jsm':
        return 'Dojo';
    case 'ember.min.jsm':
        return 'Ember.js';
    case 'ext-core.jsm':
        return 'Ext Core';
    case 'jquery.fancybox.min.css':
        return 'fancyBox (CSS)';
    case 'jquery.fancybox-media.jsm':
        return 'fancyBox Media (JS)';
    case 'jquery.fancybox.min.jsm':
        return 'fancyBox (JS)';
    case 'flv.min.jsm':
        return 'flv.js';
    case 'font-awesome.min.css':
        return 'Font Awesome';
    case 'all.css':
        return 'Font Awesome';
    case 'hls.min.jsm':
        return 'hls.js';
    case 'jquery.min.jsm':
        return 'jQuery';
    case 'jquery.autocomplete.min.jsm':
        return 'jQuery Ajax AutoComplete';
    case 'jquery-ui.min.jsm':
        return 'jQuery UI';
    case 'jquery-ui.min.css':
        return 'jQuery UI Themes';
    case 'jquery.blockUI.min.jsm':
        return 'jQuery Block UI';
    case 'jquery.csv.min.jsm':
        return 'jQuery-csv';
    case 'jquery.lazyload.min.jsm':
        return 'jQuery Lazy Load';
    case 'jquery-migrate.min.jsm':
        return 'jQuery Migrate';
    case 'jquery.validate.min.jsm':
        return 'jQuery jeditable';
    case 'jquery.jeditable.min.jsm':
        return 'jQuery Validation Plugin';
    case 'jquery.urlive.min.jsm':
        return 'jQuery URLive';
    case 'jquery.mobile.min.jsm':
        return 'jQuery Mobile';
    case 'js.cookie.min.jsm':
        return 'JavaScript Cookie';
    case 'lazysizes.min.jsm':
        return 'lazysizes';
    case 'lodash.min.jsm':
        return 'Lodash';
    case 'lozad.min.jsm':
        return 'lozad.js';
    case 'mdb.min.css':
        return 'MDBootstrap (CSS)';
    case 'mdb.min.jsm':
        return 'MDBootstrap (JS)';
    case 'modernizr.min.jsm':
        return 'Modernizr';
    case 'moment.min.jsm':
        return 'Modernizr';
    case 'mootools-yui-compressed.jsm':
        return 'MooTools';
    case 'ocLazyLoad.min.jsm':
        return 'ocLazyLoad';
    case 'p2p-media-loader-core.min.jsm':
        return 'P2P Media Loader Core';
    case 'page.min.jsm':
        return 'page.js';
    case 'plyr.min.css':
        return 'plyr CSS';
    case 'popper.min.jsm':
        return 'Popper';
    case 'prototype.jsm':
        return 'Prototype';
    case 'raven.min.jsm':
        return 'Raven.js';
    case 'react.production.min.jsm':
        return 'React';
    case 'react-dom.production.min.jsm':
        return 'ReactDOM';
    case 'rocket-loader.min.jsm':
        return 'Rocket Loader';
    case 'rickshaw.min.jsm':
        return 'rickshaw JS';
    case 'rickshaw.min.css':
        return 'rickshaw CSS';
    case 'scriptaculous.jsm':
        return 'Scriptaculous';
    case 'select.min.jsm':
        return 'AngularJS ui-select';
    case 'select2.min.css':
        return 'Select2 CSS';
    case 'select2.full.min.jsm':
        return 'Select2 JS';
    case 'socket.io.jsm':
        return 'Socket.IO';
    case 'spin.min.jsm':
        return 'spin.js';
    case 'store.legacy.min.jsm':
        return 'Store.js';
    case 'swfobject.jsm':
        return 'SWFObject';
    case 'tether.min.jsm':
        return 'Tether JS';
    case 'toastr.min.css':
        return 'toastr.js';
    case 'toastr.min.jsm':
        return 'toastr.js';
    case 'ui-bootstrap-tpls.min.jsm':
        return 'Angular UI Bootstrap';
    case 'ui-bootstrap.min.jsm':
        return 'Angular UI Bootstrap';
    case 'underscore-min.jsm':
        return 'Underscore.js';
    case 'webfont.jsm':
        return 'Web Font Loader';
    case 'adapter.min.jsm':
        return 'WebRTC adapter';
    case 'vue.jsm':
        return 'Vue.js';
    case 'urlize.jsm':
        return 'urlize';
    case 'wow.min.jsm':
        return 'WOW';
    case 'jsdelivr-combine-jquery-hogan-algoliasearch-autocomplete.jsm':
        return 'jsDelivr combined';
    case 'algoliasearch3.33.0_algoliasearchLite_algoliasearchHelper.jsm':
        return 'jsDelivr combined';
    case 'webcomponents-loader.jsm':
        return 'WebComponents Loader JS';
    default:
        return 'Unknown';
    }
};

helpers.determineBundle = function (path = '') {
    if (path.includes('findify')) {
        return 'Findify';
    } else {
        return '';
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

helpers.setLastVersion = function (type, version) {
    /**
     * If-Else-If is the fastest way.
     * Measurement results:
     * Switch-Case (with Regex): 0-8ms (Average ~4ms)
     * If-Else-If:               0-5ms (Average <1ms)
     */
    let requestVersion;

    if(version !== null && version !== undefined) {
        requestVersion = version.toString();
    }
    if (type.includes('/algoliasearch/3.')) {
        return  '3.35.1';
    } else if (type.includes('/angularjs/1.')) {
        if (helpers.compareVersion('1.3.13', requestVersion)) return '1.3.13'; // <= v1.3.13
        else if (helpers.compareVersion('1.4.14', requestVersion)) return '1.4.14'; // > 1.3.13 to <= 1.4.14
        else if (helpers.compareVersion('1.5.11', requestVersion)) return '1.5.11'; // > 1.4.14 to <= 1.5.11
        else if (helpers.compareVersion('1.6.10', requestVersion)) return '1.6.10'; // > 1.5.11 to <= 1.6.10
        else return '1.7.9'; // >= 1.6.11
    } else if (type.includes('/angularjs-slider/6.')) {
        return  '6.7.0';
    } else if (type.includes('/angularjs-toaster/2.')) {
        return  '2.2.0';
    } else if (type.includes('/angularjs-toaster/0.')) {
        return  '0.4.18';
    } else if (type.includes('/angular-payments@1.')) {
        return  '1.0.7';
    } else if (type.includes('/angular-stripe-checkout@5.')) {
        return  '5.1.0';
    } else if (type.includes('/angular-ui-bootstrap/0.')) {
        return  '0.14.3';
    } else if (type.includes('/angular-ui-bootstrap/1.')) {
        return  '1.3.3';
    } else if (type.includes('/angular-ui-router/')) {
        if (helpers.compareVersion('0.4.3', requestVersion)) return '0.4.3'; // <= 0.4.3
        else return '1.0.25'; // > 0.4.3
    } else if (type.includes('/angular-ui-select/0.')) {
        return  '0.20.0';
    } else if (type.includes('/angular-sanitize/1.')) {
        return  '1.7.9';
    } else if (type.includes('/angucomplete-alt/3.')) {
        return  '3.0.0';
    } else if (type.includes('/animate.css/3.')) {
        return  '3.7.2';
    } else if (type.includes('/autocomplete.js/')) {
        return  '0.37.1';
    } else if (type.includes('/angular-material/1.')) {
        return  '1.1.21';
    } else if (type.includes('/backbone.js/0.')) {
        return  '0.9.10';
    } else if (type.includes('/backbone.js/1.')) {
        return  '1.4.0';
    } else if (type.includes('/bootstrap.js/3.')) {
        return  '3.3.7';
    } else if (type.includes('/bootstrap.js/4.')) {
        return  '4.4.1';
    } else if (type.includes('/bootstrap.css/3.')) {
        return  '3.3.7';
    } else if (type.includes('/bootstrap.css/4.')) {
        return  '4.4.1';
    } else if (type.includes('/bootstrap-daterangepicker/2.')) {
        return  '2.1.27';
    } else if (type.includes('/bootstrap-datepicker/1.')) {
        return  '1.9.0';
    } else if (type.includes('/bootstrap-slider/10.')) {
        return  '10.6.2';
    } else if (type.includes('/bootstrap-select/1.')) {
        return  '1.13.17';
    } else if (type.includes('/clipboard.js/2.')) {
        return  '2.0.6';
    } else if (type.includes('/d3/3.')) {
        return  '3.5.17';
    } else if (type.includes('/dojo/1.')) {
        return  '1.14.1';
    } else if (type.includes('/ember.js/1.')) {
        return  '1.13.13';
    } else if (type.includes('/ember.js/2.')) {
        return  '2.18.2';
    } else if (type.includes('/ember.js/3.')) {
        return  '3.12.3';
    } else if (type.includes('/ext-core/3.')) {
        return  '3.1.0';
    } else if (type.includes('findify')) {
        return  '6.9.15';
    } else if (type.includes('/fancybox/2.')) {
        return  '2.1.5';
    } else if (type.includes('/flv.js/')) {
        return  '1.5.0';
    } else if (type.includes('/fontawesome/3.')) {
        return  '3.2.1';
    } else if (type.includes('/fontawesome/4.')) {
        return  '4.7.0';
    } else if (type.includes('/fontawesome/5.')) {
        return  '5.7.2';
    } else if (type.includes('/hls.js/')) {
        return  '0.13.2';
    } else if (type.includes('/jquery/1.')) {
        if (helpers.compareVersion('1.7.1', requestVersion)) return '1.7.1'; // <= v1.7.1
        else if (helpers.compareVersion('1.8.3', requestVersion)) return '1.8.3'; // > 1.7.1 to <= 1.8.3
        else return '1.12.4'; // >= 1.8.4
    } else if (type.includes('/jquery/1.8.')) {
        return  '1.8.3';
    } else if (type.includes('/jquery/2.')) {
        return  '2.2.4';
    } else if (type.includes('/jquery/3.')) {
        return  '3.4.1';
    } else if (type.includes('/jquery.devbridge-autocomplete/1.')) {
        return  '1.4.10';
    } else if (type.includes('/jqueryui/1.')) {
        if (helpers.compareVersion('1.8.18', requestVersion)) return '1.8.18'; // <= v1.8.18
        else return '1.11.4'; // >= 1.8.19
    } else if (type.includes('/jquery.blockUI/2.')) {
        return  '2.70';
    } else if (type.includes('/jquery-csv/1.')) {
        return  '1.0.9';
    } else if (type.includes('/jquery.lazyload/1.')) {
        return  '1.9.1';
    } else if (type.includes('/jquery-migrate/1.')) {
        return  '1.4.1';
    } else if (type.includes('/jquery-migrate/3.')) {
        return  '3.1.0';
    } else if (type.includes('/jquery-validate/1.')) {
        return  '1.19.1';
    } else if (type.includes('/jquery-jeditable/1.')) {
        return  '1.8.0';
    } else if (type.includes('/mobile/1.')) {
        return  '1.4.5';
    } else if (type.includes('/urlive/1.')) {
        return  '1.1.1';
    } else if (type.includes('/js-cookie/2.')) {
        return  '2.2.1';
    } else if (type.includes('/lazysizes/4.')) {
        return  '4.1.8';
    } else if (type.includes('/lodash.js/4.')) {
        return  '4.17.10';
    } else if (type.includes('lozad')) {
        return  '1.14.0';
    } else if (type.includes('/mdbootstrap/4.')) {
        return  '4.18.0';
    } else if (type.includes('/modernizr/2.')) {
        return  '2.8.3';
    } else if (type.includes('/moment.js/2.')) {
        return  '2.24.0';
    } else if (type.includes('/mootools/1.')) {
        return  '1.6.0';
    } else if (type.includes('/oclazyload/1.')) {
        return  '1.1.0';
    } else if (type.includes('p2p-media-loader-core')) {
        return  '0.6.2';
    } else if (type.includes('/page.js/1.')) {
        return  '1.7.1';
    } else if (type.includes('/plyr/3.')) {
        return  '3.5.10';
    } else if (type.includes('/popper.js/1.')) {
        return  '1.16.1';
    } else if (type.includes('/prototype/1.')) {
        return  '1.7.3.0';
    } else if (type.includes('/raven.js/3.')) {
        return  '3.26.2';
    } else if (type.includes('/react/16.')) {
        return  '16.13.1';
    } else if (type.includes('/react-dom/16.')) {
        return  '16.13.1';
    } else if (type.includes('/rickshaw/1.')) {
        return  '1.6.6';
    } else if (type.includes('/scriptaculous/1.')) {
        return  '1.9.0';
    } else if (type.includes('/select2/4.')) {
        return  '4.0.12';
    } else if (type.includes('/socket.io/2.')) {
        return  '2.3.0';
    } else if (type.includes('/spin.js/2.')) {
        return  '2.3.2';
    } else if (type.includes('/store.js/2.')) {
        return  '2.0.4';
    } else if (type.includes('/swfobject/2.')) {
        return  '2.2';
    } else if (type.includes('/tether/1.')) {
        return  '1.4.7';
    } else if (type.includes('/twitter-bootstrap/4.')) {
        return  '4.5.0';
    } else if (type.includes('/twitter-bootstrap/3.')) {
        return  '3.4.1';
    } else if (type.includes('/twitter-bootstrap/2.')) {
        return  '2.3.2';
    } else if (type.includes('/toastr.js/2.')) {
        return  '2.1.4';
    } else if (type.includes('/underscore.js/1.')) {
        return  '1.9.1';
    } else if (type.includes('/urlive/1.')) {
        return  '1.1.1';
    } else if (type.includes('/vue/1.')) {
        return  '1.0.28';
    } else if (type.includes('/vue/2.')) {
        return  '2.6.11';
    } else if (type.includes('webfont')) {
        return  '1.6.28';
    } else if (type.includes('/webrtc-adapter/6.')) {
        return  '6.4.8';
    } else if (type.includes('/wow/1.')) {
        return  '1.1.2';
    } else if (version === null) {
        return  'latest';
    }
};


helpers.compareVersion = function (v1, v2) {
    /**
     *  compareVersion( '1.5.7' , '1.5.8' ) is TRUE
     *  compareVersion( '1.5.8' , '1.5.7' ) is FALSE
     *  compareVersion( '1.5.7' , '1.5.7' ) is TRUE
     */
    v1 = v1.split('.');
    v2 = v2.split('.');
    const k = Math.min(v1.length, v2.length);
    for (let i = 0; i < k; ++ i) {
        v1[i] = parseInt(v1[i], 10);
        v2[i] = parseInt(v2[i], 10);
        if (v1[i] > v2[i]) return true;
        if (v1[i] < v2[i]) return false;
    }
    return v1.length == v2.length ? true: (v1.length < v2.length ? false : true);
}
