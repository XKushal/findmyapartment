**STCLOUDAPTS**

**Initial Setup**
```
* Add Landing Page
* Add Apartment Page that lists all apartments
```

**Each Apartment has:**
```
   * Name
   * Image
```

**Layout and Basic Styling**
```
* Create our header and footer partials
* Add in Bootstrap
```

**Creating New Apartment**
```
* Setup new apartment POST route
* Add in body-parser
* Setup route to show form
* Add basic unstyled form
```

**Style the apartment page**
```
* Add a better header/title
* Make apartment display in a grid
```

**Style the Navbar and Form**
```
* Add a navbar to all templates
* Style the new apartment form
```

**Add Mongoose**
```
* Install and configure Mongoose
* Setup apartment model
* Use campground model inside of our routes
```

**Show Page**
```
* following the same routings
* Add description to our apartment model
* Show db.collection.drop()
* Add a show route/template
```

**Refactor Mongoose Code**
```
* Create a models directory
* Use module.exports
* Require everything correctly!
```

**Add Seeds File**
```
* Add a seeds.js file
* Run the seeds file every time the server starts
```

**Add the Comment model!**
```
* Make our errors go away!
* Display comments on apartment show page
```


**RESTFUL ROUTES**
```

name      url      verb    desc.
===============================================
INDEX   /dogs      GET   Display a list of all dog
NEW     /dogs/new  GET   Displays form to make a new dog
CREATE  /dogs      POST  Add new dog to DB
SHOW    /dogs/:id  GET   Shows info about one dog
```
