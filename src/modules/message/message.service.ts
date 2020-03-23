import { Injectable } from '@nestjs/common';
import { Message } from "./message.entity";
import { getModelForClass } from "@typegoose/typegoose";

@Injectable()
export class MessageService {

  async createMessage(message: Message) {

    const MessageModel = getModelForClass(Message);
    const messageDocument = new MessageModel(message);
    messageDocument.save();
    await messageDocument.populate('author', 'nickname').execPopulate();

    return messageDocument;

  }

}
