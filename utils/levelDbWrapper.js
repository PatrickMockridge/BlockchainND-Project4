/* ===== Persist data with LevelDB ===================================
|  Learn more: level: https://github.com/Level/level     |
|  =============================================================*/
const chainDB = './chaindata';
const level = require('level');
const db = level(chainDB);


module.exports = class levelWrapper{
    constructor(){
        console.log("level db is constructing");
    }
    async put(k, v){
        return await db.put(k, v);
    }

    async get(k, v){
        return await db.get(k);
    }

    async getNumKeys(){
        let height = 0;
        return await new Promise(function(res, rej){
            db.createReadStream().on('data', function(data){
              height++;
            }).on('end', function(){
              res(height);
            });
        });
    }

    async getBlockByHash(hash){
        let block = undefined;
        return new Promise(function(res, rej){
           db.createReadStream()
           .on('data', function (data) {
               data.value = JSON.parse(data.value);
               if(data.value.hash === hash){
                   block = data.value;
               }
           })
           .on('error', function (err) {
               rej(err)
           })
           .on('close', function () {
               if(block === undefined){
                   rej(new NotFoundError("Can't find block with hash: " + hash));
               }
               else{
                   res(block);
               }
           });
       });
    }

    async getBlockByAddress(address){
        let blocks = [];
        return new Promise(function(res, rej){
            db.createReadStream()
            .on('data', function (data) {
                data.value = JSON.parse(data.value);
                if(data.value.body.address === address){
                    blocks.push(data.value);
                }
            })
            .on('error', function (err) {
                rej(err)
            })
            .on('close', function () {
                if(blocks.length === 0){
                    rej(new NotFoundError("Can't find block with address: " + address));
                }
                else{
                    res(blocks);
                }
            });
        });
    }

    async printDb(){
        console.log("Start printing");
        return new Promise(function(res, rej){
            db.createReadStream().on('data', console.log).on('end', function(){
                console.log("Done printing");
                res();
            });
        });
    }
}
