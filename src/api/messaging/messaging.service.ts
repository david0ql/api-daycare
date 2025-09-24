import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { CreateMessageThreadDto } from './dto/create-message-thread.dto';
import { CreateMessageDto } from './dto/create-message.dto';
import { MarkMessageReadDto } from './dto/mark-message-read.dto';
import { MessageThreadsEntity } from 'src/entities/message_threads.entity';
import { MessagesEntity } from 'src/entities/messages.entity';
import { MessageRecipientsEntity } from 'src/entities/message_recipients.entity';
import { ChildrenEntity } from 'src/entities/children.entity';
import { UsersEntity } from 'src/entities/users.entity';
import { PageDto } from 'src/dto/page.dto';
import { PageOptionsDto } from 'src/dto/page-options.dto';
import { PageMetaDto } from 'src/dto/page-meta.dto';

@Injectable()
export class MessagingService {
  constructor(
    @InjectRepository(MessageThreadsEntity)
    private readonly messageThreadsRepository: Repository<MessageThreadsEntity>,
    @InjectRepository(MessagesEntity)
    private readonly messagesRepository: Repository<MessagesEntity>,
    @InjectRepository(MessageRecipientsEntity)
    private readonly messageRecipientsRepository: Repository<MessageRecipientsEntity>,
    @InjectRepository(ChildrenEntity)
    private readonly childrenRepository: Repository<ChildrenEntity>,
    @InjectRepository(UsersEntity)
    private readonly usersRepository: Repository<UsersEntity>,
    private readonly dataSource: DataSource,
  ) {}

  async createMessageThread(
    createMessageThreadDto: CreateMessageThreadDto,
    currentUserId: number,
  ): Promise<MessageThreadsEntity> {
    const { childId, subject, threadType, messageText, recipientIds, attachmentFilename, attachmentPath } = createMessageThreadDto;

    // Verify child exists
    const child = await this.childrenRepository.findOne({ where: { id: childId } });
    if (!child) {
      throw new NotFoundException('Child not found');
    }

    // Verify all recipients exist
    const recipients = await this.usersRepository.findByIds(recipientIds);
    if (recipients.length !== recipientIds.length) {
      throw new NotFoundException('One or more recipients not found');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Create message thread
      const newThread = this.messageThreadsRepository.create({
        childId,
        subject,
        threadType,
        createdBy: currentUserId,
      });

      const savedThread = await queryRunner.manager.save(newThread);

      // Create initial message
      const message = this.messagesRepository.create({
        threadId: savedThread.id,
        senderId: currentUserId,
        messageText,
        attachmentFilename: attachmentFilename || null,
        attachmentPath: attachmentPath || null,
      });

      const savedMessage = await queryRunner.manager.save(message);

      // Create message recipients
      const messageRecipients = recipientIds.map(recipientId => 
        this.messageRecipientsRepository.create({
          messageId: savedMessage.id,
          recipientId,
          isRead: false,
        })
      );

      await queryRunner.manager.save(messageRecipients);

      await queryRunner.commitTransaction();

      // Return thread with relations
      const retrievedThread = await this.messageThreadsRepository.findOne({
        where: { id: savedThread.id },
        relations: ['child', 'createdBy2', 'messages', 'messages.sender', 'messages.messageRecipients', 'messages.messageRecipients.recipient'],
      });
      
      if (!retrievedThread) {
        throw new NotFoundException('Failed to retrieve created thread');
      }
      
      return retrievedThread;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async createMessage(
    createMessageDto: CreateMessageDto,
    currentUserId: number,
  ): Promise<MessagesEntity> {
    const { threadId, messageText, recipientIds, attachmentFilename, attachmentPath } = createMessageDto;

    // Verify thread exists
    const thread = await this.messageThreadsRepository.findOne({ where: { id: threadId } });
    if (!thread) {
      throw new NotFoundException('Message thread not found');
    }

    // Verify all recipients exist
    const recipients = await this.usersRepository.findByIds(recipientIds);
    if (recipients.length !== recipientIds.length) {
      throw new NotFoundException('One or more recipients not found');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Create message
      const newMessage = this.messagesRepository.create({
        threadId,
        senderId: currentUserId,
        messageText,
        attachmentFilename: attachmentFilename || null,
        attachmentPath: attachmentPath || null,
      });

      const savedMessage = await queryRunner.manager.save(newMessage);

      // Create message recipients
      const messageRecipients = recipientIds.map(recipientId => 
        this.messageRecipientsRepository.create({
          messageId: savedMessage.id,
          recipientId,
          isRead: false,
        })
      );

      await queryRunner.manager.save(messageRecipients);

      // Update thread updated_at
      await queryRunner.manager.update(MessageThreadsEntity, threadId, {
        updatedAt: new Date(),
      });

      await queryRunner.commitTransaction();

      // Return message with relations
      const retrievedMessage = await this.messagesRepository.findOne({
        where: { id: savedMessage.id },
        relations: ['sender', 'messageRecipients', 'messageRecipients.recipient'],
      });
      
      if (!retrievedMessage) {
        throw new NotFoundException('Failed to retrieve created message');
      }
      
      return retrievedMessage;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async findAllThreads(
    pageOptionsDto: PageOptionsDto,
    currentUserId: number,
  ): Promise<PageDto<MessageThreadsEntity>> {
    const queryBuilder = this.messageThreadsRepository
      .createQueryBuilder('thread')
      .leftJoinAndSelect('thread.child', 'child')
      .leftJoinAndSelect('thread.createdBy2', 'createdBy')
      .leftJoinAndSelect('thread.messages', 'messages')
      .leftJoinAndSelect('messages.sender', 'sender')
      .leftJoinAndSelect('messages.messageRecipients', 'messageRecipients')
      .leftJoinAndSelect('messageRecipients.recipient', 'recipient')
      .where('thread.createdBy = :userId OR messageRecipients.recipientId = :userId', { userId: currentUserId })
      .orderBy('thread.updatedAt', 'DESC')
      .addOrderBy('messages.createdAt', 'ASC');

    const total = await queryBuilder.getCount();
    const threads = await queryBuilder
      .skip(pageOptionsDto.skip)
      .take(pageOptionsDto.take)
      .getMany();

    // Add unread count to each thread
    const threadsWithUnreadCount = await Promise.all(
      threads.map(async (thread) => {
        const unreadCount = await this.messageRecipientsRepository
          .createQueryBuilder('mr')
          .leftJoin('mr.message', 'm')
          .where('m.threadId = :threadId', { threadId: thread.id })
          .andWhere('mr.recipientId = :userId', { userId: currentUserId })
          .andWhere('mr.isRead = false')
          .getCount();

        return {
          ...thread,
          unreadCount,
        };
      })
    );

    const pageMeta = new PageMetaDto({ pageOptionsDto, totalCount: total });

    return new PageDto(threadsWithUnreadCount, pageMeta);
  }

  async findThreadById(id: number, currentUserId: number): Promise<MessageThreadsEntity> {
    const thread = await this.messageThreadsRepository
      .createQueryBuilder('thread')
      .leftJoinAndSelect('thread.child', 'child')
      .leftJoinAndSelect('thread.createdBy2', 'createdBy')
      .leftJoinAndSelect('thread.messages', 'messages')
      .leftJoinAndSelect('messages.sender', 'sender')
      .leftJoinAndSelect('messages.messageRecipients', 'messageRecipients')
      .leftJoinAndSelect('messageRecipients.recipient', 'recipient')
      .where('thread.id = :id', { id })
      .andWhere('thread.createdBy = :userId OR messageRecipients.recipientId = :userId', { userId: currentUserId })
      .orderBy('messages.createdAt', 'ASC')
      .getOne();

    if (!thread) {
      throw new NotFoundException('Message thread not found');
    }

    return thread;
  }

  async markMessageAsRead(
    markMessageReadDto: MarkMessageReadDto,
    currentUserId: number,
  ): Promise<MessageRecipientsEntity> {
    const { messageId } = markMessageReadDto;

    const messageRecipient = await this.messageRecipientsRepository.findOne({
      where: { messageId, recipientId: currentUserId },
    });

    if (!messageRecipient) {
      throw new NotFoundException('Message not found or you are not a recipient');
    }

    if (messageRecipient.isRead) {
      return messageRecipient;
    }

    messageRecipient.isRead = true;
    messageRecipient.readAt = new Date();

    return this.messageRecipientsRepository.save(messageRecipient);
  }

  async markAllMessagesAsReadInThread(
    threadId: number,
    currentUserId: number,
  ): Promise<void> {
    // Verify user has access to this thread
    const thread = await this.findThreadById(threadId, currentUserId);
    if (!thread) {
      throw new NotFoundException('Message thread not found');
    }

    await this.messageRecipientsRepository
      .createQueryBuilder()
      .update(MessageRecipientsEntity)
      .set({ isRead: true, readAt: new Date() })
      .where('recipientId = :userId', { userId: currentUserId })
      .andWhere('messageId IN (SELECT id FROM messages WHERE thread_id = :threadId)', { threadId })
      .andWhere('isRead = false')
      .execute();
  }

  async getUnreadMessagesCount(currentUserId: number): Promise<number> {
    return this.messageRecipientsRepository
      .createQueryBuilder('mr')
      .where('mr.recipientId = :userId', { userId: currentUserId })
      .andWhere('mr.isRead = false')
      .getCount();
  }

  async deleteThread(id: number, currentUserId: number): Promise<void> {
    const thread = await this.messageThreadsRepository.findOne({
      where: { id, createdBy: currentUserId },
    });

    if (!thread) {
      throw new NotFoundException('Message thread not found or you are not the creator');
    }

    await this.messageThreadsRepository.remove(thread);
  }
}