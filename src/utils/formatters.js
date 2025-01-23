// src/utils/formatters.js
export const formatCurrency = (amount) => {
    return `₱${Number(amount).toFixed(2)}`;
};

export const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-PH', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
};

