import { type MouseEvent, useEffect, useRef } from "react";
import { useLocation, useNavigationType } from "react-router-dom";

const CONTENT_ID = "conteudo-principal";

function getPageName(pathname: string) {
  if (pathname === "/") return "Entrar";
  if (pathname === "/register") return "Criar conta";
  if (pathname === "/dashboard") return "Clubes";
  if (pathname === "/profile") return "Perfil";
  if (/^\/clubs\/[^/]+\/books\/?$/.test(pathname)) return "Livros do clube";
  if (/^\/books\/[^/]+\/?$/.test(pathname)) return "Livro";
  if (/^\/clubs\/[^/]+\/meetings\/[^/]+\/?$/.test(pathname)) return "Encontro";
  if (/^\/clubs\/[^/]+\/meetings\/?$/.test(pathname)) return "Encontros do clube";
  if (/^\/clubs\/[^/]+\/?$/.test(pathname)) return "Clube";
  return "Página";
}

function focusTemporarily(element: HTMLElement) {
  const previousTabIndex = element.getAttribute("tabindex");
  element.setAttribute("tabindex", "-1");
  element.focus();

  const restoreTabIndex = () => {
    if (previousTabIndex === null) element.removeAttribute("tabindex");
    else element.setAttribute("tabindex", previousTabIndex);
  };

  element.addEventListener("blur", restoreTabIndex, { once: true });
  return () => {
    element.removeEventListener("blur", restoreTabIndex);
    restoreTabIndex();
  };
}

export function SkipLink() {
  function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    const main = document.getElementById(CONTENT_ID);
    if (!main) return;

    event.preventDefault();
    focusTemporarily(main);
  }

  return (
    <a className="skip-link" href={`#${CONTENT_ID}`} onClick={handleClick}>
      Ir para o conteúdo principal
    </a>
  );
}

export function RouteAccessibility() {
  const location = useLocation();
  const navigationType = useNavigationType();
  const currentLocationKey = useRef(location.key);

  useEffect(() => {
    document.title = `${getPageName(location.pathname)} — LendoJuntos`;
  }, [location.pathname]);

  useEffect(() => {
    if (currentLocationKey.current === location.key) return;
    currentLocationKey.current = location.key;

    // Em Voltar/Avançar, preserva o foco restaurado pelo navegador. Se o alvo
    // saiu do DOM e o foco caiu no body, oferece um contexto seguro na rota.
    if (navigationType === "POP") {
      let releasePopFocus: (() => void) | undefined;
      const animationFrame = window.requestAnimationFrame(() => {
        if (document.activeElement !== document.body) return;
        const target = document.querySelector<HTMLElement>(`#${CONTENT_ID} h1`)
          ?? document.getElementById(CONTENT_ID);
        if (target) releasePopFocus = focusTemporarily(target);
      });

      return () => {
        window.cancelAnimationFrame(animationFrame);
        releasePopFocus?.();
      };
    }

    let releaseFocus: (() => void) | undefined;

    const focusPageHeading = () => {
      const heading = document.querySelector<HTMLElement>(`#${CONTENT_ID} h1`);
      if (!heading) return false;

      releaseFocus = focusTemporarily(heading);
      return true;
    };

    if (focusPageHeading()) return () => releaseFocus?.();

    // Algumas rotas só renderizam o título depois que os dados chegam da API.
    const observer = new MutationObserver(() => {
      if (!focusPageHeading()) return;
      observer.disconnect();
      window.clearTimeout(fallbackTimer);
    });
    observer.observe(document.body, { childList: true, subtree: true });

    const fallbackTimer = window.setTimeout(() => {
      observer.disconnect();
      const main = document.getElementById(CONTENT_ID);
      if (main) releaseFocus = focusTemporarily(main);
    }, 2_000);

    return () => {
      observer.disconnect();
      window.clearTimeout(fallbackTimer);
      releaseFocus?.();
    };
  }, [location.key, navigationType]);

  return null;
}
