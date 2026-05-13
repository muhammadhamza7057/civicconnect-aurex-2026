const { Schema, model } = require('mongoose');

const AnalyticsSnapshotSchema = new Schema({
  snapshot_date: { type: Date, required: true },
  payload: { type: Schema.Types.Mixed, required: true }
}, { timestamps: true });

module.exports = model('AnalyticsSnapshot', AnalyticsSnapshotSchema);
