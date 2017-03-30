import {EventEmitter} from 'events';
import {IEventAggregator, ISubscription} from '@process-engine-js/event_aggregator_contracts';
import * as debug from 'debug';

const debugError = debug('event_aggregator:error');

export class EventAggregator {

  private eventLookup = {};
  private messageHandlers = [];

  public publish(event: string | any, data?: any): void {
    let subscribers;
    let i;

    if (!event) {
      throw new Error('event was invalid.');
    }

    if (typeof event === 'string') {
      subscribers = this.eventLookup[event];
      if (subscribers) {
        subscribers = subscribers.slice();
        i = subscribers.length;

        while (i--) {
          invokeCallback(subscribers[i], data, event);
        }
      }
    } else {
      subscribers = this.messageHandlers.slice();
      i = subscribers.length;

      while (i--) {
        invokeHandler(subscribers[i], event);
      }
    }
  }

  public subscribe(event: string | Function, callback: Function): ISubscription {
    let handler;
    let subscribers;

    if (!event) {
      throw new Error('Event channel/type was invalid.');
    }

    if (typeof event === 'string') {
      handler = callback;
      subscribers = this.eventLookup[event] || (this.eventLookup[event] = []);
    } else {
      handler = new Handler(event, callback);
      subscribers = this.messageHandlers;
    }

    subscribers.push(handler);

    return {
      dispose() {
        let index = subscribers.indexOf(handler);
        if (index !== -1) {
          subscribers.splice(index, 1);
        }
      }
    };
  }

  public subscribeOnce(event: string | Function, callback: Function): ISubscription {
    
    const subscription = this.subscribe(event, (a, b) => {
      subscription.dispose();
      return callback(a, b);
    });

    return subscription;
  }
}

function invokeCallback(callback, data, event) {
  try {
    callback(data, event);
  } catch (e) {
    debugError(e);
  }
}

function invokeHandler(handler, data) {
  try {
    handler.handle(data);
  } catch (e) {
    debugError(e);
  }
}

class Handler {

  private messageType;
  private callback;

  constructor(messageType, callback) {
    this.messageType = messageType;
    this.callback = callback;
  }

  handle(message) {
    if (message instanceof this.messageType) {
      this.callback.call(null, message);
    }
  }
}