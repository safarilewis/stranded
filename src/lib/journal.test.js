import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

function createStorage(initialEntries = []) {
  const store = new Map([["stranded_journal_entries", JSON.stringify(initialEntries)]]);
  return {
    getItem: vi.fn((key) => (store.has(key) ? store.get(key) : null)),
    setItem: vi.fn((key, value) => {
      store.set(key, value);
    }),
    removeItem: vi.fn((key) => {
      store.delete(key);
    }),
    readEntries: () => JSON.parse(store.get("stranded_journal_entries") || "[]"),
  };
}

async function loadJournalModule({ supabaseConfigured = false, supabase = null } = {}) {
  vi.resetModules();
  vi.doMock("./supabase", () => ({ supabaseConfigured, supabase }));
  return import("./journal.js");
}

describe("journal client logic", () => {
  const originalWindow = global.window;
  const originalCrypto = global.crypto;
  const originalFetch = global.fetch;

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    global.window = originalWindow;
    global.crypto = originalCrypto;
    global.fetch = originalFetch;
  });

  it("lists local entries filtered by user and sorted by latest update", async () => {
    const storage = createStorage([
      {
        id: "a",
        user_id: "user-1",
        title: "Older",
        content: "Entry A",
        mood: "grateful",
        entry_type: "reflection",
        updated_at: "2024-01-01T00:00:00.000Z",
        created_at: "2024-01-01T00:00:00.000Z",
      },
      {
        id: "b",
        user_id: "user-2",
        title: "Other user",
        content: "Entry B",
        mood: "anxious",
        entry_type: "reflection",
        updated_at: "2024-02-01T00:00:00.000Z",
        created_at: "2024-02-01T00:00:00.000Z",
      },
      {
        id: "c",
        user_id: "user-1",
        title: "Newest",
        content: "Entry C",
        mood: "heavy",
        entry_type: "reflection",
        updated_at: "2024-03-01T00:00:00.000Z",
        created_at: "2024-03-01T00:00:00.000Z",
      },
    ]);
    global.window = { localStorage: storage };

    const { listJournalEntries } = await loadJournalModule();
    const entries = await listJournalEntries("user-1");

    expect(entries).toHaveLength(2);
    expect(entries.map((entry) => entry.id)).toEqual(["c", "a"]);
    expect(entries[0].reflection_state).toBe("sad");
    expect(entries[0].source).toBe("local");
  });

  it("creates a local entry with normalized defaults when supabase is unavailable", async () => {
    const storage = createStorage();
    global.window = { localStorage: storage };
    global.crypto = { randomUUID: vi.fn(() => "uuid-1") };

    const { createJournalEntry } = await loadJournalModule();
    const created = await createJournalEntry({
      userId: "user-1",
      title: "  ",
      content: "   ",
      entryType: "dream",
    });

    expect(created.id).toBe("local-uuid-1");
    expect(created.title).toBe("Untitled entry");
    expect(created.content).toBe("");
    expect(created.mood).toBe("calm");
    expect(created.reflection_state).toBe("dreamy");
    expect(storage.setItem).toHaveBeenCalledTimes(1);
    expect(storage.readEntries()[0].id).toBe("local-uuid-1");
  });

  it("falls back to keyword mood analysis when remote analysis fails", async () => {
    const storage = createStorage();
    global.window = { localStorage: storage };
    global.crypto = { randomUUID: vi.fn(() => "uuid-2") };
    global.fetch = vi.fn(async () => {
      throw new Error("network down");
    });

    const { createJournalEntry } = await loadJournalModule();
    const created = await createJournalEntry({
      userId: "user-1",
      title: "Test",
      content: "I feel anxious and worried about tomorrow.",
      entryType: "reflection",
    });

    expect(created.mood).toBe("anxious");
    expect(created.reflection_state).toBe("still_concerned");
    expect(created.analysis_debug).toContain("network down");
  });

  it("returns supabase entries when supabase query succeeds", async () => {
    const order = vi.fn(async () => ({
      data: [
        {
          id: "supa-1",
          title: "Cloud entry",
          content: "Grateful moment",
          mood: "grateful",
          entry_type: "reflection",
          favorite: true,
          created_at: "2024-04-01T00:00:00.000Z",
          updated_at: "2024-04-01T00:00:00.000Z",
        },
      ],
      error: null,
    }));
    const eq = vi.fn(() => ({ order }));
    const select = vi.fn(() => ({ eq }));
    const from = vi.fn(() => ({ select }));
    const supabase = { from };

    const { listJournalEntries } = await loadJournalModule({ supabaseConfigured: true, supabase });
    const entries = await listJournalEntries("user-1");

    expect(from).toHaveBeenCalledWith("journal_entries");
    expect(entries).toHaveLength(1);
    expect(entries[0].source).toBe("supabase");
    expect(entries[0].reflection_state).toBe("positive_reflection");
  });

  it("deletes only the selected local entry for the user", async () => {
    const storage = createStorage([
      { id: "keep-1", user_id: "user-1", updated_at: "2024-01-01T00:00:00.000Z" },
      { id: "delete-1", user_id: "user-1", updated_at: "2024-01-02T00:00:00.000Z" },
      { id: "keep-2", user_id: "user-2", updated_at: "2024-01-03T00:00:00.000Z" },
    ]);
    global.window = { localStorage: storage };

    const { deleteJournalEntry } = await loadJournalModule();
    await deleteJournalEntry({ id: "delete-1", userId: "user-1", source: "local" });

    expect(storage.readEntries().map((entry) => entry.id)).toEqual(["keep-1", "keep-2"]);
  });
});
