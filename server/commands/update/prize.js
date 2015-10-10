'use strict';

let co = require('co');
let scraper = require('../../utils/scrapers');
let models = require('../../models');
let logger = require('../../utils/logger');

const fetchMaxPage = 5;

module.exports = function() {
  return co(function *() {
    // get prizes
    let prizes = yield getPrizes();
    if (!prizes) {
      logger.warn('Prize is Nothing');
      return;
    }
    // clean prizes
    logger.info('Truncate Prizes');
    yield truncatePrizes();
    // insert prizes
    logger.info('Insert Prizes: count = %d', prizes.length);
    yield insertPrizes(prizes);
  });
};

function insertPrizes(prizes) {
  return co(function *() {
    for (let i = 0; i < prizes.length; i++) {
      let prize = prizes[i];
      prize._id = i + 1;
      yield insertPrize(prize);
    }
  });
}

function insertPrize(args) {
  let _id = args._id;
  delete args._id;
  return models.prize.update({_id: _id}, args, {upsert: true}).exec();
}

function truncatePrizes() {
  return models.prize.remove({}).exec();
}

function getPrizes() {
  return co(function *() {
    // get article id
    let id = yield getRecentPrizeArticleId();
    if (!id) {
      logger.warn('Prize Notice is Not Found');
      return null;
    }
    let $ = (yield scraper.fetchArticle(id)).$;
    let prizes = [];
    let panel = $('#mainpanel');
    let date = new Date(panel.find('div.article_title span.date').text());
    date = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    panel.find('div.subsection_frame strong').each(function() {
      let text = $(this).text();
      let matches = text.match(/([^・：]+)：(.+)[%％]/i);
      if (matches) {
        prizes.push({
          date: date,
          name: matches[1].trim(),
          rate: matches[2].trim() / 100
        });
      }
    });
    return prizes;
  });
}

function getRecentPrizeArticleId() {
  return co(function *() {
    for (let i = 1; i <= fetchMaxPage; i++) {
      let $ = (yield scraper.fetchNotice(i)).$;
      let id;
      $('#information_panel').find('div.tab_topics ul.page_inner li a').each(function() {
        let title = $(this).find('span:last-child').text();
        if (title.match(/「転成儀」.*更新のお知らせ/i)) {
          id = $(this).attr('href').split('no=')[1];
          return false;
        }
      });
      if (id) {
        return id;
      }
    }
    return null;
  });
}
