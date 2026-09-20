import { useEffect, useRef } from "react";
import { RiRobot2Line } from "react-icons/ri";
import ChatMessage from "./Chatmessage";
import LoadingAnimation from "./LoadingAnimation";
import type { ChatMessageData } from "@/types/chat";
import { useMessage } from "@/redux/hooks/useMessages";
import {
  MessageScroller,
  MessageScrollerButton,
  MessageScrollerContent,
  MessageScrollerItem,
  MessageScrollerProvider,
  MessageScrollerViewport,
  useMessageScroller,
} from "@/components/ui/message-scroller";

interface MessageListProps {
  messages: ChatMessageData[];
  selectedConversationId: string | null;
}

/**
 * Must render INSIDE <MessageScrollerProvider>.
 * Scrolls to the bottom every time `trigger` changes
 * (user sends a message, loading starts, assistant reply arrives).
 */
function ScrollToEndOnChange({ trigger }: { trigger: string }) {
  const { scrollToEnd } = useMessageScroller();

  // keep the latest function in a ref so the effect only depends on `trigger`
  const scrollToEndRef = useRef(scrollToEnd);
  scrollToEndRef.current = scrollToEnd;

  useEffect(() => {
    // wait one frame so the new row is mounted and measured
    const raf = requestAnimationFrame(() => scrollToEndRef.current());
    return () => cancelAnimationFrame(raf);
  }, [trigger]);

  return null;
}

const MessageList = ({ messages, selectedConversationId }: MessageListProps) => {
  const messagesRedux = useMessage();

  if (messages.length === 0 || !selectedConversationId) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
        <div className="w-12 h-12 rounded-full bg-gray-900 dark:bg-white flex items-center justify-center text-white dark:text-black font-semibold text-base mb-4">
          <RiRobot2Line size={25} />
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
    <MessageScrollerProvider
      key={selectedConversationId}
      autoScroll
      defaultScrollPosition="end"
    >
      {/* fires on: user message added, loading on/off, assistant message added */}
      <ScrollToEndOnChange
        trigger={`${messages.length}-${messagesRedux.sending}`}
      />

      <div className="relative flex-1 min-h-0">
        <MessageScroller>
          <MessageScrollerViewport>
            <MessageScrollerContent
              aria-busy={messagesRedux.sending}
              className="flex flex-col gap-5 px-4 py-6 sm:px-6"
            >
              {messages.map((message) => {
                const id = message._id ?? message.createdAt;
                return (
                  // ❌ no scrollAnchor here
                  <MessageScrollerItem key={id} messageId={id}>
                    <ChatMessage message={message} />
                  </MessageScrollerItem>
                );
              })}

              {messagesRedux.sending && (
                <MessageScrollerItem messageId="loading-indicator">
                  <div className="flex gap-2 items-center px-4 py-2">
                    <LoadingAnimation />
                  </div>
                </MessageScrollerItem>
              )}
            </MessageScrollerContent>
          </MessageScrollerViewport>

          <MessageScrollerButton />
        </MessageScroller>
      </div>
    </MessageScrollerProvider>
  );
};

export default MessageList;