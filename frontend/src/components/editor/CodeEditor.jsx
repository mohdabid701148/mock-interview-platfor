import { useEffect, useRef, useState } from "react";
import Editor from "@monaco-editor/react";
import LanguageSelector from "./LanguageSelector";
import { useSocket } from "../../hooks/useSocket";

const starterCode = {
  javascript: `function solution() {\n  \n}`,
  python: `def solution():\n    pass`,
  cpp: `#include <iostream>\nusing namespace std;\n\nint main() {\n    return 0;\n}`,
  java: `class Main {\n    public static void main(String[] args) {\n        \n    }\n}`,
};

const CodeEditor = ({ roomId, disabled = false }) => {
  const { socket } = useSocket();
  const [language, setLanguage] = useState("javascript");
  const [code, setCode] = useState(starterCode.javascript);
  const isRemoteChange = useRef(false);

  useEffect(() => {
    if (!socket || !roomId) {
      return;
    }

    socket.emit("editor-join", { roomId });

    socket.on("code-update", ({ code: incomingCode }) => {
      isRemoteChange.current = true;
      setCode(incomingCode);
    });

    socket.on("language-update", ({ language: incomingLanguage, code: incomingCode }) => {
      isRemoteChange.current = true;
      setLanguage(incomingLanguage);
      setCode(incomingCode);
    });

    return () => {
      socket.off("code-update");
      socket.off("language-update");
    };
  }, [socket, roomId]);

  const handleCodeChange = (value) => {
    const newCode = value || "";

    setCode(newCode);

    if (isRemoteChange.current) {
      isRemoteChange.current = false;
      return;
    }

    if (socket && roomId) {
      socket.emit("code-change", {
        roomId,
        code: newCode,
      });
    }
  };

  const handleLanguageChange = (newLanguage) => {
    const newCode = starterCode[newLanguage] || "";

    setLanguage(newLanguage);
    setCode(newCode);

    if (socket && roomId) {
      socket.emit("language-change", {
        roomId,
        language: newLanguage,
        code: newCode,
      });
    }
  };

  return (
    <section className="mt-6 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-[#2a2a2a] dark:bg-[#171717]">
      <div className="flex flex-col gap-4 border-b border-slate-200 px-5 py-4 dark:border-[#2a2a2a] md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
            Collaborative Code Editor
          </h2>

          <p className="mt-1 text-sm text-slate-500 dark:text-gray-400">
            Code changes sync live with everyone in this room.
          </p>
        </div>

        <LanguageSelector language={language} onChange={handleLanguageChange} />
      </div>

      <div className="h-[520px]">
        <Editor
          height="100%"
          language={language}
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
          }}
        />
      </div>
    </section>
  );
};

export default CodeEditor;