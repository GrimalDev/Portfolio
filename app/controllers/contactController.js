import poolDB from "../config/configDB.js";

export function verifyContactForm(req, res, next) {
//control all fields
    let {firstname, lastname, email, message} = req.body;

    let errors = [];
    if (!firstname) {
        errors.push("First name is required");
    }
    if (!lastname) {
        errors.push("Last name is required");
    }
    if (!email) {
        errors.push("Email is required");
    }
    if (!message) {
        errors.push("Message is required");
    }

    //verify firstname and lastname only letters
    const nameRegex = /^[a-zA-Z]+$/;
    if (!nameRegex.test(firstname)) {
        errors.push("First name must only contain letters");
    }
    //verify lastname not too long
    if (lastname.length > 50) {
        errors.push("Last name is too long");
    }
    if (!nameRegex.test(lastname)) {
        errors.push("Last name must only contain letters");
    }
    //verify firstname not too long
    if (firstname.length > 50) {
        errors.push("First name is too long");
    }

    //verify email
    const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
    if (!emailRegex.test(email)) {
        errors.push("Email is invalid");
    }
    //verify email not too long
    if (email.length > 254) {
        errors.push("Email is too long");
    }

    //verify message less than 500 characters
    if (message.length > 500) {
        errors.push("Message is too long");
    }

    if (errors.length > 0) {
        res.json({
            status: 'nook',
            message: errors
        });
    } else {
        next();
    }
}

export function sendContactFormDB(req, res, next) {
    //save to db
    const query = {
        sql : 'INSERT INTO contact (firstname, lastname, email, message) VALUES (?, ?, ?, ?)',
        values : [req.body.firstname, req.body.lastname, req.body.email, req.body.message]
    }

    poolDB.query(query, function (error, results, fields) {
        if (error) {
            console.error(error);
            res.json({
                status: 'nook',
                message: 'Error while sending message !'
            });
        } else {
            next();
        }
    });
}