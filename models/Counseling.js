const mongoose = require("mongoose");
const { Schema } = mongoose;

const counselingSchema = new Schema(
    {
        Student_ID: { type: String, unique: true },
        DOA: Date,
        DOB: Date,
        Department_Choices: String,
        Department_Admission: String,
    },
    { timestamps: true }
);

module.exports = mongoose.model("Counseling", counselingSchema);
