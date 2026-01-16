(() => {
  const api = (typeof browser !== "undefined") ? browser : chrome;

  const STORAGE_KEYS = {
    enabled: "hts_enabled",
    normalSpeed: "hts_normalSpeed",
    fastSpeed: "hts_fastSpeed",
    holdKey: "hts_holdKey",      // KeyboardEvent.code, e.g. "KeyZ"
    notify: "hts_notify"         // show toast notifications
  };

  const DEFAULTS = {
    enabled: true,
    normalSpeed: 1.0,
    fastSpeed: 2.0,
    holdKey: "KeyZ",
    notify: true
  };

  let state = { ...DEFAULTS };
  let holding = false;
  let savedRates = new WeakMap();

  function isEditableTarget(el) {
    if (!el) return false;
    const tag = (el.tagName || "").toLowerCase();
    return tag === "input" || tag === "textarea" || el.isContentEditable;
  }

  function getVideos() {
    return Array.from(document.querySelectorAll("video"));
  }

  function toast(text) {
    if (!state.notify) return;
    const id = "hts_toast";
    let el = document.getElementById(id);
    if (!el) {
      el = document.createElement("div");
      el.id = id;
      el.style.cssText = [
        "position: fixed",
        "z-index: 2147483647",
        "top: 14px",
        "right: 14px",
        "padding: 10px 12px",
        "border-radius: 12px",
        "background: rgba(20, 20, 28, 0.86)",
        "color: #fff",
        "font: 13px/1.2 system-ui, -apple-system, Segoe UI, Roboto, Arial",
        "backdrop-filter: blur(8px)",
        "box-shadow: 0 12px 30px rgba(0,0,0,.25)",
        "transform: translateY(-6px)",
        "opacity: 0",
        "transition: opacity 140ms ease, transform 140ms ease",
        "pointer-events: none"
      ].join(";");
      document.documentElement.appendChild(el);
    }
    el.textContent = text;
    requestAnimationFrame(() => {
      el.style.opacity = "1";
      el.style.transform = "translateY(0)";
    });
    clearTimeout(el._htsTimer);
    el._htsTimer = setTimeout(() => {
      el.style.opacity = "0";
      el.style.transform = "translateY(-6px)";
    }, 900);
  }

  async function loadState() {
    try {
      const store = api.storage?.sync || api.storage?.local;
      if (!store) return;
      const got = await store.get(Object.values(STORAGE_KEYS));
      state.enabled = (got[STORAGE_KEYS.enabled] ?? DEFAULTS.enabled);
      state.normalSpeed = Number(got[STORAGE_KEYS.normalSpeed] ?? DEFAULTS.normalSpeed);
      state.fastSpeed = Number(got[STORAGE_KEYS.fastSpeed] ?? DEFAULTS.fastSpeed);
      state.holdKey = String(got[STORAGE_KEYS.holdKey] ?? DEFAULTS.holdKey);
      state.notify = (got[STORAGE_KEYS.notify] ?? DEFAULTS.notify);
    } catch (_) {}
  }

  async function saveState(patch) {
    try {
      const store = api.storage?.sync || api.storage?.local;
      if (!store) return;
      await store.set(patch);
    } catch (_) {}
  }

  function holdFast() {
    if (!state.enabled) return;
    const vids = getVideos();
    vids.forEach(v => {
      if (!savedRates.has(v)) savedRates.set(v, v.playbackRate);
      try { v.playbackRate = state.fastSpeed; } catch (_) {}
    });
    toast(`Fast x${state.fastSpeed}`);
  }

  function releaseToSaved() {
    const vids = getVideos();
    vids.forEach(v => {
      const prev = savedRates.get(v);
      if (typeof prev === "number") {
        try { v.playbackRate = prev; } catch (_) {}
      }
      savedRates.delete(v);
    });
    toast("Normal");
  }

  function onKeyDown(e) {
    if (e.code !== state.holdKey) return;
    if (isEditableTarget(e.target)) return;
    if (holding) return;
    holding = true;
    holdFast();
  }

  function onKeyUp(e) {
    if (e.code !== state.holdKey) return;
    if (!holding) return;
    holding = false;
    releaseToSaved();
  }

  api.runtime.onMessage.addListener((msg) => {
    if (!msg || typeof msg !== "object") return;
    if (msg.type === "setEnabled") {
      state.enabled = !!msg.enabled;
      saveState({ [STORAGE_KEYS.enabled]: state.enabled });
      toast(state.enabled ? "Enabled" : "Disabled");
    }
    if (msg.type === "setNotify") {
      state.notify = !!msg.enabled;
      saveState({ [STORAGE_KEYS.notify]: state.notify });
      if (state.notify) toast("Notifications on");
    }
    if (msg.type === "setNormalSpeed") {
      state.normalSpeed = Number(msg.value) || DEFAULTS.normalSpeed;
      saveState({ [STORAGE_KEYS.normalSpeed]: state.normalSpeed });
      getVideos().forEach(v => { try { v.playbackRate = state.normalSpeed; } catch (_) {} });
      toast(`Normal x${state.normalSpeed}`);
    }
    if (msg.type === "setFastSpeed") {
      state.fastSpeed = Number(msg.value) || DEFAULTS.fastSpeed;
      saveState({ [STORAGE_KEYS.fastSpeed]: state.fastSpeed });
      toast(`Fast x${state.fastSpeed}`);
    }
    if (msg.type === "setHoldKey") {
      state.holdKey = String(msg.value || DEFAULTS.holdKey);
      saveState({ [STORAGE_KEYS.holdKey]: state.holdKey });
      toast(`Key: ${state.holdKey.replace(/^Key/, "")}`);
    }
  });

  (async () => {
    await loadState();
    document.addEventListener("keydown", onKeyDown, true);
    document.addEventListener("keyup", onKeyUp, true);
  })();
})();