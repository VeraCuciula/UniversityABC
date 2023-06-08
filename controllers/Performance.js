const Performance = require("../models/Performance");
const Department = require("../models/Department");
const Counseling = require("../models/Counseling");

exports.list = async (req, res) => {
    try {
        console.log(req.query)
        const perPage = 10;
        const limit = parseInt(req.query.limit) || 10;
        const page = parseInt(req.query.page) || 1;
        const message = req.query.message;
        const performances = await Performance.find({}).skip((perPage * page) - perPage).limit(limit);
        const count = await Performance.find({}).count();
        const numberOfPages = Math.ceil(count / perPage);
        res.render("Performance", { performances: performances, numberOfPages: numberOfPages,
            currentPage: page, message: message });
    } catch (e) {
        res.status(404).send({ message: "could not list performances" });
    }
};

exports.delete = async (req, res) => {
    const id = req.params.id;

    try {

        await Performance.findByIdAndRemove(id);
        res.redirect("/performances?message=record has been deleted");
    } catch (e) {
        res.status(404).send({
            message: `could not delete record ${id}.`,
        });
    }
};


exports.create = async (req, res) => {

    try {
        const performance = new Performance({ Student_ID: req.body.id,
            Semester_Name: req.body.sem_name, Paper_ID: req.body.paper_id, Paper_Name: req.body.paper_name,
            Marks: req.body.marks });
        await performance.save();
        res.redirect('/performances/?message=record has been created')
    } catch (e) {
        if (e.errors) {
            console.log(e.errors);
            res.render('create-performance', { errors: e.errors })
            return;
        }
        return res.status(400).send({
            message: JSON.parse(e),
        });
    }
}

exports.createView = async (req, res) => {
    try {
        res.render("create-performance", {
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
        const performance = await Performance.findById(id);
        if (!performance) throw Error(`couldn't find record`);
        res.render('update-performance', {
            performance: performance,
            id: id,
            errors: {}
        });
    } catch (e) {
        console.log(e)
        if (e.errors) {
            res.render('create-performance', { errors: e.errors })
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
        "Semster_Name": req.body.sem_name,
        "Paper_ID": req.body.paper_id,
        "Paper_Name": req.body.paper_name,
        "Marks": req.body.marks
    }
    try {
        const performance = await Performance.findOneAndUpdate({ _id: id }, update_data, { new: true });
        res.redirect('/performances/?message=record has been updated');
    } catch (e) {
        res.status(404).send({
            message: `couldn't find record ${id}.`,
        });
    }
};