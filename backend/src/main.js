"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("tsconfig-paths/register"); // add this at the very top
const core_1 = require("@nestjs/core");
const platform_fastify_1 = require("@nestjs/platform-fastify");
const app_module_1 = require("./app.module");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule, new platform_fastify_1.FastifyAdapter());
    await app.listen(process.env.PORT ?? 3000);
    // For external access: await app.listen(3000, '0.0.0.0');
}
bootstrap();
