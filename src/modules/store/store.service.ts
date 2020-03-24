import { Injectable } from '@nestjs/common';
import { Store, UserStoreUpdate } from "./store.entity";
import { VStore, VStoreUpdate } from "./store.validation";
import { getModelForClass } from "@typegoose/typegoose";
import { IStoreJson } from "./store.interaface";
import * as crypto from 'crypto';
import { ModelType, ReturnModelType } from "@typegoose/typegoose/lib/types";
import { FileService } from "../file/file.service";

@Injectable()
export class StoreService {

  constructor(private fileService: FileService) {
  }

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

  async getUpdatedStores(page: string) {

    const StoreModel = getModelForClass(Store);

    let sliceArray = ['$history', 0, 10];

    if (page) {
      const pageNum = Number(page) - 1;
      if (pageNum > 0) {
        const pageSize = 10;
        sliceArray = ['$history', pageNum * pageSize, pageNum * pageSize + pageSize];
      }
    }

    const result = await StoreModel.aggregate([
      {
        $match: {
          lastUserPostDate: {$exists: true, $ne: null, $lt: new Date()},
        }
      },
      {$unwind: '$history'},
      {$sort: {'history.createdAt': -1}},
      {
        $group: {
          _id: null,
          history: {$push: '$history'},
          myCount: {$sum: 1}
        }
      },
      {
        $project: {
          history: {
            $slice: sliceArray
          },
          resultCount: '$myCount'
        }
      }
    ]);

    return StoreModel.populate(result, 'history.photos');

  }

  async deleteHistoryItem(storeId: string, historyId: string) {

    const StoreModel = getModelForClass(Store);

    const store: Store = await StoreModel.findOne({_id: storeId}).populate('history.photos');
    const history = store.history.filter((h) => String(h._id) === historyId)[0];
    if (history) {
      const deleteResult = await this.fileService.deleteFile(history.photos[0]);
      console.log('Delete result: ', deleteResult);
    }

    return StoreModel.update({_id: storeId}, {
      $pull: {
        history: {_id: historyId}
      }
    });

  }

  async publishUpdate(storeId, update: VStoreUpdate) {

    const StoreModel = getModelForClass(Store);
    const UserStoreUpdateModel = getModelForClass(UserStoreUpdate);

    const updateDoc = new UserStoreUpdateModel({
      status: update.status,
      photos: update.photos,
      store: storeId
    });

    await StoreModel.update({_id: storeId}, {
      $push: {
        history: updateDoc
      },
      lastUserPostDate: new Date()
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
