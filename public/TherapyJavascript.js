// D3.JS
function generateLevelGraph(data) {
	const dates = data.map(entries => entries.date);
	const levels = data.map(entries => entries.levels);


	if (dates.length > 7){
		// seven most recent levels
		dates = dates.slice(0,7);
		levels = levels.slice(0,7);
	}

	
	svg = d3.select("#displayLevelGraph")
	  .append('svg')
	  .attr('width', 500)
	  .attr('height', 250);
  
	const yScale = d3.scaleLinear()
	  .domain([1, 5])
	  .range([250, 0]);

  
	const xScale = d3.scaleBand()
	  .domain(dates)
	  .range([0, 500])
	  .padding(0.05);
  
	const xAxis = d3.axisBottom(xScale)
	.tickSize(0)
	.tickFormat("");
  
	svg.append('g')
	  .attr('transform', `translate(50, 250)`)
	  .call(xAxis);
  
	const yAxis = d3.axisLeft(yScale)
	.tickValues([])
	.tickFormat("");

	svg.append('g')
	  .attr('transform', `translate(50, 0)`)
	  .call(yAxis);
  
	svg.selectAll('rect')
	  .data(levels)
	  
	  .enter()
	  .append('rect')

	  .attr('x', (d, i) => (i * 25) + 75)
	  .attr('y', (d) => yScale(d))

	  .attr('width', 20)
	  .attr('height', (d) => 250 - yScale(d))

	  .style("fill", function(d) {
		if (d === 1) {
			color = "#595959";

		}
		else if (d === 2) {
			color = "#595959";

		}
		else if (d === 3) {
			color = "#595959";
			
		}
		else if (d === 4) {
			color = "#595959";

		}

		else {
			color = "#595959";
		}

		return color;

	  });
	


}



// REQUESTS
function session() {
	return fetch("http://localhost:8080/me" , {
		
	});
};

function createUser(user) {
	var userInfo =  "email=" + encodeURIComponent(user.email);
	userInfo += "&name=" + encodeURIComponent(user.name);
	userInfo += "&noncryptPassword=" + encodeURIComponent(user.noncryptPassword);

	return fetch("http://localhost:8080/users", {
		method:'POST',
		body: userInfo,

		headers: {
			"Content-Type": "application/x-www-form-urlencoded"
		},
		credentials: 'include'
	})
};

function createLogin(user) {
	var login = "email=" + encodeURIComponent(user.email);
	login += "&noncryptPassword=" + encodeURIComponent(user.noncryptPassword);
	
	return fetch("http://localhost:8080/sessions", {
		method: 'POST',
		body: login,
		headers: {
			"Content-Type": "application/x-www-form-urlencoded"
		}
	});
};

function logout() {
	return fetch("http://localhost:8080/me", {
		method: 'DELETE',
	});
};

function createEntry(entry) {
	var newEntry = "date=" + encodeURIComponent(entry.date);
	newEntry += "&thought=" + encodeURIComponent(entry.thought);
	newEntry += "&discussion=" + encodeURIComponent(entry.discussion);
	newEntry += "&reframe=" + encodeURIComponent(entry.reframe);
	newEntry += "&levels=" + encodeURIComponent(entry.levels);

	return fetch("http://localhost:8080/entries", {
		method: "POST",
		body: newEntry,
		headers: {
			"Content-Type": "application/x-www-form-urlencoded"
			
		},
		credentials: 'include'
	}) 

};

function deleteEntry(entryId) {
	return fetch("http://localhost:8080/entries/" + entryId, {
		method: "DELETE",
		credentials: 'include'
	})
};

function editEntry(entry) {
	var entryUpdate = "date=" + encodeURIComponent(entry.date);
	entryUpdate += "&thought=" + encodeURIComponent(entry.thought);
	entryUpdate += "&disscussion=" + encodeURIComponent(entry.discussion);
	entryUpdate += "&reframe=" + encodeURIComponent(entry.reframe);
	newEntry += "&levels=" + encodeURIComponent(entry.levels);

	return fetch("http://localhost:8080/entries/" + entry._id, {
		method: "PUT",
		body: entryUpdate,
		headers: {
			"Content-Type": "application/x-www-form-urlencoded"
		},
		credentials: 'include'
	}) 

	
};

function queryEntries() {
	return fetch ("http://localhost:8080/entries", {credentials: 'include'});
};

function getUsername() {
	return fetch ("http://localhost:8080/me");
};
// D3.JS

// VUE
var app = new Vue ({
	el: '#app', 
	data: {
		// Registration Infomation	
		lemail: '',
		lpassword: '',

		// Sign In Information 
		remail: '',
		rpassword: '',
		firstname: '',


		// VIEW MECHANICS 

		// HOMEPAGE 
		frontpage: true,
		switches: true,
		registration: false,
		login: false,
		displayError: false,
		success: false,
		rError: false,

		// DASHBOARD 
		dashboard: false,
		create: false,
		logoutButton: false,
		username: '',

		// Entry Information
		date: '',
		thought: '',
		discussion: '',
		reframe: '',
		levels: 1,

		_id: '',
		Entries: [],
		Recent: [],
	},

	methods: {
		createE: function () {
			
			if (confirm("Are You Sure You Want to Submit? You Won't Be Able To Edit Your Response!")){
				this.levels =  parseInt(this.levels)
		
				createEntry ({
					date: this.date,
					thought: this.thought,
					discussion: this.discussion,
					reframe: this.reframe,
					levels: this.levels
				}).then( (response) => {
					if (response.status == 201) {
						this.load();

						this.date = '';
						this.thought = '';
						this.discussion = '';
						this.reframe = '';
						this.levels = 0;

						this.create = false 
					}

					else {
						alert ("Looks Like You Forgot some Boxes! Answer the Questions and Try Again");
						return;
					}

					
				})

				

			
				
				this.load();

			}

			else {
				return;
			}
		},

		load: function ()  {
			queryEntries().then((response) => {
				response.json().then((data) => {
					this.Entries = data;
					d3.select("svg").remove();
					generateLevelGraph(this.Entries);

					this.Recent = this.Entries.slice(-3)
				});
			});


			getUsername().then((response) => {
				response.json().then((data) => {
					this.username = data.name;
					console.log(this.username)
				});
			});




			




		
		},

		deleteE: function (entry) {
			deleteEntry(entry._id).then ((response) => {
				if (response.status == 200) {
					this.load();
				}

			})

			this.load();
		},








		// LOGIN - REGISTER FUNCTIONALITY
		register: function () {
			createUser({
				email: this.remail,
				name: this.firstname,
				noncryptPassword: this.rpassword
			}).then(response => {
				if (response.status == 201 ){
					this.rError = false;
					this.success = true;
					

					

				}

				else if (response.status == 422) {
					// create an alert for a failed registration attempt 
					this.rError = true;
				}
			})
			
	
			this.remail = '';
			this.rpassword = '';
			this.firstname = '';
		


		},


		attemptlogin: function() {
			createLogin({
				email: this.lemail,
				noncryptPassword: this.lpassword
			}).then(response => {
				if (response.status == 201) {
					// login attempt was successful
					
					this.frontpage = false;
					this.dashboard = true;
					this.load();

	

					this.rError = false;
					this.success = false;


				}

				if (response.status == 401) {
					// error login attempt

					this.displayError = true;
					this.rError = false;
					this.success = false;
				}


				
			})

			this.lpassword = '';
			this.lemail = '';

		},

		
		logoutUser: function() {
			logout().then(response =>  {

				if (response.status == 200) {
					
					this.frontpage = true;
					this.dashboard = false;
					d3.select("svg").remove();
					this.username = '';
					


				}
			})

		},

		changePage: function(page) {
			if (page == "login") {
				// accesses the login page 
				this.clear()
				this.registration = false;
				this.login = true;

				this.switches = false;

				
				
			}

			else if (page == "register") {
				// accesses the registration page
				this.clear()
				this.login = false;
				this.registration = true;

				this.switches = false;
			}

			else {
				this.switches = true;

				this.login = false;
				this.registration = false;
			}

			this.displayError = false;
			this.success = false;

			

			

		},



		loginSwitch: function() {
			this.registration = false;
		},

		registerSwitch: function() {
			this.registration = true;
		},


		// Dashboard Methods
		




		switchDashboardView: function(view) {
			if (view == 'create') {
				this.clear();
				this.create = true;
				
				
			
			}

			else if (view == 'home') {
				this.clear();
				this.create = false;
				

				
				this.load();
			}

		},


		statusCheck: function() {
			session().then(response => {
				if (response.status == 400) {
					// LOGGED OUT
					this.clear();
					this.frontpage = true;
					this.dashboard = false;
					

					
					
				}

				else if (response.status == 200) {
					// LOGGED IN 
					this.clear();
					this.frontpage = false;
					this.dashboard = true;
				

					
					this.create = false;
					this.load();
					

				
	


					

				}
			})
		},

		clear: function () {
			this.success = false;
			this.rError = false;
			this.displayError = false;
			
			this.lemail = '';
			this.lpassword= '';
	
			this.remail= '';
			this.rpassword= '';
			this.firstname= '';
		},





	},

	

	created: function() {
		this.statusCheck();

		// make sure all fields get cleared
		this.clear();
	}

})







