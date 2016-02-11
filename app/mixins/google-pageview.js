import Ember from 'ember';
import ENV from '../config/environment';
var computed = Ember.computed;

export default Ember.Mixin.create({
  trackingService: Ember.inject.service('tracking-service'),

  notLoggedIn: Ember.computed.reads('trackingService.notLoggedIn'),
  gaInitialized: Ember.computed.reads('trackingService.gaInitialized'),
  trackerInitialized: Ember.computed.reads('trackingService.trackerInitialized'),

  eventTypes: Ember.computed.reads('trackingService.eventTypes'),
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
    this._super(...arguments);
    this.get('trackingService').pageviewToGA(this.get('url'));
  }),
  eventToGA: function(fields) {
    this.get('trackingService').eventToGA(fields);
  },
  logTrackingEnabled: Ember.computed.reads('trackingService.logTrackingEnabled'),

  logTracking: function() {
    this.get('trackingService').logTracking(arguments);
  }
});
