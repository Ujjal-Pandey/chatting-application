import { useEffect, useRef, useState } from "react";
import io from "socket.io-client";
import { apiRequest } from "../services/api";
import { useAuth } from "../context/AuthContext";

const API_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
const imageFor = (user) =>
  user?.profileImage ||
  `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || "User")}&background=4f6ef7&color=fff&bold=true&size=80`;

export default function ChatApp() {
  const { user, token, logout, updateUser } = useAuth();
  const [users, setUsers] = useState([]),
    [selected, setSelected] = useState(null),
    [messages, setMessages] = useState([]),
    [text, setText] = useState(""),
    [search, setSearch] = useState("");
  const [online, setOnline] = useState(new Set()),
    [unread, setUnread] = useState({}),
    [loading, setLoading] = useState(false),
    [dark, setDark] = useState(
      () => localStorage.getItem("chatty-theme") === "dark",
    ),
    [editOpen, setEditOpen] = useState(false);
  const socketRef = useRef(),
    selectedRef = useRef(),
    endRef = useRef();
  useEffect(() => {
    selectedRef.current = selected;
  }, [selected]);
  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem("chatty-theme", dark ? "dark" : "light");
  }, [dark]);
  useEffect(() => {
    (async () => {
      const result = await apiRequest("/api/auth/users", null, token, "GET");
      if (Array.isArray(result))
        setUsers(result.filter((item) => item._id !== user._id));
    })();
  }, [token, user._id]);
  useEffect(() => {
    const socket = io(API_URL, { auth: { token } });
    socketRef.current = socket;
    socket.on("connect", () => socket.emit("join"));
    socket.on("onlineUsers", (ids) => setOnline(new Set(ids)));
    socket.on("userOnline", (id) => setOnline((old) => new Set([...old, id])));
    socket.on("userOffline", (id) =>
      setOnline((old) => {
        const next = new Set(old);
        next.delete(id);
        return next;
      }),
    );
    socket.on("receiveMessage", (item) => {
      if (selectedRef.current?._id === item.senderId)
        setMessages((old) => [...old, item]);
      else
        setUnread((old) => ({
          ...old,
          [item.senderId]: (old[item.senderId] || 0) + 1,
        }));
    });
    return () => socket.disconnect();
  }, [token]);
  useEffect(() => {
    if (!selected) return;
    (async () => {
      setLoading(true);
      const result = await apiRequest(
        `/api/messages/${selected._id}`,
        null,
        token,
        "GET",
      );
      setMessages(Array.isArray(result) ? result : []);
      setLoading(false);
    })();
  }, [selected, token]);
  useEffect(
    () => endRef.current?.scrollIntoView({ behavior: "smooth" }),
    [messages],
  );
  const choose = (contact) => {
    setSelected(contact);
    setUnread((old) => ({ ...old, [contact._id]: 0 }));
  };
  const send = async (event) => {
    event?.preventDefault();
    const message = text.trim();
    if (!message || !selected) return;
    const result = await apiRequest(
      "/api/messages/send",
      { receiverId: selected._id, message },
      token,
      "POST",
    );
    if (!result.error) {
      setMessages((old) => [...old, result]);
      setText("");
      socketRef.current?.emit("sendMessage", result);
    }
  };
  const contacts = users.filter((contact) =>
    contact.name.toLowerCase().includes(search.toLowerCase()),
  );
  return (
    <main className="min-h-screen bg-slate-100 text-slate-800 dark:bg-slate-950 dark:text-slate-100 md:flex md:items-center md:justify-center md:p-5">
      <section className="grid h-screen w-full overflow-hidden bg-white shadow-2xl dark:bg-slate-900 md:h-[min(800px,calc(100vh-40px))] md:max-w-6xl md:grid-cols-[340px_1fr] md:rounded-[28px]">
        <aside
          className={`${selected ? "hidden md:flex" : "flex"} min-h-0 flex-col border-r border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900`}
        >
          <header className="flex items-center gap-3 border-b border-slate-200 px-5 py-5 dark:border-slate-800">
            <img
              className="h-11 w-11 rounded-full ring-2 ring-indigo-300"
              src={imageFor(user)}
              alt="Profile"
            />
            <div className="min-w-0 flex-1">
              <h1 className="truncate text-sm font-semibold">{user.name}</h1>
              <p className="text-[11px] text-emerald-500">● Online</p>
            </div>
            <button
              onClick={() => setDark(!dark)}
              className="rounded-lg p-2 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800"
              aria-label="Toggle theme"
            >
              {dark ? "☀" : "☾"}
            </button>
            <button
              onClick={() => setEditOpen(true)}
              className="rounded-lg p-2 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800"
              aria-label="Edit profile"
            >
              ⚙
            </button>
          </header>
          <div className="border-b border-slate-200 p-4 dark:border-slate-800">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search chats..."
              className="w-full rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-800"
            />
          </div>
          <div className="border-b border-slate-200 px-4 py-3 text-[10px] font-medium uppercase tracking-wider text-slate-400 dark:border-slate-800">
            ● Online · {online.size}
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto p-2">
            <p className="px-3 py-2 text-[10px] font-medium uppercase tracking-wider text-slate-400">
              Messages
            </p>
            {contacts.map((contact) => (
              <button
                key={contact._id}
                onClick={() => choose(contact)}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left ${selected?._id === contact._id ? "bg-indigo-100 dark:bg-indigo-950" : "hover:bg-slate-200 dark:hover:bg-slate-800"}`}
              >
                <div className="relative">
                  <img
                    className="h-10 w-10 rounded-full"
                    src={imageFor(contact)}
                    alt=""
                  />
                  {online.has(contact._id) && (
                    <i className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-emerald-500 dark:border-slate-900" />
                  )}
                </div>
                <span className="min-w-0 flex-1">
                  <b className="block truncate text-sm">{contact.name}</b>
                </span>
                {unread[contact._id] > 0 && (
                  <span className="grid h-5 min-w-5 place-items-center rounded-full bg-indigo-500 text-[10px] text-white">
                    {unread[contact._id]}
                  </span>
                )}
              </button>
            ))}
          </div>
          <footer className="border-t border-slate-200 p-4 dark:border-slate-800">
            <button
              onClick={logout}
              className="w-full rounded-xl border border-slate-200 py-2 text-sm font-semibold text-slate-500 dark:border-slate-700"
            >
              Log out
            </button>
          </footer>
        </aside>
        <section
          className={`${selected ? "flex" : "hidden md:flex"} min-h-0 flex-col`}
        >
          {selected ? (
            <>
              <header className="flex items-center gap-3 border-b border-slate-200 bg-slate-50 px-5 py-4 dark:border-slate-800 dark:bg-slate-900">
                <button
                  onClick={() => setSelected(null)}
                  className="text-xl md:hidden"
                >
                  ‹
                </button>
                <img
                  className="h-10 w-10 rounded-full"
                  src={imageFor(selected)}
                  alt=""
                />
                <div>
                  <h2 className="text-sm font-semibold">{selected.name}</h2>
                  <p className="text-[11px] text-emerald-500">
                    {online.has(selected._id) ? "● Online" : "Offline"}
                  </p>
                </div>
              </header>
              <div className="min-h-0 flex-1 overflow-y-auto bg-gradient-to-b from-white to-indigo-50/40 p-5 dark:from-slate-900 dark:to-indigo-950/20">
                {loading ? (
                  <p className="text-center text-sm text-slate-400">
                    Loading conversation...
                  </p>
                ) : (
                  messages.map((item) => (
                    <Message
                      key={item._id}
                      item={item}
                      mine={item.senderId === user._id}
                    />
                  ))
                )}
                {!loading && !messages.length && (
                  <p className="mt-40 text-center text-sm text-slate-400">
                    Say hello to {selected.name}
                  </p>
                )}
                <div ref={endRef} />
              </div>
              <form
                onSubmit={send}
                className="border-t border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"
              >
                <div className="flex gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-2 dark:border-slate-700 dark:bg-slate-800">
                  <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) send(e);
                    }}
                    rows="1"
                    maxLength="500"
                    placeholder="Type a message..."
                    className="min-h-10 flex-1 resize-none bg-transparent px-3 py-2 text-sm outline-none"
                  />
                  <button
                    disabled={!text.trim()}
                    className="grid h-10 w-10 place-items-center rounded-xl bg-indigo-500 text-white disabled:bg-slate-300"
                  >
                    ➤
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div className="grid h-full place-items-center text-center">
              <div>
                <div className="mx-auto mb-4 grid h-20 w-20 place-items-center rounded-full bg-indigo-100 text-3xl text-indigo-500 dark:bg-indigo-950">
                  ✦
                </div>
                <h2 className="text-xl font-bold">Welcome to Chatty</h2>
                <p className="mt-2 text-sm text-slate-400">
                  Choose a conversation to start messaging.
                </p>
              </div>
            </div>
          )}
        </section>
      </section>
      {editOpen && (
        <ProfileModal
          user={user}
          token={token}
          onClose={() => setEditOpen(false)}
          onSaved={updateUser}
        />
      )}
    </main>
  );
}
function Message({ item, mine }) {
  return (
    <div className={`mb-4 flex ${mine ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[78%] rounded-2xl px-4 py-3 text-sm shadow-sm ${mine ? "rounded-br-sm bg-indigo-500 text-white" : "rounded-bl-sm bg-white dark:bg-slate-800"}`}
      >
        <p className="break-words">{item.message}</p>
        <time
          className={`mt-1 block text-[10px] ${mine ? "text-indigo-100" : "text-slate-400"}`}
        >
          {new Date(item.createdAt).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </time>
      </div>
    </div>
  );
}
function ProfileModal({ user, token, onClose, onSaved }) {
  const [name, setName] = useState(user.name),
    [file, setFile] = useState(null),
    [error, setError] = useState(""),
    [saving, setSaving] = useState(false);
  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    const data = new FormData();
    data.append("name", name);
    if (file) data.append("profileImage", file);
    const result = await apiRequest(
      "/api/auth/profile",
      data,
      token,
      "PUT",
    );
    setSaving(false);
    if (result.error) return setError(result.error);
    onSaved(result.user);
    onClose();
  };
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/60 p-4">
      <form
        onSubmit={save}
        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900"
      >
        <div className="mb-5 flex justify-between">
          <div>
            <h2 className="font-bold">Edit profile</h2>
            <p className="text-sm text-slate-400">
              Update your name and profile image.
            </p>
          </div>
          <button type="button" onClick={onClose}>
            ×
          </button>
        </div>
        <img
          className="mx-auto mb-4 h-20 w-20 rounded-full object-cover"
          src={file ? URL.createObjectURL(file) : imageFor(user)}
          alt="Preview"
        />
        <label className="block text-sm font-medium">
          Full name
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-800"
          />
        </label>
        <label className="mt-4 block text-sm font-medium">
          Profile image
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="mt-1.5 block w-full text-sm text-slate-500"
          />
        </label>
        {error && (
          <p className="mt-4 rounded-lg bg-rose-50 p-3 text-sm text-rose-600">
            {error}
          </p>
        )}
        <button
          disabled={saving}
          className="mt-5 w-full rounded-xl bg-indigo-500 py-3 font-semibold text-white disabled:opacity-60"
        >
          {saving ? "Saving..." : "Save changes"}
        </button>
      </form>
    </div>
  );
}
