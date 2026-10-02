const statusRegion = document.querySelector("[data-status]");

function announce(message, type = "success") {
  if (!statusRegion) return;
  statusRegion.textContent = "";
  statusRegion.classList.toggle("error", type === "error");
  window.requestAnimationFrame(() => {
    statusRegion.textContent = message;
  });
}

document.querySelectorAll("a[data-route]").forEach((link) => {
  link.addEventListener("click", () => sessionStorage.setItem("lendojuntos-prototype-route", "true"));
});

if (sessionStorage.getItem("lendojuntos-prototype-route") === "true") {
  sessionStorage.removeItem("lendojuntos-prototype-route");
  const routeTitle = document.querySelector("[data-route-title]");
  if (routeTitle instanceof HTMLElement) {
    routeTitle.tabIndex = -1;
    routeTitle.focus();
  }
}

document.querySelectorAll("[data-toggle]").forEach((control) => {
  control.addEventListener("click", () => {
    const pressed = control.getAttribute("aria-pressed") === "true";
    control.setAttribute("aria-pressed", String(!pressed));
    const label = pressed ? control.dataset.offLabel : control.dataset.onLabel;
    const message = pressed ? control.dataset.offMessage : control.dataset.onMessage;
    if (label) control.textContent = label;
    if (message) announce(message);
  });
});

document.querySelectorAll("[data-segmented]").forEach((group) => {
  group.querySelectorAll("[data-segment-value]").forEach((control) => {
    control.addEventListener("click", () => {
      group.querySelectorAll("[data-segment-value]").forEach((option) => {
        const selected = option === control;
        option.setAttribute("aria-pressed", String(selected));
        option.textContent = `${option.dataset.segmentValue}${selected ? " — selecionado" : ""}`;
      });
      announce(`Situação alterada para ${control.dataset.segmentValue}.`);
    });
  });
});

let dialogOpener = null;

document.querySelectorAll("[data-open-dialog]").forEach((control) => {
  control.addEventListener("click", () => {
    const dialog = document.getElementById(control.dataset.openDialog);
    if (!(dialog instanceof HTMLDialogElement)) return;
    dialogOpener = control;
    dialog.showModal();
    const initialFocus = dialog.querySelector("[data-initial-focus]");
    if (initialFocus instanceof HTMLElement) initialFocus.focus();
  });
});

document.querySelectorAll("dialog").forEach((dialog) => {
  dialog.querySelectorAll("[data-close-dialog]").forEach((control) => {
    control.addEventListener("click", () => dialog.close("cancel"));
  });
  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) dialog.close("backdrop");
  });
  dialog.addEventListener("close", () => {
    if (dialogOpener instanceof HTMLElement && document.contains(dialogOpener)) dialogOpener.focus();
    dialogOpener = null;
  });
});

document.querySelectorAll("[data-menu]").forEach((menu) => {
  menu.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;
    menu.removeAttribute("open");
    const summary = menu.querySelector("summary");
    if (summary instanceof HTMLElement) summary.focus();
  });
});

document.addEventListener("click", (event) => {
  document.querySelectorAll("details[data-menu][open]").forEach((menu) => {
    if (!menu.contains(event.target)) menu.removeAttribute("open");
  });
});

document.querySelectorAll("form[data-demo-form]").forEach((form) => {
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!form.checkValidity()) {
      form.reportValidity();
      announce("Revise os campos indicados antes de continuar.", "error");
      return;
    }
    const dialog = form.closest("dialog");
    if (dialog instanceof HTMLDialogElement) dialog.close("success");
    announce(form.dataset.successMessage || "Alteração salva com sucesso.");
    form.reset();
  });
});

document.querySelectorAll("form[data-auth-form]").forEach((form) => {
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }
    sessionStorage.setItem("lendojuntos-prototype-route", "true");
    window.location.href = form.dataset.destination || "index.html";
  });
});

document.querySelectorAll("form[data-review-form]").forEach((form) => {
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!form.checkValidity()) {
      form.reportValidity();
      announce("Escreva o comentário antes de revisar.", "error");
      return;
    }
    const dialog = document.getElementById(form.dataset.reviewForm);
    const output = dialog?.querySelector("[data-review-output]");
    const field = form.querySelector("textarea");
    if (output && field instanceof HTMLTextAreaElement) output.textContent = field.value;
    if (dialog instanceof HTMLDialogElement) {
      dialogOpener = form.querySelector("button[type='submit']");
      dialog.showModal();
      dialog.querySelector("[data-initial-focus]")?.focus();
    }
  });
});

document.querySelectorAll("form[data-review-changes]").forEach((form) => {
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!form.checkValidity()) {
      form.reportValidity();
      announce("Revise os campos indicados antes de continuar.", "error");
      return;
    }
    const dialog = document.getElementById(form.dataset.reviewChanges);
    if (!(dialog instanceof HTMLDialogElement)) return;
    dialog.querySelectorAll("[data-review-field]").forEach((output) => {
      const field = form.elements.namedItem(output.dataset.reviewField);
      if (field instanceof HTMLInputElement || field instanceof HTMLTextAreaElement) output.textContent = field.value;
    });
    dialogOpener = form.querySelector("button[type='submit']");
    dialog.showModal();
    dialog.querySelector("[data-initial-focus]")?.focus();
  });
});

document.querySelectorAll("[data-confirm-changes]").forEach((button) => {
  button.addEventListener("click", () => {
    const dialog = button.closest("dialog");
    if (dialog instanceof HTMLDialogElement) dialog.close("saved");
    announce(button.dataset.confirmChanges);
  });
});

document.querySelectorAll("[data-announce]").forEach((button) => {
  button.addEventListener("click", () => announce(button.dataset.announce));
});

document.querySelectorAll("[data-publish-comment]").forEach((button) => {
  button.addEventListener("click", () => {
    const dialog = button.closest("dialog");
    const form = document.querySelector("form[data-review-form]");
    const field = form?.querySelector("textarea");
    if (dialog instanceof HTMLDialogElement) dialog.close("published");
    if (form instanceof HTMLFormElement) form.reset();
    if (field instanceof HTMLTextAreaElement) field.focus();
    announce("Comentário publicado. A nova mensagem foi adicionada ao final da lista.");
  });
});
