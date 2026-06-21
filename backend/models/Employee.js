const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },

    empId: {
        type: String,
        required: true,
        unique: true
    },

    email: {
        type: String,
        required: true,
        unique: true
    },

    password: {
        type: String,
        // required: true
    },

    designation: {
        type: String,
    },

    department: {
        type: String
    },

    phone: {
        type: String
    },

    profilePic: {
        type: String
    },

    idProofDoc:{
        type: String
    },

    dateOfJoining:{
        type: Date,
    }

}, {
    timestamps: true
});

module.exports = mongoose.model('Employee', employeeSchema);
