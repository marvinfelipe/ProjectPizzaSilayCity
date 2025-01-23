// src/services/OrderService.js
import { Order } from '../models/Order.js';
import { FirebaseService } from './FirebaseService.js';
import { CONSTANTS } from '../config/constants.js';
import { EventEmitter } from '../utils/EventEmitter.js';

export class OrderService extends EventEmitter {
    constructor() {
        super();
        this.firebaseService = new FirebaseService();
        this.pendingOrders = [];
        this.completedOrders = [];
        this.setupFirebaseSubscription();
    }

    setupFirebaseSubscription() {
        this.firebaseService.subscribeToOrders((ordersData) => {
            this.updateOrders(ordersData);
        });
    }

    async createOrder(orderData) {
        try {
            this.emit('loading', true);
            
            const formattedData = {
                customerInfo: {
                    name: orderData.customerName,
                    phoneNumber: orderData.phoneNumber
                },
                items: orderData.pizzas.map(pizza => ({
                    id: pizza.id,
                    name: pizza.name,
                    price: pizza.price,
                    quantity: pizza.quantity
                })),
                orderDetails: {
                    orderDate: new Date().toISOString(),
                    orderType: orderData.orderType,
                    pickupTime: orderData.pickupTime,
                    location: orderData.location || '',
                    status: CONSTANTS.ORDER_STATUS.PENDING,
                    total: orderData.pizzas.reduce((sum, pizza) => sum + (pizza.price * pizza.quantity), 0)
                }
            };

            const order = new Order(formattedData);
            order.validate();

            // Save to pendingOrders under the orders root
            await this.firebaseService.saveOrder(order, 'pendingOrders');
            
            this.pendingOrders.push(order);
            this.emit('orderCreated', order);
            return order;
        } catch (error) {
            this.emit('error', error);
            throw error;
        } finally {
            this.emit('loading', false);
        }
    }

    async completeOrder(orderId) {
        try {
            this.emit('loading', true);

            const order = this.pendingOrders.find(o => String(o.id) === String(orderId));
            if (!order) {
                throw new Error('Order not found');
            }

            order.orderDetails.status = CONSTANTS.ORDER_STATUS.COMPLETED;
            order.orderDetails.completedAt = new Date().toISOString();

            // Update in Firebase under the orders root
            await Promise.all([
                this.firebaseService.deleteOrder(orderId, 'pendingOrders'),
                this.firebaseService.saveOrder(order, 'completedOrders')
            ]);

            this.pendingOrders = this.pendingOrders.filter(o => String(o.id) !== String(orderId));
            this.completedOrders.push(order);
            
            this.emit('orderCompleted', order);
            return order;

        } catch (error) {
            this.emit('error', error);
            throw error;
        } finally {
            this.emit('loading', false);
        }
    }

    updateOrders(ordersData) {
        if (!ordersData) return;

        const pending = [];
        const completed = [];

        // Handle pending orders
        if (ordersData.pendingOrders) {
            Object.entries(ordersData.pendingOrders).forEach(([id, data]) => {
                pending.push(Order.fromFirebase(id, data));
            });
        }

        // Handle completed orders
        if (ordersData.completedOrders) {
            Object.entries(ordersData.completedOrders).forEach(([id, data]) => {
                completed.push(Order.fromFirebase(id, data));
            });
        }

        this.pendingOrders = pending;
        this.completedOrders = completed;
        
        this.emit('ordersUpdated', {
            pendingOrders: pending,
            completedOrders: completed
        });
    }
}