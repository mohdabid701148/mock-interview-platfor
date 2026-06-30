import mongoose from "mongoose";
import { ApiError } from "../utils/ApiError.js";

// Helper to check for a valid MongoDB ObjectId
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

// Validation middleware factory
export const validate = (schema) => (req, res, next) => {
  const errors = [];

  // 1. Validate Params
  if (schema.params) {
    for (const [key, rule] of Object.entries(schema.params)) {
      const val = req.params[key];
      if (rule.required && (val === undefined || val === null || val === '')) {
        errors.push(`URL param '${key}' is required`);
      } else if (val !== undefined && val !== null && val !== '') {
        if (rule.isObjectId && !isValidObjectId(val)) {
          errors.push(`URL param '${key}' must be a valid MongoDB ObjectId`);
        }
      }
    }
  }

  // 2. Validate Body
  if (schema.body) {
    for (const [key, rule] of Object.entries(schema.body)) {
      const val = req.body[key];

      // Check required
      if (rule.required && (val === undefined || val === null || val === '')) {
        errors.push(`Field '${key}' is required`);
        continue;
      }

      if (val !== undefined && val !== null && val !== '') {
        // Check Type
        if (rule.type) {
          if (rule.type === 'array' && !Array.isArray(val)) {
            errors.push(`Field '${key}' must be an array`);
          } else if (rule.type === 'object' && (typeof val !== 'object' || Array.isArray(val))) {
            errors.push(`Field '${key}' must be an object`);
          } else if (rule.type !== 'array' && rule.type !== 'object' && typeof val !== rule.type) {
            errors.push(`Field '${key}' must be a ${rule.type}`);
          }
        }

        // Check Enum
        if (rule.enum && !rule.enum.includes(val)) {
          errors.push(`Field '${key}' must be one of: ${rule.enum.join(", ")}`);
        }

        // Check string minLength
        if (rule.minLength && typeof val === 'string' && val.length < rule.minLength) {
          errors.push(`Field '${key}' must be at least ${rule.minLength} characters`);
        }

        // Check string maxLength
        if (rule.maxLength && typeof val === 'string' && val.length > rule.maxLength) {
          errors.push(`Field '${key}' must be at most ${rule.maxLength} characters`);
        }

        // Check isObjectId
        if (rule.isObjectId && !isValidObjectId(val)) {
          errors.push(`Field '${key}' must be a valid MongoDB ObjectId`);
        }

        // Check Range
        if (rule.min !== undefined && typeof val === 'number' && val < rule.min) {
          errors.push(`Field '${key}' must be at least ${rule.min}`);
        }
        if (rule.max !== undefined && typeof val === 'number' && val > rule.max) {
          errors.push(`Field '${key}' must be at most ${rule.max}`);
        }

        // Check custom validator function
        if (rule.validateFn) {
          const customErr = rule.validateFn(val, req.body);
          if (customErr) {
            errors.push(customErr);
          }
        }
      }
    }
  }

  // 3. Validate Query
  if (schema.query) {
    for (const [key, rule] of Object.entries(schema.query)) {
      const val = req.query[key];
      if (rule.required && (val === undefined || val === null || val === '')) {
        errors.push(`Query parameter '${key}' is required`);
      }
    }
  }

  if (errors.length > 0) {
    return next(new ApiError(400, "Validation failed", errors));
  }

  next();
};

// ----------------------------------------------------
// Schemas Definitions
// ----------------------------------------------------

export const registerSchema = {
  body: {
    email: {
      required: true,
      type: "string",
      maxLength: 254,
    },
    username: {
      required: true,
      type: "string",
      minLength: 3,
      maxLength: 30,
    },
    password: {
      required: true,
      type: "string",
      minLength: 6,
      maxLength: 128,
    },
  },
};

export const loginSchema = {
  body: {
    email: {
      required: true,
      type: "string",
      maxLength: 254,
    },
    password: {
      required: true,
      type: "string",
      maxLength: 128,
    },
  },
};

export const resendVerificationSchema = {
  body: {
    email: {
      required: true,
      type: "string",
      maxLength: 254,
    },
  },
};

export const verifyEmailSchema = {
  body: {
    email: {
      required: true,
      type: "string",
      maxLength: 254,
    },
    code: {
      required: true,
      type: "string",
      minLength: 6,
      maxLength: 6,
    },
  },
};

export const createRoomSchema = {
  body: {
    title: {
      required: true,
      type: "string",
      minLength: 3,
      maxLength: 100,
    },
    language: {
      type: "string",
      enum: ["javascript", "typescript", "python", "java", "cpp"],
    },
    meetingLink: {
      type: "string",
    },
  },
};

export const joinRoomSchema = {
  body: {
    roomCode: {
      required: true,
      type: "string",
      minLength: 6,
      maxLength: 6,
    },
  },
};

export const roomIdParamSchema = {
  params: {
    roomId: {
      required: true,
      isObjectId: true,
    },
  },
};

export const idParamSchema = {
  params: {
    id: {
      required: true,
      isObjectId: true,
    },
  },
};

export const createScheduleSchema = {
  body: {
    room: {
      type: "string",
      isObjectId: true,
      validateFn: (val, body) => {
        if (!val && !body.roomId) {
          return "Either 'room' or 'roomId' is required";
        }
      },
    },
    roomId: {
      type: "string",
      isObjectId: true,
    },
    scheduledAt: {
      type: "string",
      validateFn: (val, body) => {
        const timeVal = val || body.scheduledTime;
        if (!timeVal) {
          return "Either 'scheduledAt' or 'scheduledTime' is required";
        }
        const dateObj = new Date(timeVal);
        if (isNaN(dateObj.getTime())) {
          return "Scheduled time must be a valid date string";
        }
        if (dateObj.getTime() <= Date.now()) {
          return "Scheduled date and time cannot be in the past";
        }
      },
    },
    scheduledTime: {
      type: "string",
    },
    durationMinutes: {
      type: "number",
      enum: [30, 45, 60, 90, 120],
    },
    duration: {
      type: "number",
      enum: [30, 45, 60, 90, 120],
    },
    agenda: {
      type: "string",
      maxLength: 500,
    },
  },
};

export const updateScheduleStatusSchema = {
  params: {
    id: {
      required: true,
      isObjectId: true,
    },
  },
  body: {
    status: {
      required: true,
      type: "string",
      enum: ["scheduled", "completed", "cancelled", "missed"],
    },
  },
};

export const submitFeedbackSchema = {
  body: {
    roomId: {
      required: true,
      type: "string",
      isObjectId: true,
    },
    scores: {
      required: true,
      type: "object",
      validateFn: (scoresObj) => {
        const requiredScores = [
          "codingSkills",
          "problemSolving",
          "communication",
          "dsaKnowledge",
          "codeQuality",
          "debugging",
          "speed",
          "overallRating",
        ];
        for (const dim of requiredScores) {
          const score = scoresObj[dim];
          if (score === undefined || score === null) {
            return `Score dimension '${dim}' is missing`;
          }
          const numScore = Number(score);
          if (isNaN(numScore) || numScore < 1 || numScore > 5) {
            return `Score for '${dim}' must be a number between 1 and 5`;
          }
        }
      },
    },
    comments: {
      required: true,
      type: "object",
      validateFn: (commentsObj) => {
        if (!commentsObj.generalFeedback?.trim()) {
          return "General feedback comment is required and cannot be empty";
        }
        if (commentsObj.technicalComments && typeof commentsObj.technicalComments !== 'string') {
          return "Technical comments must be a string";
        }
        if (commentsObj.behavioralComments && typeof commentsObj.behavioralComments !== 'string') {
          return "Behavioral comments must be a string";
        }
      },
    },
    recommendation: {
      required: true,
      type: "string",
      enum: ["strong_hire", "hire", "leaning_no_hire", "no_hire"],
    },
  },
};
