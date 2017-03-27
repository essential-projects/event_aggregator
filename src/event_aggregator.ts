import {EventEmitter} from 'events';
import {IEventAggregator} from '@process-engine-js/event_aggregator_contracts';

export class EventAggregator extends EventEmitter implements IEventAggregator {
  constructor() {
    super();
  }
}