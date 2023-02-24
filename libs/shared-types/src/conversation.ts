import { BaseEntity } from './base';

export interface Conversation extends BaseEntity {
  createdBy: string;
  name: string;
}

export type ConversationUpdateReason = 'name' | 'lastMessage';

export interface CreateConversationDTO {
  createdBy: string;
  name: string;
}
