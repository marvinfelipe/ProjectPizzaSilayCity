// src/main.js
import { OrderService } from './services/OrderService.js';
import { UIService } from './services/UIService.js';

class App {
    constructor() {
        this.initializeApp();
    }

    async initializeApp() {
        try {
            this.orderService = new OrderService();
            this.uiService = new UIService(this.orderService);

            // Set up global error handling
            window.addEventListener('error', this.handleError.bind(this));
            window.addEventListener('unhandledrejection', this.handlePromiseError.bind(this));

            // Log successful initialization
            console.log('App initialized successfully');
        } catch (error) {
            console.error('Failed to initialize app:', error);
            this.handleError(error);
        }
    }

    handleError(event) {
        console.error('Global error:', event.error || event);
        if (this.uiService) {
            this.uiService.showErrorMessage('An unexpected error occurred. Please try again.');
        }
        event.preventDefault?.();
    }

    handlePromiseError(event) {
        console.error('Unhandled Promise rejection:', event.reason);
        if (this.uiService) {
            this.uiService.showErrorMessage('An unexpected error occurred. Please try again.');
        }
        event.preventDefault();
    }
}

// Initialize the app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.app = new App();
});