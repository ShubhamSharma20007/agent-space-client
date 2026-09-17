import { use, useEffect, useRef, useState } from "react";
import { FiSun, FiMoon, FiMessageSquare } from "react-icons/fi";
import { Button } from "@/components/ui/button";
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
// const getConversations = 

const ChatLayout = () => {
  // const fetchConversations = use(getConversations);
  const conversationRedux = useConversation()
  const messagesRedux = useMessage()
  const { theme, toggleTheme } = useTheme();
  const { user: currentUser } = useUser()
  const [sessions, setSessions] = useState<ConversationState[]>([]);
  const [activeAgentId, setActiveAgentId] = useState<AgentId>("auto");
  const [isArtifactOpen, setIsArtifactOpen] = useState(false);
  const navigate = useNavigate();
  const chatContainerRef = useRef<HTMLDivElement | null>(null);
  const chatInputRef = useRef<HTMLTextAreaElement | null>(null);
  const userRedux = useUser()
  const activeMessages =
    conversationRedux.selectedConversationId
      ? messagesRedux.messages(conversationRedux.selectedConversationId) ?? []
      : [];


  const handleNewChat = async () => {
    if (chatInputRef.current) {
      chatInputRef.current.value = '';
      chatInputRef.current.focus();
      messagesRedux.clearMessages()
      conversationRedux.setSelectedConversationId(null)
      conversationRedux.setConversations([])

    }
    // const conversation = await conversationService.createConversation();
    // const id = conversation._id
    // const session: ChatSession = {
    //   _id: id,
    //   title: conversation.title || 'New Chat',
    //   userId: conversation.userId || currentUser?._id,
    // };
    // setSessions((prev) => [session, ...prev]);
    // // setMessagesBySession((prev) => ({ ...prev, [id]: [] }));
    // conversationRedux.appendConversation(session);
    // conversationRedux.setSelectedConversationId(id);

  };

  const handleSend = async (content: string,file?:File) => {
    let sessionId = conversationRedux.selectedConversationId;

    // check the credits is left 
    if(userRedux.user.credits <= 0){
      return toast.add({
        title: 'No credits left',
        description: 'Please purchase more credits to continue',
      })
    }


    if (!sessionId) {
      
      const conversation = await conversationService.createConversation();
      sessionId = conversation._id
      if (!sessionId) return console.error('No session created')
      const session: ChatSession = {
        _id: sessionId,
        title: conversation.title || content.slice(0, 40),
        userId: conversation.userId || currentUser?._id,
      };
      setSessions((prev) => [session, ...prev]);
      // setMessagesBySession((prev) => ({ ...prev, [id]: [] }));
      conversationRedux.appendConversation(session);
      conversationRedux.setSelectedConversationId(sessionId);
    }


    // update the title 
    if (sessionId && activeMessages.length === 0) {
      const updateConversationRes = await conversationService.updateConversation(sessionId, content.slice(0, 40))
      if (updateConversationRes) {
        const allConversations = conversationRedux.conversations ?? [];
        const updatedConversations = allConversations.map((conversation: ChatSession) => {
          if (conversation._id === sessionId) {
            return { ...conversation, title: content.slice(0, 40) };
          }
          return conversation;
        })
        setSessions((previousSessions) => {
          const hasSession = previousSessions.some((session) => session._id === sessionId);
          if (!hasSession) {
            return [{ _id: sessionId, title: content.slice(0, 40), userId: currentUser?._id ?? '' }, ...previousSessions];
          }
          return previousSessions.map((session) =>
            session._id === sessionId ? { ...session, title: content.slice(0, 40) } : session
          );
        });
        if (updatedConversations.some((conversation) => conversation._id === sessionId)) {
          conversationRedux.setConversations(updatedConversations);
        }
      }
    }

    const userMessage: ChatMessageData = {
      _id: crypto.randomUUID(),
      role: "user",
      content,
      createdAt: new Date().toISOString(),
       // fileName: file?.name,  show the UI for better exp.
    };



    messagesRedux.pushMessages(sessionId, userMessage);


    //   thunk ai response
    messagesRedux.sendChatMessage(
      sessionId,
      userMessage,
      activeAgentId,
      file
     
    )

  };

//  console.log(messagesRedux.messages(conversationRedux.selectedConversationId!),123213)
  const onLogout = async () => {
    await authService.logout();
    userRedux.clearUser()
    messagesRedux.clearConversationMessages(conversationRedux.selectedConversationId!)
    messagesRedux.clearMessages()
    navigate("/", { replace: true });
  }


  const setActiveSessionId = (id: string) => {
    conversationRedux.setSelectedConversationId(id);
    // if (!messagesRedux.messagesBySession[id]) {
      messagesRedux.fetchMessages(id);
    // }

    setIsArtifactOpen(false);
  };


  

  async function fetchConversations() {
    const conversations = await conversationService.getConversations();
    return conversations;
  }

  // //  Fetch conversations
  useEffect(() => {
    fetchConversations().then(fetchConversations => {
      setSessions(fetchConversations)
      conversationRedux.setConversations(fetchConversations)

    }
    )

  }, [])

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: 'smooth'
      })
    }

    
  }, [activeMessages]);


  const activeSession = sessions.find(
    (s) => s._id === conversationRedux.selectedConversationId
  );





  console.log("activeMessages", activeMessages)
  console.log(activeAgentId)


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
  {/* Chat section */}
  <div className="flex flex-1 flex-col min-w-0">
    <header className="flex items-center justify-between border-b border-gray-200 dark:border-white/10 px-4 py-2.5 sm:px-6">
      <button
        type="button"
        className={cn(
          "flex min-w-3xs items-center gap-2 rounded-md px-3 py-2 text-left text-sm transition-colors",
          "text-gray-600 dark:text-gray-300"
        )}
      >
        <FiMessageSquare
          size={14}
          className="shrink-0 opacity-70"
        />

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
      chatContainerRef={chatContainerRef}
    />

    <ChatComposer
      activeAgentId={activeAgentId}
      onSelectAgent={setActiveAgentId}
      onSend={handleSend}
      chatInputRef={chatInputRef}
      disabled={Boolean(messagesRedux.sending)}
    />
  </div>

  {/* Right side artifact panel */}
<Artifacts
  isOpen={isArtifactOpen}
  onClose={() => setIsArtifactOpen(false)}
  onOpen={() => setIsArtifactOpen(true)}
/>


</div>
    </div>
  );
};

export default ChatLayout;