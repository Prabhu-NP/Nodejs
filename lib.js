// Purpose : Develop a Jira ticket from SAP input data
function jiraTicket(sap_data){

    // declare the jira ticket schema
    const jiraSchema = require("./jiraSchema.json");    
    const mapper = require("./jiraMapper.json");
    
    // now perform the data dumping in real time
    // Update the jiraSchema object with SAP data
    jiraSchema.fields.summary = sap_data[mapper.summary];
    jiraSchema.fields.description = sap_data[mapper.description];

    // Optional: Update the issue type
    if (sap_data.issuetype) {
    jiraSchema.fields.issuetype.name = sap_data.issuetype;
    }

    return jiraSchema
}

// Purpose : Create Jira Ticket - A task
function jira_postRequest(requestData, jiraUrl, auth){

    const axios = require('axios');

    const jira_headers = {
        'Content-Type': 'application/json'
    };

    const response = axios.post(jiraUrl,requestData,
        {
          headers: jira_headers,
          auth: {
            username: auth.username,
            password: auth.password
          }
        }
      ).then(function(response){
          console.log('Response:', response.data);
      })
      .catch(function(error){
          console.error('Error:', error);
      });
}

// Purpose : Send an entry to Elasticsearch DB
function elastic_postrequest(requestData){

    const axios = require('axios');

    const creds = require("./creds.json");

    const elastic_url = creds.elastic_url;
    const elastic_index = creds.elastic_index;
    const elastic_type = creds.elastic_type;
    const elastic_tag = requestData.MANDT;

    const mainUrl = elastic_url + elastic_index + elastic_type + elastic_tag;

    const elastic_headers = {
        'Content-Type': 'application/json'
    };

    const response = axios.post(mainUrl,requestData,  
        {
          headers: elastic_headers
        }
      ).then(function(response){
            console.log('Response:', response.data);
        })
        .catch(function(error){
            console.error('Error:', error);
      });
}

// Purpose : To POST using axios module.
function axiosPost(requestData){
    const axios = require('axios');
    // A module to use axios post request and to catch errors also.

    axios.post(requestData).then(function(response){
        console.log('Response:', response.data);
    })
    .catch(function(error){
        console.error('Error:', error);
    });
}

function axiosGet(issueId){
    var options = {
        method: 'GET',
        url: 'http://example.com:8080/rest/api/latest/issue/{issueIdOrKey}', 
        auth: { username: username, password: password },
        headers: {
           'Accept': 'application/json'
        }
     };
     
     request(options, function (error, response, body) {
        if (error) throw new Error(error);
        console.log(
           'Response: ' + response.statusCode + ' ' + response.statusMessage
        );
        console.log(body); //this would log all the info (in json) of the issue 
        // you can use a online json parser to look at this information in a formatted way
     
     });
}

module.exports = { jiraTicket, jira_postRequest, elastic_postrequest }
