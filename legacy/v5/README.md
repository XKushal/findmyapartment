#Stcloud apartments
##Initial Setup
* Add Landing Page
* Add Apartemnts Page that lists all Apartemnts

Each Apartemnts has:
   * Name
   * Image

#Layout and Basic Styling
* Create our header and footer partials
* Add in Bootstrap

#Creating New Apartemnts
* Setup new Apartemnts POST route
* Add in body-parser
* Setup route to show form
* Add basic unstyled form

#Style the Apartemnts page
* Add a better header/title
* Make Apartemnts display in a grid

#Style the Navbar and Form
* Add a navbar to all templates
* Style the new Apartemnts form

#Add Mongoose
* Install and configure Mongoose
* Setup Apartemnts model
* Use Apartemnts model inside of our routes

#Show Page
* Review the RESTful routes we've seen so far
* Add description to our Apartemnts model
* Show db.collection.drop()
* Add a show route/template

#Refactor Mongoose Code
* Create a models directory
* Use module.exports
* Require everything correctly!

#Add Seeds File
* Add a seeds.js file
* Run the seeds file every time the server starts

#Add the Comment model!
* Make our errors go away!
* Display comments on Apartemnts show page




RESTFUL ROUTES

name      url      verb    desc.
===============================================
INDEX   /dogs      GET   Display a list of all dog
NEW     /dogs/new  GET   Displays form to make a new dog
CREATE  /dogs      POST  Add new dog to DB
SHOW    /dogs/:id  GET   Shows info about one dog
