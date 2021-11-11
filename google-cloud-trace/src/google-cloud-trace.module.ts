import { TraceExporter } from '@google-cloud/opentelemetry-cloud-trace-exporter';
import { DynamicModule, Inject, Module, OnApplicationBootstrap, OnApplicationShutdown } from '@nestjs/common';
import { BasicTracerProvider, BatchSpanProcessor, SpanExporter } from '@opentelemetry/sdk-trace-base';
import { SPAN_EXPORTER, TRACE_SERVICE, TRACER_PROVIDER } from './constants';
import { GoogleCloudTraceModuleOptions } from './google-cloud-trace.module-options';
import { GoogleCloudTracePlugin } from './google-cloud-trace.plugin';
import { GoogleCloudTraceService } from './google-cloud-trace.service';

@Module({})
export class GoogleCloudTraceModule implements OnApplicationBootstrap, OnApplicationShutdown {
  static forRoot(options: GoogleCloudTraceModuleOptions): DynamicModule {
    return {
      module: GoogleCloudTraceModule,
      global: true,
      providers: [
        {
          provide: SPAN_EXPORTER,
          useValue: new TraceExporter(),
        },
        {
          provide: TRACER_PROVIDER,
          useValue: new BasicTracerProvider({}),
        },
        {
          provide: TRACE_SERVICE,
          useValue: options.service,
        },
        GoogleCloudTraceService,
        GoogleCloudTracePlugin,
      ],
      exports: [TRACE_SERVICE, GoogleCloudTraceService, GoogleCloudTracePlugin],
    };
  }

  constructor(
    @Inject(SPAN_EXPORTER) private readonly spanExporter: SpanExporter,
    @Inject(TRACER_PROVIDER) private readonly tracerProvider: BasicTracerProvider,
  ) {}

  onApplicationBootstrap(): void {
    this.tracerProvider.register();
    this.tracerProvider.addSpanProcessor(new BatchSpanProcessor(this.spanExporter));
  }

  async onApplicationShutdown(): Promise<void> {
    await this.tracerProvider.shutdown();
  }
}
