import { describe, expect, it, vi } from 'vitest';
import {
  createApplicationEvent,
  publishApplicationEvent,
  subscribeToApplicationEvents,
} from '../../src/main/application/events/event-bus';

describe('application event bus', () => {
  it('publishes events to active subscribers only', () => {
    const subscriber = vi.fn();
    const unsubscribe = subscribeToApplicationEvents(subscriber);
    const event = createApplicationEvent({
      type: 'workspace.profile.deleted',
      payload: { profileId: 'profile-1' },
    });

    publishApplicationEvent(event);
    unsubscribe();
    publishApplicationEvent(event);

    expect(subscriber).toHaveBeenCalledTimes(1);
    expect(subscriber).toHaveBeenCalledWith(event);
  });

  it('stamps context-owned event contracts with an occurrence time', () => {
    const event = createApplicationEvent({
      type: 'asset-library.assets.deleted',
      payload: {
        profileId: 'profile-1',
        bucket: 'assets',
        keys: ['photos/a.png'],
        deletedCount: 1,
      },
    });

    expect(event.occurredAt).toEqual(expect.any(String));
    expect(event.payload.keys).toEqual(['photos/a.png']);
  });
});
