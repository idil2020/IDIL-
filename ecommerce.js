const products = [
    {
        id: "studio-headphones",
        name: "Studio Headphones",
        category: "Tech",
        price: 189,
        icon: "🎧",
        description: "Comfortable sound for work and downtime."
    },
    {
        id: "everyday-backpack",
        name: "Everyday Backpack",
        category: "Everyday",
        price: 145,
        icon: "🎒",
        description: "A roomy, lightweight carry-all."
    },
    {
        id: "orbit-desk-lamp",
        name: "Orbit Desk Lamp",
        category: "Workspace",
        price: 119,
        icon: "💡",
        description: "A warm glow for your favourite workspace."
    },
    {
        id: "weekend-bottle",
        name: "Weekend Bottle",
        category: "Everyday",
        price: 49,
        icon: "🧴",
        description: "A reusable companion for busy days."
    },
    {
        id: "compact-keyboard",
        name: "Compact Keyboard",
        category: "Tech",
        price: 159,
        icon: "⌨️",
        description: "A neat setup for focused work."
    },
    {
        id: "soft-notebook",
        name: "Softcover Notebook",
        category: "Workspace",
        price: 29,
        icon: "📔",
        description: "A little space for your next big idea."
    }
];

const productGrid = document.getElementById("product-grid");
const productSearch = document.getElementById("product-search");
const emptyProducts = document.getElementById("product-empty");
const categoryButtons = document.querySelectorAll(".category-button");
const cartItems = document.getElementById("cart-items");
const cartEmpty = document.getElementById("cart-empty");
const cartCount = document.getElementById("cart-count");
const headerCartCount = document.getElementById("header-cart-count");
const cartSubtotal = document.getElementById("cart-subtotal");
const checkoutButton = document.getElementById("checkout-button");
const storeStatus = document.getElementById("store-status");
const cart = new Map();
const money = new Intl.NumberFormat("en-MY", {
    style: "currency",
    currency: "MYR"
});

let activeCategory = "All";
let statusTimer;

function makeElement(tag, className, text) {
    const element = document.createElement(tag);
    if (className) {
        element.className = className;
    }
    if (text !== undefined) {
        element.textContent = text;
    }
    return element;
}

function showStatus(message) {
    storeStatus.textContent = message;
    window.clearTimeout(statusTimer);
    statusTimer = window.setTimeout(function() {
        storeStatus.textContent = "";
    }, 3500);
}

function renderProducts() {
    const query = productSearch.value.trim().toLowerCase();
    const visibleProducts = products.filter(function(product) {
        const matchesCategory = activeCategory === "All" || product.category === activeCategory;
        const matchesSearch = (product.name + " " + product.description + " " + product.category)
            .toLowerCase()
            .includes(query);
        return matchesCategory && matchesSearch;
    });

    productGrid.replaceChildren();
    emptyProducts.hidden = visibleProducts.length > 0;

    visibleProducts.forEach(function(product) {
        const card = makeElement("article", "product-card");
        const art = makeElement("div", "product-art", product.icon);
        art.setAttribute("aria-hidden", "true");

        const info = makeElement("div", "product-info");
        info.appendChild(makeElement("p", "product-category", product.category));
        info.appendChild(makeElement("h3", "", product.name));
        info.appendChild(makeElement("p", "product-description", product.description));

        const buyRow = makeElement("div", "product-buy-row");
        buyRow.appendChild(makeElement("span", "product-price", money.format(product.price)));

        const button = makeElement("button", "add-to-cart", "Add to bag");
        button.type = "button";
        button.dataset.productId = product.id;
        button.setAttribute("aria-label", "Add " + product.name + " to bag");
        buyRow.appendChild(button);
        info.appendChild(buyRow);
        card.append(art, info);
        productGrid.appendChild(card);
    });
}

function createCartItem(product, quantity) {
    const item = makeElement("li", "cart-item");
    const art = makeElement("span", "cart-item-art", product.icon);
    art.setAttribute("aria-hidden", "true");

    const details = makeElement("div", "");
    details.appendChild(makeElement("p", "cart-item-name", product.name));
    details.appendChild(makeElement("span", "cart-item-price", money.format(product.price)));

    const controls = makeElement("div", "quantity-controls");
    const decrease = makeElement("button", "", "−");
    decrease.type = "button";
    decrease.dataset.cartAction = "decrease";
    decrease.dataset.productId = product.id;
    decrease.setAttribute("aria-label", "Remove one " + product.name);

    const quantityText = makeElement("span", "", String(quantity));

    const increase = makeElement("button", "", "+");
    increase.type = "button";
    increase.dataset.cartAction = "increase";
    increase.dataset.productId = product.id;
    increase.setAttribute("aria-label", "Add one " + product.name);

    controls.append(decrease, quantityText, increase);
    item.append(art, details, controls);
    return item;
}

function renderCart() {
    let itemCount = 0;
    let subtotal = 0;
    cartItems.replaceChildren();

    cart.forEach(function(quantity, productId) {
        const product = products.find(function(item) {
            return item.id === productId;
        });
        if (!product) {
            return;
        }

        itemCount += quantity;
        subtotal += product.price * quantity;
        cartItems.appendChild(createCartItem(product, quantity));
    });

    cartEmpty.hidden = itemCount > 0;
    cartCount.textContent = String(itemCount);
    headerCartCount.textContent = String(itemCount);
    headerCartCount.setAttribute("aria-label", itemCount + (itemCount === 1 ? " item" : " items"));
    cartSubtotal.textContent = money.format(subtotal);
    checkoutButton.disabled = itemCount === 0;
}

categoryButtons.forEach(function(button) {
    button.addEventListener("click", function() {
        activeCategory = button.dataset.category;
        categoryButtons.forEach(function(categoryButton) {
            const isActive = categoryButton === button;
            categoryButton.classList.toggle("active", isActive);
            categoryButton.setAttribute("aria-pressed", String(isActive));
        });
        renderProducts();
    });
});

productSearch.addEventListener("input", renderProducts);

productGrid.addEventListener("click", function(event) {
    const button = event.target.closest("button[data-product-id]");
    if (!button) {
        return;
    }

    const product = products.find(function(item) {
        return item.id === button.dataset.productId;
    });
    if (!product) {
        return;
    }

    cart.set(product.id, (cart.get(product.id) || 0) + 1);
    renderCart();
    showStatus(product.name + " added to your bag.");
});

cartItems.addEventListener("click", function(event) {
    const button = event.target.closest("button[data-cart-action]");
    if (!button) {
        return;
    }

    const product = products.find(function(item) {
        return item.id === button.dataset.productId;
    });
    const quantity = cart.get(button.dataset.productId);
    if (!product || !quantity) {
        return;
    }

    if (button.dataset.cartAction === "increase") {
        cart.set(product.id, quantity + 1);
    } else if (button.dataset.cartAction === "decrease") {
        if (quantity === 1) {
            cart.delete(product.id);
        } else {
            cart.set(product.id, quantity - 1);
        }
    } else {
        return;
    }

    renderCart();
});

checkoutButton.addEventListener("click", function() {
    if (cart.size > 0) {
        showStatus("This is a portfolio demo. Checkout and payments are not connected.");
    }
});

renderProducts();
renderCart();
