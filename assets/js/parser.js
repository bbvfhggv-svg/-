/**
 * Prompt parser: converts Arabic or English UI keywords into ordered blueprint items.
 * This intentionally uses a small, transparent keyword dictionary rather than an AI API.
 */
const KEYWORDS = [
  { type: "navbar", aliases: ["navbar", "navigation bar", "nav bar", "ناڤبار", "نافبار", "شريط التنقل", "شريط التصفح"] },
  { type: "button", aliases: ["button", "buttons", "زر", "أزرار", "زرار"] },
  { type: "form", aliases: ["form", "forms", "نموذج", "نماذج", "استمارة"] },
  { type: "card", aliases: ["card", "cards", "بطاقة", "بطاقات", "كرت"] },
  { type: "table", aliases: ["table", "tables", "جدول", "جداول"] },
  { type: "input", aliases: ["input", "inputs", "text field", "مدخل", "حقل", "حقل إدخال", "خانة"] },
];

const DEFAULT_LABELS = {
  navbar: "شريط التنقل",
  button: "زر",
  form: "نموذج",
  card: "بطاقة",
  table: "جدول",
  input: "مدخل نصي",
};

/** Escape a string for safe insertion in generated text labels. */
function escapeLabel(value) {
  return value.replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]);
}

/**
 * Parse a prompt into component descriptors in the order they appear.
 * Repeated keywords produce repeated components; unknown prompts produce an empty list.
 * @param {string} prompt User-authored prompt, in Arabic and/or English.
 * @returns {Array<{id:string,type:string,label:string,props:object}>}
 */
export function parsePrompt(prompt) {
  if (typeof prompt !== "string" || !prompt.trim()) return [];

  const matches = [];
  for (const entry of KEYWORDS) {
    for (const alias of entry.aliases) {
      const escaped = alias.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const pattern = new RegExp(`(^|[^\\p{L}\\p{N}])(${escaped})(?=$|[^\\p{L}\\p{N}])`, "giu");
      for (const match of prompt.matchAll(pattern)) {
        matches.push({ index: match.index + match[1].length, length: match[2].length, type: entry.type, alias: match[2] });
      }
    }
  }

  // Prefer the longest match when aliases overlap (for example, "navigation bar" and "bar").
  matches.sort((a, b) => a.index - b.index || b.length - a.length);
  const selected = [];
  for (const match of matches) {
    const overlaps = selected.some((item) => match.index < item.index + item.length && item.index < match.index + match.length);
    if (!overlaps) selected.push(match);
  }
  selected.sort((a, b) => a.index - b.index);

  const counts = Object.create(null);
  return selected.map(({ type, alias }, index) => {
    counts[type] = (counts[type] || 0) + 1;
    const occurrence = counts[type];
    const baseLabel = DEFAULT_LABELS[type];
    const label = occurrence > 1 ? `${baseLabel} ${occurrence}` : baseLabel;
    return {
      id: `component-${Date.now().toString(36)}-${index}-${Math.random().toString(36).slice(2, 7)}`,
      type,
      label: escapeLabel(label),
      props: { sourceKeyword: alias },
    };
  });
}
