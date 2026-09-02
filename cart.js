/* ============ TUE COLLECTION — CART ============
   Front-end only cart: state lives in localStorage so it persists
   across pages and reloads. Include products.js BEFORE this file.
   No backend/payment is wired up — "Place order" shows a
   confirmation and clears the cart, same as the contact form,
   this needs a real backend before going live. */

(function () {
  var CART_KEY = "tue_cart_v1";
  var SHIPPING_FLAT = 2500;
  var products = window.TUE_PRODUCTS || [];

  function findProduct(id) {
    for (var i = 0; i < products.length; i++) {
      if (products[i].id === id) return products[i];
    }
    return null;
  }

  function money(n) {
    return "\u20A6" + Math.round(n).toLocaleString("en-NG");
  }

  function getCart() {
    try {
      var raw = localStorage.getItem(CART_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  }

  function saveCart(cart) {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
    renderBadge();
  }

  function addToCart(id, size, qty) {
    qty = qty || 1;
    var cart = getCart();
    var existing = null;
    for (var i = 0; i < cart.length; i++) {
      if (cart[i].id === id && cart[i].size === size) { existing = cart[i]; break; }
    }
    if (existing) { existing.qty += qty; } else { cart.push({ id: id, size: size, qty: qty }); }
    saveCart(cart);
    renderDrawer();
    openDrawer();
    showToast("Added to your bag");
  }

  function setQty(index, qty) {
    var cart = getCart();
    if (!cart[index]) return;
    if (qty <= 0) { cart.splice(index, 1); } else { cart[index].qty = qty; }
    saveCart(cart);
    renderDrawer();
  }

  function removeIndex(index) {
    var cart = getCart();
    cart.splice(index, 1);
    saveCart(cart);
    renderDrawer();
  }

  function cartCount() {
    var cart = getCart();
    var n = 0;
    for (var i = 0; i < cart.length; i++) n += cart[i].qty;
    return n;
  }

  function cartSubtotal() {
    var cart = getCart();
    var sum = 0;
    for (var i = 0; i < cart.length; i++) {
      var p = findProduct(cart[i].id);
      if (p) sum += p.price * cart[i].qty;
    }
    return sum;
  }

  /* ---------- badge (header icon) ---------- */
  function renderBadge() {
    var badge = document.getElementById("cartCountBadge");
    if (!badge) return;
    var n = cartCount();
    badge.textContent = n;
    badge.style.display = n > 0 ? "flex" : "none";
  }

  /* ---------- toast ---------- */
  var toastTimer = null;
  function showToast(msg) {
    var toast = document.getElementById("tueToast");
    if (!toast) return;
    toast.textContent = msg;
    toast.style.opacity = "1";
    toast.style.transform = "translateY(0)";
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toast.style.opacity = "0";
      toast.style.transform = "translateY(8px)";
    }, 2200);
  }

  /* ---------- drawer open/close ---------- */
  function openDrawer() {
    var overlay = document.getElementById("tueCartOverlay");
    var drawer = document.getElementById("tueCartDrawer");
    if (!overlay || !drawer) return;
    overlay.style.display = "block";
    requestAnimationFrame(function () {
      overlay.style.opacity = "1";
      drawer.style.transform = "translateX(0)";
    });
    document.body.style.overflow = "hidden";
  }
  function closeDrawer() {
    var overlay = document.getElementById("tueCartOverlay");
    var drawer = document.getElementById("tueCartDrawer");
    if (!overlay || !drawer) return;
    overlay.style.opacity = "0";
    drawer.style.transform = "translateX(100%)";
    document.body.style.overflow = "";
    setTimeout(function () { overlay.style.display = "none"; }, 250);
    showCartView();
  }

  /* ---------- render: cart view ---------- */
  function renderDrawer() {
    var body = document.getElementById("tueCartBody");
    var footer = document.getElementById("tueCartFooter");
    if (!body || !footer) return;
    var cart = getCart();

    if (cart.length === 0) {
      body.innerHTML =
        '<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;padding:40px 24px;text-align:center;gap:14px;">' +
        '<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#83868d" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>' +
        '<p style="font-size:14.5px;color:var(--muted);max-width:220px;">Your bag is empty. Add something from the shop to see it here.</p>' +
        '<a href="services.html" class="btn-primary" style="padding:12px 22px;border-radius:999px;font-size:13.5px;font-weight:700;">Browse the shop</a>' +
        "</div>";
      footer.innerHTML = "";
      return;
    }

    var rows = "";
    for (var i = 0; i < cart.length; i++) {
      var item = cart[i];
      var p = findProduct(item.id);
      if (!p) continue;
      rows +=
        '<div style="display:flex;gap:14px;padding:16px 24px;border-bottom:1px solid var(--line);">' +
        '<img src="' + p.image + '" alt="' + p.name + '" style="width:64px;height:76px;object-fit:cover;border-radius:10px;flex:none;background:#f4f4f2;">' +
        '<div style="flex:1;min-width:0;">' +
        '<div style="display:flex;justify-content:space-between;gap:8px;">' +
        '<span style="font-size:14px;font-weight:700;">' + p.name + "</span>" +
        '<button type="button" data-remove="' + i + '" style="border:none;background:none;color:var(--muted);cursor:pointer;font-size:13px;padding:0;">Remove</button>' +
        "</div>" +
        '<div style="font-size:12.5px;color:var(--muted);margin-top:2px;">Size ' + item.size + "</div>" +
        '<div style="display:flex;align-items:center;justify-content:space-between;margin-top:10px;">' +
        '<div style="display:flex;align-items:center;gap:10px;border:1.5px solid var(--line);border-radius:999px;padding:4px 10px;">' +
        '<button type="button" data-qty-down="' + i + '" style="border:none;background:none;cursor:pointer;font-size:15px;width:16px;line-height:1;">\u2212</button>' +
        '<span style="font-size:13px;font-weight:700;min-width:14px;text-align:center;">' + item.qty + "</span>" +
        '<button type="button" data-qty-up="' + i + '" style="border:none;background:none;cursor:pointer;font-size:15px;width:16px;line-height:1;">+</button>' +
        "</div>" +
        '<span style="font-size:14px;font-weight:800;">' + money(p.price * item.qty) + "</span>" +
        "</div>" +
        "</div>" +
        "</div>";
    }
    body.innerHTML = rows;

    var subtotal = cartSubtotal();
    footer.innerHTML =
      '<div style="display:flex;justify-content:space-between;font-size:13.5px;color:var(--muted);margin-bottom:8px;"><span>Subtotal</span><span>' + money(subtotal) + "</span></div>" +
      '<div style="display:flex;justify-content:space-between;font-size:13.5px;color:var(--muted);margin-bottom:16px;"><span>Shipping</span><span>' + money(SHIPPING_FLAT) + "</span></div>" +
      '<div style="display:flex;justify-content:space-between;font-size:16px;font-weight:800;margin-bottom:18px;padding-top:14px;border-top:1px solid var(--line);"><span>Total</span><span>' + money(subtotal + SHIPPING_FLAT) + "</span></div>" +
      '<button type="button" id="tueCheckoutBtn" class="btn-primary" style="width:100%;padding:15px;border-radius:999px;font-size:14.5px;font-weight:700;border:none;cursor:pointer;">Checkout</button>';

    Array.prototype.forEach.call(body.querySelectorAll("[data-remove]"), function (btn) {
      btn.addEventListener("click", function () { removeIndex(parseInt(btn.getAttribute("data-remove"), 10)); });
    });
    Array.prototype.forEach.call(body.querySelectorAll("[data-qty-up]"), function (btn) {
      btn.addEventListener("click", function () {
        var idx = parseInt(btn.getAttribute("data-qty-up"), 10);
        setQty(idx, getCart()[idx].qty + 1);
      });
    });
    Array.prototype.forEach.call(body.querySelectorAll("[data-qty-down]"), function (btn) {
      btn.addEventListener("click", function () {
        var idx = parseInt(btn.getAttribute("data-qty-down"), 10);
        setQty(idx, getCart()[idx].qty - 1);
      });
    });
    var checkoutBtn = document.getElementById("tueCheckoutBtn");
    if (checkoutBtn) checkoutBtn.addEventListener("click", showCheckoutView);
  }

  /* ---------- render: checkout view ---------- */
  function showCheckoutView() {
    var body = document.getElementById("tueCartBody");
    var footer = document.getElementById("tueCartFooter");
    var title = document.getElementById("tueCartTitle");
    var backBtn = document.getElementById("tueCartBackBtn");
    if (!body || !footer) return;
    if (title) title.textContent = "Checkout";
    if (backBtn) backBtn.style.display = "inline-flex";

    var subtotal = cartSubtotal();
    var total = subtotal + SHIPPING_FLAT;

    body.innerHTML =
      '<div style="padding:20px 24px;">' +
      '<div style="background:var(--paper-soft);border-radius:12px;padding:16px 18px;margin-bottom:20px;">' +
      '<div style="display:flex;justify-content:space-between;font-size:13.5px;color:var(--ink-soft);margin-bottom:6px;"><span>Subtotal</span><span>' + money(subtotal) + "</span></div>" +
      '<div style="display:flex;justify-content:space-between;font-size:13.5px;color:var(--ink-soft);margin-bottom:6px;"><span>Shipping (flat rate)</span><span>' + money(SHIPPING_FLAT) + "</span></div>" +
      '<div style="display:flex;justify-content:space-between;font-size:15px;font-weight:800;padding-top:10px;border-top:1px solid var(--line);"><span>Total due</span><span>' + money(total) + "</span></div>" +
      "</div>" +
      '<form id="tueCheckoutForm" class="field" style="display:flex;flex-direction:column;gap:14px;">' +
      '<div><label>Full name</label><input required type="text" placeholder="Your name"></div>' +
      '<div><label>Phone number</label><input required type="tel" placeholder="080..."></div>' +
      '<div><label>Delivery address</label><textarea required rows="3" placeholder="Street, city, state" style="resize:vertical;"></textarea></div>' +
      '<button type="submit" class="btn-primary" style="width:100%;padding:15px;border-radius:999px;font-size:14.5px;font-weight:700;border:none;cursor:pointer;margin-top:4px;">Place order &middot; ' + money(total) + "</button>" +
      '<p style="font-size:11.5px;color:var(--muted);line-height:1.5;text-align:center;">This is a demo checkout \u2014 no payment is processed here. Your order details would need a connected backend or payment provider before going live.</p>' +
      "</form>" +
      "</div>";

    footer.innerHTML = "";

    var form = document.getElementById("tueCheckoutForm");
    if (form) {
      form.addEventListener("submit", function (e) {
        e.preventDefault();
        showConfirmationView(total);
      });
    }
  }

  /* ---------- render: confirmation view ---------- */
  function showConfirmationView(total) {
    var body = document.getElementById("tueCartBody");
    var footer = document.getElementById("tueCartFooter");
    var title = document.getElementById("tueCartTitle");
    var backBtn = document.getElementById("tueCartBackBtn");
    if (!body || !footer) return;
    if (title) title.textContent = "Order placed";
    if (backBtn) backBtn.style.display = "none";

    body.innerHTML =
      '<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;padding:40px 28px;text-align:center;gap:16px;">' +
      '<span style="width:56px;height:56px;border-radius:999px;background:var(--accent-soft);display:flex;align-items:center;justify-content:center;">' +
      '<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>' +
      "</span>" +
      '<h3 style="font-size:19px;font-weight:800;">Thanks for your order</h3>' +
      '<p style="font-size:14px;color:var(--muted);max-width:260px;line-height:1.6;">We would normally email a confirmation and reach out to arrange delivery. Total: <strong style="color:var(--ink);">' + money(total) + "</strong></p>" +
      '<a href="services.html" class="btn-primary" style="padding:12px 24px;border-radius:999px;font-size:13.5px;font-weight:700;">Continue shopping</a>' +
      "</div>";
    footer.innerHTML = "";

    saveCart([]);
    renderDrawer.__clearedAfterConfirm = true;
  }

  function showCartView() {
    var title = document.getElementById("tueCartTitle");
    var backBtn = document.getElementById("tueCartBackBtn");
    if (title) title.textContent = "Your bag";
    if (backBtn) backBtn.style.display = "none";
    renderDrawer();
  }

  /* ---------- build drawer DOM once ---------- */
  function buildDrawer() {
    if (document.getElementById("tueCartOverlay")) return;

    var overlay = document.createElement("div");
    overlay.id = "tueCartOverlay";
    overlay.style.cssText = "display:none;position:fixed;inset:0;background:rgba(21,23,27,0.45);z-index:100;opacity:0;transition:opacity .25s ease;";

    var drawer = document.createElement("div");
    drawer.id = "tueCartDrawer";
    drawer.style.cssText = "position:fixed;top:0;right:0;height:100%;width:min(420px,100vw);background:#fff;z-index:101;box-shadow:-20px 0 60px -20px rgba(21,23,27,0.35);transform:translateX(100%);transition:transform .28s ease;display:flex;flex-direction:column;";
    drawer.innerHTML =
      '<div style="display:flex;align-items:center;gap:10px;padding:20px 24px;border-bottom:1px solid var(--line);">' +
      '<button type="button" id="tueCartBackBtn" aria-label="Back" style="display:none;border:none;background:none;cursor:pointer;padding:4px;margin-left:-6px;"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#15171b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg></button>' +
      '<h3 id="tueCartTitle" style="flex:1;font-size:17px;font-weight:800;">Your bag</h3>' +
      '<button type="button" id="tueCartCloseBtn" aria-label="Close cart" style="border:none;background:none;cursor:pointer;padding:4px;"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#15171b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18M6 6l12 12"/></svg></button>' +
      "</div>" +
      '<div id="tueCartBody" style="flex:1;overflow-y:auto;"></div>' +
      '<div id="tueCartFooter" style="padding:20px 24px;border-top:1px solid var(--line);"></div>';

    document.body.appendChild(overlay);
    document.body.appendChild(drawer);

    var toast = document.createElement("div");
    toast.id = "tueToast";
    toast.style.cssText = "position:fixed;left:50%;bottom:28px;transform:translate(-50%,8px);background:var(--ink,#15171b);color:#fff;font-size:13.5px;font-weight:600;padding:12px 20px;border-radius:999px;z-index:200;opacity:0;transition:opacity .2s ease,transform .2s ease;pointer-events:none;box-shadow:0 20px 40px -18px rgba(0,0,0,0.4);";
    document.body.appendChild(toast);

    overlay.addEventListener("click", closeDrawer);
    document.getElementById("tueCartCloseBtn").addEventListener("click", closeDrawer);
    document.getElementById("tueCartBackBtn").addEventListener("click", showCartView);
  }

  function wireHeaderButton() {
    var btn = document.getElementById("cartToggleBtn");
    if (btn) {
      btn.addEventListener("click", function () {
        renderDrawer();
        openDrawer();
      });
    }
  }

  document.addEventListener("DOMContentLoaded", function () {
    buildDrawer();
    wireHeaderButton();
    renderBadge();
  });

  /* expose a small public API for shop page "Add to cart" buttons */
  window.TueCart = {
    add: addToCart,
    count: cartCount,
    subtotal: cartSubtotal,
    money: money
  };
})();
