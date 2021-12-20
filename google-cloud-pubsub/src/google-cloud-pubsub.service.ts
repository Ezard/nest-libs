import { PubSub, Subscription, Topic } from '@google-cloud/pubsub';
import { BeforeApplicationShutdown, Injectable } from '@nestjs/common';
import { hostname } from 'os';
import { GoogleCloudPubSubSubscription } from './google-cloud-pubsub-subscription';

function getSubscriptionFullName(name: string, shared: boolean): string {
  const postfix = shared ? 'shared' : hostname();
  return `${name}-${postfix}`;
}

@Injectable()
export class GoogleCloudPubSubService implements BeforeApplicationShutdown {
  private readonly transientSubscriptions: GoogleCloudPubSubSubscription[] = [];

  constructor(private readonly pubSub: PubSub) {}

  async beforeApplicationShutdown(): Promise<void> {
    await Promise.all(this.transientSubscriptions.map(subscription => subscription.delete()));
    await this.pubSub.close();
  }

  async getTopic(name: string): Promise<Topic | undefined> {
    const [topics] = await this.pubSub.getTopics();
    return topics.find(topic => topic.name.endsWith(name));
  }

  async createTopic(name: string): Promise<Topic> {
    const [topic] = await this.pubSub.createTopic(name);
    return topic;
  }

  async getOrCreateTopic(name: string): Promise<Topic> {
    const topic = await this.getTopic(name);
    if (topic) {
      return topic;
    } else {
      return this.createTopic(name);
    }
  }

  async getSubscription(topic: Topic, name: string, shared: boolean): Promise<Subscription | undefined> {
    const [subscriptions] = await topic.getSubscriptions();
    return subscriptions.find(subscription => subscription.name.endsWith(getSubscriptionFullName(name, shared)));
  }

  async createSubscription(topic: Topic, name: string, shared: boolean): Promise<Subscription> {
    const [subscription] = await topic.createSubscription(getSubscriptionFullName(name, shared));
    return subscription;
  }

  async getOrCreateSubscription(topic: Topic, name: string, shared = false): Promise<Subscription> {
    const subscription = await this.getSubscription(topic, name, shared);
    if (subscription) {
      return subscription;
    } else {
      return this.createSubscription(topic, name, shared);
    }
  }

  async observeSubscription(
    topicName: string,
    subscriptionName: string,
    shared = false,
  ): Promise<GoogleCloudPubSubSubscription> {
    const topic = await this.getOrCreateTopic(topicName);
    const subscription = await this.getOrCreateSubscription(topic, subscriptionName, shared);
    const pubSubSubscription = new GoogleCloudPubSubSubscription(subscription);
    if (!shared) {
      this.transientSubscriptions.push(pubSubSubscription);
    }
    return pubSubSubscription;
  }

  async publishMessage(topicName: string, message: string, attemptNumber = 0): Promise<void> {
    const topic = await this.getOrCreateTopic(topicName);
    try {
      await topic.publish(Buffer.from(message, 'utf-8'));
    } catch (err) {
      if (attemptNumber < 2) {
        await this.publishMessage(topicName, message, attemptNumber + 1);
      } else {
        console.error(err);
      }
    }
  }
}
