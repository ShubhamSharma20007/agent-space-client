import type { RefObject } from 'react';
import ChatMessage from './Chatmessage';
import type { ChatMessageData } from '@/types/chat';
import { RiRobot2Line } from 'react-icons/ri';
import LoadingAnimation from './LoadingAnimation';
import { useMessage } from '@/redux/hooks/useMessages';

interface MessageListProps {
  messages: ChatMessageData[];
  selectedConversationId:string|null;
  chatContainerRef: RefObject<HTMLDivElement | null>
}

const MessageList = ({ messages,selectedConversationId,chatContainerRef }: MessageListProps) => {
  const messagesRedux = useMessage()
  if (messages.length === 0 || !selectedConversationId) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
        <div className="w-12 h-12 rounded-full bg-gray-900 dark:bg-white flex items-center justify-center text-white dark:text-black font-semibold text-base mb-4">
         <RiRobot2Line size={25}/>
        </div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          Pick an agent and start typing
        </h2>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 max-w-xs">
          Chat, coding, slides, PDF, and search agents are ready below.
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-6 message-container" ref={chatContainerRef}>
      <div className=" flex  flex-col gap-5">
        {messages.map((message) => (
          <ChatMessage key={message._id ??message.createdAt} message={message} />
        ))}
         {messagesRedux.sending && (
      <div className="flex gap-2 items-center px-4 py-2">
        {/* <div className="w-7 h-7 shrink-0 rounded-full bg-gray-900 dark:bg-white flex items-center justify-center text-white dark:text-black text-xs">
          <RiRobot2Line size={18} />
        </div> */}
        <LoadingAnimation />
      </div>
    )}
      </div>
    </div>
  );
};

export default MessageList;