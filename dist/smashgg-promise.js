var smashgg = Object;

var request = function(method, url, data){
    return new Promise(function (resolve, reject) {
        var xhr = new XMLHttpRequest();
        xhr.open(method, url);
        xhr.onload = function () {
            if (this.status >= 200 && this.status < 300) {
                resolve(xhr.response);
            } else {
                reject({
                    status: this.status,
                    statusText: xhr.statusText
                });
            }
        };
        xhr.onerror = function () {
            reject({
                status: this.status,
                statusText: xhr.statusText
            });
        };
        xhr.setRequestHeader("Content-Type", "application/json");
        xhr.send(JSON.stringify(data));
    });
};

/** TOURNAMENTS */
class Tournament{
    constructor(name, expands, data){
        this.name = name;
        this.expands = expands;
        this.data = JSON.parse(data);
    }

    static get(tournamentName, expands){
        return new Promise(function(resolve, reject){
            if(!tournamentName)
                return reject(new Error('Tournament Name cannot be null'));
    
            var data = {};
            var name = tournamentName;
    
            // CREATE THE EXPANDS STRING
            var expandsString = "";
            var expandsObj = {
                event: (expands && expands.event) ? expands.event : true,
                phase: (expands && expands.phase) ? expands.phase : true,
                groups: (expands && expands.groups) ? expands.groups : true,
                stations: (expands && expands.stations) ? expands.stations : true
            };
            for(var property in expandsObj){
                if(expandsObj[property] instanceof Function) break;
                else if(expandsObj[property])
                    expandsString += 'expand[]=' + property + '&';
            }
    
            //var url = 'https://api.smash.gg/tournament/' + tournamentName + '?' + expandsString;
            var url = 'http://smashggcors.us-west-2.elasticbeanstalk.com/tournament'
            var postParams = {
                tournamentName: tournamentName,
                expands: expandsObj
            }
            request('POST', url, postParams)
                .then(function(data){
                    return resolve(new Tournament(name, expandsObj, data));
                })
                .catch(function(err){
                    console.error('Smashgg Tournament: ' + err);
                    return reject(err);
                })
        })
    }

    getId(){
        return this.data.entities.tournament['id'];
    }
    getName(){
        return this.data.entities.tournament['name'];
    }
    getSlug(){
        return this.data.entities.tournament['slug'];
    }
    getTimezone(){
        return this.data.entities.tournament['timezone'];
    }
    getStartTime(){
        return new Date(this.data.entities.tournament['startAt']);
    }
    getEndTime(){
        return new Date(this.data.entities.tournament['endAt']);
    }
    getWhenRegistrationCloses(){
        return new Date(this.data.entities.tournament['eventRegistrationClosesAt']);
    }
    getCity(){
        return this.data.entities.tournament['city'];
    }
    getState(){
        return this.data.entities.tournament['addrState'];
    }
    getZipCode(){
        return this.data.entities.tournament['postalCode'];
    }
    getContactEmail(){
        return this.data.entities.tournament['contactEmail'];
    }
    getContactTwitter(){
        return this.data.entities.tournament['contactTwitter'];
    }
    getOwnerId(){
        return this.data.entities.tournament['ownerId'];
    }
    getVenueFee(){
        return this.data.entities.tournament['venueFee'];
    }
    getProcessingFee(){
        return this.data.entities.tournament['processingFee'];
    }

    getAllEvents(){
        var ThisTournament = this;
        return new Promise(function(resolve, reject){
            var events = ThisTournament.data.entities.event;
        
            var promises = [];
            events.forEach(event => {
                promises.push(Event.get(ThisTournament.name, event.name));
            })

            Promise.all(promises)
                .then(resolve)
                .catch(console.error);
        })
    }

    getAllMatches(){
        var ThisTournament = this;
        return new Promise(function(resolve, reject){
            var groups = ThisTournament.data.entities.groups;
    
            var promises = [];
            groups.forEach(group => {
                promises.push(PhaseGroup.get(group.id)); 
            })
    
            Promise.all(promises)
                .then(allGroups => {
                    var setsPromises = [];
                    allGroups.forEach(group => {
                        setsPromises.push(group.getMatches());
                    })
                    Promise.all(setsPromises)
                        .then(groupSets => {
                            var allSets = [];
                            groupSets.forEach(setArray => {
                                allSets = allSets.concat(setArray);
                            })
                            return resolve(allSets);
                        })
                        .catch(reject);
                })
                .catch(reject);
        })
    }

    getAllPlayers(){
        let thisTournament = this;
        return new Promise(function(resolve, reject){
            // Grab all events from tournament
            let eventPromises = thisTournament.data.entities.event.map(currEvent => {
                return Event.getEventById(thisTournament.name, currEvent.id);
            });
            // Promisify all events
            Promise.all(eventPromises)
            // Grab phaseGroups from each event
            .then(allEvents => {
                let allPhasePromises = [];
                allEvents.forEach(event => {
                    event.data.entities.phase.forEach(currPhase =>  {
                        allPhasePromises.push(Phase.get(currPhase.id));
                    });
                });
                // Resolve and work with list of phases 
                Promise.all(allPhasePromises)
                .then(phases => {
                    let playerPromises = [];
                    phases.forEach(phase => {
                        playerPromises.push(phase.getPhasePlayers());
                    });
                    Promise.all(playerPromises)
                    .then(phasePlayers => {
                        let allPlayers = [];
                        phasePlayers.forEach(currPhase => {
                            currPhase.forEach(players => {
                                if (!allPlayers.includes(players)) {
                                    allPlayers.push(players);
                                }
                            });
                        });

                        // Returns a unique list of players
                        let flags = {};
                        let players = allPlayers.filter(player => {
                            if (flags[player.id]) {
                                return false;
                            }
                            flags[player.id] = true;
                            return true;
                        });
                        return resolve(players);
                    })
                    .catch(reject);
                })
                .catch(reject);
            })
            .catch(reject);
        })
    }
}

/** EVENTS */

class Event{
    constructor(tournamentName, eventName, expands, data, eventId){
        this.eventId = eventId;
        this.tournamentName = tournamentName;
        this.eventName = eventName;
        this.expands = expands;
        this.data = JSON.parse(data);
    }

    static get(tournamentName, eventName, expands){
        return new Promise(function(resolve, reject){
            if(!tournamentName)
                return reject(new Error('Tournament Name cannot be null for Event'));
            if(!eventName)
                return reject(new Error('Event Name cannot be null for Event'));
    
            var data = {};
    
            // CREATE THE EXPANDS STRING
            var expandsString = "";
            var expandsObj = {
                phase: (expands && expands.phase) ? expands.phase : true,
                groups: (expands && expands.groups) ? expands.groups : true
            };
            for(var property in expandsObj){
                if(expandsObj[property] instanceof Function) break;
                else if(expandsObj[property])
                    expandsString += 'expand[]=' + property + '&';
            }
    
            var url = 'http://smashggcors.us-west-2.elasticbeanstalk.com/event';
            var postParams = {
                tournamentName: tournamentName,
                eventName: eventName,
                expands: expandsObj
            }
            request('POST', url, postParams)
                .then(function(data){
                    return resolve(new Event(tournamentName, eventName, expandsObj, data, null));
                })
                .catch(function(err){
                    console.error('Smashgg Tournament: ' + err);
                    return reject(err);
                })
        })
    }

    static getEventById(tournamentName = null, eventId) {
        return new Promise(function(resolve, reject){
            var url = 'http://smashggcors.us-west-2.elasticbeanstalk.com/event';
            var postParams = {
                eventId: eventId,
            }
            request('POST', url, postParams)
                .then(function(data){
                    return resolve(new Event(tournamentName, data.name, null, data, eventId));
                })
                .catch(function(err){
                    console.error('Smashgg Tournament: ' + err);
                    return reject(err);
                })
        })
    }

    getName(){
        return this.data.entities.event['name'];
    }

    getSlug(){
        return this.data.entities.event['slug'];
    }

    getStartTime(){
        return new Date(this.data.entities.event['startAt']);
    }

    getEndTime(){
        return new Date(this.data.entities.event['endAt']);
    }

    getEventPhases(){
        let thisEvent = this;
        return new Promise(function(resolve, reject){
            let promises = thisEvent.data.entities.phase.map(p => {
                return Phase.get(p.id);
            });
            Promise.all(promises).then(resolve).catch(reject);
        });
    }
    
    getEventPhaseGroups(){
        let thisEvent = this;
        return new Promise(function(resolve, reject){
            let promises = thisEvent.data.entities.groups.map(group => {
                return PhaseGroup.get(group.id);
            });
            Promise.all(promises)
                .then(resolve)
                .catch(reject);
        });
    }
}

/** PHASES */

class Phase{
    constructor(id, expands, data){
        this.id = id;
        this.expands = expands;
        this.data = JSON.parse(data);
    }

    static get(id, expands){
        return new Promise(function(resolve, reject){
            if(!id)
                return reject(new Error('ID cannot be null for Phase Group'));
    
            var data = {};
    
            // CREATE THE EXPANDS STRING
            var expandsString = "";
            var expandsObj = {
                groups: (expands && expands.groups) ? expands.groups : true
            };
            for(var property in expandsObj){
                if(expandsObj[property] instanceof Function) break;
                else if(expandsObj[property])
                    expandsString += 'expand[]=' + property + '&';
            }
    
            var url = 'http://smashggcors.us-west-2.elasticbeanstalk.com/phase';
            var postParams = {
                id: id,
                expands: expandsObj
            }
            request('POST', url, postParams)
                .then(function(data){
                    return resolve(new Phase(id, expandsObj, data));
                })
                .catch(function(err){
                    console.error('Smashgg Tournament: ' + err);
                    return reject(err);
                })
        })
    }

    getName(){
        return this.data.entities.phase['name'];
    }
    getEventId(){
        return this.data.entities.phase['eventId'];
    }

    getPhaseGroups(){
        let thisPhase = this;
        return new Promise(function(resolve, reject){
            let groups = [];
            thisPhase.data.entities.groups.forEach(group => {
                let g = PhaseGroup.get(group.id);
                groups.push(g)
            });
            Promise.all(groups)
                .then(resolve)
                .catch(reject);
        })
    }

    getPhasePlayers() {
        let thisPhase = this;
        return new Promise(function(resolve, reject) {
            // get phase groups
            let phasePromises = thisPhase.data.entities.groups.map(group => {
                return PhaseGroup.get(group.id);
            });
            Promise.all(phasePromises)
                .then(phaseGroups => {
                    let playerPromises = [];
                    phaseGroups.forEach(group => {
                        playerPromises.push(group.getPlayers());     
                    });
                    Promise.all(playerPromises)
                        .then(allPlayers => {
                            // Should give a unique list of players
                            let players = [].concat(...allPlayers);
                            return resolve(players);
                        }).catch(reject);
                })
                .catch(reject);
        })
    }

    getPhaseSets() {
        let thisPhase = this;
        return new Promise (function(resolve, reject) {
            let phasePromises = thisPhase.data.entities.groups.map(group => {
                return PhaseGroup.get(group.id);
            });
            Promise.all(phasePromises)
            .then(phaseGroups => {
                let setPromises = [];
                phaseGroups.forEach(group => {
                    setPromises.push(group.getMatches());
                })
                Promise.all(setPromises)
                .then(phaseSets => {
                    let allSets = [];
                    phaseSets.forEach(sets => {
                        sets.forEach(set => {
                            allSets.push(set);
                        })
                    })
                    return resolve(allSets);
                })
                .catch(reject);
            })
            .catch(reject);
        })
    }
}

/** PHASE GROUPS */

class PhaseGroup{
    constructor(id, expands, data){
        this.id = id;
        this.expands = expands;
        this.data = JSON.parse(data);
    }

    static get(id, expands){
        return new Promise(function(resolve, reject){
            if(!id)
                return reject(new Error('ID cannot be null for Phase Group'));
    
            var data = {};
    
            // CREATE THE EXPANDS STRING
            var expandsString = "";
            var expandsObj = {
                sets: (expands && expands.sets) ? expands.sets : true,
                entrants: (expands && expands.entrants) ? expands.entrants : true,
                standings: (expands && expands.standings) ? expands.standings : true,
                seeds: (expands && expands.seeds) ? expands.seeds : true
            };
            for(var property in expandsObj){
                if(expandsObj[property] instanceof Function) break;
                else if(expandsObj[property])
                    expandsString += 'expand[]=' + property + '&';
            }
    
            var url = 'http://smashggcors.us-west-2.elasticbeanstalk.com/phasegroup';
            var postParams = {
                id: id,
                expands: expandsObj
            }
            request('POST', url, postParams)
                .then(function(data){
                    return resolve(new PhaseGroup(id, expandsObj, data));
                })
                .catch(function(err){
                    console.error('Smashgg Tournament: ' + err);
                    return reject(err);
                })
        })
    }

    getPhaseId(){
        return this.data.entities.groups['phaseId'];
    }

    getPlayers(){
        var ThisPhaseGroup = this;
        return new Promise(function(resolve, reject){
            if(ThisPhaseGroup.players)
                return resolve(ThisPhaseGroup.players);

            let players = [];
            ThisPhaseGroup.data.entities.entrants.forEach(entrant => {
                let P = Player.resolve(entrant);
                players.push(P);
            });
            ThisPhaseGroup.players = players;
            return resolve(players);
        });
    }
    
    getMatches(){
        var ThisPhaseGroup = this;
        return new Promise(function(resolve, reject){
            var promises = [];
            ThisPhaseGroup.data.entities.sets.forEach(set => {
                if (!set.entrant1Id || !set.entrant2Id)
                    return; // HANDLES BYES
                var p = new Promise(function(resolve, reject){
                    let winnerId = 
                        set.entrant1Score > set.entrant2Score ? 
                            set.entrant1Id : 
                            set.entrant2Id;
                    let loserId = 
                        winnerId != set.entrant1Id ? 
                            set.entrant1Id : set.entrant2Id;

                    ThisPhaseGroup.findWinnerLoserByParticipantIds(winnerId, loserId)
                        .then(setPlayers => {
                            if (!setPlayers.winnerPlayer || !setPlayers.loserPlayer)
                                return reject('Both winner and loser player must be populated'); 
                                // HANDLES Error of some sort

                            let S = new Match(
                                set.id, 
                                set.eventId, 
                                set.fullRoundText, 
                                setPlayers.winnerPlayer, 
                                setPlayers.loserPlayer,
                                JSON.stringify(set)
                            );
                            return resolve(S);
                        })
                        .catch(reject);
                    })
                promises.push(p);
            });

            Promise.all(promises)
                .then(resolve)
                .catch(console.error);
        })
    }

    findWinnerLoserByParticipantIds(winnerId, loserId){
        var ThisPhaseGroup = this;
        return new Promise(function(resolve, reject){
            ThisPhaseGroup.getPlayers()
                .then(players => {
                    let winnerPlayer = players.filter(e => {return e.participantId == winnerId});
                    if(winnerPlayer.length)
                        winnerPlayer = winnerPlayer[0];
                    else return reject(new Error('No player for id ' + winnerId));

                    let loserPlayer = players.filter(e => {return e.participantId == loserId});
                    if(loserPlayer.length)
                        loserPlayer = loserPlayer[0];
                    else return reject(new Error('No player for id ' + loserId));
                    
                    return resolve({
                        winnerPlayer: winnerPlayer,
                        loserPlayer: loserPlayer
                    })
                    
                })
                .catch(console.error)
            });
    }

    findPlayersByParticipantId(id){
        var ThisPhaseGroup = this;
        return new Promise(function(resolve, reject){
            ThisPhaseGroup.getPlayers()
                .then(players => {
                    let player = players.filter(e => {return e.participantId == id});
                    if(player.length)
                        return player[0];
                    else throw new Error('No Player with id ' + id);
                })
                .catch(console.error)
            });
    }
}

/** Match - Represents a tournament set */
class Match{
    constructor(id, eventId, round, WinnerPlayer, LoserPlayer, data){
        if(!id)
            throw new Error('Id for Set cannot be null');
        if(!eventId)
            throw new Error('Event Id for Set cannot be null');
        if(!round)
            throw new Error('Round for Set cannot be null');
        if(!WinnerPlayer && !(WinnerPlayer instanceof Player))
            throw new Error('Winner Player for Set cannot be null, and must be an instance of Player.js');
        if(!LoserPlayer && !(LoserPlayer instanceof Player))
            throw new Error('Loser Player for Set cannot be null, and must be an instance of Player.js');

        this.id = id;
        this.eventId = eventId;
        this.round = round;
        this.WinnerPlayer = WinnerPlayer;
        this.LoserPlayer = LoserPlayer;

        if(data)
            this.data = JSON.parse(data);
    }

    getRound(){
        return this.round;
    }

    getWinner(){
        return this.WinnerPlayer;
    }

    getLoser(){
        return this.LoserPlayer;
    }

    getGames(){
        return this.data.games
    }

    getBestOfCount(){
        return this.data.bestOf 
    }

    getWinnerScore(){
        return this.data.entrant1Score > this.data.entrant2Score ? this.data.entrant1Score : this.data.entrant2Score;
    }

    getLoserScore(){
        return this.data.entrant1Score < this.data.entrant2Score ? this.data.entrant1Score : this.data.entrant2Score;
    }

    getBracketId(){
        return this.data.bracketId;
    }

    getMidsizeRoundText(){
        return this.data.midRoundText;
    }

    getPhaseGroupId(){
        return this.data.phaseGroupId;
    }

    getWinnersTournamentPlacement(){
        return this.WinnerPlayer.getFinalPlacement();
    }

    getLosersTournamentPlacement(){
        return this.LoserPlayer.getFinalPlacement();
    }
}

/** Players */
class Player{
    constructor(id, tag, name, country, state, sponsor, participantId, data){
        if(!id)
            throw new Error('Player ID cannot be null');

        this.id = id;
        this.tag = tag;
        this.name = name;
        this.country = country;
        this.state = state;
        this.sponsor = sponsor;
        this.participantId = participantId;

        if(data)
            this.data = JSON.parse(data);
    }

    static resolve(data){
        try{
            let playerId = 0;
            let participantId = 0;

            for(let id in data.mutations.players){
                if(isNaN(parseInt(id))) break;
                playerId = id;
            }

            let playerDetails = data.mutations.players[playerId];

            let P = new Player(
                parseInt(playerId),
                playerDetails.gamerTag,
                playerDetails.name,
                playerDetails.country,
                playerDetails.state,
                playerDetails.prefix,
                parseInt(data.id),
                JSON.stringify(data)
            );
            return P;
        } catch(e){
            console.error(e.message);
            throw e;
        }
    }

    getId(){
        return this.id;
    }

    getTag(){
        return this.tag;
    }

    getName(){
        return this.name;
    }

    getCountry(){
        return this.country;
    }

    getState(){
        return this.state;
    }

    getSponsor(){
        return this.sponsor;
    }

    getParticipantId(){
        return this.participantId;
    }

    getFinalPlacement(){
        return this.data.finalPlacement
    }
}

/** DEFINE PROTOTYPE */
smashgg.prototype.getTournament = Tournament.get;
smashgg.prototype.getEvent = Event.get;
smashgg.prototype.getPhase = Phase.get;
smashgg.prototype.getPhaseGroup = PhaseGroup.get;

module.exports = smashgg;