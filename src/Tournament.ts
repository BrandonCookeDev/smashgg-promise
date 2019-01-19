import * as NI from './util/NetworkInterface'
import { GGPlayer, GGSet, Event, Phase, PhaseGroup } from './internal'
import { IPlayer, IGGSet, IEvent } from './internal'
import { ICommon, createExpandsString, API_URL, flatten } from './util/Common'
import Entity = ICommon.Entity

export namespace ITournament{
	export interface Tournament{
		url: string
		data: Data | string
		name: string | number
		expands: Expands 
		expandsString: string 
		isCached: boolean
		rawEncoding: string 
		
		loadData(data: object) : object | string

		getData() : Data

		//getTournament(tournamentId: string, options: Options) : Tournament

		//getTournamentById(tournamentId: number, options: Options) : Tournament

		load() : Promise<Data | string> 

		getAllPlayers(options: Options) : Promise<Array<GGPlayer>> 

		getAllSets(options: Options) : Promise<Array<GGSet>>

		getAllEvents(options: Options) : Promise<Array<Event>>

		getIncompleteSets(options: Options) : Promise<Array<GGSet>>
	
		getCompleteSets(options: Options) : Promise<Array<GGSet>>

		getSetsXMinutesBack(minutesBack: number, options: Options) : Promise<Array<GGSet>>

		getFromDataEntities(prop: string) : any

		getId() : number

		getName() : string 

		getSlug() : string

		getTimezone() : string

		getStartTime() : Date | null

		getStartTimeString() : string | null

		getEndTime() : Date | null

		getEndTimeString() : string | null

		getWhenRegistrationCloses() : Date | null

		getWhenRegistrationClosesString() : string | null

		getCity() : string
		
		getState() : string
		
		getZipCode() : string
		
		getContactEmail() : string
		
		getContactTwitter() : string
		
		getOwnerId() : string 

		getVenueFee() : string
		
		getProcessingFee() : string 
		
		nullValueString(prop: string) : string
		
		emitTournamentReady() : void
		
		emitTournamentError(err: Error) : void
	}

	export interface Options{
		expands?: Expands, 
		isCached?: boolean, 
		rawEncoding?: string
	}

	export interface Expands{
		event: boolean,
		phase: boolean,
		groups: boolean,
		stations: boolean
	}

	export interface Data{
		tournament: Entity
		event?: [IEvent.EventEntity],
		phase?: [IPhase.Entity],
		groups?: [IPhaseGroup.Entity],
		stations?: {
			[x: string]: any
		},
		[x: string]: any
	}

	export function getDefaultData(): Data{
		return {
			tournament:{ 
				id: 0
			}
		}
	}

	export function getDefaultExpands(): Expands{
		return {
			event: true,
			phase: true,
			groups: true,
			stations: true
		}
	}

	export function getDefaultOptions(): Options{
		return {
			expands:{
				event: true,
				phase: true,
				groups: true,
				stations: true
			},
			isCached: true,
			rawEncoding: 'json'
		}
	}

	export function parseExpands(expands?: Expands){
		return {
			event: (expands != undefined && expands.event == false) ? false : true,
			phase: (expands != undefined  && expands.phase == false) ? false : true,
			groups: (expands != undefined && expands.groups == false) ? false : true,
			stations: (expands != undefined && expands.stations == false) ? false : true
		}
	}

	export function parseOptions(options: Options){
		return {
			expands: parseExpands(options.expands),
			isCached: options.isCached != undefined ? options.isCached === true : true,
			rawEncoding: 'json' 
		}
	}
}

import Data = ITournament.Data
import Expands = ITournament.Expands
import Options = ICommon.Options
import TournamentOptions = ITournament.Options
import EventEntity = IEvent.EventEntity
import PlayerEntity = IPlayer.Entity
import GGSetEntity = IGGSet.Entity
import { IPhase } from './Phase';
import { IPhaseGroup } from './PhaseGroup';

/** TOURNAMENTS */
export class Tournament implements ITournament.Tournament{

	public name: string
	public expands: Expands
	public data: Data
	
    constructor(name: string, expands: Expands, data: string){
        this.name = name;
        this.expands = expands;
        this.data = JSON.parse(data).data;
    }

    static get(tournamentName: string, expands: Expands = ITournament.getDefaultExpands()){
        return new Promise(function(resolve, reject){
            if(!tournamentName)
                return reject(new Error('Tournament Name cannot be null'));
    
            let data = {};
			let name = tournamentName;
			
			expands = ITournament.parseExpands(expands)
            let expandsString = createExpandsString(expands)

            let postParams = {
                type: 'tournament',
                tournamentName: tournamentName,
                expands: expands
            };

            NI.request('POST', API_URL, postParams)
                .then(function(data){
                    return resolve(new Tournament(name, expands, data));
                })
                .catch(function(err){
                    console.error('Smashgg Tournament: ' + err.message);
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

    getAllEvents() : Promise<Event[]> {
        var ThisTournament = this;
        return new Promise(function(resolve, reject){
            var events: EventEntity  = ThisTournament.data.entities.event;
        
            var promises: Promise<Event>[] = [];
            events.forEach(event: EventEntity => {
                promises.push(Event.get(ThisTournament.name, event.name));
            })

            Promise.all(promises)
                .then(resolve)
                .catch(console.error);
        })
    }

    getAllMatchIds() : Promise<number[]> {
        var promises: Promise<PhaseGroup>[] = this.data.entities.groups.map(group => { 
            return PhaseGroup.get(group.id).catch(console.error); 
        });
        return Promise.all(promises)
            .then(groups => { 
                let idPromises = groups.map(group => { 
                    return group.getMatchIds(); 
                })
                return Promise.all(idPromises)
                    .then(idArrays => { 
                        return Promise.resolve(flatten(idArrays));
                    })
                    .catch(console.error);
            })
            .catch(console.error);
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
