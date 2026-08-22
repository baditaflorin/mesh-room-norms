import { useState } from "react";
import {
  useNamedPeer,
  useSharedCollection,
  type MeshConfig,
  type YRoom,
} from "@baditaflorin/mesh-common";
type Props = { room: YRoom | null; config: MeshConfig };
type Norm = { id: string; text: string; author: string; createdAt: number };
export function isValidNorm(value: unknown): value is Norm {
  const item = value as Partial<Norm>;
  return Boolean(
    item &&
    typeof item.id === "string" &&
    item.id.length >= 8 &&
    typeof item.text === "string" &&
    item.text.trim().length >= 3 &&
    item.text.length <= 160 &&
    typeof item.author === "string" &&
    item.author.length <= 64 &&
    Number.isFinite(item.createdAt),
  );
}
export function Feature({ room, config }: Props) {
  const { myName } = useNamedPeer(config, room);
  const norms = useSharedCollection<Norm>(room, "mesh-room-norms:norms", { validate: isValidNorm });
  const [text, setText] = useState("");
  const add = () => {
    const value = text.trim();
    if (!value) return;
    norms.add({ id: crypto.randomUUID(), text: value, author: myName, createdAt: Date.now() });
    setText("");
  };
  if (!room)
    return (
      <main className="norms">
        <h1>{config.appName}</h1>
        <p role="status">Joining room…</p>
      </main>
    );
  return (
    <main className="norms">
      <p className="eyebrow">Shared agreement board</p>
      <h1>Make the room feel right.</h1>
      <p role="status" aria-live="polite">
        {norms.items.length} {norms.items.length === 1 ? "norm" : "norms"} shared with this room.
      </p>
      <section aria-labelledby="add-title">
        <h2 id="add-title">Add a norm</h2>
        <label>
          What would help this group?{" "}
          <input
            value={text}
            maxLength={160}
            onChange={(event) => setText(event.target.value)}
            placeholder="e.g. Step up, step back"
          />
        </label>
        <button onClick={add} disabled={text.trim().length < 3}>
          Share norm
        </button>
      </section>
      <section aria-labelledby="list-title">
        <h2 id="list-title">Our agreements</h2>
        <ol aria-live="polite">
          {norms.items.length ? (
            norms.items.map((norm) => (
              <li key={norm.id}>
                <span>{norm.text}</span>
                <small>shared by {norm.author}</small>
                <button onClick={() => norms.remove(norm.id)} aria-label={`Remove ${norm.text}`}>
                  Remove
                </button>
              </li>
            ))
          ) : (
            <li>No norms yet. Add the first one together.</li>
          )}
        </ol>
      </section>
      <p className="hint">
        Anyone in this room can add or remove a norm. Keep them short, specific, and kind.
      </p>
    </main>
  );
}
