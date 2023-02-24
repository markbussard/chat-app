import { BaseEntity } from './base';

export type MessageType = 'text' | 'media';

export interface Message extends BaseEntity {
  author: string;
  body: string;
  conversationId: string;
  index: number;
  participantId: string;
  type: MessageType;
}

export type MessageUpdateReason = 'body';

export interface CreateMessageDTO {
  body: string;
  conversationId: string;
  participantId: string;
  type: MessageType;
}
