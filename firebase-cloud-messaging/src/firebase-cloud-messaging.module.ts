import { Module } from '@nestjs/common';
import { FirebaseCloudMessagingService } from './firebase-cloud-messaging.service';

@Module({
  providers: [FirebaseCloudMessagingService],
  exports: [FirebaseCloudMessagingService],
})
export class FirebaseCloudMessagingModule {}
