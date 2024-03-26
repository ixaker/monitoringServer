import { createSlice } from '@reduxjs/toolkit';

const initialDevices = [
    {
        id: '1',
        name: 'Computer 1',
        discs: [
            {
                name: "c",
                size: 120,
                use: 70,
                cript: true,
                block: true
            },
            {
                name: "d",
                size: 130,
                use: 40,
                cript: false,
                block: true
            }
        ]
    },
    {
        id: '2',
        name: 'Computer 2',
        discs: [
            {
                name: "c",
                size: 130,
                use: 40,
                cript: true,
                block: false
            }
        ]
    }
];

const devicesSlice = createSlice({
        name: 'devices',
        initialState: initialDevices,
        reducers: {
            addDevice: (state, action) => {
                state.push(action.payload)
            },
            removeDevice: (state, action) => {
                const index = state.findIndex( device => device.id === action.payload.id);
                if (index !== -1) {
                    state.splice(index, 1);
                }
            }
        },
    });

export const { addDevice, removeDevice } = devicesSlice.actions;
export default devicesSlice.reducer;