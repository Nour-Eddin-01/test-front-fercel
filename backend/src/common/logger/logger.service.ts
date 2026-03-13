// Ensure the import string is exactly '@nestjs/common'
import { Injectable, ConsoleLogger } from '@nestjs/common';

@Injectable()
export class TradeHubLogger extends ConsoleLogger {
  log(message: any, context?: string) {
    if (typeof message === 'object') {
      console.log(JSON.stringify({
        ...message,
        "@timestamp": new Date().toISOString(),
        "service": "nginx-traffic",
        "context": context || 'TradeHubBackend'
      }));
    } else {
      super.log(message, context);
    }
  }
}