var express = require('express');

var buyPaperRouter = express.Router();

var Web3 = require('web3');
var Contract = require('truffle-contract');
var path = require('path');
var provider = new Web3.providers.HttpProvider("http://localhost:8545");

var ContractJSON = require(path.join(__dirname, '../../../ReviewMe/build/contracts/SARAToken.json'));
var SATContract = Contract(ContractJSON);
SATContract.setProvider(provider);

var MainContractJSON = require(path.join(__dirname, '../../../ReviewMe/build/contracts/MainContract.json'));
var MainContract = Contract(MainContractJSON);
MainContract.setProvider(provider);


var bp_router = function(web3) {
    buyPaperRouter.route("/")
        .post(function(req, res) {
            if (!req.user) {
                res.redirect('/');
            } else {
                MainContract.deployed().then(function(instance) {
                    var x = web3.personal.unlockAccount(web3.eth.accounts[0], "123456");
                    instance.getAuthor(req.body.data).then(function(author) {

                        console.log("Ownership to be changed of: " + req.body.data + " to: " + req.user.address + " from: " + author);

                        instance.changeOwnership(req.user.address.toLowerCase(), req.body.data, { from: web3.eth.accounts[0], gas: 200000 }).then(function(success) {

                            instance.getRating(req.body.data).then(function(rating) {

                                SATContract.deployed().then(function(SARAinstance) {

                                    console.log("Tokens to be transferred from: " + req.user.address + " to: " + author);
                                    var x = web3.personal.unlockAccount(req.user.address, req.user.pwd);
                                    return SARAinstance.transfer(author, 50 + rating * 5 - 10, { from: req.user.address, gas: 200000 }).then(function(transferSuccess1) {
                                        console.log("Author rewarded successfully!");
                                        return SARAinstance.transfer(web3.eth.accounts[0], 10, { from: req.user.address, gas: 200000 }).then(function(transferSuccess2) {
                                            console.log("Fees deducted successfully!");

                                        }).catch(function(err) {
                                            console.log("Token transfer unsuccessful: ", err);
                                            
                                    });;

                                    }).catch(function(err) {
                                        console.log("Token transfer unsuccessful: ", err);

                                    });
                                
                                }).catch(function(err) {
                                    console.log("Error in gettin SARAToken Contract instance: ", err);

                                })
                            }).catch(function(err) {
                                console.log("Error in getting rating: ", err);
 
                            });
                        }).catch(function(err) {
                            console.log("Error in changing Ownership: ", err);
 
                        });
                    }).catch(function(err) {
                        console.log("Error in getting Author: ", err);
 
                    });
                });
            }
        });


    return buyPaperRouter;
}
module.exports = bp_router;