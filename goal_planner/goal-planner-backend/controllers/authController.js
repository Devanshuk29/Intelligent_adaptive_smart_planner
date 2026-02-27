const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/database.js');

const signup = async (req, res)=>{
    try {
      const {email, password, name} = req.body;

      if(!email || !password || !name){
        return res.status(400).json({
            error: 'Email, password and name are required.'
        })
      }

      const userExist = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

      if(userExist.rows.length>0){
        return res.status(400).json({
            error: 'User with this email already exists.'
        })
      }

      const hashPassword = await bcrypt.hash(password, 10);

      const result = await pool.query('INSERT INTO users (email, password, name) VALUES ($1, $2, $3) RETURNING id, email, name', [email, hashPassword, name]);

      const user = result.rows[0];

      const token = jwt.sign(
        {userId: user.id},
        process.env.JWT_SECRET,
        {expiresIn: '7d'}
      )

      res.status(201).json({
        token,
        user
      });

        
    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({ 
        error: 'Server error during signup' 
        });
    }
}

module.exports = {signup};