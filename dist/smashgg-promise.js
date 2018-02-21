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
                expands: expands
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
                .then(allEvents => {
                    return resolve(allEvents);
                })
                .catch(console.error);
        })
    }

    getAllSets(){
        var ThisTournament = this;
        return new Promise(function(resolve, reject){
            var groups = ThisTournament.data.entities.groups;
    
            var promises = [];
            groups.forEach(group => {
                var p = getPhaseGroup(group.id);
                promises.push(p); 
            })
    
            Promise.all(promises)
                .then(allGroups => {
                    var sets = [];
                    allGroups.forEach(group => {
                        group.sets.forEach(set => {
                            sets.push(parseDataToSet(set));
                        })
                    })
                    return resolve(sets);
                })
                .catch(reject);
        })
    }

    getAllPlayers(){
        return new Promise(function(resolve, reject){
           
        })
    }
}

/** EVENTS */

class Event{
    constructor(tournamentName, eventName, expands, data){
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
                tournamentName: tournamentName,
                eventName: eventName,
                expands: expands
            }
            request('POST', url, postParams)
                .then(function(data){
                    return resolve(new Event(tournamentName, eventName, expandsObj, data));
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
        var ThisEvent = this;
        return new Promise(function(resolve, reject){
            //TODO implement
        })
    }
    
    getEventPhaseGroups(){
        var ThisEvent = this;
        return new Promise(function(resolve, reject){
            //TODO implement
        })
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
                expands: expands
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
        return new Date(this.data.entities.phase['name']);
    }
    getEventId(){
        return new Date(this.data.entities.phase['eventId']);
    }

    getPhaseGroups (){
        var ThisPhase = this;
        return new Promise(function(resolve, reject){
            //TODO implement
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
                sets: (expands && expands.sets) || true,
                entrants: (expands && expands.entrants) || true,
                standings: (expands && expands.standings) || true,
                seeds: (expands && expands.seeds) || true
            };
            for(var property in expandsObj){
                if(expandsObj[property] instanceof Function) break;
                else if(expandsObj[property])
                    expandsString += 'expand[]=' + property + '&';
            }
    
            var url = 'http://smashggcors.us-west-2.elasticbeanstalk.com/phasegroup';
            var postParams = {
                id: id,
                expands: expands
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
        return new Date(this.data.entities.group['phaseId']);
    }
    getPlayers(){
        var ThisPhaseGroup = this;
        return new Promise(function(resolve, reject){
            //TODO implement
        })
    }
    
    getSets(){
        var ThisPhaseGroup = this;
        return new Promise(function(resolve, reject){
            //TODO implement
        })
    }
}

/** Sets */
class Set{
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

        this.data = data;
    }

    static resolve(data){
        let playerId = 0;
        let participantId = 0;

        //for(let id in data.mutations.participants)
        //    participantId = id;

        for(let id in data.mutations.players)
            playerId = id;

        let playerDetails = data.mutations.players[playerId];

        let P = new Player(
            parseInt(playerId),
            playerDetails.gamerTag,
            playerDetails.name,
            playerDetails.country,
            playerDetails.state,
            playerDetails.prefix,
            parseInt(data.id)
        );
        P.loadData(data);
        return P;
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