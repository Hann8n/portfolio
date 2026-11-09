/*
  Project sheet.

  Opening a project from the homepage shows its case study in a sheet over
  the page instead of loading a new one. The case study pages stay real
  pages: they are what links, search engines, and a reload see, and this
  script only borrows their content.

  Ways out, all ending in the same animation:
  - Back (button, keyboard, Android gesture); on iOS a swipe back that the
    browser already animated just removes the sheet without animating again.
  - Close button, Escape, or a click on the dimmed page.
*/
(function () {
  "use strict";

  var sheet = document.querySelector("dialog.sheet");
  if (!sheet || typeof sheet.showModal !== "function") return;

  var root = document.documentElement;
  var scroller = sheet.querySelector(".sheet-scroll");
  var host = sheet.querySelector(".sheet-content");
  var closeButton = sheet.querySelector(".sheet-close");
  // Opened directly, the server already rendered the case study in place.
  var shadow = host.shadowRoot || host.attachShadow({ mode: "open" });
  var homeTitle = sheet.dataset.homeTitle || document.title;
  var themeMeta = null;
  var cache = new Map();
  var current = null;      // URL of the project in the sheet
  var closing = false;
  var browserAnimatedBack = false; // the browser's own back animation ran

  // ---- Loading -----------------------------------------------------------

  function load(url) {
    var key = new URL(url, location.href).pathname;
    if (!cache.has(key)) {
      // "?sheet" asks for the bare case study, not the page the server
      // builds for someone opening the link directly.
      cache.set(key, fetch(key + "?sheet", { credentials: "same-origin" })
        .then(function (r) {
          if (!r.ok) throw new Error(r.status);
          return r.text();
        })
        .then(parse)
        .catch(function (err) { cache.delete(key); throw err; }));
    }
    return cache.get(key);
  }

  function parse(html) {
    var doc = new DOMParser().parseFromString(html, "text/html");
    var css = Array.prototype.map.call(doc.querySelectorAll("head style"), function (s) {
      return s.textContent;
    }).join("\n")
      // Fonts are already loaded by the homepage; page-level rules apply
      // to the sheet's own root instead.
      .replace(/@font-face\s*\{[^}]*\}/g, "")
      .replace(/:root/g, ":host")
      .replace(/(^|\})\s*body\s*\{[^}]*\}/g, "$1");
    var page = doc.body.querySelector(":scope > div");
    if (!page) throw new Error("No case study content");
    var back = page.querySelector(".case-back");
    if (back) back.remove();
    var theme = doc.querySelector('meta[name="theme-color"]');
    return {
      title: doc.title,
      // Keep in step with SHEET_EXTRA_CSS in src/index.ts.
      css: css + "\n:host{display:block}" +
        // Use the wider sheet on larger screens and start closer to the top.
        "\n@media (min-width:48rem){:host>div{padding-top:36px!important}main{max-width:760px!important}}",
      html: page.outerHTML,
      theme: theme && theme.content
    };
  }

  function render(data) {
    shadow.innerHTML = "<style>" + data.css + "</style>" + data.html;
    var page = shadow.firstElementChild.nextElementSibling;
    var bg = getComputedStyle(page).backgroundColor;
    sheet.style.setProperty("--sheet-bg", bg);
    sheet.style.color = getComputedStyle(page).color;
    var heading = shadow.querySelector("h1");
    sheet.setAttribute("aria-label", heading ? heading.textContent : "Project");
    document.title = data.title;
    scroller.scrollTop = 0;
  }

  // Status bar and toolbar take the shade's colour while a sheet is up.
  var shadeEl = document.querySelector(".sheet-shade");
  function matchBrowserBars() {
    if (!shadeEl) return;
    // Read the colour back as plain rgb; color-mix() computes to a form some
    // browsers won't take in theme-color.
    var ctx = document.createElement("canvas").getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = getComputedStyle(shadeEl).backgroundColor;
    ctx.fillRect(0, 0, 1, 1);
    var p = ctx.getImageData(0, 0, 1, 1).data;
    if (p[3] === 255) setTheme("rgb(" + p[0] + "," + p[1] + "," + p[2] + ")"); // phones only
  }

  function setTheme(color) {
    if (!themeMeta) {
      themeMeta = document.createElement("meta");
      themeMeta.name = "theme-color";
      // Ahead of the page's own theme-color tags, so it takes precedence.
      document.head.insertBefore(themeMeta, document.head.querySelector('meta[name="theme-color"]'));
    }
    if (color) themeMeta.content = color;
    else { themeMeta.remove(); themeMeta = null; }
  }

  // ---- Opening and closing -----------------------------------------------

  function open(url, push) {
    return load(url).then(function (data) {
      var path = new URL(url, location.href).pathname;
      render(data);
      current = path;
      if (push) history.pushState({ sheet: path }, "", path);
      if (sheet.open) return;
      closing = false;
      root.classList.add("sheet-locked");
      sheet.showModal();
      // Start from below the screen, then rise on the next frame.
      sheet.getBoundingClientRect();
      // Two frames: the first paints the sheet below the screen, so the rise
      // starts from a committed frame instead of jumping.
      requestAnimationFrame(function () {
        requestAnimationFrame(function () {
          sheet.classList.add("is-open");
          root.classList.add("sheet-presented");
          matchBrowserBars();
          sheet.addEventListener("transitionend", function settle(e) {
            if (e.target !== sheet) return;
            sheet.removeEventListener("transitionend", settle);
            if (sheet.classList.contains("is-open")) sheet.classList.add("is-settled");
          });
        });
      });
    });
  }

  function finish() {
    if (!sheet.open) return;
    sheet.close();
    sheet.classList.remove("is-dragging");
    sheet.style.transform = "";
    sheet.style.transition = "";
    root.classList.remove("sheet-locked", "sheet-presented", "sheet-dragging");
    shadow.innerHTML = "";
    document.title = homeTitle;
    setTheme(null);
    current = null;
    closing = false;
  }

  // Animate the sheet away. `instant` when something else already animated.
  function dismiss(instant) {
    if (!sheet.open || closing) return;
    closing = true;
    if (instant) {
      sheet.classList.add("is-dragging");
      sheet.classList.remove("is-open", "is-settled");
      root.classList.remove("sheet-presented");
      finish();
      return;
    }
    sheet.classList.remove("is-open", "is-dragging", "is-settled");
    root.classList.remove("sheet-presented", "sheet-dragging");
    sheet.style.transform = "";
    var done = false;
    function end(e) {
      if (done || (e && (e.target !== sheet))) return;
      done = true;
      sheet.removeEventListener("transitionend", end);
      finish();
    }
    sheet.addEventListener("transitionend", end);
    setTimeout(end, 600); // in case no transition runs
  }

  // Every way of closing goes through history, so Back stays in step.
  function requestClose() {
    if (history.state && history.state.sheet) return history.back();
    // Opened directly: there is no homepage entry to go back to, so turn
    // this entry into the homepage instead.
    if (location.pathname !== "/") history.replaceState(null, "", "/");
    dismiss(false);
  }

  // ---- History -----------------------------------------------------------

  if (window.navigation) {
    navigation.addEventListener("navigate", function (e) {
      browserAnimatedBack = !!e.hasUAVisualTransition;
    });
  }

  addEventListener("popstate", function (e) {
    var state = e.state && e.state.sheet;
    var animated = browserAnimatedBack;
    browserAnimatedBack = false;
    if (state) {
      open(state, false).catch(function () { location.reload(); });
    } else if (sheet.open) {
      dismiss(animated);
    }
  });

  // ---- Triggers ----------------------------------------------------------

  function projectLink(target) {
    var a = target.closest && target.closest("a[href^='/work/']");
    if (!a) return null;
    return /^\/work\/[^/]+\/$/.test(new URL(a.href).pathname) ? a : null;
  }

  function isPlainClick(e) {
    return e.button === 0 && !e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey;
  }

  document.addEventListener("click", function (e) {
    var a = projectLink(e.target);
    if (!a || !isPlainClick(e) || sheet.open) return;
    e.preventDefault();
    open(a.href, true).catch(function () { location.href = a.href; });
  });

  // Links between case studies swap the sheet's content in place.
  shadow.addEventListener("click", function (e) {
    var a = projectLink(e.composedPath()[0]);
    if (!a || !isPlainClick(e)) return;
    e.preventDefault();
    load(a.href).then(function (data) {
      render(data);
      current = new URL(a.href).pathname;
      history.replaceState({ sheet: current }, "", current);
    }).catch(function () { location.href = a.href; });
  });

  // Start loading as soon as someone shows intent.
  ["pointerenter", "focusin", "touchstart"].forEach(function (type) {
    document.addEventListener(type, function (e) {
      var a = projectLink(e.target);
      if (a) load(a.href).catch(function () {});
    }, { passive: true, capture: type === "pointerenter" });
  });

  closeButton.addEventListener("click", requestClose);
  sheet.addEventListener("cancel", function (e) {
    e.preventDefault();
    requestClose();
  });
  sheet.addEventListener("click", function (e) {
    if (e.target !== sheet) return;
    var r = sheet.getBoundingClientRect();
    var outside = e.clientY < r.top || e.clientY > r.bottom ||
      e.clientX < r.left || e.clientX > r.right;
    if (outside) requestClose();
  });

  // ---- Opened directly ---------------------------------------------------

  if (sheet.open && shadow.firstElementChild) {
    // Already on screen from the server's HTML: make it modal without
    // replaying the entrance.
    current = location.pathname;
    sheet.classList.add("is-dragging");
    root.classList.add("sheet-dragging");
    sheet.close();
    sheet.showModal();
    sheet.focus();
    var page = shadow.firstElementChild.nextElementSibling;
    if (page) {
      var bg = getComputedStyle(page).backgroundColor;
      sheet.style.setProperty("--sheet-bg", bg);
      sheet.style.color = getComputedStyle(page).color;
    }
    sheet.classList.add("is-settled");
    matchBrowserBars();
    var heading = shadow.querySelector("h1");
    if (heading) sheet.setAttribute("aria-label", heading.textContent);
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        sheet.classList.remove("is-dragging");
        root.classList.remove("sheet-dragging");
      });
    });
  }

  // Restored from the back/forward cache with a sheet still showing.
  addEventListener("pageshow", function (e) {
    if (e.persisted && sheet.open && !(history.state && history.state.sheet)) finish();
  });
})();
