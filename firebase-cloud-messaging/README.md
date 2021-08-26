# Nest Firebase Cloud Messaging

## Installation

`npm i @apposing/nest-firebase-cloud-messaging -S`

## Usage

Import `FirebaseCloudMessagingModule` into any module where you want to use `FirebaseCloudMessagingService`.

`FirebaseCloudMessagingService` automatically batches messages into groups of 500, to comply with [Firebase's restrictions](https://firebase.google.com/docs/cloud-messaging/send-message#send-messages-to-multiple-devices).

`FirebaseCloudMessagingService` exposes 3 functions:

### sendMessage

Used for sending a single message to a single token

### sendMessages

Used for sending multiple different messages to multiple different tokens

### sendMulticastMessage

Used for sending a single message to multiple different tokens
