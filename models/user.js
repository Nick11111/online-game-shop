var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var bcrypt = require('bcrypt-nodejs');

var userSchema = new Schema({
    email: {type: String, required: true},
    password: {type: String, required: true},
    active: { type: Boolean, required: true, default: false},
    hashedId: {type: String}
});

userSchema.methods.encryptPassword = function (password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(10),null);
}

userSchema.methods.validPassword = function (password){
    return bcrypt.compareSync(password,this.password);
};

userSchema.methods.encryptUserId = function (userId) {
    return bcrypt.hashSync(userId, bcrypt.genSaltSync(10),null);
}

userSchema.methods.validUserId = function (userId){
    return bcrypt.compareSync(userId,this._id);
};
module.exports = mongoose.model('User', userSchema);