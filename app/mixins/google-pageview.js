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
    pageType: 'dimension10', // 'search'|'filter'|'nav'|'detail'
    searchText: 'dimension11',
    searchCriteriaJson: 'dimension12', //a json.stringify of all search criteria for tableau use

    // will make this data availalble to the api
    hitTimestamp: 'dimension17',
    sessionId: 'dimension18',
    clientId:  'dimension19',
    page: 'page',
    title: 'title',
    // allows event data to be configured
    eventCategory: 'eventCategory',
    eventAction: 'eventAction',
    eventLabel: 'eventLabel',
    eventValue: 'eventValue'
  },
  dimensionRegistry: {},
  user: function() {
    return null;
  }.on('init'), // has to be set by primary app add to install notes
  clientId: null,
  sessionId: null,
  notLoggedIn: computed.empty('user'),
  gaInitialized: false,
  trackerInitialized: false,
  uuid: function() {
    this.logTracking('google-pageview detected user change', this.get('user'));
    // return this.get('notLoggedIn') ? null : this.get('user').uuid;
    return this.get('notLoggedIn') ? null : 'this-is-a-test-uuid';
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
  eventTypes: ['map_chart_interact', 'save_query', 'download', 'other_button'],
  setTrackingUser: function(userObj) {
    if (userObj.id != this.get('user').id) {
      this.logTracking('setTrackingUser', userObj);
      this.set('user', userObj);
      this.prepare();
    }

  },
  beforePageviewToGA: function(ga) {

  },
  clearRegistry: function() {
    var dReg = this.get('dimensionRegistry');
    dReg = {};

    return;
  },
  setTrackingMeta: function(metaObj) {
    var dMap = this.get('dimensionMap');
    var dReg = this.get('dimensionRegistry');
    for (var property in metaObj) {
      if (dMap[property] && metaObj[property] != undefined && metaObj[property] != null) {
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
  gaInit: function() {
    var globalVariable = Ember.getWithDefault(ENV, 'googleAnalytics.globalVariable', 'ga');
    this.logTracking('gaInit',  globalVariable, 'did gaInit already run', this.get('gaInitialized'));
    if (!this.get('gaInitialized')) {
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
      /* jshint ignore:end */
      this.set('gaInitialized', true);
    }
  }.on('init'),
  analyticsTrackingCode: function() {
    var gaConfig = {};
    var globalVariable = Ember.getWithDefault(ENV, 'googleAnalytics.globalVariable', 'ga');
    var cookieDomain = Ember.get(ENV, 'googleAnalytics.cookieDomain');
    var cookieName = Ember.get(ENV, 'googleAnalytics.cookieName');
    var cookieExpires = Ember.get(ENV, 'googleAnalytics.cookieExpires');
    var webPropertyId = Ember.get(ENV, 'googleAnalytics.webPropertyId');
    var displayFeatures = Ember.get(ENV, 'googleAnalytics.displayFeatures');

    if (this.get('uuid') != null) {
      gaConfig.userId = this.get('uuid');
    } else {
      if (cookieDomain != null) {
        gaConfig.cookieDomain = cookieDomain;
      }
      if (cookieName != null) {
        gaConfig.cookieName = cookieName;
      }
      if (cookieExpires != null) {
        gaConfig.cookieExpires = cookieExpires;
      }
      if (Object.keys(gaConfig).length === 0) {
        gaConfig = '"auto"';
      } else {
        gaConfig = JSON.stringify(gaConfig);
      }
    }
    this.logTracking('analyticsTrackingCode', gaConfig, globalVariable, webPropertyId);
    /* jshint ignore:start */
    // moved intialization code
    window[globalVariable]('create', webPropertyId, gaConfig);
    /* jshint ignore:end */

    if (displayFeatures) {
      window[globalVariable]('require', 'displayfeatures');
    }
    this.set('trackerInitialized', true);
  },

  prepare: function() {
    var webPropertyId = Ember.get(ENV, 'googleAnalytics.webPropertyId');
    this.logTracking('prepare', webPropertyId, this.get('user'));
    if (webPropertyId != null) {
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
  },
  pageviewToGA: Ember.on('didTransition', function(page, title) {
    var _this = this;
    this.insertUserMeta();
    var page = page ? page : this.get('url');
    var title = title ? title : this.get('url');
    var fieldsObj = this.get('dimensionRegistry');
    fieldsObj.page = page;
    fieldsObj.title = title;

    if (Ember.get(ENV, 'googleAnalytics.webPropertyId') != null) {
      Ember.run.schedule('afterRender', function callSendGA() {
        if (Ember.get(ENV, 'googleAnalytics.webPropertyId') != null) {
          var trackerType = Ember.getWithDefault(ENV, 'googleAnalytics.tracker', 'analytics.js');

          if (trackerType === 'analytics.js') {
            var globalVariable = Ember.getWithDefault(ENV, 'googleAnalytics.globalVariable', 'ga');

            _this.beforePageviewToGA(window[globalVariable]);
            window[globalVariable]('set', fieldsObj);
            window[globalVariable]('send', 'pageview');
            // logging
            _this.logTracking('pageview', fieldsObj);
            _this.clearRegistry();
          } else if (trackerType === 'ga.js') {
            window._gaq.push(['_trackPageview']);
          }

        }
      });
    }
  }),
  eventToGA: function(fields) {
    if (Ember.get(ENV, 'googleAnalytics.webPropertyId') != null) {
      var trackerType = Ember.getWithDefault(ENV, 'googleAnalytics.tracker', 'analytics.js');

      if (trackerType === 'analytics.js') {
        this.insertUserMeta();
        if (fields != null) this.setTrackingMeta(fields);
        var fieldsObj = this.get('dimensionRegistry');
        var globalVariable = Ember.getWithDefault(ENV, 'googleAnalytics.globalVariable', 'ga');

        this.beforePageviewToGA(window[globalVariable]);
        window[globalVariable]('set', fieldsObj);
        window[globalVariable]('send', 'event');
        // logging
        this.logTracking('event', fieldsObj);
        this.clearRegistry();
      } else if (trackerType === 'ga.js') {
        // not implemented
        this.logTracking('ga.js call', 'event', fieldsObj);
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
