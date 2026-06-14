import { Room } from "../models/room.model.js";

const starterCode = {
  javascript: `function solution() {\n  \n}`,
  typescript: `function solution(): void {\n  \n}`,
  python: `def solution():\n    pass`,
  java: `class Main {\n    public static void main(String[] args) {\n        \n    }\n}`,
  cpp: `#include <iostream>\nusing namespace std;\n\nint main() {\n    return 0;\n}`,
};

const editorStates = new Map();
const saveDebounced = new Map();

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

const saveRoomCodeToDB = async (roomId, state) => {
  try {
    const room = await Room.findById(roomId);
    if (!room) return;
    
    // Only perform debounced autosave when the room status is "active"
    if (room.status === "active") {
      room.codeState = state.codeByLanguage;
      room.language = state.language;
      await room.save();
      console.log(`[Autosave] Saved active code state for room ${roomId}`);
    }
  } catch (error) {
    console.error(`[Autosave] Failed to autosave code state for room ${roomId}:`, error.message);
  }
};

export const getEditorState = (roomId) => {
  return normalizeState(editorStates.get(roomId));
};

export const clearEditorState = (roomId) => {
  editorStates.delete(roomId);
  const debouncer = saveDebounced.get(roomId);
  if (debouncer) {
    clearTimeout(debouncer);
    saveDebounced.delete(roomId);
  }
};

export const registerEditorSocketHandlers = (io) => {
  io.on("connection", (socket) => {
    socket.on("editor-join", async ({ roomId }) => {
      if (!roomId) {
        socket.emit("socket-error", {
          message: "Room id is required",
        });
        return;
      }

      // Verify user is a participant of the room
      try {
        const room = await Room.findById(roomId);
        if (!room) {
          socket.emit("socket-error", {
            message: "Room not found",
          });
          return;
        }

        const userId = socket.user?._id?.toString();
        const isInterviewer = room.interviewer?.toString() === userId;
        const isInterviewee = room.interviewee?.toString() === userId;
        const isParticipant = room.participants?.some(
          (p) => p.user?.toString() === userId
        );

        if (!isInterviewer && !isInterviewee && !isParticipant) {
          socket.emit("socket-error", {
            message: "Unauthorized access to this room",
          });
          return;
        }

        // Cache the room authorization on this socket
        socket.authorizedRooms = socket.authorizedRooms || new Set();
        socket.authorizedRooms.add(roomId);
      } catch (err) {
        console.error("Editor socket auth error:", err.message);
        socket.emit("socket-error", {
          message: "Authorization check failed",
        });
        return;
      }

      socket.join(roomId);

      // Restore active editor state from MongoDB if empty in memory (e.g. after server restart)
      if (!editorStates.has(roomId)) {
        try {
          const room = await Room.findById(roomId);
          if (room) {
            let codeStateObj = {};
            if (room.codeState && typeof room.codeState.toJSON === "function") {
              codeStateObj = room.codeState.toJSON();
            } else if (room.codeState) {
              codeStateObj = Object.fromEntries(room.codeState);
            }
            
            editorStates.set(roomId, {
              language: room.language || "javascript",
              codeByLanguage: {
                ...starterCode,
                ...codeStateObj,
              },
            });
          }
        } catch (err) {
          console.error(`Failed to load codeState from DB on socket join for room ${roomId}:`, err.message);
        }
      }

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

      // Check room authorization
      if (!socket.authorizedRooms || !socket.authorizedRooms.has(roomId)) {
        socket.emit("socket-error", {
          message: "Unauthorized room operation",
        });
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

      // Trigger debounced autosave to DB (3 seconds of typing inactivity)
      const debouncer = saveDebounced.get(roomId);
      if (debouncer) {
        clearTimeout(debouncer);
      }
      saveDebounced.set(
        roomId,
        setTimeout(() => {
          saveRoomCodeToDB(roomId, nextState);
          saveDebounced.delete(roomId);
        }, 3000)
      );
    });

    socket.on("language-change", ({ roomId, language, codeByLanguage }) => {
      if (!roomId || !language) {
        return;
      }

      // Check room authorization
      if (!socket.authorizedRooms || !socket.authorizedRooms.has(roomId)) {
        socket.emit("socket-error", {
          message: "Unauthorized room operation",
        });
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

      // Trigger debounced autosave to DB (3 seconds of typing inactivity)
      const debouncer = saveDebounced.get(roomId);
      if (debouncer) {
        clearTimeout(debouncer);
      }
      saveDebounced.set(
        roomId,
        setTimeout(() => {
          saveRoomCodeToDB(roomId, nextState);
          saveDebounced.delete(roomId);
        }, 3000)
      );
    });
  });
};