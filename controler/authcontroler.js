// Password reset request
module.exports.password_reset_request = async (req, res) => {
    const { email } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Email not found' });
        }

        // Generate reset token
        const resetToken = crypto.randomBytes(32).toString('hex');
        const resetTokenExpiry = Date.now() + 3600000; // 1 hour

        user.resetToken = resetToken;
        user.resetTokenExpiry = resetTokenExpiry;
        await user.save();

        // Send email
        const template = emailTemplates.passwordReset(user, resetToken);
        await sendEmail(user.email, template.subject, template.html, template.text);

        res.json({ message: 'Password reset email sent' });
    } catch (error) {
        console.error('Password reset request error:', error);
        res.status(500).json({ message: 'Failed to send reset email' });
    }
};

// Password reset confirm
module.exports.password_reset_confirm = async (req, res) => {
    const { token, newPassword } = req.body;
    try {
        const user = await User.findOne({
            resetToken: token,
            resetTokenExpiry: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired token' });
        }

        user.password = newPassword;
        user.resetToken = undefined;
        user.resetTokenExpiry = undefined;
        await user.save();

        res.json({ message: 'Password reset successful' });
    } catch (error) {
        console.error('Password reset confirm error:', error);
        res.status(500).json({ message: 'Failed to reset password' });
    }
};
const User = require('../model/user');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { sendEmail, emailTemplates } = require('../utils/email');


const handleErrors = (err)=>{
    console.log(err.message, err.code);
    let errors = {email:'',password:''};

    // duplicate email errors
    if(err.code === 11000){
        errors.email= 'Email Already exist';
        return errors;
    }

    //incorrect email
    if(err.message === 'incorrect email'){
        errors.email = 'this email is not registered';
    }
    if(err.message === 'incorrect password'){
        errors.password = 'this password is incorrect';
    }

    // validation errors
    if(err.message.includes('user validation failed')){
        Object.values(err.errors).forEach(({properties})=>{
            errors[properties.path] = properties.message;
        })
    }
    return errors;
}
const maxAge= 1 * 24 * 60 * 60;
const createToken = (id)=>{
    return jwt.sign({id},'Adisecret',{expiresIn:maxAge});
}


module.exports.display_get = (req,res)=>{
    console.log(req.url);
    res.send([{ "name": "GeeksforGeeks","desc":"h1" },{ "name": "GeeksforGeeks1","desc":"h12" },{ "name": "GeeksforGeeks2","desc":"h3"}]);
}
module.exports.register_post = async(req,res)=>{
    console.log(req.body)
    const {name,email,password,countryCode, mobileNumber} = req.body;
    console.log("mobile"+mobileNumber);
    try{
      const user =await User.create({name,email,password,countryCode, mobileNumber});
      const token = createToken(user._id);
      console.log(token);
      res.status(201).json({token});
    }
    catch(err){
        const errors = handleErrors(err);
        res.status(401).json({errors});
    }
    
}
module.exports.login_post = async (req,res)=>{
    
    const {email,password} = req.body;
    // console.log(email,password);
    // User.login(email,password)
    // .then(user=>{
    //     const token =createToken(user._id);
    //     res.status(200).json({token});
    // })
    // .catch(err => {
    //     const errors = handleErrors(err);
    //     res.status(401).json({ errors });
    // });

   try{
    const user = await User.login(email,password);
    const token = createToken(user._id);
    res.cookie('jwt',token,{httpOnly:true, maxAge:maxAge*1000});
    res.status(200).json({token});
   }
   catch(err){
    const errors = handleErrors(err);
    res.status(400).json({errors})
   }

}
module.exports.display_user = (req,res)=>{
    const authHeader = req.headers.authorization;
    // console.log("form data",authHeader);
    if (authHeader) {
        const token = authHeader.split(' ')[1]; // Assuming token is sent as 'Bearer token'
        // console.log(token);
        if (token) {
            jwt.verify(token, 'Adisecret', async (err, decodedToken) => {
                if (err) {
                    console.log(err.message);
                    res.status(400).json({ err });
                } else {
                    // console.log(decodedToken);
                    let userdetails = await User.findById(decodedToken.id);
                    const userDetailsWithoutPassword = {
                        ...userdetails._doc,
                        password: undefined // or delete userDetailsWithoutPassword.password;
                    };
                    res.status(200).json({ userdetails: userDetailsWithoutPassword });
                }
            });
        } else {
            return res.status(401).json({ message: 'No token provided.' });
        }
    } else {
        // No authorization header found
        return res.status(401).json({ message: 'No token provided.' });
    }
}

module.exports.update_user = (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({ message: 'No token provided.' });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
        return res.status(401).json({ message: 'No token provided.' });
    }

    jwt.verify(token, 'Adisecret', async (err, decodedToken) => {
        if (err) {
            console.log(err.message);
            return res.status(400).json({ message: 'Invalid token.' });
        }

        try {
            const user = await User.findById(decodedToken.id);
            if (!user) {
                return res.status(404).json({ message: 'User not found.' });
            }

            const { name, email, password, countryCode, mobilenumber } = req.body;
            if (name) user.name = name;
            if (email) user.email = email;
            if (typeof countryCode === 'string') user.countryCode = countryCode;
            if (typeof mobilenumber !== 'undefined') user.mobilenumber = mobilenumber;
            if (password) user.password = password;

            await user.save();

            const userDetailsWithoutPassword = {
                ...user._doc,
                password: undefined,
            };

            res.status(200).json({ userdetails: userDetailsWithoutPassword });
        } catch (err) {
            const errors = handleErrors(err);
            res.status(400).json({ errors });
        }
    });
};