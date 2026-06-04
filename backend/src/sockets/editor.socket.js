const editorStates = new Map();

export const registerEditorSocketHandlers = (io) => {
  io.on("connection", (socket) => {
    socket.on("editor-join", ({ roomId }) => {
      if (!roomId) {
        socket.emit("socket-error", {
          message: "Room id is required",
        });
        return;
      }

      const state = editorStates.get(roomId);

      if (state) {
        socket.emit("code-update", {
          code: state.code,
        });

        socket.emit("language-update", {
          language: state.language,
          code: state.code,
        });
      }
    });

    socket.on("code-change", ({ roomId, code }) => {
      if (!roomId) {
        return;
      }

      const currentState = editorStates.get(roomId) || {
        language: "javascript",
        code: "",
      };

      editorStates.set(roomId, {
        ...currentState,
        code,
      });

      socket.to(roomId).emit("code-update", {
        code,
      });
    });

    socket.on("language-change", ({ roomId, language, code }) => {
      if (!roomId) {
        return;
      }

      editorStates.set(roomId, {
        language,
        code,
      });

      socket.to(roomId).emit("language-update", {
        language,
        code,
      });
    });
  });
};