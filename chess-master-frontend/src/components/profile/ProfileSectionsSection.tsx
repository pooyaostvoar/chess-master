type ProfileSection = {
  title: string;
  content: string;
};

type Props = {
  sections: ProfileSection[];
  onChange: (sections: ProfileSection[]) => void;
  compact?: boolean;
};

const emptySection = (): ProfileSection => ({ title: "", content: "" });

export const ProfileSectionsSection: React.FC<Props> = ({
  sections,
  onChange,
  compact = false,
}) => {
  const updateSection = (
    index: number,
    field: keyof ProfileSection,
    value: string
  ) => {
    onChange(
      sections.map((section, i) =>
        i === index ? { ...section, [field]: value } : section
      )
    );
  };

  const removeSection = (index: number) => {
    onChange(sections.filter((_, i) => i !== index));
  };

  return (
    <section>
      <div className={compact ? "mb-2.5" : "mb-4"}>
        {!compact && (
          <h3 className="text-sm font-medium text-[#1F1109]">Profile tabs</h3>
        )}
        <p
          className={
            compact
              ? "text-xs text-[#6B5A42]"
              : "text-sm text-[#6B5640] mt-1"
          }
        >
          These sections appear as tabs on your public master profile.
        </p>
      </div>

      <div className={compact ? "space-y-2.5" : "space-y-4"}>
        {sections.length === 0 && (
          <div
            className={`rounded-md border border-dashed border-[#1F1109]/[0.14] bg-[#F4ECDD]/40 px-3 py-4 text-center text-[#6B5640] ${
              compact ? "text-xs" : "text-sm"
            }`}
          >
            No profile tabs yet.
          </div>
        )}

        {sections.map((section, index) => (
          <div
            key={index}
            className={`rounded-md border border-[#1F1109]/[0.08] bg-[#FDF9EE] ${
              compact ? "p-3" : "p-4"
            }`}
          >
            <div className="flex items-center justify-between gap-3 mb-2">
              <div
                className={
                  compact
                    ? "text-xs font-medium text-[#3D2817]"
                    : "text-sm font-medium text-[#3D2817]"
                }
              >
                Tab {index + 1}
              </div>
              <button
                type="button"
                onClick={() => removeSection(index)}
                className={`font-medium text-[#7A2E2E] hover:underline ${
                  compact ? "text-xs" : "text-sm"
                }`}
              >
                Remove
              </button>
            </div>

            <label
              className={
                compact
                  ? "block text-xs font-medium text-[#3D2817] mb-1"
                  : "block text-sm font-medium text-[#3D2817] mb-1.5 tracking-[0.02em]"
              }
            >
              Tab title
            </label>
            <input
              type="text"
              value={section.title}
              onChange={(event) =>
                updateSection(index, "title", event.target.value)
              }
              placeholder="About me"
              className={`w-full rounded-md border border-[#1F1109]/[0.12] bg-white px-3 py-2 text-[#1F1109] outline-none focus:border-[#B8893D] ${
                compact ? "text-xs" : "text-sm"
              }`}
            />

            <label
              className={
                compact
                  ? "block text-xs font-medium text-[#3D2817] mt-2.5 mb-1"
                  : "block text-sm font-medium text-[#3D2817] mt-3 mb-1.5 tracking-[0.02em]"
              }
            >
              Description
            </label>
            <textarea
              value={section.content}
              onChange={(event) =>
                updateSection(index, "content", event.target.value)
              }
              placeholder="Write what should appear inside this tab..."
              rows={compact ? 4 : 5}
              className={`w-full rounded-md border border-[#1F1109]/[0.12] bg-white px-3 py-2 text-[#1F1109] outline-none focus:border-[#B8893D] resize-y ${
                compact ? "text-xs" : "text-sm"
              }`}
            />
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={() => onChange([...sections, emptySection()])}
        className={`mt-2.5 rounded-full border border-[#B8893D]/40 px-3 py-1 font-medium text-[#8B6F1F] hover:bg-[#B8893D]/10 transition-colors ${
          compact ? "text-[11px]" : "text-xs"
        }`}
      >
        Add tab
      </button>
    </section>
  );
};
