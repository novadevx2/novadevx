/* NovaDevx — site interactions */
(function () {
  "use strict";

  var header = document.querySelector("[data-header]");
  var toggle = document.querySelector("[data-menu-toggle]");
  var mobileNav = document.querySelector("[data-mobile-nav]");
  var desktopQuery = window.matchMedia("(min-width: 901px)");
  var menuOpen = false;

  /* Current year -------------------------------------------------------- */
  document.querySelectorAll("[data-year]").forEach(function (node) {
    node.textContent = String(new Date().getFullYear());
  });

  /* Header shadow on scroll --------------------------------------------- */
  if (header) {
    var updateHeader = function () {
      header.classList.toggle("is-scrolled", window.scrollY > 8);
    };
    updateHeader();
    window.addEventListener("scroll", updateHeader, { passive: true });
  }

  /* Mobile navigation --------------------------------------------------- */
  if (toggle && mobileNav) {
    var mobileLinks = Array.prototype.slice.call(
      mobileNav.querySelectorAll("a[href]")
    );

    var openMenu = function () {
      if (menuOpen) return;
      menuOpen = true;
      mobileNav.classList.add("is-open");
      toggle.setAttribute("aria-expanded", "true");
      toggle.setAttribute("aria-label", "Close menu");
      document.body.classList.add("nav-open");

      window.requestAnimationFrame(function () {
        if (mobileLinks[0]) mobileLinks[0].focus();
      });
    };

    var closeMenu = function (returnFocus) {
      if (!menuOpen) return;
      menuOpen = false;
      mobileNav.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
      toggle.setAttribute("aria-label", "Open menu");
      document.body.classList.remove("nav-open");

      if (returnFocus) toggle.focus();
    };

    toggle.addEventListener("click", function () {
      if (menuOpen) {
        closeMenu(true);
      } else {
        openMenu();
      }
    });

    mobileLinks.forEach(function (link) {
      link.addEventListener("click", function () {
        closeMenu(false);
      });
    });

    document.addEventListener("keydown", function (event) {
      if (!menuOpen) return;

      if (event.key === "Escape") {
        event.preventDefault();
        closeMenu(true);
        return;
      }

      if (event.key !== "Tab") return;

      var trap = [toggle].concat(mobileLinks);
      var first = trap[0];
      var last = trap[trap.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    });

    document.addEventListener("click", function (event) {
      if (!menuOpen) return;
      if (header && header.contains(event.target)) return;
      closeMenu(false);
    });

    var onDesktopChange = function (event) {
      if (event.matches) closeMenu(false);
    };

    if (desktopQuery.addEventListener) {
      desktopQuery.addEventListener("change", onDesktopChange);
    } else {
      desktopQuery.addListener(onDesktopChange);
    }
  }

  /* Scroll reveal ------------------------------------------------------- */
  var revealItems = Array.prototype.slice.call(
    document.querySelectorAll("[data-reveal]")
  );

  var reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  if (
    reduceMotion ||
    !("IntersectionObserver" in window) ||
    revealItems.length === 0
  ) {
    revealItems.forEach(function (item) {
      item.classList.add("is-visible");
    });
  } else {
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 }
    );

    revealItems.forEach(function (item) {
      observer.observe(item);
    });
  }
})();
