import {Logger} from 'loggerhythm';
import * as uuid from 'node-uuid';

import {BadRequestError} from '@essential-projects/errors_ts';
import {EventReceivedCallback, IEventAggregator, Subscription} from '@essential-projects/event_aggregator_contracts';

import {EventSubscriptionDictionary, IInternalSubscription, SubscriberCollection} from './internal_types';

const logger: Logger = Logger.createLogger('essential-projects:event_aggregator');

export class EventAggregator implements IEventAggregator {

  private eventSubscriptionDictionary: EventSubscriptionDictionary = {};

  public subscribe(eventName: string, callback: EventReceivedCallback): Subscription {
    return this._createSubscription(eventName, callback, false);
  }

  public subscribeOnce(eventName: string, callback: EventReceivedCallback): Subscription {
    return this._createSubscription(eventName, callback, true);
  }

  public publish(eventName: string, payload?: any): void {

    const noSubscribersForEventExist: boolean =
      !this.eventSubscriptionDictionary[eventName] ||
      Object.keys(this.eventSubscriptionDictionary[eventName]).length === 0;
    if (noSubscribersForEventExist) {
      return;
    }

    const eventSubscriptions: SubscriberCollection = this.eventSubscriptionDictionary[eventName];

    const subscriptionIds: Array<string> = Object.keys(eventSubscriptions);

    for (const subscribtionId of subscriptionIds) {
      const subscription: IInternalSubscription = eventSubscriptions[subscribtionId];
      invokeEventCallback(eventName, payload, subscription.callback);

      if (subscription.subscribeOnce) {
        delete this.eventSubscriptionDictionary[eventName][subscribtionId];
      }
    }
  }

  public unsubscribe(subscription: Subscription): void {
    delete this.eventSubscriptionDictionary[subscription.eventName][subscription.id];
  }

  private _createSubscription(event: string, callback: EventReceivedCallback, subscribeOnce: boolean): Subscription {

    if (!event) {
      throw new BadRequestError('No event name provided for the subscription!');
    }

    if (!callback) {
      throw new BadRequestError('No callback function provided for the subscription!');
    }

    const subscriptionId: string = uuid.v4();
    const newSubscription: Subscription = new Subscription(subscriptionId, event, subscribeOnce);

    const eventIsNotYetRegistered: boolean = !this.eventSubscriptionDictionary[event];
    if (eventIsNotYetRegistered) {
      this.eventSubscriptionDictionary[event] = {};
    }

    this.eventSubscriptionDictionary[event][subscriptionId] = <IInternalSubscription> {
      subscribeOnce: subscribeOnce,
      callback: callback,
    };

    return newSubscription;
  }
}

/**
 * Triggers the given callback directly with the next process tick.
 * This makes event publishing as instantaneously as it can be with NodeJs.
 *
 * @param eventName    The event name.
 * @param eventPayload The event payload.
 * @param callback     The function to trigger.
 */
function invokeEventCallback(eventName: string, eventPayload: any, callback: Function): void {
  process.nextTick(() => {
    try {
      callback(eventPayload, eventName);
    } catch (e) {
      logger.error(e);
    }
  });
}
