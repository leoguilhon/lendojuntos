import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { CommentComposer } from "../components/CommentComposer";
import { PageLoading } from "../components/PageLoading";
import { PageFeedback } from "../components/PageFeedback";
import { bookService, clubService, getErrorMessage } from "../services/api";
import type { Book, ClubRole, Comment, Meeting, ReadingStatus } from "../types";
import { formatMeetingDateTime, getMeetingDetailsPath } from "../utils/meetings";

const statusLabel: Record<ReadingStatus, string> = {
  planejado: "Planejado",
  em_leitura: "Em leitura",
  concluido: "Concluído",
};

export function BookDetailsPage() {
  const { id } = useParams();
  const [book, setBook] = useState<Book | null>(null);
  const [clubRole, setClubRole] = useState<ClubRole | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [comment, setComment] = useState("");
  const [feedback, setFeedback] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const bookId = id;
    let isMounted = true;

    async function loadBookDetails() {
      try {
        const bookData = await bookService.get(bookId);
        const [clubData, commentData, meetingData] = await Promise.all([
          clubService.get(bookData.club_id),
          bookService.comments(bookId),
          bookService.meetings(bookId),
        ]);
        if (!isMounted) return;
        setBook(bookData);
        setClubRole(clubData.current_user_role);
        setComments(commentData);
        setMeetings(meetingData);
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

    void loadBookDetails();

    return () => {
      isMounted = false;
    };
  }, [id]);

  async function handleStatusChange(status: ReadingStatus) {
    if (!id || clubRole !== "admin") return;
    setFeedback("");
    try {
      const updatedBook = await bookService.updateStatus(id, status);
      setBook(updatedBook);
      setFeedback(`Situação de ${updatedBook.title} alterada para ${statusLabel[updatedBook.status]}.`);
    } catch (err) {
      setFeedback(`Erro: ${getErrorMessage(err)}`);
    }
  }

  async function handleAddComment(content: string) {
    if (!id) return;
    setFeedback("");
    const newComment = await bookService.addComment(id, content);
    setComments((current) => [...current, newComment]);
    setFeedback("Comentário publicado no livro.");
  }

  async function handleToggleLike() {
    if (!book) return;
    setFeedback("");

    try {
      const updatedBook = book.liked_by_current_user ? await bookService.unlike(book.id) : await bookService.like(book.id);
      setBook(updatedBook);
      setFeedback(
        updatedBook.liked_by_current_user
          ? `${updatedBook.title} curtido.`
          : `Curtida removida de ${updatedBook.title}.`,
      );
    } catch (err) {
      setFeedback(`Erro: ${getErrorMessage(err)}`);
    }
  }

  if (isLoading) {
    return <PageLoading message="Carregando livro..." />;
  }

  if (!book) {
    return <main className="shell" id="conteudo-principal"><p role="alert">{feedback || "Livro não encontrado."}</p></main>;
  }

  return (
    <main className="shell narrow" id="conteudo-principal">
      <section className="page-heading page-heading-with-actions">
        <div>
          <p className="eyebrow">{statusLabel[book.status]}</p>
          <div className="page-heading-row">
            <h1>{book.title}</h1>
            <div className="inline-actions">
              <div className="like-control">
                <button
                  aria-label={book.liked_by_current_user ? `Remover curtida de ${book.title}` : `Curtir ${book.title}`}
                  aria-pressed={book.liked_by_current_user}
                  className={`like-toggle ${book.liked_by_current_user ? "active" : ""}`}
                  title={book.liked_by_current_user ? "Remover like" : "Curtir"}
                  type="button"
                  onClick={handleToggleLike}
                >
                  <span className="toggle-glyph" aria-hidden="true" />
                </button>
                <span>{book.like_count}</span>
              </div>
              <Link className="button-link secondary" to={`/clubs/${book.club_id}`}>
                Voltar ao clube
              </Link>
            </div>
          </div>
          <p>{book.author}</p>
          <div className="resource-meta">
            {book.liked_by_current_user && <span>Curtido por você</span>}
          </div>
        </div>
      </section>

      <PageFeedback message={feedback} />

      <section className="stack-layout">
        <section className="panel">
          <h2>Detalhes da leitura</h2>
          <p>{book.description || "Sem descrição cadastrada."}</p>
          {book.finished_at && <p>Leitura concluída em {new Date(book.finished_at).toLocaleDateString("pt-BR")}.</p>}

          <fieldset className="reading-status-group" disabled={clubRole !== "admin"}>
            <legend>Situação da leitura</legend>
            {clubRole !== "admin" && <p>Somente administradores do clube podem alterar esta situação.</p>}
            <div className="segmented-control">
              {(["planejado", "em_leitura", "concluido"] as ReadingStatus[]).map((status) => (
                <button
                  aria-pressed={book.status === status}
                  className={book.status === status ? "active" : ""}
                  key={status}
                  type="button"
                  onClick={() => handleStatusChange(status)}
                >
                  {statusLabel[status]}{book.status === status ? " — selecionado" : ""}
                </button>
              ))}
            </div>
          </fieldset>
        </section>

        <section className="panel">
          <div className="section-header">
            <div>
              <h2>Encontros relacionados</h2>
              <p>Discussões e reuniões vinculadas a esta leitura.</p>
            </div>
            <Link className="button-link secondary" to={`/clubs/${book.club_id}/meetings`}>
              Abrir encontros
            </Link>
          </div>
          {meetings.length ? (
            <div className="item-list">
              {meetings.map((meeting) => (
                <article className="list-card" key={meeting.id}>
                  <div>
                    <h3><Link className="card-title-link" to={getMeetingDetailsPath(meeting.club_id, meeting.id)}>{meeting.title}</Link></h3>
                    <p>{formatMeetingDateTime(meeting.scheduled_for)}</p>
                    <span>{meeting.location || "Local a definir"}</span>
                  </div>
                  <strong className="comment-count">{meeting.comment_count} comentário(s)</strong>
                </article>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <p>Este livro ainda não possui encontros vinculados.</p>
              <span>Os encontros aparecerão aqui quando forem planejados pelo clube.</span>
            </div>
          )}
        </section>

        <section className="panel">
          <div className="section-header">
            <div>
              <h2>Comentários do livro</h2>
              <p>Espaço simples para registrar impressões do clube sobre a leitura.</p>
            </div>
          </div>

          {comments.length ? (
            <div className="comment-list">
              {comments.map((item) => (
                <article className="comment-card" key={item.id}>
                  <div className="comment-meta">
                    <strong>{item.user_name}</strong>
                    <span>{formatMeetingDateTime(item.created_at)}</span>
                  </div>
                  <p>{item.content}</p>
                </article>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <p>Ainda não há comentários sobre este livro.</p>
              <span>Publique a primeira observação para iniciar a discussão.</span>
            </div>
          )}

          <CommentComposer
            idPrefix="book-comment"
            value={comment}
            onChange={setComment}
            onPublish={handleAddComment}
            placeholder="Compartilhe um ponto da leitura para o clube discutir."
          />
        </section>
      </section>
    </main>
  );
}
