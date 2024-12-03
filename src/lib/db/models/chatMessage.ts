import mongoose, { Schema, Document } from 'mongoose';

export interface IChatMessage extends Document {
  gameId: string;
  userId: string;
  userName: string;
  message: string;
  timestamp: Date;
}

const ChatMessageSchema = new Schema({
  gameId: { 
    type: String, 
    required: true,
    index: true 
  },
  userId: { 
    type: String, 
    required: true 
  },
  userName: { 
    type: String, 
    required: true 
  },
  message: { 
    type: String, 
    required: true,
    maxlength: 500 
  },
  timestamp: { 
    type: Date, 
    default: Date.now 
  }
}, {
  timestamps: true
});

// Index for efficient queries by gameId and timestamp
ChatMessageSchema.index({ gameId: 1, timestamp: -1 });

export default mongoose.models.ChatMessage || mongoose.model<IChatMessage>('ChatMessage', ChatMessageSchema);
