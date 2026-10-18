import { FormEvent, useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { ChevronLeft, ChevronRight, MessageSquare } from "lucide-react";
import { useUser } from "../../../contexts/UserContext";
import { useIsMobile } from "../../../hooks/useIsMobile";
import { getMediaUrl } from "../../../services/config";
import {
  createMasterComment,
  deleteMasterComment,
  listMasterComments,
  MasterComment,
  updateMasterComment,
} from "../../../services/api/comments.api";

type Props = {
  masterId: number;
};

function commentErrorMessage(err: unknown) {
  const response = (err as { response?: { data?: { message?: string } } })
    ?.response;
  return response?.data?.message || "Something went wrong. Please try again.";
}

const NAV_BUTTON_CLASS =
  "inline-flex shrink-0 items-center justify-center w-9 h-9 rounded-full border border-[#1F1109]/[0.08] bg-white/70 text-[#5C4631] shadow-sm transition-all hover:border-[#B8893D]/35 hover:bg-white hover:text-[#B8893D] disabled:opacity-30 disabled:shadow-none disabled:hover:border-[#1F1109]/[0.08] disabled:hover:bg-white/70 disabled:hover:text-[#5C4631]";

function formatWhen(value: string) {
  return new Date(value).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function CommentCard({
  comment,
  mine,
  editing,
  editText,
  submitting,
  onEditText,
  onStartEdit,
  onCancelEdit,
  onSaveEdit,
  onDelete,
}: {
  comment: MasterComment;
  mine: boolean;
  editing: boolean;
  editText: string;
  submitting: boolean;
  onEditText: (value: string) => void;
  onStartEdit: () => void;
  onCancelEdit: () => void;
  onSaveEdit: () => void;
  onDelete: () => void;
}) {
  const bodyRef = useRef<HTMLDivElement>(null);
  const [expanded, setExpanded] = useState(false);
  const [overflows, setOverflows] = useState(false);
  const avatar = comment.user.profilePictureThumbnailUrl
    ? getMediaUrl(comment.user.profilePictureThumbnailUrl)
    : "";
  const edited =
    new Date(comment.updatedAt).getTime() - new Date(comment.createdAt).getTime() >
    1000;

  useEffect(() => {
    setExpanded(false);
  }, [comment.text]);

  useEffect(() => {
    const el = bodyRef.current;
    if (!el || editing || expanded) return;

    const measure = () => {
      setOverflows(el.scrollHeight > el.clientHeight + 1);
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, [comment.text, editing, expanded]);

  return (
    <li className="flex flex-col rounded-xl border border-[#1F1109]/[0.08] bg-gradient-to-b from-[#FAF5EB] to-[#FAF5EB]/70 px-4 py-3 shadow-[0_1px_2px_rgba(31,17,9,0.04)]">
      <div
        ref={bodyRef}
        className={
          editing
            ? ""
            : expanded
              ? "max-h-48 overflow-y-auto"
              : "max-h-24 overflow-hidden"
        }
      >
        <div className="flex items-start gap-3">
          {avatar ? (
            <img
              src={avatar}
              alt=""
              className="h-9 w-9 rounded-full object-cover"
            />
          ) : (
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#1F1109]/10 text-xs font-medium uppercase">
              {comment.user.username.slice(0, 1)}
            </span>
          )}
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-baseline gap-x-2">
              <span className="text-sm font-medium text-[#1F1109]">
                {[comment.user.title, comment.user.username]
                  .filter(Boolean)
                  .join(" ")}
              </span>
              <time
                className="text-xs text-[#6B5640]"
                dateTime={comment.createdAt}
              >
                {formatWhen(comment.createdAt)}
                {edited ? " · edited" : ""}
              </time>
            </div>

            {editing ? (
              <div className="mt-2 space-y-2">
                <textarea
                  value={editText}
                  onChange={(event) => onEditText(event.target.value)}
                  maxLength={2000}
                  rows={3}
                  className="w-full rounded-lg border border-[#1F1109]/15 bg-[#FAF5EB] px-3 py-2 text-sm text-[#1F1109] outline-none focus:border-[#B8893D]"
                />
                <div className="flex gap-2">
                  <button
                    type="button"
                    disabled={submitting || editText.trim().length === 0}
                    onClick={onSaveEdit}
                    className="rounded-full bg-[#B8893D] px-3 py-1.5 text-xs font-medium text-[#1F1109] disabled:opacity-60"
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={onCancelEdit}
                    className="rounded-full px-3 py-1.5 text-xs text-[#1F1109]/70"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-[#5C4631]">
                {comment.text}
              </p>
            )}
          </div>
        </div>
      </div>
      {!editing && (overflows || expanded || mine) ? (
        <div className="mt-2 flex flex-wrap items-center gap-3">
          {(overflows || expanded) ? (
            <button
              type="button"
              onClick={() => setExpanded((open) => !open)}
              className="text-sm font-medium text-[#B8893D] hover:underline"
            >
              {expanded ? "Show less" : "Show more"}
            </button>
          ) : null}
          {mine ? (
            <>
              <button
                type="button"
                className="text-xs text-[#6B4F1F] underline"
                onClick={onStartEdit}
              >
                Edit
              </button>
              <button
                type="button"
                className="text-xs text-red-700 underline"
                disabled={submitting}
                onClick={onDelete}
              >
                Delete
              </button>
            </>
          ) : null}
        </div>
      ) : null}
    </li>
  );
}

export function MasterComments({ masterId }: Props) {
  const { user } = useUser();
  const location = useLocation();
  const [comments, setComments] = useState<MasterComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editText, setEditText] = useState("");
  const [page, setPage] = useState(0);
  const isMobile = useIsMobile();
  const pageSize = isMobile ? 1 : 3;
  const pageCount = Math.max(1, Math.ceil(comments.length / pageSize));
  const safePage = Math.min(page, pageCount - 1);
  const visibleComments = comments.slice(
    safePage * pageSize,
    safePage * pageSize + pageSize
  );

  const loginHref = `/login?redirect=${encodeURIComponent(
    `${location.pathname}${location.search}`
  )}`;

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    listMasterComments(masterId)
      .then((items) => {
        if (!cancelled) setComments(items);
      })
      .catch(() => {
        if (!cancelled) setError("Could not load comments.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [masterId]);

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const nextText = text.trim();
    if (!nextText) return;

    setSubmitting(true);
    setError(null);
    try {
      const created = await createMasterComment({ masterId, text: nextText });
      setComments((current) => [created, ...current]);
      setPage(0);
      setText("");
    } catch (err) {
      setError(commentErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const onSaveEdit = async (id: number) => {
    const nextText = editText.trim();
    if (!nextText) return;

    setSubmitting(true);
    setError(null);
    try {
      const updated = await updateMasterComment(id, nextText);
      setComments((current) =>
        current.map((comment) => (comment.id === id ? updated : comment))
      );
      setEditingId(null);
      setEditText("");
    } catch (err) {
      setError(commentErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const onDelete = async (id: number) => {
    setSubmitting(true);
    setError(null);
    try {
      await deleteMasterComment(id);
      setComments((current) => current.filter((comment) => comment.id !== id));
      if (editingId === id) {
        setEditingId(null);
        setEditText("");
      }
    } catch (err) {
      setError(commentErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="rounded-xl bg-white border border-[#1F1109]/[0.12] p-5 md:p-6">
      <header className="mb-5 flex items-center gap-2.5">
        <span
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#B8893D]/15 text-[#B8893D] ring-1 ring-[#B8893D]/20"
          aria-hidden
        >
          <MessageSquare size={18} />
        </span>
        <div>
          <h2
            className="text-xl text-[#1F1109]"
            style={{ fontFamily: "Georgia, serif" }}
          >
            Comments
          </h2>
          <p className="text-sm text-[#1F1109]/60">
            {comments.length === 1
              ? "1 comment"
              : `${comments.length} comments`}
          </p>
        </div>
      </header>

      {loading ? (
        <p className="text-sm text-[#1F1109]/60">Loading comments…</p>
      ) : comments.length === 0 ? (
        <p className="text-sm text-[#1F1109]/60">No comments yet.</p>
      ) : (
        <>
        {pageCount > 1 ? (
          <div className="mb-4 flex items-center justify-between gap-2 min-h-[40px]">
            <button
              type="button"
              onClick={() => setPage(safePage - 1)}
              disabled={safePage === 0}
              aria-label="Previous comments"
              className={NAV_BUTTON_CLASS}
            >
              <ChevronLeft className="w-4 h-4" strokeWidth={2.25} />
            </button>
            <p className="text-xs font-medium tracking-wide text-[#6B5640]">
              {safePage + 1} of {pageCount}
            </p>
            <button
              type="button"
              onClick={() => setPage(safePage + 1)}
              disabled={safePage >= pageCount - 1}
              aria-label="Next comments"
              className={NAV_BUTTON_CLASS}
            >
              <ChevronRight className="w-4 h-4" strokeWidth={2.25} />
            </button>
          </div>
        ) : null}
        <ul className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {visibleComments.map((comment) => (
            <CommentCard
              key={comment.id}
              comment={comment}
              mine={user?.id === comment.userId}
              editing={editingId === comment.id}
              editText={editText}
              submitting={submitting}
              onEditText={setEditText}
              onStartEdit={() => {
                setEditingId(comment.id);
                setEditText(comment.text);
              }}
              onCancelEdit={() => {
                setEditingId(null);
                setEditText("");
              }}
              onSaveEdit={() => onSaveEdit(comment.id)}
              onDelete={() => {
                if (window.confirm("Delete this comment?")) {
                  onDelete(comment.id);
                }
              }}
            />
          ))}
        </ul>
        {pageCount > 1 ? (
          <div
            className="flex items-center justify-center gap-1.5 pt-4"
            role="tablist"
            aria-label="Comment pages"
          >
            {Array.from({ length: pageCount }, (_, index) => {
              const isActive = index === safePage;
              return (
                <button
                  key={index}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  aria-label={`Go to comments ${index + 1}`}
                  onClick={() => setPage(index)}
                  className={`rounded-full transition-all duration-200 ${
                    isActive
                      ? "h-2 w-6 bg-[#B8893D]"
                      : "h-1.5 w-1.5 bg-[#1F1109]/20 hover:bg-[#1F1109]/35"
                  }`}
                />
              );
            })}
          </div>
        ) : null}
        </>
      )}

      <div className="mt-6 border-t border-[#B8893D]/35 pt-6">
        {error ? (
          <p className="mb-4 text-sm text-red-700" role="alert">
            {error}
          </p>
        ) : null}

        {user ? (
          <form onSubmit={onSubmit} className="space-y-3">
            <label className="block text-sm font-medium text-[#1F1109]" htmlFor="new-comment">
              Leave a comment
            </label>
            <textarea
              id="new-comment"
              value={text}
              onChange={(event) => setText(event.target.value)}
              maxLength={2000}
              rows={3}
              placeholder="Share a note about this master"
              className="w-full rounded-xl border border-[#1F1109]/[0.08] bg-[#FAF5EB] px-3 py-2 text-sm text-[#1F1109] outline-none focus:border-[#B8893D]"
            />
            <div className="flex items-center justify-between gap-3">
              <span className="text-xs text-[#6B5640]/80">{text.trim().length}/2000</span>
              <button
                type="submit"
                disabled={submitting || text.trim().length === 0}
                className="rounded-full bg-[#B8893D] px-4 py-2 text-sm font-medium text-[#1F1109] hover:bg-[#A37728] disabled:opacity-60"
              >
                {submitting ? "Posting…" : "Post comment"}
              </button>
            </div>
          </form>
        ) : (
          <p className="text-sm text-[#5C4631]">
            <Link to={loginHref} className="font-medium text-[#6B4F1F] underline">
              Log in
            </Link>{" "}
            to leave a comment.
          </p>
        )}
      </div>
    </section>
  );
}
