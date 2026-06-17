const mongoose = require('mongoose');

const settingSchema = new mongoose.Schema({

    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Employee',
        required: true,
        unique: true
    },

    darkTheme: {
        type: Boolean,
        default: false
    },

    emailNotifications: {
        type: Boolean,
        default: true
    }

}, {
    timestamps: true
});

module.exports = mongoose.model('Setting', settingSchema);
