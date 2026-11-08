import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ActionMenu } from "../components/ActionMenu";
import { Modal } from "../components/Modal";
import { PageLoading } from "../components/PageLoading";
import { PageFeedback } from "../components/PageFeedback";
import { useAuth } from "../contexts/AuthContext";
import { bookService, clubService, getErrorMessage, meetingService } from "../services/api";
import type { Book, Club, ClubMember, Meeting, ReadingStatus } from "../types";
import { formatMeetingDateTime, getMeetingDetailsPath } from "../utils/meetings";

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

export function ClubDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [club, setClub] = useState<Club | null>(null);
  const [members, setMembers] = useState<ClubMember[]>([]);
  const [books, setBooks] = useState<Book[]>([]);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [clubNameDraft, setClubNameDraft] = useState("");
  const [clubDescriptionDraft, setClubDescriptionDraft] = useState("");
  const [feedback, setFeedback] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(() => new Date().toISOString());
  const [isEditClubModalOpen, setIsEditClubModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);
  const [editClubError, setEditClubError] = useState("");
  const [editClubErrors, setEditClubErrors] = useState<{ name?: string; description?: string }>({});
  const [isSavingClub, setIsSavingClub] = useState(false);

  const isAdmin = club?.current_user_role === "admin";
  const canEditClub = Boolean(club && user && club.owner_id === user.id);
  const canDeleteClub = Boolean(club && user && club.owner_id === user.id);
  const canLeaveClub = Boolean(club && user && club.is_member && club.owner_id !== user.id);
  const orderedBooks = useMemo(
    () =>
      [...books].sort(
        (a, b) =>
          statusOrder[a.status] - statusOrder[b.status] ||
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
      ),
    [books],
  );
  const currentBook = useMemo(() => orderedBooks.find((book) => book.status === "em_leitura"), [orderedBooks]);
  const nextMeeting = useMemo(
    () => meetings.find((meeting) => meeting.scheduled_for >= currentTime) ?? meetings[0] ?? null,
    [currentTime, meetings],
  );
  const orderedMeetingsDesc = useMemo(
    () => [...meetings].sort((a, b) => new Date(b.scheduled_for).getTime() - new Date(a.scheduled_for).getTime()),
    [meetings],
  );

  useEffect(() => {
    if (!id) return;
    const clubId = id;
    let isMounted = true;

    async function loadClub() {
      try {
        const [clubData, memberData, bookData, meetingData] = await Promise.all([
          clubService.get(clubId),
          clubService.members(clubId),
          bookService.listByClub(clubId),
          meetingService.listByClub(clubId),
        ]);
        if (!isMounted) return;
        setClub(clubData);
        setClubNameDraft(clubData.name);
        setClubDescriptionDraft(clubData.description);
        setMembers(memberData);
        setBooks(bookData);
        setMeetings(meetingData);
        setCurrentTime(new Date().toISOString());
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

    void loadClub();

    return () => {
      isMounted = false;
    };
  }, [id]);

  async function handleUpdateClub(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!club) return;
    const nextErrors = {
      name: clubNameDraft.trim() ? undefined : "Informe o nome do clube.",
      description: clubDescriptionDraft.trim() ? undefined : "Descreva a proposta do clube.",
    };
    if (nextErrors.name || nextErrors.description) {
      setEditClubErrors(nextErrors);
      const fieldName = nextErrors.name ? "name" : "description";
      (event.currentTarget.elements.namedItem(fieldName) as HTMLElement | null)?.focus();
      return;
    }
    setFeedback("");
    setEditClubErrors({});
    setEditClubError("");
    setIsSavingClub(true);

    try {
      const updatedClub = await clubService.update(club.id, {
        name: clubNameDraft,
        description: clubDescriptionDraft,
      });
      setClub(updatedClub);
      setClubNameDraft(updatedClub.name);
      setClubDescriptionDraft(updatedClub.description);
      setFeedback("Clube atualizado.");
      setIsEditClubModalOpen(false);
    } catch (err) {
      setEditClubError(getErrorMessage(err));
    } finally {
      setIsSavingClub(false);
    }
  }

  async function handleDeleteClub() {
    if (!id) return;
    setFeedback("");
    setIsDeleting(true);

    try {
      await clubService.remove(id);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setFeedback(`Erro: ${getErrorMessage(err)}`);
      setIsDeleteModalOpen(false);
    } finally {
      setIsDeleting(false);
    }
  }

  async function handleLeaveClub() {
    if (!id) return;
    setFeedback("");
    setIsLeaving(true);

    try {
      await clubService.leave(id);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setFeedback(`Erro: ${getErrorMessage(err)}`);
      setIsLeaveModalOpen(false);
    } finally {
      setIsLeaving(false);
    }
  }

  async function handleToggleFavorite() {
    if (!club) return;
    setFeedback("");

    try {
      const updatedClub = club.is_favorite ? await clubService.unfavorite(club.id) : await clubService.favorite(club.id);
      setClub(updatedClub);
      setFeedback(
        updatedClub.is_favorite
          ? `${updatedClub.name} adicionado aos favoritos.`
          : `${updatedClub.name} removido dos favoritos.`,
      );
    } catch (err) {
      setFeedback(`Erro: ${getErrorMessage(err)}`);
    }
  }

  if (isLoading) {
    return <PageLoading message="Carregando clube..." />;
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
            <h1>{club.name}</h1>
            <div className="inline-actions">
              <button
                aria-label={club.is_favorite ? `Remover ${club.name} dos favoritos` : `Favoritar ${club.name}`}
                aria-pressed={club.is_favorite}
                className={`favorite-toggle ${club.is_favorite ? "active" : ""}`}
                title={club.is_favorite ? "Remover favorito" : "Favoritar"}
                type="button"
                onClick={handleToggleFavorite}
              >
                <span className="toggle-glyph" aria-hidden="true" />
              </button>
              <Link className="button-link secondary" to="/dashboard">
                ↩️ Voltar
              </Link>
              {canLeaveClub && (
                <button className="danger-button" type="button" onClick={() => setIsLeaveModalOpen(true)}>
                  🚪 Sair do clube
                </button>
              )}
              {(canEditClub || canDeleteClub) && (
                <ActionMenu label="Ações do clube">
                  {canEditClub && (
                    <button type="button" onClick={() => { setEditClubError(""); setEditClubErrors({}); setIsEditClubModalOpen(true); }}>
                      ✏️ Editar clube
                    </button>
                  )}
                  {canDeleteClub && (
                    <button className="danger-button" type="button" onClick={() => setIsDeleteModalOpen(true)}>
                      🗑️ Excluir clube
                    </button>
                  )}
                </ActionMenu>
              )}
            </div>
          </div>
          <p>{club.description}</p>
        </div>
      </section>

      <PageFeedback message={feedback} />

      <section className="content-grid workspace-grid">
        <section className="workspace-panel club-summary-panel">
          <h2>📚 Livro atual</h2>
          {currentBook ? (
            <article className="compact-card">
              <h3><Link className="card-title-link" to={`/books/${currentBook.id}`}>{currentBook.title}</Link></h3>
              <p>{currentBook.author}</p>
              <span className="meta-label">{statusLabel[currentBook.status]}</span>
            </article>
          ) : (
            <div className="empty-state">
              <p>Nenhum livro marcado como leitura atual.</p>
              <span>Cadastre um livro ou atualize o status de uma leitura existente.</span>
            </div>
          )}
        </section>

        <section className="workspace-panel club-summary-panel">
          <h2>📍 Próximo encontro</h2>
          {nextMeeting ? (
            <article className="compact-card">
              <h3><Link className="card-title-link" to={getMeetingDetailsPath(nextMeeting.club_id, nextMeeting.id)}>{nextMeeting.title}</Link></h3>
              <p>{formatMeetingDateTime(nextMeeting.scheduled_for)}</p>
              <span className="meta-label">{nextMeeting.location || "Local a definir"}</span>
              <span className="meta-label">{nextMeeting.attendee_count} presença(s) confirmada(s)</span>
              {nextMeeting.book_id && <Link to={`/books/${nextMeeting.book_id}`}>{nextMeeting.book_title}</Link>}
            </article>
          ) : (
            <div className="empty-state">
              <p>Nenhum encontro cadastrado.</p>
              <span>{isAdmin ? "Planeje o primeiro encontro do clube." : "Acompanhe aqui quando o próximo encontro for criado."}</span>
            </div>
          )}
        </section>

        <section className="workspace-panel club-summary-panel members-panel">
          <h2>👤 Membros</h2>
          <div className="item-list compact scroll-list">
            {members.map((member) => (
              <div className="member-row" key={member.user_id}>
                <span>{member.name}</span>
                <strong>{member.role === "admin" ? "Admin" : "Membro"}</strong>
              </div>
            ))}
          </div>
        </section>

        <section className="workspace-panel wide-panel">
          <div className="section-header compact">
            <div>
              <h2>📚 Livros do clube</h2>
              <p>Resumo das leituras do clube.</p>
            </div>
            <Link className="button-link secondary" to={`/clubs/${club.id}/books`}>Ver todos os livros</Link>
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
                      <span>♥ {book.like_count}</span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <p>Este clube ainda não possui livros cadastrados.</p>
              <span>{isAdmin ? "Abra a página Livros do clube para cadastrar a primeira leitura." : "Aguarde um administrador publicar a primeira obra."}</span>
            </div>
          )}
        </section>

        <section className="workspace-panel wide-panel">
          <div className="section-header compact">
            <div>
              <h2>📍 Encontros</h2>
              <p>Todos os encontros do clube.</p>
            </div>
            <Link className="button-link secondary" to={`/clubs/${club.id}/meetings`}>Ver todos os encontros</Link>
          </div>
          {orderedMeetingsDesc.length ? (
            <div className="item-list scroll-list long-list">
              {orderedMeetingsDesc.map((meeting) => (
                <article className="resource-card" key={meeting.id}>
                  <div className="resource-main">
                    <h3><Link className="card-title-link" to={getMeetingDetailsPath(meeting.club_id, meeting.id)}>{meeting.title}</Link></h3>
                    <p>{formatMeetingDateTime(meeting.scheduled_for)}</p>
                    <div className="resource-meta">
                      <span>{meeting.location || "Local a definir"}</span>
                      <span>{meeting.attendee_count} presença(s)</span>
                      <span>{meeting.comment_count} comentário(s)</span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <p>Este clube ainda não possui encontros cadastrados.</p>
              <span>Assim que um encontro for planejado, ele aparecerá aqui.</span>
            </div>
          )}
        </section>
      </section>

      <Modal title="Editar clube" isOpen={isEditClubModalOpen} onClose={() => setIsEditClubModalOpen(false)}>
        <form onSubmit={handleUpdateClub} aria-busy={isSavingClub} noValidate>
          <div className="form-field">
            <label htmlFor="edit-club-name">Título</label>
            <input id="edit-club-name" name="name" value={clubNameDraft} onChange={(event) => { setClubNameDraft(event.target.value); setEditClubErrors((current) => ({ ...current, name: undefined })); }} aria-invalid={Boolean(editClubErrors.name)} aria-describedby={editClubErrors.name ? "edit-club-name-error" : undefined} />
            {editClubErrors.name && <p className="field-error" id="edit-club-name-error">{editClubErrors.name}</p>}
          </div>
          <div className="form-field">
            <label htmlFor="edit-club-description">Descrição</label>
            <textarea id="edit-club-description" name="description" value={clubDescriptionDraft} onChange={(event) => { setClubDescriptionDraft(event.target.value); setEditClubErrors((current) => ({ ...current, description: undefined })); }} aria-invalid={Boolean(editClubErrors.description)} aria-describedby={editClubErrors.description ? "edit-club-description-error" : undefined} />
            {editClubErrors.description && <p className="field-error" id="edit-club-description-error">{editClubErrors.description}</p>}
          </div>
          {editClubError && <p className="feedback error form-alert" role="alert">{editClubError}</p>}
          <div className="form-actions">
            <button className="ghost-button" type="button" onClick={() => setIsEditClubModalOpen(false)}>
              Cancelar
            </button>
            <button type="submit" disabled={isSavingClub}>{isSavingClub ? "Salvando..." : "Salvar alterações"}</button>
          </div>
        </form>
      </Modal>

      <Modal title="Excluir clube" isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)}>
        <div className="confirmation-content">
          <p>
            Esta ação excluirá o clube, seus livros, encontros, comentários e membros. Apenas o criador do clube pode
            fazer isso.
          </p>
          <div className="form-actions">
            <button className="ghost-button" data-modal-initial-focus type="button" onClick={() => setIsDeleteModalOpen(false)}>
              Cancelar
            </button>
            <button className="danger-button" type="button" onClick={handleDeleteClub} disabled={isDeleting}>
              {isDeleting ? "Excluindo..." : "Excluir clube"}
            </button>
          </div>
        </div>
      </Modal>

      <Modal title="Sair do clube" isOpen={isLeaveModalOpen} onClose={() => setIsLeaveModalOpen(false)}>
        <div className="confirmation-content">
          <p>Ao sair do clube, você deixará de acessar seus livros, encontros e comentários internos.</p>
          <div className="form-actions">
            <button className="ghost-button" data-modal-initial-focus type="button" onClick={() => setIsLeaveModalOpen(false)}>
              Cancelar
            </button>
            <button className="danger-button" type="button" onClick={handleLeaveClub} disabled={isLeaving}>
              {isLeaving ? "Saindo..." : "Sair do clube"}
            </button>
          </div>
        </div>
      </Modal>
    </main>
  );
}
