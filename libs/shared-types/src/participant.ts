import { BaseEntity } from './base';

export interface Participant extends BaseEntity {
  userId: string;
  conversationId: string;
}

export type ParticipantUpdateReason = 'lastReadMessageIndex';
