var express = require ('express');
var router = express.Router ();

router.get ('/', function (req, res){
    console.log ('Get /user');
    res.send ('List of all users');
});

router.get ('/:id', function (req, res) {
    console.log ('Get /users/:id');
    res.send ('User id:', req.params.id);
});

module.exports = router;