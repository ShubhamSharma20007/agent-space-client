import messageService from '@/services/message.service';
import { createAsyncThunk, createSlice, type Dispatch } from '@reduxjs/toolkit';
import type { AgentId, ChatMessageData, CodeBlock } from '@/types/chat';
interface MessageState {
    messagesBySession: Record<string, ChatMessageData[]>;
    fetching: boolean;
    sending: boolean;
    error: string | null;
    latestArtifacts: CodeBlock[],
}

const initialState: MessageState = {
    messagesBySession: {},
    fetching: false,
    sending: false,
    error: null,
    latestArtifacts: [],
};

export const fetchChatMessages = createAsyncThunk(
    'messages/fetchMessages',
    async (conversationId: string, { rejectWithValue }) => {
        try {
            const response = await messageService.getMessages(conversationId);
            return {
                conversationId,
                messages: response ?? [],
                // agentId:response.agentId
            };
        }
        catch (error: any) {
            return rejectWithValue(error?.response?.data?.message || "Failed to fetch messages");
        }
    }
)

export const sendChatMessage = createAsyncThunk(
    'messages/sendMessage',
    async ({ conversationId, message,agentId,file }: { conversationId: string, message: ChatMessageData,agentId:AgentId,file?:File }, { rejectWithValue }) => {
        try {
            const response = await messageService.sendMessage(conversationId, message,agentId,file);
      
            return {
                conversationId,
                message: response , // fall back to the local message if server doesn't echo one back
                agentId:response.agentId
            };
        }
        catch (error: any) {
            // rejectWithValue(error?.response?.data?.message || "Failed to send message");
            return {
                    conversationId,
                    message: {
                        _id: crypto.randomUUID(), 
                        role: 'assistant',
                        content: error?.response?.data?.error || "Failed to send message",
                        createdAt: new Date().toISOString()
                    },
                }
            
        }
    }
)

export const messageSlice = createSlice({
    name: 'message',
    initialState,
    reducers: {
        setMessages: (state, action) => {
            state.messagesBySession[action.payload.conversationId] = action.payload.messages
        },
        pushMessages: (state, action) => {
            const { conversationId, messages } = action.payload;
            if (!state.messagesBySession[conversationId]) {
                state.messagesBySession[conversationId] = [];
            }
            state.messagesBySession[conversationId].push(messages);
        },
        clearMessages: (state) => {
            state.messagesBySession = {}
        },
        clearConversationMessages: (state, action: { payload: string }) => {
            delete state.messagesBySession[action.payload];
        },
        setArtifacts:(state,action)=>{
            state.latestArtifacts = action.payload
        }
    },
    extraReducers: (builder) => {
        builder
            // fetching messages for a session
            .addCase(fetchChatMessages.pending, (state) => {
                state.fetching = true;
                state.error = null;
            })
            .addCase(fetchChatMessages.fulfilled, (state, action) => {
              
                state.fetching = false;
                state.messagesBySession[action.payload.conversationId] = action.payload.messages;

                // set the latest artifacts
              const latestMessageWithArtifacts = [...action.payload.messages]
                    .reverse()
                    .find(
                        (msg: ChatMessageData) =>
                        msg.artifacts && msg.artifacts.length > 0
                    );
                state.latestArtifacts = latestMessageWithArtifacts?.artifacts || [];

            

            })
            .addCase(fetchChatMessages.rejected, (state, action) => {
                state.fetching = false;
                state.error = action.payload as string;
            })

            // sending a message
            .addCase(sendChatMessage.pending, (state) => {
                state.sending = true;
                state.error = null;
            })
            .addCase(sendChatMessage.fulfilled, (state, action) => {
                const { conversationId, message } = action.payload;
                state.sending = false;
                if (!message) return;

                if (!state.messagesBySession[conversationId]) {
                    state.messagesBySession[conversationId] = [];
                }
                state.messagesBySession[conversationId].push(message);

                if (message.artifacts && message.artifacts.length > 0) {
                    state.latestArtifacts = message.artifacts;
                }
            })
            .addCase(sendChatMessage.rejected, (state, action) => {
                state.sending = false;
                state.error = action.payload as string;
            })
    }
})

export const {
    setMessages,
    clearMessages,
    clearConversationMessages,
    pushMessages,
    setArtifacts
} = messageSlice.actions;
export default messageSlice.reducer