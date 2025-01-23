// src/services/UIService.js
import { pizzaData } from "../data/pizzaData.js";
import { formatCurrency } from "../utils/formatters.js";

export class UIService {
  constructor(orderService) {
    this.orderService = orderService;
    this.setupEventListeners();
    this.renderPizzaSections();
    this.setupOrderServiceListeners();
  }

  setupEventListeners() {
    // Use optional chaining and store bound methods
    this.handleSubmit = this.handleOrderSubmit.bind(this);
    this.handleToggle = this.toggleCompletedOrders.bind(this);

    const orderForm = document.getElementById("orderForm");
    const toggleBtn = document.getElementById("toggleCompleted");
    const exportBtn = document.getElementById("exportOrders");
    const clearBtn = document.getElementById("clearCompleted");

    if (orderForm) {
      orderForm.addEventListener("submit", this.handleSubmit);
    }

    if (toggleBtn) {
      toggleBtn.addEventListener("click", this.handleToggle);
    }

    if (exportBtn) {
      exportBtn.addEventListener("click", () =>
        this.orderService.exportOrders()
      );
    }

    if (clearBtn) {
      clearBtn.addEventListener("click", () =>
        this.orderService.clearCompletedOrders()
      );
    }

    // Order type radio buttons
    const deliveryRadio = document.getElementById("deliveryOrder");
    const pickupRadio = document.getElementById("pickupOrder");

    if (deliveryRadio) {
      deliveryRadio.addEventListener("change", () =>
        this.toggleDeliverySection(true)
      );
    }

    if (pickupRadio) {
      pickupRadio.addEventListener("change", () =>
        this.toggleDeliverySection(false)
      );
    }
  }

  setupOrderServiceListeners() {
    this.orderService.on("loading", (isLoading) => {
        this.toggleLoadingSpinner(isLoading);
    });

    this.orderService.on("error", (error) => {
        this.showErrorMessage(error.message);
    });

    // Updated to handle Firebase data subscription
    this.orderService.on(
        "ordersUpdated",
        ({ pendingOrders, completedOrders }) => {
            // Directly render orders fetched from Firebase
            this.renderPendingOrders(pendingOrders);
            this.renderCompletedOrders(completedOrders);
        }
    );

    this.orderService.on("orderCreated", () => {
        this.showSuccessMessage("Order placed successfully!");
        this.resetForm();
    });
}


  async handleOrderSubmit(event) {
    event.preventDefault();
    const formData = this.getFormData();

    try {
      await this.orderService.createOrder(formData);
    } catch (error) {
      this.showErrorMessage(error.message);
    }
  }

  renderPizzaSections() {
    const container = document.getElementById("pizzaSections");
    if (!container) return;

    const brands = [...new Set(pizzaData.map((pizza) => pizza.brand))];
    container.innerHTML = "";

    brands.forEach((brand) => {
      const section = this.createBrandSection(brand);
      container.appendChild(section);
    });

    this.updateTotal();
  }

  createBrandSection(brand) {
    const section = document.createElement("div");
    section.className = "brand-section";
    section.innerHTML = `<h2>${brand}</h2>`;

    const grid = document.createElement("div");
    grid.className = "pizza-grid";

    pizzaData
      .filter((pizza) => pizza.brand === brand)
      .forEach((pizza) => {
        grid.appendChild(this.createPizzaItem(pizza));
      });

    section.appendChild(grid);
    return section;
  }

  // Replace the createPizzaItem method in UIService.js
  createPizzaItem(pizza) {
    const item = document.createElement("div");
    item.className = "pizza-item";
    item.innerHTML = `
        <div class="pizza-info">
            <span class="pizza-name">${pizza.name}</span>
            <span class="price">${formatCurrency(pizza.price)}</span>
        </div>
        <div class="quantity-wrapper">
            <div class="quantity-control">
                <input 
                    type="number" 
                    id="qty-${pizza.id}" 
                    value="0" 
                    min="0" 
                    onchange="window.app.uiService.updateQuantity('${
                      pizza.id
                    }')"
                >
            </div>
            <button class="minus-button" onclick="window.app.uiService.decrementQuantity('${
              pizza.id
            }')">-</button>
        </div>
    `;

    // Add click event listener to the entire pizza item
    item.addEventListener("click", (event) => {
      // Don't increment if clicking the minus button or input
      if (
        !event.target.matches(".minus-button") &&
        !event.target.matches("input")
      ) {
        const input = item.querySelector(`#qty-${pizza.id}`);
        if (input) {
          const currentValue = parseInt(input.value) || 0;
          input.value = currentValue + 1;
          this.updateQuantity(pizza.id);
        }
      }
    });

    // Prevent input click from triggering item click
    const input = item.querySelector("input");
    if (input) {
      input.addEventListener("click", (event) => {
        event.stopPropagation();
      });
    }

    // Prevent minus button click from triggering item click
    const minusButton = item.querySelector(".minus-button");
    if (minusButton) {
      minusButton.addEventListener("click", (event) => {
        event.stopPropagation();
      });
    }

    return item;
  }

  updateQuantity(pizzaId) {
    const input = document.getElementById(`qty-${pizzaId}`);
    if (!input) return;

    const qty = Math.max(0, parseInt(input.value) || 0);
    input.value = qty;

    this.updatePizzaItemStyle(pizzaId, qty);
    this.updateTotal();
  }

  decrementQuantity(pizzaId) {
    const input = document.getElementById(`qty-${pizzaId}`);
    if (!input) return;

    const currentQty = parseInt(input.value) || 0;
    if (currentQty > 0) {
      input.value = currentQty - 1;
      this.updateQuantity(pizzaId);
    }
  }

  updatePizzaItemStyle(pizzaId, quantity) {
    const item = document
      .getElementById(`qty-${pizzaId}`)
      ?.closest(".pizza-item");
    if (!item) return;

    const minusButton = item.querySelector(".minus-button");

    item.style.backgroundColor = quantity > 0 ? "#ffd269" : "";
    if (minusButton) {
      minusButton.style.display = quantity > 0 ? "flex" : "none";
    }
  }

  updateTotal() {
    const totalElement = document.getElementById("totalAmount");
    if (!totalElement) return;

    const total = pizzaData.reduce((sum, pizza) => {
      const qty = parseInt(
        document.getElementById(`qty-${pizza.id}`)?.value || "0"
      );
      return sum + pizza.price * qty;
    }, 0);

    totalElement.textContent = formatCurrency(total);
  }

  toggleDeliverySection(show) {
    const section = document.getElementById("deliverySection");
    if (section) {
      section.classList.toggle("hidden", !show);
    }
  }

  getFormData() {
    const pizzas = pizzaData
      .map((pizza) => ({
        id: pizza.id,
        name: pizza.name,
        price: pizza.price,
        quantity: parseInt(
          document.getElementById(`qty-${pizza.id}`)?.value || "0"
        ),
      }))
      .filter((pizza) => pizza.quantity > 0);

    return {
      customerName: document.getElementById("customerName")?.value,
      phoneNumber: document.getElementById("phoneNumber")?.value,
      orderType: document.querySelector('input[name="orderType"]:checked')
        ?.value,
      location: document.getElementById("location")?.value,
      pickupTime: document.getElementById("pickupTime")?.value,
      pizzas,
    };
  }

  resetForm() {
    const form = document.getElementById("orderForm");
    if (form) {
      form.reset();
      pizzaData.forEach((pizza) => {
        const input = document.getElementById(`qty-${pizza.id}`);
        if (input) {
          input.value = "0";
          this.updatePizzaItemStyle(pizza.id, 0);
        }
      });
      this.updateTotal();
      this.toggleDeliverySection(false);
    }
  }

  toggleLoadingSpinner(show) {
    const spinner = document.getElementById("loadingSpinner");
    if (spinner) {
      spinner.classList.toggle("hidden", !show);
    }
  }

  showErrorMessage(message) {
    this.showToast(message, "error");
  }

  showSuccessMessage(message) {
    this.showToast(message, "success");
  }

  showToast(message, type = "info") {
    const toast = document.createElement("div");
    toast.className = `toast toast-${type}`;
    toast.textContent = message;

    const container = document.getElementById("toastContainer");
    if (container) {
      container.appendChild(toast);
      setTimeout(() => {
        toast.classList.add("fade-out");
        setTimeout(() => container.removeChild(toast), 300);
      }, 3000);
    }
  }

  toggleCompletedOrders() {
    const completedList = document.getElementById("completedOrders");
    const toggleBtn = document.getElementById("toggleCompleted");

    if (completedList && toggleBtn) {
      const isHidden = completedList.classList.contains("hidden");
      completedList.classList.toggle("hidden");
      toggleBtn.textContent = isHidden
        ? "Hide Completed Orders"
        : "Show Completed Orders";
    }
  }

  renderPendingOrders(orders) {
    const container = document.getElementById("pendingOrders");
    if (!container) return;

    container.innerHTML = orders.length ? "" : "<p>No pending orders</p>";
    orders.forEach((order) => {
      container.appendChild(this.createOrderElement(order));
    });
  }

  renderCompletedOrders(orders) {
    const container = document.getElementById("completedOrders");
    if (!container) return;

    container.innerHTML = orders.length ? "" : "<p>No completed orders</p>";
    orders.forEach((order) => {
      container.appendChild(this.createOrderElement(order, true));
    });
  }

  // In UIService.js - updated createOrderElement method
  createOrderElement(order, isCompleted = false) {
    const element = document.createElement("div");
    element.className = "order-item";

    // Extract data from Firebase order structure
    const customerName = order.customerInfo?.name || 'Unknown Customer';
    const phoneNumber = order.customerInfo?.phoneNumber || 'No Phone';
    const orderDetails = order.orderDetails || {};
    const orderType = orderDetails.orderType || 'Not Specified';
    const pickupTime = orderDetails.pickupTime || 'Not Specified';
    const location = orderDetails.location || '';

    // Calculate total from items
    const orderTotal = orderDetails.total || 
        (order.items || []).reduce((sum, item) => 
            sum + (item.price * item.quantity), 0);

    element.innerHTML = `
        <h3>${customerName} | ${phoneNumber}</h3>
        <p><strong>Order Type:</strong> ${orderType}</p>
        ${location ? `<p><strong>Location:</strong> ${location}</p>` : ''}
        <p><strong>Time:</strong> ${pickupTime}</p>
        <h4>Order Details:</h4>
        <ul>
            ${(order.items || []).length > 0 
                ? (order.items || []).map(
                    (item) => `
                    <li>${item.quantity}x ${item.name} (${formatCurrency(
                        item.price * item.quantity
                    )})</li>
                `
                ).join("")
                : "<li>No items in order</li>"}
        </ul>
        <p><strong>Total:</strong> ${formatCurrency(orderTotal)}</p>
        ${
          !isCompleted
            ? `
            <div class="action-buttons">
                <button class="button button-primary complete-order-btn" data-order-id="${order.id}">
                    Complete Order
                </button>
            </div>
        `
            : ""
        }
    `;

    // Add click handler for complete button
    if (!isCompleted) {
      const completeBtn = element.querySelector(".complete-order-btn");
      if (completeBtn) {
        completeBtn.addEventListener("click", async () => {
          try {
            await this.orderService.completeOrder(order.id);
          } catch (error) {
            this.showErrorMessage(error.message);
          }
        });
      }
    }

    return element;
}
}