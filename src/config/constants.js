// src/config/constants.js
export const CONSTANTS = {
    FIREBASE: {
        COLLECTIONS: {
            ORDERS: 'orders',
            USERS: 'users',
            PRODUCTS: 'products'
        },
        BATCH_SIZE: 500
    },
    ORDER_STATUS: {
        PENDING: 'pending',
        PROCESSING: 'processing',
        COMPLETED: 'completed',
        CANCELLED: 'cancelled'
    },
    UI: {
        AUTOSAVE_INTERVAL: 30000,
        MODAL_TRANSITION: 300,
        MAX_RETRY_ATTEMPTS: 3
    },
    EXPORT: {
        FILENAME_PREFIX: 'PizzaHubSilay_',
        DATE_FORMAT: 'YYYY-MM-DD',
        CSV_HEADERS: [
            'ID', 'Date', 'Time_Placed', 'Time_Pickup', 
            'Customer_Name', 'Order_List', 'Order_Individual_Price', 
            'Order_Total', 'Phone_Number', 'Status'
        ]
    }
};

