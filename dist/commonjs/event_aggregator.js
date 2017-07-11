"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const debug = require("debug");
const uuid = require("uuid");
const debugError = debug('event_aggregator:error');
class EventAggregator {
    constructor() {
        this.eventLookup = {};
        this.messageHandlers = [];
    }
    publish(event, data) {
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
        }
        else {
            subscribers = this.messageHandlers.slice();
            i = subscribers.length;
            while (i--) {
                invokeHandler(subscribers[i], event);
            }
        }
    }
    subscribe(event, callback) {
        let handler;
        let subscribers;
        if (!event) {
            throw new Error('Event channel/type was invalid.');
        }
        if (typeof event === 'string') {
            handler = callback;
            subscribers = this.eventLookup[event] || (this.eventLookup[event] = []);
        }
        else {
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
    subscribeOnce(event, callback) {
        const subscription = this.subscribe(event, (a, b) => {
            subscription.dispose();
            return callback(a, b);
        });
        return subscription;
    }
    createEntityEvent(data, source, context, metadataOptions) {
        const metadata = this._createEventMetadata(context, metadataOptions);
        const message = {
            metadata: metadata,
            data: data,
            source: source
        };
        return message;
    }
    _createEventMetadata(context, metadataOptions) {
        const metadata = {
            id: uuid.v4(),
            context: context,
            options: metadataOptions
        };
        return metadata;
    }
}
exports.EventAggregator = EventAggregator;
function invokeCallback(callback, data, event) {
    process.nextTick(() => {
        try {
            callback(data, event);
        }
        catch (e) {
            debugError(e);
        }
    });
}
function invokeHandler(handler, data) {
    process.nextTick(() => {
        try {
            handler.handle(data);
        }
        catch (e) {
            debugError(e);
        }
    });
}
class Handler {
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

//# sourceMappingURL=event_aggregator.js.map
