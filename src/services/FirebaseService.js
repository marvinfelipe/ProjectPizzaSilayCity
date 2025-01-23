// src/services/FirebaseService.js
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.0/firebase-app.js';
import { getDatabase, ref, set, onValue, remove } from 'https://www.gstatic.com/firebasejs/10.7.0/firebase-database.js';
import { firebaseConfig } from '../config/firebase.js';

export class FirebaseService {
    constructor() {
        if (!window.firebaseApp) {
            window.firebaseApp = initializeApp(firebaseConfig);
        }
        this.database = getDatabase(window.firebaseApp);
    }

    async saveOrder(order, path) {
        try {
            const orderRef = ref(this.database, `${path}/${order.id}`);
            await set(orderRef, {
                customerInfo: order.customerInfo,
                items: order.items,
                orderDetails: order.orderDetails
            });
        } catch (error) {
            console.error('Firebase save error:', error);
            throw new Error(`Failed to save order: ${error.message}`);
        }
    }

    async deleteOrder(orderId, path) {
        try {
            const orderRef = ref(this.database, `${path}/${orderId}`);
            await remove(orderRef);
        } catch (error) {
            console.error('Firebase delete error:', error);
            throw new Error(`Failed to delete order: ${error.message}`);
        }
    }

    subscribeToOrders(callback) {
        // Listen to the entire orders node
        const ordersRef = ref(this.database);
        return onValue(ordersRef, (snapshot) => {
            const data = snapshot.val() || { orders: { pendingOrders: {}, completedOrders: {} } };
            callback(data);
        }, (error) => {
            console.error('Firebase subscription error:', error);
            throw error;
        });
    }
}