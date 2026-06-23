const mongoose = require('mongoose');

const departmentSchema = new mongoose.Schema({
    deptName: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },

    deptIncharge: {
        type: String,
        trim: true
    },

    additionalNote: {
        type: String,
        trim: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Department', departmentSchema);
