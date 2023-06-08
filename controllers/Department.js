const Department = require("../models/Department");

exports.list = async (req, res) => {
    try {
        console.log(req.query);
        const perPage = 10;
        const limit = parseInt(req.query.limit) || 10;
        const page = parseInt(req.query.page) || 1;
        const message = req.query.message;
        const departments = await Department.find({}).skip((perPage * page) - perPage).limit(limit);
        const count = await Department.find({}).count();
        const numberOfPages = Math.ceil(count / perPage);
        res.render("Department", { departments: departments, numberOfPages: numberOfPages,
            currentPage: page, message: message });
    } catch (e) {
        res.status(404).send({ message: "could not list departments" });
    }
};

exports.delete = async (req, res) => {
    const id = req.params.id;

    try {

        await Department.findByIdAndRemove(id);
        res.redirect("/departments/?message=department has been deleted");
    } catch (e) {
        res.status(404).send({
            message: `could not delete department ${id}.`,
        });
    }
};


exports.create = async (req, res) => {

    try {
        const department = new Department({ Department_ID: req.body.id, Department_Name: req.body.name });
        await department.save();
        res.redirect('/departments/?message=department has been created')
    } catch (e) {
        if (e.errors) {
            console.log(e.errors);
            res.render('create-department', { errors: e.errors })
            return;
        }
        return res.status(400).send({
            message: JSON.parse(e),
        });
    }
}

exports.createView = async (req, res) => {
    try {
        res.render("create-department", {
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
        const department = await Department.findById(id);
        if (!department) throw Error(`couldn't find department`);
        res.render('update-department', {
            department: department,
            id: id,
            errors: {}
        });
    } catch (e) {
        console.log(e)
        if (e.errors) {
            res.render('create-department', { errors: e.errors })
            return;
        }
        res.status(404).send({
            message: `couldn't find department ${id}`,
        });
    }
};

exports.update = async (req, res) => {
    const id = req.params.id;
    const update_data = {
        "Department_ID": req.body.id,
        "Department_Name": req.body.name
    }
    try {
        const department = await Department.findOneAndUpdate({ _id: id }, update_data, { new: true });
        res.redirect('/departments/?message=department has been updated');
    } catch (e) {
        res.status(404).send({
            message: `couldn't find department ${id}.`,
        });
    }
};