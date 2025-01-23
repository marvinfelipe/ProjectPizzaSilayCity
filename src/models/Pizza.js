// src/models/Pizza.js
export class Pizza {
    constructor({
        id,
        name,
        brand,
        price,
        quantity = 0
    }) {
        this.id = id;
        this.name = name;
        this.brand = brand;
        this.price = price;
        this.quantity = quantity;
    }

    validate() {
        if (!this.name?.trim()) {
            throw new Error('Pizza name is required');
        }
        if (!this.brand?.trim()) {
            throw new Error('Brand is required');
        }
        if (typeof this.price !== 'number' || this.price <= 0) {
            throw new Error('Price must be a positive number');
        }
        return true;
    }

    updateQuantity(newQuantity) {
        if (newQuantity < 0) {
            throw new Error('Quantity cannot be negative');
        }
        this.quantity = newQuantity;
    }

    getSubtotal() {
        return this.price * this.quantity;
    }
}