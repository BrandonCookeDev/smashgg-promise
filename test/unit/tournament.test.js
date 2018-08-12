'use strict';

let chai = require('chai');
let expect = chai.expect;

let smashgg = require('../../dist/smashgg-promise');
let XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;

let tournament;

describe('smashgg-promise Tournament', function(){

	before(function(){
		global.XMLHttpRequest = XMLHttpRequest;
	})

	it('should get tournament objects', function(done){
		tournament = smashgg.getTournament('ceo-2016')
			.then(tournament => {
				expect(tournament != null).to.be.true;
				done();
			})

	})

	it('should get all match ids from a tournament object', async function(){
		let ids = await tournament.getAllMatchIds();

		expect(ids.length > 0).to.be.true;
		return true;
	})
})