import { useEffect, useRef, useState } from "react";
import Editor from "@monaco-editor/react";
import LanguageSelector from "./LanguageSelector";
import { useSocket } from "../../hooks/useSocket";
import { useDebounce } from "../../hooks/useDebounce";

const starterCode = {
  javascript: `function solution() {\n  \n}`,
  python: `def solution():\n    pass`,
  cpp: `#include <iostream>\nusing namespace std;\n\nint main() {\n    return 0;\n}`,
  java: `class Main {\n    public static void main(String[] args) {\n        \n    }\n}`,
};

const CodeEditor = ({ roomId, disabled = false }) => {
  const { socket } = useSocket();

  const [language, setLanguage] = useState("javascript");
  const [codeByLanguage, setCodeByLanguage] = useState(starterCode);
  const [code, setCode] = useState(starterCode.javascript);

  const debouncedCode = useDebounce(code, 300);

  const isRemoteChange = useRef(false);
  const isInitialMount = useRef(true);

  useEffect(() => {
    if (!socket || !roomId) {
      return;
    }

    socket.emit("editor-join", { roomId });

    const handleCodeUpdate = ({ language: incomingLanguage, code: incomingCode }) => {
      isRemoteChange.current = true;

      setCodeByLanguage((prev) => ({
        ...prev,
        [incomingLanguage || language]: incomingCode,
      }));

      if (!incomingLanguage || incomingLanguage === language) {
        setCode(incomingCode);
      }
    };

    const handleLanguageUpdate = ({
      language: incomingLanguage,
      codeByLanguage: incomingCodeByLanguage,
    }) => {
      isRemoteChange.current = true;

      const nextCodeByLanguage = incomingCodeByLanguage || starterCode;
      const nextCode =
        nextCodeByLanguage[incomingLanguage] ||
        starterCode[incomingLanguage] ||
        "";

      setLanguage(incomingLanguage);
      setCodeByLanguage(nextCodeByLanguage);
      setCode(nextCode);
    };

    socket.on("code-update", handleCodeUpdate);
    socket.on("language-update", handleLanguageUpdate);

    return () => {
      socket.off("code-update", handleCodeUpdate);
      socket.off("language-update", handleLanguageUpdate);
    };
  }, [socket, roomId, language]);

  useEffect(() => {
    if (!socket || !roomId) {
      return;
    }

    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    if (isRemoteChange.current) {
      isRemoteChange.current = false;
      return;
    }

    socket.emit("code-change", {
      roomId,
      language,
      code: debouncedCode,
    });
  }, [debouncedCode, socket, roomId, language]);

  const handleCodeChange = (value) => {
    const newCode = value || "";

    setCode(newCode);

    setCodeByLanguage((prev) => ({
      ...prev,
      [language]: newCode,
    }));
  };

  const handleLanguageChange = (newLanguage) => {
    const nextCode =
      codeByLanguage[newLanguage] ||
      starterCode[newLanguage] ||
      "";

    const nextCodeByLanguage = {
      ...codeByLanguage,
      [language]: code,
    };

    setLanguage(newLanguage);
    setCodeByLanguage(nextCodeByLanguage);
    setCode(nextCode);

    if (socket && roomId) {
      socket.emit("language-change", {
        roomId,
        language: newLanguage,
        codeByLanguage: nextCodeByLanguage,
      });
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