// js/utils/validators.js
export function validateOrder(order) {
    return (
        order.customerName &&
        order.phoneNumber &&
        order.orderType &&
        order.pizzas.length > 0
    );
}