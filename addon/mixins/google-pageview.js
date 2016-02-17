import Ember from 'ember';

const { computed, inject, on } = Ember;

export default Ember.Mixin.create({
  trackingService: inject.service('tracking-service'),

  notLoggedIn: computed.reads('trackingService.notLoggedIn'),
  gaInitialized: computed.reads('trackingService.gaInitialized'),
  trackerInitialized: computed.reads('trackingService.trackerInitialized'),

  eventTypes: computed.reads('trackingService.eventTypes'),

  setTrackingUser(userObj) {
    this.get('trackingService').setTrackingUser(userObj);
  },

  beforePageviewToGA(/* ga */) {

  },

  clearRegistry() {
    this.get('trackingService').clearRegistry();
  },

  setTrackingMeta() {
    this.get('trackingService').setTrackingMeta(...arguments);
  },

  insertUserMeta() {
    this.get('trackingService').insertUserMeta(...arguments);
  },

  pageviewToGA: on('didTransition', function pageviewToGA() {
    this.get('trackingService').pageviewToGA(this.get('url'));
  }),

  eventToGA(fields) {
    this.get('trackingService').eventToGA(fields);
  },

  logTracking() {
    this.get('trackingService').logTracking(...arguments);
  }
});
