const starterCode = {
  javascript: `function solution() {\n  \n}`,
  typescript: `function solution(): void {\n  \n}`,
  python: `def solution():\n    pass`,
  java: `class Main {\n    public static void main(String[] args) {\n        \n    }\n}`,
  cpp: `#include <iostream>\nusing namespace std;\n\nint main() {\n    return 0;\n}`,
};

const editorStates = new Map();

const createDefaultState = () => ({
  language: "javascript",
  codeByLanguage: {
    ...starterCode,
  },
});

const normalizeState = (state) => {
  if (!state) {
    return createDefaultState();
  }

  return {
    language: state.language || "javascript",
    codeByLanguage: {
      ...starterCode,
      ...(state.codeByLanguage || {}),
    },
  };
};

export const getEditorState = (roomId) => {
  return normalizeState(editorStates.get(roomId));
};

export const clearEditorState = (roomId) => {
  editorStates.delete(roomId);
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

      socket.join(roomId);

      const state = getEditorState(roomId);

      socket.emit("language-update", {
        language: state.language,
        codeByLanguage: state.codeByLanguage,
      });
    });

    socket.on("code-change", ({ roomId, language, code }) => {
      if (!roomId || !language) {
        return;
      }

      const currentState = getEditorState(roomId);

      const nextState = {
        ...currentState,
        codeByLanguage: {
          ...currentState.codeByLanguage,
          [language]: code || "",
        },
      };

      editorStates.set(roomId, nextState);

      socket.to(roomId).emit("code-update", {
        language,
        code: code || "",
      });
    });

    socket.on("language-change", ({ roomId, language, codeByLanguage }) => {
      if (!roomId || !language) {
        return;
      }

      const currentState = getEditorState(roomId);

      const nextState = {
        language,
        codeByLanguage: {
          ...currentState.codeByLanguage,
          ...(codeByLanguage || {}),
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