import { useEffect, useId, useRef, useState } from "react";
import type { MouseEvent, ReactNode } from "react";

interface ActionMenuProps {
  children: ReactNode;
  label: string;
}

export function ActionMenu({ children, label }: ActionMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelId = useId();

  useEffect(() => {
    if (!isOpen) return;

    function handleDocumentClick(event: globalThis.MouseEvent) {
      if (event.target instanceof Node && !containerRef.current?.contains(event.target)) {
        setIsOpen(false);
      }
    }

    function handleDocumentKeyDown(event: globalThis.KeyboardEvent) {
      if (event.key !== "Escape") return;
      event.preventDefault();
      setIsOpen(false);
      triggerRef.current?.focus();
    }

    document.addEventListener("click", handleDocumentClick);
    document.addEventListener("keydown", handleDocumentKeyDown);
    return () => {
      document.removeEventListener("click", handleDocumentClick);
      document.removeEventListener("keydown", handleDocumentKeyDown);
    };
  }, [isOpen]);

  function handlePanelClick(event: MouseEvent<HTMLDivElement>) {
    const action = (event.target as Element).closest("button, a[href]");
    if (!action) return;

    setIsOpen(false);
    triggerRef.current?.focus();
  }

  return (
    <div className="action-menu" data-open={isOpen} ref={containerRef}>
      <button
        aria-controls={panelId}
        aria-expanded={isOpen}
        className="action-menu-trigger"
        ref={triggerRef}
        type="button"
        onClick={() => setIsOpen((current) => !current)}
      >
        {label}
      </button>
      <div className="action-menu-panel" hidden={!isOpen} id={panelId} onClickCapture={handlePanelClick}>
        {children}
      </div>
    </div>
  );
}
