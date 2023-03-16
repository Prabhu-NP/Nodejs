const { urlencoded } = require('express');
var express = require('express');
const libraries = require("./lib");
var app = express();
var bodyParser = require('body-parser');
var jsonParser = bodyParser.json();
var urlencodedParser = bodyParser.urlencoded({ extended: false});

const PORT = 8081;

// configure the welcome page
app.get('/', function(req, res){
    res.status(200);
    res.send('JIRA SERVER HOMEPAGE');
});

app.post('/Ticket/API/:Jira', jsonParser,function(req, res){
    
    // Step 1 : Show a responce code and message for the webpage
    // the incoming data fro the POST request is mapped as SAP input data
    var sapInputdata = [];

    sapInputdata = req.body;
    // const sapInputdata = require("./new_sampleData.json");
    const credentials = require("./creds.json");
    const auth = require("./jiraAuth.json");

    const jiraUrl = credentials.jira_url;
    const issueEndpoint = credentials.jira_issueEndpoint;

    var arrayLength = sapInputdata.length;

    console.log(arrayLength);

    // creating a Jira target url
    var jiraMainurl = jiraUrl + issueEndpoint;

    // create a for loop for sending an array of sap input data
    for(var i = 0; i < arrayLength; i++){

        var currentSap = sapInputdata[i];

        var severity = "";

        if(currentSap.SEVERITY == "CRITICAL"){
            severity = "Highest";
        }
        else if(currentSap.SEVERITY == "HIGH"){
            severity = "High";
        }
        else if(currentSap.SEVERITY == "MEDIUM"){
            severity = "Medium";
        }
        else if(currentSap.SEVERITY == "LOW"){
            severity = "Low";
        }
        else{
            severity = "Lowest";
        }

        // creating a custom Jira ticket form the SAP dat
        const jira_ticket = libraries.jiraTicket(currentSap, severity);

        console.log(jira_ticket);

        // post the jira ticket
        libraries.jira_postRequest(jira_ticket, jiraMainurl, auth);

        // create the elastic schema entry
        const elastic_ticket = libraries.elasticTicket(currentSap);

        // post the schema to Elastic & Kibana
        libraries.elastic_postrequest(elastic_ticket);
    }

    // // creating a custom Jira ticket form the SAP dat
    // const jira_ticket = libraries.jiraTicket(sapInputdata);

    // // post the jira ticket
    // libraries.jira_postRequest(jira_ticket, jiraMainurl, auth);

    // // create the elastic schema entry
    // const elastic_ticket = libraries.elasticTicket(sapInputdata);

    // // post the schema to Elastic & Kibana
    // libraries.elastic_postrequest(elastic_ticket);

    res.status(200).send('Status: OK')

    return
});

app.get('/webhook/API/:Jira', urlencodedParser, function(req, res){
    // API to receive data from Jira Webhook
    res.status(200);
    res.send('JIRA WEBHOOK HOMEPAGE');

    const issueKey = req.body.issue.key;
    console.log(`Received webhook for issue: ${issueKey}`);
})

var server = app.listen(PORT, function () {
    var host = server.address().address
    var port = server.address().port
    console.log("Example app listening at http://%s:%s", host, port)
 })
