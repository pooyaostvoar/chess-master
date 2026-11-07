import React, { createContext, useCallback, useContext, useState } from "react";
import { Pencil } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../../ui/dialog";
import { BaseUser } from "@chess-master/schemas";
import { useUser } from "../../../contexts/UserContext";
import {
  updateUser,
  UpdateUserData,
  uploadProfilePicture,
} from "../../../services/api/user.api";

type ProfileEditContextValue = {
  canEdit: boolean;
  pageEditing: boolean;
  togglePageEditing: () => void;
  saving: boolean;
  error: string;
  activeId: string | null;
  beginEdit: (id: string) => void;
  endEdit: () => void;
  save: (patch: UpdateUserData) => Promise<boolean>;
  uploadPhoto: (file: File) => Promise<void>;
};

const disabledEdit: ProfileEditContextValue = {
  canEdit: false,
  pageEditing: false,
  togglePageEditing: () => {},
  saving: false,
  error: "",
  activeId: null,
  beginEdit: () => {},
  endEdit: () => {},
  save: async () => false,
  uploadPhoto: async () => {},
};

const ProfileEditContext = createContext<ProfileEditContextValue | null>(null);

function errorMessage(err: unknown, fallback: string) {
  return err instanceof Error && err.message ? err.message : fallback;
}

export function ProfileEditProvider({
  user,
  onChange,
  children,
}: {
  user: BaseUser;
  onChange: (user: BaseUser) => void;
  children: React.ReactNode;
}) {
  const { user: viewer, setUser: setViewer } = useUser();
  const [pageEditing, setPageEditing] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const canEdit = Boolean(viewer && viewer.id === user.id && user.isMaster);

  const togglePageEditing = useCallback(() => {
    setPageEditing((current) => {
      if (current) {
        setActiveId(null);
        setError("");
      }
      return !current;
    });
  }, []);

  const beginEdit = useCallback((id: string) => {
    setError("");
    setActiveId((current) => (current === id ? null : id));
  }, []);

  const endEdit = useCallback(() => {
    setError("");
    setActiveId(null);
  }, []);

  const publish = useCallback(
    (next: BaseUser) => {
      onChange(next);
      if (viewer && viewer.id === next.id) {
        setViewer({
          ...viewer,
          ...next,
          profilePictureUrl: next.profilePictureUrl ?? viewer.profilePictureUrl,
          profilePictureThumbnailUrl:
            next.profilePictureThumbnailUrl ?? viewer.profilePictureThumbnailUrl,
        });
      }
    },
    [onChange, setViewer, viewer]
  );

  const save = useCallback(
    async (patch: UpdateUserData) => {
      setSaving(true);
      setError("");
      try {
        const data = await updateUser(user.id, patch);
        const next: BaseUser = {
          ...user,
          ...data.user,
          profilePictureUrl: data.user.profilePictureUrl ?? user.profilePictureUrl,
          profilePictureThumbnailUrl:
            data.user.profilePictureThumbnailUrl ?? user.profilePictureThumbnailUrl,
        };
        publish(next);
        setActiveId(null);
        return true;
      } catch (err) {
        setError(errorMessage(err, "Could not save this section."));
        return false;
      } finally {
        setSaving(false);
      }
    },
    [publish, user]
  );

  const uploadPhoto = useCallback(
    async (file: File) => {
      if (!file.type.startsWith("image/")) {
        throw new Error("Please select an image file.");
      }
      if (file.size > 5 * 1024 * 1024) {
        throw new Error("Image size should be less than 5MB.");
      }

      setSaving(true);
      setError("");
      try {
        const result = await uploadProfilePicture(file);
        publish({
          ...user,
          profilePictureUrl: result.url,
          profilePictureThumbnailUrl: result.url,
        });
      } catch (err) {
        throw new Error(errorMessage(err, "Could not upload that photo."));
      } finally {
        setSaving(false);
      }
    },
    [publish, user]
  );

  const value: ProfileEditContextValue = {
    canEdit,
    pageEditing,
    togglePageEditing,
    saving,
    error,
    activeId,
    beginEdit,
    endEdit,
    save,
    uploadPhoto,
  };

  return (
    <ProfileEditContext.Provider value={value}>
      {children}
    </ProfileEditContext.Provider>
  );
}

export function useProfileEdit() {
  return useContext(ProfileEditContext) ?? disabledEdit;
}

export function PageEditButton() {
  const { canEdit, pageEditing, togglePageEditing } = useProfileEdit();
  if (!canEdit) return null;

  return (
    <div className="flex justify-end">
      <button
        type="button"
        onClick={togglePageEditing}
        className="inline-flex items-center gap-2 rounded-full bg-[#B8893D] px-4 py-2 text-sm font-medium text-[#1F1109] transition hover:bg-[#A37728]"
      >
        <Pencil className="h-3.5 w-3.5" strokeWidth={2} />
        {pageEditing ? "Done" : "Edit profile"}
      </button>
    </div>
  );
}

export function EditPencil({
  id,
  label,
  tone = "light",
  withText = false,
}: {
  id: string;
  label: string;
  tone?: "light" | "dark";
  withText?: boolean;
}) {
  const { pageEditing, beginEdit } = useProfileEdit();
  if (!pageEditing) return null;

  const toneClass =
    tone === "dark"
      ? "bg-[#F4ECDD]/10 text-[#F4ECDD] ring-1 ring-[#F4ECDD]/25 hover:bg-[#F4ECDD]/20"
      : "border border-[#1F1109]/10 bg-white text-[#5C4631] hover:border-[#B8893D]/40 hover:text-[#8B6F1F]";

  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={() => beginEdit(id)}
      className={`inline-flex shrink-0 items-center justify-center gap-1.5 rounded-full transition ${
        withText ? "h-8 px-3" : "h-8 w-8"
      } ${toneClass}`}
    >
      <Pencil className="h-3.5 w-3.5" strokeWidth={2} />
      {withText ? <span className="text-xs font-medium">Edit</span> : null}
    </button>
  );
}

export function EditorSheet({
  title,
  children,
  onSave,
  error,
  bare = false,
}: {
  title: string;
  children: React.ReactNode;
  onSave: () => void;
  error?: string;
  bare?: boolean;
}) {
  const { endEdit, saving } = useProfileEdit();

  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open && !saving) endEdit();
      }}
    >
      <DialogContent
        {...(bare ? { "aria-describedby": undefined } : {})}
        className="max-h-[90vh] overflow-y-auto border-[#1F1109]/[0.12] bg-[#FAF5EB] sm:max-w-xl"
      >
        <DialogHeader className={bare ? "sr-only" : undefined}>
          <DialogTitle
            className="pr-6 text-left text-[#1F1109]"
            style={{ fontFamily: "Georgia, serif" }}
          >
            {title}
          </DialogTitle>
          {bare ? null : (
            <DialogDescription className="text-left text-[#6B5640]">
              This updates what students see on your profile.
            </DialogDescription>
          )}
        </DialogHeader>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            onSave();
          }}
        >
          {children}
          {error ? <p className="mt-3 text-sm text-[#7A2E2E]">{error}</p> : null}
          <div className="mt-5 flex justify-end gap-2">
            <button
              type="button"
              onClick={endEdit}
              disabled={saving}
              className="rounded-full border border-[#1F1109]/15 bg-white px-4 py-2 text-sm font-medium text-[#1F1109] transition hover:bg-[#1F1109]/[0.04] disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rounded-full bg-[#B8893D] px-4 py-2 text-sm font-medium text-[#1F1109] transition hover:bg-[#A37728] disabled:cursor-wait disabled:bg-[#8B6F4E]"
            >
              {saving ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
