
import { useAppDispatch, useAppSelector } from "../hook";
import { appendConversation, setConversations,setSelectedConversationId } from "../features/conversationSlice";
import type { ConversationState } from "@/interfaces/conversation.inteface";

export function useConversation() {
    const dispatch = useAppDispatch();
    return {
        conversations: useAppSelector((state) => state.conversations.conversation),
        selectedConversationId:useAppSelector((state) => state.conversations.selectedConversationId),
        setConversations: (conversations: ConversationState[]) => {
           dispatch(setConversations(conversations))
        },
        appendConversation: (conversation: ConversationState) => {
            dispatch(appendConversation(conversation))
        },
        setSelectedConversationId:(conversationId:string |null) => {
            dispatch(setSelectedConversationId(conversationId))
        }
    }
}
