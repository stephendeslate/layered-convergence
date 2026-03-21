import { Injectable, Logger } from '@nestjs/common';

/**
 * Route optimization processor — triggered after work order assignment.
 * In production, this would be a BullMQ Worker consuming the route-optimization queue.
 * For now, it provides the processing logic that can be called by the BullMQ worker.
 */
@Injectable()
export class RouteOptimizationProcessor {
  private readonly logger = new Logger(RouteOptimizationProcessor.name);

  async processRecalculateRoute(data: {
    companyId: string;
    technicianId: string;
    date: string;
  }) {
    this.logger.log(
      `Recalculating route for technician ${data.technicianId} on ${data.date}`,
    );
    // In production: fetch work orders, call RoutingService.optimizeRoute, update Route records
    // For now, log the event
  }

  async processCalculateEta(data: {
    companyId: string;
    workOrderId: string;
    technicianId: string;
  }) {
    this.logger.log(
      `Calculating ETA for work order ${data.workOrderId}`,
    );
    // In production: call RoutingService.getDirections, cache ETA, broadcast to tracking portal
  }
}
