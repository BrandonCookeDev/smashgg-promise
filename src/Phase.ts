import * as NI from './util/NetworkInterface'
import { API_URL, createExpandsString, flatten } from './util/Common'
import { PhaseGroup, Player, GGSet } from './internal'
import { IPhaseGroup, IPlayer, IGGSet } from './internal'


export namespace IPhase{
	export interface Phase{
		id: number
		url: string
		data: Data | string
		isCached: boolean
		rawEncoding: string
		expandsString: string
		expands: Expands

		loadData(data: Data) : Data | string
		
		getData() : Data
		
		//getPhase(id: number, options: Options) : Promise<Phase> 
		
		load(): Promise<Data | string> 
		
		getPhaseGroups(options: Options) : Promise<Array<PhaseGroup>>
		
		getSets(options: Options) : Promise<Array<GGSet>>
		
		getPlayers(options: Options) : Promise<Array<Player>>
		
		getIncompleteSets(options: Options) : Promise<Array<GGSet>>
		
		getCompleteSets(options: Options) : Promise<Array<GGSet>>
		
		getSetsXMinutesBack(minutesBack: number, options: Options) : Promise<Array<GGSet>>
		
		getFromDataEntities(prop: string) : any
		
		getName() : string
		
		getEventId() : number
		
		nullValueString(prop: string) : string
		
		emitPhaseReady() : void
		
		emitPhaseError(err: Error) : void
	}

	export interface Options{
		isCached?: boolean,
		expands?: Expands,
		rawEncoding?: string
	}

	export interface Expands{
		groups: boolean
	}

	export interface Data{
		entities: Entity,
		[x: string]: any
	}

	export interface Entity{
		id: number,
		groups: [IPhaseGroup.Entity],
		[x: string]: any
	}

	export function getDefaultData(){
		return {
			id: 0
		}
	}

	export function getDefaultExpands(){
		return {
			groups: true
		}
	}

	export function getDefaultOptions() : Options{
		return {
			expands: {
				groups: true
			},
			isCached: true,
			rawEncoding: 'json'
		}
	}

	export function parseExpands(expands?: Expands) : Expands{
		return {
			groups: (expands != undefined && expands.groups == false) ? false : true
		};
	}

	export function parseOptions(options: Options) : Options{
		return{
			expands: parseExpands(options.expands),
			isCached: options.isCached != undefined ? options.isCached === true : true,
			rawEncoding: 'json'
		}
	}
}

import Data = IPhase.Data
import Option = IPhase.Options
import Expands = IPhase.Expands

/** PHASES */

export class Phase{

	public id: number
	public expands: Expands
	public data: Data

    constructor(id: number, expands: Expands, data: string){
        this.id = id;
        this.expands = expands;
        this.data = JSON.parse(data).data;
    }

    static get(id: number, expands: Expands = IPhase.getDefaultExpands()) : Promise<Phase>{
        return new Promise(function(resolve, reject){
            if(!id)
                return reject(new Error('ID cannot be null for Phase Group'));
    
            var data = {};
    
            // CREATE THE EXPANDS STRING
            var expandsObj = IPhase.parseExpands(expands)
            var expandsString = createExpandsString(expandsObj);
    
            var url = 'http://smashggcors.us-west-2.elasticbeanstalk.com/phase';
            var postParams = {
                type: 'phase',
                id: id,
                expands: expandsObj
            };

            NI.request('POST', API_URL, postParams)
                .then(function(data){
                    return resolve(new Phase(id, expandsObj, data));
                })
                .catch(function(err){
                    console.error('Smashgg Phase: ' + err.message);
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

    getPhaseGroups() : Promise<PhaseGroup[]> {
        let _this = this;
        return new Promise(function(resolve, reject){
			let groups: Promise<PhaseGroup>[] = []
			
			if(_this.data.entities.groups){
				_this.data.entities.groups.forEach(group => {
					let g: Promise<PhaseGroup> = PhaseGroup.get(group.id);
					groups.push(g)
				});
			}
			Promise.all(groups)
				.then(resolve)
				.catch(reject);
        })
    }

    getPhasePlayers() : Promise<Player[]> {
        let _this = this;
        return new Promise(function(resolve, reject) {
            // get phase groups
			let phasePromises: Promise<PhaseGroup>[] = []
			
			if(_this.data.entities.groups){
				_this.data.entities.groups.map(group => {
					return PhaseGroup.get(group.id);
				});
			}

            Promise.all(phasePromises)
                .then(phaseGroups => {
					let playerPromises: Promise<Player[]>[] = [];
					phaseGroups.forEach(group => {
						playerPromises.push(group.getPlayers());     
					});
                    Promise.all(playerPromises)
                        .then(allPlayers => {
                            // Should give a unique list of players
							let players: Player[] = []
							players = players.concat(...allPlayers);
                            return resolve(players);
                        }).catch(reject);
                })
                .catch(reject);
        })
    }

    getPhaseMatchIds(){
        var promises = this.data.entities.groups.map(group => { 
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

    getPhaseSets() {
        let _this = this;
        return new Promise (function(resolve, reject) {
			let phasePromises: Promise<PhaseGroup>[] = []

			if(_this.data.entities.group){
				_this.data.entities.groups.map(group => {
					return PhaseGroup.get(group.id);
				});
			}

            Promise.all(phasePromises)
				.then(phaseGroups => {
					let setPromises: Promise<GGSet[]>[] = [];
					phaseGroups.forEach(group => {
						setPromises.push(group.getSets());
					})
					Promise.all(setPromises)
						.then(phaseSets => {
							let allSets: GGSet[] = [];
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
