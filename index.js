var ask = require('inquirer');
var cheerio = require('cheerio');
var request = require('request');
const download = require('download');
const fs = require('fs');
const url = 'http://data.go.id';

var questions = [{
    type: 'input',
    name: 'keywords',
    message: 'Data yang anda ingin cari',
}];

ask.prompt(questions).then(answers => {
    var keywords = answers['keywords'];
    getList(keywords);
});


function getList(x) {
    request(url + '/dataset?q=' + x, function(error, response, body) {
        let $ = null;
        $ = cheerio.load(body);
        let pages = $('.pagination-centered>ul>li').length - 1;
        for (let i = 1; i < pages; i++) {
            request(url + '/dataset?q=' + x + '&page=' + i, function(error, response, html) {
                $ = null;
                $ = cheerio.load(html);
                $('.dataset-heading>a').each(function() {
                    var link = 'http://data.go.id' + $(this).attr('href');
                    request(link, function(error, response, html) {
                        $ = null;
                        $ = cheerio.load(html);
                        var file = $('.dropdown-menu>li').last().children().attr('href');
                        request(file, function(error, response, html) {
                            if(!error){
                                download(file, 'download/' + x).then(() => {
                                    console.log('success: ' + file);
                                });
                            }else{
                                console.log('data-not-found: ' + file);
                            }
                        });
                    });
                });
            });
        }
    });
}
