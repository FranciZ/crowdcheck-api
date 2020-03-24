import { prop, Typegoose, arrayProp, index, Ref, getModelForClass, plugin } from '@typegoose/typegoose';
import { User } from "../user/user.entity";
import { StoreBusyStatus } from "./store.enum";
import { File } from "../file/file.entity";
import * as upsertMany from '@meanie/mongoose-upsert-many';

export class UserStoreUpdate extends Typegoose {

  _id?: string;

  @prop()
  status: StoreBusyStatus;

  @prop({default: () => new Date()})
  createdAt?: Date;

  @arrayProp({ref: 'File'})
  photos?: Ref<File>[];

  @prop({ref: 'Store'})
  store: Ref<Store>;

}

@index({geo: '2dsphere'})
@plugin(upsertMany)
export class Store {

  _id?: string;

  @prop()
  hashId: string;

  @prop()
  brand: string;

  @prop()
  name: string;

  @prop()
  street: string;

  @prop()
  city: string;

  @prop()
  lat: number;

  @prop()
  lng: number;

  @prop()
  importDate?: Date;

  @prop()
  lastUpdated?: Date;

  @prop()
  lastUserPostDate?: Date;

  @prop({default: () => new Date()})
  createdAt?: Date;

  @arrayProp({items: Number})
  geo: Array<Number>;

  @arrayProp({items: UserStoreUpdate})
  history?: Array<UserStoreUpdate>;

}

getModelForClass(Store);
