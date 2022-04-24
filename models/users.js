const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  name: { type: String, required: true, maxlength: 48 },
  email: { type: String, required: true },
  password: {
    type: String, required: true, maxlength: 48, minLength: 4,
  },
  salt: { type: String, required: true },
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

schema.virtual('id').get(() => this._id);
schema.set('toJSON', {
  virtuals: true,
  transform(doc, ret) {
    delete ret._id;
    delete ret.__v;
  },
});

module.exports = mongoose.model('users', schema);
