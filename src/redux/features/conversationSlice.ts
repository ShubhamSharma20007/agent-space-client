import type { ConversationState } from '@/interfaces/conversation.inteface';
import { createSlice } from '@reduxjs/toolkit';




 const initialState:{conversation:ConversationState[],selectedConversationId:string | null}  = {
    conversation:[],
    selectedConversationId: null,
    
}

export const conversationSlice = createSlice({
    name: 'conversation',
    initialState,
    reducers: {
       setConversations: (state, action) => {
           state.conversation = action.payload
       },
       appendConversation: (state, action) => {
           state.conversation.unshift(action.payload)
       },
       setSelectedConversationId: (state, action) => {
           state.selectedConversationId = action.payload
       }

    }
})

export const { setConversations,appendConversation,setSelectedConversationId } = conversationSlice.actions
export default conversationSlice.reducer