const mongoose = require("mongoose");
const { Schema } = mongoose;

const MetricItemSchema = new Schema(
  {
    name: { type: String, required: true },
    value: { type: String, required: true },
    unit: { type: String, default: "" },
    referenceRange: { type: String, default: "" },
    status: {
      type: String,
      enum: ["Normal", "High", "Low", "Abnormal", "Unknown"],
      default: "Unknown",
    },
  },
  { _id: false },
);

const MedicalReportSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "AI-Assistant",
      required: true,
      index: true,
    },
    fileName: {
      type: String,
      required: true,
    },
    fileType: {
      type: String,
      default: "application/pdf",
    },
    parsedMarkdown: {
      type: String,
      default: "",
    },
    summary: {
      type: String,
      default: "",
    },
    category: {
      type: String,
      default: "General Medical Report",
    },
    metrics: [MetricItemSchema],
  },
  { timestamps: true },
);

module.exports = mongoose.model("MedicalReport", MedicalReportSchema);
