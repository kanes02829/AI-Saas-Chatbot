const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const Schema = mongoose.Schema;
const { ObjectId } = Schema.Types;

const UserSchema = new Schema({
  email: {
    type: String,
    unique: true,
    lowercase: true,
    trim: true,
    required: true,
    maxLength: 100,
  },
  fname: { type: String, default: '', maxLength: 100 },
  lname: { type: String, default: '', maxLength: 100 },
  issocial: { type: Number, default: 0, integer: true },
  password: { type: String, default: '', maxLength: 100 },
  // accountType: { type: String, default: 'user' }, // user, admin, member
  accountType: { type: Number, default: 0 }, // user, admin, member
  permissions: { type: [String], default: ['user'] }, // user, admin, member
  created: { type: Date, default: Date.now },
  customerId: { type: String, default: '' }, // stripe id
  credits: {
    type: Number,
    default: 1000,
    integer: true,
    get: (v) => Math.round(v),
    set: (v) => Math.round(v),
  },
  creditsUsed: {
    type: Number,
    default: 0,
    integer: true,
    get: (v) => Math.round(v),
    set: (v) => Math.round(v),
  },
  plan: { type: String, default: '' }, // entry, pro
  status: { type: String, default: 'trialing' }, // trialing, active, inactive
  trial_end: {
    type: Date,
    default: Date.now() / 1000 + 7 * 24 * 60 * 60,
    set: (d) => new Date(d * 1000),
  },
  current_period_end: {
    type: Date,
    default: Date.now() / 1000 + 7 * 24 * 60 * 60,
    set: (d) => new Date(d * 1000),
  },
  cancel_at_period_end: { type: Boolean, default: false },
  referralId: {
    type: String,
    unique: true,
    maxLength: 100,
  },
  referrerPaid: { type: Boolean, default: false }, // has the referral been given credits yet?
  referrer: {
    type: ObjectId,
    ref: 'user',
  },
  orgInfo: [
    // Organizations that current user created & received an invite from other users
    {
      orgId: {
        type: String,
      },
      orgName: {
        type: String,
      },
      userId: {
        type: String,
      },
      created: { type: Date, default: Date.now },
    },
  ],
  invitation: [
    // client information that current user sent an invite
    {
      orgId: {
        // organization ID
        type: String,
      },
      orgName: {
        // organization Name
        type: String,
      },
      userId: {
        // user id is inviting
        type: String,
      },
      email: {
        // invited email
        type: String,
        unique: false,
        lowercase: true,
        trim: true,
        required: true,
        maxLength: 100,
      },
      permId: {
        // if it is 0, "owner" otherwise "member"
        type: Number,
        default: 0,
      },
      status: {
        type: Number, // if it equals to 0, it is "pending", otherwise it is "joined"
        default: 0,
      },
      uploadedFilePath: [
        {
          path: {
            type: String,
          },
        },
      ],
      created: { type: Date, default: Date.now },
    },
  ],
});

UserSchema.methods.comparePassword = function (password) {
  return bcrypt.compareSync(password, this.hash_password);
};

const User = mongoose.model('user', UserSchema);
module.exports = User;
