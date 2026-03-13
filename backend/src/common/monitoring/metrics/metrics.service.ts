import { Injectable } from '@nestjs/common';
import * as client from 'prom-client';

@Injectable()
export class MetricsService {
  private readonly registry: client.Registry;

  constructor() {
    // 1. Create a new registry to hold your metrics
    this.registry = new client.Registry();

    // 2. Add default labels (e.g., app name) to every metric
    this.registry.setDefaultLabels({
      app: 'tradehub-backend'
    });

    // 3. Start collecting standard Node.js performance metrics
    client.collectDefaultMetrics({ register: this.registry });
  }

  // This method will be called by the controller to provide data to Prometheus
  getMetrics(): Promise<string> {
    return this.registry.metrics();
  }
}