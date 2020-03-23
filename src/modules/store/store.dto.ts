import { Store } from './store.entity';

export class DEvent {

  _id: string;
  title: number;
  address: string;
  lat: string;
  lng: string;

  constructor(storeDoc: Store) {
    this._id = storeDoc._id;
    this.numSeats = storeDoc.numSeats;
    this.title = storeDoc.title;
    this.description = storeDoc.description;
    this.dateTime = storeDoc.dateTime;
  }
}
