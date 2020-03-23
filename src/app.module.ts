import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { AppController } from './app.controller';
import { AuthModule } from './modules/auth/auth.module';
import { DatabaseModule } from './modules/common/database/database.module';
import { FileModule } from './modules/file/file.module';
import { UserModule } from './modules/user/user.module';
import { AuthMiddleware } from './middleware/auth.middleware';
import { TeamModule } from './modules/team/team.module';
import { MessageModule } from "./modules/message/message.module";
import { AppService } from "./app.service";
import { StoreModule } from "./modules/store/store.module";

@Module({
  imports: [
    AuthModule,
    DatabaseModule,
    FileModule,
    UserModule,
    TeamModule,
    MessageModule,
    StoreModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class ApplicationModule {
  public configure(consumer: MiddlewareConsumer): void {
    consumer.apply(AuthMiddleware)
      .forRoutes({path: '*', method: RequestMethod.ALL});
  }
}
