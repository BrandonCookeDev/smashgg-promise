import * as NI from './util/NetworkInterface'
import { API_URL, createExpandsString } from './util/Common'
import { Player, GGSet } from './internal'
import { IPlayer, IGGSet } from './internal'

import PlayerEntity = IPlayer.Entity
import GGSetEntity = IGGSet.Entity

export namespace IPhaseGroup{

	export interface PhaseGroup{
		id: number
		url: string
		data: Data | string
		rawEncoding: string
		expandsString: string
		expands: Expands
		players: Array<Player>
		sets: Array<GGSet>

		loadData(data: Data) : Data | string
		getData() : Data
		load() : Promise<Data | string>
		getPlayers(options: Options) : Promise<Array<Player>>
		getSets(options: Options) : Promise<Array<GGSet>>
		getCompleteSets(options: Options) : Promise<Array<GGSet>>
		getIncompleteSets(options: Options) : Promise<Array<GGSet>>
		getSetsXMinutesBack(minutes: number, options: Options) : Promise<Array<GGSet>>
		resolveSet(set: IGGSet.SetEntity) : Promise<GGSet | undefined>
		getFromDataEntities(prop: string) : any
		getPhaseId() : number
		getEntrants() : Array<IPlayer.Entity> | [] 
		nullValueString(prop: string) : string
		emitPhaseGroupReady() : void
		emitPhaseGroupError(err: Error) : void
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

export class PhaseGroup{

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

    getPhaseId() : number{
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

    getMatchIds() : Promise<number[]>{
		let _this = this;

		let ids: number[] = [];
		if(_this.data.entities.sets){
			let ids = _this.data.entities.sets.map(set => {
				return set.id;
			})
		}
		return Promise.resolve(ids);
    }
    
    getSets() : Promise<GGSet[]>{
		let _this = this;
		let sets: Promise<GGSet>[] = [];
		if(this.data.entities.sets){
			sets = this.data.entities.sets.map(set => {
				return new Promise(function(resolve, reject){
					//var p = new Promise(function(resolve, reject){
					let isComplete = set.completedAt != null;
					
					let winnerId = !isComplete ? null : 
							set.entrant1Score > set.entrant2Score ? 
								set.entrant1Id : 
								set.entrant2Id;
						
					let loserId = !isComplete ? null : 
						winnerId != set.entrant1Id ? 
							set.entrant1Id : set.entrant2Id;

					_this.findPlayersByIds(winnerId, loserId)
						.then(players: Player[] => {
							let S = new GGSet(
								set.id, 
								set.eventId, 
								set.fullRoundText, 
								players[0],
								players[1],
								isComplete,
								winnerId,
								loserId,
								winnerId,
								loserId,
								JSON.stringify(set)
							);
							return resolve(S);
						})
						.catch(reject)
					});
			})
		}
        return Promise.all(sets);
    }

    findWinnerLoserByParticipantIds(winnerId: number, loserId: number) : Promise<Player[]> {
        var _this = this;
        return new Promise(function(resolve, reject){
            _this.getPlayers()
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

    findPlayersByParticipantId(id: number) : Promise<Player[] | null> {
        var _this = this;
        return new Promise(function(resolve, reject){
            if(!id) return resolve(null);
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
        let promises = [];
        for(var prop in arguments){
            if(typeof prop === 'number')
                promises.push(this.findPlayersByParticipantId(arguments[prop]));
        }
        return Promise.all(promises);
    }
}
