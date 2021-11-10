import { Inject, Injectable } from '@nestjs/common';
import { Span, SpanOptions, trace, Tracer } from '@opentelemetry/api';
import { TRACE_SERVICE } from './constants';

@Injectable()
export class GoogleCloudTraceService {
  constructor(@Inject(TRACE_SERVICE) private readonly traceService: string) {}

  private static get tracer(): Tracer {
    return trace.getTracer('default');
  }

  startSpan(name: string, options?: SpanOptions): Span {
    return GoogleCloudTraceService.tracer.startSpan(name, {
      ...options,
      attributes: {
        service: this.traceService,
        ...options?.attributes,
      },
    });
  }
}
