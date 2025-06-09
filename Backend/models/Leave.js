const mongoose = require('mongoose');

const leaveSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, 'Email is required'],
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    from: {
      type: Date,
      required: [true, 'From date is required'],
      validate: {
        validator: function (value) {
          return value >= new Date().setHours(0, 0, 0, 0);
        },
        message: 'From date cannot be in the past',
      },
    },
    to: {
      type: Date,
      required: [
        function () {
          return !this.oneDay;
        },
        'To date is required for multi-day leaves',
      ],
    },
    reason: {
      type: String,
      required: [true, 'Reason is required'],
      trim: true,
      maxlength: [500, 'Reason cannot exceed 500 characters'],
    },
    oneDay: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: {
        values: ['Pending', 'Approved', 'Declined'],
        message: '{VALUE} is not a valid status',
      },
      default: 'Pending',
      set: (value) => {
        if (typeof value !== 'string') return 'Pending';
        return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
      },
    },
    declineReason: {
      type: String,
      default: '',
      trim: true,
      maxlength: [500, 'Decline reason cannot exceed 500 characters'],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: false, versionKey: false },
  }
);

leaveSchema.pre('validate', function (next) {
  if (!this.oneDay && this.to && this.from && this.to < this.from) {
    this.invalidate('to', 'To date must be after From date');
  }
  if (this.oneDay && !this.to) {
    this.to = this.from;
  }
  if (!this.oneDay && this.to && this.from) {
    const maxDays = 30;
    const days = (this.to - this.from) / (1000 * 60 * 60 * 24);
    if (days > maxDays) {
      this.invalidate('to', `Leave duration cannot exceed ${maxDays} days`);
    }
  }
  next();
});

leaveSchema.index({ email: 1 });
leaveSchema.index({ status: 1 });
leaveSchema.index({ createdAt: -1 });
leaveSchema.index({ email: 1, status: 1 });

module.exports = mongoose.models.Leave || mongoose.model('Leave', leaveSchema);
