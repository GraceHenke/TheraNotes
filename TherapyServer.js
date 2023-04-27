// Server Side Javascript
const model = require('./model');
const User = model.User;
const Entry = model.Entry;

const session = require('express-session');
const passportLocal = require('passport-local');
const passport = require('passport');
const express = require('express');
const cors = require('cors');



const app = express();
const port = 8080;
app.use(express.urlencoded({ extended: false}));
app.use(express.static('public'));
app.use(cors())

app.use(session({secret: 'ENTERYOUROWNSECRET', resave: false, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());

// ENTRIES
app.get('/entries', (req,res) => {
	if (!req.user) {
		res.sendStatus(401);
		return;
	}

	Entry.find({user:req.user._id}).populate('user').then((entries) =>{
		res.json(entries);
	}).catch((error) =>{
		res.sendStatus(500);
	})
});

app.get('/users', (req, res) => {
	if (!req.user) {
		res.sendStatus(req);
		return;
	}


	User.findOne( {user: req.user._id}).then((user) => {
		res.json(user);
	
	}).catch((error) => {
		res.sendStatus(500);
	})
});

app.delete('/entries/:entryId', (req,res) => {
	if (!req.user) {
		res.sendStatus(401);
		return;
	}

	Entry.findOne({_id:req.params.entryId, user: req.user._id}).then((entry) => {

		if (entry) {
			entry.remove().then( () => {
				res.sendStatus(200);
			}).catch((error) => {
				res.sendStatus(500);
			});
		}

		else {
			res.sendStatus(404);
		}

		}).catch((error)=> {
			res.sendStatus(400);
		});

	
})

app.post('/entries', (req, res) => {

	if (!req.user) {
		res.sendStatus(401);
		return;
	}

	var entry = new Entry ({
		date: req.body.date,
		thought: req.body.thought,
		discussion: req.body.discussion,
		reframe: req.body.reframe,
		levels: req.body.levels,
		user: req.user._id
	});

	entry.save().then( () => {
		res.sendStatus(201);

	}).catch(function(err) {
		if (err.errors) {
			var messages = {}
			for (var e in err.errors) {
				messages[e] = err.errors[e].message;
			}

			res.status(422).json(messages);
		}

		else {
			res.sendStatus(500);
		}
	});
});


app.put('/entries/:entryId', (req, res) => {
	if (!req.user) {
		res.sendStatus(401);
		return;
	}
	Entry.findOne({_id: req.params.entryId, user: req.user._id}).then( (entry) => {
		if (entry) {
			entry.date = req.body.date;
			entry.thought = req.body.throught;
			entry.discussion = req.body.discussion;
			entry.reframe = req.body.reframe;

			entry.save().then( () => {
				res.sendStatus(200);
			}).catch ( (error) => {
				if (error.errors) {
					var messages = {};
					for (var e in error.errors) {
						messages[e] = error.errors[e].message;
					}

					res.status(422).json(messages);
				}

				else {
					res.sendStatus(500);
				}
			});
		}

		else {
			res.sendStatus(404);
		}

	}).catch[(eror) => {
		res.sendStatus(400);
	}];
});

// USERS

app.post('/users', (req,res) => {
	var user = new User ({
		email: req.body.email,
		name: req.body.name

	})
	user.cryptPassword(req.body.noncryptPassword, function () {
		user.save().then((user) => {
			res.status(201).json(user)
		}).catch(function (err) {
			if (err.errors) {
				var messages = {};
				for (var e in err.errors) {
					messages[e] = err.errors[e].message;
				}
				res.status(422).json(messages);
			}
			else if (err.code == 11000) {
				res.status(422).json("Email has already been used")
			}
			else {
				res.sendStatus(500);
				console.log('Unknown Error: ', err)
			}
		});
	});

})






// Passport 

passport.use(new passportLocal.Strategy({
	usernameField: "email",
	passwordField: "noncryptPassword"
}, function(email, noncryptPassword, done) {
	User.findOne({email:email}).then(function (user) {
		if (!user) {
			done(null, false);
			return;
		}


		user.verifyPassword(noncryptPassword, function(result) {
			if (result) {
				done(null, user);
			}

			else {
				done(null, false);
			}
		});
	}).catch(function (err) {
		done(err);
	});
}));

// SESSIONS STUFF
passport.serializeUser(function (user, done) {
	done(null, user._id);
});

passport.deserializeUser(function (userId, done) {
	User.findOne({_id: userId}).then(function(user) {
		done(null, user);
	}).catch(function(err) {
		done(err);
	});
});

app.post("/sessions", passport.authenticate("local"), function ( req, res) {
	res.sendStatus(201);
});

app.get("/me", function(req, res) {
	if (req.user) {
		res.json(req.user);
	}

	else {
		res.sendStatus(401);
	}
});

app.delete('/me', function (req, res, next) {
	req.logout(function(err) {
		if (err) {return next(err);}
		res.sendStatus(200);
	});
	
})




app.listen(port, () => {
	console.log('Running!');
});