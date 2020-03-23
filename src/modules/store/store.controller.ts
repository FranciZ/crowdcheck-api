import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { StoreService } from './store.service';
import { AuthenticatedUser } from '../../guards/authenticated-user.decorator';
import { UserService } from "../user/user.service";
import { Roles } from "../../guards/roles.decorator";
import { User, UserRole } from "../user/user.entity";
import { VNearbyStores, VStore, VStoreUpdate } from "./store.validation";
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

}
