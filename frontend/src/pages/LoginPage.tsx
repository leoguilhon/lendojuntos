import { useRef, useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { getErrorMessage } from "../services/api";
import { validateEmail } from "../utils/formValidation";

interface LoginErrors {
  email?: string;
  password?: string;
  form?: string;
}

export function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<LoginErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors: LoginErrors = {
      email: validateEmail(email) || undefined,
      password: password ? undefined : "Informe sua senha.",
    };

    if (nextErrors.email || nextErrors.password) {
      setErrors(nextErrors);
      (nextErrors.email ? emailRef : passwordRef).current?.focus();
      return;
    }

    setErrors({});
    setIsSubmitting(true);

    try {
      await login(email.trim(), password);
      navigate("/dashboard");
    } catch (err) {
      const message = getErrorMessage(err);
      setErrors({
        email: "Confira o e-mail informado.",
        password: "Confira a senha informada.",
        form: message,
      });
      emailRef.current?.focus();
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="auth-page" id="conteudo-principal">
      <section className="auth-stage">
        <section className="auth-story">
          <p className="eyebrow">Leitura com presenca</p>
          <h1>Organize clubes, encontros e conversas sem perder o fio da leitura.</h1>
          <p className="auth-lead">
            Uma interface feita para clubes que querem registrar decisoes, descobrir proximos encontros e manter a memoria
            do grupo viva.
          </p>

          <div className="auth-highlights">
            <article className="auth-highlight-card">
              <strong>Clubes</strong>
              <span>Seu espaco para reunir leitores, livros e responsabilidades.</span>
            </article>
            <article className="auth-highlight-card">
              <strong>Encontros</strong>
              <span>Agenda, pauta e presencas confirmadas no mesmo fluxo.</span>
            </article>
            <article className="auth-highlight-card">
              <strong>Memoria</strong>
              <span>Comentarios e historico acessiveis, sem conversas dispersas.</span>
            </article>
          </div>
        </section>

        <section className="auth-panel">
          <div className="auth-panel-head">
            <img className="auth-logo primary" src="/images/logo-primary.png" alt="LendoJuntos" />
            <div>
              <p className="eyebrow">Acesso ao painel</p>
              <h2>Entrar</h2>
            </div>
          </div>

          <form onSubmit={handleSubmit} noValidate aria-busy={isSubmitting}>
            <p className="form-instructions" id="login-instructions">
              Todos os campos são obrigatórios.
            </p>

            <div className="form-field">
              <label htmlFor="login-email">E-mail</label>
              <input
                ref={emailRef}
                id="login-email"
                type="email"
                value={email}
                onChange={(event) => {
                  setEmail(event.target.value);
                  if (errors.email || errors.form) setErrors((current) => ({ ...current, email: undefined, form: undefined }));
                }}
                autoComplete="email"
                inputMode="email"
                placeholder="voce@exemplo.com"
                aria-invalid={Boolean(errors.email)}
                aria-describedby={errors.email ? "login-email-error" : "login-instructions"}
                required
              />
              {errors.email && <p className="field-error" id="login-email-error" tabIndex={0}>{errors.email}</p>}
            </div>

            <div className="form-field">
              <label htmlFor="login-password">Senha</label>
              <input
                ref={passwordRef}
                id="login-password"
                type="password"
                value={password}
                onChange={(event) => {
                  setPassword(event.target.value);
                  if (errors.password || errors.form) setErrors((current) => ({ ...current, password: undefined, form: undefined }));
                }}
                autoComplete="current-password"
                placeholder="Digite sua senha"
                aria-invalid={Boolean(errors.password)}
                aria-describedby={errors.password ? "login-password-error" : "login-instructions"}
                required
              />
              {errors.password && <p className="field-error" id="login-password-error" tabIndex={0}>{errors.password}</p>}
            </div>

            {errors.form && <p className="feedback error form-alert" role="alert" tabIndex={0}>{errors.form}</p>}

            <p className="visually-hidden" role="status" aria-live="polite">
              {isSubmitting ? "Verificando seus dados. Aguarde." : ""}
            </p>

            <button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Entrando..." : "Entrar na plataforma"}
            </button>
          </form>

          <p className="auth-switch">
            Nao tem conta? <Link to="/register">Criar conta</Link>
          </p>
        </section>
      </section>
    </main>
  );
}
