import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  async cleanDatabase() {
    const models = Reflect.ownKeys(this).filter(
      (key) => typeof key === 'string' && !key.startsWith('_') && !key.startsWith('$'),
    );

    return Promise.all(
      ['gpsEvent', 'invoice', 'route', 'workOrder', 'customer', 'technician', 'user', 'company'].map(
        (modelName) => {
          const model = (this as Record<string, any>)[modelName];
          if (model?.deleteMany) {
            return model.deleteMany();
          }
          return Promise.resolve();
        },
      ),
    );
  }
}
