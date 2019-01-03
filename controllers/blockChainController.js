const Blockchain = require('../blockchain/blockchain');
const bitcoinMessage = require('bitcoinjs-message');
const hex2ascii = require('hex2ascii');
const TimeoutRequestsWindowTime = 5*60*1000;

/**
 * Controller Definition to encapsulate routes to work with blocks
 */
class blockChainController {
    /**
     * Constructor creates a new BlockController in which endpoints are initilialised
     * @param {*} app
     */

    constructor(app){
        this.app = app;
        this.memPool = {};
        this.clearTimeoutPool = {};
    }

    /**
     * Mempool format:
     * {
     *     address1 :
     *     {
     *         "address" : "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
     *         "walletValidated" : true,
     *         "requestTime" : 0000000000,
     *         "timeLeft" : 00000110
     *     }
     *     address2 :
     *     {
     *         ......
     *     }
     *     ......
     * }
     */

    async initialise() {
        this.blockchain = new Blockchain();
        await this.blockchain.initialise();
        this.requestValidation();
        this.validate();
        this.registerStar();
        this.lookUpByHash();
        this.lookUpByWalletAddress();
        this.lookUpByHeight();
    }

    removeValidationRequest(address){
        delete this.memPool[address];
        delete this.clearTimeoutPool[address];
    }

    requestValidation(){
        this.app.post("/requestValidation", (request, response) => {

            let address = request.body.address;
            //Request body's address is already contained within the mempool
            if(this.memPool[address]){
                let memPoolObject = this.memPool[address];
                let currentTime =  new Date().getTime().toString().slice(0,-3);
                let timeElapse = currentTime - memPoolObject.requestTime;
                let timeLeft = TimeoutRequestsWindowTime / 1000 - timeElapse;

                memPoolObject.timeLeft = timeLeft;
                response.status(200).json({
                    "walletAddress" : memPoolObject.address,
                    "requestTimeStamp" : memPoolObject.requestTime,
                    "message" : memPoolObject.address + ":" + memPoolObject.requestTime + ":starRegistry",
                    "validationWindow" : memPoolObject.timeLeft
                });
                return;
            }

            let memPoolObject = {};
            let currentTime = new Date().getTime().toString().slice(0, -3);
            memPoolObject.address = address;
            memPoolObject.walletValidated = false;
            memPoolObject.requestTime = currentTime;
            memPoolObject.timeLeft = TimeoutRequestsWindowTime / 1000;
            this.memPool[address] = memPoolObject;
            this.clearTimeoutPool[address] = setTimeout(() => {
                this.removeValidationRequest(address);
            }, TimeoutRequestsWindowTime);
            response.status(200).json({
                "walletAddress" : memPoolObject.address,
                "requestTimeStamp" : memPoolObject.requestTime,
                "message" : memPoolObject.address + ":" + memPoolObject.requestTime + ":starRegistry",
                "validationWindow" : memPoolObject.timeLeft
            });
            return;
        });
    }

    validate(){
        this.app.post("/message-signature/validate", (request, response) => {
            //-----Check this
            let address = request.body.address;
            let signature = request.body.signature;
            //Check if this address is already in the mempool
            if(!this.memPool[address]){
                console.log("the wallet address is not contained within the mempool or has timed out, please requestValidation instead");
                response.status(400).send("the wallet address not contained within the mempool or has timed out, please requestValidation instead");
                return;
            }
            let memPoolObject = this.memPool[address];
            let requestTimeStamp = memPoolObject.requestTime;
            let message = address + ":" + requestTimeStamp + ":starRegistry";
            let verifyResult = bitcoinMessage.verify(message, address, signature);
            if(!verifyResult){
                console.log("Could not verify identity");
                response.status(400).send("Could not verify identity");
                return;
            }

            let currentTime = new Date().getTime().toString().slice(0,-3);
            let timeElapsed = currentTime - memPoolObject.requestTime;
            let timeLeft = TimeoutRequestsWindowTime / 1000 - timeElapsed;
            memPoolObject.timeLeft = timeLeft;

            response.status(200).json({
                "registerStar" : true,
                "status" : {
                    "address" : address,
                    "requestTimeStamp" : requestTimeStamp,
                    "message" : message,
                    "validationWindow" : memPoolObject.timeLeft,
                    "messageSignature" : true
                }
            });
            memPoolObject.walletValidated = true;
            return;
        });

    }

    registerStar(){
        this.app.post("/block", async (request, response) => {
            let address = request.body.address;
            //Check if the address is already stored in the mempool
            if(!this.memPool[address]){
                console.log("the wallet address is not in the mempool or has timed out, please requestValidation");
                response.status(400).send("the wallet address not in the mempool or has timed out, please requestValidation");
                return;
            }
            //Check if the address is validated by bitcoin wallet
            if(!this.memPool[address].walletValidated){
                console.log("the wallet address is not validated with bitcoin wallet, use /message-signature/validate endpoint to validate");
                response.status(400).send("the wallet address is not validated with bitcoin wallet, use /message-signature/validate endpoint to validate");
                return;
            }

            let star = request.body.star;
            let story = star.story;
            let storyBuffer = Buffer.from(story, "utf8");
            let hexEncodedStory = storyBuffer.toString("hex");
            let body = {
                "address" : address,
                "star" : {
                    "ra" : star["ra"],
                    "dec" : star["dec"],
                    "mag" : star["mag"],
                    "cen" : star["cen"],
                    "story" : hexEncodedStory
                }
            }
            try{
                console.log("Adding block to the blockchain");
                let newBlock = await this.blockchain.addBlockObject(body);
                //newBlock.body.star.storyDecoded = hex2ascii(newBlock.body.star.story);
                console.log("In controller 2, after adding new block and new block is: ");
                console.log(newBlock);
                response.status(200).json(newBlock);
                delete this.memPool[address];
            }
            catch(err){
                console.log("Error occurs while adding block with message");
                console.log(body);
                response.status(400).send("Error occurs while adding block with message: " + body);
            }
            return;
        });

    }

    lookUpByHash(){
        this.app.get("/stars/hash:hashValue", async (request, response) => {
            // Add your code here
            let blockHash = request.params.hashValue.slice(1);
            try{
                let resultBlock = await this.blockchain.getBlockByHash(blockHash);
                resultBlock.body.star.storyDecoded = hex2ascii(resultBlock.body.star.story);
                response.send(resultBlock);
            }
            catch(err){
                if(err.type == 'NotFoundError'){
                    console.log('Cannot find the block with hash: ' + blockHash);
                    response.status(400).send("Cannot find the block with hash: " + blockHash);
                }
                else{
                    console.log("Bad request");
                    response.status(400).send("Bad request");
                }
            }
        });
    }

    lookUpByWalletAddress(){
        this.app.get("/stars/address:addr", async (request, response) => {
            // Add your code here
            let address = request.params.addr.slice(1);
            try{
                let resultBlocks = await this.blockchain.getBlockByAddress(address);
                for(let blockIndex in resultBlocks){
                    resultBlocks[blockIndex].body.star.storyDecoded = hex2ascii(resultBlocks[blockIndex].body.star.story);
                }
                response.send(resultBlocks);
            }
            catch(err){
                if(err.type == 'NotFoundError'){
                    console.log('Cannot find any block with wallet address: ' + address);
                    response.status(400).send('Cannot find any block with wallet address: ' + address);
                }
                else{
                    console.log("Bad request");
                    response.status(400).send("Bad request");
                }
            }
        });
    }

    lookUpByHeight(){
        this.app.get("/block/:height", async (request, response) => {
            // Add your code here
            let blockIndex = request.params.height;
            try{
                let resultBlock = await this.blockchain.getBlock(blockIndex);
                resultBlock = JSON.parse(resultBlock);
                resultBlock.body.star.storyDecoded = hex2ascii(resultBlock.body.star.story);
                response.send(resultBlock);
            }
            catch(err){
                if(err.type == 'NotFoundError'){
                    console.log('Cannot find block with height: ' + blockIndex);
                    response.status(400).send('Cannot find block with height: ' + blockIndex);
                }
                else{
                    console.log("Bad request");
                    response.status(400).send("Bad request");
                }
            }
        });
    }
}

/**
 * Exporting the BlockController class
 * @param {*} app
 */
module.exports = (app) => { return new blockChainController(app);}
