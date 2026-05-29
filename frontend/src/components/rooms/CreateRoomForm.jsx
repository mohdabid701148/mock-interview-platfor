import { useState } from "react";

const CreateRoomForm = ({ onCreate, loading = false }) => {
  const [form, setForm] = useState({
    title: "",
    language: "JavaScript",
    maxParticipants: 5,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === "maxParticipants" ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await onCreate(form);
    setForm({
      title: "",
      language: "JavaScript",
      maxParticipants: 5,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="mb-2 block text-sm font-medium text-slate-700">
          Room Title
        </label>
        <input
          type="text"
          name="title"
          value={form.title}
          onChange={handleChange}
          placeholder="Enter room title"
          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-slate-400"
          required
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-slate-700">
          Language
        </label>
        <select
          name="language"
          value={form.language}
          onChange={handleChange}
          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-slate-400"
        >
          <option>JavaScript</option>
          <option>Python</option>
          <option>Java</option>
          <option>C++</option>
          <option>TypeScript</option>
        </select>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-slate-700">
          Max Participants
        </label>
        <input
          type="number"
          name="maxParticipants"
          value={form.maxParticipants}
          onChange={handleChange}
          min="2"
          max="20"
          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-slate-400"
          required
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-xl bg-slate-900 px-4 py-3 text-sm font-medium text-white transition hover:bg-slate-800 disabled:opacity-60"
      >
        {loading ? "Creating..." : "Create Room"}
      </button>
    </form>
  );
};

export default CreateRoomForm;