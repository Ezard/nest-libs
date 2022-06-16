import { FirebaseModule, FirebaseService } from '@apposing/nest-firebase';
import { ExecutionContext, INestApplication } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import { Test, TestingModule } from '@nestjs/testing';
import { DecodedIdToken, getAuth } from 'firebase-admin/auth';
import { AuthGuard } from './auth.guard';

describe('AuthGuard', () => {
  let app: INestApplication;
  let reflector: Reflector;
  let firebaseService: FirebaseService;
  let authGuard: AuthGuard;
  const executionContext = {
    getHandler: () => ({}),
    switchToHttp: () => ({
      getRequest: () => ({
        header: () => undefined,
      }),
    }),
  } as ExecutionContext;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        FirebaseModule.forRoot({
          name: expect.getState().currentTestName,
        }),
      ],
    }).compile();
    app = module.createNestApplication();
    reflector = app.get(Reflector);
    firebaseService = module.get(FirebaseService);
    app = module.createNestApplication();
    authGuard = new AuthGuard(reflector, firebaseService);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  function mockMetadata(metadata?: { public?: boolean; basicAuth?: { username: string; password: string } }): void {
    jest.spyOn(reflector, 'get').mockImplementation(key => {
      switch (key) {
        case 'public':
          return metadata?.public;
        case 'basic-auth':
          return metadata?.basicAuth;
        default:
          return undefined;
      }
    });
  }

  function mockRequest(authHeader?: string): { header: () => string | undefined } {
    return {
      header: () => authHeader,
    };
  }

  function mockContext(request?: { header: () => string | undefined }): void {
    jest.spyOn(GqlExecutionContext, 'create').mockImplementation(
      () =>
        ({
          getContext: () => ({
            req: request,
          }),
        } as GqlExecutionContext),
    );
  }

  describe('canActivate', () => {
    describe('Public', () => {
      it('should return true if the target is marked as public', async () => {
        mockMetadata({ public: true });
        mockContext();

        const result = await authGuard.canActivate(executionContext);

        expect(result).toEqual(true);
      });
    });

    describe('Basic Auth', () => {
      it('should return false if the context has no associated request', async () => {
        mockMetadata({ basicAuth: { username: 'foo', password: 'bar' } });
        mockContext();

        const result = await authGuard.canActivate(executionContext);

        expect(result).toEqual(false);
      });

      it("should return false if the context has no associated 'Authorization' header", async () => {
        mockMetadata({ basicAuth: { username: 'foo', password: 'bar' } });
        mockContext(mockRequest());

        const result = await authGuard.canActivate(executionContext);

        expect(result).toEqual(false);
      });

      it("should return false if the 'Authorization' header does not contain a value", async () => {
        mockMetadata({ basicAuth: { username: 'foo', password: 'bar' } });
        mockContext(mockRequest('Basic'));

        const result = await authGuard.canActivate(executionContext);

        expect(result).toEqual(false);
      });

      it('should return false if the username and password do not match', async () => {
        mockMetadata({ basicAuth: { username: 'foo', password: 'bar' } });
        mockContext(mockRequest('Basic dXNlcjpwYXNz'));

        const result = await authGuard.canActivate(executionContext);

        expect(result).toEqual(false);
      });

      it('should return true if the username and password match', async () => {
        mockMetadata({ basicAuth: { username: 'foo', password: 'bar' } });
        mockContext(mockRequest('Basic Zm9vOmJhcg=='));

        const result = await authGuard.canActivate(executionContext);

        expect(result).toEqual(true);
      });
    });

    describe('Bearer Token', () => {
      it('should return false if the context has no associated request', async () => {
        mockMetadata();
        mockContext();

        const result = await authGuard.canActivate(executionContext);

        expect(result).toEqual(false);
      });

      it("should return false if the context has no associated 'Authorization' header", async () => {
        mockMetadata();
        mockContext(mockRequest());

        const result = await authGuard.canActivate(executionContext);

        expect(result).toEqual(false);
      });

      it("should return false if the 'Authorization' header does not contain a token", async () => {
        mockMetadata();
        mockContext(mockRequest('Bearer'));

        const result = await authGuard.canActivate(executionContext);

        expect(result).toEqual(false);
      });

      it("should return false if the 'Authorization' header contains an invalid token", async () => {
        mockMetadata();
        mockContext(mockRequest('Bearer ~@:<~:~@?>'));
        const result = await authGuard.canActivate(executionContext);

        expect(result).toEqual(false);
      });

      it('should return false if the token cannot be verified', async () => {
        mockMetadata();
        mockContext(mockRequest('Bearer abc123'));
        jest.spyOn(getAuth(firebaseService.app), 'verifyIdToken').mockRejectedValue({});
        jest.spyOn(console, 'error').mockImplementation();

        const result = await authGuard.canActivate(executionContext);

        expect(result).toEqual(false);
      });

      it('should return true if the token was successfully verified', async () => {
        mockMetadata();
        mockContext(mockRequest('Bearer abc123'));
        jest.spyOn(getAuth(firebaseService.app), 'verifyIdToken').mockResolvedValue({} as DecodedIdToken);

        const result = await authGuard.canActivate(executionContext);

        expect(result).toEqual(true);
      });
    });
  });
});
