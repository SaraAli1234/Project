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
//const mongoServerURL = "mongodb://user1:user1@ds245218.mlab.com:45218/itemdb";

//default route / - display all patients
app.get('/', (request, response, next) => {
	mongoClient.connect(mongoServerURL, (err, db) => {
		if (err)
			console.log("Cannot connect to Mongo:"+err.message);

		//connect to patients
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

//get one patients by name - used in update and delete web pages
app.get('/patients/:First_name', (request, response, next) => {

	const First_name = request.params.First_name;

	mongoClient.connect(mongoServerURL, (err, db) => {
		if (err)
			console.log("Cannot connect to Mongo:"+err.message);

		//connect to item
		const appointmentdb = db.db("appointmentdb");

		console.log(First_name);
		//build the query filter
		let query = {name:First_name};

		//read from appointmentdb patients collection
		appointmentdb.collection("patients").find(query).toArray((err, itemsArray) => {
			if (err)
				console.log(err.message);

			response.send(JSON.stringify(itemsArray));
		});

		//close the connection to the db
		db.close();
	});

});


//add a new item - using HTTP POST method
app.post('/patients', (request, response, next) => {
	//access the form fields by the same names as in the HTML form
	const Patientid = request.body.Patientid;
	console.log(Patientid);
	const firstname = request.body.firstname;
	const lastname = request.body.lastname;
	const phonenum = request.body.phonenum;
	let doctorid = request.body.doctorid;
	//convert price to number
	doctorid = parseFloat(doctorid);

	mongoClient.connect(mongoServerURL, (err, db) => {
		if (err)
			console.log("Cannot connect to Mongo:"+err.message);

		//connect to appointmentdb
		const appointmentdb = db.db("appointmentdb");
		
		const newItem = {Patient_id:Patientid, First_name:firstname, Last_name:lastname, Phone_number: phonenum, DOB: dob,
						Doctor_id:doctorid};
						
		//insert to appointmentdb items collection
		appointmentdb.collection("patients").insertOne(newItem, (err, result) => {
			if (err) {
				console.log(err.message);
			}

			if (result.insertedCount == 1) {
				//one way - return response - let client handle it
				//response.end("Item " + itemName + " added successfully!");
				
				//another way - redirect to the all patients page - showing item added
				response.redirect("/static/index.html");
			}
			else
				response.end("Item " + firstname + " could not be added!!");

			//response.send(JSON.stringify(newItem));
		});

		//close the connection to the db
		db.close();
	});	
});

//update item - uisng HTTP PUT method
app.put('/patients', (request, response, next) => {
	console.log("in PUT");
	const firstname = request.param('firstname');
	const lastname = request.body.lastname;
	const phonenum = request.body.phonenum;
	let doctorid = request.body.doctorid;
	//convert price to number
	doctorid = parseFloat(doctorid);

	mongoClient.connect(mongoServerURL, (err, db) => {
		if (err)
			console.log("Cannot connect to Mongo:"+err.message);

		//connect to item
		const appointmentdb = db.db("appointmentdb");
		
		//we are updating by the item_name
		const updateFilter = {First_name:firstname};
		const updateValues = {$set:{category:itemCategory, description:itemDescription,
						price:itemPrice}};
		//insert from appointmentdb patients collection
		appointmentdb.collection("patients").updateOne(updateFilter, updateValues, (err, res) => {
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

//delete patients by patients name
app.delete('/patients', (request, response, next) => {
	const itemName = request.param('itemName');

	mongoClient.connect(mongoServerURL, (err, db) => {
		if (err)
			console.log("Cannot connect to Mongo:"+err.message);

		//connect to patients
		const appointmentdb = db.db("appointmentdb");
		
		//we are deleting by the item_name
		const deleteFilter = {item_name:itemName};

		//insert from appointmentdb items collection
		appointmentdb.collection("items").deleteOne(deleteFilter, (err, res) => {
			if (err) {
				console.log(err.message);
			}

			//const responseJSON = {deleteCount:res.result.n}; //n - how many docs deleted
			//response.send(JSON.stringify(responseJSON));

			if (res.deletedCount > 0) {
				response.redirect("/static/index.html");
			}
			else {
				response.send("<script>alert(\"deleted \" +itemName);</script>");
			}
		});

		//close the connection to the db
		db.close();
	});	
});


//set the route for static HTML files to /static
//actual folder containing HTML files will be public
app.use('/static', express.static('public'));

//start the web server
const port = process.eny.PORT;
app.listen(port, ()=> {
	console.log("server listening on "+port);
});

