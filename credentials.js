module.exports = {
	cookieSecret: 'здесь находится ваш секрет cookie-файла',
	mongo: {
		development: {
			connectionString: 'mongodb://sergei:helpme279090@ds121088.mlab.com:21088/sergei_test',
		},
		production: {
			connectionString: 'mongodb://<sergei>:<helpme279090>@ds119651.mlab.com:19651/tes',
		},
	},
	authProviders: {
		facebook: {
			development: {
				appId: '2679208248801708',
				appSecret: '43a0135981a7774e1949a0236ec30140',
			},
		},
	},
	// consumerKey: credentials.twitter.consumerKey,
	// consumerSecret: credentials.twitter.consumerSecret,
	twitter: {
		consumerKey: 'S2cLQkh8mEJ5VNBHWAIw1UFbk',
		consumerSecret: 'TN1NsZcpFuaoVnRarmmffph53NHw5OckaCVGHOI2glZkNsCrvH'

	}
};