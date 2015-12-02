import Ember from 'ember';
import ENV from '../config/environment';
var computed = Ember.computed;

export default Ember.Mixin.create({
  trackingService: Ember.inject.service('google-pageview'),
  webPropertyId: Ember.get(ENV, 'googleAnalytics.webPropertyId'),
  dimensionMap: Ember.computed.reads('trackingService.dimensionMap'),
  dimensionRegistry: Ember.computed.reads('trackingService.dimensionRegistry'),
  user: Ember.computed.reads('trackingService.user'), // has to be set by primary app add to install notes
  clientId: Ember.computed.reads('trackingService.clientId'),
  sessionId: Ember.computed.reads('trackingService.sessionId'),
  notLoggedIn: Ember.computed.reads('trackingService.notLoggedIn'),
  gaInitialized: Ember.computed.reads('trackingService.gaInitialized'),
  trackerInitialized: Ember.computed.reads('trackingService.trackerInitialized'),
  uuid: Ember.computed.reads('trackingService.uuid'),
  userCompany: Ember.computed.reads('trackingService.userCompany'),
  userDepartment: Ember.computed.reads('trackingService.userDepartment'),
  userTitle: Ember.computed.reads('trackingService.userTitle'),
  eventTypes: Ember.computed.reads('trackingService.eventTypes'),
  setTrackingUser: this.get('trackingService').setTrackingUser,
  beforePageviewToGA: function(ga) {

  },
  clearRegistry: this.get('trackingService').clearRegistry,
  setTrackingMeta: this.get('trackingService').setTrackingMeta,
  insertUserMeta: this.get('trackingService').insertUserMeta,

  pageviewToGA: Ember.on('didTransition', function(page, title) {
    var _this = this;
    this.insertUserMeta();

    var fieldsObj = this.get('dimensionRegistry');
    fieldsObj.page = page ? page : this.get('url');
    fieldsObj.title = fieldsObj.title || title ? title : this.get('url');

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
  logTrackingEnabled: this.get('trackingService').logTrackingEnabled,

  logTracking: this.get('trackingService').logTracking
});
