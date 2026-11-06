/**
 * Serialize blueprint descriptors to a copy-ready HTML fragment with Tailwind classes.
 * All user-editable content is escaped before it is embedded in the output.
 */
const TAGS = {
  navbar: { tag: "nav", classes: "flex items-center justify-between rounded-xl border border-slate-200 bg-white px-5 py-4 shadow-sm", inner: (label) => `<span class="font-bold text-slate-900">${label}</span>\n  <div class="flex gap-4 text-sm text-slate-600"><a href=\"#\">الرئيسية</a><a href=\"#\">حول</a><a href=\"#\">تواصل</a></div>` },
  button: { tag: "button", classes: "rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700", inner: (label) => label },
  form: { tag: "form", classes: "space-y-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm", inner: (label) => `<h2 class="text-lg font-semibold text-slate-900">${label}</h2>\n  <label class="block text-sm font-medium text-slate-700">البريد الإلكتروني<input type="email" placeholder="you@example.com" class="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500" /></label>\n  <button type="submit" class="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white">إرسال</button>` },
  card: { tag: "article", classes: "rounded-xl border border-slate-200 bg-white p-5 shadow-sm", inner: (label) => `<h2 class="font-semibold text-slate-900">${label}</h2>\n  <p class="mt-2 text-sm leading-6 text-slate-600">أضف وصفاً أو محتوى البطاقة هنا.</p>` },
  table: { tag: "section", classes: "overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm", inner: (label) => `<h2 class="px-4 py-3 font-semibold text-slate-900">${label}</h2>\n  <table class="min-w-full divide-y divide-slate-200 text-sm"><thead class="bg-slate-50"><tr><th class="px-4 py-3 text-right font-medium text-slate-500">الاسم</th><th class="px-4 py-3 text-right font-medium text-slate-500">الحالة</th><th class="px-4 py-3 text-right font-medium text-slate-500">التاريخ</th></tr></thead><tbody><tr><td class="px-4 py-3">عنصر تجريبي</td><td class="px-4 py-3">نشط</td><td class="px-4 py-3">—</td></tr></tbody></table>` },
  input: { tag: "label", classes: "block text-sm font-medium text-slate-700", inner: (label) => `${label}\n  <input type="text" placeholder="اكتب هنا..." class="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500" />` },
};

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]);
}

/** Generate a standalone HTML document using Tailwind's CDN runtime. */
export function exportHtml(components) {
  const sections = components.map((component) => {
    const definition = TAGS[component.type] || TAGS.card;
    const label = escapeHtml(component.label || component.type);
    const content = definition.inner(label);
    return `  <${definition.tag} class="${definition.classes}" dir="rtl">\n    ${content.replaceAll("\n", "\n    ")}\n  </${definition.tag}>`;
  });
  const body = sections.length ? sections.join("\n\n") : "  <!-- أضف مكونات إلى المخطط لعرضها هنا. -->";
  return `<!doctype html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <script src="https://cdn.tailwindcss.com"></script>
  <title>واجهة مولّدة</title>
</head>
<body class="min-h-screen bg-slate-50 p-6 text-slate-900">
  <main class="mx-auto max-w-5xl space-y-4">
${body}
  </main>
</body>
</html>`;
}
