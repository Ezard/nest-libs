import { Message, PubSub, SubscriberOptions, Subscription } from '@google-cloud/pubsub';
import { Subscriber } from '@google-cloud/pubsub/build/src/subscriber';
import { PubSubSubscription } from './pubsub-subscription';

jest.mock('@google-cloud/pubsub');

function createMessage(data: string): Message {
  const message = new Message({} as Subscriber, {
    message: {
      data: Buffer.from(data, 'utf8').toString('base64'),
    },
  });
  jest.spyOn(message, 'ack').mockImplementation();
  return message;
}

function sleep(millis: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, millis));
}

describe('PubSubSubscription', () => {
  describe('asyncIterator', () => {
    let callback: (message: Message) => void;
    let pubSubSubscription: PubSubSubscription;

    beforeEach(() => {
      const subscription = {
        on: (_: string, cb: (message: Message) => void) => {
          callback = cb;
        },
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        setOptions(_: SubscriberOptions): void {
          // unused
        },
        async close(): Promise<void> {
          // unused
        },
      } as Subscription;
      pubSubSubscription = new PubSubSubscription(subscription);
    });

    it('should return a message when the subscription receives it', async () => {
      const message = createMessage('foo');
      setTimeout(() => callback(message), 50);
      setTimeout(() => pubSubSubscription.close(), 100);

      let result: Message | undefined;
      for await (const m of pubSubSubscription) {
        result = m;
      }

      expect(result).toStrictEqual(message);
    });

    it('should return multiple messages in order as the subscription receives them', async () => {
      const messages = [createMessage('foo'), createMessage('bar'), createMessage("baz'"), createMessage('foobar')];
      setTimeout(() => {
        for (const message of messages) {
          callback(message);
        }
      }, 50);
      setTimeout(() => pubSubSubscription.close(), 100);

      const results: Message[] = [];
      for await (const message of pubSubSubscription) {
        results.push(message);
      }

      expect(results).toStrictEqual(messages);
    });

    it('should ignore messages received after the subscription is closed', async () => {
      const message1 = createMessage('foo');
      const message2 = createMessage('bar');
      setTimeout(() => callback(message1), 50);
      setTimeout(() => callback(message2), 125);
      setTimeout(() => pubSubSubscription.close(), 100);

      const results: Message[] = [];
      for await (const message of pubSubSubscription) {
        results.push(message);
        await sleep(100);
      }

      expect(results).toStrictEqual([message1]);
    });
  });

  describe('delete', () => {
    let subscription: Subscription;
    let pubSubSubscription: PubSubSubscription;

    beforeEach(() => {
      subscription = new Subscription({} as PubSub, 'foo');
      pubSubSubscription = new PubSubSubscription(subscription);
    });

    it("should close the subscription if it's not already closed", async () => {
      const closeSpy = jest.spyOn(pubSubSubscription, 'close');

      await pubSubSubscription.delete();

      expect(closeSpy).toHaveBeenCalled();
    });

    it("should not close the subscription if it's already closed", async () => {
      const closeSpy = jest.spyOn(pubSubSubscription, 'close');

      await pubSubSubscription.close();
      await pubSubSubscription.delete();

      expect(closeSpy).toHaveBeenCalledTimes(1);
    });

    it('should delete the subscription', async () => {
      const deleteSpy = jest.spyOn(subscription, 'delete');

      await pubSubSubscription.delete();

      expect(deleteSpy).toHaveBeenCalled();
    });

    it('should log an error if the subscription failed to close', async () => {
      jest.spyOn(subscription, 'delete').mockRejectedValue(null as never);
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      await pubSubSubscription.delete();

      expect(consoleErrorSpy).toHaveBeenCalled();
    });
  });
});
