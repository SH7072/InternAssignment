const pool = require("../dbConnection")
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

exports.signUp = async (req, res, next) => {
    try {
        const { username, password, role } = req.body;
        const hashedPassword = await bcrypt.hash(password, 12);
        if (!role) {
            role = 'student';
        }
        const existingUserQuery = 'SELECT * FROM users WHERE username = $1';
        const existingUserValues = [username];
        const existingUser = await pool.query(existingUserQuery, existingUserValues);
        if(existingUser.rows.length>0)
        {
            const error = new Error("There exist a user with same username ");
            if (!error.statusCode) {
                error.statusCode = 404;
            }
            throw error;
        
        };
        // console.log(username,hashedPassword,role);
        const insertUserQuery = `
      INSERT INTO users (username, password, role)
      VALUES ($1, $2, $3)
      RETURNING id, username, role;
    `;

        const insertUserValues = [username, hashedPassword, role];

        const result = await pool.query(insertUserQuery,insertUserValues);
        // console.log(pool.query);
        const newUser = result.rows[0];
        res.status(200).json(
            {
                message: "User created",
                newUser
            });

    }
    catch (err) {
        console.log(err);
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
}
exports.login=async (req,res,next)=>{
    try{
        const {username,password}=req.body;
        const getUserQuery=`
        SELECT * FROM users
        WHERE username=$1;
        `;
        const getUserValues=[username];
        const result=await pool.query(getUserQuery,getUserValues);
        const user=result.rows[0];
        if(!user)
        {
            const error=new Error("A user with this username could not be found");
            error.statusCode=401;
            throw error;
        }
        const isEqual=await bcrypt.compare(password,user.password);
        if(!isEqual)
        {
            const error=new Error("Wrong password");
            error.statusCode=401;
            throw error;
        }
        const token=jwt.sign({
            username:user.username,
            userId:user.id.toString()
        },process.env.JWT_SECRET,{expiresIn:process.env.JWT_EXPIRES_IN});


        res.status(200).json({
            message:"User logged in successfully",
            token:token,
            userId:user.id.toString()
        });

    }
    catch(err)
    {
        console.log(err);
        if(!err.statusCode)
        {
            err.statusCode=500;
        }
    }
}