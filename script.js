"use strict";

/* Helpers */
const select = (selector, scope = document) => scope.querySelector(selector);
const selectAll = (selector, scope = document) => [...scope.querySelectorAll(selector)];
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* Cinematic opening */
const enterButton = select("#enterDeck");
const firstSection = select("#collection");

enterButton?.addEventListener("click", () => {
  firstSection?.scrollIntoView({
    behavior: prefersReducedMotion ? "auto" : "smooth",
    block: "start"
  });
});

/* Mobile navigation */
const navToggle = select("#navToggle");
const navLinks = select("#navLinks");

navToggle?.addEventListener("click", () => {
  const isOpen = navLinks.classList.toggle("open");
  navToggle.setAttribute("aria-expanded", String(isOpen));
});

selectAll(".nav-links a").forEach((link) => {
  link.addEventListener("click", () => {
    navLinks.classList.remove("open");
    navToggle.setAttribute("aria-expanded", "false");
  });
});

/* Expandable system components */
selectAll(".component-card").forEach((card) => {
  const detail = select(".component-detail", card);

  const toggleCard = () => {
    const expanded = card.getAttribute("aria-pressed") === "true";
    card.setAttribute("aria-pressed", String(!expanded));
    if (detail) detail.hidden = expanded;
  };

  card.addEventListener("click", toggleCard);
  card.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      toggleCard();
    }
  });
});

/* Sorting routes */
const laneOutput = select("#laneOutput");
const laneData = {
  reuse: {
    title: "Reuse / recycle",
    text: "Clean packaging, intact containers, tools, and some metal or plastic components may be retained, refurbished, or processed into useful material. The practical value depends on contamination, volume, and available equipment."
  },
  treat: {
    title: "Treat",
    text: "Wastewater, urine, humidity condensate, and some wet waste need treatment before water or other resources can be safely recovered. Treatment must manage microbes, chemicals, and residual brine."
  },
  store: {
    title: "Store / compact",
    text: "Much dry trash and packaging is sealed, compacted where possible, inventoried, and stored until it can be transferred to a cargo vehicle or processed by future systems."
  },
  discard: {
    title: "Discard",
    text: "Some material may be disposed of overboard or allowed to burn up during atmospheric reentry, depending on spacecraft design, safety rules, and mission circumstances. Deep-space missions cannot rely on this option as easily."
  }
};

selectAll(".lane").forEach((lane) => {
  lane.addEventListener("click", () => {
    selectAll(".lane").forEach((item) => item.classList.remove("is-active"));
    lane.classList.add("is-active");

    const data = laneData[lane.dataset.lane];
    laneOutput.innerHTML = `<strong>${data.title}:</strong> ${data.text}`;
  });
});

/* Waste-flow map */
const streamInfo = select("#streamInfo");
const streamData = {
  solid: {
    title: "Solid waste stream",
    steps: [
      "Collection: Crews seal food residue, hygiene waste, and maintenance debris in containers.",
      "Sorting: Crews separate hazardous items, recoverable materials, and ordinary dry trash.",
      "Processing: Compaction reduces volume; future systems may recover water or materials.",
      "Storage: Sealed waste is tracked and held until transfer, disposal, or processing.",
      "Recovery: Water and material recovery from trash are valuable but technically challenging."
    ],
    outcome: "Reusable materials may be retained; much solid waste is contained for transfer or future processing."
  },
  water: {
    title: "Wastewater stream",
    steps: [
      "Collection: Urine, flush water, and cabin humidity condensate enter wastewater systems.",
      "Sorting: Sources may be pretreated separately before entering the main recovery loop.",
      "Processing: Filtration, catalytic oxidation, ion exchange, and disinfection purify water.",
      "Storage: Clean water is stored for drinking, food preparation, hygiene, and equipment use.",
      "Recovery: Remaining brine can be processed further to recover additional water."
    ],
    outcome: "On the ISS, NASA reports about 90% water recycling overall; its Brine Processor Assembly demonstration helped reach a 98% total water-recovery goal."
  },
  packaging: {
    title: "Packaging stream",
    steps: [
      "Collection: Food wrappers, shipping material, and protective packaging are gathered after use.",
      "Sorting: Crews identify reusable containers, recyclable material, contaminated packaging, and trash.",
      "Processing: Compaction reduces storage volume; contamination limits recycling options.",
      "Storage: Compacted packaging is inventoried until disposal or processing.",
      "Recovery: Better packaging design can reduce waste before it is ever created."
    ],
    outcome: "The best packaging strategy is prevention: reusable containers, minimal wrapping, and materials chosen for easy processing."
  },
  other: {
    title: "Other materials stream",
    steps: [
      "Collection: Broken parts, electronic waste, cleaning supplies, and experiment materials enter separate handling paths.",
      "Sorting: Crews identify hazards, reusable components, and materials needing special containment.",
      "Processing: Some items may be repaired, cannibalized for spares, or stabilized for storage.",
      "Storage: Hazardous materials require clear labeling and separation from food and hygiene areas.",
      "Recovery: Future systems may extract metals or chemical feedstocks from selected waste."
    ],
    outcome: "Careful inventory and repair can turn potential waste into spare parts, tools, or feedstockâ€”but only when contamination and safety risks are controlled."
  }
};

function renderStream(key) {
  const data = streamData[key];
  if (!data) return;

  streamInfo.innerHTML = `
    <h3>${data.title}</h3>
    <ol>
      ${data.steps.map((step) => `<li>${step}</li>`).join("")}
    </ol>
    <p><strong>Outcome:</strong> ${data.outcome}</p>
  `;
}

selectAll(".flow-tab").forEach((tab) => {
  tab.addEventListener("click", () => {
    selectAll(".flow-tab").forEach((item) => {
      item.classList.remove("is-active");
      item.setAttribute("aria-selected", "false");
    });

    tab.classList.add("is-active");
    tab.setAttribute("aria-selected", "true");
    renderStream(tab.dataset.stream);
  });
});

renderStream("solid");

/* Simulated dashboard */
const gauges = selectAll(".gauge");
const gaugeFill = select(".gauge-fill", gauges[0]); // reference only

function animateGauge(gauge, value) {
  const fill = select(".gauge-fill", gauge);
  const label = select(".gauge-value", gauge);
  const circumference = 2 * Math.PI * 50;
  const offset = circumference - (value / 100) * circumference;

  fill.style.strokeDasharray = String(circumference);
  fill.style.strokeDashoffset = String(circumference);

  requestAnimationFrame(() => {
    fill.style.strokeDashoffset = String(offset);
  });

  let current = 0;
  if (prefersReducedMotion) {
    label.textContent = `${value}%`;
    return;
  }

  const tick = () => {
    current += Math.max(1, Math.round((value - current) / 8));
    if (current >= value) {
      label.textContent = `${value}%`;
      return;
    }
    label.textContent = `${current}%`;
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

function runDashboardSimulation() {
  const waste = 45 + Math.floor(Math.random() * 45);
  const water = 88 + Math.floor(Math.random() * 11);
  const storage = 25 + Math.floor(Math.random() * 55);

  animateGauge(gauges[0], waste);
  animateGauge(gauges[1], water);
  animateGauge(gauges[2], storage);
}

const refreshButton = select("#refreshDashboard");
refreshButton?.addEventListener("click", runDashboardSimulation);

/* Reveal dashboard values when visible */
const dashboardSection = select("#dashboard");
let dashboardStarted = false;

const dashboardObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting && !dashboardStarted) {
      dashboardStarted = true;
      runDashboardSimulation();
      dashboardObserver.disconnect();
    }
  });
}, { threshold: 0.25 });

if (dashboardSection) dashboardObserver.observe(dashboardSection);

/* Subtle scroll reveal for cards */
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("revealed");
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.15 });

selectAll(".card, .gauge-card, .status-card, .alert-card").forEach((element) => {
  element.classList.add("reveal");
  revealObserver.observe(element);
});
