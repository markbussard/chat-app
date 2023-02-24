import { ConversationList } from './components';

export const ChatComponent = () => {
  return (
    <>
      <h1 className="text-3xl">Chat</h1>
      <div className="flex flex-row">
        <ConversationList />
      </div>
    </>
  );
};
