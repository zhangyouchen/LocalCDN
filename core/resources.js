/**
 * Resources
 * Belongs to Decentraleyes.
 *
 * @author      Thomas Rientjes
 * @since       2014-05-30
 * @license     MPL 2.0
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/.
 */

'use strict';

/**
 * Resources
 */

var resources = {

    // AngularJS
    'angular': {
        'path': 'resources/angularjs/{version}/angular.min.jsm',
        'type': 'application/javascript'
    },
    'angularAnimate': {
        'path': 'resources/angularjs/{version}/angular-animate.min.jsm',
        'type': 'application/javascript'
    },
    'angularSanitize': {
        'path': 'resources/angularjs/{version}/angular-sanitize.min.jsm',
        'type': 'application/javascript'
    },
    'angularCookies': {
        'path': 'resources/angularjs/{version}/angular-cookies.min.jsm',
        'type': 'application/javascript'
    },
    'angularTouch': {
        'path': 'resources/angularjs/{version}/angular-touch.min.jsm',
        'type': 'application/javascript'
    },
    // Animate CSS
    'animateCSS': {
        'path': 'resources/animate.css/{version}/animate.cssm',
        'type': 'text/css'
    },
    // Backbone.js
    'backbone': {
        'path': 'resources/backbone.js/{version}/backbone-min.jsm',
        'type': 'application/javascript'
    },
    // Bootstrap.js
    'bootstrapJS': {
        'path': 'resources/bootstrap.js/{version}/bootstrap.min.jsm',
        'type': 'application/javascript'
    },
    // Bootstrap.css
    'bootstrapCSS': {
        'path': 'resources/bootstrap.css/{version}/bootstrap.min.cssm',
        'type': 'text/css'
    },
    // bootstrap-slider (Slider for Bootstrap 3)
    'bootstrapSliderCSS': {
        'path': 'resources/bootstrap-slider/{version}/bootstrap-slider.min.cssm',
        'type': 'text/css'
    },
    'bootstrapSliderJS': {
        'path': 'resources/bootstrap-slider/{version}/bootstrap-slider.min.jsm',
        'type': 'application/javascript'
    },
    // Dojo
    'dojo': {
        'path': 'resources/dojo/{version}/dojo/dojo.jsm',
        'type': 'application/javascript'
    },
    // Ember.js
    'ember': {
        'path': 'resources/ember.js/{version}/ember.min.jsm',
        'type': 'application/javascript'
    },
    // Ext Core
    'extCore': {
        'path': 'resources/ext-core/{version}/ext-core.jsm',
        'type': 'application/javascript'
    },
    // Finify bundle
    'findifyBundle': {
        'path': 'resources/findify-bundle/{version}/',
        'type': 'application/javascript'
    },
    // Font Awesome
    'fontawesome': {
        'path': 'resources/fontawesome/{version}/css/font-awesome.min.cssm',
        'type': 'text/css'
    },
    // Font Awesome
    'fontawesome5': {
        'path': 'resources/fontawesome/{version}/css/all.cssm',
        'type': 'text/css'
    },
    // jeditableJS
    'jeditableJS': {
        'path': 'resources/jquery-jeditable/{version}/jquery.jeditable.min.jsm',
        'type': 'application/javascript'
    },
    // jQuery
    'jQuery': {
        'path': 'resources/jquery/{version}/jquery.min.jsm',
        'type': 'application/javascript'
    },
    // jQuery UI
    'jQueryUI': {
        'path': 'resources/jqueryui/{version}/jquery-ui.min.jsm',
        'type': 'application/javascript'
    },
    // jQuery Validation Plugin
    'jqueryValidationPlugin': {
        'path': 'resources/jquery-validate/{version}/jquery.validate.min.jsm',
        'type': 'application/javascript'
    },
    // lazysizes
    'lazysizes': {
        'path': 'resources/lazysizes/{version}/lazysizes.min.jsm',
        'type': 'application/javascript'
    },
    // lozad.js
    'lozad': {
        'path': 'resources/lozad.js/{version}/lozad.min.jsm',
        'type': 'application/javascript'
    },
    // Modernizr
    'modernizr': {
        'path': 'resources/modernizr/{version}/modernizr.min.jsm',
        'type': 'application/javascript'
    },
    // Moment.js
    'moment': {
        'path': 'resources/moment.js/{version}/moment.min.jsm',
        'type': 'application/javascript'
    },
    // MooTools
    'mootools': {
        'path': 'resources/mootools/{version}/mootools-core.min.jsm',
        'type': 'application/javascript'
    },
    // page.js
    'pageJs': {
        'path': 'resources/page.js/{version}/page.min.jsm',
        'type': 'application/javascript'
    },
    // Prototype
    'prototypeJS': {
        'path': 'resources/prototype/{version}/prototype.jsm',
        'type': 'application/javascript'
    },
    // rickshaw
    'rickshawJS': {
        'path': 'resources/rickshaw/{version}/rickshaw.min.jsm',
        'type': 'application/javascript'
    },
    'rickshawCSS': {
        'path': 'resources/rickshaw/{version}/rickshaw.min.cssm',
        'type': 'text/css'
    },
    // Cloudflare Rocket Loader
    'cfRocketLoader': {
        'path': 'resources/rocket-loader/latest/rocket-loader.min.jsm',
        'type': 'application/javascript'
    },
    // Scriptaculous
    'scriptaculous': {
        'path': 'resources/scriptaculous/{version}/scriptaculous.jsm',
        'type': 'application/javascript'
    },
    // SWFObject
    'swfobject': {
        'path': 'resources/swfobject/{version}/swfobject.jsm',
        'type': 'application/javascript'
    },
    // Twitter Bootstrap JS
    'twitterBootstrapJS': {
        'path': 'resources/twitter-bootstrap/{version}/bootstrap.min.jsm',
        'type': 'application/javascript'
    },
    // Twitter Bootstrap CSS
    'twitterBootstrapCSS': {
        'path': 'resources/twitter-bootstrap/{version}/bootstrap.min.cssm',
        'type': 'text/css'
    },
    // toastr.js
    'toastrCSS': {
        'path': 'resources/toastr.js/{version}/toastr.min.cssm',
        'type': 'text/css'
    },
    // toastr.js
    'toastrJS': {
        'path': 'resources/toastr.js/{version}/toastr.min.jsm',
        'type': 'application/javascript'
    },
    // Underscore.js
    'underscore': {
        'path': 'resources/underscore.js/{version}/underscore-min.jsm',
        'type': 'application/javascript'
    },
    // Vue.js
    'vueJs': {
        'path': 'resources/vue/{version}/vue.jsm',
        'type': 'application/javascript'
    },
    // Web Font Loader
    'webfont': {
        'path': 'resources/webfont/{version}/webfont.jsm',
        'type': 'application/javascript'
    },
    'webfontloader': {
        'path': 'resources/webfont/{version}/webfontloader.jsm',
        'type': 'application/javascript'
    },
    // WOW
    'wow': {
        'path': 'resources/wow/{version}/wow.min.jsm',
        'type': 'application/javascript'
    }
};
