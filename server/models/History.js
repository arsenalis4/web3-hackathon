const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const HistorySchema = new Schema({
  email: { type: String, required: true, unique: true },
  history: { type: Schema.Types.Mixed, default: () => [] },
});

const History = mongoose.model('History', HistorySchema);

module.exports = { History };