import type { UserState } from '@/interfaces/user.interface';
import { createSlice } from '@reduxjs/toolkit';

import { sendChatMessage } from './messageSlice';
import { COST } from '@/utils/tokenCredits';


export const initialState: UserState = {
    _id: '',
    firebaseUUID: '',
    name: '',
    email: '',
    picture: '',
    credits: 0,
    planExpiresAt: null,
    planId: '',
    totalCredits: 0,
    isFreeEnd:false

}

export const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        setUser: (state, action) => {
            state._id = action.payload._id
            state.firebaseUUID = action.payload.firebaseUUID
            state.name = action.payload.name
            state.email = action.payload.email
            state.picture = action.payload.picture
            state.planId = action.payload.planId
            state.credits = action.payload.credits
            state.totalCredits = action.payload.totalCredits
            state.planExpiresAt = action.payload.planExpiresAt
            state.isFreeEnd = action.payload.isFreeEnd
        },
        clearUser: (state) => {
            state._id = ''
            state.firebaseUUID = ''
            state.name = ''
            state.email = ''
            state.picture = ''
            state.planId = ''
            state.credits = 0
            state.totalCredits = 0
            state.planExpiresAt = null
            state.isFreeEnd = false


        },
    },
    extraReducers:(builder)=>{
        builder
        .addCase(sendChatMessage.fulfilled,(state,action)=>{
            const agentId =action.payload.agentId;
   
            const cost = COST[agentId as keyof typeof COST]
            if(cost === undefined){
                 console.error(`Unknown agent id for credit deduction: ${agentId}`);
                return;
            }
            state.credits = Math.max(0,state.credits -cost)
            
        })

    }
})

export const { setUser, clearUser } = userSlice.actions
export default userSlice.reducer