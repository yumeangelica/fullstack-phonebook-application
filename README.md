# Fullstack Phonebook Application #

#### https://fullstack-phonebook-application.fly.dev/ ####

# What?

This is a fullstack phonebook application. It is a single page application (SPA) that allows the user to add, delete and update phonebook entries. The application is made with React and Node.js with Express.js. The database is MongoDB. Testing is done with Jest. 

The folder structure is as follows:
#### root ####
<pre>
index.html
index.js
client/
server/
...
</pre>

#### client (frontend) ####
<pre>
App.js
index.js
components/
  Filter.js
  FilteredPersonsShow.js
  FilteredPersonsShow.test.js
  Footer.js
  NewPersonForm.js
  NewPersonForm.test.js
  NotificationMessage.js
css/
  App.css
  index.css
services/
  api.js
</pre>

#### server (backend) ####
<pre>
app.js
controllers/
  apiController.js
  indexController.js
middleware/
  corsHeaders.js
  index.js
models/
  personModel.js
utils/
  config.js
</pre>


## root files ##


#### index.html ####

This is the template that will be turned to the html loaded by the browser first. 

#### index.js ####

This is the entrypoint when starting the application.

#### package.json ####

This file contains the dependencies and scripts for the application.

#### webpack.config.js ####

This is the configuration file for webpack. It is used to bundle the application into a single file.

