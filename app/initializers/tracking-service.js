
import trackingService from '../services/tracking-service';

export function initialize(application) {
  console.log('intiialize tracking', trackingService);
  application.register('tracking-service:main', trackingService);
}

export default {
  name: 'tracking-service',
  initialize
};
