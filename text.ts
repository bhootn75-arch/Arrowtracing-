import { format, formatDistanceToNowStrict, isThisYear, isToday, isYesterday } from "date-fns";

export type Note = {
  id: string;
  body: string;
  createdAt: number;
  updatedAt: number;
};

export function isNote(value: unknown): value is Note {
  if (!value || typeof value !== "object") return false;
  const note = value as Note;
  return (
    typeof note.id === "string" &&
    note.id.length > 0 &&
    typeof note.body === "string" &&
    Number.isFinite(note.createdAt) &&
    Number.isFinite(note.updatedAt)
  );
}

export function noteTitle(body: string): string {
  const line = body.split("\n").find((entry) => entry.trim().length > 0);
  if (!line) return "Untitled";
  const cleaned = line
    .replace(/^#{1,6}\s+/, "")
    .replace(/[*_`~]/g, "")
    .replace(/\[(.*?)\]\([^)]*\)/g, "$1")
    .trim();
  return cleaned || "Untitled";
}

export function noteExcerpt(body: string): string {
  const lines = body
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
  if (lines.length < 2) return "";
  const text = lines
    .slice(1)
    .map((line) =>
      line
        .replace(/^#{1,6}\s+/, "")
        .replace(/^[-*+]\s+/, "")
        .replace(/^\d+[.)]\s+/, "")
        .replace(/^\[[ xX]\]\s+/, "")
        .replace(/^>\s?/, ""),
    )
    .join(" ")
    .replace(/[*_`~]/g, "")
    .replace(/\[(.*?)\]\([^)]*\)/g, "$1")
    .replace(/\s+/g, " ")
    .trim();
  if (text.length <= 140) return text;
  return `${text.slice(0, 140).trimEnd()}…`;
}

export function noteMatches(note: Note, query: string): boolean {
  const needle = query.trim().toLowerCase();
  if (!needle) return true;
  return (
    noteTitle(note.body).toLowerCase().includes(needle) ||
    note.body.toLowerCase().includes(needle)
  );
}

export function countWords(body: string): number {
  const text = body.trim();
  if (!text) return 0;
  return text.split(/\s+/).length;
}

export function wordLabel(count: number): string {
  return count === 1 ? "1 word" : `${count} words`;
}

export function formatEdited(ts: number, now = Date.now()): string {
  if (!Number.isFinite(ts)) return "";
  const delta = now - ts;
  if (delta < 45_000) return "Just now";
  const date = new Date(ts);
  if (delta < 60 * 60 * 1000) {
    return formatDistanceToNowStrict(date, { addSuffix: true });
  }
  if (isToday(date)) return format(date, "h:mm a");
  if (isYesterday(date)) return "Yesterday";
  if (isThisYear(date)) return format(date, "MMM d");
  return format(date, "MMM d, yyyy");
}

export function formatExact(ts: number): string {
  if (!Number.isFinite(ts)) return "";
  return format(new Date(ts), "MMM d, yyyy 'at' h:mm a");
}

const WELCOME = `# Welcome to Vellum

A quiet desk for markdown notes. They stay in this browser — nothing is uploaded.

The first line is the title. Everything under it is the note. Named for [vellum](https://en.wikipedia.org/wiki/Vellum), the writing surface.

## Try the preview

Toggle **Preview** to render this note. Formatting you can type:

- **Bold** and *italic*
- \`inline code\`
- A quote, a list, a link

> Keep the desk clear. Write the thing, then stop.

Shortcuts: Ctrl+K search, Ctrl+N new note, Ctrl+Shift+P preview. On a Mac, use ⌘ instead of Ctrl.
`;

const FIELD = `# Field notes, late October

The light goes thin by four. I walked the long way home along the canal, where the plane trees are down to their last leaves.

> Keep the sentence shorter than the thought, then let the next one finish it.

Things to remember:

- The baker on Mercer still has the rye after 3
- Library hold is in: *The Living Mountain*
- Call Mara about Sunday

A small list is enough for a day.
`;

const READING = `# Reading queue

Three books, in the order I will actually read them.

1. *The Living Mountain* — Nan Shepherd
2. *Essayism* — Brian Dillon
3. A reread of *Bluets*

A line worth copying by hand:

> When a book resists, copy one paragraph before you decide you dislike it.

\`status: in progress\`
`;

export function createSeedNotes(now = Date.now()): Note[] {
  const hour = 60 * 60 * 1000;
  return [
    {
      id: crypto.randomUUID(),
      body: WELCOME,
      createdAt: now - 26 * hour,
      updatedAt: now - 20 * 60 * 1000,
    },
    {
      id: crypto.randomUUID(),
      body: FIELD,
      createdAt: now - 50 * hour,
      updatedAt: now - 30 * hour,
    },
    {
      id: crypto.randomUUID(),
      body: READING,
      createdAt: now - 80 * hour,
      updatedAt: now - 70 * hour,
    },
  ];
}

export function highlightParts(text: string, query: string): Array<{ match: boolean; text: string }> {
  const needle = query.trim().toLowerCase();
  if (!needle) return [{ match: false, text }];
  const lower = text.toLowerCase();
  const parts: Array<{ match: boolean; text: string }> = [];
  let index = 0;
  while (index < text.length) {
    const at = lower.indexOf(needle, index);
    if (at < 0) {
      parts.push({ match: false, text: text.slice(index) });
      break;
    }
    if (at > index) parts.push({ match: false, text: text.slice(index, at) });
    parts.push({ match: true, text: text.slice(at, at + needle.length) });
    index = at + needle.length;
  }
  return parts;
}
