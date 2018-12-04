const express = require('express');
const cors = require('cors');
const mongoClient = require('mongodb').MongoClient;
const bodyParser = require('body-parser'); //read form data and form fields
const methodOverride = require('method-override'); //to support PUT and DELETE FROM browssers

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:false}));
app.use(methodOverride('_method'));

const mongoServerURL = "mongodb://localhost:27017";
//const mongoServerURL = "mongodb://user1:user1@ds245218.mlab.com:45218/appointmentdb";



//default route / - display all patients
app.get('/', (request, response) => {
	mongoClient.connect(mongoServerURL, (err, db) => {
		if (err)
			console.log("Cannot connect to Mongo:"+err.message);

		//connect to item
		const appointmentdb = db.db("appointmentdb");

		//read from appointmentdb patients collection
		appointmentdb.collection("patients").find({}).toArray((err, itemsArray) => {
			if (err)
				console.log(err.message);

			response.send(JSON.stringify(itemsArray));
		});

		//close the connection to the db
		db.close();
	});

});




//add a new item - using HTTP POST method
app.post('/:patients', (request, response) => {
	//access the form fields by the same names as in the HTML form
	const Patientid = request.body.Patient_id;
	console.log(Patientid);
	const firstname = request.body.First_name;
	const lastname = request.body.Last_name;
	const phonenum = request.body.Phone_number;
	const dob =request.body.DOB;
	const doctorid = request.body.Doctor_id;

	mongoClient.connect(mongoServerURL, (err, db) => {
		if (err)
			console.log("Cannot connect to Mongo:"+err.message);

		//connect to appointmentdb
		const appointmentdb = db.db("appointmentdb");
		
		const newItem = {Patient_id:Patientid, First_name:firstname, Last_name:lastname, Phone_number: phonenum, DOB: dob,
						Doctor_id:doctorid};
		//insert to appointmentdb patients collection
		appointmentdb.collection("patients").insertOne(newItem, (err, result) => {
			if (err) {
				console.log(err.message);
			}

			if (result.insertedCount == 1) {
				//one way - return response - let client handle it
				//response.end("Item " + firstname + " added successfully!");
				
				//another way - redirect to the all items page - showing item added
				response.redirect("/static/index.html");
			}
			else
				response.end("Name " + First_name + " could not be added!!");

			//response.send(JSON.stringify(newItem));
		});

		//close the connection to the db
		db.close();
	});	
});

//update item - uisng HTTP PUT method
app.put('/patients', (request, response, next) => {
	console.log("in PUT");
	const Patientid = request.body.Patient_id;
	console.log(Patientid);
	const firstname = request.body.First_name;
	const lastname = request.body.Last_name;
	const phonenum = request.body.Phone_number;
	const dob =request.body.DOB;
	const doctorid = request.body.Doctor_id;

	mongoClient.connect(mongoServerURL, (err, db) => {
		if (err)
			console.log("Cannot connect to Mongo:"+err.message);

		//connect to item
		const appointmentdb = db.db("appointmentdb");
		
		//we are updating by the item_name
		const updateFilter = {Phone_number: phonenum};
		
		//insert from appointmentdb patients collection
		appointmentdb.collection("patients").updateOne(updateFilter, (err, res) => {
			if (err) {
				console.log(err.message);
			}

			//console.log("matchcount " + res.matchedCount);
			//console.log("updatecount:" + res.modifiedCount);

			//one way 
			//const responseJSON = {updateCount:res.result.nModified};
			//response.send(JSON.stringify(responseJSON));

			//another way - redirect to all patients page
			response.redirect("/static/index.html");
		});

		//close the connection to the db
		db.close();
	});	
});



//set the route for static HTML files to /static
//actual folder containing HTML files will be public
app.use('/static', express.static('public'));

const port = process.env.PORT;
app.listen(port, ()=> {
	console.log("server listening on " +port);
});
