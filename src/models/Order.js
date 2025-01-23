// src/models/Order.js
import { CONSTANTS } from '../config/constants.js';

export class Order {
    constructor({
        id = Date.now(),
        customerInfo = {
            name: '',
            phoneNumber: ''
        },
        items = [],
        orderDetails = {
            orderDate: new Date().toLocaleString(),
            orderType: '',
            pickupTime: '',
            status: CONSTANTS.ORDER_STATUS.PENDING,
            total: 0
        }
    }) {
        this.id = String(id);
        this.customerInfo = customerInfo;
        this.items = Array.isArray(items) ? items : [];
        this.orderDetails = orderDetails;
    }

    validate() {
        if (!this.customerInfo?.name?.trim()) {
            throw new Error('Customer name is required');
        }
        if (!this.customerInfo?.phoneNumber?.trim()) {
            throw new Error('Phone number is required');
        }
        if (!this.orderDetails?.orderType?.trim()) {
            throw new Error('Order type is required');
        }
        if (!this.orderDetails?.pickupTime?.trim()) {
            throw new Error('Pickup/delivery time is required');
        }
        if (!Array.isArray(this.items) || this.items.length === 0) {
            throw new Error('At least one item must be selected');
        }
        return true;
    }

    toJSON() {
        return {
            id: this.id,
            customerInfo: this.customerInfo,
            items: this.items,
            orderDetails: this.orderDetails
        };
    }

    static fromFirebase(id, data) {
        return new Order({
            id,
            customerInfo: data.customerInfo,
            items: data.items,
            orderDetails: data.orderDetails
        });
    }
}