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
        enum: [
            'ASSIGNED',
            'RETURNED',
            'MAINTENANCE_STARTED',
            'MAINTENANCE_COMPLETED',
        ],
        required: true
    },

    remarks: {
        type: String,
        trim: true
    },

    actionDate: {
        type: Date,
        default: Date.now
    },

}, {
    timestamps: true
});

module.exports = mongoose.model('AssetHistory', assetHistorySchema);
