/* ===== SHA256 with Crypto-js ===============================
|  Learn more: Crypto-js: https://github.com/brix/crypto-js  |
|  =========================================================*/
const SHA256 = require('crypto-js/sha256');

const Block = require('./block');

const Level = require('../utils/levelDbWrapper');


let level = new Level();

module.exports = class Blockchain{
  //Initialise blockchain
  async initialise(){
    console.log("Initialising blockchain");

    let height = await this.getBlockHeight();
    if(height == -1){
      console.log("Generating genesis block");
      await this.addBlock(new Block("Chancellor on Brink of Second Bailout for Banks"));
      console.log("Genesis block generated");
    }
    console.log("Blockchain generated");
  }

  // Add new block from string
  async addBlockObject(object){
    let newBlock = new Block(object);
    newBlock = await this.addBlock(newBlock);
    return newBlock;
  }

  // Add a new block
  async addBlock(newBlock){
    let currentBlockHeight = await this.getBlockHeight();

    // Check if the Genesis block exists, if not, create a Genesis Block
    if(currentBlockHeight == -1 && newBlock.body == "Chancellor on Brink of Second Bailout for Banks"){
      let newBlock = new Block("Chancellor on Brink of Second Bailout for Banks");
      newBlock.previousBlockHash = "";
      newBlock.height = 0;
      newBlock.time = new Date().getTime().toString().slice(0,-3);
      newBlock.hash = SHA256(JSON.stringify(newBlock)).toString();
      return await level.put(newBlock.height, JSON.stringify(newBlock));
    }
    else if(currentBlockHeight == -1 && newBlock.body != "Chancellor on Brink of Second Bailout for Banks"){
      await this.addBlock(new Block("Chancellor on Brink of Second Bailout for Banks"));
      currentBlockHeight = 0;
    }

    // Get the last block's height and block itself
    let currentBlock = JSON.parse(await this.getBlock(currentBlockHeight));
    newBlock.height = currentBlockHeight + 1;
    // UTC timestam
    newBlock.time = new Date().getTime().toString().slice(0,-3);
    // previous block hash
    newBlock.previousBlockHash = currentBlock.hash;
    // Block hash with SHA256 using newBlock and converting to a string
    newBlock.hash = SHA256(JSON.stringify(newBlock)).toString();

    // Add the block object to the chain
    await level.put(newBlock.height, JSON.stringify(newBlock));
    console.log("New block added");
    return newBlock;
  }

  // Get block height
  async getBlockHeight(){
    //The index of the last key is what we wanted, so we -1 here
    return await level.getNumKeys() - 1;
  }

  async getBlock(key){
    return await level.get(key);
  }

  async getBlockByHash(hash){
    return await level.getBlockByHash(hash);
  }

  async getBlockByAddress(address){
    return await level.getBlockByAddress(address);
  }

  // validate block
  async validateBlock(blockHeight){
    // get block object
    let block = JSON.parse(await this.getBlock(blockHeight));
    // get block hash
    let blockHash = block.hash;
    // remove block hash to test block integrity
    block.hash = '';
    // generate block hash
    let validBlockHash = SHA256(JSON.stringify(block)).toString();
    // Compare
    if (blockHash===validBlockHash) {
        return true;
      } else {
        console.log('Block #'+blockHeight+' invalid hash:\n'+blockHash+'<>'+validBlockHash);
        return false;
      }
  }

  // Validation of the blockchain
  async validateChain(){
    let height = await this.getBlockHeight();
    let errorLog = [];
    for (var i = 0; i < height; i++) {
      // validation of the block
      let validateBlockResult = await this.validateBlock(i);
      if (!validateBlockResult){
        errorLog.push(i);
      }
      // validate hash linking between blocks
      let block = JSON.parse(await this.getBlock(i));
      let blockHash = block.hash;
      let nextBlock = JSON.parse(await this.getBlock(i+1));
      let nextBlockPreviousHash = nextBlock.previousBlockHash;
      if (blockHash !== nextBlockPreviousHash) {
        errorLog.push(i);
      }
    }
    //Validate last block
    let validateBlockResult = JSON.parse(await this.validateBlock(height));
    if (!validateBlockResult){
      errorLog.push(i);
    }

    if (errorLog.length>0) {
      console.log('Block errors = ' + errorLog.length);
      console.log('Blocks: '+ errorLog);
      return false;
    }
    else {
      console.log('No errors detected');
      return true;
    }
  }
  /*
  //Error for testing
  async updateBlock(index, value){
    let block = JSON.parse(await this.getBlock(index));
    block.body = value;
    await level.put(index, JSON.stringify(block));
    console.log("updated block " + index + " to ");
    console.log(block);
  }

  async printBlockChain(){
    console.log("Printing blockchain");
    await level.printDb();
  }
  */
}
