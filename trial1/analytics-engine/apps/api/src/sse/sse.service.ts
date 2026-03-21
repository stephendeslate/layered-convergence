import { Injectable, Logger } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { Response } from 'express';

export interface SseEvent {
  id?: string;
  type: string;
  data: string;
}

interface SseConnection {
  id: string;
  dashboardId: string;
  tenantId: string;
  res: Response;
  heartbeatInterval: ReturnType<typeof setInterval>;
  connectedAt: Date;
}

/**
 * SSE service for real-time dashboard updates.
 * Per SRS-4 section 4.
 */
@Injectable()
export class SseService {
  private readonly logger = new Logger(SseService.name);

  /** Active SSE connections indexed by connection ID */
  private readonly connections = new Map<string, SseConnection>();

  /** Dashboard ID -> Set of connection IDs */
  private readonly dashboardSubscribers = new Map<string, Set<string>>();

  /**
   * Register a new SSE connection for a dashboard.
   * Sets up SSE headers, heartbeat, and cleanup.
   */
  subscribe(dashboardId: string, tenantId: string, res: Response): string {
    const connectionId = randomUUID();

    // Set SSE headers
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no', // Disable nginx buffering
    });

    // Send initial connection event
    this.sendEvent(res, {
      id: randomUUID(),
      type: 'connection-status',
      data: JSON.stringify({ status: 'connected', connectionId }),
    });

    // Set up heartbeat every 30 seconds
    const heartbeatInterval = setInterval(() => {
      try {
        this.sendEvent(res, {
          id: randomUUID(),
          type: 'heartbeat',
          data: '{}',
        });
      } catch {
        this.removeConnection(connectionId);
      }
    }, 30_000);

    // Store connection
    const connection: SseConnection = {
      id: connectionId,
      dashboardId,
      tenantId,
      res,
      heartbeatInterval,
      connectedAt: new Date(),
    };
    this.connections.set(connectionId, connection);

    // Track dashboard subscribers
    if (!this.dashboardSubscribers.has(dashboardId)) {
      this.dashboardSubscribers.set(dashboardId, new Set());
    }
    this.dashboardSubscribers.get(dashboardId)!.add(connectionId);

    // Clean up on disconnect
    res.on('close', () => {
      this.removeConnection(connectionId);
    });

    this.logger.log(
      `SSE connection ${connectionId} established for dashboard ${dashboardId}`,
    );

    return connectionId;
  }

  /**
   * Broadcast an event to all subscribers of a dashboard.
   */
  broadcast(dashboardId: string, event: SseEvent): number {
    const subscriberIds = this.dashboardSubscribers.get(dashboardId);
    if (!subscriberIds || subscriberIds.size === 0) return 0;

    let sent = 0;
    for (const connectionId of subscriberIds) {
      const connection = this.connections.get(connectionId);
      if (!connection) continue;

      try {
        this.sendEvent(connection.res, {
          id: event.id ?? randomUUID(),
          type: event.type,
          data: event.data,
        });
        sent++;
      } catch {
        this.removeConnection(connectionId);
      }
    }

    return sent;
  }

  /**
   * Broadcast a widget data update to all subscribers of dashboards
   * containing that widget.
   */
  broadcastWidgetUpdate(
    dashboardId: string,
    widgetId: string,
    data: unknown,
  ): number {
    return this.broadcast(dashboardId, {
      type: 'widget-update',
      data: JSON.stringify({
        widgetId,
        data,
        timestamp: new Date().toISOString(),
      }),
    });
  }

  /**
   * Broadcast a dashboard refresh event.
   */
  broadcastDashboardRefresh(dashboardId: string, reason: string): number {
    return this.broadcast(dashboardId, {
      type: 'dashboard-refresh',
      data: JSON.stringify({
        dashboardId,
        reason,
        timestamp: new Date().toISOString(),
      }),
    });
  }

  /**
   * Get the number of active connections for a dashboard.
   */
  getConnectionCount(dashboardId: string): number {
    return this.dashboardSubscribers.get(dashboardId)?.size ?? 0;
  }

  /**
   * Get total active connections.
   */
  getTotalConnectionCount(): number {
    return this.connections.size;
  }

  /**
   * Remove a specific connection and clean up resources.
   */
  removeConnection(connectionId: string): void {
    const connection = this.connections.get(connectionId);
    if (!connection) return;

    // Clear heartbeat
    clearInterval(connection.heartbeatInterval);

    // Remove from dashboard subscribers
    const subscribers = this.dashboardSubscribers.get(connection.dashboardId);
    if (subscribers) {
      subscribers.delete(connectionId);
      if (subscribers.size === 0) {
        this.dashboardSubscribers.delete(connection.dashboardId);
      }
    }

    // Remove connection
    this.connections.delete(connectionId);

    // Try to end the response if still open
    try {
      if (!connection.res.writableEnded) {
        connection.res.end();
      }
    } catch {
      // Response already closed
    }

    this.logger.log(
      `SSE connection ${connectionId} closed for dashboard ${connection.dashboardId}`,
    );
  }

  /**
   * Remove all connections (used for cleanup/shutdown).
   */
  removeAllConnections(): void {
    for (const connectionId of this.connections.keys()) {
      this.removeConnection(connectionId);
    }
  }

  /**
   * Send a single SSE event to a response stream.
   */
  private sendEvent(res: Response, event: SseEvent): void {
    if (event.id) res.write(`id: ${event.id}\n`);
    res.write(`event: ${event.type}\n`);
    res.write(`data: ${event.data}\n\n`);
  }
}
