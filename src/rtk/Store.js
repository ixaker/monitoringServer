import { configureStore } from '@reduxjs/toolkit';
// Import your reducers
import devicesReducer from './DevicesSlice';

const store = configureStore({
    reducer: {
        devices: devicesReducer,
    // Add more reducers as needed
    },
});

export default store;