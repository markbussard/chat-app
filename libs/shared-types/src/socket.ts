import { Conversation, ConversationUpdateReason, CreateConversationDTO } from './conversation';
import { Message, MessageUpdateReason } from './message';
import { Participant, ParticipantUpdateReason } from './participant';

export interface ServerToClientEvents {
  conversationAdded: (conversation: Conversation) => void;
  conversationJoined: (conversation: Conversation) => void;
  conversationUpdated: (conversation: Conversation, updateReason: ConversationUpdateReason) => void;
  conversationRemoved: (conversation: Conversation) => void;
  conversationLeft: (conversation: Conversation) => void;
  messageAdded: (message: Message) => void;
  messageUpdated: (message: Message, updateReason: MessageUpdateReason) => void;
  messageRemoved: (message: Message) => void;
  participantJoined: (participant: Participant) => void;
  participantLeft: (participant: Participant) => void;
  participantUpdated: (participant: Participant, updateReason: ParticipantUpdateReason) => void;
  typingStarted: (conversation: Conversation, participant: Participant) => void;
  typingEnded: (conversation: Conversation, participant: Participant) => void;
}

export interface ClientToServerEvents {
  hello: (message: string) => void;
  addConversation: (conversation: CreateConversationDTO) => void;
  joinConversation: (conversationId: string) => void;
  leaveConversation: (conversationId: string) => void;
  updateConversation: (conversation: Conversation, updateReason: ConversationUpdateReason) => void;
  removeConversation: (conversation: Conversation) => void;
  addMessage: (message: string) => void;
}

export interface InterServerEvents {
  ping: () => void;
}

export interface SocketData {
  id: string;
}
