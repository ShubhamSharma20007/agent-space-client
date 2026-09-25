import { useEffect, useRef, useState } from "react";
import { FiSun, FiMoon, FiMessageSquare } from "react-icons/fi";
import { Button } from "@/components/ui/button";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { useTheme } from "@/context/ThemeContext";
import Sidebar from "../components/Sidebar";
import MessageList from "@/components/Messagelist";
import ChatComposer from "@/components/Chatcomposer";
import type { AgentId, ChatMessageData, ChatSession } from "@/types/chat";
import { useUser } from "@/redux/hooks/useUser";
import authService from "@/services/auth.service";
import { useNavigate } from "react-router-dom";
import conversationService from "@/services/conversation.service";
import { useConversation } from "@/redux/hooks/useConversation";
import type { ConversationState } from "@/interfaces/conversation.inteface";
import { useMessage } from "@/redux/hooks/useMessages";
import { cn } from "@/lib/utils";
import Artifacts from "@/components/Artifacts";
import { toast } from "@/components/ui/toast";

const MIN_ARTIFACT_WIDTH = 350; // px, minimum width while the panel is open

const ChatLayout = () => {
  const conversationRedux = useConversation();
  const messagesRedux = useMessage();
  const { theme, toggleTheme } = useTheme();
  const { user: currentUser } = useUser();
  const [sessions, setSessions] = useState<ConversationState[]>([]);
  const [activeAgentId, setActiveAgentId] = useState<AgentId>("auto");
  const [isArtifactOpen, setIsArtifactOpen] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const navigate = useNavigate();
  const chatInputRef = useRef<HTMLTextAreaElement | null>(null);
  const lastArtifactWidth = useRef(MIN_ARTIFACT_WIDTH); // remembers the dragged width
  const userRedux = useUser();

  const activeMessages = conversationRedux.selectedConversationId
    ? messagesRedux.messages(conversationRedux.selectedConversationId) ?? []
    : [];

  // artifact UI only exists when the latest message has artifact files
  const hasArtifact =
    (messagesRedux.latestArtifact?.[0]?.files?.length ?? 0) > 0;

  // remember the width so reopening the panel restores it
  const handleArtifactResize = (size: {
    asPercentage: number;
    inPixels: number;
  }) => {
    if (typeof size?.inPixels === "number") {
      lastArtifactWidth.current = Math.max(
        MIN_ARTIFACT_WIDTH,
        Math.round(size.inPixels)
      );
    }
  };

  // stop the preview iframe from swallowing mouse events while dragging
  useEffect(() => {
    if (!isResizing) return;
    const stop = () => setIsResizing(false);
    window.addEventListener("pointerup", stop);
    window.addEventListener("pointercancel", stop);
    return () => {
      window.removeEventListener("pointerup", stop);
      window.removeEventListener("pointercancel", stop);
    };
  }, [isResizing]);

  const handleNewChat = async () => {
    if (chatInputRef.current) {
      chatInputRef.current.value = "";
      chatInputRef.current.focus();
      messagesRedux.clearMessages();
      conversationRedux.setSelectedConversationId(null);
      conversationRedux.setConversations([]);
    }
  };

  const handleSend = async (content: string, file?: File) => {
    let sessionId = conversationRedux.selectedConversationId;

    // check the credits is left
    if (userRedux.user.credits <= 0) {
      return toast.add({
        title: "No credits left",
        description: "Please purchase more credits to continue",
      });
    }

    if (!sessionId) {
      const conversation = await conversationService.createConversation();
      sessionId = conversation._id;
      if (!sessionId) return console.error("No session created");
      const session: ChatSession = {
        _id: sessionId,
        title: conversation.title || content.slice(0, 40),
        userId: conversation.userId || currentUser?._id,
      };
      setSessions((prev) => [session, ...prev]);
      conversationRedux.appendConversation(session);
      conversationRedux.setSelectedConversationId(sessionId);
    }

    // update the title
    if (sessionId && activeMessages.length === 0) {
      const updateConversationRes = await conversationService.updateConversation(
        sessionId,
        content.slice(0, 40)
      );
      if (updateConversationRes) {
        const allConversations = conversationRedux.conversations ?? [];
        const updatedConversations = allConversations.map(
          (conversation: ChatSession) => {
            if (conversation._id === sessionId) {
              return { ...conversation, title: content.slice(0, 40) };
            }
            return conversation;
          }
        );
        setSessions((previousSessions) => {
          const hasSession = previousSessions.some(
            (session) => session._id === sessionId
          );
          if (!hasSession) {
            return [
              {
                _id: sessionId,
                title: content.slice(0, 40),
                userId: currentUser?._id ?? "",
              },
              ...previousSessions,
            ];
          }
          return previousSessions.map((session) =>
            session._id === sessionId
              ? { ...session, title: content.slice(0, 40) }
              : session
          );
        });
        if (
          updatedConversations.some(
            (conversation) => conversation._id === sessionId
          )
        ) {
          conversationRedux.setConversations(updatedConversations);
        }
      }
    }

    const userMessage: ChatMessageData = {
      _id: crypto.randomUUID(),
      role: "user",
      content,
      createdAt: new Date().toISOString(),
    };

    messagesRedux.pushMessages(sessionId, userMessage);

    // thunk ai response
    messagesRedux.sendChatMessage(sessionId, userMessage, activeAgentId, file);
  };

  const onLogout = async () => {
    await authService.logout();
    userRedux.clearUser();
    messagesRedux.clearConversationMessages(
      conversationRedux.selectedConversationId!
    );
    messagesRedux.clearMessages();
    navigate("/", { replace: true });
  };

  const setActiveSessionId = (id: string) => {
    conversationRedux.setSelectedConversationId(id);
    messagesRedux.fetchMessages(id);
    setIsArtifactOpen(false);
  };

  async function fetchConversations() {
    const conversations = await conversationService.getConversations();
    return conversations;
  }

  // Fetch conversations
  useEffect(() => {
    fetchConversations().then((fetched) => {
      setSessions(fetched);
      conversationRedux.setConversations(fetched);
    });
  }, []);

  const activeSession = sessions?.find(
    (s) => s._id === conversationRedux.selectedConversationId
  );

  return (
    <div className="h-screen w-full flex bg-white dark:bg-[#05070d] font-sans transition-colors duration-300">
      <Sidebar
        sessions={sessions}
        activeSessionId={conversationRedux.selectedConversationId}
        onNewChat={handleNewChat}
        onSelectSession={setActiveSessionId}
        user={currentUser}
        onLogout={onLogout}
      />

      <div className="flex flex-1 min-w-0">
        <ResizablePanelGroup
          orientation="horizontal"
          className="flex-1 min-w-0"
        >
          {/* Chat section */}
          <ResizablePanel id="chat" minSize="30%">
            <div className="flex h-full flex-col min-w-0">
              <header className="flex items-center justify-between border-b border-gray-200 dark:border-white/10 px-4 py-2.5 sm:px-6">
                <button
                  type="button"
                  className={cn(
                    "flex min-w-3xs items-center gap-2 rounded-md px-3 py-2 text-left text-sm transition-colors",
                    "text-gray-600 dark:text-gray-300"
                  )}
                >
                  <FiMessageSquare size={14} className="shrink-0 opacity-70" />
                  {(activeSession?.title || "").slice(0, 40) || "New Message"}
                </button>

                <Button
                  onClick={toggleTheme}
                  aria-label="Toggle theme"
                  variant="outline"
                  size="icon"
                  className="w-9 h-9 rounded-full border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/10"
                >
                  {theme === "dark" ? (
                    <FiSun size={16} />
                  ) : (
                    <FiMoon size={16} />
                  )}
                </Button>
              </header>

              <MessageList
                messages={activeMessages}
                selectedConversationId={
                  conversationRedux.selectedConversationId
                }
              />

              <ChatComposer
                activeAgentId={activeAgentId}
                onSelectAgent={setActiveAgentId}
                onSend={handleSend}
                chatInputRef={chatInputRef}
                disabled={Boolean(messagesRedux.sending)}
              />
            </div>
          </ResizablePanel>

          {/* OPEN: resizable artifact panel (min 450px) */}
          {hasArtifact && isArtifactOpen && (
            <>
              <ResizableHandle
                withHandle
                onPointerDown={() => setIsResizing(true)}
              />
              <ResizablePanel
                id="artifacts"
                defaultSize={`${lastArtifactWidth.current}px`}
                minSize={`${MIN_ARTIFACT_WIDTH}px`}
                maxSize="70%"
                onResize={handleArtifactResize}
                className="transition-all duration-200 ease-in-out"
              >
                <Artifacts
                  isOpen
                  isResizing={isResizing}
                  onClose={() => setIsArtifactOpen(false)}
                  onOpen={() => setIsArtifactOpen(true)}
                />
              </ResizablePanel>
            </>
          )}
        </ResizablePanelGroup>

        {/* CLOSED: fixed 44px strip, not resizable */}
        {hasArtifact && !isArtifactOpen && (
          <div className="h-full w-[44px] shrink-0">
            <Artifacts
              isOpen={false}
              onClose={() => setIsArtifactOpen(false)}
              onOpen={() => setIsArtifactOpen(true)}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatLayout;