import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import { useAuth } from "../contexts/AuthContext";
import { authService, getErrorMessage } from "../services/api";
import { validateBio, validateName } from "../utils/formValidation";

interface ProfileErrors {
  name?: string;
  bio?: string;
  form?: string;
}

export function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [name, setName] = useState(user?.name ?? "");
  const [bio, setBio] = useState(user?.bio ?? "");
  const [feedback, setFeedback] = useState("");
  const [errors, setErrors] = useState<ProfileErrors>({});
  const [isReviewing, setIsReviewing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const nameRef = useRef<HTMLInputElement>(null);
  const reviewTitleRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (isReviewing) reviewTitleRef.current?.focus();
  }, [isReviewing]);

  function handleReview(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFeedback("");
    const nextErrors: ProfileErrors = {
      name: validateName(name) || undefined,
      bio: validateBio(bio) || undefined,
    };

    if (nextErrors.name || nextErrors.bio) {
      setErrors(nextErrors);
      nameRef.current?.focus();
      return;
    }

    setErrors({});
    setIsReviewing(true);
  }

  async function handleConfirm() {
    setErrors({});
    setFeedback("");
    setIsSubmitting(true);

    try {
      const updatedUser = await authService.updateProfile(name.trim(), bio.trim());
      updateUser(updatedUser);
      setName(updatedUser.name);
      setBio(updatedUser.bio);
      setIsReviewing(false);
      setFeedback("Perfil atualizado.");
    } catch (err) {
      setErrors({ form: getErrorMessage(err) });
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleBackToEdit() {
    setErrors({});
    setIsReviewing(false);
    window.requestAnimationFrame(() => nameRef.current?.focus());
  }

  return (
    <main className="shell narrow" id="conteudo-principal">
      <section className="page-heading">
        <div>
          <p className="eyebrow">Minha conta</p>
          <h1>Perfil</h1>
          <p>{user?.email}</p>
        </div>
      </section>

      {feedback && <p className="feedback page-feedback" role="status">{feedback}</p>}

      {!isReviewing ? (
        <form className="panel" onSubmit={handleReview} noValidate>
          <p className="form-instructions" id="profile-instructions">
            O nome é obrigatório. A bio é opcional e aceita até 240 caracteres. Você revisará as alterações antes de salvar.
          </p>

          <div className="form-field">
            <label htmlFor="profile-name">Nome</label>
            <input
              ref={nameRef}
              id="profile-name"
              value={name}
              onChange={(event) => {
                setName(event.target.value);
                if (errors.name || errors.form) setErrors((current) => ({ ...current, name: undefined, form: undefined }));
              }}
              autoComplete="name"
              maxLength={80}
              aria-invalid={Boolean(errors.name)}
              aria-describedby={errors.name ? "profile-name-error" : "profile-instructions"}
              required
            />
            {errors.name && <p className="field-error" id="profile-name-error" tabIndex={0}>{errors.name}</p>}
          </div>

          <div className="form-field">
            <label htmlFor="profile-bio">Bio <span className="optional-label">(opcional)</span></label>
            <textarea
              id="profile-bio"
              value={bio}
              onChange={(event) => {
                setBio(event.target.value);
                if (errors.bio || errors.form) setErrors((current) => ({ ...current, bio: undefined, form: undefined }));
              }}
              maxLength={240}
              aria-invalid={Boolean(errors.bio)}
              aria-describedby={`profile-bio-count${errors.bio ? " profile-bio-error" : ""}`}
            />
            <p className="field-hint" id="profile-bio-count">{bio.length} de 240 caracteres.</p>
            {errors.bio && <p className="field-error" id="profile-bio-error" tabIndex={0}>{errors.bio}</p>}
          </div>

          <button type="submit">Revisar alterações</button>
        </form>
      ) : (
        <section className="panel review-panel" aria-labelledby="profile-review-title" aria-busy={isSubmitting}>
          <div>
            <p className="eyebrow">Etapa de confirmação</p>
            <h2 ref={reviewTitleRef} id="profile-review-title" tabIndex={-1}>Revise seu perfil</h2>
            <p>Confira os dados abaixo antes de salvar.</p>
          </div>

          <dl className="review-list">
            <div><dt>Nome</dt><dd>{name.trim()}</dd></div>
            <div><dt>Bio</dt><dd>{bio.trim() || "Não informada"}</dd></div>
          </dl>

          {errors.form && <p className="feedback error form-alert" role="alert" tabIndex={0}>{errors.form}</p>}
          <p className="visually-hidden" role="status" aria-live="polite">
            {isSubmitting ? "Salvando as alterações do perfil. Aguarde." : ""}
          </p>

          <div className="form-actions review-actions">
            <button type="button" className="secondary-button" onClick={handleBackToEdit} disabled={isSubmitting}>
              Voltar e corrigir
            </button>
            <button type="button" onClick={handleConfirm} disabled={isSubmitting}>
              {isSubmitting ? "Salvando..." : "Confirmar alterações"}
            </button>
          </div>
        </section>
      )}
    </main>
  );
}
