const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  creator: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

schema.virtual('id').get(() => this._id);
schema.set('toJSON', {
  virtuals: true,
  transform(doc, ret) {
    delete ret._id;
    delete ret.__v;
  },
});

module.exports = mongoose.model('posts', schema);
