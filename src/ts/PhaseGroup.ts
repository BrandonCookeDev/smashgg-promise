import * as NI from './util/NetworkInterface'
import { API_URL, createExpandsString } from './util/Common'
import { Player, GGSet } from './internal'
import { IPlayer, IGGSet } from './internal'

import PlayerEntity = IPlayer.Entity
import GGSetEntity = IGGSet.Entity

export namespace IPhaseGroup{

	export interface PhaseGroup{
		id: number
		data: Data
		expands: Expands

		getPlayers(options: Options) : Promise<Array<Player>>
		getSets(options: Options) : Promise<Array<GGSet>>
		getCompleteSets(options: Options) : Promise<Array<GGSet>>
		getIncompleteSets(options: Options) : Promise<Array<GGSet>>
		getId() : number
		findPlayerByParticipantId(id: number) : Promise<Player | undefined>
	}

	export interface Options{
		isCached?: boolean,
		rawEncoding?: string,
		expands?: Expands
	}

	export interface Expands{
		sets: boolean,
		entrants: boolean,
		standings: boolean,
		seeds: boolean
	}

	export interface Data{
		entities: Entity
	}

	export interface Entity{
		id: number,
		sets?: [IGGSet.SetEntity],
		entrants?: [PlayerEntity],
		standings?: [{
			[x: string]: any
		}],
		seeds?: [{
			[x: string]: any
		}],
		[x: string]: any
	}

	export function parseOptions(options: Options) : Options{
		return{
			expands: {
				sets: (options.expands != undefined  && options.expands.sets == false) ? false : true,
				entrants: (options.expands != undefined  && options.expands.entrants == false) ? false : true,
				standings: (options.expands != undefined  && options.expands.standings == false) ? false : true,
				seeds: (options.expands != undefined  && options.expands.seeds == false) ? false : true
			},
			isCached: options.isCached != undefined ? options.isCached === true : true,
			rawEncoding: 'json'
		}
	}

	export function getDefaultOptions() : Options{
		return {
			isCached: true,
			rawEncoding: 'json',
			expands: getDefaultExpands()
		}
	}

	export function getDefaultData(): Data{
		return {
			entities:{
				id: 0
			}
		}
	}

	export function getDefaultExpands() : Expands{
		return {
			sets: true,
			entrants: true,
			standings: true,
			seeds: true
		}
	}
}

import Data = IPhaseGroup.Data
import Expands = IPhaseGroup.Expands

/** PHASE GROUPS */

export class PhaseGroup implements IPhaseGroup.PhaseGroup{

	public id: number
	public expands: Expands
	public data: Data

    constructor(id: number, expands: Expands, data: string){
        this.id = id
        this.expands = expands
        this.data = JSON.parse(data).data
    }

    static get(id: number, expands: Expands = IPhaseGroup.getDefaultExpands()) : Promise<PhaseGroup>{
        return new Promise(function(resolve, reject){
            if(!id)
                return reject(new Error('ID cannot be null for Phase Group'));
    
            let data = {};
    
            // CREATE THE EXPANDS STRING
            //let expandsString = createExpandsString(expands)

            let postParams = {
                type: 'phasegroup',
                id: id,
                expands: expands
            };

            NI.request('POST', API_URL, postParams)
                .then(function(data){
                    return resolve(new PhaseGroup(id, expands, data));
                })
                .catch(function(err){
                    console.error('Smashgg Phase: ' + err.message);
                    return reject(err);
                })
        })
	}

    getId() : number{
        return this.data.entities.groups['phaseId'];
    }

    getPlayers() : Promise<Player[]> {
        let _this = this;
        return new Promise(function(resolve, reject){
			let players: Player[] = [];
			if(_this.data.entities.entrants){
				_this.data.entities.entrants.forEach(entrant => {
					let P = Player.resolve(entrant);
					players.push(P);
				});
			}
			return resolve(players);
        });
    }

    getSetIds() : Promise<number[]>{
		let _this = this;

		let ids: number[] = [];
		if(_this.data.entities.sets){
			ids = _this.data.entities.sets.map(set => {
				return set.id;
			})
		}
		return Promise.resolve(ids);
    }
    
    getSets() : Promise<GGSet[]>{
		return this.getSetIds()
			.then(ids => {
				return GGSet.getFromIdArray(ids)
			})
	}
	
	getIncompleteSets() : Promise<GGSet[]> {
		return this.getSets()
			.then(sets => sets.filter(set => set.isComplete === false));
	}

	getCompleteSets() : Promise<GGSet[]> {
		return this.getSets()
			.then(sets => sets.filter(set => set.isComplete === true));
	}

    findPlayerByParticipantId(id: number) : Promise<Player> {
        var _this = this;
        return new Promise(function(resolve, reject){
            _this.getPlayers()
                .then(players => {
                    let player = players.filter(e => {return e.participantId == id});
                    if(player.length)
                        return player[0];
                    else throw new Error('No Player with id ' + id);
                })
                .catch(console.error)
            });
    }

    findPlayersByIds(...ids: number[]) : Promise<Player[]>{
        let promises: Promise<Player>[] = [];
        for(var prop in arguments){
            if(typeof prop === 'number')
                promises.push(this.findPlayerByParticipantId(arguments[prop]));
        }
        return Promise.all(promises);
    }
}
