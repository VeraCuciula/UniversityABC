const Employee = require("../models/Employee");
const Department = require("../models/Department");

exports.list = async (req, res) => {
    try {
        console.log(req.query)
        const perPage = 10;
        const limit = parseInt(req.query.limit) || 10;
        const page = parseInt(req.query.page) || 1;
        const message = req.query.message;
        const employees = await Employee.find({}).skip((perPage * page) - perPage).limit(limit);
        const count = await Employee.find({}).count();
        const numberOfPages = Math.ceil(count / perPage);
        res.render("Employee", { employees: employees, numberOfPages: numberOfPages,
            currentPage: page, message: message });
    } catch (e) {
        res.status(404).send({ message: "could not list employees" });
    }
};

exports.delete = async (req, res) => {
    const id = req.params.id;

    try {

        await Employee.findByIdAndRemove(id);
        res.redirect("/employees?message=employee has been deleted");
    } catch (e) {
        res.status(404).send({
            message: `could not delete employee ${id}.`,
        });
    }
};


exports.create = async (req, res) => {

    try {
        const employee = new Employee({ Employee_ID: req.body.id, DOB: req.body.dob,
            DOJ: req.body.doj, Department_ID: req.body.department_id });
        await employee.save();
        res.redirect('/employees/?message=employee has been created')
    } catch (e) {
        if (e.errors) {
            console.log(e.errors);
            res.render('create-employee', { errors: e.errors })
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
        res.render("create-employee", {
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
        const employee = await Employee.findById(id);
        if (!employee) throw Error(`couldn't find employee`);
        res.render('update-employee', {
            departments: departments,
            employee: employee,
            id: id,
            errors: {}
        });
    } catch (e) {
        console.log(e)
        if (e.errors) {
            res.render('create-employee', { errors: e.errors })
            return;
        }
        res.status(404).send({
            message: `couldn't find employee ${id}`,
        });
    }
};

exports.update = async (req, res) => {
    const id = req.params.id;
    const update_data = {
        "Employee_ID": req.body.id,
        "DOB": req.body.dob,
        "DOJ": req.body.doj,
        "Department_ID": req.body.department_id
    }
    try {
        const employee = await Employee.findOneAndUpdate({ _id: id }, update_data, { new: true });
        res.redirect('/employees/?message=employee has been updated');
    } catch (e) {
        res.status(404).send({
            message: `couldn't find employee ${id}.`,
        });
    }
};