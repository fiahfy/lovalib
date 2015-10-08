'use strict';

var co = require('co');
var fs = require('fs');
var request = require('request');
var lwip = require('lwip');
var scraper = require('../../utils/scrapers');
var models = require('../../models');
var logger = require('../../utils/logger');

const imageDir = './client/assets/img/';

module.exports = function(id, force) {
  return co(function *() {
    var servants;
    if (id) {
      servants = yield findServants({_id: id});
    } else {
      servants = yield findServants({});
    }
    for (var i = 0; i < servants.length; i++) {
      yield save(servants[i], force);
    }
  });
};

function findServants(args) {
  return models.servant.find(args).sort({_id: 1}).exec();
}

function save(servant, force) {
  return co(function *() {
    logger.info('save image: id = %d', servant.id);
    var url = yield getImageUrlWithServant(servant);
    if (!url) {
      logger.warn('image url is not found');
      return;
    }

    var largeImagePath = `${imageDir}l/${servant.id}.jpg`;
    var middleImagePath = `${imageDir}m/${servant.id}.jpg`;

    if (!force && (yield exists(largeImagePath)) && (yield exists(middleImagePath))) {
      logger.info('image is almost exists');
      return;
    }

    yield download(url, largeImagePath);

    yield scale(largeImagePath, middleImagePath, 150 / 640);

    yield compress(middleImagePath, middleImagePath, {quality: 50});
  });
}

function getImageUrlWithServant(servant) {
  return co(function *() {
    var $ = (yield scraper.fetchServant(servant.tribe_name, servant.name)).$;
    return $('#rendered-body').find('> div:first-child img').attr('src');
  });
}

function exists(path) {
  return new Promise(function(resolve, reject) {
    fs.stat(path, function(err, stat) {
      if (err == null) {
        resolve(true);
        return;
      }
      resolve(false);
    });
  });
}

function download(url, path) {
  return new Promise(function(resolve, reject) {
    logger.info('download url: %s', url);

    request
      .get(url)
      //.on('response', function(res) {
      //  console.log('statusCode: ', res.statusCode);
      //  console.log('content-length: ', res.headers['content-length']);
      //})
      .pipe(fs.createWriteStream(path).on('close', function() {
        resolve();
      }));
  });
}

function scale(orgPath, distPath, ratio) {
  return new Promise(function(resolve, reject) {
    lwip.open(orgPath, function(err, image) {
      image.batch().scale(ratio, ratio, 'lanczos').writeFile(distPath, 'jpg', {}, function (err) {
        if (err) {
          reject(err);
          return;
        }
        resolve();
      });
    });
  });
}

function compress(orgPath, distPath, params) {
  return new Promise(function(resolve, reject) {
    lwip.open(orgPath, function(err, image) {
      image.toBuffer('jpg', {quality: 50}, function(err, buffer) {
        lwip.open(buffer, 'jpg', function(err, image) {
          image.writeFile(distPath, 'jpg', {}, function (err) {
            if (err) {
              reject(err);
              return;
            }
            resolve();
          });
        });
      });
    });
  });
}
