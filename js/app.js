(function () {
  "use strict";

  var C = window.VY_CONFIG;
  var BRANCHES = window.VY_BRANCHES;
  var MODELS = window.VY_MODELS;
  var CATEGORIES = window.VY_CATEGORIES;
  var HEX = window.VY_COLOUR_HEX;
  var HQ = BRANCHES[0];

  var state = { branchId: HQ.id, branchChosen: false, category: "all", colours: {} };
  try {
    var saved = localStorage.getItem("vy-branch");
    if (saved && BRANCHES.some(function (b) { return b.id === saved; })) { state.branchId = saved; state.branchChosen = true; }
  } catch (e) { /* storage blocked: the default is fine */ }

  /* ───────── helpers ───────── */

  function el(tag, attrs, kids) {
    var n = document.createElement(tag);
    Object.keys(attrs || {}).forEach(function (k) {
      var v = attrs[k];
      if (v == null || v === false) return;
      if (k === "class") n.className = v;
      else if (k === "text") n.textContent = v;
      else n.setAttribute(k, v === true ? "" : v);
    });
    [].concat(kids || []).forEach(function (c) { if (c != null) n.appendChild(typeof c === "string" ? document.createTextNode(c) : c); });
    return n;
  }
  function $(id) { return document.getElementById(id); }
  function clear(n) { while (n.firstChild) n.removeChild(n.firstChild); }

  function branch() { return BRANCHES.filter(function (b) { return b.id === state.branchId; })[0]; }
  /** Where a call to this branch actually goes: its own number, else the central hotline. */
  function dialOf(b) { return b.phone || C.hotline; }
  function waOf(b) { return b.whatsapp || b.phone || C.hotline; }
  function hasOwnLine(b) { return !!b.phone; }
  function pretty(d) { var m = /^91(\d{5})(\d{5})$/.exec(d); return m ? "+91 " + m[1] + " " + m[2] : "+" + d; }
  function waLink(number, text) { return "https://wa.me/" + number.replace(/\D/g, "") + "?text=" + encodeURIComponent(text); }
  function mapsLink(b) { return "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(b.name + ", " + b.address); }

  /* ───────── open / closed (computed in the dealership's time zone) ───────── */

  function nowParts() {
    var parts = new Intl.DateTimeFormat("en-US", { timeZone: C.timeZone, weekday: "short", hour: "numeric", minute: "numeric", hourCycle: "h23" }).formatToParts(new Date());
    var o = {};
    parts.forEach(function (p) { o[p.type] = p.value; });
    return { day: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(o.weekday), min: (+o.hour) * 60 + (+o.minute) };
  }
  function toMin(hhmm) { var p = hhmm.split(":"); return (+p[0]) * 60 + (+p[1]); }
  function fmt12(hhmm) {
    var m = toMin(hhmm), h = Math.floor(m / 60), mm = m % 60;
    return ((h % 12) || 12) + ":" + (mm < 10 ? "0" : "") + mm + " " + (h < 12 ? "AM" : "PM");
  }
  function statusOf(b) {
    var t = nowParts();
    var workingToday = !b.days || b.days.indexOf(t.day) !== -1;
    var open = workingToday && t.min >= toMin(b.open) && t.min < toMin(b.close);
    return { open: open, text: open ? "Open · closes " + fmt12(b.close) : "Closed · opens " + fmt12(b.open) };
  }
  function statusBadge(b) {
    var s = statusOf(b), detail = s.text.split(" · ")[1];
    return el("span", { class: "status " + (s.open ? "is-open" : "is-closed"), "data-status-for": b.id }, [el("span", { class: "sdot", "aria-hidden": "true", text: "●" }), s.open ? "Open" : "Closed", el("small", { text: "• " + detail.charAt(0).toUpperCase() + detail.slice(1) })]);
  }
  function refreshStatuses() {
    [].forEach.call(document.querySelectorAll("[data-status-for]"), function (node) {
      var b = BRANCHES.filter(function (x) { return x.id === node.getAttribute("data-status-for"); })[0];
      node.replaceWith(statusBadge(b));
    });
  }

  /* ───────── illustration shown when a model has no photo yet ───────── */

  function shade(hex, amt) {
    var n = parseInt(hex.slice(1), 16);
    var r = Math.max(0, Math.min(255, (n >> 16) + amt)), g = Math.max(0, Math.min(255, ((n >> 8) & 255) + amt)), b = Math.max(0, Math.min(255, (n & 255) + amt));
    return "#" + ((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1);
  }
  function illustration(type, colour) {
    var c = HEX[colour] || "#1f4fa3", d = shade(c, -28), s = 'stroke="rgba(0,0,0,.28)" stroke-width="1.5"';
    var wheel = function (x, y, r) { return '<circle cx="' + x + '" cy="' + y + '" r="' + r + '" fill="#15171b"/><circle cx="' + x + '" cy="' + y + '" r="' + (r - 9) + '" fill="#d7dbe2"/><circle cx="' + x + '" cy="' + y + '" r="' + (r - 22) + '" fill="#15171b"/>'; };
    var body;
    if (type === "scooter") {
      body = '<path d="M262 128 L272 60 L292 60 L320 124 L300 142 Z" fill="' + c + '" ' + s + '/>' +
        '<path d="M62 130 Q64 82 130 80 L200 84 L212 130 Z" fill="' + c + '" ' + s + '/>' +
        '<rect x="205" y="128" width="62" height="14" rx="7" fill="' + d + '" ' + s + '/>' +
        '<path d="M92 80 Q150 66 206 82 L206 91 L92 92 Z" fill="#1c1d21"/>' +
        '<path d="M284 60 L262 48" stroke="#2a2d33" stroke-width="6" stroke-linecap="round"/>' +
        '<circle cx="304" cy="84" r="7" fill="#f4f7ff" ' + s + '/>' +
        wheel(100, 162, 34) + wheel(306, 162, 34);
    } else {
      body = '<path d="M300 150 L268 72" stroke="#454952" stroke-width="7" stroke-linecap="round"/>' +
        '<path d="M96 150 L168 140" stroke="#454952" stroke-width="8" stroke-linecap="round"/>' +
        '<rect x="158" y="116" width="84" height="40" rx="8" fill="#2a2d33"/>' +
        '<path d="M64 104 L150 80 L152 114 L112 120 Z" fill="' + d + '" ' + s + '/>' +
        '<path d="M150 80 L216 60 L262 66 L292 100 L240 112 L190 120 L150 114 Z" fill="' + c + '" ' + s + '/>' +
        '<path d="M262 64 L238 54" stroke="#2a2d33" stroke-width="6" stroke-linecap="round"/>' +
        '<circle cx="288" cy="90" r="7" fill="#f4f7ff" ' + s + '/>' +
        wheel(96, 150, 48) + wheel(304, 150, 48);
    }
    return '<svg viewBox="0 0 400 220" role="img" aria-label="' + colour + ' illustration" class="illo"><ellipse cx="200" cy="205" rx="150" ry="9" fill="rgba(0,0,0,.14)"/>' + body + "</svg>";
  }

  /** Photos for a model in a colour: that colour's, else the "*" ones. Each entry in the data may be one path or an array. */
  function photoList(model, colour) {
    var p = model.photos || {}, v = p[colour] || p["*"];
    return v ? [].concat(v) : [];
  }
  /** Puts the model's photo (or illustration) in `box`. With `animate`, the previous image cross-fades out as the new one fades in. */
  function fillMedia(box, model, colour, src, animate) {
    src = src || photoList(model, colour)[0];
    var layer = el("div", { class: "layer" });
    var showIllo = function () { layer.innerHTML = illustration(model.type, colour); };
    if (!src) showIllo();
    else {
      var img = el("img", { src: src, alt: "Yamaha " + model.name + " in " + colour, loading: "lazy" });
      img.addEventListener("error", showIllo);
      layer.appendChild(img);
    }
    var old = [].slice.call(box.querySelectorAll(":scope > .layer:not(.is-leaving)"));
    if (animate && old.length) {
      old.forEach(function (o) { o.classList.add("is-leaving"); setTimeout(function () { if (o.parentNode) o.parentNode.removeChild(o); }, 320); });
      layer.classList.add("is-entering");
    } else clear(box);
    box.appendChild(layer);
  }

  /* ───────── small icons (Lucide Phone / ArrowUpRight / X; official WhatsApp mark) ───────── */

  var WA_PATH = "M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.3-.15-1.263-.465-2.403-1.485-.888-.795-1.484-1.77-1.66-2.07-.174-.3-.019-.465.13-.615.136-.135.301-.345.451-.52.146-.181.194-.301.297-.496.1-.21.049-.375-.025-.524-.075-.15-.672-1.62-.922-2.206-.24-.584-.487-.51-.672-.51-.172-.015-.371-.015-.571-.015-.2 0-.523.074-.797.359-.273.3-1.045 1.02-1.045 2.475s1.07 2.865 1.219 3.075c.149.18 2.095 3.195 5.076 4.483.709.3 1.263.489 1.694.626.712.226 1.36.195 1.871.12.571-.09 1.758-.72 2.006-1.41.248-.69.248-1.289.173-1.41-.074-.123-.272-.195-.57-.345m-5.446 7.443h-.016a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z";
  function svgNode(html) { var d = document.createElement("div"); d.innerHTML = html; return d.firstChild; }
  function stroke(size, inner) { return svgNode('<svg viewBox="0 0 24 24" width="' + size + '" height="' + size + '" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + inner + "</svg>"); }
  function waIcon(size) { return svgNode('<svg viewBox="0 0 24 24" width="' + size + '" height="' + size + '" fill="currentColor" aria-hidden="true"><path d="' + WA_PATH + '"/></svg>'); }
  function phoneIcon(size) { return stroke(size, '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>'); }
  function arrowUpRight(size) { return stroke(size, '<path d="M7 17 17 7M7 7h10v10"/>'); }
  function arrowRight(size) { return stroke(size, '<path d="M5 12h14M13 6l6 6-6 6"/>'); }
  function xIcon(size) { return stroke(size, '<path d="M18 6 6 18M6 6l12 12"/>'); }

  /* ───────── header, hero, branch picker ───────── */

  function renderChrome() {
    $("hotline-btn").href = "tel:+" + C.hotline;
    $("hotline-num").textContent = C.hotlineDisplay;
    [].forEach.call(document.querySelectorAll("[data-login]"), function (a) { a.href = C.loginUrl; });
    $("legal-name").textContent = C.legalName;
    $("copyright").textContent = "© " + new Date().getFullYear() + " " + C.legalName + " All rights reserved.";

    var menu = $("models-menu");
    CATEGORIES.filter(function (c) { return c.nav; }).forEach(function (c) {
      var a = el("a", { href: "#models", "data-cat": c.id, text: c.nav });
      menu.appendChild(el("li", {}, a));
    });

    var fc = $("footer-contact");
    fc.appendChild(el("li", {}, ["Support: ", el("a", { href: "tel:+" + C.hotline, text: C.hotlineDisplay })]));
    if (C.supportEmail) fc.appendChild(el("li", {}, ["Email: ", el("a", { href: "mailto:" + C.supportEmail, text: C.supportEmail })]));
    fc.appendChild(el("li", { text: "Showroom hours: " + fmt12(HQ.open) + " – " + fmt12(HQ.close) }));
    if (C.workingDays) fc.appendChild(el("li", { text: "Working days: " + C.workingDays }));
    fc.appendChild(el("li", {}, el("a", { href: "#showrooms", text: "All six showrooms →" })));
  }

  /** Builds the showroom pills once, then only slides the white indicator behind the selected one. */
  function renderChips() {
    var box = $("branch-chips");
    if (!box.children.length) {
      box.classList.add("no-anim");
      box.appendChild(el("span", { class: "chip-ind", "aria-hidden": "true" }));
      BRANCHES.forEach(function (b) { box.appendChild(el("button", { type: "button", class: "chip", "data-branch": b.id, text: b.chip })); });
    }
    [].forEach.call(box.querySelectorAll(".chip"), function (c) {
      var on = c.getAttribute("data-branch") === state.branchId;
      c.classList.toggle("is-on", on);
      c.setAttribute("aria-pressed", on ? "true" : "false");
    });
    placeChips();
  }
  function placeChips() {
    var box = $("branch-chips"), on = box.querySelector(".chip.is-on"), ind = box.querySelector(".chip-ind");
    if (!on || !ind) return;
    ind.style.width = on.offsetWidth + "px";
    ind.style.height = on.offsetHeight + "px";
    ind.style.transform = "translate(" + on.offsetLeft + "px," + on.offsetTop + "px)";
    if (box.classList.contains("no-anim")) requestAnimationFrame(function () { requestAnimationFrame(function () { box.classList.remove("no-anim"); }); });
  }

  var pickedShown = false;
  function renderPicked() {
    var b = branch(), box = $("picked");
    clear(box);
    box.appendChild(el("div", { class: "picked-info" }, [
      el("strong", { text: b.name }),
      statusBadge(b),
      el("span", { class: "muted", text: b.address }),
    ]));
    box.appendChild(el("div", { class: "picked-actions" }, [
      el("a", { class: "hbtn hbtn-call", href: "tel:+" + dialOf(b) }, [phoneIcon(16), hasOwnLine(b) ? "Call " + pretty(b.phone) : "Call Central Hotline"]),
      el("a", { class: "hbtn hbtn-wa", href: waLink(waOf(b), "Hi " + b.name + ", I'd like to know more about Yamaha bikes and scooters."), target: "_blank", rel: "noopener" }, [waIcon(16), "WhatsApp"]),
    ]));
    if (!hasOwnLine(b)) box.appendChild(el("p", { class: "note", text: "This showroom's direct line is being updated. Calls and WhatsApp go to our central team, who will connect you." }));

    $("testride-btn").href = waLink(waOf(b), "Hi " + b.name + ", I'd like to book a test ride. Please let me know the available slots.");
    $("models-branch").textContent = b.name;

    // After the first paint, a branch change fades and slides the details up instead of snapping them.
    if (pickedShown) { box.classList.remove("swap"); void box.offsetWidth; box.classList.add("swap"); }
    pickedShown = true;
  }

  /* ───────── vehicle grid ───────── */

  /** Builds the pills once, then only moves the sliding indicator behind the active one. */
  function renderPills() {
    var box = $("category-pills");
    if (!box.children.length) {
      box.classList.add("no-anim"); // the first placement should not slide in from the corner
      box.appendChild(el("span", { class: "pill-ind", "aria-hidden": "true" }));
      CATEGORIES.forEach(function (c) { box.appendChild(el("button", { type: "button", class: "pill", "data-cat": c.id, text: c.label })); });
    }
    [].forEach.call(box.querySelectorAll(".pill"), function (p) {
      var on = p.getAttribute("data-cat") === state.category;
      p.classList.toggle("is-on", on);
      p.setAttribute("aria-pressed", on ? "true" : "false");
    });
    placePills();
  }
  function placePills() {
    var box = $("category-pills"), on = box.querySelector(".pill.is-on"), ind = box.querySelector(".pill-ind");
    if (!on || !ind) return;
    ind.style.width = on.offsetWidth + "px";
    ind.style.height = on.offsetHeight + "px";
    ind.style.transform = "translate(" + on.offsetLeft + "px," + on.offsetTop + "px)";
    if (box.scrollWidth > box.clientWidth) box.scrollTo({ left: Math.max(0, on.offsetLeft - 24), behavior: "smooth" });
    if (box.classList.contains("no-anim")) requestAnimationFrame(function () { requestAnimationFrame(function () { box.classList.remove("no-anim"); }); });
  }
  var pillTimer;
  window.addEventListener("resize", function () {
    clearTimeout(pillTimer);
    pillTimer = setTimeout(function () {
      $("category-pills").classList.add("no-anim"); placePills();
      $("branch-chips").classList.add("no-anim"); placeChips();
    }, 120);
  });


  function colourOf(model) { return state.colours[model.id] || model.colours[0]; }

  /* ───────── vehicle cards ───────── */

  function fmtPrice(n) { return n >= 100000 ? "₹" + (n / 100000).toFixed(2).replace(/0$/, "") + " L" : "₹" + n.toLocaleString("en-IN"); }
  function shortPower(s) { return s.split(" @")[0]; }
  function shortBrake(s) { return s.replace("-channel ABS", " ABS").replace(/\s*\(variant\)/, ""); }
  function modelById(id) { return MODELS.filter(function (m) { return m.id === id; })[0]; }
  function enquiryLink(model, colour, b) { return waLink(waOf(b), "Hi " + b.name + ", I'm interested in the Yamaha " + model.name + " (" + colour + "). Please share availability and details."); }
  function inShowroom(model, b) { return (model.inShowroom || []).indexOf(b.id) !== -1; }

  function stockBadge(model) {
    var shop = inShowroom(model, branch());
    return el("span", { class: "glass badge " + (shop ? "is-shop" : "is-yard") }, [el("span", { class: "pulse", "aria-hidden": "true" }), shop ? "Available at Showroom" : "Fast Yard Delivery"]);
  }
  function priceTag(model) {
    if (!C.showPrices || !model.exShowroom) return null;
    return el("span", { class: "glass price-tag", title: C.priceNote }, [el("b", { text: "From " + fmtPrice(model.exShowroom) + "*" }), el("small", { text: "Ex-Showroom" })]);
  }
  function swatchDots(model, colour) {
    return el("div", { class: "dots", role: "group", "aria-label": "Colour" }, model.colours.map(function (c) {
      return el("button", { type: "button", class: "dot-btn" + (c === colour ? " is-on" : ""), "data-model": model.id, "data-colour": c, "aria-label": c, "aria-pressed": c === colour ? "true" : "false", title: c, style: "--sw:" + (HEX[c] || "#888") });
    }));
  }
  function specTile(label, value) { return el("div", {}, [el("dt", { text: label }), el("dd", { text: value })]); }

  function renderCard(model) {
    var colour = colourOf(model), b = branch();
    var media = el("div", { class: "media" });
    fillMedia(media, model, colour);

    var actions = el("div", { class: "card-actions" }, [
      el("div", { class: "card-btns" }, [
        el("a", { class: "cbtn cbtn-wa", "data-wa": model.id, href: enquiryLink(model, colour, b), target: "_blank", rel: "noopener", "aria-label": "Enquire on WhatsApp about the " + model.name, title: "Enquire on WhatsApp" }, [waIcon(16), el("span", { text: "Enquire" })]),
        el("button", { type: "button", class: "cbtn cbtn-specs", "data-open": model.id, "aria-haspopup": "dialog" }, [el("span", { text: "View Specs" }), arrowRight(14)]),
      ]),
    ]);
    if (model.brochure) actions.appendChild(el("div", { class: "card-links" }, el("a", { class: "link-btn", href: model.brochure, target: "_blank", rel: "noopener", download: true, text: "Download Brochure" })));

    return el("article", { class: "card", "data-card": model.id }, [
      el("div", { class: "stage" }, [stockBadge(model), priceTag(model), media]),
      el("div", { class: "card-body" }, [
        el("p", { class: "series", text: model.series }),
        el("h3", {}, el("button", { type: "button", class: "card-open", "data-open": model.id, "aria-haspopup": "dialog", text: "Yamaha " + model.name })),
        el("p", { class: "tagline", text: model.tagline }),
        el("div", { class: "swatches" }, [swatchDots(model, colour), el("span", { class: "colour-name", text: colour })]),
        el("dl", { class: "specs" }, [specTile("Engine", model.specs.engine), specTile("Mileage", model.specs.mileage), specTile("Power", shortPower(model.specs.power)), specTile("Braking", shortBrake(model.specs.braking))]),
        actions,
      ]),
    ]);
  }

  /** Switch a model's preview colour on its card and, if its detail sheet is open, there too. */
  function setColour(model, colour) {
    state.colours[model.id] = colour;
    var card = document.querySelector('[data-card="' + model.id + '"]');
    if (card) {
      fillMedia(card.querySelector(".media"), model, colour, null, true);
      card.querySelector(".colour-name").textContent = colour;
      [].forEach.call(card.querySelectorAll(".dot-btn"), function (d) {
        var on = d.getAttribute("data-colour") === colour;
        d.classList.toggle("is-on", on);
        d.setAttribute("aria-pressed", on ? "true" : "false");
      });
      card.querySelector("[data-wa]").href = enquiryLink(model, colour, branch());
    }
    if (modal.id === model.id) { modal.photo = 0; modal.fade = true; renderModal(); }
  }

  function renderGrid() {
    var grid = $("model-grid");
    clear(grid);
    var list = MODELS.filter(function (m) { return state.category === "all" || m.category === state.category; });
    list.forEach(function (m) { grid.appendChild(renderCard(m)); });
  }

  /* ───────── showroom cards ───────── */

  function renderShowrooms() {
    var grid = $("showroom-grid");
    clear(grid);
    BRANCHES.forEach(function (b) {
      var own = hasOwnLine(b);
      grid.appendChild(el("article", { class: "showroom" + (b.id === HQ.id ? " is-hq" : ""), id: "showroom-" + b.id }, [
        el("div", { class: "showroom-head" }, [
          el("h3", { text: b.name }),
          statusBadge(b),
        ]),
        el("dl", { class: "info" }, [
          el("div", {}, [el("dt", { text: "Address" }), el("dd", {}, [b.address, " ", el("a", { class: "dir-link", href: mapsLink(b), target: "_blank", rel: "noopener" }, ["Directions", arrowUpRight(12)])])]),
          el("div", {}, [el("dt", { text: "Phone" }), el("dd", { text: own ? pretty(b.phone) : C.hotlineDisplay + " (central hotline)" })]),
          el("div", {}, [el("dt", { text: "WhatsApp" }), el("dd", { text: pretty(waOf(b)) + (b.whatsapp || own ? "" : " (central)") })]),
          el("div", {}, [el("dt", { text: "Hours" }), el("dd", { text: fmt12(b.open) + " – " + fmt12(b.close) })]),
        ]),
        el("div", { class: "showroom-actions" }, [
          el("a", { class: "btn-call", href: "tel:+" + dialOf(b) }, [phoneIcon(15), "Call Showroom"]),
          el("a", { class: "btn-wa-soft", href: waLink(waOf(b), "Hi " + b.name + ", I'd like some information."), target: "_blank", rel: "noopener" }, [waIcon(15), "WhatsApp Us"]),
        ]),
      ]));
    });
  }

  /* ───────── events ───────── */

  function setBranch(id) {
    state.branchId = id;
    state.branchChosen = true;
    try { localStorage.setItem("vy-branch", id); } catch (e) { /* ignore */ }
    renderChips();
    renderPicked();
    renderGrid();
    renderFloat();
  }
  function setCategory(id) {
    state.category = id;
    renderPills();
    renderGrid();
  }

  document.addEventListener("click", function (e) {
    var t = e.target.closest ? e.target : e.target.parentNode;
    var chip = t.closest("[data-branch]");
    if (chip) return setBranch(chip.getAttribute("data-branch"));

    var cat = t.closest("[data-cat]");
    if (cat) {
      setCategory(cat.getAttribute("data-cat"));
      closeMenu();
      return; // an <a href="#models"> still scrolls to the grid
    }

    var dot = t.closest(".dot-btn");
    if (dot) return setColour(modelById(dot.getAttribute("data-model")), dot.getAttribute("data-colour"));

    var opener = t.closest("[data-open]");
    if (opener) return openModal(opener.getAttribute("data-open"));
    if (t.closest("[data-close]")) return dlg.close();
    var tabBtn = t.closest("[data-tab]");
    if (tabBtn) { modal.tab = tabBtn.getAttribute("data-tab"); return renderModal(); }
    var thumb = t.closest("[data-photo]");
    if (thumb) { modal.photo = +thumb.getAttribute("data-photo"); return renderModal(); }

    if (t.closest(".main-nav a")) closeMenu();
  });

  var toggle = $("menu-toggle"), nav = $("main-nav");
  function closeMenu() {
    nav.classList.remove("is-open");
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-label", "Open menu");
  }
  toggle.addEventListener("click", function () {
    var open = nav.classList.toggle("is-open");
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeMenu(); });

  /* ───────── vehicle detail sheet (native <dialog>: focus trap, Esc and backdrop come built in) ───────── */

  var dlg = $("vd"), inner = $("vd-inner");
  var modal = { id: null, tab: "photos", photo: 0 };
  var SPEC_ROWS = [["Engine", "engine"], ["Mileage", "mileage"], ["Max power", "power"], ["Max torque", "torque"], ["Kerb weight", "weight"], ["Seat height", "seatHeight"], ["Braking", "braking"]];

  function openModal(id) {
    modal.id = id; modal.tab = "photos"; modal.photo = 0;
    renderModal();
    document.documentElement.classList.add("modal-open");
    if (typeof dlg.showModal === "function") dlg.showModal(); else dlg.setAttribute("open", "");
  }
  dlg.addEventListener("close", function () { modal.id = null; document.documentElement.classList.remove("modal-open"); clear(inner); });
  dlg.addEventListener("click", function (e) { if (e.target === dlg) dlg.close(); }); // a click on the backdrop

  /** Drag (or arrow keys) to rotate through a frame sequence. Only used when a model has `spin` set in the data. */
  function spinViewer(model, colour) {
    var cfg = model.spin, slug = colour.toLowerCase().replace(/[^a-z0-9]+/g, "-"), idx = 0, startX = null, startIdx = 0;
    var url = function (n) { return cfg.src.replace("{colour}", slug).replace("{n}", n + 1); };
    var img = el("img", { src: url(0), alt: "360° view of the " + model.name + " in " + colour, draggable: "false" });
    var box = el("div", { class: "spin", tabindex: "0", role: "group", "aria-label": "360 degree view. Drag, or use the left and right arrow keys, to rotate." }, [img, el("span", { class: "spin-hint", text: "Drag to rotate" })]);
    var go = function (n) { idx = ((n % cfg.frames) + cfg.frames) % cfg.frames; img.src = url(idx); };
    img.addEventListener("error", function () { clear(box); box.appendChild(el("p", { class: "vd-note", text: "360° view is not available for this colour yet." })); });
    box.addEventListener("pointerdown", function (e) { startX = e.clientX; startIdx = idx; box.setPointerCapture(e.pointerId); });
    box.addEventListener("pointermove", function (e) { if (startX !== null) go(startIdx + Math.round((startX - e.clientX) / 12)); });
    box.addEventListener("pointerup", function () { startX = null; });
    box.addEventListener("pointercancel", function () { startX = null; });
    box.addEventListener("keydown", function (e) {
      if (e.key === "ArrowRight") { go(idx + 1); e.preventDefault(); } else if (e.key === "ArrowLeft") { go(idx - 1); e.preventDefault(); }
    });
    for (var i = 1; i < cfg.frames; i++) new Image().src = url(i); // warm the cache so dragging is smooth
    return box;
  }

  function availRow(model, colour, br, yours) {
    var own = hasOwnLine(br);
    return el("div", { class: "avail-row" + (yours ? " is-yours" : "") }, [
      el("div", { class: "avail-top" }, [
        el("div", {}, [yours ? el("small", { text: "Your showroom" }) : null, el("strong", { text: br.name })]),
        el("div", { class: "avail-pills" }, [el("span", { class: "avail-pill " + (inShowroom(model, br) ? "is-shop" : "is-yard"), text: inShowroom(model, br) ? "Available at Showroom" : "Fast Yard Delivery" }), statusBadge(br)]),
      ]),
      el("div", { class: "avail-actions" }, [
        el("a", { class: "btn-wa-soft", href: enquiryLink(model, colour, br), target: "_blank", rel: "noopener" }, [waIcon(14), "WhatsApp"]),
        el("a", { class: "btn-call", href: "tel:+" + dialOf(br) }, [phoneIcon(14), "Call"]),
        own ? null : el("span", { class: "muted", text: "via central hotline" }),
      ]),
    ]);
  }

  function renderModal() {
    var model = modelById(modal.id);
    if (!model) return;
    var colour = colourOf(model), b = branch();
    var scroller = inner.querySelector(".vd-scroll"), top = scroller ? scroller.scrollTop : 0;
    var fa = document.activeElement, focusSel = null;
    if (fa && inner.contains(fa)) {
      var k = fa.getAttribute("data-colour") ? ["data-colour", fa.getAttribute("data-colour")] : fa.getAttribute("data-tab") ? ["data-tab", fa.getAttribute("data-tab")] : fa.getAttribute("data-photo") ? ["data-photo", fa.getAttribute("data-photo")] : null;
      if (k) focusSel = "[" + k[0] + '="' + k[1] + '"]';
    }
    clear(inner);

    var photos = photoList(model, colour);
    if (modal.photo >= photos.length) modal.photo = 0;
    if (modal.tab === "spin" && !model.spin) modal.tab = "photos";

    var media = el("div", { class: "media" });
    if (modal.tab === "spin") media.appendChild(spinViewer(model, colour));
    else {
      fillMedia(media, model, colour, photos[modal.photo]);
      if (modal.fade) media.firstChild.classList.add("is-entering"); // colour switch inside the sheet: fade the new image in
    }
    modal.fade = false;
    var stageCol = el("div", { class: "vd-stage-col" }, [el("div", { class: "stage vd-stage" }, [stockBadge(model), media])]);

    if (model.spin) {
      stageCol.appendChild(el("div", { class: "vd-tabs", role: "group", "aria-label": "View" }, [["photos", "Photos"], ["spin", "360° View"]].map(function (t) {
        return el("button", { type: "button", class: "tab-btn" + (modal.tab === t[0] ? " is-on" : ""), "data-tab": t[0], "aria-pressed": modal.tab === t[0] ? "true" : "false", text: t[1] });
      })));
    }
    if (modal.tab === "photos" && photos.length > 1) {
      stageCol.appendChild(el("div", { class: "thumbs" }, photos.map(function (src, i) {
        return el("button", { type: "button", class: "thumb" + (i === modal.photo ? " is-on" : ""), "data-photo": String(i), "aria-label": "Photo " + (i + 1) }, el("img", { src: src, alt: "" }));
      })));
    }
    stageCol.appendChild(el("div", { class: "vd-colours" }, [swatchDots(model, colour), el("span", { class: "colour-name", text: colour })]));
    if (modal.tab === "photos" && !photos.length) stageCol.appendChild(el("p", { class: "vd-note", text: "Illustration shown. Official studio photos coming soon." }));

    var section = function (title, body) { return el("section", { class: "vd-sec" }, [el("h4", { text: title }), body]); };
    var yours = state.branchChosen ? b : null;
    var rows = (yours ? [yours] : []).concat(BRANCHES.filter(function (x) { return x !== yours; }));
    var info = el("div", { class: "vd-info" }, [
      el("p", { class: "series", text: model.series }),
      el("h2", { id: "vd-title", text: "Yamaha " + model.name }),
      el("p", { class: "tagline", text: model.tagline }),
      C.showPrices && model.exShowroom ? el("div", { class: "vd-price" }, [el("b", { text: "From " + fmtPrice(model.exShowroom) + "*" }), el("span", { text: "Ex-Showroom" }), el("p", { class: "fineprint", text: C.priceNote })]) : null,
      section("Specifications", el("dl", { class: "specs vd-specs" }, SPEC_ROWS.filter(function (r) { return model.specs[r[1]]; }).map(function (r) { return specTile(r[0], model.specs[r[1]]); }))),
      model.features && model.features.length ? section("Key features", el("ul", { class: "feat" }, model.features.map(function (f) { return el("li", { text: f }); }))) : null,
      section("Showroom availability", el("div", { class: "avail" }, rows.map(function (br) { return availRow(model, colour, br, br === yours); }))),
    ]);

    var bar = el("div", { class: "vd-bar" }, [el("a", { class: "btn btn-wa btn-pill", href: enquiryLink(model, colour, b), target: "_blank", rel: "noopener" }, [waIcon(18), "Enquire on WhatsApp · " + b.chip])]);
    if (model.brochure) bar.appendChild(el("a", { class: "btn btn-outline btn-pill", href: model.brochure, target: "_blank", rel: "noopener", download: true, text: "Download Brochure" }));

    inner.appendChild(el("button", { type: "button", class: "vd-close", "data-close": "1", "aria-label": "Close details" }, xIcon(18)));
    var sc = el("div", { class: "vd-scroll" }, [el("div", { class: "vd-grid" }, [stageCol, info]), bar]);
    inner.appendChild(sc);
    sc.scrollTop = top;
    if (focusSel) { var again = inner.querySelector(focusSel); if (again) again.focus({ preventScroll: true }); }
  }

  /* ───────── floating WhatsApp widget ───────── */

  var floatBtn = $("wa-btn"), floatBubble = $("wa-bubble"), floatDot = $("wa-dot"), floatStatus = $("wa-status");
  var BASE_MSG = "Hi Vijayagiri Yamaha, I would like to know more about vehicle models and pricing.";

  /**
   * The widget talks to the 24/7 WhatsApp bot, so it is always "online" and does not look at the showroom clock.
   * It always goes to the bot's number; if the visitor has picked a showroom, that is added to the message as context.
   */
  function renderFloat() {
    var msg = state.branchChosen ? BASE_MSG + " I am near the " + branch().chip + " showroom." : BASE_MSG;
    floatBtn.href = waLink(C.botWhatsapp, msg);
    floatBtn.setAttribute("aria-label", "Chat with Vijayagiri Yamaha AI on WhatsApp (24/7 instant bot reply)");
    floatDot.classList.add("is-online");
    if (!floatStatus.firstChild) {
      floatStatus.appendChild(el("span", { class: "pulse", "aria-hidden": "true" }));
      floatStatus.appendChild(document.createTextNode("24/7 Instant WhatsApp Bot • Always Available"));
    }
  }

  /* The prompt bubble appears on hover/focus, or by itself 4 s after load; × dismisses it for the rest of the visit. */
  var bubbleDismissed = false, bubbleTimer = null, bubbleHover = false;
  try { bubbleDismissed = sessionStorage.getItem("vy-wa-dismissed") === "1"; } catch (e) { /* ignore */ }
  function showBubble() { if (!bubbleDismissed) { floatBubble.hidden = false; clearTimeout(bubbleTimer); } }
  function hideBubble() { floatBubble.hidden = true; clearTimeout(bubbleTimer); }
  var floatBox = $("wa-float");
  floatBox.addEventListener("mouseenter", function () { bubbleHover = true; showBubble(); });
  floatBox.addEventListener("mouseleave", function () { bubbleHover = false; bubbleTimer = setTimeout(hideBubble, 1500); });
  floatBtn.addEventListener("focus", showBubble);
  $("wa-close").addEventListener("click", function () {
    bubbleDismissed = true;
    try { sessionStorage.setItem("vy-wa-dismissed", "1"); } catch (e) { /* ignore */ }
    hideBubble();
  });
  setTimeout(function () {
    if (bubbleDismissed) return;
    showBubble();
    bubbleTimer = setTimeout(function () { if (!bubbleHover) hideBubble(); }, 10000);
  }, 4000);

  /* ───────── theme (html.dark / html.light, saved in localStorage) ───────── */

  var SUN = '<svg class="i-sun" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2m-7.07-15.07 1.41 1.41m11.32 11.32 1.41 1.41M2 12h2m16 0h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/></svg>';
  var MOON = '<svg class="i-moon" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>';
  var themeBtn = $("theme-toggle");

  function isDark() { return document.documentElement.classList.contains("dark"); }
  function applyTheme(t) {
    var r = document.documentElement;
    r.classList.remove("dark", "light");
    r.classList.add(t);
    r.setAttribute("data-theme", t);
    r.style.colorScheme = t;
    themeBtn.setAttribute("aria-pressed", t === "dark" ? "true" : "false");
    themeBtn.title = t === "dark" ? "Switch to light mode" : "Switch to dark mode";
  }
  function savedTheme() { try { return localStorage.getItem("vy-theme"); } catch (e) { return null; } }

  /* Icons are added only now that the page is running (the "mounted" step), reflecting the theme the head script already applied. */
  themeBtn.innerHTML = SUN + MOON;
  applyTheme(isDark() ? "dark" : "light");
  themeBtn.addEventListener("click", function () {
    var next = isDark() ? "light" : "dark";
    applyTheme(next);
    try { localStorage.setItem("vy-theme", next); } catch (e) { /* the choice just won't persist */ }
  });
  if (window.matchMedia) {
    var mq = matchMedia("(prefers-color-scheme: dark)");
    var onSystem = function (e) { if (!savedTheme()) applyTheme(e.matches ? "dark" : "light"); };
    if (mq.addEventListener) mq.addEventListener("change", onSystem); else if (mq.addListener) mq.addListener(onSystem);
  }

  /* ───────── red stripe effects: lay the pulse/spark box exactly on the hero's red stripe ───────── */

  /**
   * The stripe is the 66%–68% band of a 115° CSS gradient, so where it falls depends on the hero's size. This works out
   * that line and rotates/sizes .stripe-fx onto it, re-running whenever the hero is resized.
   */
  function initStripeFx() {
    var hero = document.querySelector(".hero"), fx = $("stripe-fx");
    if (!hero || !fx) return;
    var A = 115 * Math.PI / 180, DX = Math.sin(A), DY = -Math.cos(A);   // gradient direction on screen (y points down)
    var TILT = A - Math.PI / 2, COS = Math.cos(TILT);                    // the stripe leans 25° from vertical
    var UX = -Math.sin(TILT), UY = COS;                                  // unit vector along the stripe, pointing down
    function place() {
      var W = hero.offsetWidth, H = hero.offsetHeight;
      var L = Math.abs(W * DX) + Math.abs(H * DY);                       // CSS gradient line length
      var off = (0.67 - 0.5) * L;                                        // stripe centre, measured from the hero centre
      var px = W / 2 + off * DX, py = H / 2 + off * DY;                  // a point on the stripe
      var mid = (H / 2 - py) / UY;                                       // slide to the middle of the part inside the hero
      var len = H / COS + 160;                                           // visible length plus 80px margin each end
      fx.style.left = (px + UX * mid) + "px";
      fx.style.top = (py + UY * mid) + "px";
      fx.style.width = (0.02 * L) + "px";                                // same thickness as the stripe
      fx.style.height = len + "px";
      fx.style.transform = "translate(-50%,-50%) rotate(" + (TILT * 180 / Math.PI) + "deg)";
      fx.classList.add("is-placed");
    }
    place();
    if ("ResizeObserver" in window) new ResizeObserver(place).observe(hero); else window.addEventListener("resize", place);
  }

  /* ───────── scroll reveal: fade up 15px as sections enter the viewport, cards staggered 50ms ───────── */

  function initReveal() {
    if (!("IntersectionObserver" in window) || (window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches)) return;
    var targets = [].slice.call(document.querySelectorAll(".section-head, #showroom-grid .showroom, .about > div:first-child, .facts li"));
    var io = new IntersectionObserver(function (entries) {
      var i = 0;
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        var n = e.target;
        io.unobserve(n);
        n.style.setProperty("--d", (i++ * 50) + "ms");
        n.classList.add("is-visible");
        var done = function () { n.classList.remove("reveal", "is-visible"); n.style.removeProperty("--d"); };
        n.addEventListener("transitionend", function onEnd(ev) { if (ev.target === n && ev.propertyName === "opacity") { n.removeEventListener("transitionend", onEnd); done(); } });
        setTimeout(done, 1600); // safety net
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });
    targets.forEach(function (n) { n.classList.add("reveal"); io.observe(n); });
  }

  /* ───────── go ───────── */

  renderChrome();
  renderChips();
  renderPicked();
  renderPills();
  renderGrid();
  renderShowrooms();
  renderFloat();
  initReveal();
  initStripeFx();
  setInterval(refreshStatuses, 60 * 1000);
})();
