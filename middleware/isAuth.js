const jwt = require('jsonwebtoken');
const pool=require('../dbConnection');

exports.isAuth = (req, res, next) => {
    const authHeader = req.get('Authorization');
    if (!authHeader) {
        const error = new Error("Not Authenticated");
        error.statusCode = 401;
        throw error;
    }
    const token = authHeader.split(' ')[1];
    let decodedToken;
    try {
        decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    }
    catch (err) {
        err.statusCode = 500;
        throw err;
    }
    if (!decodedToken) {
        const error = new Error("Not Authenticated");
        error.statusCode = 401;
        throw error;
    }

    req.userId = decodedToken.userId;
    next();

}

exports.isTeacher=async(req,res,next)=>{
    const userId=req.userId;

    const getUserQuery=`
    SELECT * FROM users
    WHERE id=$1;
    `;
    const getUserValues=[userId];
    const result=await pool.query(getUserQuery,getUserValues);
    const user=result.rows[0];
    if(!user)
    {
        const error=new Error("A user with this username could not be found");
        error.statusCode=401;
        throw error;
    }
    if(user.role!=='teacher')
    {
        const error=new Error("Not Authorized");
        error.statusCode=401;
        throw error;
    }
    next();
    
}