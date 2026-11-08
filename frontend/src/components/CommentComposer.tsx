import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import { getErrorMessage } from "../services/api";
import { AutoResizeTextarea } from "./AutoResizeTextarea";

interface CommentComposerProps {
  idPrefix: string;
  value: string;
  placeholder: string;
  onChange: (value: string) => void;
  onPublish: (content: string) => Promise<void>;
}

export function CommentComposer({
  idPrefix,
  value,
  placeholder,
  onChange,
  onPublish,
}: CommentComposerProps) {
  const [error, setError] = useState("");
  const [isReviewing, setIsReviewing] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const reviewHeadingRef = useRef<HTMLHeadingElement>(null);
  const textareaId = `${idPrefix}-content`;
  const instructionId = `${idPrefix}-instructions`;
  const errorId = `${idPrefix}-error`;

  useEffect(() => {
    if (isReviewing) reviewHeadingRef.current?.focus();
  }, [isReviewing]);

  function handleReview(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const content = value.trim();

    if (!content) {
      setError("Escreva um comentário antes de continuar para a revisão.");
      return;
    }

    setError("");
    setIsReviewing(true);
  }

  async function handlePublish() {
    const content = value.trim();
    if (!content || isPublishing) return;

    setError("");
    setIsPublishing(true);
    try {
      await onPublish(content);
      onChange("");
      setIsReviewing(false);
    } catch (publishError) {
      setError(getErrorMessage(publishError));
    } finally {
      setIsPublishing(false);
    }
  }

  if (isReviewing) {
    return (
      <section className="comment-review" aria-busy={isPublishing} aria-labelledby={`${idPrefix}-review-title`}>
        <h3 id={`${idPrefix}-review-title`} ref={reviewHeadingRef} tabIndex={-1}>
          Revise o comentário antes de publicar
        </h3>
        <p>Confira o texto. Você ainda pode voltar e corrigir sem perder o conteúdo.</p>
        <blockquote>{value.trim()}</blockquote>
        {error && <p className="feedback error form-alert" id={errorId} role="alert">{error}</p>}
        <div className="form-actions">
          <button className="ghost-button" type="button" onClick={() => setIsReviewing(false)} disabled={isPublishing}>
            Voltar e editar
          </button>
          <button type="button" onClick={handlePublish} disabled={isPublishing}>
            {isPublishing ? "Publicando..." : "Confirmar publicação"}
          </button>
        </div>
        <p className="visually-hidden" role="status" aria-live="polite">
          {isPublishing ? "Publicando comentário." : ""}
        </p>
      </section>
    );
  }

  return (
    <form className="comment-form" onSubmit={handleReview} noValidate>
      <label htmlFor={textareaId}>Novo comentário</label>
      <p className="field-instructions" id={instructionId}>
        Você poderá revisar o texto antes da publicação.
      </p>
      <AutoResizeTextarea
        id={textareaId}
        value={value}
        onChange={(event) => {
          onChange(event.target.value);
          if (error) setError("");
        }}
        placeholder={placeholder}
        aria-invalid={Boolean(error)}
        aria-describedby={`${instructionId}${error ? ` ${errorId}` : ""}`}
      />
      {error && <p className="field-error" id={errorId}>{error}</p>}
      <button type="submit">Revisar comentário</button>
    </form>
  );
}
