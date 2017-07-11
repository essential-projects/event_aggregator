import { ExecutionContext, IEntity } from '@process-engine-js/core_contracts';
import { IEventAggregator, ISubscription, IEntityEvent } from '@process-engine-js/event_aggregator_contracts';
export declare class EventAggregator implements IEventAggregator {
    private eventLookup;
    private messageHandlers;
    publish(event: string | any, data?: any): void;
    subscribe(event: string | Function, callback: Function): ISubscription;
    subscribeOnce(event: string | Function, callback: Function): ISubscription;
    createEntityEvent(data: any, source: IEntity, context: ExecutionContext, metadataOptions?: {
        [key: string]: any;
    }): IEntityEvent;
    private _createEventMetadata(context, metadataOptions?);
}
