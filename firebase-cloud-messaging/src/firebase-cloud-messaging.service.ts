import { FirebaseService } from '@apposing/nest-firebase';
import { Injectable } from '@nestjs/common';
import { messaging } from 'firebase-admin/lib/messaging';
import { MAX_MESSAGES_PER_CHUNK } from './constants';
import { chunkArray } from './utils';
import Message = messaging.Message;
import MulticastMessage = messaging.MulticastMessage;

@Injectable()
export class FirebaseCloudMessagingService {
  constructor(private readonly firebaseService: FirebaseService) {}

  /**
   * Send a single message to a single token
   *
   * @param message The message to send
   */
  async sendMessage(message: Message): Promise<void> {
    await this.firebaseService.messaging().send(message);
  }

  /**
   * Send multiple different messages to multiple different tokens
   *
   * @param messages The messages to send
   */
  async sendMessages(messages: Message[]): Promise<void> {
    await Promise.all(
      chunkArray(messages, MAX_MESSAGES_PER_CHUNK).map(chunk => this.firebaseService.messaging().sendAll(chunk)),
    );
  }

  /**
   * Send a single message to multiple different tokens
   *
   * @param tokens The list of tokens to send the message to
   * @param message The message to send
   */
  async sendMulticastMessage(tokens: string[], message: Omit<MulticastMessage, 'tokens'>): Promise<void> {
    await Promise.all(
      chunkArray(tokens, MAX_MESSAGES_PER_CHUNK).map(chunk =>
        this.firebaseService.messaging().sendMulticast({
          tokens: chunk,
          ...message,
        }),
      ),
    );
  }
}
