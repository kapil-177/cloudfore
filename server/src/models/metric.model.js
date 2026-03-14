import mongoose from "mongoose";

const metricSchema = new mongoose.Schema(
  {
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      default: null
    },
    cpuUsage: {
      type: Number,
      required: true
    },
    memoryUsage: {
      type: Number,
      required: true
    },
    loadAverage: {
      load1: { type: Number, default: 0 },
      load5: { type: Number, default: 0 },
      load15: { type: Number, default: 0 }
    },
    source: {
      type: String,
      default: "system"
    }
  },
  {
    timestamps: true
  }
);

const Metric = mongoose.model("Metric", metricSchema);

export default Metric;
