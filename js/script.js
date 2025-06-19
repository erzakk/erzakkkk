// ==== Основний скрипт сайту для LUIVA ====

document.addEventListener('DOMContentLoaded', () => {
    // ===== Клас кошика =====
    class ShoppingCart {
        constructor() {
            this.items = {};
            this.loadCartFromCookies();
        }

        addItem(item) {
            if (this.items[item.title]) {
                this.items[item.title].quantity += 1;
            } else {
                this.items[item.title] = { ...item, quantity: 1 };
            }
            this.saveCartToCookies();
        }

        saveCartToCookies() {
            let cartJSON = JSON.stringify(this.items);
            document.cookie = `cart=${cartJSON}; max-age=${60 * 60 * 24 * 7}; path=/`;
        }

        loadCartFromCookies() {
            let cartCookie = getCookieValue('cart');
            if (cartCookie && cartCookie !== '') {
                try {
                    this.items = JSON.parse(cartCookie);
                } catch (e) {
                    console.error("Неможливо розпарсити кукі кошика:", cartCookie, e);
                    this.items = {};
                }
            }
        }

        calculateTotal() {
            let total = 0;
            for (let key in this.items) {
                total += this.items[key].price * this.items[key].quantity;
            }
            return total;
        }
    }

    // ===== Допоміжні функції =====
    function getCookieValue(cookieName) {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.startsWith(cookieName + '=')) {
                return cookie.substring(cookieName.length + 1);
            }
        }
        return '';
    }

    async function getProducts() {
        let response = await fetch("store_db.json");
        let products = await response.json();
        return products;
    }

    function getCardHTML(product) {
        return `<div class="product-card">
                    <img src="img/${product.image}" alt="${product.title}">
                    <h3>${product.title}</h3>
                    <p>${product.description}</p>
                    <span class="price">$${product.price}</span>
                    <button class="btn" data-product='${JSON.stringify(product)}'>Add to Cart</button>
                </div>`;
    }

    // ===== Ініціалізація =====
    const cart = new ShoppingCart();

    const productGrid = document.querySelector('.product-grid');
    if (productGrid) {
        getProducts().then(products => {
            products.forEach(product => {
                productGrid.innerHTML += getCardHTML(product);
            });

            // Додаємо обробники кнопок після рендеру
            document.querySelectorAll('.btn').forEach(button => {
                button.addEventListener('click', function (e) {
                    const product = JSON.parse(e.target.getAttribute('data-product'));
                    cart.addItem(product);
                    // alert(`"${product.title}" додано до кошика!`);
                });
            });
        });
    }

    // Кнопка переходу до кошика
    const cartBtn = document.getElementById('cartBtn');
    if (cartBtn) {
        cartBtn.addEventListener('click', function (e) {
            e.preventDefault();
            window.location.assign('koshuk.html');
        });
    }

    // ===== Логіка сторінки кошика =====
    const cart_list = document.querySelector('.cart-items');
    const cart_total = document.querySelector('.cart-total');
    const orderBtn = document.querySelector('#orderBtn');
    const orderSection = document.querySelector('.order');

    if (cart_list && cart_total) {
        showCartList();

        function get_item(item) {
            return `<div class="cart-item">
                <img src="img/${item.image}" class="item-image">
                <div class="item-details">
                    <div class="item-title">${item.title}</div>
                    <div class="item-price">$${item.price}</div>
                    <div class="item-actions">
                        <div class="quantity-selector">
                            <button class="quantity-btn" data-action="decrease" data-title="${item.title}">-</button>
                            <input type="number" value="${item.quantity}" min="1" class="quantity-input" readonly>
                            <button class="quantity-btn" data-action="increase" data-title="${item.title}">+</button>
                        </div>
                        <button class="remove-btn" data-title="${item.title}">Remove</button>
                    </div>
                </div>
            </div>`;
        }

        function showCartList() {
            cart_list.innerHTML = '';
            for (let key in cart.items) {
                cart_list.innerHTML += get_item(cart.items[key]);
            }
            cart_total.innerHTML = `$${cart.calculateTotal().toFixed(2)}`;
        }

        // Обробка дій: +, -, Remove
        document.addEventListener('click', function (e) {
            const title = e.target.dataset.title;
            if (!title) return;

            if (e.target.dataset.action === 'increase') {
                cart.items[title].quantity += 1;
            } else if (e.target.dataset.action === 'decrease') {
                if (cart.items[title].quantity > 1) {
                    cart.items[title].quantity -= 1;
                }
            } else if (e.target.classList.contains('remove-btn')) {
                delete cart.items[title];
            }

            cart.saveCartToCookies();
            showCartList();
        });

        if (orderBtn) {
            orderBtn.addEventListener('click', function (e) {
                e.preventDefault();
                cart.items = {};
                cart.saveCartToCookies();
                showCartList();
                if (orderSection) orderSection.style.display = 'block';
            });
        }
    }
});

// Додати на початок вашого існуючого скрипта
const themeToggle = document.getElementById('themeToggle');

function applyTheme(theme) {
    if (theme === 'dark') {
        document.body.classList.add('dark-mode');
    } else {
        document.body.classList.remove('dark-mode');
    }
    localStorage.setItem('siteTheme', theme);
}

// Автоматичне визначення системної теми
const systemTheme = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
const savedTheme = localStorage.getItem('siteTheme') || systemTheme;
applyTheme(savedTheme);

if (themeToggle) {
    themeToggle.addEventListener('click', () => {
        const isDark = document.body.classList.contains('dark-mode');
        applyTheme(isDark ? 'light' : 'dark');
    });
}

// Слухач змін системної теми
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
    if (!localStorage.getItem('siteTheme')) {
        applyTheme(e.matches ? 'dark' : 'light');
    }
});
