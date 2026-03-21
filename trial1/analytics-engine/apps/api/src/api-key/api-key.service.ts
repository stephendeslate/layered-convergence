import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { createHash, randomBytes } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { CreateApiKeyDto } from './dto/create-api-key.dto';

/**
 * API Key management service.
 * Per SRS-4 sections 1.2 and 3.3.
 */
@Injectable()
export class ApiKeyService {
  private readonly logger = new Logger(ApiKeyService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
  ) {}

  /**
   * Generate a new API key, store hashed, return plain key once.
   * Per SRS-4 section 1.2.1.
   */
  async create(
    tenantId: string,
    dto: CreateApiKeyDto,
  ): Promise<{ key: string; id: string; name: string; keyPrefix: string; type: string }> {
    // Generate key
    const key = randomBytes(32).toString('base64url'); // 43 chars
    const keyHash = createHash('sha256').update(key).digest('hex');
    const keyPrefix = key.slice(-4);

    const apiKey = await this.prisma.apiKey.create({
      data: {
        tenantId,
        type: (dto.type ?? 'EMBED') as any,
        keyHash,
        keyPrefix,
        name: dto.name,
        expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : null,
      },
    });

    await this.auditService.log({
      tenantId,
      action: 'API_KEY_CREATED' as any,
      resourceType: 'ApiKey',
      resourceId: apiKey.id,
      metadata: { type: apiKey.type, name: apiKey.name, keyPrefix },
    });

    this.logger.log(
      `API key created for tenant ${tenantId}: ${apiKey.name} (***${keyPrefix})`,
    );

    // Return the plain key ONCE — never stored
    return {
      key,
      id: apiKey.id,
      name: apiKey.name,
      keyPrefix,
      type: apiKey.type,
    };
  }

  /**
   * Revoke an API key by setting revokedAt and isActive to false.
   */
  async revoke(id: string, tenantId: string): Promise<void> {
    const apiKey = await this.prisma.apiKey.findFirst({
      where: { id, tenantId },
    });
    if (!apiKey) throw new NotFoundException('API key not found');

    await this.prisma.apiKey.update({
      where: { id },
      data: {
        isActive: false,
        revokedAt: new Date(),
      },
    });

    await this.auditService.log({
      tenantId,
      action: 'API_KEY_REVOKED' as any,
      resourceType: 'ApiKey',
      resourceId: id,
      metadata: { keyPrefix: apiKey.keyPrefix },
    });

    this.logger.log(`API key revoked: ${id} (***${apiKey.keyPrefix})`);
  }

  /**
   * List API keys for a tenant (showing only last 4 chars).
   */
  async list(tenantId: string) {
    const keys = await this.prisma.apiKey.findMany({
      where: { tenantId },
      select: {
        id: true,
        type: true,
        name: true,
        keyPrefix: true,
        isActive: true,
        lastUsedAt: true,
        expiresAt: true,
        createdAt: true,
        revokedAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return keys;
  }

  /**
   * Validate an API key and return the associated tenant.
   * Used by the ApiKeyAuthGuard.
   * Per SRS-4 section 1.2.2.
   */
  async validate(key: string) {
    const keyHash = createHash('sha256').update(key).digest('hex');

    const apiKey = await this.prisma.apiKey.findUnique({
      where: { keyHash },
      include: { tenant: true },
    });

    if (!apiKey) {
      throw new UnauthorizedException('Invalid API key');
    }

    if (!apiKey.isActive) {
      throw new UnauthorizedException('API key is inactive');
    }

    if (apiKey.revokedAt) {
      throw new UnauthorizedException('API key has been revoked');
    }

    if (apiKey.expiresAt && apiKey.expiresAt < new Date()) {
      throw new UnauthorizedException('API key has expired');
    }

    // Update lastUsedAt
    await this.prisma.apiKey.update({
      where: { id: apiKey.id },
      data: { lastUsedAt: new Date() },
    });

    return {
      id: apiKey.id,
      type: apiKey.type,
      tenantId: apiKey.tenantId,
      tenant: apiKey.tenant,
    };
  }
}
