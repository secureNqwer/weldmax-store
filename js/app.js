// ГЛАВНЫЙ СКРИПТ ИНТЕРНЕТ-МАГАЗИНА WELDMAX

document.addEventListener("DOMContentLoaded", () => {
    initSparkles();
    initHeaderScroll();
    initThemeToggle();
    
    // Инициализация компонентов магазина
    catalog.init();
    cart.init();
    compare.init();
    checkout.init();
});

/* ==================== 1. ЭФФЕКТ ИСКР (SPARK PARTICLES) ==================== */
function initSparkles() {
    const container = document.getElementById("sparkles-bg");
    if (!container) return;
    
    const maxParticles = 30;
    
    function createParticle() {
        if (container.children.length >= maxParticles) return;
        
        const particle = document.createElement("div");
        particle.classList.add("sparkle-particle");
        
        const size = Math.random() * 3 + 1; // 1px - 4px
        const left = Math.random() * 100; // 0% - 100%
        const delay = Math.random() * 5; // Задержка
        const duration = Math.random() * 4 + 3; // Скорость подъема 3s - 7s
        const drift = (Math.random() * 100 - 50) + "px"; // Отклонение по горизонтали
        
        particle.style.width = size + "px";
        particle.style.height = size + "px";
        particle.style.left = left + "%";
        particle.style.animationDelay = delay + "s";
        particle.style.animationDuration = duration + "s";
        particle.style.setProperty("--drift", drift);
        
        container.appendChild(particle);
        
        // Удаляем частицу после окончания анимации
        setTimeout(() => {
            particle.remove();
        }, (delay + duration) * 1000);
    }
    
    // Создаем начальный набор частиц
    for (let i = 0; i < 15; i++) {
        createParticle();
    }
    
    // Генерируем новые частицы
    setInterval(createParticle, 500);
}

/* ==================== 2. СЖАТИЕ ШАПКИ НА СКРОЛЛЕ ==================== */
function initHeaderScroll() {
    const header = document.getElementById("header");
    if (!header) return;
    
    window.addEventListener("scroll", () => {
        if (window.scrollY > 50) {
            header.classList.add("shrink");
        } else {
            header.classList.remove("shrink");
        }
    });
}

/* ==================== 3. СМЕНА ТЕМЫ ОФОРМЛЕНИЯ (DARK/LIGHT) ==================== */
function initThemeToggle() {
    const themeBtn = document.getElementById("theme-btn");
    if (!themeBtn) return;
    
    // Проверяем сохраненную тему
    const savedTheme = localStorage.getItem("weldmax-theme") || "dark";
    if (savedTheme === "light") {
        document.body.classList.remove("dark-theme");
        document.body.classList.add("light-theme");
    }
    
    themeBtn.addEventListener("click", () => {
        if (document.body.classList.contains("dark-theme")) {
            document.body.classList.remove("dark-theme");
            document.body.classList.add("light-theme");
            localStorage.setItem("weldmax-theme", "light");
        } else {
            document.body.classList.remove("light-theme");
            document.body.classList.add("dark-theme");
            localStorage.setItem("weldmax-theme", "dark");
        }
    });
}

/* ==================== 4. УПРАВЛЕНИЕ КАТАЛОГОМ (ФИЛЬТРЫ И СОРТИРОВКА) ==================== */
const catalog = {
    selectedCategory: "all",
    searchQuery: "",
    minPrice: 0,
    maxPrice: 60000,
    sortBy: "default",
    
    init() {
        this.grid = document.getElementById("products-grid");
        this.foundText = document.getElementById("products-found-text");
        this.categoryBtns = document.querySelectorAll("#categories-filter .category-btn");
        this.searchField = document.getElementById("global-search");
        
        this.priceMinInput = document.getElementById("price-min");
        this.priceMaxInput = document.getElementById("price-max");
        this.priceRange = document.getElementById("price-range");
        this.resetBtn = document.getElementById("reset-filters-btn");
        this.sortSelect = document.getElementById("sort-select");
        
        if (!this.grid) return;
        
        this.bindEvents();
        this.render();
    },
    
    bindEvents() {
        // Клик по категориям
        this.categoryBtns.forEach(btn => {
            btn.addEventListener("click", (e) => {
                this.categoryBtns.forEach(b => b.classList.remove("active"));
                btn.classList.add("active");
                this.selectedCategory = btn.dataset.category;
                this.render();
            });
        });
        
        // Поиск по названию
        this.searchField.addEventListener("input", (e) => {
            this.searchQuery = e.target.value.toLowerCase().trim();
            this.render();
        });
        
        // Слайдер диапазона цены
        this.priceRange.addEventListener("input", (e) => {
            const val = parseInt(e.target.value);
            this.priceMaxInput.value = val;
            this.maxPrice = val;
            this.render();
        });
        
        // Ручной ввод цен
        this.priceMinInput.addEventListener("change", (e) => {
            this.minPrice = parseInt(e.target.value) || 0;
            this.render();
        });
        
        this.priceMaxInput.addEventListener("change", (e) => {
            const val = parseInt(e.target.value) || 60000;
            this.maxPrice = val;
            this.priceRange.value = val;
            this.render();
        });
        
        // Сортировка
        this.sortSelect.addEventListener("change", (e) => {
            this.sortBy = e.target.value;
            this.render();
        });
        
        // Сброс фильтров
        this.resetBtn.addEventListener("click", () => {
            this.selectedCategory = "all";
            this.searchQuery = "";
            this.minPrice = 0;
            this.maxPrice = 60000;
            this.sortBy = "default";
            
            // Сброс UI
            this.categoryBtns.forEach(b => b.classList.remove("active"));
            this.categoryBtns[0].classList.add("active");
            this.searchField.value = "";
            this.priceMinInput.value = 0;
            this.priceMaxInput.value = 60000;
            this.priceRange.value = 60000;
            this.sortSelect.value = "default";
            
            this.render();
        });
    },
    
    getFilteredProducts() {
        let filtered = PRODUCTS.filter(prod => {
            // Фильтр по категории
            if (this.selectedCategory !== "all" && prod.category !== this.selectedCategory) {
                return false;
            }
            // Фильтр по названию / описанию
            if (this.searchQuery && !prod.name.toLowerCase().includes(this.searchQuery) && 
                !prod.description.toLowerCase().includes(this.searchQuery)) {
                return false;
            }
            // Фильтр по цене
            if (prod.price < this.minPrice || prod.price > this.maxPrice) {
                return false;
            }
            return true;
        });
        
        // Сортировка
        if (this.sortBy === "price-asc") {
            filtered.sort((a, b) => a.price - b.price);
        } else if (this.sortBy === "price-desc") {
            filtered.sort((a, b) => b.price - a.price);
        } else if (this.sortBy === "rating-desc") {
            filtered.sort((a, b) => b.rating - a.rating);
        }
        
        return filtered;
    },
    
    render() {
        const filtered = this.getFilteredProducts();
        this.foundText.innerText = `Найдено товаров: ${filtered.length}`;
        
        if (filtered.length === 0) {
            this.grid.innerHTML = `
                <div class="no-products">
                    <h3>Товары не найдены</h3>
                    <p>Попробуйте смягчить условия фильтров или изменить поисковый запрос.</p>
                </div>
            `;
            return;
        }
        
        this.grid.innerHTML = filtered.map(prod => {
            const hasOldPrice = prod.oldPrice !== null;
            const discountBadge = hasOldPrice ? `<span class="card-badge discount">Скидка</span>` : "";
            const activeCompare = compare.isCompared(prod.id) ? "active" : "";
            
            // Генерация звездочек рейтинга
            let stars = "";
            const floorRating = Math.floor(prod.rating);
            for (let i = 1; i <= 5; i++) {
                if (i <= floorRating) {
                    stars += "★";
                } else {
                    stars += "☆";
                }
            }
            
            return `
                <article class="product-card" data-id="${prod.id}">
                    ${prod.badge ? `<span class="card-badge ${prod.badgeType}">${prod.badge}</span>` : discountBadge}
                    <div class="card-image-wrap" onclick="catalog.openDetails('${prod.id}')" style="cursor: pointer;">
                        <img src="${prod.image}" alt="${prod.name}" class="card-img" loading="lazy">
                    </div>
                    <div class="card-body">
                        <span class="card-category">${prod.categoryName}</span>
                        <h3 class="card-title" onclick="catalog.openDetails('${prod.id}')" style="cursor: pointer;">${prod.name}</h3>
                        
                        <div class="card-rating-wrap">
                            <span class="star-rating">${stars}</span>
                            <span class="rating-text">${prod.rating}</span>
                            <span class="reviews-count">(${prod.reviews} отзывов)</span>
                        </div>
                        
                        <div class="card-price-wrap">
                            <span class="card-price">${prod.price.toLocaleString()} руб</span>
                            ${hasOldPrice ? `<span class="card-price-old">${prod.oldPrice.toLocaleString()} руб</span>` : ""}
                        </div>
                        
                        <div class="card-actions">
                            <button class="btn btn-primary btn-add-cart" onclick="cart.add('${prod.id}')">В корзину</button>
                            <button class="btn-icon-action ${activeCompare}" onclick="compare.toggle('${prod.id}')" title="Добавить к сравнению" aria-label="Сравнить">
                                <svg viewBox="0 0 24 24" width="18" height="18">
                                    <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 20V10M12 20V4M6 20v-6"/>
                                </svg>
                            </button>
                            <button class="btn-icon-action" onclick="catalog.openDetails('${prod.id}')" title="Подробные характеристики" aria-label="Подробнее">
                                <svg viewBox="0 0 24 24" width="18" height="18">
                                    <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                                    <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                                </svg>
                            </button>
                        </div>
                    </div>
                </article>
            `;
        }).join("");
    },
    
    openDetails(productId) {
        const prod = PRODUCTS.find(p => p.id === productId);
        if (!prod) return;
        
        const modal = document.getElementById("details-modal");
        const contentGrid = document.getElementById("modal-grid-content");
        
        // Генерация таблицы характеристик
        const specsHTML = Object.entries(prod.specs).map(([key, val]) => `
            <tr>
                <td>${key}</td>
                <td>${val}</td>
            </tr>
        `).join("");
        
        contentGrid.innerHTML = `
            <div class="modal-visual">
                <img src="${prod.image}" alt="${prod.name}">
            </div>
            <div class="modal-info">
                <span class="card-category" style="margin-bottom: 8px; display: inline-block;">${prod.categoryName}</span>
                <h2 class="modal-title">${prod.name}</h2>
                <p class="modal-desc">${prod.description}</p>
                
                <h3 class="specs-title">Технические характеристики</h3>
                <table class="specs-table">
                    <tbody>
                        ${specsHTML}
                    </tbody>
                </table>
                
                <div class="modal-price-actions">
                    <div class="modal-price">
                        <span class="price-lbl">Цена оборудования</span>
                        <span class="price-val">${prod.price.toLocaleString()} руб</span>
                    </div>
                    <button class="btn btn-primary" onclick="cart.add('${prod.id}'); document.getElementById('details-modal').close();">Купить сейчас</button>
                </div>
            </div>
        `;
        
        modal.showModal();
        
        // Закрытие при клике по бэкдропу
        modal.addEventListener("click", function backdropClick(e) {
            const rect = modal.getBoundingClientRect();
            const isInDialog = (rect.top <= e.clientY && e.clientY <= rect.top + rect.height &&
                                rect.left <= e.clientX && e.clientX <= rect.left + rect.width);
            if (!isInDialog) {
                modal.close();
                modal.removeEventListener("click", backdropClick);
            }
        });
        
        document.getElementById("modal-close-btn").addEventListener("click", () => {
            modal.close();
        });
    }
};

/* ==================== 5. КОРЗИНА ТОВАРОВ (LOCALSTORAGE) ==================== */
const cart = {
    items: [],
    
    init() {
        this.drawer = document.getElementById("cart-drawer");
        this.overlay = document.getElementById("cart-overlay");
        this.countBadge = document.getElementById("cart-count");
        this.itemsContainer = document.getElementById("cart-items-container");
        this.totalPriceVal = document.getElementById("cart-total-price-val");
        this.footer = document.getElementById("cart-footer");
        
        // Загрузка
        const saved = localStorage.getItem("weldmax-cart");
        if (saved) {
            try { this.items = JSON.parse(saved); } catch(e) { this.items = []; }
        }
        
        this.bindEvents();
        this.updateUI();
    },
    
    bindEvents() {
        document.getElementById("cart-widget-btn").addEventListener("click", () => this.open());
        document.getElementById("cart-close-btn").addEventListener("click", () => this.close());
        this.overlay.addEventListener("click", () => this.close());
        document.getElementById("checkout-trigger-btn").addEventListener("click", () => {
            this.close();
            checkout.open();
        });
    },
    
    save() {
        localStorage.setItem("weldmax-cart", JSON.stringify(this.items));
        this.updateUI();
    },
    
    open() {
        this.drawer.classList.add("active");
        this.overlay.classList.add("active");
        this.drawer.setAttribute("aria-hidden", "false");
    },
    
    close() {
        this.drawer.classList.remove("active");
        this.overlay.classList.remove("active");
        this.drawer.setAttribute("aria-hidden", "true");
    },
    
    add(productId) {
        const existing = this.items.find(item => item.id === productId);
        if (existing) {
            existing.qty += 1;
        } else {
            this.items.push({ id: productId, qty: 1 });
        }
        this.save();
        this.open(); // Автоматически открываем корзину при добавлении
    },
    
    remove(productId) {
        this.items = this.items.filter(item => item.id !== productId);
        this.save();
    },
    
    updateQty(productId, change) {
        const item = this.items.find(item => item.id === productId);
        if (!item) return;
        
        item.qty += change;
        if (item.qty <= 0) {
            this.remove(productId);
        } else {
            this.save();
        }
    },
    
    clear() {
        this.items = [];
        this.save();
    },
    
    getGrandTotal() {
        return this.items.reduce((sum, item) => {
            const prod = PRODUCTS.find(p => p.id === item.id);
            return sum + (prod ? prod.price * item.qty : 0);
        }, 0);
    },
    
    getTotalCount() {
        return this.items.reduce((sum, item) => sum + item.qty, 0);
    },
    
    updateUI() {
        const count = this.getTotalCount();
        this.countBadge.innerText = count;
        this.countBadge.style.display = count > 0 ? "flex" : "none";
        
        if (this.items.length === 0) {
            this.itemsContainer.innerHTML = `
                <div class="cart-empty-message">
                    <svg viewBox="0 0 24 24" width="48" height="48" class="empty-cart-icon" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5">
                        <circle cx="9" cy="21" r="1"/>
                        <circle cx="20" cy="21" r="1"/>
                        <path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6"/>
                    </svg>
                    <p>Ваша корзина пока пуста</p>
                    <button class="btn btn-secondary" onclick="cart.close()">Начать покупки</button>
                </div>
            `;
            this.footer.style.display = "none";
            return;
        }
        
        this.footer.style.display = "block";
        const total = this.getGrandTotal();
        this.totalPriceVal.innerText = `${total.toLocaleString()} руб`;
        
        this.itemsContainer.innerHTML = this.items.map(item => {
            const prod = PRODUCTS.find(p => p.id === item.id);
            if (!prod) return "";
            
            return `
                <div class="cart-item">
                    <div class="cart-item-img-wrap">
                        <img src="${prod.image}" alt="${prod.name}" class="cart-item-img">
                    </div>
                    <div class="cart-item-details">
                        <h4 class="cart-item-title">${prod.name}</h4>
                        <div class="cart-item-price">${(prod.price * item.qty).toLocaleString()} руб</div>
                        <div class="cart-item-quantity-control">
                            <button class="qty-btn" onclick="cart.updateQty('${prod.id}', -1)">-</button>
                            <span class="qty-val">${item.qty}</span>
                            <button class="qty-btn" onclick="cart.updateQty('${prod.id}', 1)">+</button>
                        </div>
                    </div>
                    <button class="btn-remove-item" onclick="cart.remove('${prod.id}')" title="Удалить из корзины">
                        <svg viewBox="0 0 24 24" width="16" height="16">
                            <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                        </svg>
                    </button>
                </div>
            `;
        }).join("");
    }
};

// Простые глобальные хелперы для кнопок
window.closeCartDrawer = () => cart.close();
window.filterCategory = (cat) => {
    catalog.selectedCategory = cat;
    const catBtn = Array.from(catalog.categoryBtns).find(btn => btn.dataset.category === cat);
    if (catBtn) {
        catalog.categoryBtns.forEach(b => b.classList.remove("active"));
        catBtn.classList.add("active");
    }
    catalog.render();
};

/* ==================== 6. МОДУЛЬ СРАВНЕНИЯ ТОВАРОВ ==================== */
const compare = {
    list: [],
    
    init() {
        this.bar = document.getElementById("compare-bar");
        this.countBadge = document.getElementById("compare-count");
        this.barText = document.getElementById("compare-bar-text");
        this.modal = document.getElementById("compare-modal");
        
        document.getElementById("compare-widget-btn").addEventListener("click", () => {
            if (this.list.length > 0) this.openModal();
        });
        
        document.getElementById("compare-clear-btn").addEventListener("click", () => this.clear());
        document.getElementById("compare-show-modal-btn").addEventListener("click", () => this.openModal());
        document.getElementById("compare-modal-close-btn").addEventListener("click", () => this.modal.close());
        
        this.updateUI();
    },
    
    isCompared(productId) {
        return this.list.includes(productId);
    },
    
    toggle(productId) {
        const index = this.list.indexOf(productId);
        if (index > -1) {
            this.list.splice(index, 1);
        } else {
            if (this.list.length >= 3) {
                alert("Вы можете добавить к сравнению не более 3 товаров одновременно.");
                return;
            }
            this.list.push(productId);
        }
        
        this.updateUI();
        catalog.render(); // Обновляем иконки в сетке
    },
    
    clear() {
        this.list = [];
        this.updateUI();
        catalog.render();
    },
    
    updateUI() {
        const len = this.list.length;
        this.countBadge.innerText = len;
        this.countBadge.style.display = len > 0 ? "flex" : "none";
        
        if (len > 0) {
            this.bar.classList.add("active");
            this.barText.innerText = `Добавлено товаров для сравнения: ${len} из 3`;
        } else {
            this.bar.classList.remove("active");
        }
    },
    
    openModal() {
        const container = document.getElementById("compare-table-container");
        const products = this.list.map(id => PRODUCTS.find(p => p.id === id)).filter(Boolean);
        
        if (products.length === 0) return;
        
        // Получаем все уникальные ключи спецификаций
        const allSpecKeys = new Set();
        products.forEach(p => {
            Object.keys(p.specs).forEach(k => allSpecKeys.add(k));
        });
        
        const specKeys = Array.from(allSpecKeys);
        
        // Шапка таблицы
        const headerHTML = `
            <tr>
                <th>Характеристика</th>
                ${products.map(p => `
                    <th>
                        <div class="compare-product-header">
                            <img src="${p.image}" alt="${p.name}" class="compare-product-img">
                            <div class="compare-product-name">${p.name}</div>
                            <button class="compare-remove-btn" onclick="compare.toggle('${p.id}'); compare.openModal();">Удалить</button>
                        </div>
                    </th>
                `).join("")}
            </tr>
        `;
        
        // Ряд цены
        const priceRowHTML = `
            <tr>
                <td><strong>Цена</strong></td>
                ${products.map(p => `
                    <td><strong style="color: var(--accent-orange); font-size: 1rem;">${p.price.toLocaleString()} руб</strong></td>
                `).join("")}
            </tr>
        `;
        
        // Спецификации
        const specsRowsHTML = specKeys.map(key => {
            return `
                <tr>
                    <td>${key}</td>
                    ${products.map(p => {
                        const val = p.specs[key] || "—";
                        
                        // Извлекаем численное значение (например, "4.8 кг" -> 4.8 или "200 А" -> 200)
                        // Подсвечиваем лучшие спецификации для удобства
                        let displayVal = val;
                        if (key.includes("ток") && val.includes("200")) {
                            displayVal = `<span class="compare-winner">${val}</span>`;
                        } else if (key.includes("Вес") && parseFloat(val) <= 5) {
                            displayVal = `<span class="compare-winner" style="color: var(--success);">${val}</span>`;
                        }
                        
                        return `<td>${displayVal}</td>`;
                    }).join("")}
                </tr>
            `;
        }).join("");
        
        container.innerHTML = `
            <table class="compare-table">
                <thead>
                    ${headerHTML}
                </thead>
                <tbody>
                    ${priceRowHTML}
                    ${specsRowsHTML}
                </tbody>
            </table>
        `;
        
        this.modal.showModal();
        
        // Закрытие при клике по бэкдропу
        this.modal.addEventListener("click", function compareBackdropClick(e) {
            const rect = compare.modal.getBoundingClientRect();
            const isInDialog = (rect.top <= e.clientY && e.clientY <= rect.top + rect.height &&
                                rect.left <= e.clientX && e.clientX <= rect.left + rect.width);
            if (!isInDialog) {
                compare.modal.close();
                compare.modal.removeEventListener("click", compareBackdropClick);
            }
        });
    }
};

/* ==================== 7. СИМУЛЯТОР ОФОРМЛЕНИЯ ЗАКАЗА ==================== */
const checkout = {
    currentStep: 1,
    
    init() {
        this.modal = document.getElementById("checkout-modal");
        this.form = document.getElementById("checkout-form");
        this.closeBtn = document.getElementById("checkout-close-btn");
        this.successView = document.getElementById("checkout-success");
        
        this.bindEvents();
    },
    
    bindEvents() {
        this.closeBtn.addEventListener("click", () => this.close());
        
        // Кнопки перехода между шагами
        document.getElementById("checkout-next-1").addEventListener("click", () => this.goToStep(2));
        document.getElementById("checkout-next-2").addEventListener("click", () => this.goToStep(3));
        document.getElementById("checkout-prev-2").addEventListener("click", () => this.goToStep(1));
        document.getElementById("checkout-prev-3").addEventListener("click", () => this.goToStep(2));
        
        // Сабмит формы
        this.form.addEventListener("submit", (e) => {
            e.preventDefault();
            this.submitOrder();
        });
        
        document.getElementById("success-done-btn").addEventListener("click", () => {
            this.close();
        });
    },
    
    open() {
        if (cart.items.length === 0) {
            alert("Ваша корзина пуста. Нечего оформлять.");
            return;
        }
        
        this.currentStep = 1;
        this.goToStep(1);
        this.successView.classList.remove("active");
        this.form.style.display = "block";
        this.form.reset();
        
        this.modal.showModal();
        
        // Закрытие при клике по бэкдропу
        this.modal.addEventListener("click", function checkoutBackdropClick(e) {
            const rect = checkout.modal.getBoundingClientRect();
            const isInDialog = (rect.top <= e.clientY && e.clientY <= rect.top + rect.height &&
                                rect.left <= e.clientX && e.clientX <= rect.left + rect.width);
            if (!isInDialog && !checkout.successView.classList.contains("active")) {
                checkout.modal.close();
                checkout.modal.removeEventListener("click", checkoutBackdropClick);
            }
        });
    },
    
    close() {
        this.modal.close();
    },
    
    validateStep(step) {
        let isValid = true;
        const container = document.getElementById(`checkout-step-${step}`);
        if (!container) return true;
        
        const inputs = container.querySelectorAll("input[required]");
        inputs.forEach(input => {
            // Активируем псевдокласс :user-invalid, заставляя браузер думать, что пользователь закончил ввод
            if (!input.checkValidity()) {
                isValid = false;
                // Временно фокусим и блюрим для триггера :user-invalid в CSS
                input.dispatchEvent(new Event('blur'));
            }
        });
        
        return isValid;
    },
    
    goToStep(step) {
        if (step > this.currentStep) {
            // Проверяем валидность текущего шага при движении вперед
            if (!this.validateStep(this.currentStep)) {
                return;
            }
        }
        
        this.currentStep = step;
        
        // Скрытие / показ контента шагов
        for (let i = 1; i <= 3; i++) {
            const content = document.getElementById(`checkout-step-${i}`);
            const indicator = document.getElementById(`step-indicator-${i}`);
            const line = document.getElementById(`step-line-${i}`);
            
            if (content) {
                content.classList.toggle("active", i === step);
            }
            
            if (indicator) {
                indicator.classList.toggle("active", i === step);
                indicator.classList.toggle("done", i < step);
            }
            
            if (line) {
                line.classList.toggle("active", i < step);
            }
        }
        
        if (step === 3) {
            this.updateSummary();
        }
    },
    
    updateSummary() {
        const container = document.getElementById("checkout-summary-items");
        const subtotal = cart.getGrandTotal();
        
        // Определение доставки
        const isCourier = this.form.querySelector('input[name="delivery-method"]:checked').value === "courier";
        const deliveryCost = (isCourier && subtotal < 15000) ? 490 : 0;
        const total = subtotal + deliveryCost;
        
        document.getElementById("summary-subtotal").innerText = `${subtotal.toLocaleString()} руб`;
        document.getElementById("summary-delivery").innerText = deliveryCost === 0 ? "Бесплатно" : `${deliveryCost} руб`;
        document.getElementById("summary-total").innerText = `${total.toLocaleString()} руб`;
        
        // Отрисовка товаров
        container.innerHTML = cart.items.map(item => {
            const prod = PRODUCTS.find(p => p.id === item.id);
            if (!prod) return "";
            return `
                <div class="summary-item-row">
                    <span>${prod.name} (x${item.qty})</span>
                    <span>${(prod.price * item.qty).toLocaleString()} руб</span>
                </div>
            `;
        }).join("");
    },
    
    submitOrder() {
        // Симулируем отправку заказа
        const subtotal = cart.getGrandTotal();
        const isCourier = this.form.querySelector('input[name="delivery-method"]:checked').value === "courier";
        const deliveryCost = (isCourier && subtotal < 15000) ? 490 : 0;
        const total = subtotal + deliveryCost;
        
        const name = document.getElementById("checkout-name").value;
        const phone = document.getElementById("checkout-phone").value;
        const email = document.getElementById("checkout-email").value;
        const address = document.getElementById("checkout-address").value || "Самовывоз со склада";
        const payment = this.form.querySelector('input[name="payment-method"]:checked').value === "card" ? "Карта Онлайн" : "При получении";
        
        const orderNumber = "WM-" + Math.floor(Math.random() * 900000 + 100000);
        const dateStr = new Date().toLocaleString("ru-RU");
        
        // Генерация виртуального чека (текстового накладного листа)
        const invoiceContainer = document.getElementById("invoice-details");
        
        const itemsText = cart.items.map(item => {
            const prod = PRODUCTS.find(p => p.id === item.id);
            if (!prod) return "";
            const nameTrunc = prod.name.length > 25 ? prod.name.substring(0, 22) + "..." : prod.name.padEnd(25);
            const qtyStr = ("x" + item.qty).padEnd(5);
            const priceStr = ((prod.price * item.qty).toLocaleString() + " Р").padStart(10);
            return `${nameTrunc} ${qtyStr} ${priceStr}`;
        }).join("\n");
        
        invoiceContainer.innerHTML = `
            <div class="invoice-header">Накладная заказа ${orderNumber}</div>
            <div class="invoice-row"><span>МАГАЗИН:</span><span>ООО "ВЕЛДМАКС ТЕХНИКА"</span></div>
            <div class="invoice-row"><span>ДАТА:</span><span>${dateStr}</span></div>
            <div class="invoice-row"><span>ПОКУПАТЕЛЬ:</span><span>${name}</span></div>
            <div class="invoice-row"><span>ТЕЛЕФОН:</span><span>${phone}</span></div>
            <div class="invoice-row"><span>EMAIL:</span><span>${email}</span></div>
            <div class="invoice-row"><span>АДРЕС ДОСТАВКИ:</span><span>${address}</span></div>
            <div class="invoice-line"></div>
            <div style="font-weight: 700; margin-bottom: 8px;">НАИМЕНОВАНИЕ              КОЛ-ВО      СУММА</div>
            <div style="white-space: pre; margin-bottom: 8px;">${itemsText}</div>
            <div class="invoice-line"></div>
            <div class="invoice-row"><span>СТОИМОСТЬ ТОВАРОВ:</span><span>${subtotal.toLocaleString()} Р</span></div>
            <div class="invoice-row"><span>ДОСТАВКА:</span><span>${deliveryCost === 0 ? "БЕСПЛАТНО" : deliveryCost + " Р"}</span></div>
            <div class="invoice-row" style="font-weight: 700; font-size: 0.9rem;"><span>ИТОГО К ОПЛАТЕ:</span><span>${total.toLocaleString()} Р</span></div>
            <div class="invoice-row"><span>СПОСОБ ОПЛАТЫ:</span><span>${payment}</span></div>
            <div class="invoice-line"></div>
            <div style="text-align: center; font-weight: 700; color: var(--success); margin-top: 10px;">ЗАКАЗ ПРИНЯТ В ОБРАБОТКУ</div>
        `;
        
        // Очищаем корзину
        cart.clear();
        
        // Переключаем окно в вид успешного оформления
        this.form.style.display = "none";
        this.successView.classList.add("active");
    }
};
