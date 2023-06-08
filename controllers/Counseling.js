const Counseling = require("../models/Counseling");
const Department = require("../models/Department");
const Employee = require("../models/Employee");

exports.list = async (req, res) => {
    try {
        console.log(req.query);
        const perPage = 10;
        const limit = parseInt(req.query.limit) || 10;
        const page = parseInt(req.query.page) || 1;
        const message = req.query.message;
        const counselings = await Counseling.find({}).skip((perPage * page) - perPage).limit(limit);
        const count = await Counseling.find({}).count();
        const numberOfPages = Math.ceil(count / perPage);
        res.render("Counseling", { counselings: counselings, numberOfPages: numberOfPages,
            currentPage: page, message: message });
    } catch (e) {
        res.status(404).send({ message: "could not list counselings" });
    }
};

exports.delete = async (req, res) => {
    const id = req.params.id;

    try {

        await Counseling.findByIdAndRemove(id);
        res.redirect("/counselings?message=record has been deleted");
    } catch (e) {
        res.status(404).send({
            message: `could not delete record ${id}.`,
        });
    }
};


exports.create = async (req, res) => {

    try {
        const counseling = new Counseling({ Student_ID: req.body.id,
            DOA: req.body.doa, DOB: req.body.dob, Department_Choices: req.body.department_choices,
            Department_Admission: req.body.department_admission });
        await counseling.save();
        res.redirect('/counselings/?message=record has been created')
    } catch (e) {
        if (e.errors) {
            console.log(e.errors);
            res.render('create-counseling', { errors: e.errors })
            return;
        }
        return res.status(400).send({
            message: JSON.parse(e),
        });
    }
}

exports.createView = async (req, res) => {
    try {
        const departments = await Department.find({});
        res.render("create-counseling", {
            departments: departments,
            errors: {}
        });

    } catch (e) {
        res.status(404).send({
            message: `could not generate create data`,
        });
    }
}

exports.edit = async (req, res) => {
    const id = req.params.id;
    try {
        const departments = await Department.find({});
        const counseling = await Counseling.findById(id);
        if (!counseling) throw Error(`couldn't find record`);
        res.render('update-counseling', {
            departments: departments,
            counseling: counseling,
            id: id,
            errors: {}
        });
    } catch (e) {
        console.log(e)
        if (e.errors) {
            res.render('create-counseling', { errors: e.errors })
            return;
        }
        res.status(404).send({
            message: `couldn't find record ${id}`,
        });
    }
};

exports.update = async (req, res) => {
    const id = req.params.id;
    const update_data = {
        "Student_ID": req.body.id,
        "DOA": req.body.doa,
        "DOB": req.body.dob,
        "Department_Choices": req.body.department_choices,
        "Department_Admission": req.body.department_admission
    }
    try {
        const counseling = await Counseling.findOneAndUpdate({ _id: id }, update_data, { new: true });
        res.redirect('/counselings/?message=record has been updated');
    } catch (e) {
        res.status(404).send({
            message: `couldn't find record ${id}.`,
        });
    }
};