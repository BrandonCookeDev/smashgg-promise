let chai = require('chai');
let smashggjs = require('smashgg.js');
let expect = chai.expect;

let expected = {};
const TOURNAMENT_NAME = 'to12';
const EVENT_NAME = 'melee-singles';
const PHASE_ID = 132397;
const PHASE_GROUP_ID = 373938;

// !important import lib and browser dependencies
var window = require('window');
var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
GLOBAL.XMLHttpRequest = XMLHttpRequest;
let smashgg = require('../../dist/smashgg-promise');

describe('smashgg-promise integration test', function(){

    before(async function(){
        this.timeout(20000);
        console.log('Beginning Setup...');

        await Promise.all([
            getTournament(TOURNAMENT_NAME).then(data => {expected.tournament = data}),
            getEvent(TOURNAMENT_NAME, EVENT_NAME).then(data => {expected.event = data}),
            getPhase(PHASE_ID).then(data => {expected.phase = data}),
            getPhaseGroup(PHASE_GROUP_ID).then(data => {expected.phasegroup = data})
        ]);

        console.log('expected:', expected);
        console.log('Setup done.');
        return true;
    })

    it('should correctly get Tournament data', async function(){
        this.timeout(10000);

        let t = await smashgg.getTournament(TOURNAMENT_NAME);
        expect(t).to.deep.equal(expected.tournament);
        return true;
    });

    it('should correctly get Event data', async function(){
        this.timeout(10000);

        let e = await smashgg.getEvent(TOURNAMENT_NAME, EVENT_NAME);
        expect(e).to.deep.equal(expected.event);
        return true;
    });

    it('should correctly get Phase data', async function(){
        this.timeout(10000);

        let p = await smashgg.getPhase(PHASE_ID);
        expect(p).to.deep.equal(expected.phase);
        return true;
    });

    it('should correctly get PhaseGroup data', async function(){
        this.timeout(10000);

        let pg = await smashgg.getPhaseGroup(PHASE_GROUP_ID);
        expect(pg).to.deep.equal(expected.phasegroup);
        return true;
    })
});

function getTournament(tournamentName){
    return new Promise(function(resolve, reject){
        let t = new smashggjs.Tournament(tournamentName);
        t.on('ready', function(data){
            resolve(t);
        });
    })
}

function getEvent(tournamentName, eventName){
    return new Promise(function(resolve, reject){
        let e = new smashggjs.Event(tournamentName, eventName);
        e.on('ready', function(){
            resolve(e);
        });
    })
}

function getPhase(id){
    return new Promise(function(resolve, reject){
        let p = new smashggjs.Phase(id);
        p.on('ready', function(){
            resolve(p);
        });
    })
}

function getPhaseGroup(id){
    return new Promise(function(resolve, reject){
        let pg = new smashggjs.PhaseGroup(id);
        pg.on('ready', function(){
            resolve(pg);
        });
    })
}