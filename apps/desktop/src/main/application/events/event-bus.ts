import type {
  ApplicationEvent,
  ApplicationEventHandler,
} from './event-types';

export type {
  ApplicationEvent,
  ApplicationEventHandler,
} from './event-types';

const subscribers = new Set<ApplicationEventHandler>();

export const publishApplicationEvent = (event: ApplicationEvent): void => {
  for (const subscriber of subscribers) {
    subscriber(event);
  }
};

export const subscribeToApplicationEvents = (
  subscriber: ApplicationEventHandler,
): (() => void) => {
  subscribers.add(subscriber);
  return () => {
    subscribers.delete(subscriber);
  };
};

export const createApplicationEvent = <TEvent extends ApplicationEvent>(
  event: Omit<TEvent, 'occurredAt'>,
): TEvent => ({
  ...event,
  occurredAt: new Date().toISOString(),
} as TEvent);
