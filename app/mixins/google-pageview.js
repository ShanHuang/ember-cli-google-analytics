import Ember from 'ember';
import ENV from '../config/environment';
var computed = Ember.computed;

export default Ember.Mixin.create({
  webPropertyId: Ember.get(ENV, 'googleAnalytics.webPropertyId'),
  dimensionMap: {
    company: 'dimension0',
    department: 'dimension1',
    title: 'dimension2',
    uuid: 'dimension3',
    // reserving 4 to  9 for additional user dimensions
    pageType: 'dimension10', // 'search'|'filter'|'nav'|'detial'
    eventCategory: 'eventCategory',
    eventAction: 'eventAction',
    eventLabel: 'eventLabel',
    eventValue: 'eventValue'
  },
  dimensionRegistry: {},
  user: null, // has to be set by primary app add to install notes
  notLoggedIn: computed.empty('user'),
  uuid: function() {
    return this.get('notLoggedIn') ? null : this.get('user').uuid;
  }.property('user'),
  userCompany: function() {
    return this.get('notLoggedIn') ? null : this.get('user').company;
  }.property('user'),
  userDepartment: function() {
    return this.get('notLoggedIn') ? null : this.get('user').department;
  }.property('user'),
  userTitle: function() {
    return this.get('notLoggedIn') ? null : this.get('user').title;
  }.property('user'),
  eventTypes: ['map_chart_interact', 'save_query', 'download'],

  beforePageviewToGA: function(ga) {

  },
  clearRegistry: function() {
    var dReg = this.get('dimensionRegistry');
    dReg.length = 0;
    this.insertUserMeta();
    return;
  },
  // processRegistry: function() {
  //   dimensionRegistry.forEach(function(entry) {
  //
  //   });
  // },
  setTrackingMeta: function(metaObj) {
    var dMap = this.get('dimensionMap');
    var dReg = this.get('dimensionRegistry');
    for (var property in metaObj) {
      if (dMap[property]) {
        dReg[dMap[property]] = metaObj[property];
      }
    }

  },
  insertUserMeta: function() {
    this.setTrackingMeta({
      company: this.get('userCompany'),
      department: this.get('userDepartment'),
      title: this.get('userTitle'),
      uuid: this.get('uuid')
    });
  },
  analyticsTrackingCode: function() {
    var gaConfig = {};
    var globalVariable = Ember.getWithDefault(ENV, 'googleAnalytics.globalVariable', 'ga');
    var cookieDomain = Ember.get(ENV, 'googleAnalytics.cookieDomain');
    var cookieName = Ember.get(ENV, 'googleAnalytics.cookieName');
    var cookieExpires = Ember.get(ENV, 'googleAnalytics.cookieExpires');
    var displayFeatures = Ember.get(ENV, 'googleAnalytics.displayFeatures');

    if (this.get('uuid') != null) {
      gaConfig.userId = this.get('uuid');
    } else {
      if (cookieDomain != null) {
        gaConfig.cookieDomain = cookieDomain;
      }
      if (config.cookieName != null) {
        gaConfig.cookieName = cookieName;
      }
      if (config.cookieExpires != null) {
        gaConfig.cookieExpires = cookieExpires;
      }
      if (Object.keys(gaConfig).length === 0) {
        gaConfig = '"auto"';
      } else {
        gaConfig = JSON.stringify(gaConfig);
      }
    }

    /* jshint ignore:start */
    (function(i, s, o, g, r, a, m) {
      i.GoogleAnalyticsObject = r;
      i[r] = i[r] || function() {
        (i[r].q = i[r].q || []).push(arguments)
      }, i[r].l = 1 * new Date();
      a = s.createElement(o),
        m = s.getElementsByTagName(o)[0];
      a.async = 1;
      a.src = g;
      m.parentNode.insertBefore(a, m)
    })(window, document, 'script', '//www.google-analytics.com/analytics.js', globalVariable);
    window[globalVariable]('create', config.webPropertyId, gaConfig);
    /* jshint ignore:end */

    if (displayFeatures) {
      window[globalVariable]('require', 'displayfeatures');
    }

    return;
  },

  prepare: function() {
    var webPropertyId = this.get('webPropertyId');
    if (webPropertyId != null) {
      this.insertScript(webPropertyId);
      if (Ember.get(ENV, 'googleAnalytics.tracker') === 'analytics.js') {
        this.analyticsTrackingCode();
      } else if (Ember.get(ENV, 'googleAnalytics.tracker') === 'ga.js') {
        // content = gaTrackingCode(googleAnalyticsConfig);
        //as legacy left google script init for this in the /index.js  content_for
        this.logTracking('ga.js call ', 'deprecated');
      } else {
        throw new Error('Invalid tracker found in configuration: "' + Ember.get(ENV, 'googleAnalytics.tracker') + '". Must be one of: "analytics.js", "ga.js"');
      }
    }
  }.on('init'),
  pageviewToGA: Ember.on('didTransition', function(page, title) {
    var page = page ? page : this.get('url');
    var title = title ? title : this.get('url');
    var fieldsObj = this.get('dimensionRegistry');
    fieldsObj.page = page;
    fieldsObj.title = title;

    if (Ember.get(ENV, 'googleAnalytics.webPropertyId') != null) {
      var trackerType = Ember.getWithDefault(ENV, 'googleAnalytics.tracker', 'analytics.js');

      if (trackerType === 'analytics.js') {
        var globalVariable = Ember.getWithDefault(ENV, 'googleAnalytics.globalVariable', 'ga');

        this.beforePageviewToGA(window[globalVariable]);
        window[globalVariable]('set', fieldsObj);
        window[globalVariable]('send', 'pageview');
        // logging
        this.logTracking('pageview', page);
        this.clearRegistry();
      } else if (trackerType === 'ga.js') {
        window._gaq.push(['_trackPageview']);
      }

    }
  }),
  eventToGA: function(eventCategory, eventAction, eventLabel) {
    if (Ember.get(ENV, 'googleAnalytics.webPropertyId') != null) {
      var trackerType = Ember.getWithDefault(ENV, 'googleAnalytics.tracker', 'analytics.js');

      if (trackerType === 'analytics.js') {
        var fieldsObj = this.get('dimensionRegistry');
        var globalVariable = Ember.getWithDefault(ENV, 'googleAnalytics.globalVariable', 'ga');

        this.beforePageviewToGA(window[globalVariable]);
        window[globalVariable]('set', fieldsObj);
        window[globalVariable]('send', 'event', eventCategory, eventAction, eventLabel);
        // logging
        this.logTracking('event', category, action, label, value, fieldsObj);
        this.clearRegistry();
      } else if (trackerType === 'ga.js') {
        // not implemented
        this.logTracking('ga.js call', category, action, label, value,    fieldsObj);
        this.clearRegistry();
      }
    }
    return;
  },
  logTrackingEnabled: function() {
    return Ember.getWithDefault(ENV, 'googleAnalytics.logTracking', false);
  },

  logTracking: function() {
    if (this.get('logTrackingEnabled'))
      Ember.Logger.info('Tracking Google Analytics event: ', arguments);
  }
});
