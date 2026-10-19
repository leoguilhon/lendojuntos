import { useEffect, useId, useRef } from "react";
import type { KeyboardEvent, MouseEvent, ReactNode } from "react";

interface ModalProps {
  title: string;
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
}

const focusableSelector = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled]):not([type='hidden'])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "[tabindex]:not([tabindex='-1'])",
].join(",");

function getFocusableElements(dialog: HTMLDialogElement) {
  return [...dialog.querySelectorAll<HTMLElement>(focusableSelector)].filter(
    (element) => !element.hidden && element.getAttribute("aria-hidden") !== "true",
  );
}

export function Modal({ title, isOpen, onClose, children }: ModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);
  const onCloseRef = useRef(onClose);
  const titleId = useId();

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!isOpen) return;

    const dialog = dialogRef.current;
    if (!dialog) return;

    returnFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    if (!dialog.open) dialog.showModal();

    queueMicrotask(() => {
      const initialTarget =
        dialog.querySelector<HTMLElement>("[data-modal-initial-focus]") ??
        dialog.querySelector<HTMLElement>(
          "input:not([disabled]):not([type='hidden']), select:not([disabled]), textarea:not([disabled])",
        ) ??
        getFocusableElements(dialog)[0];
      initialTarget?.focus();
    });

    return () => {
      if (dialog.open) dialog.close();

      const returnTarget = returnFocusRef.current;
      queueMicrotask(() => {
        if (returnTarget?.isConnected && !returnTarget.hasAttribute("disabled")) {
          returnTarget.focus();
        }
      });
    };
  }, [isOpen]);

  function handleKeyDown(event: KeyboardEvent<HTMLDialogElement>) {
    if (event.key !== "Tab") return;

    const dialog = dialogRef.current;
    if (!dialog) return;

    const focusableElements = getFocusableElements(dialog);
    const firstElement = focusableElements[0];
    const lastElement = focusableElements.at(-1);
    if (!firstElement || !lastElement) {
      event.preventDefault();
      dialog.focus();
      return;
    }

    if (event.shiftKey && document.activeElement === firstElement) {
      event.preventDefault();
      lastElement.focus();
    } else if (!event.shiftKey && document.activeElement === lastElement) {
      event.preventDefault();
      firstElement.focus();
    }
  }

  function handleBackdropClick(event: MouseEvent<HTMLDialogElement>) {
    if (event.target === event.currentTarget) onCloseRef.current();
  }

  return (
    <dialog
      aria-labelledby={titleId}
      aria-modal="true"
      className="modal-backdrop"
      ref={dialogRef}
      onCancel={(event) => {
        event.preventDefault();
        onCloseRef.current();
      }}
      onClick={handleBackdropClick}
      onKeyDown={handleKeyDown}
    >
      <section className="modal-frame">
        <div className="modal-header">
          <h2 id={titleId}>{title}</h2>
          <button
            aria-label={`Fechar ${title.toLocaleLowerCase("pt-BR")}`}
            className="icon-button"
            type="button"
            onClick={() => onCloseRef.current()}
          >
            <span aria-hidden="true">×</span>
          </button>
        </div>
        {children}
      </section>
    </dialog>
  );
}
