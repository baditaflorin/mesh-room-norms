import { useMemo, useState } from "react";
import {
  MeshButton,
  MeshLaunch,
  MeshNameInput,
  MeshPresence,
  MeshStatusPill,
  MeshSurface,
  useNamedPeer,
  useRoster,
  useSharedCollection,
  type MeshConfig,
  type YRoom,
} from "@baditaflorin/mesh-common";

type Props = { room: YRoom | null; config: MeshConfig };
type Norm = { id: string; text: string; author: string; createdAt: number };

const STARTERS = [
  "Step up, step back.",
  "Make room for pauses.",
  "Assume good intent, ask for clarity.",
] as const;

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

function createNorm(text: string, author: string): Norm {
  return { id: crypto.randomUUID(), text, author, createdAt: Date.now() };
}

export function Feature({ room, config }: Props) {
  const { name, setName, myName } = useNamedPeer(config, room);
  const roster = useRoster(room);
  const norms = useSharedCollection<Norm>(room, "mesh-room-norms:norms", { validate: isValidNorm });
  const [text, setText] = useState("");
  const [notice, setNotice] = useState("");

  const participantCount = Math.max(1, roster.present.length);
  const sortedNorms = useMemo(
    () => [...norms.items].sort((a, b) => a.createdAt - b.createdAt || a.id.localeCompare(b.id)),
    [norms.items],
  );

  const add = (nextText = text) => {
    const value = nextText.trim();
    if (value.length < 3) {
      setNotice("Use at least three words so the agreement is clear.");
      return;
    }
    if (sortedNorms.some((norm) => norm.text.toLocaleLowerCase() === value.toLocaleLowerCase())) {
      setNotice("That agreement is already in the room.");
      return;
    }
    if (!norms.add(createNorm(value, myName))) {
      setNotice("Couldn't share that norm. Try again.");
      return;
    }
    setText("");
    setNotice("Shared with everyone in this room.");
  };

  const focusComposer = () => {
    document
      .getElementById("norm-composer")
      ?.scrollIntoView({ behavior: "smooth", block: "center" });
    document.getElementById("norm-text")?.focus();
  };

  const previewNorms = sortedNorms.slice(0, 3);

  return (
    <main className="norms-page">
      <MeshLaunch
        className="norms-launch"
        eyebrow="A shared agreement board"
        heading="Make the room feel right."
        promise="Turn good intentions into a small set of visible agreements everyone can return to—without a host or account."
        presence={
          <MeshPresence
            count={participantCount}
            state={room ? "connected" : "connecting"}
            label={participantCount === 1 ? "person in this room" : "people in this room"}
            announce="polite"
          />
        }
        preview={
          <section className="agreement-preview" aria-labelledby="agreements-preview-title">
            <div className="agreement-preview-meta">
              <MeshStatusPill tone={sortedNorms.length ? "live" : "neutral"} dot>
                {sortedNorms.length ? "Shared agreements" : "Room is open"}
              </MeshStatusPill>
              <span>{sortedNorms.length} saved</span>
            </div>
            <h2 id="agreements-preview-title">
              {sortedNorms.length
                ? "What this room has agreed to"
                : "Start with one useful agreement"}
            </h2>
            {previewNorms.length ? (
              <ul>
                {previewNorms.map((norm) => (
                  <li key={norm.id}>{norm.text}</li>
                ))}
              </ul>
            ) : (
              <p>Begin with a clear, kind norm that gives everybody more room to participate.</p>
            )}
          </section>
        }
        primaryAction={{
          label: sortedNorms.length ? "Add an agreement" : "Start with a baseline",
          onClick: sortedNorms.length ? focusComposer : () => add(STARTERS[0]!),
          disabled: !room,
        }}
        secondaryAction={{ label: "Write your own", onClick: focusComposer }}
        loading={!room}
        connectionHint={
          room
            ? undefined
            : "Joining the room now. The agreement board stays visible while it connects."
        }
      />

      <div className="norms-workbench">
        <MeshSurface
          as="section"
          className="norm-composer"
          tone="raised"
          padding="lg"
          id="norm-composer"
          aria-labelledby="add-title"
        >
          <div className="section-heading">
            <p className="eyebrow">Add an agreement</p>
            <h2 id="add-title">Name the behavior that helps</h2>
            <p>Short, specific, and kind works better than a vague promise.</p>
          </div>
          <label htmlFor="norm-text">
            What would help this group?
            <textarea
              id="norm-text"
              value={text}
              maxLength={160}
              onChange={(event) => setText(event.target.value)}
              placeholder="e.g. Step up, step back"
            />
          </label>
          <MeshButton
            size="lg"
            fullWidth
            onClick={() => add()}
            disabled={!room || text.trim().length < 3}
          >
            Share norm
          </MeshButton>
          <p className="notice" role="status" aria-live="polite">
            {notice}
          </p>
        </MeshSurface>

        <div className="norms-sidebar">
          <MeshSurface
            as="section"
            className="identity-card"
            tone="quiet"
            padding="md"
            aria-labelledby="identity-title"
          >
            <p className="eyebrow">You are contributing as</p>
            <h2 id="identity-title">{name || "Unnamed participant"}</h2>
            <p>
              Your name stays in this browser and helps people trace an agreement back to a human.
            </p>
            <MeshNameInput
              value={name}
              onChange={setName}
              ariaLabel="Your name"
              placeholder="e.g. Sam"
              maxLength={48}
            />
          </MeshSurface>

          <MeshSurface
            as="section"
            className="starter-card"
            tone="quiet"
            padding="md"
            aria-labelledby="starter-title"
          >
            <p className="eyebrow">Useful starting points</p>
            <h2 id="starter-title">Set a tone, then make it yours</h2>
            <div className="starter-list">
              {STARTERS.slice(1).map((starter) => (
                <button type="button" key={starter} disabled={!room} onClick={() => add(starter)}>
                  {starter}
                </button>
              ))}
            </div>
          </MeshSurface>
        </div>
      </div>

      <MeshSurface
        as="section"
        className="norm-list"
        tone="base"
        padding="lg"
        aria-labelledby="list-title"
      >
        <div className="list-heading">
          <div>
            <p className="eyebrow">The room's commitments</p>
            <h2 id="list-title">Keep the agreements visible</h2>
          </div>
          <MeshStatusPill tone="neutral">{sortedNorms.length} total</MeshStatusPill>
        </div>
        {sortedNorms.length ? (
          <ol aria-live="polite">
            {sortedNorms.map((norm) => (
              <li key={norm.id}>
                <div>
                  <strong>{norm.text}</strong>
                  <small>Shared by {norm.author}</small>
                </div>
                <MeshButton
                  size="sm"
                  variant="quiet"
                  onClick={() => norms.remove(norm.id)}
                  disabled={!room}
                >
                  Remove
                </MeshButton>
              </li>
            ))}
          </ol>
        ) : (
          <p className="empty-list">
            No norms yet. Start with a baseline, then revise it together.
          </p>
        )}
      </MeshSurface>

      <p className="privacy-note">
        Browser-local peer collaboration. Anyone here can add or remove a norm; keep the board short
        and useful.
      </p>
    </main>
  );
}
