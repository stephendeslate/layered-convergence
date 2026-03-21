// [TRACED:FD-005] Route management for technician daily scheduling
import { Injectable, BadRequestException } from "@nestjs/common";
import { PrismaService } from "../common/prisma.service";
import { CompanyService } from "../company/company.service";

const VALID_ROUTE_TRANSITIONS: Record<string, string[]> = {
  PLANNED: ["ACTIVE"],
  ACTIVE: ["COMPLETED"],
  COMPLETED: [],
};

@Injectable()
export class RouteService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly companyService: CompanyService,
  ) {}

  async create(data: {
    date: Date;
    companyId: string;
    technicianId: string;
  }) {
    await this.companyService.setCompanyContext(data.companyId);
    return this.prisma.route.create({
      data: {
        date: data.date,
        companyId: data.companyId,
        technicianId: data.technicianId,
      },
    });
  }

  async transition(routeId: string, newStatus: string, companyId: string) {
    await this.companyService.setCompanyContext(companyId);

    // findFirst: route lookup by ID within company context for RLS compliance
    const route = await this.prisma.route.findFirst({
      where: { id: routeId },
    });

    if (!route) {
      throw new BadRequestException("Route not found");
    }

    const allowed = VALID_ROUTE_TRANSITIONS[route.status];
    if (!allowed || !allowed.includes(newStatus)) {
      throw new BadRequestException(
        `Cannot transition from ${route.status} to ${newStatus}`,
      );
    }

    return this.prisma.route.update({
      where: { id: routeId },
      data: {
        status: newStatus as "PLANNED" | "ACTIVE" | "COMPLETED",
      },
    });
  }

  async findByCompany(companyId: string) {
    await this.companyService.setCompanyContext(companyId);
    return this.prisma.route.findMany({
      include: { technician: true, workOrders: true },
    });
  }

  async findByTechnician(technicianId: string, companyId: string) {
    await this.companyService.setCompanyContext(companyId);
    return this.prisma.route.findMany({
      where: { technicianId },
      include: { workOrders: true },
    });
  }
}
