import * as NI from './util/NetworkInterface'
import { Player, GGSet, Event, Phase, PhaseGroup } from './internal'
import { IPlayer, IGGSet, IEvent } from './internal'
import { ICommon, createExpandsString, API_URL, flatten } from './util/Common'
import Entity = ICommon.Entity

export namespace ITournament{
	export interface Tournament{
		data: Data | string
		name: string | number
		expands: Expands 
		
        getAllPlayers(options: Options) : Promise<Array<Player>> 
        getAllSets(options: Options) : Promise<Array<GGSet>>
        getAllEvents(options: Options) : Promise<Array<Event>>
        getIncompleteSets(options: Options) : Promise<Array<GGSet>>
        getCompleteSets(options: Options) : Promise<Array<GGSet>>
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
        entities: Entity
    }

	export interface Entity{
		tournament: TournamentEntity
		event?: [IEvent.EventEntity],
		phase?: [IPhase.Entity],
		groups?: [IPhaseGroup.Entity],
		stations?: {
			[x: string]: any
		},
		[x: string]: any
    }
    
    export interface TournamentEntity{
        id: number,
        [x: string]: any
    }

	export function getDefaultData(): Data{
		return {
			entities: {
                tournament:{ 
                    id: 0
                }
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
        let d = new Date(0);
        d.setUTCSeconds(this.data.entities.tournament['startAt']);
        return d;
    }

    getStartTimeString(){
        let d = this.getStartTime();
        return d.toLocaleDateString();
    }
    getEndTime(){
        let d = new Date(0);
        d.setUTCSeconds(this.data.entities.tournament['endAt']);
        return d;
    }
    getEndTimeString(){
        let d = this.getEndTime();
        return d.toLocaleDateString();
    }
    getWhenRegistrationCloses(){
        let d = new Date(0);
        d.setUTCSeconds(this.data.entities.tournament['eventRegistrationClosesAt']);
        return d;
    }
    getWhenRegistrationClosesString(){
        let d = this.getWhenRegistrationCloses();
        return d.toLocaleDateString();
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
        if(this.data.entities.event){
            let _this = this;

            let promises: Promise<Event>[] = [];
            this.data.entities.event.forEach(event => {
                promises.push(Event.get(_this.name, event.name));
            })

            return Promise.all(promises)

        } else throw new Error('Tournament.getAllEvents: no event property on entities')
    }

    getAllMatchIds() : Promise<number[]> {
        if(this.data.entities.groups){
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
            } else throw new Error('Tournament.getAllMatchIds: no phase property on entities')
    }

    getAllSets() : Promise<GGSet[]>{
        if(this.data.entities.groups){
            let groups = this.data.entities.groups;

            let promises: Promise<PhaseGroup>[] = [];
            groups.forEach(group => {
                promises.push(PhaseGroup.get(group.id)); 
            })

            return Promise.all(promises)
                .then(allGroups => {
                    let setsPromises: Promise<GGSet[]>[] = [];
                    allGroups.forEach(group => {
                        setsPromises.push(group.getSets());
                    })
                    return Promise.all(setsPromises)
                })
                .then(allSets => {
                    return flatten(allSets)
                })
        } else throw new Error('Tournament.getAllSets: no groups property on entities')
    }

    getIncompleteSets() : Promise<GGSet[]>{
        return this.getAllSets()
            .then(sets => sets.filter(set => set.isComplete === false));
    }

    getCompleteSets() : Promise<GGSet[]>{
        return this.getAllSets()
            .then(sets => sets.filter(set => set.isComplete === true));
    }

    getAllPlayers() : Promise<Player[]>{
        if(this.data.entities.groups){
            let groupPromises = this.data.entities.groups.map(group => {
                return PhaseGroup.get(group.id);
            });
            return Promise.all(groupPromises)
                .then(groups => {
                    return Promise.all(groups.map(group => group.getPlayers()))
                })
                .then(players => {
                    return flatten(players)
                })
        } else throw new Error('Tournament.getAllPlayers: no groups property on entities')
    }
}
