const express = require('express');
const mongoClient = require('mongodb').MongoClient;

const app = express();
const mongoServerURL = "mongodb://localhost:27017/";

//default route - display all patients
app.get('/', (request, response) => {
    mongoClient.connect(mongoServerURL, (err, db) => {
        if (err)
            console.log("DB Connect Error:" +err.message);

        //connect to the Appointmentdb
        const appointmentdb = db.db("appointmentdb");

        //read from the patients collections
        appointmentdb.collection("patients").find({}).toArray((err, itemDocsArray) => {
            if (err)
                console.log(err.message);

            response.send(JSON.stringify(itemDocsArray));
        }); 

        //close the connection to the db
        db.close();
    });
});



//listen for request on port 7878
app.listen(7878, () => {
    console.log("server listening on 7878");
});

