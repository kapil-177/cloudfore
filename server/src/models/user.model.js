import mongoose from "mongoose";

const settingsSchema = new mongoose.Schema(
  {
    emailNotifications: { type: Boolean, default: true },
    darkMode: { type: Boolean, default: false },
    autoForecast: { type: Boolean, default: true }
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    password: {
      type: String,
      required: true
    },
    role: {
      type: String,
      default: "Admin"
    },
    projectName: {
      type: String,
      default: "Cloud Resource Forecasting"
    },
    avatarUrl: {
      type: String,
      default:
        "https://imgs.search.brave.com/uhxR84AKTPc100FWNQT_cGv_u3Bnpbg3RA9HNmMJ6c0/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9pLnBp/bmltZy5jb20vb3Jp/Z2luYWxzLzFiLzU5/LzdkLzFiNTk3ZDZj/MWJhZjMwNmQzZTk0/NWQxMmRmZWZjYzI0/LmpwZw"
    },
    settings: {
      type: settingsSchema,
      default: () => ({})
    },
    lastLoginAt: Date
  },
  {
    timestamps: true
  }
);

const User = mongoose.model("User", userSchema);

export default User;
