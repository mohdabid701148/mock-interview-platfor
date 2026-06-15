import { useEffect, useRef, useState } from "react";
import Editor from "@monaco-editor/react";
import LanguageSelector from "./LanguageSelector";
import { useSocket } from "../../hooks/useSocket";
import { Play, Terminal } from "lucide-react";
import CodeOutputPanel from "./CodeOutputPanel";
import { codeExecutionService } from "../../services/codeExecution.service";

const starterCode = {
  javascript: `function solution() {\n  \n}`,
  typescript: `function solution(): void {\n  \n}`,
  python: `def solution():\n    pass`,
  java: `class Main {\n    public static void main(String[] args) {\n        \n    }\n}`,
  cpp: `#include <iostream>\nusing namespace std;\n\nint main() {\n    return 0;\n}`,
};

const fileExtensions = {
  javascript: "js",
  typescript: "ts",
  python: "py",
  java: "java",
  cpp: "cpp",
};

const normalizeCodeByLanguage = (value = {}) => {
  return {
    ...starterCode,
    ...value,
  };
};

const CodeEditor = ({ roomId, disabled = false }) => {
  const { socket } = useSocket();

  const [language, setLanguage] = useState("javascript");
  const [codeByLanguage, setCodeByLanguage] = useState(starterCode);
  const [code, setCode] = useState(starterCode.javascript);

  const [isOutputPanelOpen, setIsOutputPanelOpen] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionResult, setExecutionResult] = useState(null);

  const languageRef = useRef("javascript");
  const codeRef = useRef(starterCode.javascript);
  const codeByLanguageRef = useRef(starterCode);
  const debounceTimerRef = useRef(null);
  const isApplyingRemoteRef = useRef(false);

  const clearDebounce = () => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }
  };

  const updateLocalState = (nextLanguage, nextCodeByLanguage) => {
    const normalizedCodeByLanguage = normalizeCodeByLanguage(nextCodeByLanguage);
    const nextCode =
      normalizedCodeByLanguage[nextLanguage] ||
      starterCode[nextLanguage] ||
      "";

    languageRef.current = nextLanguage;
    codeRef.current = nextCode;
    codeByLanguageRef.current = normalizedCodeByLanguage;

    setLanguage(nextLanguage);
    setCodeByLanguage(normalizedCodeByLanguage);
    setCode(nextCode);
  };

  useEffect(() => {
    if (!socket || !roomId) {
      return;
    }

    const handleCodeUpdate = ({ language: incomingLanguage, code: incomingCode }) => {
      if (!incomingLanguage) {
        return;
      }

      isApplyingRemoteRef.current = true;

      const nextCodeByLanguage = {
        ...codeByLanguageRef.current,
        [incomingLanguage]: incomingCode || "",
      };

      codeByLanguageRef.current = nextCodeByLanguage;
      setCodeByLanguage(nextCodeByLanguage);

      if (incomingLanguage === languageRef.current) {
        codeRef.current = incomingCode || "";
        setCode(incomingCode || "");
      }

      setTimeout(() => {
        isApplyingRemoteRef.current = false;
      }, 0);
    };

    const handleLanguageUpdate = ({
      language: incomingLanguage,
      codeByLanguage: incomingCodeByLanguage,
    }) => {
      if (!incomingLanguage) {
        return;
      }

      clearDebounce();

      isApplyingRemoteRef.current = true;

      const nextLanguage = starterCode[incomingLanguage]
        ? incomingLanguage
        : "javascript";

      const nextCodeByLanguage = normalizeCodeByLanguage(incomingCodeByLanguage);

      updateLocalState(nextLanguage, nextCodeByLanguage);

      setTimeout(() => {
        isApplyingRemoteRef.current = false;
      }, 0);
    };

    socket.emit("editor-join", { roomId });

    socket.on("code-update", handleCodeUpdate);
    socket.on("language-update", handleLanguageUpdate);

    return () => {
      clearDebounce();
      socket.off("code-update", handleCodeUpdate);
      socket.off("language-update", handleLanguageUpdate);
    };
  }, [socket, roomId]);

  const handleCodeChange = (value) => {
    if (isApplyingRemoteRef.current || disabled) {
      return;
    }

    const newCode = value || "";
    const editLanguage = languageRef.current;

    const nextCodeByLanguage = {
      ...codeByLanguageRef.current,
      [editLanguage]: newCode,
    };

    codeRef.current = newCode;
    codeByLanguageRef.current = nextCodeByLanguage;

    setCode(newCode);
    setCodeByLanguage(nextCodeByLanguage);

    clearDebounce();

    debounceTimerRef.current = setTimeout(() => {
      if (!socket || !roomId) {
        return;
      }

      socket.emit("code-change", {
        roomId,
        language: editLanguage,
        code: newCode,
      });
    }, 350);
  };

  const handleLanguageChange = (newLanguage) => {
    if (!newLanguage || newLanguage === languageRef.current || disabled) {
      return;
    }

    clearDebounce();

    const oldLanguage = languageRef.current;
    const oldCode = codeRef.current;

    const nextCodeByLanguage = {
      ...codeByLanguageRef.current,
      [oldLanguage]: oldCode,
    };

    if (!nextCodeByLanguage[newLanguage]) {
      nextCodeByLanguage[newLanguage] = starterCode[newLanguage] || "";
    }

    updateLocalState(newLanguage, nextCodeByLanguage);

    if (socket && roomId) {
      socket.emit("language-change", {
        roomId,
        language: newLanguage,
        codeByLanguage: nextCodeByLanguage,
      });
    }
  };

  const handleRunCode = async () => {
    setIsOutputPanelOpen(true);
    setIsExecuting(true);
    try {
      const result = await codeExecutionService.runCode(language, code);
      setExecutionResult(result.data);
    } catch (err) {
      setExecutionResult({
        type: "runtime_error",
        output: err.response?.data?.message || err.message || "Execution failed",
        executionTimeMs: 0
      });
    } finally {
      setIsExecuting(false);
    }
  };

  return (
    <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-[#2a2a2a] dark:bg-[#171717]">
      <div className="flex flex-col gap-4 border-b border-slate-200 px-5 py-4 dark:border-[#2a2a2a] md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
            Collaborative Code Editor
          </h2>

          <p className="mt-1 text-sm text-slate-500 dark:text-gray-400">
            Code and language changes sync live with everyone in this session.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <LanguageSelector language={language} onChange={handleLanguageChange} />
          
          <div className="flex items-center border border-slate-200 dark:border-[#2a2a2a] rounded-xl overflow-hidden shadow-sm">
            <button
              onClick={() => setIsOutputPanelOpen(!isOutputPanelOpen)}
              className="flex items-center justify-center p-2.5 text-slate-500 hover:bg-slate-100 dark:text-gray-400 dark:hover:bg-[#2a2a2a] transition bg-white dark:bg-[#1a1a1a]"
              title="Toggle Console"
            >
              <Terminal size={18} />
            </button>
            <div className="w-px h-6 bg-slate-200 dark:bg-[#2a2a2a]"></div>
            <button
              onClick={handleRunCode}
              disabled={isExecuting || disabled}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 dark:text-emerald-400 dark:bg-emerald-500/10 dark:hover:bg-emerald-500/20 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Play size={16} className={isExecuting ? "animate-pulse" : ""} />
              {isExecuting ? "Running..." : "Run"}
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-col h-[600px]">
        <div className="flex-1 relative">
          <Editor
          height="100%"
          language={language}
          path={`${roomId}-${language}.${fileExtensions[language] || "txt"}`}
          value={code}
          theme="vs-dark"
          onChange={handleCodeChange}
          options={{
            readOnly: disabled,
            minimap: { enabled: false },
            fontSize: 14,
            wordWrap: "on",
            automaticLayout: true,
            scrollBeyondLastLine: false,
            tabSize: 4,
            insertSpaces: true,
            detectIndentation: false,
          }}
        />
        </div>
        
        <CodeOutputPanel
          isOpen={isOutputPanelOpen}
          onClose={() => setIsOutputPanelOpen(false)}
          loading={isExecuting}
          result={executionResult}
        />
      </div>
    </section>
  );
};

export default CodeEditor;