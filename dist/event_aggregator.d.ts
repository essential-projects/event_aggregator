import { ISubscription } from '@process-engine-js/event_aggregator_contracts';
export declare class EventAggregator {
    private eventLookup;
    private messageHandlers;
    publish(event: string | any, data?: any): void;
    subscribe(event: string | Function, callback: Function): ISubscription;
    subscribeOnce(event: string | Function, callback: Function): ISubscription;
}
