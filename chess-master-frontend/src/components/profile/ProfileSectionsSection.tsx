type ProfileSection = {
  title: string;
  content: string;
};

type Props = {
  sections: ProfileSection[];
  onChange: (sections: ProfileSection[]) => void;
};

const emptySection = (): ProfileSection => ({ title: "", content: "" });

export const ProfileSectionsSection: React.FC<Props> = ({
  sections,
  onChange,
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
      <div className="flex items-center justify-between gap-3 mb-4">
        <div>
          <h3 className="text-sm font-medium text-[#1F1109]">Profile tabs</h3>
          <p className="text-xs text-[#6B5640] mt-1">
            These sections appear as tabs on your public master profile.
          </p>
        </div>
        <button
          type="button"
          onClick={() => onChange([...sections, emptySection()])}
          className="rounded-full border border-[#B8893D]/40 px-4 py-1.5 text-xs font-medium text-[#8B6F1F] hover:bg-[#B8893D]/10 transition-colors"
        >
          Add tab
        </button>
      </div>

      <div className="space-y-4">
        {sections.length === 0 && (
          <div className="rounded-lg border border-dashed border-[#1F1109]/[0.14] bg-[#F4ECDD]/40 px-4 py-5 text-center text-xs text-[#6B5640]">
            No profile tabs yet.
          </div>
        )}

        {sections.map((section, index) => (
          <div
            key={index}
            className="rounded-lg border border-[#1F1109]/[0.08] bg-[#FDF9EE] p-4"
          >
            <div className="flex items-center justify-between gap-3 mb-3">
              <div className="text-xs font-medium text-[#3D2817]">
                Tab {index + 1}
              </div>
              <button
                type="button"
                onClick={() => removeSection(index)}
                className="text-xs font-medium text-[#7A2E2E] hover:underline"
              >
                Remove
              </button>
            </div>

            <label className="block text-[11px] font-medium text-[#3D2817] mb-1.5 tracking-[0.02em]">
              Tab title
            </label>
            <input
              type="text"
              value={section.title}
              onChange={(event) =>
                updateSection(index, "title", event.target.value)
              }
              placeholder="About me"
              className="w-full rounded-lg border border-[#1F1109]/[0.12] bg-white px-3 py-2 text-sm text-[#1F1109] outline-none focus:border-[#B8893D]"
            />

            <label className="block text-[11px] font-medium text-[#3D2817] mt-3 mb-1.5 tracking-[0.02em]">
              Content
            </label>
            <textarea
              value={section.content}
              onChange={(event) =>
                updateSection(index, "content", event.target.value)
              }
              placeholder="Write what should appear inside this tab..."
              rows={5}
              className="w-full rounded-lg border border-[#1F1109]/[0.12] bg-white px-3 py-2 text-sm text-[#1F1109] outline-none focus:border-[#B8893D] resize-y"
            />
          </div>
        ))}
      </div>
    </section>
  );
};
