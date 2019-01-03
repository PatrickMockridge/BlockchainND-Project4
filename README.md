### About
This project demonstrates a simple Star Notary Service using NodeJS, Express and LevelDB. This project was completed to fulfil the requirements of Project 4 of the [Udacity Blockchain Developer Nanodegree](https://eu.udacity.com/course/blockchain-developer-nanodegree--nd1309).

### Requirements
* [Yarn: 1.12.3](https://yarnpkg.org)
* [express](https://www.express.com)
* [LevelDB](http://https://github.com/google/leveldb)

## Usage

### Installation

## Run App

```sh
git clone https://github.com/PatrickMockridge/BlockchainND-Project4.git
cd BlockchainND-Project4
yarn install
```

This installs the Node dependencies of the project.

### Start API server
```sh
yarn start
```
This starts the API server, listening on port 8000.

### Endpoints

The API endpoints implemented to fulfil the [Project Rubric](https://review.udacity.com/#!/rubrics/2098/view) are:

### GET /stars/hash:[HASH]

Example output:
```json
{
  "hash": "277292ad8a1b910cd34f43632887a2fb4c08edabb8ae93c4df95fe66ac01ab12",
  "height": 1,
  "body": {
    "address": "1LbDNCbQk4GjthgJ334UpzvXY3auc67Sxv",
    "star": {
      "ra": "13h 4m 46.0s",
      "dec": "78° 1' 0.5",
      "story": "466f756e642073746172207573696e672068747470733a2f2f7777772e676f6f676c652e636f6d2f736b792f",
      "storyDecoded": "Found star using https://www.google.com/sky/"
    }
  },
  "time": "1546526585",
  "previousBlockHash": "30d022a7849cc0b029cb3d32acbc9e71b7d124d52d3845db60b17cef2826db37"
}
```

### GET /stars/address:[ADDRESS]

Example output:
```json
[
  {
    "hash": "277292ad8a1b910cd34f43632887a2fb4c08edabb8ae93c4df95fe66ac01ab12",
    "height": 1,
    "body": {
      "address": "1LbDNCbQk4GjthgJ334UpzvXY3auc67Sxv",
      "star": {
        "ra": "13h 4m 46.0s",
        "dec": "78° 1' 0.5",
        "story": "466f756e642073746172207573696e672068747470733a2f2f7777772e676f6f676c652e636f6d2f736b792f",
        "storyDecoded": "Found star using https://www.google.com/sky/"
      }
    },
    "time": "1546526585",
    "previousBlockHash": "30d022a7849cc0b029cb3d32acbc9e71b7d124d52d3845db60b17cef2826db37"
  },
  {
    "hash": "95aa017b95c28754b199d55f62547b88562b43be40c9764d9d4f7b307bd8cd26",
    "height": 2,
    "body": {
      "address": "1LbDNCbQk4GjthgJ334UpzvXY3auc67Sxv",
      "star": {
        "ra": "10h 24m 7.0s",
        "dec": "65° 33' 59.0",
        "story": "466f756e642073746172207573696e672068747470733a2f2f7777772e676f6f676c652e636f6d2f736b792f",
        "storyDecoded": "Found star using https://www.google.com/sky/"
      }
    },
    "time": "1546527627",
    "previousBlockHash": "277292ad8a1b910cd34f43632887a2fb4c08edabb8ae93c4df95fe66ac01ab12"
  }
]
```

### GET /block/[HEIGHT]

Example output:
```json
{
  "hash": "95aa017b95c28754b199d55f62547b88562b43be40c9764d9d4f7b307bd8cd26",
  "height": 2,
  "body": {
    "address": "1LbDNCbQk4GjthgJ334UpzvXY3auc67Sxv",
    "star": {
      "ra": "10h 24m 7.0s",
      "dec": "65° 33' 59.0",
      "story": "466f756e642073746172207573696e672068747470733a2f2f7777772e676f6f676c652e636f6d2f736b792f",
      "storyDecoded": "Found star using https://www.google.com/sky/"
    }
  },
  "time": "1546527627",
  "previousBlockHash": "277292ad8a1b910cd34f43632887a2fb4c08edabb8ae93c4df95fe66ac01ab12"
}
```

### POST /request/requestValidation

Example input:
```json
{
  "address": "1LbDNCbQk4GjthgJ334UpzvXY3auc67Sxv"
}
```

Example output:
```json
{
  "walletAddress": "1LbDNCbQk4GjthgJ334UpzvXY3auc67Sxv",
  "requestTimeStamp": "1546525186",
  "message": "1LbDNCbQk4GjthgJ334UpzvXY3auc67Sxv:1546525186:starRegistry",
  "validationWindow": 292
}
```

### POST /message-signature/validate

Example input:
```json
{
"address":"1LbDNCbQk4GjthgJ334UpzvXY3auc67Sxv",
 "signature":"H+kArQhPMP8TwH9UdXqFFW/aea8Sq/xR7aSQOwPbc41KXqf9zJ2Jn+hz8hCnvQ7OggHkDMJjQ15IifoAAFNu05c="
}
```

Example output:
```json
{
  "registerStar": true,
  "status": {
    "address": "1LbDNCbQk4GjthgJ334UpzvXY3auc67Sxv",
    "requestTimeStamp": "1546525186",
    "message": "1LbDNCbQk4GjthgJ334UpzvXY3auc67Sxv:1546525186:starRegistry",
    "validationWindow": 226,
    "messageSignature": true
  }
}
```

### POST /block

Example input:
```json
{
    "address": "1LbDNCbQk4GjthgJ334UpzvXY3auc67Sxv",
    "star": {
                "dec": "78° 1' 0.5",
                "ra": "13h 4m 46.0s",
                "story": "Found star using https://www.google.com/sky/"
            }
}
```

Example output:
```json
{
  "hash": "277292ad8a1b910cd34f43632887a2fb4c08edabb8ae93c4df95fe66ac01ab12",
  "height": 1,
  "body": {
    "address": "1LbDNCbQk4GjthgJ334UpzvXY3auc67Sxv",
    "star": {
      "ra": "13h 4m 46.0s",
      "dec": "78° 1' 0.5",
      "story": "466f756e642073746172207573696e672068747470733a2f2f7777772e676f6f676c652e636f6d2f736b792f"
    }
  },
  "time": "1546526585",
  "previousBlockHash": "30d022a7849cc0b029cb3d32acbc9e71b7d124d52d3845db60b17cef2826db37"
}
```
