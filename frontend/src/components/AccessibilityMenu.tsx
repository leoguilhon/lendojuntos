import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  useAccessibility,
  type AccessibilityPreferences,
  type ColorVisionProfile,
} from "../contexts/AccessibilityContext";

type StepperProps = {
  label: string;
  value: number;
  minimum: number;
  maximum: number;
  step: number;
  suffix: string;
  onChange: (value: number) => void;
};

type ToggleProps = {
  checked: boolean;
  children: ReactNode;
  onChange: (checked: boolean) => void;
};

const COLOR_PROFILE_NAMES: Record<ColorVisionProfile, string> = {
  default: "Padrão",
  protanopia: "Protanopia (vermelho)",
  deuteranopia: "Deuteranopia (verde)",
  tritanopia: "Tritanopia (azul e amarelo)",
  grayscale: "Tons de cinza",
};

function Stepper({ label, value, minimum, maximum, step, suffix, onChange }: StepperProps) {
  return (
    <div className="accessibility-setting">
      <span className="accessibility-setting-label">{label}</span>
      <div className="accessibility-stepper">
        <button
          type="button"
          aria-label={`Diminuir ${label.toLocaleLowerCase("pt-BR")}`}
          disabled={value <= minimum}
          onClick={() => onChange(Math.max(minimum, value - step))}
        >
          <span className="accessibility-stepper-glyph decrease" aria-hidden="true" />
        </button>
        <output aria-live="off" aria-label={`${label}: ${value}${suffix}`}>
          {value}{suffix}
        </output>
        <button
          type="button"
          aria-label={`Aumentar ${label.toLocaleLowerCase("pt-BR")}`}
          disabled={value >= maximum}
          onClick={() => onChange(Math.min(maximum, value + step))}
        >
          <span className="accessibility-stepper-glyph increase" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}

function Toggle({ checked, children, onChange }: ToggleProps) {
  return (
    <label className="accessibility-toggle">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
      />
      <span>{children}</span>
    </label>
  );
}

export function AccessibilityMenu() {
  const { preferences, isModified, updatePreference, resetPreferences } = useAccessibility();
  const [isOpen, setIsOpen] = useState(false);
  const [announcement, setAnnouncement] = useState("");
  const triggerRef = useRef<HTMLButtonElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    titleRef.current?.focus();
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      setIsOpen(false);
      triggerRef.current?.focus();
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  function update<Key extends keyof AccessibilityPreferences>(
    key: Key,
    value: AccessibilityPreferences[Key],
    message: string,
  ) {
    updatePreference(key, value);
    setAnnouncement(message);
  }

  function closePanel() {
    setIsOpen(false);
    triggerRef.current?.focus();
  }

  return (
    <aside className="accessibility-tools" aria-label="Ferramentas de acessibilidade">
      {isOpen && (
        <section
          className="accessibility-panel"
          id="accessibility-panel"
          role="dialog"
          aria-labelledby="accessibility-panel-title"
          aria-describedby="accessibility-panel-description"
        >
          <div className="accessibility-panel-header">
            <div>
              <p className="accessibility-panel-eyebrow">Preferências visuais</p>
              <h2 id="accessibility-panel-title" ref={titleRef} tabIndex={-1}>
                Acessibilidade
              </h2>
            </div>
            <button
              className="accessibility-close"
              type="button"
              aria-label="Fechar painel de acessibilidade"
              onClick={closePanel}
            >
              <span className="accessibility-close-glyph" aria-hidden="true" />
            </button>
          </div>

          <p id="accessibility-panel-description" className="accessibility-panel-description">
            Ajuste a leitura sem sair da página. As escolhas ficam salvas neste navegador.
          </p>

          <div className="accessibility-settings">
            <fieldset>
              <legend>Exibição</legend>
              <Stepper
                label="Tamanho da fonte"
                value={preferences.fontScale}
                minimum={80}
                maximum={150}
                step={10}
                suffix="%"
                onChange={(value) => update("fontScale", value, `Tamanho da fonte ajustado para ${value}%.`)}
              />
              <Stepper
                label="Brilho"
                value={preferences.brightness}
                minimum={70}
                maximum={130}
                step={10}
                suffix="%"
                onChange={(value) => update("brightness", value, `Brilho ajustado para ${value}%.`)}
              />
              <Stepper
                label="Contraste"
                value={preferences.contrast}
                minimum={80}
                maximum={150}
                step={10}
                suffix="%"
                onChange={(value) => update("contrast", value, `Contraste ajustado para ${value}%.`)}
              />
            </fieldset>

            <fieldset>
              <legend>Cores</legend>
              <label className="accessibility-select-label" htmlFor="accessibility-color-profile">
                Perfil de cores
              </label>
              <select
                id="accessibility-color-profile"
                value={preferences.colorVision}
                onChange={(event) => {
                  const profile = event.target.value as ColorVisionProfile;
                  update("colorVision", profile, `Perfil de cores: ${COLOR_PROFILE_NAMES[profile]}.`);
                }}
              >
                {Object.entries(COLOR_PROFILE_NAMES).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
              <p className="accessibility-setting-hint">
                Os perfis diferenciam a paleta, mas não substituem as configurações do sistema.
              </p>
            </fieldset>

            <fieldset className="accessibility-toggle-list">
              <legend>Leitura e movimento</legend>
              <Toggle
                checked={preferences.comfortableSpacing}
                onChange={(checked) => update(
                  "comfortableSpacing",
                  checked,
                  `Espaçamento confortável ${checked ? "ativado" : "desativado"}.`,
                )}
              >
                Espaçamento confortável
              </Toggle>
              <Toggle
                checked={preferences.underlineLinks}
                onChange={(checked) => update(
                  "underlineLinks",
                  checked,
                  `Sublinhado de links ${checked ? "ativado" : "desativado"}.`,
                )}
              >
                Sublinhado em todos os links
              </Toggle>
              <Toggle
                checked={preferences.reduceMotion}
                onChange={(checked) => update(
                  "reduceMotion",
                  checked,
                  `Redução de movimento ${checked ? "ativada" : "desativada"}.`,
                )}
              >
                Reduzir animações
              </Toggle>
              <Toggle
                checked={preferences.simpleFont}
                onChange={(checked) => update(
                  "simpleFont",
                  checked,
                  `Fonte simples ${checked ? "ativada" : "desativada"}.`,
                )}
              >
                Usar fonte simples
              </Toggle>
            </fieldset>
          </div>

          <div className="accessibility-panel-footer">
            <button
              className="accessibility-reset"
              type="button"
              disabled={!isModified}
              onClick={() => {
                resetPreferences();
                setAnnouncement("Preferências de acessibilidade restauradas.");
              }}
            >
              Restaurar padrão
            </button>
            <span className="accessibility-save-note">Salvo automaticamente</span>
          </div>
          <p className="visually-hidden" role="status" aria-live="polite" aria-atomic="true">
            {announcement}
          </p>
        </section>
      )}

      <button
        ref={triggerRef}
        className="accessibility-trigger"
        type="button"
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((current) => !current)}
      >
        <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
          <circle cx="12" cy="4.5" r="2.25" />
          <path d="M4.75 8.25h14.5M12 7.75v12.5M12 12l-4.25 7.25M12 12l4.25 7.25" />
        </svg>
        <span>Acessibilidade</span>
      </button>
    </aside>
  );
}
