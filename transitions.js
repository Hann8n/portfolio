/*
  Project transitions: decides which elements take part, and when to stand aside.
  The motion itself lives in transitions.css. Loaded with blocking="render" so
  the pagereveal listener is in place before the first frame.

  - Only the row being opened (or returned to) is named, so nothing else on
    the homepage moves.
  - On touch devices, browser back and forward (edge swipe, Android back) are
    left to the platform's own gesture: playing our animation after it would
    animate the same change twice. The in-page back link still animates.
  - Elements that are scrolled out of view don't take part, so nothing flies
    in from off-screen.
  - Anything that isn't homepage <-> case study (case to case, other pages)
    swaps instantly.
*/
(function () {
  "use strict";
  var NAMES = { surface: "vt-surface", icon: "vt-icon", title: "vt-title" };
  var BACK_FLAG = "vt-in-page-back";
  var root = document.documentElement;
  var isHome = root.classList.contains("page-home");
  var touch = matchMedia("(hover: none) and (pointer: coarse)");

  function path(url) {
    try { return new URL(url, location.href).pathname; } catch (e) { return ""; }
  }
  function isHomePath(p) { return p === "/" || p === "/index.html"; }
  function isCasePath(p) { return /^\/work\/[^/]+\/$/.test(p); }

  function inView(el) {
    var r = el.getBoundingClientRect();
    return r.bottom > 0 && r.top < innerHeight && r.right > 0 && r.left < innerWidth;
  }

  // Parts of the card on this page: the homepage row, or the case study sheet.
  function partsFor(scope) {
    return {
      surface: scope,
      icon: scope && scope.querySelector("[data-vt-part='icon']"),
      title: scope && scope.querySelector("[data-vt-part='title']")
    };
  }
  function currentParts(url) {
    if (isHome) {
      var row = Array.prototype.find.call(document.querySelectorAll("a[data-vt]"), function (a) {
        return path(a.href) === path(url);
      });
      return row && inView(row) ? partsFor(row) : null;
    }
    var p = partsFor(document.body);
    p.surface = document.querySelector("[data-vt-part='surface']");
    return p.surface ? p : null;
  }

  var named = [];
  function name(parts) {
    Object.keys(NAMES).forEach(function (key) {
      var el = parts[key];
      // The sheet is fixed to the viewport, so it always takes part; the
      // icon and title only when they are on screen.
      if (!el || (key !== "surface" && !inView(el))) return;
      el.style.viewTransitionName = NAMES[key];
      named.push(el);
    });
  }
  function clear() {
    named.forEach(function (el) { el.style.viewTransitionName = ""; });
    named = [];
  }
  function clearWhenDone(transition) {
    transition.finished.then(clear, clear);
  }

  function isPlatformBack(activation) {
    var inPage = false;
    try {
      inPage = sessionStorage.getItem(BACK_FLAG) === "1";
      sessionStorage.removeItem(BACK_FLAG);
    } catch (e) {}
    return activation.navigationType === "traverse" && touch.matches && !inPage;
  }

  // Leaving this page.
  addEventListener("pageswap", function (e) {
    clear();
    var to = e.activation && e.activation.entry && e.activation.entry.url;
    if (!e.viewTransition || !to) return;
    var toPath = path(to);
    var pairs = isHome ? isCasePath(toPath) : isHomePath(toPath);
    if (!pairs) return;
    var parts = currentParts(to);
    if (!parts) return;
    name(parts);
    clearWhenDone(e.viewTransition);
  });

  // Arriving on this page (including bfcache restores).
  addEventListener("pagereveal", function (e) {
    clear();
    if (!e.viewTransition) return;
    var activation = window.navigation && navigation.activation;
    var from = activation && activation.from && activation.from.url;
    var fromPath = from ? path(from) : "";
    var pairs = isHome ? isCasePath(fromPath) : isHomePath(fromPath);
    var parts = pairs && !isPlatformBack(activation) && currentParts(isHome ? from : location.href);
    if (!parts) {
      // Skipping rejects the transition's promises; that's expected here.
      e.viewTransition.ready.catch(function () {});
      e.viewTransition.skipTransition();
      return;
    }
    name(parts);
    clearWhenDone(e.viewTransition);
  });

  // In-page back link: return through history when the homepage is the
  // entry behind this one (keeps its scroll position), otherwise open it.
  document.addEventListener("click", function (e) {
    var link = e.target.closest && e.target.closest("a[data-vt-back]");
    if (!link || e.defaultPrevented || e.button !== 0 ||
        e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    try { sessionStorage.setItem(BACK_FLAG, "1"); } catch (err) {}
    var activation = window.navigation && navigation.activation;
    var from = activation && activation.from;
    if (from && from.sameDocument === false && isHomePath(path(from.url)) &&
        new URL(from.url).origin === location.origin) {
      e.preventDefault();
      history.back();
    }
  });

  // iOS only applies :active (the press state) when a touch listener exists.
  document.addEventListener("touchstart", function () {}, { passive: true });
})();
