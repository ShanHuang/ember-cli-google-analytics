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
    trackingService.setTrackingUser(userObj);
  },
  beforePageviewToGA: function(ga) {

  },
  clearRegistry: function() {
    trackingService.clearRegistry();
  },
  setTrackingMeta: function(metaObj) {
    trackingService.setTrackingMeta(metaObj);
  },
  insertUserMeta: function() {
    trackingService.insertUserMeta;
  },

  pageviewToGA: Ember.on('didTransition', function(page, title) {
    trackingService.pageviewToGA(page, title);
  }),
  eventToGA: function(fields) {
    trackingService.eventToGA(fields);
  },
  logTrackingEnabled: Ember.computed.reads('trackingService.logTrackingEnabled'),

  logTracking: function() {
    trackingService.logTracking(arguments);
  }
});
