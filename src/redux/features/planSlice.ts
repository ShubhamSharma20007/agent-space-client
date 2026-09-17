import { createAsyncThunk, createSlice, type Dispatch } from '@reduxjs/toolkit';
import planService from '@/services/plan.service';
import type { CreateOrder, PaymentState, VerifyPayment } from '@/types/chat';
export const createOrder = createAsyncThunk(
    'plan/createOrder',
    async (data: CreateOrder, {rejectWithValue}) => {
        try {
            const response = await planService.createPlan(data);
            return response;
        } catch (error:any) {
            return rejectWithValue(error?.response?.data?.message || "Failed to fetch messages");
        }

        
    }
)

export const verifyPayment = createAsyncThunk(
    'plan/verifyPayment',
    async (data: VerifyPayment, {rejectWithValue}) => {
        try {
            const response = await planService.verifyPayment(data);
            return response;
        } catch (error:any) {
            return rejectWithValue(error?.response?.data?.message || "Failed to fetch messages");
        }

        
    }
)


const initialState: PaymentState = {
    currentPlan: null,
    loading: false,
    error: null,
};


export const planSlice = createSlice({
    name: 'plan',
    initialState,
    reducers: {
        
    },
    extraReducers: (builder) => {
        // create order
        builder
            .addCase(createOrder.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(createOrder.fulfilled, (state, action) => {
                state.loading = false;
                state.currentPlan = action.payload;

                // do the verify payment
            })
            .addCase(createOrder.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string || "Failed to fetch messages";
            }) 
            

    }
})