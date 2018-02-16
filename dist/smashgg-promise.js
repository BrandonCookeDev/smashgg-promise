var smashgg = Object;
var request = function(type, url, data){
    return new Promise(function(resolve, reject){
        var xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
                return resolve(this.responseText);
            }
            else{
                return reject(new Error('Status was non 200: ' + this.status))
            }
        };
        switch(type){
            case 'get':
                xhttp.open("GET", url, true);
                xhttp.send();
                break;
            case 'post':
                xhttp.open("POST", url, true);
                xhttp.send(data);
                break;
            default:
                console.log('Only GET and POST supported currently');
                break;
        }
    })
}

/** TOURNAMENTS */
var getAllEvents = function(){
    return new Promise(function(resolve, reject){
        //TODO implement
    })
}

var getAllSets = function(){
    return new Promise(function(resolve, reject){
        //TODO implement
    })
}

var getAllPlayers = function(){
    return new Promise(function(resolve, reject){
        //TODO implement
    })
}

var parseDataToTournament = function(data){
    var tournament = Object;
    data = JSON.parse(data);
    tournament.prototype.data = data;

    tournament.prototype.getAllPlayers = getAllPlayers;
    tournament.prototype.getAllSets = getAllSets;
    tournament.prototype.getAllEvents = getAllEvents;

    tournament.prototype.getId = function(){
        return data.entities.tournament['id'];
    }
    tournament.prototype.getName = function(){
        return data.entities.tournament['name'];
    }
    tournament.prototype.getSlug = function(){
        return data.entities.tournament['slug'];
    }
    tournament.prototype.getTimezone = function(){
        return data.entities.tournament['timezone'];
    }
    tournament.prototype.getStartTime = function(){
        return new Date(data.entities.tournament['startAt']);
    }
    tournament.prototype.getEndTime = function(){
        return new Date(data.entities.tournament['endAt']);
    }
    tournament.prototype.getWhenRegistrationCloses = function(){
        return new Date(data.entities.tournament['eventRegistrationClosesAt']);
    }
    tournament.prototype.getCity = function(){
        return data.entities.tournament['city'];
    }
    tournament.prototype.getState = function(){
        return data.entities.tournament['addrState'];
    }
    tournament.prototype.getZipCode = function(){
        return data.entities.tournament['postalCode'];
    }
    tournament.prototype.getContactEmail = function(){
        return data.entities.tournament['contactEmail'];
    }
    tournament.prototype.getContactTwitter = function(){
        return data.entities.tournament['contactTwitter'];
    }
    tournament.prototype.getOwnerId = function(){
        return data.entities.tournament['ownerId'];
    }
    tournament.prototype.getVenueFee = function(){
        return data.entities.tournament['venueFee'];
    }
    tournament.prototype.getProcessingFee = function(){
        return data.entities.tournament['processingFee'];
    }
    return tournament;
}

smashgg.prototype.getTournament = function(tournamentName, expands){
    return new Promise(function(resolve, reject){
        if(!tournamentName)
            return reject(new Error('Tournament Name cannot be null'));

        var data = {};
        var name = tournamentName;

        // CREATE THE EXPANDS STRING
        var expandsString = "";
        var expands = {
            event: (expands && expands.event) || true,
            phase: (expands && expands.phase) || true,
            groups: (expands && expands.groups) || true,
            stations: (expands && expands.stations) || true
        };
        for(var property in this.expands){
            if(expands[property])
                expandsString += 'expand[]=property&';
        }

        var url = 'https://api.smash.gg/tournament/' + tournamentName + '?' + expandsString;
        request('GET', url)
            .then(function(data){
                return resolve(parseDataToTournament(data));
            })
            .catch(function(err){
                console.error('Smashgg Tournament: ' + e);
                return reject(err);
            })
    })
}

/** EVENTS */

var getEventPhases = function(){
    return new Promise(function(resolve, reject){
        //TODO implement
    })
}

var getEventPhaseGroups = function(){
    return new Promise(function(resolve, reject){
        //TODO implement
    })
}

var parseDataToEvent = function(data){
    let event = Object;
    data = JSON.parse(data);
    event.prototype.data = data;

    event.prototype.getEventPhases = getEventPhases;
    event.prototype.getEventPhaseGroups = getEventPhaseGroups;

    event.prototype.getName = function(){
        return data.entities.tournament['name'];
    }

    event.prototype.getSlug = function(){
        return data.entities.tournament['slug'];
    }

    event.prototype.getStartTime = function(){
        return new Date(data.entities.tournament['startAt']);
    }

    event.prototype.getEndTime = function(){
        return new Date(data.entities.tournament['endAt']);
    }
    return event;
}

smashgg.prototype.getEvent = function(tournamentName, eventName, expands){

    const EVENT_URL = 'https://api.smash.gg/event/%s?%s';
    const EVENT_SLUG_URL = "https://api.smash.gg/%s/event/%s?%s";

    return new Promise(function(resolve, reject){
        if(!tournamentName)
            return reject(new Error('Tournament Name cannot be null for Event'));
        if(!eventName)
            return reject(new Error('Event Name cannot be null for Event'));

        var data = {};
        var tournamentName = tournamentName;
        var eventName = eventName;

        // CREATE THE EXPANDS STRING
        var expandsString = "";
        var expands = {
            phase: (expands && expands.phase) || true,
            groups: (expands && expands.groups) || true
        };
        for(var property in expands){
            if(expands[property])
                expandsString += format('expand[]=%s&', property);
        }

        smashgg.getTournament(tournamentName)
            .then(function(tournament){
                var slug = tournament.getSlug();
                var url = 
                    'https://api.smash.gg/' + slug + '/event/' + eventName + "?" + expandsString
                request('GET', url)
                    .then(function(data){
                        return resolve(parseDataToEvent(data));
                    })
                    .catch(function(err){
                        console.error('Smashgg Event: ' + err);
                        return reject(err);
                    })
            })
            .catch(function(err){
                console.error('Smashgg Event: ' + err);
                return reject(err);
            })
    })
}

/** PHASES */

var getPhaseGroups = function(){
    return new Promise(function(resolve, reject){
        //TODO implement
    })
}

var parseDataToPhase = function(data){
    let phase = Object;
    data = JSON.parse(data);
    phase.prototype.data = data;

    phase.prototype.getPhaseGroups = getPhaseGroups;

    phase.prototype.getName = function(){
        return new Date(data.entities.tournament['name']);
    }
    phase.prototype.getEventId = function(){
        return new Date(data.entities.tournament['eventId']);
    }
    return phase;
}

smashgg.prototype.getPhase = function(id, expands){
    return new Promise(function(resolve, reject){
        if(!id)
            return reject(new Error('ID cannot be null for Phase Group'));

        var data = {};
        var id = id;

        // CREATE THE EXPANDS STRING
        var expandsString = "";
        var expands = {
            groups: (expands && expands.groups) || true
        };
        for(var property in expands){
            if(expands[property])
                expandsString += format('expand[]=%s&', property);
        }

        var url = 'https://api.smash.gg/phase/' + id + "?" + expandsString;
        request('GET', url)
            .then(function(data){
                return resolve(parseDataToPhase(data));
            })
            .catch(function(err){
                console.error('Smashgg Phase: ' + err);
                return reject(err);
            })
    })
}

/** PHASE GROUPS */

var getPlayers = function(){
    return new Promise(function(resolve, reject){
        //TODO implement
    })
}

var getSets = function(){
    return new Promise(function(resolve, reject){
        //TODO implement
    })
}

var parseDataToPhaseGroup = function(data){
    let phasegroup = Object;
    data = JSON.parse(data);
    phasegroup.prototype.data = data;

    phasegroup.prototype.getPlayers = getPlayers;
    phasegroup.prototype.getSets = getSets;

    phasegroup.prototype.getPhaseId = function(){
        return new Date(data.entities.tournament['phaseId']);
    }
    return phasegroup;
}

smashgg.prototype.getPhaseGroup = function(id, expands){
    return new Promise(function(resolve, reject){
        if(!id)
            return reject(new Error('ID cannot be null for Phase Group'));

        var data = {};
        var id = id;

        // CREATE THE EXPANDS STRING
        var expandsString = "";
        var expands = {
            sets: (expands && expands.sets) || true,
            entrants: (expands && expands.entrants) || true,
            standings: (expands && expands.standings) || true,
            seeds: (expands && expands.seeds) || true
        };
        for(var property in expands){
            if(expands[property])
                expandsString += format('expand[]=%s&', property);
        }

        var url = 'https://api.smash.gg/phase_group/' + id + "?" + expandsString;
        request('GET', url)
            .then(function(data){
                return resolve(parseDataToPhaseGroup(data));
            })
            .catch(function(err){
                console.error('Smashgg Phase Group: ' + e);
                return reject(err);
            })
    })
}

/** Sets */
var parseDataToSet = function(data){
    //TODO implement
}

/** Players */
var parseDataToPlayer = function(data){
    //TODO implement
}
