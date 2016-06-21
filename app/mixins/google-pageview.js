import Ember from 'ember';
var computed = Ember.computed;

export default Ember.Mixin.create({
  trackingService: Ember.inject.service('tracking-service'),

  notLoggedIn: computed.reads('trackingService.notLoggedIn'),
  gaInitialized: computed.reads('trackingService.gaInitialized'),
  trackerInitialized: computed.reads('trackingService.trackerInitialized'),

  eventTypes: computed.reads('trackingService.eventTypes'),
  setTrackingUser: function(userObj) {
    this.get('trackingService').setTrackingUser(userObj);
  },
  beforePageviewToGA: function(ga) {

  },
  clearRegistry: function() {
    this.get('trackingService').clearRegistry();
  },
  setTrackingMeta: function(metaObj) {
    this.get('trackingService').setTrackingMeta(metaObj);
  },
  insertUserMeta: function() {
    this.get('trackingService').insertUserMeta;
  },

  pageviewToGA: Ember.on('didTransition', function(page, title) {
    page = page ? page : this.get('url');
    title = title ? title : this.get('url');
    this.get('trackingService').pageviewToGA(page, title);
  }),
  eventToGA: function(fields) {
    this.get('trackingService').eventToGA(fields);
  },
  logTrackingEnabled: computed.reads('trackingService.logTrackingEnabled'),

  logTracking: function() {
    this.get('trackingService').logTracking(arguments);
  }
});
