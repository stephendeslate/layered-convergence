"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
const _core = require("@nestjs/core");
const _common = require("@nestjs/common");
const _appmodule = require("./app.module");
const _prismaexceptionfilter = require("./common/filters/prisma-exception.filter");
async function bootstrap() {
    const app = await _core.NestFactory.create(_appmodule.AppModule);
    app.useGlobalPipes(new _common.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true
    }));
    app.useGlobalFilters(new _prismaexceptionfilter.PrismaExceptionFilter());
    app.enableCors({
        origin: true,
        credentials: true
    });
    const port = process.env.PORT || 3000;
    await app.listen(port);
}
bootstrap();

//# sourceMappingURL=main.js.map