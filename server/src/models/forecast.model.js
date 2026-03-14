import mongoose from "mongoose";

const forecastSchema = new mongoose.Schema(
  {
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      default: null
    },
    cpuForecast: {
      type: Number,
      required: true
    },
    memoryForecast: {
      type: Number,
      required: true
    },
    confidence: {
      type: Number,
      required: true
    },
    method: {
      type: String,
      default: "moving-average-trend"
    }
  },
  {
    timestamps: true
  }
);

const Forecast = mongoose.model("Forecast", forecastSchema);

export default Forecast;
