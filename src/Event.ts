import { ICommon } from './util/Common'
import { Phase, PhaseGroup, GGSet } from './internal'
import { IPhase, IPhaseGroup, IGGSet } from './internal'

import Entity = ICommon.Entity
import PhaseEntity = IPhase.Entity
import PhaseGroupEntity = IPhaseGroup.Entity

export namespace IEvent{
	export interface Event{
		id: number 
		url: string 
		data: Data | string
		eventId: string | number
		expands: Expands 
		expandsString: string 
		tournamentId: string | undefined
		tournamentSlug: string 
		isCached: boolean 
		rawEncoding: string 
		phases: Array<Phase> 
		groups: Array<PhaseGroup> 
		
		loadData(data: object): object | string 
	
		getData() : Data
				
		//getEvent(eventName: string, tournamentName: string, options: Options) : Promise<Event>
	
		//getEventById(id: number, options: Options) : Promise<Event>
			
		load(options: Options, tournamentOptions: TournamentOptions) : Promise<Data | string>
				
		getEventPhases(options: Options) : Promise<Array<Phase>>
	
		getEventPhaseGroups(options: Options) : Promise<Array<PhaseGroup>>
			
		getSets(options: Options) : Promise<Array<GGSet>>
			
		getPlayers(options: Options) : Promise<Array<Player>>
				
		getIncompleteSets(options: Options) : Promise<Array<GGSet>>
	
		getCompleteSets(options: Options) : Promise<Array<GGSet>>
			
		getSetsXMinutesBack(minutesBack: number, options: Options) : Promise<Array<GGSet>> 
			
		getFromEventEntities(prop: string) : any

		getFromTournamentEntities(prop: string) : any

		getId() : number
			
		getName() : string
			
		getTournamentId() : number
			
		getSlug() : string
			
		getTournamentSlug() : string
			
		getStartTime() : Date | null
			
		getStartTimeString() : string | null
			
		getEndTime() : Date | null
			
		getEndTimeString() : string | null
			
		nullValueString(prop: string) : string
	
		emitEventReady() : void
			
		emitEventError(err: Error) : void
		
	}

	export interface Options{
		isCached?: boolean,
		rawEncoding?: string,
		expands?: Expands
	}

	export interface Expands{
		phase: boolean,
		groups: boolean 
	}

	export interface Data{
		tournament: TournamentData,
		event: EventData
	}

	export interface EventData{
		entities: {
			event: EventEntity,
			phase?: [ICommon.Entity],
			groups?: [ICommon.Entity]
		}
	}

	export interface EventEntity{
		slug: string,
		tournamentId: number,
		groups?: [Entity],
		phase?: [Entity],
		[x: string]: any
	}

	export function getDefaultData(): Data{
		return {
			tournament: ITournament.getDefaultData(),
			event: getDefaultEventData()
		}
	}

	export function getDefaultEventData(): EventData{
		return {
			entities: {
				event: {
					id: 0,
					slug: '',
					tournamentId: 0
				}
			}
		}
	}

	export function getTournamentSlug(slug: string) : string{
		return slug.substring(slug.indexOf('/') + 1, slug.indexOf('/', slug.indexOf('/') + 1));
	}


	export function getDefaultOptions(): Options {
		return {
			expands:{
				phase: true,
				groups: true
			},
			isCached: true,
			rawEncoding: 'json'
		}
	}

	export function parseOptions(options: Options) : Options {
		return{
			expands: {
				phase: (options.expands != undefined  && options.expands.phase == false) ? false : true,
				groups: (options.expands != undefined && options.expands.groups == false) ? false : true
			},
			isCached: options.isCached != undefined ? options.isCached === true : true,
			rawEncoding: 'json'
		}
	}
}


/** EVENTS */

export class Event{
    constructor(tournamentName, eventName, expands, data, eventId){
        this.eventId = eventId;
        this.tournamentName = tournamentName;
        this.eventName = eventName;
        this.expands = expands;
        this.data = JSON.parse(data).data;
    }

    static get(tournamentName, eventName, expands){
        return new Promise(function(resolve, reject){
            if(!eventName)
                return reject(new Error('Event Name cannot be null for Event'));
            if(isNaN(eventName) && !tournamentName)
                return reject(new Error('Tournament Name cannot be null for Event'));
    
            var data = {};
    
            // CREATE THE EXPANDS STRING
            var expandsString = "";
            var expandsObj = {
                phase: (expands && expands.phase == false) ? false : true,
                groups: (expands && expands.groups == false) ? false : true
            };
            for(var property in expandsObj){
                if(expandsObj[property] instanceof Function) break;
                else if(expandsObj[property])
                    expandsString += 'expand[]=' + property + '&';
            }


            var postParams = {
                type: 'event',
                tournamentName: tournamentName,
                eventName: eventName,
                expands: expandsObj
            };

            request('POST', API_URL, postParams)
                .then(function(data){
                    return resolve(new Event(tournamentName, eventName, expandsObj, data, null));
                })
                .catch(function(err){
                    console.error('Smashgg Event: ' + err.message);
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
                    console.error('Smashgg Event: ' + err.message);
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

    getEventMatchIds(){
        var groupPromises = this.data.entities.groups.map(group => { 
            return PhaseGroup.get(group.id).catch(console.error); 
        });
        return Promise.all(groupPromises)
            .then(groups => { 
                let idPromises = groups.map(group => { 
                    return group.getMatchIds(); 
                })
                return Promise.all(idPromises)
                    .then(idArrays => { 
                        return Promise.resolve(idArrays.flatten());
                    })
                    .catch(console.error);
            })
            .catch(console.error)
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
