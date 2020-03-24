import {
  IsDefined,
  IsString,
  IsNumber, IsBoolean, IsEnum, IsArray, ArrayContains, Allow
} from 'class-validator';
import { StoreBusyStatus } from "./store.enum";
import { File } from "../file/file.entity";

export class VStore {

  @IsDefined() @IsString()
  title: string;
  @IsDefined() @IsString()
  description: string;
  @IsDefined() @IsString()
  dateTime: string;
  @IsDefined() @IsNumber()
  numSeats: number;
  @IsDefined() @IsBoolean()
  limitedSeats: boolean;

}

export class VNearbyStores {

  @IsDefined() @IsString()
  blat: string;
  @IsDefined() @IsString()
  blng: string;
  @IsDefined() @IsString()
  tlat: string;
  @IsDefined() @IsString()
  tlng: string;

}

export class VStoreUpdate {
  @IsDefined() @IsEnum(StoreBusyStatus)
  status: StoreBusyStatus;

  @IsDefined() @IsArray()
  photos: Array<File>;
}

export class VGetUpdated {

  @Allow() @IsString()
  page: string;

}
