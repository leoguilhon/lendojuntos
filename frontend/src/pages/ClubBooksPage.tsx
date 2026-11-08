import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import { Link, useParams } from "react-router-dom";
import { Modal } from "../components/Modal";
import { PageLoading } from "../components/PageLoading";
import { PageFeedback } from "../components/PageFeedback";
import { bookService, clubService, getErrorMessage } from "../services/api";
import type { Book, Club, ReadingStatus } from "../types";

const statusLabel: Record<ReadingStatus, string> = {
  planejado: "Planejado",
  em_leitura: "Em leitura",
  concluido: "Concluído",
};

const statusOrder: Record<ReadingStatus, number> = {
  em_leitura: 0,
  planejado: 1,
  concluido: 2,
};

export function ClubBooksPage() {
  const { id } = useParams();
  const [club, setClub] = useState<Club | null>(null);
  const [books, setBooks] = useState<Book[]>([]);
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<ReadingStatus>("planejado");
  const [feedback, setFeedback] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isBookModalOpen, setIsBookModalOpen] = useState(false);
  const [bookFormError, setBookFormError] = useState("");
  const [bookErrors, setBookErrors] = useState<{ title?: string; author?: string }>({});
  const [isCreatingBook, setIsCreatingBook] = useState(false);

  const isAdmin = club?.current_user_role === "admin";

  const orderedBooks = useMemo(
    () =>
      [...books].sort(
        (a, b) =>
          statusOrder[a.status] - statusOrder[b.status] ||
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
      ),
    [books],
  );

  useEffect(() => {
    if (!id) return;
    const clubId = id;
    let isMounted = true;

    async function loadClubBooks() {
      try {
        const [clubData, bookData] = await Promise.all([clubService.get(clubId), bookService.listByClub(clubId)]);
        if (!isMounted) return;
        setClub(clubData);
        setBooks(bookData);
      } catch (err) {
        if (isMounted) {
          setFeedback(`Erro: ${getErrorMessage(err)}`);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void loadClubBooks();

    return () => {
      isMounted = false;
    };
  }, [id]);

  async function handleToggleBookLike(book: Book) {
    setFeedback("");

    try {
      const updatedBook = book.liked_by_current_user ? await bookService.unlike(book.id) : await bookService.like(book.id);
      setBooks((current) => current.map((item) => (item.id === book.id ? updatedBook : item)));
      setFeedback(
        updatedBook.liked_by_current_user
          ? `${updatedBook.title} curtido.`
          : `Curtida removida de ${updatedBook.title}.`,
      );
    } catch (err) {
      setFeedback(`Erro: ${getErrorMessage(err)}`);
    }
  }

  async function handleCreateBook(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!id) return;
    const nextErrors = {
      title: title.trim() ? undefined : "Informe o título do livro.",
      author: author.trim() ? undefined : "Informe o nome do autor ou autora.",
    };
    if (nextErrors.title || nextErrors.author) {
      setBookErrors(nextErrors);
      const fieldName = nextErrors.title ? "title" : "author";
      (event.currentTarget.elements.namedItem(fieldName) as HTMLElement | null)?.focus();
      return;
    }
    setFeedback("");
    setBookErrors({});
    setBookFormError("");
    setIsCreatingBook(true);

    try {
      await bookService.create(id, { title, author, description, status });
      const updatedBooks = await bookService.listByClub(id);
      setBooks(updatedBooks);
      setTitle("");
      setAuthor("");
      setDescription("");
      setStatus("planejado");
      setFeedback("Livro cadastrado no clube.");
      setIsBookModalOpen(false);
    } catch (err) {
      setBookFormError(getErrorMessage(err));
    } finally {
      setIsCreatingBook(false);
    }
  }

  if (isLoading) {
    return <PageLoading message="Carregando livros..." />;
  }

  if (!club) {
    return <main className="shell" id="conteudo-principal"><p role="alert">{feedback || "Clube não encontrado."}</p></main>;
  }

  return (
    <main className="shell" id="conteudo-principal">
      <section className="page-heading page-heading-with-actions">
        <div>
          <p className="eyebrow">Clube de leitura</p>
          <div className="page-heading-row">
            <h1>Livros do {club.name}</h1>
            <div className="inline-actions">
              {isAdmin && (
                <button type="button" onClick={() => { setBookFormError(""); setBookErrors({}); setIsBookModalOpen(true); }}>
                  📚 Cadastrar livro
                </button>
              )}
              <Link className="button-link secondary" to={`/clubs/${club.id}`}>
                ↩️ Voltar ao clube
              </Link>
            </div>
          </div>
          <p>Leituras em andamento, planejadas e concluídas do clube.</p>
        </div>
      </section>

      <PageFeedback message={feedback} />

      <section className="workspace-panel wide-panel">
        <div className="section-header compact">
          <div>
            <h2>📚 Todos os livros</h2>
            <p>Ordenados por em leitura, planejados e concluídos.</p>
          </div>
        </div>

        {orderedBooks.length ? (
          <div className="item-list scroll-list long-list">
            {orderedBooks.map((book) => (
              <article className="resource-card" key={book.id}>
                <div className="resource-main">
                  <h3><Link className="card-title-link" to={`/books/${book.id}`}>{book.title}</Link></h3>
                  <p>{book.author}</p>
                  <div className="resource-meta">
                    {book.status === "concluido" && book.finished_at ? (
                      <span>Concluído em {new Date(book.finished_at).toLocaleDateString("pt-BR")}</span>
                    ) : (
                      <span>{statusLabel[book.status]}</span>
                    )}
                  </div>
                </div>
                <div className="card-actions">
                  <div className="like-control">
                    <button
                      aria-label={book.liked_by_current_user ? `Remover curtida de ${book.title}` : `Curtir ${book.title}`}
                      aria-pressed={book.liked_by_current_user}
                      className={`like-toggle ${book.liked_by_current_user ? "active" : ""}`}
                      title={book.liked_by_current_user ? "Remover like" : "Curtir"}
                      type="button"
                      onClick={() => handleToggleBookLike(book)}
                    >
                      <span className="toggle-glyph" aria-hidden="true" />
                    </button>
                    <span>{book.like_count}</span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <p>Este clube ainda não possui livros cadastrados.</p>
            <span>{isAdmin ? "Use o botão Cadastrar livro para registrar a primeira leitura." : "Aguarde um administrador publicar a primeira obra."}</span>
          </div>
        )}
      </section>

      <Modal title="Cadastrar livro" isOpen={isBookModalOpen} onClose={() => setIsBookModalOpen(false)}>
        <form onSubmit={handleCreateBook} aria-busy={isCreatingBook} noValidate>
          <div className="form-field">
            <label htmlFor="create-book-title">Título</label>
            <input id="create-book-title" name="title" value={title} onChange={(event) => { setTitle(event.target.value); setBookErrors((current) => ({ ...current, title: undefined })); }} aria-invalid={Boolean(bookErrors.title)} aria-describedby={bookErrors.title ? "create-book-title-error" : undefined} />
            {bookErrors.title && <p className="field-error" id="create-book-title-error">{bookErrors.title}</p>}
          </div>
          <div className="form-field">
            <label htmlFor="create-book-author">Autor</label>
            <input id="create-book-author" name="author" value={author} onChange={(event) => { setAuthor(event.target.value); setBookErrors((current) => ({ ...current, author: undefined })); }} aria-invalid={Boolean(bookErrors.author)} aria-describedby={bookErrors.author ? "create-book-author-error" : undefined} />
            {bookErrors.author && <p className="field-error" id="create-book-author-error">{bookErrors.author}</p>}
          </div>
          <label>
            Descrição
            <textarea value={description} onChange={(event) => setDescription(event.target.value)} />
          </label>
          <label>
            Situação
            <select value={status} onChange={(event) => setStatus(event.target.value as ReadingStatus)}>
              <option value="planejado">Planejado</option>
              <option value="em_leitura">Em leitura</option>
              <option value="concluido">Concluído</option>
            </select>
          </label>
          {bookFormError && <p className="feedback error form-alert" role="alert">{bookFormError}</p>}
          <div className="form-actions">
            <button className="ghost-button" type="button" onClick={() => setIsBookModalOpen(false)}>
              Cancelar
            </button>
            <button type="submit" disabled={isCreatingBook}>{isCreatingBook ? "Cadastrando..." : "Cadastrar livro"}</button>
          </div>
        </form>
      </Modal>
    </main>
  );
}
