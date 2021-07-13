import { FirebaseModule, FirebaseService } from '@apposing/nest-firebase';
import { Test } from '@nestjs/testing';
import { messaging } from 'firebase-admin/lib/messaging';
import { FirebaseCloudMessagingModule } from './firebase-cloud-messaging.module';
import { FirebaseCloudMessagingService } from './firebase-cloud-messaging.service';
import Messaging = messaging.Messaging;
import MulticastMessage = messaging.MulticastMessage;
import TokenMessage = messaging.TokenMessage;

jest.mock('./constants', () => ({
  MAX_MESSAGES_PER_CHUNK: 2,
}));

describe('FirebaseCloudMessagingService', () => {
  const mockTokenMessage1: TokenMessage = {
    token: 'abc123',
    notification: {
      title: 'Foo',
      body: 'Bar',
    },
  };
  const mockTokenMessage2: TokenMessage = {
    token: 'def456',
    notification: {
      title: 'Bar',
      body: 'Baz',
    },
  };
  const mockTokenMessage3: TokenMessage = {
    token: 'ghi789',
    notification: {
      title: 'Baz',
      body: 'Foo',
    },
  };

  async function setupFirebaseCloudMessagingService(
    firebaseService: Partial<FirebaseService>,
  ): Promise<FirebaseCloudMessagingService> {
    const module = await Test.createTestingModule({
      imports: [
        FirebaseModule.forRoot({
          name: expect.getState().currentTestName,
        }),
        FirebaseCloudMessagingModule,
      ],
    })
      .overrideProvider(FirebaseService)
      .useValue(firebaseService)
      .compile();
    return module.get(FirebaseCloudMessagingService);
  }

  describe('sendMessage', () => {
    it('should send the provided message', async () => {
      const sendFn = jest.fn().mockResolvedValue({});
      const firebaseCloudMessagingService = await setupFirebaseCloudMessagingService({
        messaging: () =>
          ({
            send: sendFn as unknown,
          } as Messaging),
      });

      await firebaseCloudMessagingService.sendMessage(mockTokenMessage1);

      expect(sendFn).toHaveBeenCalledWith(mockTokenMessage1);
    });
  });

  describe('sendMessages', () => {
    it('should send the provided messages in a single chunk if the number of messages is less than MAX_MESSAGES_PER_CHUNK', async () => {
      const sendAllFn = jest.fn().mockResolvedValue({});
      const firebaseCloudMessagingService = await setupFirebaseCloudMessagingService({
        messaging: () =>
          ({
            sendAll: sendAllFn as unknown,
          } as Messaging),
      });
      const messages: TokenMessage[] = [mockTokenMessage1];

      await firebaseCloudMessagingService.sendMessages(messages);

      expect(sendAllFn).toHaveBeenCalledTimes(1);
      expect(sendAllFn).toHaveBeenCalledWith(messages);
    });

    it('should send the provided messages in a single chunk if the number of messages is equal to MAX_MESSAGES_PER_CHUNK', async () => {
      const sendAllFn = jest.fn().mockResolvedValue({});
      const firebaseCloudMessagingService = await setupFirebaseCloudMessagingService({
        messaging: () =>
          ({
            sendAll: sendAllFn as unknown,
          } as Messaging),
      });
      const messages: TokenMessage[] = [mockTokenMessage1, mockTokenMessage2];

      await firebaseCloudMessagingService.sendMessages(messages);

      expect(sendAllFn).toHaveBeenCalledTimes(1);
      expect(sendAllFn).toHaveBeenCalledWith(messages);
    });

    it('should send the provided messages in a multiple chunks if the number of messages is greater than MAX_MESSAGES_PER_CHUNK', async () => {
      const sendAllFn = jest.fn().mockResolvedValue({});
      const firebaseCloudMessagingService = await setupFirebaseCloudMessagingService({
        messaging: () =>
          ({
            sendAll: sendAllFn as unknown,
          } as Messaging),
      });
      const messages: TokenMessage[] = [mockTokenMessage1, mockTokenMessage2, mockTokenMessage3];

      await firebaseCloudMessagingService.sendMessages(messages);

      expect(sendAllFn).toHaveBeenCalledTimes(2);
      expect(sendAllFn).toHaveBeenNthCalledWith(1, [mockTokenMessage1, mockTokenMessage2]);
      expect(sendAllFn).toHaveBeenNthCalledWith(2, [mockTokenMessage3]);
    });
  });

  describe('sendMulticastMessage', () => {
    it('should send the provided message in a single chunk if the number of tokens is less than MAX_MESSAGES_PER_CHUNK', async () => {
      const sendMulticastFn = jest.fn().mockResolvedValue({});
      const firebaseCloudMessagingService = await setupFirebaseCloudMessagingService({
        messaging: () =>
          ({
            sendMulticast: sendMulticastFn as unknown,
          } as Messaging),
      });
      const tokens = ['abc123'];

      await firebaseCloudMessagingService.sendMulticastMessage(tokens, mockTokenMessage1);

      expect(sendMulticastFn).toHaveBeenCalledTimes(1);
      expect(sendMulticastFn).toHaveBeenCalledWith({
        tokens,
        ...mockTokenMessage1,
      } as MulticastMessage);
    });

    it('should send the provided message in a single chunk if the number of tokens is equal to MAX_MESSAGES_PER_CHUNK', async () => {
      const sendMulticastFn = jest.fn().mockResolvedValue({});
      const firebaseCloudMessagingService = await setupFirebaseCloudMessagingService({
        messaging: () =>
          ({
            sendMulticast: sendMulticastFn as unknown,
          } as Messaging),
      });
      const tokens = ['abc123', 'def456'];

      await firebaseCloudMessagingService.sendMulticastMessage(tokens, mockTokenMessage1);

      expect(sendMulticastFn).toHaveBeenCalledTimes(1);
      expect(sendMulticastFn).toHaveBeenCalledWith({
        tokens,
        ...mockTokenMessage1,
      } as MulticastMessage);
    });

    it('should send the provided message in a multiple chunks if the number of tokens is greater than MAX_MESSAGES_PER_CHUNK', async () => {
      const sendMulticastFn = jest.fn().mockResolvedValue({});
      const firebaseCloudMessagingService = await setupFirebaseCloudMessagingService({
        messaging: () =>
          ({
            sendMulticast: sendMulticastFn as unknown,
          } as Messaging),
      });
      const token1 = 'abc123';
      const token2 = 'def456';
      const token3 = 'ghi789';
      const tokens = [token1, token2, token3];

      await firebaseCloudMessagingService.sendMulticastMessage(tokens, mockTokenMessage1);

      expect(sendMulticastFn).toHaveBeenCalledTimes(2);
      expect(sendMulticastFn).toHaveBeenNthCalledWith(1, {
        tokens: [token1, token2],
        ...mockTokenMessage1,
      } as MulticastMessage);
      expect(sendMulticastFn).toHaveBeenNthCalledWith(2, {
        tokens: [token3],
        ...mockTokenMessage1,
      } as MulticastMessage);
    });
  });
});
