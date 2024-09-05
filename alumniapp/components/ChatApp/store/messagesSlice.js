import { createSlice } from "@reduxjs/toolkit";

const messagesSlice = createSlice({
    name: "messages",
    initialState: {
        messagesData: {}
    },
    reducers: {
        setChatMessages: (state, action) => {
            const existingMessages = state.messagesData;

            const { chatId, messagesData } = action.payload;

            existingMessages[chatId] = messagesData;

            state.messagesData = existingMessages;
        }
    }
});
export const setChatMessages = messagesSlice.actions.setChatMessages;
export default messagesSlice.reducer;