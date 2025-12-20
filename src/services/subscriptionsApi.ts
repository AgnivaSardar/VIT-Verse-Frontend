import api from './api';

export interface Subscription {
  userID: number;
  channelID: number;
}

export const subscriptionsApi = {
  subscribe: (subscription: Subscription) => api.post('subscriptions', subscription),
  unsubscribe: (_subscription: Subscription) => api.delete('subscriptions'),
};
