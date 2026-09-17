import { useAppDispatch, useAppSelector } from "../hook";
import { setMessages, clearConversationMessages, clearMessages, fetchChatMessages, pushMessages,sendChatMessage,setArtifacts } from "../features/messageSlice";
import type { AgentId, ChatMessageData, CodeBlock } from "@/types/chat";

export function useMessage() {
    const dispatch = useAppDispatch();
    const messagesBySession = useAppSelector((state) => state.messages.messagesBySession); 
    const sending = useAppSelector((state) => state.messages.sending);
    const fetching = useAppSelector((state) => state.messages.fetching);
    const latestArtifact = useAppSelector((state) => state.messages.latestArtifacts);

    return {
        messagesBySession, 
        sending,
        fetching,
        latestArtifact,
        messages: (conversationId: string) => messagesBySession[conversationId],
        setMessages: (conversationId: string, messages: ChatMessageData) => {
            dispatch(setMessages({ conversationId, messages }))
        },
        pushMessages: (conversationId: string, message: ChatMessageData) => {
            dispatch(pushMessages({ conversationId, messages: message }))
        },
        fetchMessages: (conversationId: string) => {
            dispatch(fetchChatMessages(conversationId))
        },
        clearMessages: () => {
            dispatch(clearMessages())
        },
        clearConversationMessages: (conversationId: string) => {
            dispatch(clearConversationMessages(conversationId))
        },
        sendChatMessage:(conversationId:string,message:ChatMessageData,agentId:AgentId,file?:File)=>{
            dispatch(sendChatMessage({ conversationId, message,agentId,file }))
        },
        setArtifacts:(artifacts:CodeBlock[])=>{
            dispatch(setArtifacts(artifacts))
        }
    }
}