import { PubSub, Subscription, Topic } from '@google-cloud/pubsub';
import { Test, TestingModule } from '@nestjs/testing';
import { hostname } from 'os';
import { GoogleCloudPubSubSubscription } from './google-cloud-pubsub-subscription';
import { GoogleCloudPubSubModule } from './google-cloud-pubsub.module';
import { GoogleCloudPubsubService } from './google-cloud-pubsub.service';

jest.mock('@google-cloud/pubsub');
jest.mock('./google-cloud-pubsub-subscription');

describe('GoogleCloudPubSubService', () => {
  let pubSub: PubSub;
  let pubSubService: GoogleCloudPubsubService;

  beforeEach(async () => {
    pubSub = new PubSub();
    const module: TestingModule = await Test.createTestingModule({
      imports: [GoogleCloudPubSubModule],
    })
      .overrideProvider(PubSub)
      .useValue(pubSub)
      .compile();
    pubSubService = module.get(GoogleCloudPubsubService);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  function createMockTopic(name: string): Topic {
    const topic = new Topic(pubSub, name);
    topic.name = name;
    return topic;
  }

  function createMockSubscription(name: string): Subscription {
    const subscription = new Subscription(pubSub, name);
    subscription.name = name;
    return subscription;
  }

  describe('beforeApplicationShutdown', () => {
    it('should delete all non-shared subscriptions', async () => {
      const topic = createMockTopic('foo/bar/baz');
      jest.spyOn(pubSub, 'getTopics').mockImplementation(() => Promise.resolve([[topic]]));
      jest
        .spyOn(topic, 'getSubscriptions')
        .mockImplementation(() =>
          Promise.resolve([
            [
              createMockSubscription('1-shared'),
              createMockSubscription(`2-${hostname()}`),
              createMockSubscription('3-shared'),
              createMockSubscription(`4-${hostname()}`),
            ],
          ]),
        );
      const pubSubSubscription1 = await pubSubService.observeSubscription(topic.name, '1', true);
      const pubSubSubscription2 = await pubSubService.observeSubscription(topic.name, '2', false);
      const pubSubSubscription3 = await pubSubService.observeSubscription(topic.name, '3', true);
      const pubSubSubscription4 = await pubSubService.observeSubscription(topic.name, '4', false);

      await pubSubService.beforeApplicationShutdown();

      expect(pubSubSubscription1.delete).not.toHaveBeenCalled();
      expect(pubSubSubscription2.delete).toHaveBeenCalled();
      expect(pubSubSubscription3.delete).not.toHaveBeenCalled();
      expect(pubSubSubscription4.delete).toHaveBeenCalled();
    });

    it('should close PubSub', async () => {
      await pubSubService.beforeApplicationShutdown();

      expect(pubSub.close).toHaveBeenCalled();
    });
  });

  describe('getTopic', () => {
    it('should return the topic with the corresponding name if one exists', async () => {
      const topic = createMockTopic('foo/bar/baz');
      jest.spyOn(pubSub, 'getTopics').mockImplementation(() => Promise.resolve([[topic]]));

      const result = await pubSubService.getTopic('baz');

      expect(result).toBe(topic);
    });

    it('should return undefined when no topic with the corresponding name exists', async () => {
      const topic = createMockTopic('foo/bar/baz');
      jest.spyOn(pubSub, 'getTopics').mockImplementation(() => Promise.resolve([[topic]]));

      const result = await pubSubService.getTopic('test');

      expect(result).toBeUndefined();
    });
  });

  describe('createTopic', () => {
    it('should create and return the topic', async () => {
      const name = 'foo/bar/baz';
      const topic = createMockTopic(name);
      const createTopic = jest.spyOn(pubSub, 'createTopic').mockImplementation(() => Promise.resolve([topic]));

      const result = await pubSubService.createTopic(name);

      expect(createTopic).toHaveBeenCalledWith(name);
      expect(result).toBe(topic);
    });
  });

  describe('getOrCreateTopic', () => {
    it('should return the existing topic if one exists', async () => {
      const topic = createMockTopic('foo/bar/baz');
      jest.spyOn(pubSub, 'getTopics').mockImplementation(() => Promise.resolve([[topic]]));

      const result = await pubSubService.getOrCreateTopic('baz');

      expect(result).toBe(topic);
      expect(pubSub.createTopic).not.toHaveBeenCalled();
    });

    it('should create a new topic if an existing one does not exist', async () => {
      const name = 'test';
      const topic1 = createMockTopic('foo/bar/baz');
      const topic2 = createMockTopic(name);
      jest.spyOn(pubSub, 'getTopics').mockImplementation(() => Promise.resolve([[topic1]]));
      const createTopic = jest.spyOn(pubSub, 'createTopic').mockImplementation(() => Promise.resolve([topic2]));

      const result = await pubSubService.getOrCreateTopic(name);

      expect(createTopic).toHaveBeenCalledWith(name);
      expect(result).toBe(topic2);
    });
  });

  describe('getSubscription', () => {
    let topic: Topic;

    beforeEach(() => {
      topic = new Topic(pubSub, 'test');
    });

    it('should return the existing shared subscription if one exists', async () => {
      const subscription = createMockSubscription('foo/bar/baz-shared');
      jest.spyOn(topic, 'getSubscriptions').mockImplementation(() => Promise.resolve([[subscription]]));

      const result = await pubSubService.getSubscription(topic, 'baz', true);

      expect(result).toBe(subscription);
    });

    it('should return the existing non-shared subscription if one exists', async () => {
      const subscription = createMockSubscription(`foo/bar/baz-${hostname()}`);
      jest.spyOn(topic, 'getSubscriptions').mockImplementation(() => Promise.resolve([[subscription]]));

      const result = await pubSubService.getSubscription(topic, 'baz', false);

      expect(result).toBe(subscription);
    });

    it('should return undefined when no shared subscription with the corresponding name exists', async () => {
      const subscription = createMockSubscription('foo/bar/baz-shared');
      jest.spyOn(topic, 'getSubscriptions').mockImplementation(() => Promise.resolve([[subscription]]));

      const result = await pubSubService.getSubscription(topic, 'test', true);

      expect(result).toBeUndefined();
    });

    it('should return undefined when no non-shared subscription with the corresponding name exists', async () => {
      const subscription = createMockSubscription(`foo/bar/baz-${hostname()}`);
      jest.spyOn(topic, 'getSubscriptions').mockImplementation(() => Promise.resolve([[subscription]]));

      const result = await pubSubService.getSubscription(topic, 'test', false);

      expect(result).toBeUndefined();
    });
  });

  describe('createSubscription', () => {
    let topic: Topic;

    beforeEach(() => {
      topic = new Topic(pubSub, 'test');
    });

    it('should create and return a shared subscription', async () => {
      const subscription = createMockSubscription('foo-shared');
      const createSubscription = jest
        .spyOn(topic, 'createSubscription')
        .mockImplementation(() => Promise.resolve([subscription]));

      const result = await pubSubService.createSubscription(topic, 'foo', true);

      expect(createSubscription).toHaveBeenCalledWith('foo-shared');
      expect(result).toBe(subscription);
    });

    it('should create and return a non-shared subscription', async () => {
      const subscription = createMockSubscription(`foo-${hostname()}`);
      const createSubscription = jest
        .spyOn(topic, 'createSubscription')
        .mockImplementation(() => Promise.resolve([subscription]));

      const result = await pubSubService.createSubscription(topic, 'foo', false);

      expect(createSubscription).toHaveBeenCalledWith(`foo-${hostname()}`);
      expect(result).toBe(subscription);
    });
  });

  describe('getOrCreateSubscription', () => {
    let topic: Topic;

    beforeEach(() => {
      topic = new Topic(pubSub, 'test');
    });

    it('should return the existing shared subscription if one exists', async () => {
      const subscription = createMockSubscription('foo-shared');
      jest.spyOn(topic, 'getSubscriptions').mockImplementation(() => Promise.resolve([[subscription]]));

      const result = await pubSubService.getOrCreateSubscription(topic, 'foo', true);

      expect(result).toBe(subscription);
    });

    it('should return the existing non-shared subscription if one exists', async () => {
      const subscription = createMockSubscription(`foo-${hostname()}`);
      jest.spyOn(topic, 'getSubscriptions').mockImplementation(() => Promise.resolve([[subscription]]));

      const result = await pubSubService.getOrCreateSubscription(topic, 'foo', false);

      expect(result).toBe(subscription);
    });

    it('should create a new shared subscription if an existing one does not exist', async () => {
      const name = 'foo';
      const subscription1 = createMockSubscription('foo/bar/baz');
      const subscription2 = createMockSubscription(name);
      jest.spyOn(topic, 'getSubscriptions').mockImplementation(() => Promise.resolve([[subscription1]]));
      const createSubscription = jest
        .spyOn(topic, 'createSubscription')
        .mockImplementation(() => Promise.resolve([subscription2]));

      const result = await pubSubService.getOrCreateSubscription(topic, name, true);

      expect(createSubscription).toHaveBeenCalledWith('foo-shared');
      expect(result).toBe(subscription2);
    });

    it('should create a new non-shared subscription if an existing one does not exist', async () => {
      const name = 'bar';
      const subscription1 = createMockSubscription('foo/bar/baz');
      const subscription2 = createMockSubscription(name);
      jest.spyOn(topic, 'getSubscriptions').mockImplementation(() => Promise.resolve([[subscription1]]));
      const createSubscription = jest
        .spyOn(topic, 'createSubscription')
        .mockImplementation(() => Promise.resolve([subscription2]));

      const result = await pubSubService.getOrCreateSubscription(topic, name, false);

      expect(createSubscription).toHaveBeenCalledWith(`bar-${hostname()}`);
      expect(result).toBe(subscription2);
    });

    it('should default to using a non-shared subscription', async () => {
      const subscriptionName = `foo-${hostname()}`;
      jest.spyOn(topic, 'getSubscriptions').mockResolvedValue([[createMockSubscription(subscriptionName)]]);

      const subscription = await pubSubService.getOrCreateSubscription(topic, 'foo');

      expect(subscription.name).toEqual(subscriptionName);
    });
  });

  describe('observeSubscription', () => {
    it('should use an existing topic if one exists', async () => {
      const topic = createMockTopic('foo/bar/baz');
      jest.spyOn(pubSub, 'getTopics').mockImplementation(() => Promise.resolve([[topic]]));
      const subscription = createMockSubscription('foo-shared');
      jest.spyOn(topic, 'getSubscriptions').mockImplementation(() => Promise.resolve([[subscription]]));

      await pubSubService.observeSubscription('baz', 'foo', true);

      expect(pubSub.createTopic).not.toHaveBeenCalled();
      expect(GoogleCloudPubSubSubscription).toHaveBeenCalledWith(subscription);
    });

    it('should create a new topic if one does not exist', async () => {
      jest.spyOn(pubSub, 'getTopics').mockImplementation(() => Promise.resolve([[]]));
      const topic = createMockTopic('foo/bar/baz');
      jest.spyOn(pubSub, 'createTopic').mockImplementation(() => Promise.resolve([topic]));
      const subscription = createMockSubscription('foo-shared');
      jest.spyOn(topic, 'getSubscriptions').mockImplementation(() => Promise.resolve([[subscription]]));

      await pubSubService.observeSubscription('baz', 'foo', true);

      expect(pubSub.createTopic).toHaveBeenCalled();
      expect(GoogleCloudPubSubSubscription).toHaveBeenCalledWith(subscription);
    });

    it('should use an existing shared subscription if one exists', async () => {
      const topic = createMockTopic('foo/bar/baz');
      jest.spyOn(pubSub, 'getTopics').mockImplementation(() => Promise.resolve([[topic]]));
      const subscription = createMockSubscription('bar-shared');
      jest.spyOn(topic, 'getSubscriptions').mockImplementation(() => Promise.resolve([[subscription]]));

      await pubSubService.observeSubscription('baz', 'bar', true);

      expect(topic.createSubscription).not.toHaveBeenCalled();
      expect(GoogleCloudPubSubSubscription).toHaveBeenCalledWith(subscription);
    });

    it('should use an existing non-shared subscription if one exists', async () => {
      const topic = createMockTopic('foo/bar/baz');
      jest.spyOn(pubSub, 'getTopics').mockImplementation(() => Promise.resolve([[topic]]));
      const subscription = createMockSubscription(`bar-${hostname()}`);
      jest.spyOn(topic, 'getSubscriptions').mockImplementation(() => Promise.resolve([[subscription]]));

      await pubSubService.observeSubscription('baz', 'bar', false);

      expect(topic.createSubscription).not.toHaveBeenCalled();
      expect(GoogleCloudPubSubSubscription).toHaveBeenCalledWith(subscription);
    });

    it('should create a new shared subscription if one does not exist', async () => {
      const topic = createMockTopic('foo/bar/baz');
      jest.spyOn(pubSub, 'getTopics').mockImplementation(() => Promise.resolve([[topic]]));
      jest.spyOn(topic, 'getSubscriptions').mockImplementation(() => Promise.resolve([[]]));
      const subscription = createMockSubscription('bar-shared');
      const createSubscription = jest
        .spyOn(topic, 'createSubscription')
        .mockImplementation(() => Promise.resolve([subscription]));

      await pubSubService.observeSubscription('baz', 'bar', true);

      expect(createSubscription).toHaveBeenCalled();
      expect(GoogleCloudPubSubSubscription).toHaveBeenCalledWith(subscription);
    });

    it('should create a new non-shared subscription if one does not exist', async () => {
      const topic = createMockTopic('foo/bar/baz');
      jest.spyOn(pubSub, 'getTopics').mockImplementation(() => Promise.resolve([[topic]]));
      jest.spyOn(topic, 'getSubscriptions').mockImplementation(() => Promise.resolve([[]]));
      const subscription = createMockSubscription(`bar-${hostname()}`);
      const createSubscription = jest
        .spyOn(topic, 'createSubscription')
        .mockImplementation(() => Promise.resolve([subscription]));

      await pubSubService.observeSubscription('baz', 'bar', false);

      expect(createSubscription).toHaveBeenCalled();
      expect(GoogleCloudPubSubSubscription).toHaveBeenCalledWith(subscription);
    });

    it('should default to using a non-shared subscription', async () => {
      const topic = createMockTopic('foo/bar/baz');
      jest.spyOn(pubSub, 'getTopics').mockImplementation(() => Promise.resolve([[topic]]));
      const subscription = createMockSubscription(`bar-${hostname()}`);
      jest.spyOn(topic, 'getSubscriptions').mockImplementation(() => Promise.resolve([[subscription]]));

      await pubSubService.observeSubscription('baz', 'bar');
    });
  });

  describe('publishMessage', () => {
    it('should use an existing topic if one exists', async () => {
      const topic = createMockTopic('foo/bar/baz');
      jest.spyOn(pubSub, 'getTopics').mockImplementation(() => Promise.resolve([[topic]]));

      await pubSubService.publishMessage('baz', 'foo');

      expect(pubSub.createTopic).not.toHaveBeenCalled();
    });

    it('should create a new topic if one does not exist', async () => {
      jest.spyOn(pubSub, 'getTopics').mockImplementation(() => Promise.resolve([[]]));
      const topic = createMockTopic('foo/bar/baz');
      jest.spyOn(pubSub, 'createTopic').mockImplementation(() => Promise.resolve([topic]));

      await pubSubService.publishMessage('baz', 'foo');

      expect(pubSub.createTopic).toHaveBeenCalled();
    });

    it('should publish the provided message to the topic', async () => {
      const topic = createMockTopic('foo/bar/baz');
      jest.spyOn(pubSub, 'getTopics').mockImplementation(() => Promise.resolve([[topic]]));
      const message = 'foo';

      await pubSubService.publishMessage('baz', message);

      expect(topic.publish).toHaveBeenCalledWith(Buffer.from(message, 'utf8'));
    });

    it.each`
      numFailures | numCalls
      ${0}        | ${1}
      ${1}        | ${2}
      ${2}        | ${3}
    `(
      'should attempt to publish the message $numCalls time(s) when the number of failures is $numFailures',
      async ({ numFailures, numCalls }: { numFailures: number; numCalls: number }) => {
        const topic = createMockTopic('foo/bar/baz');
        jest.spyOn(pubSub, 'getTopics').mockImplementation(() => Promise.resolve([[topic]]));
        const publishSpy = jest.spyOn(topic, 'publish');
        for (let i = 0; i < numFailures; i++) {
          publishSpy.mockRejectedValueOnce(null as never);
        }
        for (let i = 0; i < 2 - numFailures; i++) {
          publishSpy.mockResolvedValueOnce(null as never);
        }

        await pubSubService.publishMessage('baz', 'foo');

        expect(publishSpy).toHaveBeenCalledTimes(numCalls);
      },
    );

    it('should log an error if publishing a message fails 3 times', async () => {
      const topic = createMockTopic('foo/bar/baz');
      jest.spyOn(pubSub, 'getTopics').mockImplementation(() => Promise.resolve([[topic]]));
      const publishSpy = jest.spyOn(topic, 'publish');
      for (let i = 0; i < 3; i++) {
        publishSpy.mockRejectedValueOnce(null as never);
      }
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      await pubSubService.publishMessage('baz', 'foo');

      expect(publishSpy).toHaveBeenCalledTimes(3);
      expect(consoleErrorSpy).toBeCalled();
    });
  });
});
