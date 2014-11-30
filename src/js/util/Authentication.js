var util   = require('./util.js');
var PubSub = require('pubsub-js');
var GitHub = require('github-api');

var Authentication =  {

	topics: function() {
		return {
			Token: 'Authentication_Token'
		};
	},

	_CLIENT_ID: '7f06406d4740f8839007',

	login: function() {
		open('https://github.com/login/oauth/authorize?client_id=' + this._CLIENT_ID + '&scope=gist', 'popup', 'width=1015,height=500');
	},

	save: function(token, data) {

		return new Promise(function(resolve, reject) {

			var github = new GitHub({
				token: token,
				auth: 'oauth'
			});

			var options = {
				mode: data.mode
			};

			// Use `water` terminology to support old
			// livecoding.io gists.
			var files = {
				files: {
					'water.html': { content: data.html },
					'water.js': { content: data.javascript },
					'water.css': { content: data.css },
					'options.json': {
						content: JSON.stringify(options, null, 4)
					}
				}

			};

			github.getGist().create(files, function(error, gist) {
				if (error) {
					reject(error);
				} else {
					resolve(gist);
				}
			});

		});
	}

};

module.exports = Authentication;

window.handleToken = function(code) {

	var url = 'http://powerful-chamber-3695.herokuapp.com/authenticate/' + code;

	util.getJSON(url)
		.then(function(response) {
			PubSub.publish(Authentication.topics().Token, response);
		});
};