(function () {
  "use strict";

  const API_BASE = (window.COSMOS_CONFIG && window.COSMOS_CONFIG.apiBase) || "";
  const app = document.getElementById("app");

  function apiUrl(path) { return API_BASE + path; }

  const state = {
    step: "loading-init",
    wants: { zodiac: null, chart: null, enneagram: null },
    data: { date: null, time: null, utcOffset: null, latitude: null, longitude: null, place: null, answers: {} },
    chartQuestions: [],
    chartIndex: 0,
    enneagramQuestions: [], // [{id, text}] obtenidas de la API
    enneagramIndex: 0,
    placeSearchResults: [],
    placeSelectedIndex: null,
    manualLocation: false,
    results: null,
    error: null
  };

  // ---------- Utilidades ----------

  function el(tag, props, children) {
    const node = document.createElement(tag);
    if (props) {
      Object.entries(props).forEach(([k, v]) => {
        if (k === "class") node.className = v;
        else if (k === "html") node.innerHTML = v;
        else if (k.startsWith("on") && typeof v === "function") node.addEventListener(k.slice(2), v);
        else node.setAttribute(k, v);
      });
    }
    (children || []).forEach(child => {
      if (child === null || child === undefined) return;
      node.appendChild(typeof child === "string" ? document.createTextNode(child) : child);
    });
    return node;
  }

  function progressBar(current, total, label) {
    const pct = Math.round((current / total) * 100);
    return el("div", { class: "progress-wrap" }, [
      el("div", { class: "progress-label" }, [`${label} · Pregunta ${current} de ${total}`]),
      el("div", { class: "progress-track" }, [el("div", { class: "progress-fill", style: `width:${pct}%` })])
    ]);
  }

  function render() {
    app.innerHTML = "";
    const renderers = {
      "loading-init": renderLoadingInit,
      "ask-zodiac": renderAskZodiac,
      "q-date": renderDateQuestion,
      "ask-chart": renderAskChart,
      "q-chart": renderChartQuestion,
      "ask-enneagram": renderAskEnneagram,
      "q-enneagram": renderEnneagramQuestion,
      "loading": renderLoading,
      "results": renderResults,
      "error": renderError
    };
    const fn = renderers[state.step] || renderError;
    app.appendChild(fn());
  }

  // ---------- Paso inicial: cargar preguntas de eneagrama desde la API ----------

  function renderLoadingInit() {
    return el("div", { class: "card", style: "text-align:center;" }, ["Cargando…"]);
  }

  async function init() {
    try {
      const res = await fetch(apiUrl("/api/archetypes/questions"));
      const json = await res.json();
      state.enneagramQuestions = shuffle(json.enneagram.questions.slice());
    } catch (err) {
      state.enneagramQuestions = [];
      state.initError = "No se pudo conectar con la API de Cosmos (" + apiUrl("/api/archetypes/questions") + "). Verifica que el servidor esté corriendo.";
    }
    state.step = "ask-zodiac";
    render();
  }

  function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  // ---------- Paso 1: Signo zodiacal + horóscopo chino ----------

  function renderAskZodiac() {
    return el("div", { class: "card" }, [
      el("p", { class: "gate-intro" }, ["Se te pedirá 1 pregunta: tu fecha de nacimiento."]),
      el("p", { class: "gate-question" }, ["¿Quieres conocer tu signo zodiacal y tu horóscopo chino?"]),
      el("div", { class: "gate-actions" }, [
        el("button", { class: "btn-primary", onclick: () => answerAskZodiac(true) }, ["Sí, quiero"]),
        el("button", { class: "btn-secondary", onclick: () => answerAskZodiac(false) }, ["No, gracias"])
      ])
    ]);
  }

  function answerAskZodiac(yes) {
    state.wants.zodiac = yes;
    state.step = yes ? "q-date" : "ask-chart";
    render();
  }

  function renderDateQuestion() {
    const input = el("input", { type: "date", id: "dateInput", required: "required" });
    const continueBtn = el("button", { class: "btn-primary", onclick: () => {
      if (!input.value) { input.reportValidity(); return; }
      state.data.date = input.value;
      state.step = "ask-chart";
      render();
    } }, ["Continuar"]);

    return el("div", { class: "card question-card" }, [
      progressBar(1, 1, "Signo Zodiacal y Horóscopo Chino"),
      el("div", { class: "question-text" }, ["¿Cuál es tu fecha de nacimiento?"]),
      el("div", { class: "question-field" }, [input]),
      el("div", { class: "question-actions" }, [continueBtn])
    ]);
  }

  // ---------- Paso 2: Carta astral ----------

  function getChartQuestionList() {
    const qs = [];
    if (!state.data.date) qs.push("date");
    qs.push("time");
    qs.push("place");
    return qs;
  }

  function renderAskChart() {
    const qs = getChartQuestionList();
    const labels = { date: "fecha de nacimiento", time: "hora de nacimiento", place: "lugar de nacimiento" };
    const listText = qs.map(q => labels[q]).join(", ");
    return el("div", { class: "card" }, [
      el("p", { class: "gate-intro" }, [`Se te pedirán ${qs.length} pregunta${qs.length > 1 ? "s" : ""}: ${listText}.`]),
      el("p", { class: "gate-question" }, ["¿Quieres conocer tu carta astral (Sol, Luna y Ascendente)?"]),
      el("div", { class: "gate-actions" }, [
        el("button", { class: "btn-primary", onclick: () => answerAskChart(true) }, ["Sí, quiero"]),
        el("button", { class: "btn-secondary", onclick: () => answerAskChart(false) }, ["No, gracias"])
      ])
    ]);
  }

  function answerAskChart(yes) {
    state.wants.chart = yes;
    if (yes) {
      state.chartQuestions = getChartQuestionList();
      state.chartIndex = 0;
      state.step = "q-chart";
    } else {
      state.step = "ask-enneagram";
    }
    render();
  }

  function renderChartQuestion() {
    const kind = state.chartQuestions[state.chartIndex];
    const total = state.chartQuestions.length;
    const current = state.chartIndex + 1;

    const backBtn = el("button", { class: "btn-link", onclick: goBackInChart }, ["← Atrás"]);

    if (kind === "date") {
      const input = el("input", { type: "date", required: "required" });
      const continueBtn = el("button", { class: "btn-primary", onclick: () => {
        if (!input.value) { input.reportValidity(); return; }
        state.data.date = input.value;
        advanceChart();
      } }, ["Continuar"]);
      return el("div", { class: "card question-card" }, [
        progressBar(current, total, "Carta Astral"),
        el("div", { class: "question-text" }, ["¿Cuál es tu fecha de nacimiento?"]),
        el("div", { class: "question-field" }, [input]),
        el("div", { class: "question-actions" }, [current > 1 ? backBtn : null, continueBtn])
      ]);
    }

    if (kind === "time") {
      const input = el("input", { type: "time", required: "required" });
      const continueBtn = el("button", { class: "btn-primary", onclick: () => {
        if (!input.value) { input.reportValidity(); return; }
        state.data.time = input.value;
        advanceChart();
      } }, ["Continuar"]);
      return el("div", { class: "card question-card" }, [
        progressBar(current, total, "Carta Astral"),
        el("div", { class: "question-text" }, ["¿A qué hora naciste? (lo más exacta posible)"]),
        el("div", { class: "question-field" }, [input]),
        el("div", { class: "question-actions" }, [current > 1 ? backBtn : null, continueBtn])
      ]);
    }

    // kind === "place"
    return renderPlaceQuestion(current, total, backBtn);
  }

  function advanceChart() {
    state.chartIndex++;
    if (state.chartIndex >= state.chartQuestions.length) {
      state.step = "ask-enneagram";
    }
    render();
  }

  function goBackInChart() {
    if (state.chartIndex > 0) {
      state.chartIndex--;
      render();
    } else {
      state.step = "ask-chart";
      render();
    }
  }

  function renderPlaceQuestion(current, total, backBtn) {
    const placeInput = el("input", { type: "text", placeholder: "Ej: Bogotá, Colombia" });
    const searchBtn = el("button", { class: "btn-secondary", onclick: () => searchPlace(placeInput.value) }, ["Buscar"]);
    const statusEl = el("div", { class: "place-status" }, [state.placeStatus || ""]);
    const resultsWrap = el("div", { class: "place-results" });

    state.placeSearchResults.forEach((r, i) => {
      const label = [r.name, r.admin1, r.country].filter(Boolean).join(", ");
      const opt = el("button", {
        class: "place-option" + (state.placeSelectedIndex === i ? " selected" : ""),
        onclick: () => selectPlace(i)
      }, [`${label} (${r.latitude.toFixed(2)}, ${r.longitude.toFixed(2)})`]);
      resultsWrap.appendChild(opt);
    });

    const manualToggle = el("button", { class: "btn-link", onclick: () => { state.manualLocation = !state.manualLocation; render(); } },
      [state.manualLocation ? "Buscar por nombre de lugar" : "Ingresar coordenadas manualmente"]);

    const manualWrap = el("div", { class: "manual-location", hidden: state.manualLocation ? undefined : "hidden" });
    const latInput = el("input", { type: "number", step: "any", placeholder: "4.71", value: state.data.latitude ?? "" });
    const lonInput = el("input", { type: "number", step: "any", placeholder: "-74.07", value: state.data.longitude ?? "" });
    const utcInput = el("input", { type: "number", step: "0.5", placeholder: "-5", value: state.data.utcOffset ?? "" });
    manualWrap.appendChild(el("div", { class: "field" }, [el("label", {}, ["Latitud"]), latInput]));
    manualWrap.appendChild(el("div", { class: "field" }, [el("label", {}, ["Longitud"]), lonInput]));
    manualWrap.appendChild(el("div", { class: "field" }, [el("label", {}, ["Desfase UTC"]), utcInput]));

    const continueBtn = el("button", { class: "btn-primary", onclick: () => {
      if (state.manualLocation) {
        const lat = parseFloat(latInput.value), lon = parseFloat(lonInput.value), utc = parseFloat(utcInput.value);
        if (!Number.isFinite(lat) || !Number.isFinite(lon) || !Number.isFinite(utc)) {
          state.placeStatus = "Completa latitud, longitud y desfase UTC.";
          render();
          return;
        }
        state.data.latitude = lat;
        state.data.longitude = lon;
        state.data.utcOffset = utc;
        state.data.place = placeInput.value || null;
      } else {
        if (state.placeSelectedIndex === null) {
          state.placeStatus = "Busca y selecciona tu lugar de nacimiento, o ingresa coordenadas manualmente.";
          render();
          return;
        }
      }
      state.placeSearchResults = [];
      state.placeSelectedIndex = null;
      state.placeStatus = "";
      advanceChart();
    } }, ["Continuar"]);

    return el("div", { class: "card question-card", style: "text-align:left;" }, [
      progressBar(current, total, "Carta Astral"),
      el("div", { class: "question-text", style: "text-align:center;" }, ["¿Dónde naciste?"]),
      el("div", { class: "place-search-row" }, [placeInput, searchBtn]),
      statusEl,
      resultsWrap,
      el("div", { style: "text-align:center; margin-top:8px;" }, [manualToggle]),
      manualWrap,
      el("div", { class: "question-actions" }, [current > 1 ? backBtn : null, continueBtn])
    ]);
  }

  async function searchPlace(query) {
    if (!query || !query.trim()) { state.placeStatus = "Escribe un lugar para buscar."; render(); return; }
    state.placeStatus = "Buscando…";
    state.placeSearchResults = [];
    state.placeSelectedIndex = null;
    render();
    try {
      const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=8&language=es&format=json`;
      const res = await fetch(url);
      const json = await res.json();
      const results = json.results || [];
      if (results.length === 0) {
        state.placeStatus = "No se encontraron resultados. Puedes ingresar coordenadas manualmente.";
      } else {
        state.placeSearchResults = results;
        state.placeStatus = "Selecciona el lugar correcto:";
        selectPlace(0, query);
        return;
      }
    } catch (err) {
      state.placeStatus = "No se pudo buscar (¿sin conexión a internet?). Ingresa coordenadas manualmente.";
    }
    render();
  }

  function selectPlace(index, rawQuery) {
    const r = state.placeSearchResults[index];
    if (!r) return;
    state.placeSelectedIndex = index;
    state.data.latitude = Number(r.latitude.toFixed(4));
    state.data.longitude = Number(r.longitude.toFixed(4));
    state.data.place = [r.name, r.admin1, r.country].filter(Boolean).join(", ");
    try {
      state.data.utcOffset = computeUtcOffsetHours(r.timezone, state.data.date, state.data.time);
    } catch (err) {
      state.data.utcOffset = null;
    }
    render();
  }

  function computeUtcOffsetHours(timezone, dateStr, timeStr) {
    const [y, m, d] = (dateStr || todayISO()).split("-").map(Number);
    const [hh, mm] = (timeStr || "12:00").split(":").map(Number);
    const instant = new Date(Date.UTC(y, m - 1, d, hh, mm));
    const dtf = new Intl.DateTimeFormat("en-US", { timeZone: timezone, timeZoneName: "longOffset" });
    const part = dtf.formatToParts(instant).find(p => p.type === "timeZoneName");
    if (!part) throw new Error("No se pudo determinar el desfase UTC");
    if (part.value === "GMT") return 0;
    const match = part.value.match(/GMT([+-])(\d{2}):(\d{2})/);
    if (!match) throw new Error("Formato de desfase no reconocido");
    const sign = match[1] === "-" ? -1 : 1;
    return sign * (parseInt(match[2], 10) + parseInt(match[3], 10) / 60);
  }

  function todayISO() { return new Date().toISOString().slice(0, 10); }

  // ---------- Paso 3: Eneagrama ----------

  function renderAskEnneagram() {
    const total = state.enneagramQuestions.length || 45;
    return el("div", { class: "card" }, [
      el("p", { class: "gate-intro" }, [`Se te harán ${total} preguntas (afirmaciones) que responderás en una escala del 1 (muy en desacuerdo) al 5 (muy de acuerdo).`]),
      el("p", { class: "gate-question" }, ["¿Quieres conocer tu eneatipo?"]),
      el("div", { class: "gate-actions" }, [
        el("button", { class: "btn-primary", onclick: () => answerAskEnneagram(true) }, ["Sí, quiero"]),
        el("button", { class: "btn-secondary", onclick: () => answerAskEnneagram(false) }, ["No, gracias"])
      ])
    ]);
  }

  function answerAskEnneagram(yes) {
    state.wants.enneagram = yes;
    if (yes) {
      state.enneagramIndex = 0;
      state.step = "q-enneagram";
      render();
    } else {
      submitAndShowResults();
    }
  }

  function renderEnneagramQuestion() {
    const total = state.enneagramQuestions.length;
    const q = state.enneagramQuestions[state.enneagramIndex];
    const current = state.enneagramIndex + 1;
    const selectedValue = state.data.answers[q.id];

    const scale = el("div", { class: "likert-scale" });
    for (let v = 1; v <= 5; v++) {
      const btn = el("button", {
        class: "likert-btn" + (selectedValue === v ? " selected" : ""),
        onclick: () => answerEnneagramQuestion(q.id, v)
      }, [el("span", { class: "num" }, [String(v)])]);
      scale.appendChild(btn);
    }

    const backBtn = el("button", { class: "btn-link", onclick: goBackInEnneagram }, ["← Atrás"]);

    return el("div", { class: "card question-card" }, [
      progressBar(current, total, "Eneagrama"),
      el("div", { class: "question-text" }, [q.text]),
      el("div", { class: "likert-edges" }, [el("span", {}, ["Muy en desacuerdo"]), el("span", {}, ["Muy de acuerdo"])]),
      scale,
      el("div", { class: "question-actions" }, [current > 1 ? backBtn : null])
    ]);
  }

  function answerEnneagramQuestion(id, value) {
    state.data.answers[id] = value;
    state.enneagramIndex++;
    if (state.enneagramIndex >= state.enneagramQuestions.length) {
      submitAndShowResults();
    } else {
      render();
    }
  }

  function goBackInEnneagram() {
    if (state.enneagramIndex > 0) {
      state.enneagramIndex--;
      render();
    } else {
      state.step = "ask-enneagram";
      render();
    }
  }

  // ---------- Envío final y resultados ----------

  function renderLoading() {
    return el("div", { class: "card", style: "text-align:center;" }, ["Calculando tus arquetipos…"]);
  }

  async function submitAndShowResults() {
    state.step = "loading";
    render();

    const body = {};
    if (state.data.date) body.date = state.data.date;
    if (state.data.time) body.time = state.data.time;
    if (state.data.utcOffset !== null && state.data.utcOffset !== undefined) body.utcOffset = state.data.utcOffset;
    if (state.data.latitude !== null && state.data.latitude !== undefined) body.latitude = state.data.latitude;
    if (state.data.longitude !== null && state.data.longitude !== undefined) body.longitude = state.data.longitude;
    if (state.data.place) body.place = state.data.place;
    if (Object.keys(state.data.answers).length > 0) body.answers = state.data.answers;

    try {
      const res = await fetch(apiUrl("/api/archetypes/calculate"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });
      if (!res.ok) throw new Error("La API respondió con un error.");
      state.results = await res.json();
      state.activeTab = null;
      state.step = "results";
    } catch (err) {
      state.error = "No se pudo calcular tus arquetipos. Verifica que la API de Cosmos esté corriendo en " + apiUrl("") + ".";
      state.step = "error";
    }
    render();
  }

  function renderError() {
    return el("div", { class: "card" }, [
      el("p", { class: "error-box" }, [state.error || state.initError || "Ocurrió un error inesperado."]),
      el("div", { style: "text-align:center; margin-top:12px;" }, [
        el("button", { class: "btn-primary", onclick: restart }, ["Volver a empezar"])
      ])
    ]);
  }

  function restart() {
    state.step = "loading-init";
    state.wants = { zodiac: null, chart: null, enneagram: null };
    state.data = { date: null, time: null, utcOffset: null, latitude: null, longitude: null, place: null, answers: {} };
    state.chartQuestions = [];
    state.chartIndex = 0;
    state.enneagramIndex = 0;
    state.placeSearchResults = [];
    state.placeSelectedIndex = null;
    state.manualLocation = false;
    state.results = null;
    state.error = null;
    render();
    init();
  }

  const TAB_DEFS = [
    { key: "zodiac", label: "Zodiaco" },
    { key: "chinese", label: "Horóscopo Chino" },
    { key: "birthChart", label: "Carta Astral" },
    { key: "enneagram", label: "Eneatipo" }
  ];

  function renderResults() {
    const r = state.results || {};
    const available = TAB_DEFS.filter(t => r[t.key]);

    if (available.length === 0) {
      return el("div", { class: "card" }, [
        el("p", { style: "text-align:center;" }, ["No seleccionaste ningún arquetipo para calcular."]),
        el("div", { style: "text-align:center; margin-top:12px;" }, [el("button", { class: "btn-primary", onclick: restart }, ["Volver a empezar"])])
      ]);
    }

    if (!state.activeTab || !available.find(t => t.key === state.activeTab)) {
      state.activeTab = available[0].key;
    }

    const tabs = el("div", { class: "tabs" });
    available.forEach(t => {
      tabs.appendChild(el("button", {
        class: "tab-btn" + (state.activeTab === t.key ? " active" : ""),
        onclick: () => { state.activeTab = t.key; render(); }
      }, [t.label]));
    });

    const panel = el("div", { class: "card tab-panel" }, [renderTabContent(state.activeTab, r)]);

    const notes = (r.notes && r.notes.length)
      ? el("div", { class: "result-notes" }, [el("p", {}, ["Notas: " + r.notes.join(" ")])])
      : null;

    return el("div", {}, [
      tabs,
      panel,
      notes,
      el("div", { style: "text-align:center; margin-top:20px;" }, [el("button", { class: "btn-secondary", onclick: restart }, ["Volver a empezar"])])
    ]);
  }

  function chips(list) {
    return el("div", { class: "qualities" }, (list || []).map(q => el("span", { class: "chip" }, [q])));
  }

  function metaItem(label, value) {
    return el("div", { class: "meta-item" }, [el("div", { class: "label" }, [label]), el("div", { class: "value" }, [String(value)])]);
  }

  function renderTabContent(key, r) {
    if (key === "zodiac") {
      const z = r.zodiac;
      return el("div", {}, [
        el("h2", {}, [z.name]),
        el("div", { class: "subtitle" }, ["Signo Zodiacal"]),
        el("p", { class: "desc" }, [z.description]),
        el("div", { class: "meta-grid" }, [metaItem("Planeta regente", z.planet), metaItem("Elemento", z.element), metaItem("Modalidad", z.modality)]),
        el("div", { class: "label", style: "margin-bottom:6px;" }, ["Cualidades principales"]),
        chips(z.qualities)
      ]);
    }
    if (key === "chinese") {
      const c = r.chinese;
      return el("div", {}, [
        el("h2", {}, [c.animal]),
        el("div", { class: "subtitle" }, ["Horóscopo Chino"]),
        el("p", { class: "desc" }, [c.description]),
        el("div", { class: "meta-grid" }, [metaItem("Elemento", c.element), metaItem("Año", c.year)]),
        el("div", { class: "label", style: "margin-bottom:6px;" }, ["Cualidades principales"]),
        chips(c.qualities)
      ]);
    }
    if (key === "birthChart") {
      const b = r.birthChart;
      return el("div", {}, [
        el("h2", {}, ["Carta Astral"]),
        el("div", { class: "subtitle" }, [`Sol, Luna y Ascendente (${b.houseSystem})`]),
        el("div", { class: "meta-grid" }, [
          metaItem("Signo Solar", b.sunSign), metaItem("Casa Solar", `Casa ${b.sunHouse}`),
          metaItem("Signo Lunar", b.moonSign), metaItem("Casa Lunar", `Casa ${b.moonHouse}`),
          metaItem("Signo Ascendente", b.ascendantSign)
        ]),
        el("div", { class: "label", style: "margin-bottom:6px;" }, ["Cualidades principales"]),
        chips(b.qualities),
        el("p", { class: "desc", style: "margin-top:16px;" }, [b.description])
      ]);
    }
    if (key === "enneagram") {
      const e = r.enneagram;
      return el("div", {}, [
        el("h2", {}, [`Tipo ${e.mainType} – ${e.mainTypeName}`]),
        el("div", { class: "subtitle" }, ["Eneatipo Principal"]),
        el("div", { class: "meta-grid" }, [
          metaItem("Ala dominante", `${e.wing} (${e.wingTypeName})`),
          metaItem("Centro / Tríada", e.center),
          metaItem("Integración (crecimiento)", `Tipo ${e.integration.type} – ${e.integration.name}`),
          metaItem("Desintegración (estrés)", `Tipo ${e.disintegration.type} – ${e.disintegration.name}`)
        ]),
        el("div", { class: "label", style: "margin-bottom:6px;" }, ["Cualidades principales"]),
        chips(e.qualities),
        el("p", { class: "desc", style: "margin-top:16px;" }, [e.description])
      ]);
    }
    return el("div", {}, []);
  }

  init();
})();
