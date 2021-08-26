# Nest Firebase

## Installation

`npm i @apposing/nest-firebase -S`

### Usage

`FirebaseModule` should be imported into `AppModule` using the `forRoot()` static function, e.g.

```typescript
import { FirebaseModule } from '@apposing/nest-firebase';
import { Module } from '@nestjs/common';

@Module({
  imports: [
    FirebaseModule.forRoot()
  ]
})
export class AppModule {
}
```

This enables other Apposing Nest Firebase packages to work. This also allows `FirebaseService`, which is a thin wrapper around the standard Firebase App object, to be injected across the entire project.

#### Usage within tests

`FirebaseModule` will need to be imported into the test module for any tests that rely on Firebase functionality.

Since tests are often run in parallel, to avoid errors arising from multiple Firebase instances being active at once you should pass the name of the current test to `FirebaseModule.forRoot()`, e.g.

```typescript
FirebaseModule.forRoot({
  name: expect.getState().currentTestName
})
```
