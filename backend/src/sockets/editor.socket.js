const editorStates = new Map();

const defaultState = {
  language: "javascript",
  codeByLanguage: {
    javascript: `function solution() {\n  \n}`,
    python: `def solution():\n    pass`,
    cpp: `#include <iostream>\nusing namespace std;\n\nint main() {\n    return 0;\n}`,
    java: `class Main {\n    public static void main(String[] args) {\n        \n    }\n}`,
  },
};

export const registerEditorSocketHandlers = (io) => {
  io.on("connection", (socket) => {
    socket.on("editor-join", ({ roomId }) => {
      if (!roomId) {
        socket.emit("socket-error", {
          message: "Room id is required",
        });
        return;
      }

      const state = editorStates.get(roomId) || defaultState;

      socket.emit("language-update", {
        language: state.language,
        codeByLanguage: state.codeByLanguage,
      });
    });

    socket.on("code-change", ({ roomId, language, code }) => {
      if (!roomId || !language) {
        return;
      }

      const currentState = editorStates.get(roomId) || defaultState;

      const nextState = {
        ...currentState,
        codeByLanguage: {
          ...currentState.codeByLanguage,
          [language]: code,
        },
      };

      editorStates.set(roomId, nextState);

      socket.to(roomId).emit("code-update", {
        language,
        code,
      });
    });

    socket.on("language-change", ({ roomId, language, codeByLanguage }) => {
      if (!roomId || !language) {
        return;
      }

      const currentState = editorStates.get(roomId) || defaultState;

      const nextState = {
        ...currentState,
        language,
        codeByLanguage: {
          ...currentState.codeByLanguage,
          ...codeByLanguage,
        },
      };

      editorStates.set(roomId, nextState);

      socket.to(roomId).emit("language-update", {
        language: nextState.language,
        codeByLanguage: nextState.codeByLanguage,
      });
    });
  });
};