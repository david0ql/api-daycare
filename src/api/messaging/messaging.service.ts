import { Injectable } from '@nestjs/common';
import { CreateMessagingDto } from './dto/create-messaging.dto';
import { UpdateMessagingDto } from './dto/update-messaging.dto';

@Injectable()
export class MessagingService {
  create(createMessagingDto: CreateMessagingDto) {
    return 'This action adds a new messaging';
  }

  findAll() {
    return `This action returns all messaging`;
  }

  findOne(id: number) {
    return `This action returns a #${id} messaging`;
  }

  update(id: number, updateMessagingDto: UpdateMessagingDto) {
    return `This action updates a #${id} messaging`;
  }

  remove(id: number) {
    return `This action removes a #${id} messaging`;
  }
}
