import { Module } from '@nestjs/common';
import { StoreService } from './store.service';
import { StoreController } from './store.controller';
import { UserModule } from "../user/user.module";
import { FileModule } from "../file/file.module";

@Module({
  imports: [UserModule, FileModule],
  controllers: [StoreController],
  providers: [StoreService],
  exports: [StoreService]
})
export class StoreModule {
}
