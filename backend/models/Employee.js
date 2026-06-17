const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },

    email: {
        type: String,
        required: true,
        unique: true
    },

    password: {
        type: String,
        required: true
    },

    role: {
        type: String,
        enum: ['admin', 'employee'],
        default: 'employee'
    },

    department: {
        type: String
    },

    phone: {
        type: String
    },

    profilePic: {
        type: String
    }

}, {
    timestamps: true
});

module.exports = mongoose.model('Employee', employeeSchema);
