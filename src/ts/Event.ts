import * as NI from './util/NetworkInterface'
import { API_URL, ICommon, createExpandsString, flatten } from './util/Common'
import { Tournament, Phase, PhaseGroup, Player, GGSet } from './internal'
import { ITournament, IPhase, IPhaseGroup, IPlayer, IGGSet } from './internal'

import Entity = ICommon.Entity
import PhaseEntity = IPhase.Entity
import PhaseGroupEntity = IPhaseGroup.Entity
import TournamentData = ITournament.Data
import TournamentOptions = ITournament.Options

export namespace IEvent{
	export interface Event{
		tournamentName: string
		eventName: string
		expands: Expands
		data: EventData
		eventId? : number
				
		getEventPhases(options: Options) : Promise<Array<Phase>>
		getEventPhaseGroups(options: Options) : Promise<Array<PhaseGroup>>		
		getSets(options: Options) : Promise<Array<GGSet>>		
		getPlayers(options: Options) : Promise<Array<Player>>			
		getIncompleteSets(options: Options) : Promise<Array<GGSet>>
		getCompleteSets(options: Options) : Promise<Array<GGSet>>
		getId() : number
		getName() : string	
		getTournamentId() : number
		getSlug() : string
		getTournamentSlug() : string
		getStartTime() : Date | null
		getStartTimeString() : string | null
		getEndTime() : Date | null
		getEndTimeString() : string | null		
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

	export function parseExpands(expands: Expands) : Expands {
		return {
			phase: (expands != undefined && expands.phase == false) ? false : true,
			groups: (expands != undefined && expands.groups == false) ? false : true
		}
	}

	export function getDefaultData(): Data{
		return {
			tournament: ITournament.getDefaultData(),
			event: getDefaultEventData()
		}
	}

	export function getDefaultExpands(): Expands{
		return {
			phase: true,
			groups: true
		};
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

import Data = IEvent.EventData
import Expands = IEvent.Expands
import EventEntity = IEvent.EventEntity


/** EVENTS */

export class Event implements IEvent.Event{

	public tournamentName: string
	public eventName: string
	public expands: Expands
	public data: Data
	public eventId: number | undefined

    constructor(tournamentName: string, eventName: string, expands: Expands = IEvent.getDefaultExpands(), data: string, eventId?: number){
        this.eventId = eventId;
        this.tournamentName = tournamentName;
        this.eventName = eventName;
        this.expands = expands;
        this.data = JSON.parse(data).data;
    }

    static get(tournamentName: string, eventName: string, expands: Expands = IEvent.getDefaultExpands()) : Promise<Event>{
        return new Promise(function(resolve, reject){    
            let data = {};
    
            // CREATE THE EXPANDS STRING
            let expandsObj = IEvent.parseExpands(expands)
            let expandsString = createExpandsString(expandsObj)
           
            let postParams = {
                type: 'event',
                tournamentName: tournamentName,
                eventName: eventName,
                expands: expandsObj
            };

            NI.request('POST', API_URL, postParams)
                .then(function(data){
                    return resolve(new Event(tournamentName, eventName, expandsObj, data, undefined));
                })
                .catch(function(err){
                    console.error('Smashgg Event: ' + err.message);
                    return reject(err);
                })
        })
    }

    static getEventById(tournamentName: string, eventId: number) : Promise<Event> {
        return new Promise(function(resolve, reject){
			
            var postParams = {
				type: 'event',
                eventId: eventId
			}
			
            NI.request('POST', API_URL, postParams)
                .then(function(data){
                    return resolve(new Event(tournamentName, data.name, undefined, data, eventId));
                })
                .catch(function(err){
                    console.error('Smashgg Event: ' + err.message);
                    return reject(err);
                })
        })
	}
	
	getId(){
		return this.data.entities.event['id'];
	}

	getTournamentId(){
		return this.data.entities.event['tournamentId']
	}

	getTournamentSlug(){
		return this.data.entities.event['slug']
	}

    getName(){
        return this.data.entities.event['name'];
    }

    getSlug(){
        return this.data.entities.event['slug'];
    }

    getStartTime(){
		let d = new Date(0);
		d.setUTCSeconds(this.data.entities.event['startAt']);
        return d;
	}
	
	getStartTimeString(){
		let d = this.getStartTime();
		return d.toLocaleDateString();
	}

    getEndTime(){
		let d = new Date(0);
		d.setUTCSeconds(this.data.entities.event['endAt']);
        return d;
	}
	
	getEndTimeString(){
		let d = this.getEndTime();
		return d.toLocaleDateString();
	}

    getEventPhases() : Promise<Phase[]> {
		if(this.data.entities.phase){
			let _this = this;
			return new Promise(function(resolve, reject){
				let promises: Promise<Phase>[] = []
				if(_this.data.entities.phase){
					promises = _this.data.entities.phase.map(p => {
						return Phase.get(p.id);
					});
				}
				Promise.all(promises).then(resolve).catch(reject);
			});
		} else throw new Error('no phase property on entities')
	}
	
    getEventPhaseGroups() : Promise<PhaseGroup[]> {
        let _this = this;
        return new Promise(function(resolve, reject){
			let promises: Promise<PhaseGroup>[] = []
			if(_this.data.entities.groups){
				promises = _this.data.entities.groups.map(group => {
					return PhaseGroup.get(group.id);
				});
			}
			Promise.all(promises)
				.then(resolve)
				.catch(reject);
        });
    }

    getEventSetIds() : Promise<number[]> {
		if(this.data.entities.groups){
			let groupPromises = this.data.entities.groups.map(group => { 
				return PhaseGroup.get(group.id).catch(console.error); 
			});
			return Promise.all(groupPromises)
				.then(groups => { 
					let idPromises: Promise<number[]>[] = groups.map(group => { 
						return group.getMatchIds(); 
					})
					return Promise.all(idPromises)
						.then(idArrays => { 
							return Promise.resolve(flatten(idArrays));
						})
						.catch(console.error);
				})
				.catch(console.error)
		} 
		else throw new Error('no groups property on entities')
	}
	
	getSets() : Promise<GGSet[]> {
		if(this.data.entities.groups){
			return this.getEventSetIds()
				.then( (ids: number[]) => {
					return Promise.all(ids.map(id => GGSet.get(id)))
				})
				.then(sets => {
					return flatten(sets)
				})
		} else throw new Error('Event.getSets: no groups property on entities')
	}

	getIncompleteSets() : Promise<GGSet[]> {
		if(this.data.entities.groups){
			return this.getSets()
				.then(sets => sets.filter(set => set.isComplete === false))
		} else throw new Error('Event.getSets: no groups property on entities')
	}

	getCompleteSets() : Promise<GGSet[]> {
		if(this.data.entities.groups){
			return this.getSets()
				.then(sets => sets.filter(set => set.isComplete === true))
		} else throw new Error('Event.getSets: no groups property on entities')
	}
	
	getPlayers() : Promise<Player[]> {
		if(this.data.entities.event){
			return this.getEventPhaseGroups()
				.then(groups => {
					return groups.map(group => group.getPlayers())
				})
				.then(players => flatten(players))
		} else throw new Error('Event.getPlayers: no event property on entities')
	}

}
