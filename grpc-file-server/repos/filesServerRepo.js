/**
 * https://mongodb.github.io/node-mongodb-native/3.0/tutorials/gridfs/streaming/
 */

const assert = require('assert');
const fs = require('fs');
const mongodb = require('mongodb');
const uri = 'mongodb://localhost:27017';
const dbName = 'test';

mongodb.MongoClient.connect(uri, function (error, client) {
    assert.ifError(error);

    const db = client.db(dbName);

    var bucket = new mongodb.GridFSBucket(db);

    fs.createReadStream('./meistersinger.mp3').
        pipe(bucket.openUploadStream('meistersinger.mp3')).
        on('error', function (error) {
            assert.ifError(error);
        }).
        on('finish', function () {
            console.log('done!');
            process.exit(0);
        });
});


const bucket = new mongodb.GridFSBucket(db, {
    chunkSizeBytes: 1024,
    bucketName: 'songs'
});

bucket.openDownloadStreamByName('meistersinger.mp3').
    pipe(fs.createWriteStream('./output.mp3')).
    on('error', function (error) {
        assert.ifError(error);
    }).
    on('finish', function () {
        console.log('done!');
        process.exit(0);
    });