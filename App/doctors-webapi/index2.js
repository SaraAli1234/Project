
const express = require('express');
const mongoClient = require('mongodb').MongoClient;

const app = express();
const mongoServerURL = "mongodb://localhost:27017/";

//default route - display all doctor's Dentist
app.get('/Dentist', (request, response) => {
    mongoClient.connect(mongoServerURL, (err, db) => {
        if (err)
            console.log("Cannot connect to Mongo:"+err.message);

        //connect to appointmentdb
        const appointmentdb = db.db("appointmentdb");

        //read from appointmentdb doctors collection
        appointmentdb.collection("doctors").find({Specializtion:"Dentist"}).toArray((err, itemsArray) => {
            if (err)
                console.log(err.message);

            response.send(JSON.stringify(itemsArray));
        });

        //close the connection to the db
        db.close();
    });
});


//listen for request on port 7878
app.listen(7878, () => {
    console.log("server listening on 7878");
});
