import Ember from 'ember';
import ENV from '../config/environment';
var computed = Ember.computed;

export default Ember.Mixin.create({
  trackingService: Ember.inject.service('tracking-service'),

  notLoggedIn: Ember.computed.reads('trackingService.notLoggedIn'),
  gaInitialized: Ember.computed.reads('trackingService.gaInitialized'),
  trackerInitialized: Ember.computed.reads('trackingService.trackerInitialized'),

  eventTypes: Ember.computed.reads('trackingService.eventTypes'),
  setTrackingUser: trackingService.setTrackingUser,
  beforePageviewToGA: function(ga) {

  },
  clearRegistry: trackingService.clearRegistry,
  setTrackingMeta: trackingService.setTrackingMeta,
  insertUserMeta: trackingService.insertUserMeta,

  pageviewToGA: Ember.on('didTransition', trackingService.pageviewToGA),
  eventToGA: trackingService.eventToGA,
  logTrackingEnabled: trackingService.logTrackingEnabled,

  logTracking: trackingService.logTracking
});
