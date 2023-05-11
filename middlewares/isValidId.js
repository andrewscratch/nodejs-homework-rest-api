const { isValidObjectId } = require('mongoose');
const { RequestError } = require('../helpers');

const isValidId = (req, res, next) => {
    const { contactId } = req.params;
    
     if (!isValidObjectId(contactId)) {
        next(RequestError(404, `${contactId} isn't valid, try again`))
    }
    next();
}

module.exports = isValidId;
