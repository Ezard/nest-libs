import { Test } from '@nestjs/testing';
import { SpanOptions, trace } from '@opentelemetry/api';
import { GoogleCloudTraceModule } from './google-cloud-trace.module';
import { GoogleCloudTraceService } from './google-cloud-trace.service';

describe('GoogleCloudTracePlugin', () => {
  describe('startSpan', () => {
    let googleCloudTraceService: GoogleCloudTraceService;

    beforeEach(async () => {
      const module = await Test.createTestingModule({
        imports: [GoogleCloudTraceModule.forRoot({ service: expect.getState().currentTestName })],
      }).compile();
      googleCloudTraceService = module.get(GoogleCloudTraceService);
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    it('should use the default tracer', () => {
      const getTracerSpy = jest.spyOn(trace, 'getTracer');

      googleCloudTraceService.startSpan('foo');

      expect(getTracerSpy).toHaveBeenCalledWith('default');
    });

    it('should use the supplied name as the trace name', () => {
      const name = 'foo';
      const tracer = trace.getTracer('default');
      jest.spyOn(trace, 'getTracer').mockReturnValue(tracer);
      const startSpanSpy = jest.spyOn(tracer, 'startSpan');

      googleCloudTraceService.startSpan(name);

      expect(startSpanSpy).toHaveBeenCalledWith(name, expect.anything());
    });

    it("should set the trace's service attribute to be injected value", () => {
      const name = 'foo';
      const tracer = trace.getTracer('default');
      jest.spyOn(trace, 'getTracer').mockReturnValue(tracer);
      const startSpanSpy = jest.spyOn(tracer, 'startSpan');

      googleCloudTraceService.startSpan(name);

      expect(startSpanSpy).toHaveBeenCalledWith(expect.anything(), {
        attributes: {
          service: expect.getState().currentTestName,
        },
      });
    });

    it('should add the supplied options to the span', () => {
      const name = 'foo';
      const startTime = 12345;
      const options: SpanOptions = {
        startTime,
      };
      const tracer = trace.getTracer('default');
      jest.spyOn(trace, 'getTracer').mockReturnValue(tracer);
      const startSpanSpy = jest.spyOn(tracer, 'startSpan');

      googleCloudTraceService.startSpan(name, options);

      expect(startSpanSpy).toHaveBeenCalledWith(expect.anything(), {
        startTime,
        attributes: {
          service: expect.getState().currentTestName,
        },
      });
    });

    it('should merge the supplied attributes with the default service attribute', () => {
      const name = 'foo';
      const options: SpanOptions = {
        attributes: {
          foo: 'bar',
        },
      };
      const tracer = trace.getTracer('default');
      jest.spyOn(trace, 'getTracer').mockReturnValue(tracer);
      const startSpanSpy = jest.spyOn(tracer, 'startSpan');

      googleCloudTraceService.startSpan(name, options);

      expect(startSpanSpy).toHaveBeenCalledWith(expect.anything(), {
        attributes: {
          service: expect.getState().currentTestName,
          foo: 'bar',
        },
      });
    });
  });
});
