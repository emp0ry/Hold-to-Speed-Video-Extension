(() => {
  const api = (typeof browser !== "undefined") ? browser : chrome;

  const STORAGE_KEYS = {
    enabled: "hts_enabled",
    notify: "hts_notify",
    normalSpeed: "hts_normalSpeed",
    fastSpeed: "hts_fastSpeed",
    holdKey: "hts_holdKey"
  };

  const DEFAULTS = { enabled: true, notify: true, normalSpeed: 1.0, fastSpeed: 2.0, holdKey: "KeyZ" };

  function toKeyCodeFromChar(ch) {
    const c = String(ch || "").trim().toUpperCase();
    if (!c || c.length !== 1) return DEFAULTS.holdKey;
    const code = "Key" + c;
    if (code < "KeyA" || code > "KeyZ") return DEFAULTS.holdKey;
    return code;
  }

  function toCharFromKeyCode(code) {
    const m = /^Key([A-Z])$/.exec(String(code || ""));
    return m ? m[1] : "H";
  }

  async function getActiveTab() {
    const tabs = await api.tabs.query({ active: true, currentWindow: true });
    return tabs && tabs[0];
  }

  async function sendToActive(msg) {
    const tab = await getActiveTab();
    if (!tab || !tab.id) return;
    try { await api.tabs.sendMessage(tab.id, msg); } catch (_) {}
  }

  async function loadUI() {
    const store = api.storage?.sync || api.storage?.local;
    if (!store) return;

    const got = await store.get(Object.values(STORAGE_KEYS));
    const enabled = (got[STORAGE_KEYS.enabled] ?? DEFAULTS.enabled);
    const notify = (got[STORAGE_KEYS.notify] ?? DEFAULTS.notify);
    const normalSpeed = Number(got[STORAGE_KEYS.normalSpeed] ?? DEFAULTS.normalSpeed);
    const fastSpeed = Number(got[STORAGE_KEYS.fastSpeed] ?? DEFAULTS.fastSpeed);
    const holdKey = String(got[STORAGE_KEYS.holdKey] ?? DEFAULTS.holdKey);

    document.getElementById("enabled").checked = !!enabled;
    document.getElementById("notify").checked = !!notify;
    document.getElementById("normalSpeed").value = normalSpeed;
    document.getElementById("fastSpeed").value = fastSpeed;

    const ch = toCharFromKeyCode(holdKey);
    document.getElementById("holdKey").value = ch;
    document.getElementById("keyHint").textContent = ch;
}

  async function save(patch) {
    const store = api.storage?.sync || api.storage?.local;
    if (!store) return;
    await store.set(patch);
  }

  document.addEventListener("DOMContentLoaded", async () => {
    await loadUI();

    document.getElementById("enabled").addEventListener("change", async (e) => {
      const enabled = !!e.target.checked;
      await save({ [STORAGE_KEYS.enabled]: enabled });
      await sendToActive({ type: "setEnabled", enabled });
    });

    document.getElementById("notify").addEventListener("change", async (e) => {
      const enabled = !!e.target.checked;
      await save({ [STORAGE_KEYS.notify]: enabled });
      await sendToActive({ type: "setNotify", enabled });
    });

    document.getElementById("applyNormal").addEventListener("click", async () => {
      const v = Number(document.getElementById("normalSpeed").value);
      await save({ [STORAGE_KEYS.normalSpeed]: v });
      await sendToActive({ type: "setNormalSpeed", value: v });
    });

    document.getElementById("applyFast").addEventListener("click", async () => {
      const v = Number(document.getElementById("fastSpeed").value);
      await save({ [STORAGE_KEYS.fastSpeed]: v });
      await sendToActive({ type: "setFastSpeed", value: v });
    });

    document.getElementById("applyKey").addEventListener("click", async () => {
      const ch = document.getElementById("holdKey").value;
      const code = toKeyCodeFromChar(ch);
      await save({ [STORAGE_KEYS.holdKey]: code });
      const shown = code.replace(/^Key/, "");
      document.getElementById("keyHint").textContent = shown;
await sendToActive({ type: "setHoldKey", value: code });
    });
  });
})();