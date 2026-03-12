import { describe, test, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useAuth } from "@/hooks/use-auth";

const mockPush = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

vi.mock("@/actions", () => ({
  signIn: vi.fn(),
  signUp: vi.fn(),
}));

vi.mock("@/lib/anon-work-tracker", () => ({
  getAnonWorkData: vi.fn(),
  clearAnonWork: vi.fn(),
}));

vi.mock("@/actions/get-projects", () => ({
  getProjects: vi.fn(),
}));

vi.mock("@/actions/create-project", () => ({
  createProject: vi.fn(),
}));

import { signIn as signInAction, signUp as signUpAction } from "@/actions";
import { getAnonWorkData, clearAnonWork } from "@/lib/anon-work-tracker";
import { getProjects } from "@/actions/get-projects";
import { createProject } from "@/actions/create-project";

describe("useAuth", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("initial state", () => {
    test("isLoading starts as false", () => {
      const { result } = renderHook(() => useAuth());
      expect(result.current.isLoading).toBe(false);
    });

    test("exposes signIn, signUp, and isLoading", () => {
      const { result } = renderHook(() => useAuth());
      expect(typeof result.current.signIn).toBe("function");
      expect(typeof result.current.signUp).toBe("function");
      expect(typeof result.current.isLoading).toBe("boolean");
    });
  });

  describe("signIn", () => {
    test("returns success result on valid credentials", async () => {
      vi.mocked(signInAction).mockResolvedValue({ success: true });
      vi.mocked(getAnonWorkData).mockReturnValue(null);
      vi.mocked(getProjects).mockResolvedValue([{ id: "proj-1", name: "My Project", createdAt: new Date(), updatedAt: new Date() }]);

      const { result } = renderHook(() => useAuth());

      let returnValue: any;
      await act(async () => {
        returnValue = await result.current.signIn("user@example.com", "password123");
      });

      expect(signInAction).toHaveBeenCalledWith("user@example.com", "password123");
      expect(returnValue).toEqual({ success: true });
    });

    test("returns error result on invalid credentials", async () => {
      vi.mocked(signInAction).mockResolvedValue({ success: false, error: "Invalid credentials" });

      const { result } = renderHook(() => useAuth());

      let returnValue: any;
      await act(async () => {
        returnValue = await result.current.signIn("user@example.com", "wrongpassword");
      });

      expect(returnValue).toEqual({ success: false, error: "Invalid credentials" });
    });

    test("sets isLoading to true while signing in, false after", async () => {
      let resolveSignIn!: (v: any) => void;
      vi.mocked(signInAction).mockReturnValue(new Promise((r) => { resolveSignIn = r; }));
      vi.mocked(getAnonWorkData).mockReturnValue(null);
      vi.mocked(getProjects).mockResolvedValue([]);
      vi.mocked(createProject).mockResolvedValue({ id: "new-proj", name: "New", createdAt: new Date(), updatedAt: new Date(), userId: "u1", messages: "[]", data: "{}" });

      const { result } = renderHook(() => useAuth());

      expect(result.current.isLoading).toBe(false);

      act(() => {
        result.current.signIn("user@example.com", "password123");
      });

      expect(result.current.isLoading).toBe(true);

      await act(async () => {
        resolveSignIn({ success: true });
      });

      expect(result.current.isLoading).toBe(false);
    });

    test("resets isLoading to false even when signIn throws", async () => {
      vi.mocked(signInAction).mockRejectedValue(new Error("Network error"));

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        try {
          await result.current.signIn("user@example.com", "password123");
        } catch {
          // expected
        }
      });

      expect(result.current.isLoading).toBe(false);
    });

    test("does not redirect on failed sign in", async () => {
      vi.mocked(signInAction).mockResolvedValue({ success: false, error: "Invalid credentials" });

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await result.current.signIn("user@example.com", "wrongpassword");
      });

      expect(mockPush).not.toHaveBeenCalled();
    });
  });

  describe("signUp", () => {
    test("returns success result on valid registration", async () => {
      vi.mocked(signUpAction).mockResolvedValue({ success: true });
      vi.mocked(getAnonWorkData).mockReturnValue(null);
      vi.mocked(getProjects).mockResolvedValue([{ id: "proj-1", name: "My Project", createdAt: new Date(), updatedAt: new Date() }]);

      const { result } = renderHook(() => useAuth());

      let returnValue: any;
      await act(async () => {
        returnValue = await result.current.signUp("new@example.com", "securepassword");
      });

      expect(signUpAction).toHaveBeenCalledWith("new@example.com", "securepassword");
      expect(returnValue).toEqual({ success: true });
    });

    test("returns error result when email already registered", async () => {
      vi.mocked(signUpAction).mockResolvedValue({ success: false, error: "Email already registered" });

      const { result } = renderHook(() => useAuth());

      let returnValue: any;
      await act(async () => {
        returnValue = await result.current.signUp("existing@example.com", "password123");
      });

      expect(returnValue).toEqual({ success: false, error: "Email already registered" });
    });

    test("sets isLoading to true while signing up, false after", async () => {
      let resolveSignUp!: (v: any) => void;
      vi.mocked(signUpAction).mockReturnValue(new Promise((r) => { resolveSignUp = r; }));
      vi.mocked(getAnonWorkData).mockReturnValue(null);
      vi.mocked(getProjects).mockResolvedValue([]);
      vi.mocked(createProject).mockResolvedValue({ id: "new-proj", name: "New", createdAt: new Date(), updatedAt: new Date(), userId: "u1", messages: "[]", data: "{}" });

      const { result } = renderHook(() => useAuth());

      act(() => {
        result.current.signUp("new@example.com", "password123");
      });

      expect(result.current.isLoading).toBe(true);

      await act(async () => {
        resolveSignUp({ success: true });
      });

      expect(result.current.isLoading).toBe(false);
    });

    test("resets isLoading to false even when signUp throws", async () => {
      vi.mocked(signUpAction).mockRejectedValue(new Error("Network error"));

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        try {
          await result.current.signUp("new@example.com", "password123");
        } catch {
          // expected
        }
      });

      expect(result.current.isLoading).toBe(false);
    });

    test("does not redirect on failed sign up", async () => {
      vi.mocked(signUpAction).mockResolvedValue({ success: false, error: "Email already registered" });

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await result.current.signUp("existing@example.com", "password123");
      });

      expect(mockPush).not.toHaveBeenCalled();
    });
  });

  describe("post sign-in redirect logic", () => {
    test("migrates anon work and redirects to new project when anon messages exist", async () => {
      const anonMessages = [{ role: "user", content: "Build me a button" }];
      const anonFileSystem = { "/App.jsx": { type: "file", content: "..." } };

      vi.mocked(signInAction).mockResolvedValue({ success: true });
      vi.mocked(getAnonWorkData).mockReturnValue({ messages: anonMessages, fileSystemData: anonFileSystem });
      vi.mocked(createProject).mockResolvedValue({ id: "migrated-proj", name: "Design", createdAt: new Date(), updatedAt: new Date(), userId: "u1", messages: "[]", data: "{}" });

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await result.current.signIn("user@example.com", "password123");
      });

      expect(createProject).toHaveBeenCalledWith(
        expect.objectContaining({
          messages: anonMessages,
          data: anonFileSystem,
        })
      );
      expect(clearAnonWork).toHaveBeenCalled();
      expect(mockPush).toHaveBeenCalledWith("/migrated-proj");
      expect(getProjects).not.toHaveBeenCalled();
    });

    test("uses a timestamped name when creating project from anon work", async () => {
      vi.mocked(signInAction).mockResolvedValue({ success: true });
      vi.mocked(getAnonWorkData).mockReturnValue({
        messages: [{ role: "user", content: "hello" }],
        fileSystemData: {},
      });
      vi.mocked(createProject).mockResolvedValue({ id: "p1", name: "Design", createdAt: new Date(), updatedAt: new Date(), userId: "u1", messages: "[]", data: "{}" });

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await result.current.signIn("user@example.com", "password123");
      });

      const createCall = vi.mocked(createProject).mock.calls[0][0];
      expect(createCall.name).toMatch(/^Design from /);
    });

    test("skips anon work migration when anon data has no messages", async () => {
      vi.mocked(signInAction).mockResolvedValue({ success: true });
      vi.mocked(getAnonWorkData).mockReturnValue({ messages: [], fileSystemData: {} });
      vi.mocked(getProjects).mockResolvedValue([{ id: "existing-proj", name: "Existing", createdAt: new Date(), updatedAt: new Date() }]);

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await result.current.signIn("user@example.com", "password123");
      });

      expect(createProject).not.toHaveBeenCalled();
      expect(clearAnonWork).not.toHaveBeenCalled();
      expect(mockPush).toHaveBeenCalledWith("/existing-proj");
    });

    test("redirects to most recent project when no anon work and projects exist", async () => {
      vi.mocked(signInAction).mockResolvedValue({ success: true });
      vi.mocked(getAnonWorkData).mockReturnValue(null);
      vi.mocked(getProjects).mockResolvedValue([
        { id: "recent-proj", name: "Recent", createdAt: new Date(), updatedAt: new Date() },
        { id: "older-proj", name: "Older", createdAt: new Date(), updatedAt: new Date() },
      ]);

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await result.current.signIn("user@example.com", "password123");
      });

      expect(mockPush).toHaveBeenCalledWith("/recent-proj");
      expect(createProject).not.toHaveBeenCalled();
    });

    test("creates a new project and redirects when no anon work and no existing projects", async () => {
      vi.mocked(signInAction).mockResolvedValue({ success: true });
      vi.mocked(getAnonWorkData).mockReturnValue(null);
      vi.mocked(getProjects).mockResolvedValue([]);
      vi.mocked(createProject).mockResolvedValue({ id: "brand-new", name: "New Design", createdAt: new Date(), updatedAt: new Date(), userId: "u1", messages: "[]", data: "{}" });

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await result.current.signIn("user@example.com", "password123");
      });

      expect(createProject).toHaveBeenCalledWith(
        expect.objectContaining({ messages: [], data: {} })
      );
      expect(mockPush).toHaveBeenCalledWith("/brand-new");
    });

    test("new project name includes a random number when no existing projects", async () => {
      vi.mocked(signInAction).mockResolvedValue({ success: true });
      vi.mocked(getAnonWorkData).mockReturnValue(null);
      vi.mocked(getProjects).mockResolvedValue([]);
      vi.mocked(createProject).mockResolvedValue({ id: "new-1", name: "New Design #42", createdAt: new Date(), updatedAt: new Date(), userId: "u1", messages: "[]", data: "{}" });

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await result.current.signIn("user@example.com", "password123");
      });

      const createCall = vi.mocked(createProject).mock.calls[0][0];
      expect(createCall.name).toMatch(/^New Design #\d+$/);
    });

    test("signUp also triggers post sign-in redirect logic", async () => {
      vi.mocked(signUpAction).mockResolvedValue({ success: true });
      vi.mocked(getAnonWorkData).mockReturnValue(null);
      vi.mocked(getProjects).mockResolvedValue([{ id: "proj-1", name: "Project", createdAt: new Date(), updatedAt: new Date() }]);

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await result.current.signUp("new@example.com", "password123");
      });

      expect(mockPush).toHaveBeenCalledWith("/proj-1");
    });
  });
});
