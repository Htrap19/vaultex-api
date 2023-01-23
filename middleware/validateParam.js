const mongoose = require("mongoose");

function validateParam(paramName) {
    return (req, res, next) => {
        if (!mongoose.Types.ObjectId.isValid(req.params[paramName]))
            return res.status(400).json(`'${paramName}' invalid ObjectId!`);

        next();
    };
}

module.exports.validateParam = validateParam;
module.exports.validateParamId = validateParam('id');