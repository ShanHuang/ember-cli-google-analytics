import Ember from 'ember';

const { computed, inject } = Ember;

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

  didTransition(page, title) {
    this._super(...arguments);

    page = page ? page : this.get('url');
    title = title ? title : this.get('url');

    this.get('trackingService').pageviewToGA(page, title);
  },

  eventToGA(fields) {
    this.get('trackingService').eventToGA(fields);
  },

  logTracking() {
    this.get('trackingService').logTracking(...arguments);
  }
});
