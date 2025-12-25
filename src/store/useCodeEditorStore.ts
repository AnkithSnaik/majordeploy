// store/codeEditorStore.ts
import { create } from "zustand";
import type * as monacoEditor from "monaco-editor";
import { LANGUAGE_CONFIG } from "@/app/(root)/_constants";

export interface ExecutionResult {
  code: string;
  output: string;
  error: string | null;
}

export interface CodeEditorState {
  language: string;
  theme: string;
  fontSize: number;
  output: string;
  error: string | null;
  isRunning: boolean;
  editor: monacoEditor.editor.IStandaloneCodeEditor | null;
  executionResult: ExecutionResult | null;

  getCode: () => string;
  setEditor: (editor: monacoEditor.editor.IStandaloneCodeEditor) => void;
  setTheme: (theme: string) => void;
  setFontSize: (fontSize: number) => void;
  setLanguage: (language: string) => void;
  runCode: () => Promise<void>;
}

const getInitialState = () => {
  if (typeof window === "undefined") {
    return {
      language: "javascript",
      theme: "vs-dark",
      fontSize: 16,
    };
  }

  return {
    language: localStorage.getItem("editor-language") || "javascript",
    theme: localStorage.getItem("editor-theme") || "vs-dark",
    fontSize: Number(localStorage.getItem("editor-font-size") || "16"),
  };
};

export const useCodeEditorStore = create<CodeEditorState>((set, get) => {
  const initialState = getInitialState();

  return {
    ...initialState,
    output: "",
    error: null,
    isRunning: false,
    editor: null,
    executionResult: null,

    getCode: () => get().editor?.getValue() || "",

    setEditor: (editor) => {
      const savedCode = localStorage.getItem(`editor-code-${get().language}`);
      if (savedCode) editor.setValue(savedCode);
      set({ editor });
    },

    setTheme: (theme) => {
      localStorage.setItem("editor-theme", theme);
      set({ theme });
    },

    setFontSize: (fontSize) => {
      localStorage.setItem("editor-font-size", fontSize.toString());
      set({ fontSize });
    },

    setLanguage: (language) => {
      const currentCode = get().editor?.getValue();
      if (currentCode) localStorage.setItem(`editor-code-${get().language}`, currentCode);
      localStorage.setItem("editor-language", language);
      set({ language, output: "", error: null });
    },

    runCode: async () => {
      const code = get().getCode();
      if (!code) {
        set({ error: "Please enter some code" });
        return;
      }

      set({ isRunning: true, error: null, output: "" });

      try {
        const runtime = LANGUAGE_CONFIG[get().language].pistonRuntime;

        const res = await fetch("https://emkc.org/api/v2/piston/execute", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            language: runtime.language,
            version: runtime.version,
            files: [{ content: code }],
          }),
        });

        const data = await res.json();

        if (data.message) {
          set({
            error: data.message,
            executionResult: { code, output: "", error: data.message },
          });
          return;
        }

        if ((data.compile && data.compile.code !== 0) || (data.run && data.run.code !== 0)) {
          const error =
            data.compile?.stderr || data.compile?.output || data.run?.stderr || data.run?.output;
          set({ error, executionResult: { code, output: "", error } });
          return;
        }

        const output = data.run?.output || "";
        set({ output: output.trim(), error: null, executionResult: { code, output: output.trim(), error: null } });
      } catch (err) {
        console.error(err);
        set({
          error: "Error running code",
          executionResult: { code, output: "", error: "Error running code" },
        });
      } finally {
        set({ isRunning: false });
      }
    },
  };
});

// Helper to get execution result outside React
export const getExecutionResult = () => useCodeEditorStore.getState().executionResult;
