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
}

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
                event: (expands && expands.event) || true,
                phase: (expands && expands.phase) || true,
                groups: (expands && expands.groups) || true,
                stations: (expands && expands.stations) || true
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

    getAllSets(){
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
                        setsPromises.push(group.getSets());
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

    // Needs to be looked at
    getAllPlayers(){
        let thisTournament = this;
        return new Promise(function(resolve, reject){
            // Grab all events from tournament
            let eventPromises = thisTournament.data.entities.event.map(e => {
                return Event.get(thisTournament.name, e.name);
            });
            console.log("Events... ", eventPromises);
            // Promisify all events
            Promise.all(eventPromises)
                // Grab phaseGroups from each event
                .then(events => {
                    let phaseGroups = events.map(event => {
                        return event.getPhaseGroups();
                    });
                    console.log('Phase Groups...', phaseGroups);
                    Promise.all(phaseGroups)
                        // Work with phaseGroups
                        .then(groups => {
                            let players = groups.map(group => {
                                return group.getPlayers();
                            });
                            // Should create a set of unique players
                            let newPlayers = Array.from(new Set(players));
                            return resolve(...newPlayers);
                        })
                        .catch(reject);
                })
                .catch(function(e){
                    console.error('eventPromises failed: ' + e.message);
                    console.error(e.stack);
                });
        })
    }
}

/** EVENTS */

class Event{
    constructor(id, tournamentName, eventName, expands, data){
        this.id = id;
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
                phase: (expands && expands.phase) || true,
                groups: (expands && expands.groups) || true
            };
            for(var property in expandsObj){
                if(expandsObj[property] instanceof Function) break;
                else if(expandsObj[property])
                    expandsString += 'expand[]=' + property + '&';
            }
    
            var url = 'http://smashggcors.us-west-2.elasticbeanstalk.com/event';
            var postParams = {
                eventId: null,
                tournamentName: tournamentName,
                eventName: eventName,
                expands: expandsObj
            }
            request('POST', url, postParams)
                .then(function(data){
                    return resolve(new Event(data.id, tournamentName, eventName, expandsObj, data));
                })
                .catch(function(err){
                    console.error('Smashgg Tournament: ' + err);
                    return reject(err);
                })
        })
    }

    static getById(id, tournamentName, expands){
        return new Promise(function(resolve, reject){
            if(!tournamentName)
                return reject(new Error('Tournament Name cannot be null for Event'));
            if(!eventName)
                return reject(new Error('Event Name cannot be null for Event'));
    
            var data = {};
    
            // CREATE THE EXPANDS STRING
            var expandsString = "";
            var expandsObj = {
                phase: (expands && expands.phase) || true,
                groups: (expands && expands.groups) || true
            };
            for(var property in expandsObj){
                if(expandsObj[property] instanceof Function) break;
                else if(expandsObj[property])
                    expandsString += 'expand[]=' + property + '&';
            }
    
            var url = 'http://smashggcors.us-west-2.elasticbeanstalk.com/event';
            var postParams = {
                eventId: id,
                tournamentName: tournamentName,
                eventName: eventName,
                expands: expandsObj
            }
            request('POST', url, postParams)
                .then(function(data){
                    return resolve(new Event(id, tournamentName, eventName, expandsObj, data));
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
                groups: (expands && expands.groups) || true
            };
            for(var property in expandsObj){
                if(expandsObj[property] instanceof Function) break;
                else if(expandsObj[property])
                    expandsString += 'expand[]=' + property + '&';
            }
    
            //var url = 'https://api.smash.gg/phase/' + id + "?" + expandsString;
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
            let groups = [];thisPhase.data.entities.groups.forEach(group => {
                let g = PhaseGroup.get(group.id);
                groups.push(g)
            });
            Promise.all(groups)
                .then(resolve)
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
    
    getSets(){
        var ThisPhaseGroup = this;
        return new Promise(function(resolve, reject){
            let sets = ThisPhaseGroup.data.entities.sets.map(set => {
                //var p = new Promise(function(resolve, reject){
                let isComplete = set.completedAt != null;
                
                let S = new Set(
                    set.id, 
                    set.eventId, 
                    set.fullRoundText, 
                    set.entrant1,
                    set.entrant2,
                    isComplete,
                    set.entrant1Score,
                    set.entrant2Score,
                    set.entrant1Id,
                    set.entrant2Id,
                    JSON.stringify(set)
                );
                return S;
            })
            return resolve(sets);
        });
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

/** Sets */
class Set{
    constructor(id, eventId, round, player1, player2, isComplete=false, score1=0, score2=0, winnerId, loserId, data){
		super();

		if(!id)
			throw new Error('Id for Set cannot be null');
		if(!eventId)
			throw new Error('Event Id for Set cannot be null');
		if(!round)
			throw new Error('Round for Set cannot be null');
		if(!player1 && !(player1 instanceof Player))
			throw new Error('Winner Player for Set cannot be null, and must be an instance of Player');
		if(!player2 && !(player2 instanceof Player))
			throw new Error('Loser Player for Set cannot be null, and must be an instance of Player');

		this.id = id;
		this.eventId = eventId;
		this.round = round;
		this.player1 = player1;
		this.player2 = player2;
		this.score1 = score1;
		this.score2 = score2;
		this.isComplete = isComplete;
		this.winnerId = winnerId;
		this.loserId = loserId;

		this.data = data;
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

    getCompletedAt(){
        return this.data.completedAt;
    }

    getStartedAt(){
        return this.data.startedAt;
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

            //for(let id in data.mutations.participants)
            //    participantId = id;

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