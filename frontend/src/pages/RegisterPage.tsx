import { useRef, useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { getErrorMessage } from "../services/api";
import { validateEmail, validateName, validatePassword } from "../utils/formValidation";

interface RegisterErrors {
  name?: string;
  email?: string;
  password?: string;
  form?: string;
}

export function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<RegisterErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const nameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors: RegisterErrors = {
      name: validateName(name) || undefined,
      email: validateEmail(email) || undefined,
      password: validatePassword(password) || undefined,
    };

    if (nextErrors.name || nextErrors.email || nextErrors.password) {
      setErrors(nextErrors);
      if (nextErrors.name) nameRef.current?.focus();
      else if (nextErrors.email) emailRef.current?.focus();
      else passwordRef.current?.focus();
      return;
    }

    setErrors({});
    setIsSubmitting(true);

    try {
      await register(name.trim(), email.trim(), password);
      navigate("/dashboard");
    } catch (err) {
      const message = getErrorMessage(err);
      if (/e-?mail/i.test(message) && /cadastrad/i.test(message)) {
        setErrors({ email: "Este e-mail já está cadastrado. Entre com essa conta ou informe outro e-mail." });
        emailRef.current?.focus();
      } else {
        setErrors({ form: message });
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="auth-page" id="conteudo-principal">
      <section className="auth-stage">
        <section className="auth-story">
          <p className="eyebrow">Novo capitulo</p>
          <h1>Crie seu perfil e entre em clubes que tratam leitura como experiencia compartilhada.</h1>
          <p className="auth-lead">
            Cadastre-se para acompanhar livros do clube, participar dos encontros e registrar comentarios que ficam no
            historico do grupo.
          </p>

          <div className="auth-highlights">
            <article className="auth-highlight-card">
              <strong>Curadoria</strong>
              <span>Veja o que esta em leitura, o que vem depois e o que ja marcou o clube.</span>
            </article>
            <article className="auth-highlight-card">
              <strong>Participacao</strong>
              <span>Confirme presenca, acompanhe membros e contribua com anotacoes.</span>
            </article>
            <article className="auth-highlight-card">
              <strong>Continuidade</strong>
              <span>Mantenha o contexto dos encontros acessivel para todo o grupo.</span>
            </article>
          </div>
        </section>

        <section className="auth-panel">
          <div className="auth-panel-head">
            <img className="auth-logo" src="/images/logo-header.png" alt="LendoJuntos" />
            <div>
              <p className="eyebrow">Cadastro</p>
              <h2>Criar conta</h2>
            </div>
          </div>

          <form onSubmit={handleSubmit} noValidate aria-busy={isSubmitting}>
            <p className="form-instructions" id="register-instructions">
              Todos os campos são obrigatórios. A senha deve ter entre 6 e 80 caracteres.
            </p>

            <div className="form-field">
              <label htmlFor="register-name">Nome</label>
              <input
                ref={nameRef}
                id="register-name"
                type="text"
                value={name}
                onChange={(event) => {
                  setName(event.target.value);
                  if (errors.name || errors.form) setErrors((current) => ({ ...current, name: undefined, form: undefined }));
                }}
                autoComplete="name"
                maxLength={80}
                aria-invalid={Boolean(errors.name)}
                aria-describedby={errors.name ? "register-name-error" : "register-instructions"}
                required
              />
              {errors.name && <p className="field-error" id="register-name-error" tabIndex={0}>{errors.name}</p>}
            </div>

            <div className="form-field">
              <label htmlFor="register-email">E-mail</label>
              <input
                ref={emailRef}
                id="register-email"
                type="email"
                value={email}
                onChange={(event) => {
                  setEmail(event.target.value);
                  if (errors.email || errors.form) setErrors((current) => ({ ...current, email: undefined, form: undefined }));
                }}
                autoComplete="email"
                inputMode="email"
                maxLength={120}
                aria-invalid={Boolean(errors.email)}
                aria-describedby={errors.email ? "register-email-error" : "register-instructions"}
                required
              />
              {errors.email && <p className="field-error" id="register-email-error" tabIndex={0}>{errors.email}</p>}
            </div>

            <div className="form-field">
              <label htmlFor="register-password">Senha</label>
              <input
                ref={passwordRef}
                id="register-password"
                type="password"
                minLength={6}
                maxLength={80}
                value={password}
                onChange={(event) => {
                  setPassword(event.target.value);
                  if (errors.password || errors.form) setErrors((current) => ({ ...current, password: undefined, form: undefined }));
                }}
                autoComplete="new-password"
                aria-invalid={Boolean(errors.password)}
                aria-describedby={errors.password ? "register-password-error" : "register-instructions"}
                required
              />
              {errors.password && <p className="field-error" id="register-password-error" tabIndex={0}>{errors.password}</p>}
            </div>

            {errors.form && <p className="feedback error form-alert" role="alert" tabIndex={0}>{errors.form}</p>}

            <p className="visually-hidden" role="status" aria-live="polite">
              {isSubmitting ? "Criando sua conta. Aguarde." : ""}
            </p>

            <button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Cadastrando..." : "Criar conta"}
            </button>
          </form>

          <p className="auth-switch">
            Ja tem conta? <Link to="/">Voltar para login</Link>
          </p>
        </section>
      </section>
    </main>
  );
}
