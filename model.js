// Stores the Schema for the Journal Entries and User
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');

// figure out how to hide password for mongo database
mongoose.connect('mongodb+srv://USERNAME:PASSWORD<COLLECTION>?retryWrites=true&w=majority', {useNewUrlParser: true, useUnifiedTopology: true});


// USER SCHEMA
const userSchema = mongoose.Schema({
	email: {
		type: String,
		required: true,
		unique: true,
	},
	name: {
		type: String,
		required: true
	},
	password: {
		type: String,
		required: true
	}
})

userSchema.methods.toJSON = function () {
	var obj = this.toObject();
	delete obj.password;
	return obj;
}

userSchema.methods.cryptPassword = function (noncrypt, callback) {
	bcrypt.hash(noncrypt, 12).then(hash => {
		this.password = hash;
		callback();
	})

};

userSchema.methods.verifyPassword = function(noncryptPassword, callback) {
	bcrypt.compare(noncryptPassword, this.password).then(result => {
		callback(result);
	});
};

// ENTRY SCHEMA 
const entrySchema = mongoose.Schema({
	date: {
		type: String,
		required: true
	},

	thought: {
		type: String,
		required: true
	},

	discussion: {
		type: String,
		required: true
	},


	reframe: {
		type: String,
		required: true
	},

	levels: {
		type: Number,
		required: true
	},

	user: {type: mongoose.Schema.Types.ObjectId, ref: 'User', require: true}
})


const Entry = mongoose.model('Entry', entrySchema);
const User = mongoose.model('User', userSchema);

module.exports = {
	User:User,
	Entry:Entry
};