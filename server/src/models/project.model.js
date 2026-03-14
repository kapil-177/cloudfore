import mongoose from "mongoose";

const resourceSnapshotSchema = new mongoose.Schema(
  {
    cpuUsage: { type: Number, default: 0 },
    memoryUsage: { type: Number, default: 0 },
    storageUsage: { type: Number, default: 0 }
  },
  { _id: false }
);

const projectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      default: "",
      trim: true
    },
    status: {
      type: String,
      enum: ["Running", "Stopped", "Paused"],
      default: "Running"
    },
    type: {
      type: String,
      default: "API"
    },
    environment: {
      type: String,
      default: "Production"
    },
    region: {
      type: String,
      default: "Asia South"
    },
    autoStart: {
      type: Boolean,
      default: true
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    currentUsage: {
      type: resourceSnapshotSchema,
      default: () => ({})
    },
    forecastSummary: {
      cpuForecast: { type: Number, default: 0 },
      memoryForecast: { type: Number, default: 0 },
      confidence: { type: Number, default: 0 },
      riskLevel: { type: String, default: "Low" }
    }
  },
  {
    timestamps: true
  }
);

const Project = mongoose.model("Project", projectSchema);

export default Project;
