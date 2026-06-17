const mongoose = require('mongoose');

const assetHistorySchema = new mongoose.Schema({
    asset: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Asset',
        required: true
    },

    employee: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Employee',
        required: true
    },

    action: {
        type: String,
        enum: ['assigned', 'returned'],
        required: true
    },

    actionDate: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('AssetHistory', assetHistorySchema);
