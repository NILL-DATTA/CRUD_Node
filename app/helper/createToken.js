const  jwt = require("jsonwebtoken");
const createToken = async (id) => {

    try {
        const token = jwt.sign({ user: id }, "anirban1234567890", { expiresIn: "1d" });
        return token;

    } catch (error) {
        // res.status(400).send(error.message);
        console.log(error);
    }
}

module.exports = createToken;