import { configureStore } from '@reduxjs/toolkit'
import userReducer  from "./features/userSlice"
import conversationReducer from "./features/conversationSlice"
import messageReducer from "./features/messageSlice"
export const store = configureStore({
  reducer: {
    user: userReducer,
    conversations: conversationReducer,
    messages: messageReducer
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch