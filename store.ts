import { create } from "zustand";
import { persist } from "zustand/middleware";
import { createSeedNotes, isNote, type Note } from "@/lib/notes/text";

type NotesState = {
  notes: Note[];
  activeId: string | null;
  preview: boolean;
  hydrated: boolean;
  query: string;
  sidebarOpen: boolean;
  setQuery: (query: string) => void;
  setSidebarOpen: (open: boolean) => void;
  setPreview: (preview: boolean) => void;
  togglePreview: () => void;
  select: (id: string, opts?: { keepSidebar?: boolean }) => void;
  createNote: () => string;
  deleteNote: (id: string) => void;
  updateBody: (id: string, body: string) => void;
};

function newId(): string {
  return globalThis.crypto?.randomUUID?.() ?? `note-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export const useNotes = create<NotesState>()(
  persist(
    (set) => ({
      notes: [],
      activeId: null,
      preview: false,
      hydrated: false,
      query: "",
      sidebarOpen: false,
      setQuery: (query) => set({ query }),
      setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
      setPreview: (preview) => set({ preview }),
      togglePreview: () => set((state) => ({ preview: !state.preview })),
      select: (id, opts) =>
        set((state) => ({
          activeId: id,
          sidebarOpen: opts?.keepSidebar ? state.sidebarOpen : false,
        })),
      createNote: () => {
        const now = Date.now();
        const note: Note = { id: newId(), body: "", createdAt: now, updatedAt: now };
        set((state) => ({
          notes: [note, ...state.notes],
          activeId: note.id,
          query: "",
          preview: false,
          sidebarOpen: false,
        }));
        return note.id;
      },
      deleteNote: (id) =>
        set((state) => {
          const notes = state.notes.filter((note) => note.id !== id);
          const activeId =
            state.activeId === id ? (notes[0]?.id ?? null) : state.activeId;
          return { notes, activeId };
        }),
      updateBody: (id, body) =>
        set((state) => ({
          notes: state.notes
            .map((note) =>
              note.id === id ? { ...note, body, updatedAt: Date.now() } : note,
            )
            .sort((a, b) => b.updatedAt - a.updatedAt),
        })),
    }),
    {
      name: "vellum-notes-v1",
      skipHydration: true,
      partialize: (state) => ({
        notes: state.notes,
        activeId: state.activeId,
        preview: state.preview,
      }),
    },
  ),
);

let boot: Promise<void> | null = null;

export function bootstrapNotes(): Promise<void> {
  if (!boot) {
    boot = (async () => {
      try {
        await useNotes.persist.rehydrate();
      } catch {
        // Ignore unreadable storage and start fresh.
      }
      const state = useNotes.getState();
      const notes = Array.isArray(state.notes) ? state.notes.filter(isNote) : [];
      if (notes.length === 0) {
        const seeded = createSeedNotes();
        useNotes.setState({
          notes: seeded,
          activeId: seeded[0]?.id ?? null,
          hydrated: true,
        });
        return;
      }
      const activeId = notes.some((note) => note.id === state.activeId)
        ? state.activeId
        : notes[0].id;
      useNotes.setState({
        notes: [...notes].sort((a, b) => b.updatedAt - a.updatedAt),
        activeId,
        hydrated: true,
      });
    })();
  }
  return boot;
}
