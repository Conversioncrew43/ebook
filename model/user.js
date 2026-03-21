const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcrypt');

const userSchema = new Schema({
    name:{
        type:String,
        require:true
    },
    email: {
        type: String,
        lowercase: true,
        unique: true,
        required: 'Email address is required',
        
    },
    password:{
        type:String,
        require:true
    },
    countryCode: { // New field for the country code
        type: String,
        required: true
    },

    mobilenumber:{
        type:Number,
        require:true
    },
    role: {
        type: String,
        enum: ['admin', 'project_manager', 'accountant', 'site_supervisor', 'sales_crm', 'vendor', 'client'],
        default: 'site_supervisor',
    },
    permissions: {
        type: [String],
        enum: ['read', 'create', 'update', 'delete'],
        default: ['read']
    },
    dataAccess: {
        type: String,
        enum: ['all_projects', 'assigned_projects', 'own_data'],
        default: 'assigned_projects'
    },
    assignedProjects: [{
        type: Schema.Types.ObjectId,
        ref: 'Project',
        default: []
    }],
    resetToken: String,
    resetTokenExpiry: Date,
    activityLog: [{
        action: String,
        timestamp: { type: Date, default: Date.now },
        details: String
    }]

},{timestamps:true});


userSchema.pre('save', async function(next){
    // console.log('User about to be created',this);
    const salt = await bcrypt.genSalt();
    this.password = await bcrypt.hash(this.password,salt);
    next();
});
userSchema.statics.login = async function (email, password){
    const user = await this.findOne({email});
    console.log(user);
    if(user){
        const auth = await bcrypt.compare(password,user.password);
       
        if(auth){
            return user;  
        }
        throw Error('incorrect password');
    }
    throw Error('incorrect email');
}


const User = mongoose.model('User',userSchema);
module.exports= User;