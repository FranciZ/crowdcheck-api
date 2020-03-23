import { Injectable } from '@nestjs/common';
import * as uuidv4 from 'uuid/v4';
import * as path from 'path';
import * as sharp from 'sharp';
import * as fs from 'fs';
import * as pkgcloud from 'pkgcloud';
import { File } from '../file/file.entity';
import { getModelForClass } from "@typegoose/typegoose";

@Injectable()
export class FileService {

  client: any;
  bucketName = 'crowdcheck';

  constructor() {
    this.initS3Client();
  }

  initS3Client() {

    this.client = pkgcloud.storage.createClient({
      provider: 'amazon',
      keyId: 'AKIAJ5I3BPQ2SYDCONYQ', // access key id
      key: process.env.AWS_KEY, // secret key
      region: 'eu-central-1' // region
    });

  }

  async deleteFileFromS3(remote) {

    return new Promise((resolve, reject) => {

      this.client.removeFile(this.bucketName, remote, (err, res) => {

        if (err) {
          reject(err);
        } else {
          resolve(res);
        }

      });

    });

  }

  async compareFiles(newFile, oldFile) {

    // Delete old poster images from S3 if new ima
    if (newFile && oldFile) {

      if (String(newFile._id) !== String(oldFile._id)) {
        const deleteResult = await this.deleteFileFromS3(oldFile.remote);
        if (oldFile.thumbRemote) {
          const deleteResultThumb = await this.deleteFileFromS3(oldFile.thumbRemote);
        }

        const FileModel = getModelForClass(File);
        await FileModel.remove({_id: oldFile._id});

      }

    }

    return true;

  }

  async deleteFile(file) {
    await this.deleteFileFromS3(file.remote);
    if (file.thumbRemote) {
      await this.deleteFileFromS3(file.thumbRemote);
    }
    const FileModel = getModelForClass(File);
    await FileModel.remove({_id: file._id});
    return true;
  }

  async uploadFileToS3(local, remote, contentType, isPublic = true): Promise<string> {

    const readStream = fs.createReadStream(local);
    const writeStream = this.client.upload({
      container: this.bucketName,
      remote: remote,
      acl: 'public-read',
      contentType: contentType
    });

    return new Promise((resolve, reject) => {

      writeStream.on('error', function (err) {
        reject(err);
      });

      writeStream.on('success', function (file) {
        resolve(file.location);
      });

      readStream.pipe(writeStream);

    }) as Promise<string>;

  }

  async processJPEG(local, fileName) {

    const uuidFilename = uuidv4();

    const imageFileName = `${uuidFilename}${path.extname(fileName)}`;
    const thumbFileName = `thumb-${uuidFilename}${path.extname(fileName)}`;

    const thumbPath = `upload/${thumbFileName}`;
    const imagePath = `upload/${imageFileName}`;

    await sharp(local, {quality: 100})
      .rotate()
      .resize(1440)
      .toFile(imagePath);

    await sharp(local, {quality: 100})
      .rotate()
      .resize(300)
      .toFile(thumbPath);

    fs.unlinkSync(local);

    return {
      imagePath,
      thumbPath,
      imageFileName,
      thumbFileName
    };

  }

}
