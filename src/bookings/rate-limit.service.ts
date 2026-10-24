import { Injectable } from '@nestjs/common';

type AttemptWindow = {
  count: number;
  expiresAt: number;
};

export type RateLimitResult = {
  allowed: boolean;
  retryAfterSeconds?: number;
};

@Injectable()
export class RateLimitService {
  private readonly windows = new Map<string, AttemptWindow>();
  private readonly windowMilliseconds = 60_000;
  private readonly limit = 1;

  check(email: string, now = Date.now()): RateLimitResult {
    this.removeExpiredWindows(now);
    const currentWindow = this.windows.get(email);

    if (!currentWindow || currentWindow.expiresAt <= now) {
      this.windows.set(email, {
        count: 1,
        expiresAt: now + this.windowMilliseconds,
      });
      return { allowed: true };
    }

    currentWindow.count += 1;

    if (currentWindow.count <= this.limit) {
      return { allowed: true };
    }

    return {
      allowed: false,
      retryAfterSeconds: Math.max(
        1,
        Math.ceil((currentWindow.expiresAt - now) / 1000),
      ),
    };
  }

  private removeExpiredWindows(now: number): void {
    for (const [email, window] of this.windows) {
      if (window.expiresAt <= now) {
        this.windows.delete(email);
      }
    }
  }
}
