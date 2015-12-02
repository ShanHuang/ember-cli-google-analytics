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
    this.trackingService.setTrackingUser(userObj);
  },
  beforePageviewToGA: function(ga) {

  },
  clearRegistry: function() {
    this.trackingService.clearRegistry();
  },
  setTrackingMeta: function(metaObj) {
    this.trackingService.setTrackingMeta(metaObj);
  },
  insertUserMeta: function() {
    this.trackingService.insertUserMeta;
  },

  pageviewToGA: Ember.on('didTransition', function(page, title) {
    page = page ? page : this.get('url');
    title = fieldsObj.title || title ? title : this.get('url');
    this.trackingService.pageviewToGA(page, title);
  }),
  eventToGA: function(fields) {
    this.trackingService.eventToGA(fields);
  },
  logTrackingEnabled: Ember.computed.reads('trackingService.logTrackingEnabled'),

  logTracking: function() {
    this.trackingService.logTracking(arguments);
  }
});
