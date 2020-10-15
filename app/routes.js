module.exports = function (app, passport, db) {

  const ObjectId = require('mongodb').ObjectID
  const multer = require('multer')

  // Image Upload Code =========================================================================
  // Make a Var for the storing of imgs => multer.(multer Method?)
  var storage = multer.diskStorage({
      destination: (req, file, cb) => {    // cb = filepath
        cb(null, 'public/images/uploads')
      },
      filename: (req, file, cb) => {
        cb(null, file.fieldname + '-' + Date.now() + ".png")  // cb filepath and timestamp with date and filetype
      }

  });
  // alert("Image successfully uploaded")
  var upload = multer({storage: storage}); //upload img to destination 'storage'


  // normal routes ===============================================================

  // show the home page (will also have our login links)
  app.get('/', function (req, res) {
    res.render('index.ejs');
  });
  app.get('/index', function (req, res) {
    res.render('index.ejs');
  });

  app.get('/post-item', function (req, res) {
    res.render('post-item.ejs');
  })

  app.get('/post-job', function (req, res) {
    res.render('post-job.ejs');
  })
  app.get('/contact', function (req, res) {
    res.render('contact.ejs');
  })

  app.get('/about', function (req, res) {
    res.render('about.ejs');
  })

  app.get('/dashboard', function (req, res) {
      res.render('dashboard.ejs');
  })

  app.get('/your-item', function (req, res) {
    console.log(req.session.passport.user)
    let uid = ObjectId(req.session.passport.user)
    db.collection('donatedItem').find({posterID: uid}).toArray((err, result) => {  //Find all posts then turn to array
    //   if (err) return console.log(err)
    // console.log(result)
      res.render('unique-listings.ejs',{
        Listings: result
      })
    })
  })

  app.get('/item-listings', function (req, res) {
    db.collection('donatedItem').find().toArray((err, result) => {  //Find all posts then turn to array
    //   if (err) return console.log(err)
    // console.log(result)
      res.render('item-listings.ejs',{
        Listings: result
      })
    })
  })

  app.get('/jobs-listings', function (req, res) {
    db.collection('jobs').find().toArray((err, result) => {  //Find all posts then turn to array
    //   if (err) return console.log(err)
    // console.log(result)
      res.render('jobs-listings.ejs',{
        Jobs: result
      })
    })
  })

  app.get('/searchItems', function (req, res) { //search my mongodb

    var q = req.query.q; //example q = "Me"
      db.collection('donatedItem').find({
        itemTitle: q
      }).toArray((err, result) => {
        res.render('searchItems.ejs',{
            Listings: result
        })
      })
  })

  app.get('/job-single', function (req, res) {
    const id = req.query.id
    console.log("job id:", id)

    db.collection('donatedItem').findOne({
      _id: ObjectId(id)
    },
    (err, result) => {  //Find all posts then turn to array

    res.render('job-single.ejs', {
        Listing: result
      });
    })
  })

  app.get('/services', function (req, res) {
    res.render('services.ejs');
  })

  app.get('/testimonials', function (req, res) {
    res.render('testimonials.ejs');
  })

  app.post('/shelter', function(req, res) { //GETTING SHELTER
    let city = req.body.city.substr(0,1).toUpperCase() + req.body.city.substr(1).toLowerCase() 
    console.log(req.body.city, "this is city")
    db.collection('shelters').find({city:city}).toArray((err, result) => {  //Find all posts then turn to array
    if (err) return console.log(err)
    console.log(result, "This is results")
      res.render('shelter-listings.ejs', {
      shelters : result
      })
    })
  })


  // PROFILE SECTION =========================
  app.get('/profile', isLoggedIn, function (req, res) {
    db.collection('messages').find().toArray((err, result) => {
      if (err) return console.log(err)
      res.render('profile.ejs', {
        user: req.user,
        messages: result
      })
    })
  });

  // LOGOUT ==============================
  app.get('/logout', function (req, res) {
    req.logout();
    res.redirect('/');
  });

  // message board routes ===============================================================

  //donate an item - profile ejs
  app.post('/listings', isLoggedIn, upload.single("file-to-upload"), (req, res) => {
    console.log(req.file.filename)
    let uid = ObjectId(req.session.passport.user)
    db.collection('donatedItem').save({posterID: uid, image: 'images/uploads/' + req.file.filename, email: req.body.Email, itemTitle: req.body.ItemTitle, itemlocation: req.body.ItemLocation, itemvalue: req.body.ItemValue, itemdescription: req.body.ItemDescription, claimedBy: null, Date: new Date()}, (err, result) => {
          if (err) return res.send(err)
          // res.send(result)
          res.redirect('/item-listings');
          // res.render('post-job.ejs')
    })
  })

  //post a job - post-job.ejs
  app.post('/jobListings', isLoggedIn, upload.single("file-to-upload"), (req, res) => {
    console.log()
    let uid = ObjectId(req.session.passport.user)
    db.collection('jobs').save({posterID: uid, email: req.body.Email, jobTitle: req.body.jobTitle, jobLocation: req.body.jobLocation, jobDescription: req.body.jobDescription, Date: new Date()}, (err, result) => {
          if (err) return res.send(err)
          // res.send(result)
          res.redirect('/jobs-listings');
          // res.render('post-job.ejs')
    })
  })

  //update ============================================
  app.post('/claimed:id', isLoggedIn, (req, res) => { // : includes
    let uid = ObjectId(req.session.passport.user)
    console.log(req.params.id)
    db.collection('donatedItem').findOneAndUpdate({_id: ObjectId(req.params.id)}, {
      $set: {
      claimedBy: uid
      }
    }, (err, result) => {
      if (err) return res.send(err)
      db.collection('donatedItem').find({posterID: uid}).toArray((err, result) => {
        if (err) return res.send(err)
        res.render('claimedItems.ejs', {
          Listings: result
        })
        console.log(result)
      })
    })
  })


  // =============================================================================
  // AUTHENTICATE (FIRST LOGIN) ==================================================
  // =============================================================================

  // locally --------------------------------
  // LOGIN ===============================
  // show the login form
  app.get('/login', function (req, res) {
    res.render('login.ejs', { message: req.flash('loginMessage') });
  });

  // process the login form
  app.post('/login', passport.authenticate('local-login', {
    successRedirect: '/profile', // redirect to the secure profile section
    failureRedirect: '/login', // redirect back to the signup page if there is an error
    failureFlash: true // allow flash messages
  }));

  // SIGNUP =================================
  // show the signup form
  app.get('/signup', function (req, res) {
    res.render('signup.ejs', { message: req.flash('signupMessage') });
  });

  // process the signup form
  app.post('/signup', passport.authenticate('local-signup', {
    successRedirect: '/profile', // redirect to the secure profile section
    failureRedirect: '/signup', // redirect back to the signup page if there is an error
    failureFlash: true // allow flash messages
  }));

  // =============================================================================
  // UNLINK ACCOUNTS =============================================================
  // =============================================================================
  // used to unlink accounts. for social accounts, just remove the token
  // for local account, remove email and password
  // user account will stay active in case they want to reconnect in the future

  // local -----------------------------------
  app.get('/unlink/local', isLoggedIn, function (req, res) {
    var user = req.user;
    user.local.email = undefined;
    user.local.password = undefined;
    user.save(function (err) {
      res.redirect('/profile');
    });
  });

};

// route middleware to ensure user is logged in
function isLoggedIn(req, res, next) {
  if (req.isAuthenticated())
    return next();

  res.redirect('/');
}
