const mongoose = require('mongoose');

const assetSchema = new mongoose.Schema({
    assetId: {
        type: String,
        unique: true,
        trim: true
    },

    assetName: {
        type: String,
        required: true,
        trim: true
    },

    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: true
    },

    vendor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Vendor',
        required: true
    },

    model: {
        type: String,
        trim: true
    },

    serialNumber: {
        type: String,
        unique: true,
        sparse: true,
        trim: true
    },

    purchaseDate: {
        type: Date
    },

    purchaseCost: {
        type: Number,
        min: 0
    },

    warrantyExpiry: {
        type: Date,
        index: true
    },

    assetImage: {
        type: String
    },

    additionalNotes: {
        type: String,
        trim: true
    },

    status: {
        type: String,
        enum: ['Available', 'Assigned', 'Maintenance'],
        default: 'Available'
    },

    assignedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Employee',
        default: null
    },

    assignedDate: {
        type: Date,
        default: null
    }
}, {
    timestamps: true
});

//ASSIGN UNIQUE ASSET ID IF NOT EXISTS

assetSchema.pre('validate', function () {
    if (!this.assetId) {
        this.assetId = `AST-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        // console.log("assigned ID",this, this.assetId);
    }
});

module.exports = mongoose.model('Asset', assetSchema);
