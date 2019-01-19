

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
		id: number,
		[x: string]: any
	}

	export interface Entity{
		id: number,
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

	export function parseOptions(options: Options) : Options{
		return{
			expands: {
				groups: (options.expands != undefined && options.expands.groups == false) ? false : true
			},
			isCached: options.isCached != undefined ? options.isCached === true : true,
			rawEncoding: 'json'
		}
	}
}


/** PHASES */

export class Phase{
    constructor(id, expands, data){
        this.id = id;
        this.expands = expands;
        this.data = JSON.parse(data).data;
    }

    static get(id, expands){
        return new Promise(function(resolve, reject){
            if(!id)
                return reject(new Error('ID cannot be null for Phase Group'));
    
            var data = {};
    
            // CREATE THE EXPANDS STRING
            var expandsString = "";
            var expandsObj = {
                groups: (expands && expands.groups == false) ? false : true
            };
            for(var property in expandsObj){
                if(expandsObj[property] instanceof Function) break;
                else if(expandsObj[property])
                    expandsString += 'expand[]=' + property + '&';
            }
    
            var url = 'http://smashggcors.us-west-2.elasticbeanstalk.com/phase';
            var postParams = {
                type: 'phase',
                id: id,
                expands: expandsObj
            };

            request('POST', API_URL, postParams)
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

    getPhaseGroups(){
        let thisPhase = this;
        return new Promise(function(resolve, reject){
            let groups = [];
            thisPhase.data.entities.groups.forEach(group => {
                let g = PhaseGroup.get(group.id);
                groups.push(g)
            });
            Promise.all(groups)
                .then(resolve)
                .catch(reject);
        })
    }

    getPhasePlayers() {
        let thisPhase = this;
        return new Promise(function(resolve, reject) {
            // get phase groups
            let phasePromises = thisPhase.data.entities.groups.map(group => {
                return PhaseGroup.get(group.id);
            });
            Promise.all(phasePromises)
                .then(phaseGroups => {
                    let playerPromises = [];
                    phaseGroups.forEach(group => {
                        playerPromises.push(group.getPlayers());     
                    });
                    Promise.all(playerPromises)
                        .then(allPlayers => {
                            // Should give a unique list of players
                            let players = [].concat(...allPlayers);
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
                        return Promise.resolve(idArrays.flatten());
                    })
                    .catch(console.error);
            })
            .catch(console.error);
    }

    getPhaseSets() {
        let thisPhase = this;
        return new Promise (function(resolve, reject) {
            let phasePromises = thisPhase.data.entities.groups.map(group => {
                return PhaseGroup.get(group.id);
            });
            Promise.all(phasePromises)
            .then(phaseGroups => {
                let setPromises = [];
                phaseGroups.forEach(group => {
                    setPromises.push(group.getMatches());
                })
                Promise.all(setPromises)
                .then(phaseSets => {
                    let allSets = [];
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
