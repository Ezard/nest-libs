import { Message, Subscription } from '@google-cloud/pubsub';

class Deferred<T> {
  resolve?: (value: T | PromiseLike<T>) => void = undefined;
  reject?: (reason?: unknown) => void = undefined;
  promise = new Promise<T>((a, b) => {
    this.resolve = a;
    this.reject = b;
  });
}

export class GoogleCloudPubSubSubscription implements AsyncIterable<Message> {
  private readonly deferreds: Deferred<IteratorResult<Message>>[] = [];
  private readonly values: Message[] = [];
  private closed = false;

  constructor(private readonly subscription: Subscription) {}

  private listenToSubscriptionMessages(): void {
    this.subscription.setOptions({
      flowControl: {
        maxMessages: 1,
      },
    });
    this.subscription.on('message', (message: Message) => {
      if (!this.closed) {
        const deferred = this.deferreds.shift();
        if (deferred) {
          deferred?.resolve?.({ value: message, done: false });
        } else {
          this.values.push(message);
        }
      }
    });
  }

  async *[Symbol.asyncIterator](): AsyncIterableIterator<Message> {
    this.listenToSubscriptionMessages();

    while (true) {
      const firstValue = this.values.shift();
      if (firstValue) {
        yield firstValue;
      } else if (this.closed) {
        return;
      } else {
        const deferred = new Deferred<IteratorResult<Message>>();
        this.deferreds.push(deferred);
        const { value, done } = await deferred.promise;
        if (done) {
          return;
        } else {
          yield value;
        }
      }
    }
  }

  async close(): Promise<void> {
    this.closed = true;
    await this.subscription.close();
    while (this.deferreds.length > 0) {
      this.deferreds.shift()?.resolve?.({ value: undefined, done: true });
    }
  }

  async delete(): Promise<void> {
    if (!this.closed) {
      await this.close();
    }
    try {
      await this.subscription.delete();
    } catch (err) {
      console.error(err);
    }
  }
}
