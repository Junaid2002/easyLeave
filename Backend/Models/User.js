import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  position: { type: String, default: 'N/A' },
  department: { type: String, default: 'N/A' },
  phone: { type: String, default: 'N/A' },
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);
export default User;