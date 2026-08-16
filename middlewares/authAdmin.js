
const customError= require('../src/helper/customError')

function authAdimCheck(req, res, next) {
    try {

        
        const user = req.user;
        
  
        if(user.role!=="ADMIN") return next( new customError('Unauthorized',403));

       
        next();

    } catch (err) {
        
      next(err)
    }
};

module.exports = authAdimCheck;