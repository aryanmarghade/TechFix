/**
 * TECHFIX - CLIENT-SIDE CORE UTILITIES & API CLIENT
 * "Buy. Build. Repair. Delivered."
 */

const API_BASE = '/api';

// State & Storage
const TechFix = {
  // Authentication & User State
  getUser() {
    try {
      const userStr = localStorage.getItem('techfix_user');
      return userStr ? JSON.parse(userStr) : null;
    } catch (e) {
      return null;
    }
  },

  getToken() {
    return localStorage.getItem('techfix_token');
  },

  setAuth(user, token) {
    localStorage.setItem('techfix_user', JSON.stringify(user));
    if (token) localStorage.setItem('techfix_token', token);
    this.updateHeaderAuth();
  },

  logout() {
    localStorage.removeItem('techfix_user');
    localStorage.removeItem('techfix_token');
    fetch(`${API_BASE}/auth/logout`, { method: 'POST' }).finally(() => {
      window.location.href = '/login.html';
    });
  },

  // Cart Management
  getCart() {
    try {
      const cart = localStorage.getItem('techfix_cart');
      return cart ? JSON.parse(cart) : [];
    } catch (e) {
      return [];
    }
  },

  saveCart(cart) {
    localStorage.setItem('techfix_cart', JSON.stringify(cart));
    this.updateCartBadge();
  },

  addToCart(product, quantity = 1, customBuildDetails = null) {
    const cart = this.getCart();
    const existingIndex = cart.findIndex(item => {
      if (customBuildDetails && item.custom_build_details) {
        return item.custom_build_details.name === customBuildDetails.name;
      }
      return item.product_id === product.id && !item.custom_build_details;
    });

    if (existingIndex > -1) {
      cart[existingIndex].quantity += quantity;
    } else {
      cart.push({
        product_id: product.id,
        name: product.name,
        slug: product.slug,
        brand: product.brand,
        price: parseFloat(product.price),
        image_url: product.image_url,
        quantity: quantity,
        stock_quantity: product.stock_quantity,
        custom_build_details: customBuildDetails
      });
    }

    this.saveCart(cart);
    this.showToast(`"${product.name}" added to cart!`, 'success');
  },

  updateCartQuantity(index, quantity) {
    const cart = this.getCart();
    if (cart[index]) {
      if (quantity <= 0) {
        cart.splice(index, 1);
      } else {
        cart[index].quantity = quantity;
      }
      this.saveCart(cart);
    }
  },

  removeFromCart(index) {
    const cart = this.getCart();
    cart.splice(index, 1);
    this.saveCart(cart);
    this.showToast('Item removed from cart.', 'warning');
  },

  clearCart() {
    localStorage.removeItem('techfix_cart');
    this.updateCartBadge();
  },

  updateCartBadge() {
    const badge = document.getElementById('cart-badge-count');
    if (badge) {
      const cart = this.getCart();
      const count = cart.reduce((total, item) => total + item.quantity, 0);
      badge.textContent = count;
      badge.style.display = count > 0 ? 'inline-block' : 'none';
    }
  },

  // Toast Notification System
  showToast(message, type = 'info') {
    let container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
      <span>${message}</span>
    `;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(100%)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  },

  // Currency Formatter
  formatPrice(num) {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(num);
  },

  // UI Header Synchronization
  updateHeaderAuth() {
    const user = this.getUser();
    const accountLink = document.getElementById('header-account-link');
    if (accountLink) {
      if (user) {
        accountLink.innerHTML = `
          <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
          <span>${user.name.split(' ')[0]}</span>
        `;
        accountLink.href = user.role === 'admin' ? '/admin.html' : '/account.html';
      } else {
        accountLink.innerHTML = `
          <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
          <span>Login</span>
        `;
        accountLink.href = '/login.html';
      }
    }
  },

  // Global search redirect
  initSearch() {
    const searchInput = document.getElementById('global-search-input');
    if (searchInput) {
      searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && searchInput.value.trim()) {
          window.location.href = `/search.html?q=${encodeURIComponent(searchInput.value.trim())}`;
        }
      });
    }
  },

  // TechFix AI Chatbot Widget (Powered by Local Ollama)
  initAIChatbot() {
    if (document.getElementById('techfix-ai-widget')) return;

    const widget = document.createElement('div');
    widget.id = 'techfix-ai-widget';
    widget.innerHTML = `
      <!-- Chat Toggle Button -->
      <button id="ai-chat-btn" class="ai-fab-btn" aria-label="Ask TechFix AI Assistant">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
        </svg>
        <span>Ask TechFix AI</span>
      </button>

      <!-- Chat Floating Window -->
      <div id="ai-chat-window" class="ai-chat-window" style="display: none;">
        <div class="ai-chat-header">
          <div class="ai-chat-title">
            <span class="ai-pulse-dot"></span>
            <div>
              <strong>TechFix Computer Assistant</strong>
              <small>Local AI • Hardware & Troubleshooting</small>
            </div>
          </div>
          <div class="ai-chat-actions">
            <button id="ai-chat-clear" title="Clear Chat" class="ai-icon-btn">🗑️</button>
            <button id="ai-chat-close" title="Close" class="ai-icon-btn">✕</button>
          </div>
        </div>

        <div id="ai-chat-messages" class="ai-chat-messages">
          <div class="ai-msg ai-msg-bot">
            <div class="ai-bubble">
              Hi! I'm the <strong>TechFix Computer Assistant</strong>. I can help you choose a laptop or PC, understand hardware, learn about Linux, troubleshoot common problems, or get safe computer-cleaning tips.
            </div>
          </div>
        </div>

        <div id="ai-chat-loading" class="ai-typing-indicator" style="display: none;">
          <span></span><span></span><span></span>
        </div>

        <form id="ai-chat-form" class="ai-chat-input-row" onsubmit="TechFix.handleSendChatMessage(event)">
          <input type="text" id="ai-user-input" placeholder="Ask about laptops, gaming PCs, Linux, repairs..." autocomplete="off" required>
          <button type="submit" id="ai-send-btn" class="btn btn-accent btn-sm">Send</button>
        </form>
      </div>
    `;

    document.body.appendChild(widget);

    // Event listeners
    const toggleBtn = document.getElementById('ai-chat-btn');
    const chatWindow = document.getElementById('ai-chat-window');
    const closeBtn = document.getElementById('ai-chat-close');
    const clearBtn = document.getElementById('ai-chat-clear');

    toggleBtn.addEventListener('click', () => {
      const isOpen = chatWindow.style.display !== 'none';
      chatWindow.style.display = isOpen ? 'none' : 'flex';
      if (!isOpen) {
        document.getElementById('ai-user-input').focus();
      }
    });

    closeBtn.addEventListener('click', () => {
      chatWindow.style.display = 'none';
    });

    clearBtn.addEventListener('click', () => {
      const msgBox = document.getElementById('ai-chat-messages');
      msgBox.innerHTML = `
        <div class="ai-msg ai-msg-bot">
          <div class="ai-bubble">
            Chat cleared. How can I help you today?
          </div>
        </div>
      `;
    });
  },

  async handleSendChatMessage(e) {
    e.preventDefault();
    const input = document.getElementById('ai-user-input');
    const msgBox = document.getElementById('ai-chat-messages');
    const loading = document.getElementById('ai-chat-loading');
    const sendBtn = document.getElementById('ai-send-btn');
    const text = input.value.trim();

    if (!text) return;

    // Append User Message
    const userMsgDiv = document.createElement('div');
    userMsgDiv.className = 'ai-msg ai-msg-user';
    userMsgDiv.innerHTML = `<div class="ai-bubble">${this.escapeHTML(text)}</div>`;
    msgBox.appendChild(userMsgDiv);
    input.value = '';
    msgBox.scrollTop = msgBox.scrollHeight;

    loading.style.display = 'flex';
    sendBtn.disabled = true;

    try {
      const res = await fetch('/api/chat/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text })
      });
      const data = await res.json();

      const botMsgDiv = document.createElement('div');
      botMsgDiv.className = 'ai-msg ai-msg-bot';

      if (data.success) {
        let replyHtml = this.formatMarkdown(data.reply);
        if (data.matchedProducts && data.matchedProducts.length > 0) {
          replyHtml += `
            <div class="ai-product-recommendations" style="margin-top:0.75rem; border-top:1px dashed #cbd5e1; padding-top:0.5rem;">
              <strong style="font-size:0.8rem; color:var(--primary);">Matched TechFix Inventory:</strong>
              <div style="display:flex; flex-direction:column; gap:0.4rem; margin-top:0.35rem;">
                ${data.matchedProducts.map(p => `
                  <a href="/product.html?slug=${p.slug}" style="display:flex; justify-content:space-between; font-size:0.8rem; background:#fff; padding:0.4rem 0.6rem; border-radius:4px; border:1px solid #e2e8f0; color:var(--dark); text-decoration:none;">
                    <span>${p.name}</span>
                    <strong style="color:var(--primary);">${TechFix.formatPrice(p.price)}</strong>
                  </a>
                `).join('')}
              </div>
            </div>
          `;
        }
        botMsgDiv.innerHTML = `<div class="ai-bubble">${replyHtml}</div>`;
      } else {
        botMsgDiv.innerHTML = `<div class="ai-bubble ai-error-bubble">${this.escapeHTML(data.message || 'TechFix Assistant is temporarily unavailable. Please contact support.')}</div>`;
      }
      msgBox.appendChild(botMsgDiv);
    } catch (err) {
      const botMsgDiv = document.createElement('div');
      botMsgDiv.className = 'ai-msg ai-msg-bot';
      botMsgDiv.innerHTML = `<div class="ai-bubble ai-error-bubble">TechFix Assistant is temporarily unavailable. Please contact support.</div>`;
      msgBox.appendChild(botMsgDiv);
    } finally {
      loading.style.display = 'none';
      sendBtn.disabled = false;
      msgBox.scrollTop = msgBox.scrollHeight;
    }
  },

  escapeHTML(str) {
    return str.replace(/[&<>'"]/g, 
      tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
    );
  },

  formatMarkdown(text) {
    if (!text) return '';
    return text
      .replace(/\n\n/g, '<br><br>')
      .replace(/\n/g, '<br>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>');
  }
};

document.addEventListener('DOMContentLoaded', () => {
  TechFix.updateHeaderAuth();
  TechFix.updateCartBadge();
  TechFix.initSearch();
  TechFix.initAIChatbot();

  // Mobile navigation toggle
  const mobileBtn = document.getElementById('mobile-menu-toggle');
  const navBar = document.querySelector('.nav-bar');
  if (mobileBtn && navBar) {
    mobileBtn.addEventListener('click', () => {
      navBar.classList.toggle('mobile-open');
    });
  }
});
