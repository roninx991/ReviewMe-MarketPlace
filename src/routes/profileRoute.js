var express = require('express');
var mongodb = require('mongodb').MongoClient;
var profileRouter = express.Router();

var Web3 = require('web3');
var Contract = require('truffle-contract');
var path = require('path');
var ContractJSON = require(path.join(__dirname, '../../../ReviewMe/build/contracts/SARAToken.json'));
var provider = new Web3.providers.HttpProvider("http://localhost:8545");

var SATContract = Contract(ContractJSON);
SATContract.setProvider(provider);

var MainContractJSON = require(path.join(__dirname, '../../../ReviewMe/build/contracts/MainContract.json'));
var MainContract = Contract(MainContractJSON);
MainContract.setProvider(provider);


var menu = [{
        href: '/buyTokens',
        text: 'Buy SATs'
    },
    {
        href: '/sellTokens',
        text: 'Sell SATs'
    },
];

var p_router = function() {
    profileRouter.route("/")
        .all(function(req, res, next) {
            if (!req.user) {
                res.redirect('/');
            } else {

                var bal = 0;
                SATContract.deployed().then(function(instance) {
                    return instance.balanceOf.call(req.user.address);

                }).then(function(result) {
                    console.log("Balance is: ", result.toString());
                    bal = result.toString();

                }, function(error) {
                    console.log(error);
                });

                var count = 0;
                var ans = new Array();
                var ans1 = new Array();
                const url = 'mongodb://localhost:27017';


                mongodb.connect(url, { useNewUrlParser: true }, function(err, client) {
                    const db = client.db('NodeDemoWebApp');
                    const Submissions = db.collection('Submissions');
                    const Reviews = db.collection('Reviews');

                    var review, review_content;

                    MainContract.deployed().then(function(contractInstance) {
                        contractInstance.displayDocCount().then(function(count) {
                            count = parseInt(count);

                            if (count > 0) {
                                for (var i = 0; i < count; i++) {
                                    contractInstance.displayHash(i).then(function(h) {
                                        var hash = h;
                                        contractInstance.isReviewed(hash).then(function(truth) {
                                            if (truth) {
                                                contractInstance.isOwner(req.user.address, hash).then(function(answer) {
                                                    console.log("User is Owner: ", answer);
                                                    if (answer) {
                                                        contractInstance.displaySubmissionStatus(hash).then(function(stat) {
                                                            var s = {};
                                                            if (stat == 2) {
                                                                s.h = hash;

                                                                contractInstance.getRating(hash).then(function(rating) {
                                                                    console.log("Rating of " + hash +" is: ", rating);
                                                                    s.rating = parseInt(rating);

                                                                }).catch(function(err) {
                                                                    console.log("Error in getting Rating: ", err);
                                                                });

                                                                Submissions.find({ "hash": hash }).toArray(function(err, accepted) {
                                                                    if (err == undefined) {
                                                                        s.timestamp = accepted[0].timestamp;
                                                                        s.domain = accepted[0].domain;
                                                                    }

                                                                });

                                                                Reviews.find({ "hash": hash }).toArray(function(err, acceptreject) {
                                                                    if (err == undefined) {
                                                                        s.reviews = acceptreject;
                                                                    }

                                                                });
                                                                ans.push(s);
                                                            }
                                                        });
                                                    } else {
                                                        contractInstance.displaySubmissionStatus(hash).then(function(stat) {
                                                            var s = {};
                                                            if (stat == 2) {
                                                                s.h = hash;

                                                                contractInstance.getRating(hash).then(function(rating) {
                                                                    console.log("Rating of " + hash +" is: ", rating);
                                                                    s.rating = parseInt(rating);

                                                                }).catch(function(err) {
                                                                    console.log("Error in getting Rating: ", err);
                                                                });
                                                                Submissions.find({ "hash": hash }).toArray(function(err, accepted) {
                                                                    if (err == undefined) {
                                                                        s.timestamp = accepted[0].timestamp;
                                                                        s.domain = accepted[0].domain;
                                                                    }

                                                                });

                                                                Reviews.find({ "hash": hash }).toArray(function(err, acceptreject) {
                                                                    if (err == undefined) {
                                                                        s.reviews = acceptreject;
                                                                    }

                                                                });

                                                               ans1.push(s);
                                                            }
                                                        });
                                                    }
                                                });
                                            } 
                                        });
                                    });
                                }
                            }
                        }).catch(function(e) {
                            console.log("Error: ", e);
                        });
                        setTimeout(function() {
                            res.render('profile', {
                                title: "The MarketPlace",
                                navMenu: menu,
                                user: req.user,
                                sub1: ans,
                                sub2: ans1,
                                balance: bal
                            });
                        }, 3000);

                    });
                });
            }
        });


    return profileRouter;
}
module.exports = p_router;