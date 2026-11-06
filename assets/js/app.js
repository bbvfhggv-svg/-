import { parsePrompt } from "./parser.js";
import { createCanvas } from "./canvas.js";
import { exportHtml } from "./exporter.js";

const promptInput = document.querySelector("#prompt-input");
const generateButton = document.querySelector("#generate-button");
const clearButton = document.querySelector("#clear-button");
const statusMessage = document.querySelector("#status-message");
const codeOutput = document.querySelector("#generated-code");
const countOutput = document.querySelector("#component-count");
const copyButton = document.querySelector("#copy-button");
const downloadButton = document.querySelector("#download-button");
const canvasTab = document.querySelector("#canvas-tab");
const codeTab = document.querySelector("#code-tab");
const canvasPanel = document.querySelector("#canvas-panel");
const codePanel = document.querySelector("#code-panel");

let components = [];
const canvas = createCanvas(document.querySelector("#wireframe-canvas"), components, (updated) => {
  components = updated;
  refreshOutput();
});

/** Update code, counters, and actions whenever the blueprint changes. */
function refreshOutput() {
  codeOutput.textContent = exportHtml(components);
  countOutput.textContent = `${new Intl.NumberFormat("ar").format(components.length)} عناصر`;
  copyButton.disabled = components.length === 0;
  downloadButton.disabled = components.length === 0;
}

function setTab(activeTab) {
  const showCode = activeTab === "code";
  canvasPanel.classList.toggle("hidden", showCode);
  codePanel.classList.toggle("hidden", !showCode);
  canvasTab.setAttribute("aria-selected", String(!showCode));
  codeTab.setAttribute("aria-selected", String(showCode));
  canvasTab.className = `rounded-t-lg border-b-2 px-4 py-2.5 text-sm font-semibold ${!showCode ? "border-indigo-600 text-indigo-700" : "border-transparent text-slate-500 hover:text-slate-800"}`;
  codeTab.className = `rounded-t-lg border-b-2 px-4 py-2.5 text-sm font-semibold ${showCode ? "border-indigo-600 text-indigo-700" : "border-transparent text-slate-500 hover:text-slate-800"}`;
}

generateButton.addEventListener("click", () => {
  if (!promptInput.value.trim()) {
    statusMessage.textContent = "اكتب وصفاً للواجهة أولاً.";
    promptInput.focus();
    return;
  }
  components = parsePrompt(promptInput.value);
  canvas.setComponents(components);
  refreshOutput();
  statusMessage.textContent = components.length
    ? `تم إنشاء ${new Intl.NumberFormat("ar").format(components.length)} مكوّن. اسحبها لتغيير الترتيب.`
    : "لم نعثر على كلمات مكونات معروفة. جرّب: زر، بطاقة، نموذج، جدول، مدخل أو نافبار.";
  setTab("canvas");
});

clearButton.addEventListener("click", () => {
  promptInput.value = "";
  components = [];
  canvas.setComponents(components);
  refreshOutput();
  statusMessage.textContent = "تم مسح الوصف والمخطط.";
});

canvasTab.addEventListener("click", () => setTab("canvas"));
codeTab.addEventListener("click", () => setTab("code"));

copyButton.addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(exportHtml(components));
    statusMessage.textContent = "تم نسخ HTML إلى الحافظة.";
  } catch {
    statusMessage.textContent = "تعذّر النسخ تلقائياً. حدّد الكود وانسخه يدوياً.";
    setTab("code");
  }
});

downloadButton.addEventListener("click", () => {
  const blob = new Blob([exportHtml(components)], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "prompt-to-ui-blueprint.html";
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
  statusMessage.textContent = "بدأ تنزيل ملف HTML.";
});

refreshOutput();
