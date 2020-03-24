import { Body, Controller, Delete, Get, Param, Post, Query } from '@nestjs/common';
import { StoreService } from './store.service';
import { AuthenticatedUser } from '../../guards/authenticated-user.decorator';
import { UserService } from "../user/user.service";
import { Roles } from "../../guards/roles.decorator";
import { User, UserRole } from "../user/user.entity";
import { VGetUpdated, VNearbyStores, VStore, VStoreUpdate } from "./store.validation";
import { IStoreJson } from "./store.interaface";

@Controller()
export class StoreController {

  constructor(private storeService: StoreService, private userService: UserService) {

  }

  @Get('v1/stores/count')
  async getStoreCount(@Query() data: VNearbyStores): Promise<any> {
    return this.storeService.getStoresNearLocation(data.blat, data.blng, data.tlat, data.tlng);
  }

  @Get('v1/stores/nearby')
  async getStoresNearby(@Query() data: VNearbyStores): Promise<any> {
    return this.storeService.getStoresNearLocation(data.blat, data.blng, data.tlat, data.tlng);
  }

  @Post('v1/stores')
  async updateStores(@Body() stores: Array<IStoreJson>): Promise<any> {
    return this.storeService.upsertStores(stores);
  }

  @Post('v1/stores/:storeId/update')
  async publishUpdate(@Body() update: VStoreUpdate, @Param('storeId') storeId: string): Promise<any> {
    return this.storeService.publishUpdate(storeId, update);
  }

  @Roles(UserRole.ADMIN)
  @Get('v1/stores/updates')
  async getUpdatedStores(@Query() data: VGetUpdated): Promise<any> {
    return this.storeService.getUpdatedStores(data.page);
  }

  @Roles(UserRole.ADMIN)
  @Delete('v1/stores/:storeId/history/:historyId')
  async deleteHistoryItem(@Param('storeId') storeId: string,
                          @Param('historyId') historyId: string): Promise<any> {
    return this.storeService.deleteHistoryItem(storeId, historyId);
  }

}
