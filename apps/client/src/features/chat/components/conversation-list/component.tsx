import { Conversation } from './conversation';

export const ConversationList = () => {
  return (
    <div className="flex flex-col gap-4">
      {Array.from({ length: 5 }).map((_, index) => (
        <Conversation key={index} />
      ))}
    </div>
  );
};
