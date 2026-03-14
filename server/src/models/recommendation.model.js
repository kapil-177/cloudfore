import mongoose from "mongoose";

const recommendationSchema = new mongoose.Schema(
  {
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      default: null
    },
    title: {
      type: String,
      required: true
    },
    message: {
      type: String,
      required: true
    },
    severity: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "low"
    }
  },
  {
    timestamps: true
  }
);

const Recommendation = mongoose.model("Recommendation", recommendationSchema);

export default Recommendation;
