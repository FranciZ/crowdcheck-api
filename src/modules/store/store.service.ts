import { Injectable } from '@nestjs/common';
import { Store, UserStoreUpdate } from "./store.entity";
import { VStore, VStoreUpdate } from "./store.validation";
import { getModelForClass } from "@typegoose/typegoose";
import { IStoreJson } from "./store.interaface";
import * as crypto from 'crypto';
import { ModelType, ReturnModelType } from "@typegoose/typegoose/lib/types";

@Injectable()
export class StoreService {

  async getStoresNearLocation(bottomLat: string, bottomLng: string, topLat: string, topLng: string) {

    const StoreModel = getModelForClass(Store);
    const stores: Array<Store> = await StoreModel.find({
      geo: {
        $geoWithin: {
          $box: [
            [bottomLng, bottomLat],
            [topLng, topLat]
          ]
        }
      }
    }).populate('history.photos');

    return stores.map((s: any) => {
      const storeObject: Store = s.toObject();

      storeObject.history = storeObject.history.filter((history) => {
        const difference = new Date().getTime() - new Date(history.createdAt).getTime();
        const hour = 1000 * 60 * 60;
        return difference < hour * 2;
      });

      storeObject.history.forEach((h: any) => {
        h.photos = h.photos.map((p) => ({thumbUrl: p.thumbUrl, url: p.url}));
      });
      return storeObject;
    });

    // const stores: Array<Store> = await StoreModel.find({
    //   geo: {
    //     $near: {
    //       $geometry: {
    //         type: 'Point',
    //         coordinates: [Number(lng), Number(lat)]
    //       },
    //       $maxDistance: 6000
    //     }
    //   }
    // });

  }

  async publishUpdate(storeId, update: VStoreUpdate) {

    const StoreModel = getModelForClass(Store);
    const UserStoreUpdateModel = getModelForClass(UserStoreUpdate);

    const updateDoc = new UserStoreUpdateModel({
      status: update.status,
      photos: update.photos
    });

    await StoreModel.update({_id: storeId}, {
      $push: {
        history: updateDoc
      }
    });

    return await updateDoc.populate('photos').execPopulate();

  }

  async upsertStores(stores: Array<IStoreJson>) {

    const StoreModel = getModelForClass(Store);
    const lastUpdated = new Date();

    //Fields to match on for upsert condition
    const matchFields = ['hashId'];

    const mappedStores: Array<Store> = stores.map(s => ({
      city: s.city,
      street: s.street,
      hashId: this.getStoreHash(s),
      name: s.name,
      brand: s.brand,
      geo: [s.coordinates.lon, s.coordinates.lat],
      lat: s.coordinates.lat,
      lng: s.coordinates.lon,
      lastUpdated
    }));

    //Perform bulk operation
    const result = await StoreModel.upsertMany(mappedStores, matchFields);

    return {
      nInserted: result.nUpserted,
      nModified: result.nModified
    }

  }

  private getStoreHash(store: IStoreJson) {
    const hash = crypto.createHash('sha256');
    return hash.update(`${store.brand}${store.name}${store.street}${store.coordinates.lat}${store.coordinates.lon}`).digest().toString('hex');
  }

}
