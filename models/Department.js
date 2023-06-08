const mongoose = require("mongoose");
const { Schema } = mongoose;

const departmentSchema = new Schema(
    {
        Department_ID: { type: String, unique: true },
        Department_Name: { type: String, required: [true, 'Name is required'], minlength: [3, "Name must be 4 chars long"] },
        DOE: { type: Date, default: Date.now() },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Department", departmentSchema);
