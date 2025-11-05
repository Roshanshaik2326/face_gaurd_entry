import mongoose from 'mongoose';

const logSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  recognizedPerson: {
    type: String,
    default: null
  },
  action: {
    type: String,
    required: true,
    enum: ['recognized', 'unlocked', 'denied']
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

const Log = mongoose.model('Log', logSchema);

export default Log;
