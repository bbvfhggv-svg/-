/**
 * Canvas renderer and drag-and-drop ordering for blueprint components.
 * The app owns the source of truth; every user edit emits a fresh array via onChange.
 */
const TYPE_META = {
  navbar: { title: "Navbar", icon: "☰", preview: "[ Logo ]                         Home    About    Contact" },
  button: { title: "Button", icon: "▰", preview: "[       زر الإجراء       ]" },
  form: { title: "Form", icon: "▤", preview: "حقل النموذج                 حقل النموذج" },
  card: { title: "Card", icon: "▱", preview: "عنوان البطاقة\nمحتوى توضيحي مختصر يظهر هنا." },
  table: { title: "Table", icon: "▦", preview: "الاسم                 الحالة                 التاريخ" },
  input: { title: "Input", icon: "▭", preview: "اكتب هنا..." },
};

/** Render the current ordered component list and wire up its editing interactions. */
export function createCanvas(container, initialComponents, onChange) {
  let components = [...initialComponents];
  let draggedId = null;

  function publish() {
    onChange([...components]);
  }

  function render() {
    container.replaceChildren();
    if (!components.length) {
      const empty = document.createElement("div");
      empty.className = "grid min-h-[365px] place-items-center text-center";
      empty.innerHTML = '<div><div class="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-2xl bg-white text-xl text-slate-400 shadow-sm">＋</div><p class="text-sm font-semibold text-slate-600">مساحتك جاهزة</p><p class="mt-1 text-xs text-slate-400">اكتب وصفاً واضغط «توليد المخطط» للبدء.</p></div>';
      container.append(empty);
      return;
    }

    components.forEach((component, index) => {
      const meta = TYPE_META[component.type] || { title: component.type, icon: "◇", preview: "مكوّن واجهة" };
      const card = document.createElement("article");
      card.className = "component-card rounded-xl border border-slate-200 bg-white p-4 shadow-sm";
      card.dataset.id = component.id;
      card.draggable = true;
      card.setAttribute("aria-label", `${meta.title}: ${component.label}`);
      card.innerHTML = `
        <div class="flex items-start gap-3">
          <span class="mt-1 cursor-grab select-none text-slate-400" aria-hidden="true" title="اسحب لإعادة الترتيب">⠿</span>
          <div class="min-w-0 flex-1">
            <div class="mb-3 flex flex-wrap items-center gap-2">
              <span class="grid h-7 w-7 place-items-center rounded-lg bg-indigo-50 text-xs text-indigo-600" aria-hidden="true">${meta.icon}</span>
              <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400">${meta.title} · ${String(index + 1).padStart(2, "0")}</span>
              <button type="button" class="remove-component ms-auto rounded-md px-2 py-1 text-xs text-slate-400 hover:bg-rose-50 hover:text-rose-600" aria-label="حذف ${component.label}">حذف</button>
            </div>
            <label class="sr-only" for="label-${component.id}">اسم المكوّن</label>
            <input id="label-${component.id}" class="component-label mb-3 w-full rounded-md border border-transparent bg-transparent px-2 py-1 text-sm font-semibold outline-none hover:border-slate-200 focus:border-indigo-300 focus:bg-white focus:ring-2 focus:ring-indigo-100" value="" />
            <div class="whitespace-pre-line rounded-lg border border-dashed border-slate-200 bg-slate-50 px-4 py-3 text-xs leading-6 text-slate-400" dir="auto">${meta.preview}</div>
          </div>
        </div>`;
      const labelInput = card.querySelector(".component-label");
      labelInput.value = component.label;
      labelInput.addEventListener("change", () => {
        components = components.map((item) => item.id === component.id ? { ...item, label: labelInput.value.trim() || TYPE_META[item.type]?.title || item.type } : item);
        publish();
      });
      card.querySelector(".remove-component").addEventListener("click", () => {
        components = components.filter((item) => item.id !== component.id);
        render();
        publish();
      });
      card.addEventListener("dragstart", (event) => {
        draggedId = component.id;
        event.dataTransfer.effectAllowed = "move";
        event.dataTransfer.setData("text/plain", component.id);
        requestAnimationFrame(() => card.classList.add("is-dragging"));
      });
      card.addEventListener("dragend", () => {
        draggedId = null;
        card.classList.remove("is-dragging");
        container.querySelectorAll(".drop-indicator").forEach((item) => item.classList.remove("drop-indicator"));
      });
      card.addEventListener("dragover", (event) => {
        event.preventDefault();
        if (draggedId && draggedId !== component.id) card.classList.add("drop-indicator");
      });
      card.addEventListener("dragleave", () => card.classList.remove("drop-indicator"));
      card.addEventListener("drop", (event) => {
        event.preventDefault();
        card.classList.remove("drop-indicator");
        const sourceId = event.dataTransfer.getData("text/plain") || draggedId;
        if (!sourceId || sourceId === component.id) return;
        const next = [...components];
        const from = next.findIndex((item) => item.id === sourceId);
        const to = next.findIndex((item) => item.id === component.id);
        if (from < 0 || to < 0) return;
        const [moved] = next.splice(from, 1);
        next.splice(to, 0, moved);
        components = next;
        render();
        publish();
      });
      container.append(card);
    });
  }

  render();
  return {
    /** Replace the canvas with a new component list. */
    setComponents(nextComponents) {
      components = [...nextComponents];
      render();
    },
    /** Return a shallow copy in the currently displayed order. */
    getComponents() {
      return [...components];
    },
  };
}
