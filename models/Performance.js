const mongoose = require("mongoose");
const { Schema } = mongoose;

const performanceSchema = new Schema(
    {
        Student_ID: String,
        Semster_Name: String,
        Paper_ID: String,
        Paper_Name: String,
        Marks: Number,
    },
    { timestamps: true }
);

module.exports = mongoose.model("Performance", performanceSchema);
