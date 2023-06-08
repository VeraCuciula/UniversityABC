const mongoose = require("mongoose");
const { Schema } = mongoose;

const employeeSchema = new Schema(
    {
        Employee_ID: { type: String, unique: true },
        DOB: Date,
        DOJ: { type: Date, default: Date.now() },
        Department_ID: String,
    },
    { timestamps: true }
);

module.exports = mongoose.model("Employee", employeeSchema);
