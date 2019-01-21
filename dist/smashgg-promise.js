var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
define("util/NetworkInterface", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function request(method, url, data) {
        return new Promise(function (resolve, reject) {
            var xhr = new XMLHttpRequest();
            xhr.open(method, url);
            xhr.onload = function () {
                if (this.status >= 200 && this.status < 300) {
                    resolve(xhr.response);
                }
                else {
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
    exports.request = request;
    ;
});
define("util/Common", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.API_URL = 'https://i9nvyv08rj.execute-api.us-west-2.amazonaws.com/prod/smashgg-lambda';
    function flatten(arr, depth) {
        if (depth === void 0) { depth = 1; }
        var root = [];
        depth = depth || 1;
        for (var i = 0; i < depth; i++) {
            for (var j = 0; j < arr.length; j++) {
                var element = arr[i];
                if (Array.isArray(element))
                    root = root.concat(element);
                else
                    root.push(element);
            }
        }
        return root;
    }
    exports.flatten = flatten;
    function createExpandsString(expands) {
        var expandsString = '';
        for (var property in expands) {
            if (expands.hasOwnProperty(property))
                if (expands[property] === true)
                    expandsString += "expand[]=" + property + "&";
        }
        return expandsString;
    }
    exports.createExpandsString = createExpandsString;
    var ICommon;
    (function (ICommon) {
        function parseOptions(options) {
            return {
                isCached: options.isCached != undefined ? options.isCached === true : true,
                concurrency: options.concurrency || 4,
                rawEncoding: 'json'
            };
        }
        ICommon.parseOptions = parseOptions;
    })(ICommon = exports.ICommon || (exports.ICommon = {}));
});
define("Phase", ["require", "exports", "util/NetworkInterface", "util/Common", "internal"], function (require, exports, NI, Common_1, internal_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    NI = __importStar(NI);
    var IPhase;
    (function (IPhase) {
        function getDefaultData() {
            return {
                id: 0
            };
        }
        IPhase.getDefaultData = getDefaultData;
        function getDefaultExpands() {
            return {
                groups: true
            };
        }
        IPhase.getDefaultExpands = getDefaultExpands;
        function getDefaultOptions() {
            return {
                expands: {
                    groups: true
                },
                isCached: true,
                rawEncoding: 'json'
            };
        }
        IPhase.getDefaultOptions = getDefaultOptions;
        function parseExpands(expands) {
            return {
                groups: (expands != undefined && expands.groups == false) ? false : true
            };
        }
        IPhase.parseExpands = parseExpands;
        function parseOptions(options) {
            return {
                expands: parseExpands(options.expands),
                isCached: options.isCached != undefined ? options.isCached === true : true,
                rawEncoding: 'json'
            };
        }
        IPhase.parseOptions = parseOptions;
    })(IPhase = exports.IPhase || (exports.IPhase = {}));
    /** PHASES */
    var Phase = /** @class */ (function () {
        function Phase(id, expands, data) {
            this.id = id;
            this.expands = expands;
            this.data = JSON.parse(data).data;
        }
        Phase.get = function (id, expands) {
            if (expands === void 0) { expands = IPhase.getDefaultExpands(); }
            return new Promise(function (resolve, reject) {
                if (!id)
                    return reject(new Error('ID cannot be null for Phase Group'));
                var data = {};
                // CREATE THE EXPANDS STRING
                var expandsObj = IPhase.parseExpands(expands);
                var expandsString = Common_1.createExpandsString(expandsObj);
                var url = 'http://smashggcors.us-west-2.elasticbeanstalk.com/phase';
                var postParams = {
                    type: 'phase',
                    id: id,
                    expands: expandsObj
                };
                NI.request('POST', Common_1.API_URL, postParams)
                    .then(function (data) {
                    return resolve(new Phase(id, expandsObj, data));
                })
                    .catch(function (err) {
                    console.error('Smashgg Phase: ' + err.message);
                    return reject(err);
                });
            });
        };
        Phase.prototype.getName = function () {
            return this.data.entities.phase['name'];
        };
        Phase.prototype.getEventId = function () {
            return this.data.entities.phase['eventId'];
        };
        Phase.prototype.getPhaseGroups = function () {
            var _this = this;
            return new Promise(function (resolve, reject) {
                var groups = [];
                if (_this.data.entities.groups) {
                    _this.data.entities.groups.forEach(function (group) {
                        var g = internal_1.PhaseGroup.get(group.id);
                        groups.push(g);
                    });
                }
                Promise.all(groups)
                    .then(resolve)
                    .catch(reject);
            });
        };
        Phase.prototype.getPhasePlayers = function () {
            var _this = this;
            return new Promise(function (resolve, reject) {
                // get phase groups
                var phasePromises = [];
                if (_this.data.entities.groups) {
                    _this.data.entities.groups.map(function (group) {
                        return internal_1.PhaseGroup.get(group.id);
                    });
                }
                Promise.all(phasePromises)
                    .then(function (phaseGroups) {
                    var playerPromises = [];
                    phaseGroups.forEach(function (group) {
                        playerPromises.push(group.getPlayers());
                    });
                    Promise.all(playerPromises)
                        .then(function (allPlayers) {
                        // Should give a unique list of players
                        var players = [];
                        players = players.concat.apply(players, allPlayers);
                        return resolve(players);
                    }).catch(reject);
                })
                    .catch(reject);
            });
        };
        Phase.prototype.getPhaseMatchIds = function () {
            var promises = this.data.entities.groups.map(function (group) {
                return internal_1.PhaseGroup.get(group.id).catch(console.error);
            });
            return Promise.all(promises)
                .then(function (groups) {
                var idPromises = groups.map(function (group) {
                    return group.getMatchIds();
                });
                return Promise.all(idPromises)
                    .then(function (idArrays) {
                    return Promise.resolve(Common_1.flatten(idArrays));
                })
                    .catch(console.error);
            })
                .catch(console.error);
        };
        Phase.prototype.getPhaseSets = function () {
            var _this = this;
            return new Promise(function (resolve, reject) {
                var phasePromises = [];
                if (_this.data.entities.group) {
                    _this.data.entities.groups.map(function (group) {
                        return internal_1.PhaseGroup.get(group.id);
                    });
                }
                Promise.all(phasePromises)
                    .then(function (phaseGroups) {
                    var setPromises = [];
                    phaseGroups.forEach(function (group) {
                        setPromises.push(group.getSets());
                    });
                    Promise.all(setPromises)
                        .then(function (phaseSets) {
                        var allSets = [];
                        phaseSets.forEach(function (sets) {
                            sets.forEach(function (set) {
                                allSets.push(set);
                            });
                        });
                        return resolve(allSets);
                    })
                        .catch(reject);
                })
                    .catch(reject);
            });
        };
        return Phase;
    }());
    exports.Phase = Phase;
});
define("PhaseGroup", ["require", "exports", "util/NetworkInterface", "util/Common", "internal"], function (require, exports, NI, Common_2, internal_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    NI = __importStar(NI);
    var IPhaseGroup;
    (function (IPhaseGroup) {
        function parseOptions(options) {
            return {
                expands: {
                    sets: (options.expands != undefined && options.expands.sets == false) ? false : true,
                    entrants: (options.expands != undefined && options.expands.entrants == false) ? false : true,
                    standings: (options.expands != undefined && options.expands.standings == false) ? false : true,
                    seeds: (options.expands != undefined && options.expands.seeds == false) ? false : true
                },
                isCached: options.isCached != undefined ? options.isCached === true : true,
                rawEncoding: 'json'
            };
        }
        IPhaseGroup.parseOptions = parseOptions;
        function getDefaultOptions() {
            return {
                isCached: true,
                rawEncoding: 'json',
                expands: getDefaultExpands()
            };
        }
        IPhaseGroup.getDefaultOptions = getDefaultOptions;
        function getDefaultData() {
            return {
                entities: {
                    id: 0
                }
            };
        }
        IPhaseGroup.getDefaultData = getDefaultData;
        function getDefaultExpands() {
            return {
                sets: true,
                entrants: true,
                standings: true,
                seeds: true
            };
        }
        IPhaseGroup.getDefaultExpands = getDefaultExpands;
    })(IPhaseGroup = exports.IPhaseGroup || (exports.IPhaseGroup = {}));
    /** PHASE GROUPS */
    var PhaseGroup = /** @class */ (function () {
        function PhaseGroup(id, expands, data) {
            this.id = id;
            this.expands = expands;
            this.data = JSON.parse(data).data;
        }
        PhaseGroup.get = function (id, expands) {
            if (expands === void 0) { expands = IPhaseGroup.getDefaultExpands(); }
            return new Promise(function (resolve, reject) {
                if (!id)
                    return reject(new Error('ID cannot be null for Phase Group'));
                var data = {};
                // CREATE THE EXPANDS STRING
                //let expandsString = createExpandsString(expands)
                var postParams = {
                    type: 'phasegroup',
                    id: id,
                    expands: expands
                };
                NI.request('POST', Common_2.API_URL, postParams)
                    .then(function (data) {
                    return resolve(new PhaseGroup(id, expands, data));
                })
                    .catch(function (err) {
                    console.error('Smashgg Phase: ' + err.message);
                    return reject(err);
                });
            });
        };
        PhaseGroup.prototype.getPhaseId = function () {
            return this.data.entities.groups['phaseId'];
        };
        PhaseGroup.prototype.getPlayers = function () {
            var _this = this;
            return new Promise(function (resolve, reject) {
                var players = [];
                if (_this.data.entities.entrants) {
                    _this.data.entities.entrants.forEach(function (entrant) {
                        var P = internal_2.Player.resolve(entrant);
                        players.push(P);
                    });
                }
                return resolve(players);
            });
        };
        PhaseGroup.prototype.getMatchIds = function () {
            var _this = this;
            var ids = [];
            if (_this.data.entities.sets) {
                ids = _this.data.entities.sets.map(function (set) {
                    return set.id;
                });
            }
            return Promise.resolve(ids);
        };
        PhaseGroup.prototype.getSets = function () {
            return this.getMatchIds()
                .then(function (ids) {
                return internal_2.GGSet.getFromIdArray(ids);
            });
        };
        PhaseGroup.prototype.findPlayerByParticipantId = function (id) {
            var _this = this;
            return new Promise(function (resolve, reject) {
                _this.getPlayers()
                    .then(function (players) {
                    var player = players.filter(function (e) { return e.participantId == id; });
                    if (player.length)
                        return player[0];
                    else
                        throw new Error('No Player with id ' + id);
                })
                    .catch(console.error);
            });
        };
        PhaseGroup.prototype.findPlayersByIds = function () {
            var ids = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                ids[_i] = arguments[_i];
            }
            var promises = [];
            for (var prop in arguments) {
                if (typeof prop === 'number')
                    promises.push(this.findPlayerByParticipantId(arguments[prop]));
            }
            return Promise.all(promises);
        };
        return PhaseGroup;
    }());
    exports.PhaseGroup = PhaseGroup;
});
define("Tournament", ["require", "exports", "util/NetworkInterface", "internal", "util/Common"], function (require, exports, NI, internal_3, Common_3) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    NI = __importStar(NI);
    var ITournament;
    (function (ITournament) {
        function getDefaultData() {
            return {
                entities: {
                    tournament: {
                        id: 0
                    }
                }
            };
        }
        ITournament.getDefaultData = getDefaultData;
        function getDefaultExpands() {
            return {
                event: true,
                phase: true,
                groups: true,
                stations: true
            };
        }
        ITournament.getDefaultExpands = getDefaultExpands;
        function getDefaultOptions() {
            return {
                expands: {
                    event: true,
                    phase: true,
                    groups: true,
                    stations: true
                },
                isCached: true,
                rawEncoding: 'json'
            };
        }
        ITournament.getDefaultOptions = getDefaultOptions;
        function parseExpands(expands) {
            return {
                event: (expands != undefined && expands.event == false) ? false : true,
                phase: (expands != undefined && expands.phase == false) ? false : true,
                groups: (expands != undefined && expands.groups == false) ? false : true,
                stations: (expands != undefined && expands.stations == false) ? false : true
            };
        }
        ITournament.parseExpands = parseExpands;
        function parseOptions(options) {
            return {
                expands: parseExpands(options.expands),
                isCached: options.isCached != undefined ? options.isCached === true : true,
                rawEncoding: 'json'
            };
        }
        ITournament.parseOptions = parseOptions;
    })(ITournament = exports.ITournament || (exports.ITournament = {}));
    /** TOURNAMENTS */
    var Tournament = /** @class */ (function () {
        function Tournament(name, expands, data) {
            this.name = name;
            this.expands = expands;
            this.data = JSON.parse(data).data;
        }
        Tournament.get = function (tournamentName, expands) {
            if (expands === void 0) { expands = ITournament.getDefaultExpands(); }
            return new Promise(function (resolve, reject) {
                if (!tournamentName)
                    return reject(new Error('Tournament Name cannot be null'));
                var data = {};
                var name = tournamentName;
                expands = ITournament.parseExpands(expands);
                var expandsString = Common_3.createExpandsString(expands);
                var postParams = {
                    type: 'tournament',
                    tournamentName: tournamentName,
                    expands: expands
                };
                NI.request('POST', Common_3.API_URL, postParams)
                    .then(function (data) {
                    return resolve(new Tournament(name, expands, data));
                })
                    .catch(function (err) {
                    console.error('Smashgg Tournament: ' + err.message);
                    return reject(err);
                });
            });
        };
        Tournament.prototype.getId = function () {
            return this.data.entities.tournament['id'];
        };
        Tournament.prototype.getName = function () {
            return this.data.entities.tournament['name'];
        };
        Tournament.prototype.getSlug = function () {
            return this.data.entities.tournament['slug'];
        };
        Tournament.prototype.getTimezone = function () {
            return this.data.entities.tournament['timezone'];
        };
        Tournament.prototype.getStartTime = function () {
            var d = new Date(0);
            d.setUTCSeconds(this.data.entities.tournament['startAt']);
            return d;
        };
        Tournament.prototype.getStartTimeString = function () {
            var d = this.getStartTime();
            return d.toLocaleDateString();
        };
        Tournament.prototype.getEndTime = function () {
            var d = new Date(0);
            d.setUTCSeconds(this.data.entities.tournament['endAt']);
            return d;
        };
        Tournament.prototype.getEndTimeString = function () {
            var d = this.getEndTime();
            return d.toLocaleDateString();
        };
        Tournament.prototype.getWhenRegistrationCloses = function () {
            var d = new Date(0);
            d.setUTCSeconds(this.data.entities.tournament['eventRegistrationClosesAt']);
            return d;
        };
        Tournament.prototype.getWhenRegistrationClosesString = function () {
            var d = this.getWhenRegistrationCloses();
            return d.toLocaleDateString();
        };
        Tournament.prototype.getCity = function () {
            return this.data.entities.tournament['city'];
        };
        Tournament.prototype.getState = function () {
            return this.data.entities.tournament['addrState'];
        };
        Tournament.prototype.getZipCode = function () {
            return this.data.entities.tournament['postalCode'];
        };
        Tournament.prototype.getContactEmail = function () {
            return this.data.entities.tournament['contactEmail'];
        };
        Tournament.prototype.getContactTwitter = function () {
            return this.data.entities.tournament['contactTwitter'];
        };
        Tournament.prototype.getOwnerId = function () {
            return this.data.entities.tournament['ownerId'];
        };
        Tournament.prototype.getVenueFee = function () {
            return this.data.entities.tournament['venueFee'];
        };
        Tournament.prototype.getProcessingFee = function () {
            return this.data.entities.tournament['processingFee'];
        };
        Tournament.prototype.getAllEvents = function () {
            if (this.data.entities.event) {
                var _this_1 = this;
                var promises_1 = [];
                this.data.entities.event.forEach(function (event) {
                    promises_1.push(internal_3.Event.get(_this_1.name, event.name));
                });
                return Promise.all(promises_1);
            }
            else
                throw new Error('Tournament.getAllEvents: no event property on entities');
        };
        Tournament.prototype.getAllMatchIds = function () {
            if (this.data.entities.groups) {
                var promises = this.data.entities.groups.map(function (group) {
                    return internal_3.PhaseGroup.get(group.id).catch(console.error);
                });
                return Promise.all(promises)
                    .then(function (groups) {
                    var idPromises = groups.map(function (group) {
                        return group.getMatchIds();
                    });
                    return Promise.all(idPromises)
                        .then(function (idArrays) {
                        return Promise.resolve(Common_3.flatten(idArrays));
                    })
                        .catch(console.error);
                })
                    .catch(console.error);
            }
            else
                throw new Error('Tournament.getAllMatchIds: no phase property on entities');
        };
        Tournament.prototype.getAllSets = function () {
            if (this.data.entities.groups) {
                var groups = this.data.entities.groups;
                var promises_2 = [];
                groups.forEach(function (group) {
                    promises_2.push(internal_3.PhaseGroup.get(group.id));
                });
                return Promise.all(promises_2)
                    .then(function (allGroups) {
                    var setsPromises = [];
                    allGroups.forEach(function (group) {
                        setsPromises.push(group.getSets());
                    });
                    return Promise.all(setsPromises);
                })
                    .then(function (allSets) {
                    return Common_3.flatten(allSets);
                });
            }
            else
                throw new Error('Tournament.getAllSets: no groups property on entities');
        };
        Tournament.prototype.getIncompleteSets = function () {
            return this.getAllSets()
                .then(function (sets) { return sets.filter(function (set) { return set.isComplete === false; }); });
        };
        Tournament.prototype.getCompleteSets = function () {
            return this.getAllSets()
                .then(function (sets) { return sets.filter(function (set) { return set.isComplete === true; }); });
        };
        Tournament.prototype.getAllPlayers = function () {
            if (this.data.entities.groups) {
                var groupPromises = this.data.entities.groups.map(function (group) {
                    return internal_3.PhaseGroup.get(group.id);
                });
                return Promise.all(groupPromises)
                    .then(function (groups) {
                    return Promise.all(groups.map(function (group) { return group.getPlayers(); }));
                })
                    .then(function (players) {
                    return Common_3.flatten(players);
                });
            }
            else
                throw new Error('Tournament.getAllPlayers: no groups property on entities');
        };
        return Tournament;
    }());
    exports.Tournament = Tournament;
});
define("Player", ["require", "exports", "util/NetworkInterface", "util/Common"], function (require, exports, NI, Common_4) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    NI = __importStar(NI);
    var IPlayer;
    (function (IPlayer) {
        function getDefaultData() {
            return {
                entities: {
                    id: 0,
                    eventId: 0,
                    mutations: {
                        participants: {
                            "0": {
                                id: 0,
                                gamerTag: ''
                            }
                        },
                        players: {
                            "0": {
                                id: 0,
                                gamerTag: ''
                            }
                        }
                    }
                }
            };
        }
        IPlayer.getDefaultData = getDefaultData;
        function getDefaultEntity() {
            return {
                id: 0,
                eventId: 0,
                mutations: {
                    participants: {
                        "0": {
                            id: 0,
                            gamerTag: ''
                        }
                    },
                    players: {
                        "0": {
                            id: 0,
                            gamerTag: ''
                        }
                    }
                }
            };
        }
        IPlayer.getDefaultEntity = getDefaultEntity;
    })(IPlayer = exports.IPlayer || (exports.IPlayer = {}));
    /** Players */
    var Player = /** @class */ (function () {
        function Player(id, tag, data, name, country, state, sponsor, participantId) {
            this.data = IPlayer.getDefaultData();
            this.participantId = 0;
            if (!id)
                throw new Error('Player ID cannot be null');
            this.id = id;
            this.tag = tag;
            this.name = name;
            this.country = country;
            this.state = state;
            this.sponsor = sponsor;
            this.participantId = participantId;
            if (data)
                this.data = JSON.parse(data);
        }
        Player.resolve = function (entity) {
            try {
                var playerId = 0;
                var participantId = 0;
                for (var id in entity.mutations.players) {
                    if (typeof id !== 'number')
                        break;
                    playerId = id;
                }
                var playerDetails = entity.mutations.players[playerId];
                var P = new Player(+playerId, playerDetails.gamerTag, JSON.stringify(entity), playerDetails.name, playerDetails.country, playerDetails.state, playerDetails.prefix, +entity.id);
                return P;
            }
            catch (e) {
                console.error(e.message);
                throw e;
            }
        };
        Player.get = function (id) {
            var postParams = {
                type: 'player',
                id: id
            };
            return NI.request('POST', Common_4.API_URL, postParams)
                .then(function (data) {
                return Player.resolve(data);
            })
                .catch(console.error);
        };
        Player.getFromIdArray = function (idArray) {
            var postParams = {
                type: 'players',
                idArray: idArray
            };
            return NI.request('POST', Common_4.API_URL, postParams)
                .then(function (data) {
                return data.map(function (player) { return Player.resolve(player); });
            })
                .catch(console.error);
        };
        Player.prototype.getId = function () {
            return this.id;
        };
        Player.prototype.getTag = function () {
            return this.tag;
        };
        Player.prototype.getName = function () {
            return this.name;
        };
        Player.prototype.getCountry = function () {
            return this.country;
        };
        Player.prototype.getState = function () {
            return this.state;
        };
        Player.prototype.getSponsor = function () {
            return this.sponsor;
        };
        Player.prototype.getParticipantId = function () {
            return this.participantId;
        };
        Player.prototype.getFinalPlacement = function () {
            return this.data.finalPlacement;
        };
        return Player;
    }());
    exports.Player = Player;
});
define("GGSet", ["require", "exports", "util/NetworkInterface", "util/Common", "internal"], function (require, exports, NI, Common_5, internal_4) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    NI = __importStar(NI);
    /** Sets */
    var GGSet = /** @class */ (function () {
        function GGSet(id, eventId, round, isComplete, data, winner, loser, score1, score2, winnerId, loserId) {
            if (isComplete === void 0) { isComplete = false; }
            if (winner === void 0) { winner = undefined; }
            if (loser === void 0) { loser = undefined; }
            if (score1 === void 0) { score1 = 0; }
            if (score2 === void 0) { score2 = 0; }
            if (winnerId === void 0) { winnerId = 0; }
            if (loserId === void 0) { loserId = 0; }
            if (!id)
                throw new Error('Id for Set cannot be null');
            if (!eventId)
                throw new Error('Event Id for Set cannot be null');
            if (!round)
                throw new Error('Round for Set cannot be null');
            if (winner != undefined && !(winner instanceof internal_4.Player))
                throw new Error('Winner Player for Set cannot be null, and must be an instance of ggPlayer');
            if (loser != undefined && !(loser instanceof internal_4.Player))
                throw new Error('Loser Player for Set cannot be null, and must be an instance of ggPlayer');
            this.id = id;
            this.eventId = eventId;
            this.round = round;
            this.data = data;
            this.winner = winner;
            this.loser = loser;
            this.score1 = score1;
            this.score2 = score2;
            this.isComplete = isComplete;
            this.winnerId = winnerId;
            this.loserId = loserId;
        }
        GGSet.resolve = function (data) {
            return new Promise(function (resolve, reject) {
                var playerIds = [data.entities.sets.winnerId, data.entities.sets.loserId].filter(function (id) { return id != undefined; });
                internal_4.Player.getFromIdArray(playerIds)
                    .then(function (players) {
                    var winner = data.entities.sets.winnerId ?
                        players.filter(function (player) { return player.id === data.entities.sets.winnerId; })[0] :
                        undefined;
                    var loser = data.entities.sets.loserId ?
                        players.filter(function (player) { return player.id === data.entities.sets.loserId; })[0] :
                        undefined;
                    var winnerScore = Math.max.apply(null, ([data.entities.sets.entrant1Score, data.entities.sets.entrant2Score].filter(function (score) { return score != undefined; })));
                    var loserScore = Math.min.apply(null, ([data.entities.sets.entrant1Score, data.entities.sets.entrant2Score].filter(function (score) { return score != undefined; })));
                    return new GGSet(data.entities.sets.id, data.entities.sets.eventId, data.entities.sets.fullRoundText, data.entities.sets.completedAt != undefined, data.entities.sets, winner, loser, winnerScore, loserScore, winner != undefined ? winner.id : 0, loser != undefined ? loser.id : 0);
                })
                    .catch(reject);
            });
        };
        GGSet.get = function (id) {
            var postParams = {
                type: 'set',
                id: id
            };
            return NI.request('POST', Common_5.API_URL, postParams)
                .then(function (data) {
                return GGSet.resolve(data);
            })
                .catch(console.error);
        };
        GGSet.getFromIdArray = function (idArray) {
            var postParams = {
                type: 'sets',
                idArray: idArray
            };
            return NI.request('POST', Common_5.API_URL, postParams)
                .then(function (data) {
                return Promise.all(data.map(function (set) {
                    return GGSet.resolve(set);
                }));
            })
                .catch(console.error);
        };
        GGSet.prototype.getIsComplete = function () {
            return this.isComplete;
        };
        GGSet.prototype.getRound = function () {
            return this.round;
        };
        GGSet.prototype.getWinner = function () {
            return this.winner;
        };
        GGSet.prototype.getLoser = function () {
            return this.loser;
        };
        GGSet.prototype.getWinnerId = function () {
            return this.winnerId;
        };
        GGSet.prototype.getLoserId = function () {
            return this.loserId;
        };
        GGSet.prototype.getGames = function () {
            return this.data.games;
        };
        GGSet.prototype.getBestOfCount = function () {
            return this.data.bestOf;
        };
        GGSet.prototype.getWinnerScore = function () {
            if (this.score1 && this.score2)
                return this.score1 > this.score2 ? this.score1 : this.score2;
            else if (this.score1 && !this.score2)
                return this.score1;
            else if (this.score2 && !this.score1)
                return this.score2;
            else
                return undefined;
        };
        GGSet.prototype.getLoserScore = function () {
            if (this.score1 && this.score2)
                return this.score1 < this.score2 ? this.score2 : this.score1;
            else
                return undefined;
        };
        GGSet.prototype.getBracketId = function () {
            return this.data.bracketId;
        };
        GGSet.prototype.getMidsizeRoundText = function () {
            return this.data.midRoundText;
        };
        GGSet.prototype.getPhaseGroupId = function () {
            return this.data.phaseGroupId;
        };
        /*
        getWinnersTournamentPlacement(){
            return this.winner.getFinalPlacement();
        }
    
        getLosersTournamentPlacement(){
            return this.LoserPlayer.getFinalPlacement();
        }
        */
        GGSet.prototype.getCompletedAt = function () {
            var ret = new Date(0);
            this.data.completedAt ? ret.setUTCSeconds(this.data.completedAt) : undefined;
            return ret;
        };
        GGSet.prototype.getStartedAt = function () {
            var ret = new Date(0);
            this.data.startedAt ? ret.setUTCSeconds(this.data.startedAt) : undefined;
            return ret;
        };
        return GGSet;
    }());
    exports.GGSet = GGSet;
});
define("internal", ["require", "exports", "Tournament", "Phase", "PhaseGroup", "Player", "GGSet", "Event"], function (require, exports, Tournament_1, Phase_1, PhaseGroup_1, Player_1, GGSet_1, Event_1) {
    "use strict";
    function __export(m) {
        for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
    }
    Object.defineProperty(exports, "__esModule", { value: true });
    __export(Tournament_1);
    __export(Phase_1);
    __export(PhaseGroup_1);
    __export(Player_1);
    __export(GGSet_1);
    __export(Event_1);
});
define("Event", ["require", "exports", "util/NetworkInterface", "util/Common", "internal", "internal"], function (require, exports, NI, Common_6, internal_5, internal_6) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    NI = __importStar(NI);
    var IEvent;
    (function (IEvent) {
        function parseExpands(expands) {
            return {
                phase: (expands != undefined && expands.phase == false) ? false : true,
                groups: (expands != undefined && expands.groups == false) ? false : true
            };
        }
        IEvent.parseExpands = parseExpands;
        function getDefaultData() {
            return {
                tournament: internal_6.ITournament.getDefaultData(),
                event: getDefaultEventData()
            };
        }
        IEvent.getDefaultData = getDefaultData;
        function getDefaultExpands() {
            return {
                phase: true,
                groups: true
            };
        }
        IEvent.getDefaultExpands = getDefaultExpands;
        function getDefaultEventData() {
            return {
                entities: {
                    event: {
                        id: 0,
                        slug: '',
                        tournamentId: 0
                    }
                }
            };
        }
        IEvent.getDefaultEventData = getDefaultEventData;
        function getTournamentSlug(slug) {
            return slug.substring(slug.indexOf('/') + 1, slug.indexOf('/', slug.indexOf('/') + 1));
        }
        IEvent.getTournamentSlug = getTournamentSlug;
        function getDefaultOptions() {
            return {
                expands: {
                    phase: true,
                    groups: true
                },
                isCached: true,
                rawEncoding: 'json'
            };
        }
        IEvent.getDefaultOptions = getDefaultOptions;
        function parseOptions(options) {
            return {
                expands: {
                    phase: (options.expands != undefined && options.expands.phase == false) ? false : true,
                    groups: (options.expands != undefined && options.expands.groups == false) ? false : true
                },
                isCached: options.isCached != undefined ? options.isCached === true : true,
                rawEncoding: 'json'
            };
        }
        IEvent.parseOptions = parseOptions;
    })(IEvent = exports.IEvent || (exports.IEvent = {}));
    /** EVENTS */
    var Event = /** @class */ (function () {
        function Event(tournamentName, eventName, expands, data, eventId) {
            if (expands === void 0) { expands = IEvent.getDefaultExpands(); }
            this.eventId = eventId;
            this.tournamentName = tournamentName;
            this.eventName = eventName;
            this.expands = expands;
            this.data = JSON.parse(data).data;
        }
        Event.get = function (tournamentName, eventName, expands) {
            if (expands === void 0) { expands = IEvent.getDefaultExpands(); }
            return new Promise(function (resolve, reject) {
                var data = {};
                // CREATE THE EXPANDS STRING
                var expandsObj = IEvent.parseExpands(expands);
                var expandsString = Common_6.createExpandsString(expandsObj);
                var postParams = {
                    type: 'event',
                    tournamentName: tournamentName,
                    eventName: eventName,
                    expands: expandsObj
                };
                NI.request('POST', Common_6.API_URL, postParams)
                    .then(function (data) {
                    return resolve(new Event(tournamentName, eventName, expandsObj, data, undefined));
                })
                    .catch(function (err) {
                    console.error('Smashgg Event: ' + err.message);
                    return reject(err);
                });
            });
        };
        Event.getEventById = function (tournamentName, eventId) {
            return new Promise(function (resolve, reject) {
                var postParams = {
                    type: 'event',
                    eventId: eventId
                };
                NI.request('POST', Common_6.API_URL, postParams)
                    .then(function (data) {
                    return resolve(new Event(tournamentName, data.name, undefined, data, eventId));
                })
                    .catch(function (err) {
                    console.error('Smashgg Event: ' + err.message);
                    return reject(err);
                });
            });
        };
        Event.prototype.getName = function () {
            return this.data.entities.event['name'];
        };
        Event.prototype.getSlug = function () {
            return this.data.entities.event['slug'];
        };
        Event.prototype.getStartTime = function () {
            return new Date(this.data.entities.event['startAt']);
        };
        Event.prototype.getEndTime = function () {
            return new Date(this.data.entities.event['endAt']);
        };
        Event.prototype.getEventPhases = function () {
            if (this.data.entities.phase) {
                var _this_2 = this;
                return new Promise(function (resolve, reject) {
                    var promises = [];
                    if (_this_2.data.entities.phase) {
                        promises = _this_2.data.entities.phase.map(function (p) {
                            return internal_5.Phase.get(p.id);
                        });
                    }
                    Promise.all(promises).then(resolve).catch(reject);
                });
            }
            else
                throw new Error('no phase property on entities');
        };
        Event.prototype.getEventMatchIds = function () {
            if (this.data.entities.groups) {
                var groupPromises = this.data.entities.groups.map(function (group) {
                    return internal_5.PhaseGroup.get(group.id).catch(console.error);
                });
                return Promise.all(groupPromises)
                    .then(function (groups) {
                    var idPromises = groups.map(function (group) {
                        return group.getMatchIds();
                    });
                    return Promise.all(idPromises)
                        .then(function (idArrays) {
                        return Promise.resolve(Common_6.flatten(idArrays));
                    })
                        .catch(console.error);
                })
                    .catch(console.error);
            }
            else
                throw new Error('no groups property on entities');
        };
        Event.prototype.getEventPhaseGroups = function () {
            var _this = this;
            return new Promise(function (resolve, reject) {
                var promises = [];
                if (_this.data.entities.groups) {
                    promises = _this.data.entities.groups.map(function (group) {
                        return internal_5.PhaseGroup.get(group.id);
                    });
                }
                Promise.all(promises)
                    .then(resolve)
                    .catch(reject);
            });
        };
        return Event;
    }());
    exports.Event = Event;
});
