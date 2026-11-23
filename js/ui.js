/* Pause menu and small UI bits. Deliberately dependency free: this file must
   keep working when the 3D module or the Three.js CDN fails to load. */
(function () {
  "use strict";

  const pause = document.getElementById("pause");
  if (!pause) return;

  const scroll = document.getElementById("pause-scroll");
  const closeBtn = document.getElementById("menu-close");
  const tabs = Array.from(document.querySelectorAll(".pause-tabs [data-menu-tab]"));
  const SECTIONS = ["proyek", "tentang", "kontak"];
  const body = document.body;

  let isOpen = false;
  let lastFocus = null;

  const api = window.portfolio3d || null;
  const threeD = () => window.portfolio3d || api;

  function setTab(name) {
    tabs.forEach((tab) => {
      tab.setAttribute("aria-selected", String(tab.dataset.menuTab === name));
    });
    const section = document.getElementById(name);
    if (section && scroll) {
      scroll.scrollTop = Math.max(0, section.offsetTop - 6);
    }
  }

  function open(name) {
    if (!isOpen) lastFocus = document.activeElement;
    isOpen = true;
    pause.hidden = false;
    body.dataset.menu = "open";
    if (body.dataset.panel === "open") {
      document.dispatchEvent(new CustomEvent("portfolio:closepanel"));
    }
    setTab(name || "proyek");
    if (closeBtn) closeBtn.focus({ preventScroll: true });
  }

  function close(options) {
    if (!isOpen) return;
    const restore = !options || options.restoreFocus !== false;
    isOpen = false;
    pause.hidden = true;
    body.dataset.menu = "closed";
    if (restore && lastFocus && typeof lastFocus.focus === "function") {
      lastFocus.focus({ preventScroll: true });
    }
  }

  window.pauseMenu = {
    open,
    close,
    isOpen: () => isOpen,
  };

  if (closeBtn) {
    closeBtn.addEventListener("click", () => close());
  }

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => setTab(tab.dataset.menuTab));
  });

  document.querySelectorAll("[data-menu-link]").forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      open(link.dataset.menuLink);
    });
  });

  document.querySelectorAll("[data-drive]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const index = Number(btn.dataset.drive);
      close({ restoreFocus: false });
      const world = threeD();
      if (world && typeof world.driveTo === "function") {
        world.driveTo(index);
      }
    });
  });

  if (scroll) {
    scroll.addEventListener("scroll", () => {
      const top = scroll.scrollTop + 90;
      let active = SECTIONS[0];
      SECTIONS.forEach((name) => {
        const section = document.getElementById(name);
        if (section && section.offsetTop <= top) active = name;
      });
      /* The last section is too short to reach the top, so it owns the bottom. */
      if (scroll.scrollTop + scroll.clientHeight >= scroll.scrollHeight - 6) {
        active = SECTIONS[SECTIONS.length - 1];
      }
      tabs.forEach((tab) => {
        tab.setAttribute("aria-selected", String(tab.dataset.menuTab === active));
      });
    });
  }

  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;
    if (body.dataset.panel === "open") return;
    if (isOpen) {
      close();
      return;
    }
    if (body.dataset.mode === "explore") {
      const world = threeD();
      if (world && typeof world.exitExplore === "function") {
        event.preventDefault();
        world.exitExplore();
      }
      return;
    }
    open("proyek");
  });

  /* Mail copy lives here so it also works without the 3D scene. */
  const copyBtn = document.getElementById("copy-mail");
  if (copyBtn) {
    /* The translator module loads after this file, so read it on demand. */
    const label = (key, fallback) => (window.i18n ? window.i18n.t(key) : fallback);
    copyBtn.addEventListener("click", async () => {
      const mail = copyBtn.dataset.mail;
      try {
        await navigator.clipboard.writeText(mail);
        copyBtn.textContent = label("copy.done", "Surel tersalin");
      } catch (error) {
        copyBtn.textContent = mail;
      }
      window.setTimeout(() => {
        copyBtn.textContent = label("copy.idle", "Salin alamat surel");
      }, 2400);
    });
    document.addEventListener("portfolio:lang", () => {
      if (copyBtn.textContent !== copyBtn.dataset.mail) {
        copyBtn.textContent = label("copy.idle", "Salin alamat surel");
      }
    });
  }
})();
