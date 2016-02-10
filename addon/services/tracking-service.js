import Ember from 'ember';
import ENV from 'ember-get-config';

const { computed, get, isNone } = Ember;
const DEFAULT_GLOBAL_VARIABLE = 'ga';

export default Ember.Object.extend({
  eventActionsTypes: ['map_chart_interact', 'save_query', 'download', 'other_button'],
  dimensionMap: {
    company: 'dimension1',
    department: 'dimension2',
    title: 'dimension3',
    uuid: 'dimension4',
    // reserving 4 to  9 for additional user dimensions
    hitType: 'dimension5', // 'search'|'filter'|'nav'|'detail'
    searchCriteriaJson: 'dimension6', // a json.stringify of all search criteria for tableau use
    searchText: 'dimension7',

    // will make this data availalble to the api - not implemented yet
    // hitTimestamp: 'dimension17',
    // sessionId: 'dimension18',
    // clientId:  'dimension19',

    // for pageview calls
    page: 'page',
    pageTitle: 'title',
    // allows event data to be configured
    eventCategory: 'eventCategory',
    eventAction: 'eventAction',
    eventLabel: 'eventLabel',
    eventValue: 'eventValue'
  },
  dimensionRegistry: {},

  webPropertyId: get(ENV, 'googleAnalytics.webPropertyId'),

  user: null, // has to be set by primary app add to install notes
  clientId: null,
  sessionId: null,

  notLoggedIn: computed.empty('user'),
  gaInitialized: false,
  trackerInitialized: false,
  earlyPageview: false,

  init() {
    this._super(...arguments);
    this._injectTracker();
  },

  _injectTracker() {
    let globalVariable = get(ENV, 'googleAnalytics.globalVariable') || DEFAULT_GLOBAL_VARIABLE;

    this.logTracking('gaInit',  globalVariable, 'did gaInit already run', this.get('gaInitialized'));

    if (!this.get('gaInitialized')) {
      window.GoogleAnalyticsObject = globalVariable;
      window[globalVariable] = window[globalVariable] || function() {
        (window[globalVariable].q = window[globalVariable].q || []).push(arguments);
      };
      window[globalVariable].l = 1 * new Date();

      let script = document.createElement('script');
      let [firstScript] = document.getElementsByTagName('script');

      script.async = true;
      script.src = '//www.google-analytics.com/analytics.js';

      firstScript.parentNode.insertBefore(script, firstScript);

      this.set('gaInitialized', true);
    }
  },

  uuid: computed('user.uuid', function uuid() {
    let userUuid = this.get('user.uuid');

    this.logTracking('detected user change', userUuid);
    return userUuid || null;
  }).readOnly(),

  userCompany: computed('user.companyName', function userCompany() {
    return this.get('user.companyName') || null;
  }).readOnly(),

  userDepartment: computed('user.department', function userDepartment() {
    return this.get('user.department') || null;
  }).readOnly(),

  userTitle: computed('user.title', function userTitle() {
    return this.get('user.title') || null;
  }),

  setTrackingUser(userObj) {
    if (userObj.id !== this.get('user.id')) {
      this.logTracking('setTrackingUser', userObj);
      this.set('user', userObj);
      this.prepare();
    }
  },

  beforePageviewToGA(/* ga */) {

  },

  clearRegistry() {
    this.set('dimensionRegistry', {});
  },

  setTrackingMeta(metaObj) {
    let dMap = this.get('dimensionMap');
    let dReg = this.get('dimensionRegistry');
    for (let property in metaObj) {
      if (metaObj.hasOwnProperty(property) && dMap[property] && !isNone(metaObj[property])) {
        dReg[dMap[property]] = metaObj[property];
      }
    }
    this.logTracking('setTrackingMeta', metaObj, dReg);
  },

  insertUserMeta() {
    this.setTrackingMeta({
      company: this.get('userCompany'),
      department: this.get('userDepartment'),
      title: this.get('userTitle'),
      uuid: this.get('uuid')
    });
  },

  analyticsTrackingCode() {
    let gaConfig = {};
    let globalVariable = get(ENV, 'googleAnalytics.globalVariable') || DEFAULT_GLOBAL_VARIABLE;
    let cookieDomain = get(ENV, 'googleAnalytics.cookieDomain');
    let cookieName = get(ENV, 'googleAnalytics.cookieName');
    let cookieExpires = get(ENV, 'googleAnalytics.cookieExpires');
    let webPropertyId = get(ENV, 'googleAnalytics.webPropertyId');
    let displayFeatures = get(ENV, 'googleAnalytics.displayFeatures');

    if (!isNone(this.get('uuid'))) {
      gaConfig.userId = this.get('uuid');
    } else {
      if (!isNone(cookieDomain)) {
        gaConfig.cookieDomain = cookieDomain;
      }
      if (!isNone(cookieName)) {
        gaConfig.cookieName = cookieName;
      }
      if (!isNone(cookieExpires)) {
        gaConfig.cookieExpires = cookieExpires;
      }

      if (Object.keys(gaConfig).length === 0) {
        gaConfig = '"auto"';
      } else {
        gaConfig = JSON.stringify(gaConfig);
      }
    }

    this.logTracking('analyticsTrackingCode', gaConfig, globalVariable, webPropertyId);

    // moved intialization code
    if (ENV.environment !== 'test') {
      window[globalVariable]('create', webPropertyId, gaConfig);

      if (displayFeatures) {
        window[globalVariable]('require', 'displayfeatures');
      }
    }

    this.set('trackerInitialized', true);
  },

  prepare() {
    let webPropertyId = get(ENV, 'googleAnalytics.webPropertyId');

    this.logTracking('prepare', webPropertyId, this.get('user'));

    if (isNone(webPropertyId)) {
      return;
    }

    this.analyticsTrackingCode();

    if (this.get('earlyPageview')) {
      this.set('earlyPageview', false);
      this.pageviewToGA();
    }
  },

  pageviewToGA(url) {
    let fieldsObj = this.get('dimensionRegistry');
    fieldsObj.page = fieldsObj.page || url;
    fieldsObj.title = fieldsObj.title || url;

    if (!this.get('trackerInitialized')) {
      this.set('earlyPageview', true);
      this.logTracking('pageview earlycall', fieldsObj, url);
      return;
    }

    this.insertUserMeta();

    let webPropertyId = get(ENV, 'googleAnalytics.webPropertyId');
    if (isNone(webPropertyId)) {
      return;
    }
    this.logTracking('pageview pre schedule', fieldsObj, url);
    Ember.run.schedule('afterRender', this, function callSendGA() {
      let webPropertyId = get(ENV, 'googleAnalytics.webPropertyId');
      if (isNone(webPropertyId)) {
        return;
      }

      let globalVariable = get(ENV, 'googleAnalytics.globalVariable') || DEFAULT_GLOBAL_VARIABLE;

      this.beforePageviewToGA(window[globalVariable]);
      this.logTracking('pageview before gacall', fieldsObj, ENV.environment);
      
      if (ENV.environment !== 'test') {
        window[globalVariable]('set', fieldsObj);
        window[globalVariable]('send', 'pageview');
      }

      // logging
      this.logTracking('pageview', fieldsObj);
      this.clearRegistry();
    });
  },

  eventToGA(fields) {
    if (isNone(get(ENV, 'googleAnalytics.webPropertyId'))) {
      return;
    }

    this.insertUserMeta();

    if (!isNone(fields)) {
      this.setTrackingMeta(fields);
    }

    let fieldsObj = this.get('dimensionRegistry');
    let globalVariable = get(ENV, 'googleAnalytics.globalVariable') || DEFAULT_GLOBAL_VARIABLE;

    this.beforePageviewToGA(window[globalVariable]);

    if (ENV.environment !== 'test') {
      window[globalVariable]('set', fieldsObj);
      window[globalVariable]('send', 'event');
    }

    this.logTracking('event', fieldsObj);
    this.clearRegistry();
  },

  logTrackingEnabled() {
    return get(ENV, 'googleAnalytics.logTracking') || false;
  },

  logTracking() {
    if (this.logTrackingEnabled()) {
      Ember.Logger.debug('Tracking Google Analytics event: %O', arguments);
    }
  }
});
