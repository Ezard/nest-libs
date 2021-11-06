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
    getHandler: () => {
      return {};
    },
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

  describe('canActivate', () => {
    function mockGqlExecutionContext(authHeader?: string): void {
      jest.spyOn(GqlExecutionContext, 'create').mockImplementation(
        () =>
          ({
            getContext: () => ({
              req: {
                header: () => authHeader,
              },
            }),
          } as GqlExecutionContext),
      );
    }

    it('should return true if the target is marked as public', async () => {
      jest.spyOn(reflector, 'get').mockImplementation(() => true);

      const result = await authGuard.canActivate(executionContext);

      expect(result).toEqual(true);
    });

    it('should return false if the context has no associated request', async () => {
      jest.spyOn(reflector, 'get').mockImplementation(() => false);
      mockGqlExecutionContext();

      const result = await authGuard.canActivate(executionContext);

      expect(result).toEqual(false);
    });

    it("should return false if the context has no associated 'Authorization' header", async () => {
      jest.spyOn(reflector, 'get').mockImplementation(() => false);
      mockGqlExecutionContext();

      const result = await authGuard.canActivate(executionContext);

      expect(result).toEqual(false);
    });

    it("should return false if the 'Authorization' header does not contain a token", async () => {
      jest.spyOn(reflector, 'get').mockImplementation(() => false);
      mockGqlExecutionContext('Bearer');

      const result = await authGuard.canActivate(executionContext);

      expect(result).toEqual(false);
    });

    it("should return false if the 'Authorization' header contains an invalid token", async () => {
      jest.spyOn(reflector, 'get').mockImplementation(() => false);
      mockGqlExecutionContext('Bearer ~@:<~:~@?>');
      const result = await authGuard.canActivate(executionContext);

      expect(result).toEqual(false);
    });

    it('should return false if the token cannot be verified', async () => {
      jest.spyOn(reflector, 'get').mockImplementation(() => false);
      mockGqlExecutionContext('Bearer abc123');
      jest.spyOn(getAuth(firebaseService.app), 'verifyIdToken').mockRejectedValue({});
      jest.spyOn(console, 'error').mockImplementation();

      const result = await authGuard.canActivate(executionContext);

      expect(result).toEqual(false);
    });

    it('should return true if the token was successfully verified', async () => {
      jest.spyOn(reflector, 'get').mockImplementation(() => false);
      mockGqlExecutionContext('Bearer abc123');
      jest.spyOn(getAuth(firebaseService.app), 'verifyIdToken').mockResolvedValue({} as DecodedIdToken);

      const result = await authGuard.canActivate(executionContext);

      expect(result).toEqual(true);
    });
  });
});
