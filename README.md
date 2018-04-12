# smashgg-promise
## Author: Brandon Cooke & Jarrod Blanton

smashgg-promise is an alternative to the [smash.gg](https://github.com/BrandonCookeDev/smashgg.js) library.
Smashgg-Promise provides Promise functionality to the created smashgg object, and is usable on browsers.

## Version
- 1.1.0
    - File has changed to implement AWS Lambda instead of a static server. If you are on 1.0.0, it is imperative that you upgrade your version now.
    All server operations will be terminated by end of day 4/12/2018 in lieu of the new lambda implementation. This will make 1.0.0 non-operational.
    You do not have to do anything besides upgrade your version. No code changes besides where the data comes from has been made.

## Requirements
* ecmascript 6
* NodeJS (optional)

## Installation
- Download and use in project
- NodeJS (optional)
```bash
npm install --save smashgg-promise
```

## Issues
* Please submit any issues or feature requests to the [Issues Section of the Github](https://github.com/BrandonCookeDev/smashgg-promise/issues)

## Contents
- [Example](#example)
- [Integrations](#integrations)
- [Docs](#docs)
    -  [Tournament](#tournament)
    -  [Event](#event)
    -  [Phase](#phase)
    -  [PhaseGroup](#phasegroup)
    -  [Player](#player)
    -  [Set](#set)

## Example 
```javascript
var smashgg = Object;

smashgg.getTournament('to12')
    .then(to12 => {
        to12.getAllPlayers()
        .then(players => {
            var playerCount = players.length;
            console.log(`${playerCount} players entered Tipped Off 12`);
            // Log basic info about every player
            players.forEach(player => {
                console.log(
                    'Name: ' + player.getName() + '\n',
                    'Tag: ' + player.getTag() + '\n',
                    'State: ' + player.getState() + '\n'
                );
            })
        })
        .catch(err => console.error(err));

        to12.getAllMatches()
            .then(matches => {
                console.log(`${sets.length} total matches were played at Tipped Off 12`);
                matches.forEach(match => {
                    console.log(
                        // Get score
                        `[${match.getRound() + ': ' + match.getWinner().getTag() + ' ' + match.getWinnerScore() + ' - ' + match.getLoserScore() + ' ' + match.getLoser().getTag()}] \n`,
                        // Get winner final placement
                        `${match.getWinner().getTag()} placed  ${match.getWinner().getFinalPlacement()} \n`,
                        // Get loser final placement
                        `${match.getLoser().getTag()} placed ${match.getLoser().getFinalPlacement()} \n`
                    );
                })
            })
            .catch(err => console.error(err));
    })
.catch(error => {
    console.error('An error occurred: ', error);
})
```

##### Output
```
370 players entered Tipped Off 12

Name: Grayson Garrett
 Tag: Gas$
 State: GA

Name: Austin Crews
 Tag: Gladiator
 State: GA

Name: Davis Robertson
 Tag: NIX
 State: SC

.... continues ....

1393 total matches were played at Tipped Off 12

[Winners Round 1: Cloud-9 0 - -1 T] 
 Cloud-9 placed  97 
 T placed 129 

[Winners Round 1: DarkGenex 2 - 0 TheGromm] 
 DarkGenex placed  65 
 TheGromm placed 193 

[Winners Round 1: Gas$ 2 - 0 Ghost] 
 Gas$ placed  49 
 Ghost placed 129 

.... continues ....

```

## Integrations
### Winston
If you would like to add a Winston log that accesses the API's Winston implementation, you may do the following
```javascript
let log = require('winston');
let transports = {
    file: {
        level: info,
        filename: '/tmp/smashgg-promise.log',
        handleExceptions: true,
        json: false,
        maxsize: 5242880, //5MB
        colorize: false
    },
    console: {
        level: debug,
        json: false,
        colorize: true,
        handleExceptions: true
    }
};

log.remove(log.transports.Console); //Remove the default implementation

log.add(log.transports.Console, transports.console); //Add new Console implementation
log.add(log.transports.File, transports.file); //Add new File implementation
```

# Docs
## Tournament
A Tournament in smash-promise is a collection of Events, Phases, and Phases Groups that
categorize different games played, game types within those games, and the matches that
make up those games.

```javascript
var smashgg = Object;

smashgg.getTournament('to12')
    .then(to12 => {
        // Do stuff with tournament
    })
    .catch(e => console.error(e));

```

### Constructor
* **Tournament(name, exands, data);**
    * **tournamentName** [required] - name slug or short tournament name
        * a slug is a string that uniquely identifies a tournament on the platform
            * ex: ceo-2016
        * a shortened name is a set abbreviation for a slug
            * ex: to12
    * **expands** - an object that defines which additional data is sent back. By default all values are marked true.
        * event - boolean - condensed data for the events that comprise this tournament
        * phase - boolean -condensed data for the phases that comprise the events
        * groups - boolean -condensed data for the groups that comprise the phases
        * stations - boolean -condensed data for the stations for each group
    * **data** - JSON string containing all of the information received from the XHR to the smashgg API.

### Methods
#### Promises
* **get(tournamentName, expands)**
    * Returns a Promise that resolves the data retrieved from the XHR to the smashgg API.
    * **Params**:
        * **tournamentName** [required]: name of the tournament. Either slug or shorthand.
        * **expdands** (optional)

* **getAllEvents()**
    * Returns a Promise that resolves an array of all `Events` objects that are part of the Tournament.

* **getAllMatches()**
    * Returns a Promise that resolves an array of all `Match` objects that took place in the Tournament. 
    * **NOTE**: Matches represent a set in order to prevent overriding of 'Set' class.

* **getAllPlayers()**
    * Returns a Promise that resolves an array of all `Player` objects that partook in the Tournament.

#### Getters
* **getId()**
    * returns the id of the tournament
* **getName()**
    * returns the name of the tournament
* **getSlug()**
    * returns the slug for the tournament
* **getTimezone()**
    * returns the string timezone the tournament occurred in
* **getStartTime()**
    * returns a string 'MM-DD-YYYY HH:mm:ss tz' for the start time of the tournament
* **getEndTime()**
    * returns a string 'MM-DD-YYYY HH:mm:ss tz' for the end time of the tournament
* **getWhenRegistrationCloses()**
    * returns a string 'MM-DD-YYYY HH:mm:ss tz' for the time registration is set to close
* **getCity()**
    * returns the city where the tournament occurred
* **getState()**
    * returns the state where the tournament occurred
* **getZipCode()**
    * returns the zip code where the tournament occurred
* **getContactEmail()**
    * return the email address listed for contacting
* **getContactTwitter()**
    * return the twitter handle listed for contacting
* **getOwnerId()**
    * return the id of the tournament owner
* **getVenueFee()**
    * return the cost of the venue fee for the tournament
* **getProcessingFee()**
    * return the cost of the processing fee to register for the tournament

## Event
An Event in smash-promise is a broad collection of matches for a single game and game type.
For instance, Melee Singles is an Event while Melee Doubles is another Event. Events
are comprised of optional Phases and Phases Groups.

```javascript
smashgg.getEvent('to12', 'melee-singles')
    .then(to12event => { 
        to12event.getEventPhases().then(phases => {
            // Do stuff with event phases
        })
        .catch(e => console.error(e));
    })
    .catch(e => console.error(e));
```

### Constructor
* **Event(tournamentName, eventName, expands, data, eventId)**
    * **tournamentName** [required] - tournament slug or shorthand name of the tournament
        * slug: ceo-2016
        * shorthand: to12 (for tipped-off-12-presented-by-the-lab-gaming-center)
    * **eventName** [required] - event slug
        * ex: melee-singles or bracket-pools
    * **expands** - an object that defines which additional data is sent back. By default all values are marked true.
        * phase - boolean -condensed data for the phases that comprises the event
        * groups - boolean -condensed data for the groups that comprise the phases
    * **data** - JSON string containing all of the information received from the XHR to the smashgg API.
    * **eventId** - optional parameter that can be passed in in order to call **getEventById()** rather than default **get()** method.

### Methods
#### Promises
* **getEvent(tournamentName, eventName, expands)**
    * Returns a Promise resolving the JSON data obtained from the XHR to the smashgg API endpoint.

* **getEventById(tournamentName = null, eventId)**
    * An alternative to **getEvent()** that makes use of the event's ID in order to make a request to the smashgg API. 
    * Returns a Promise resolving the JSON data retrieved from the XHR to the API.

* **getEventPhases()**
    * Returns a Promise resolving an array of `Phase` objects for this Event

* **getEventPhaseGroups()**
    * Returns a Promise resolving an array of `PhaseGroup` objects for this Event

#### Getters
* **getName()**
    * returns the name of the event
* **getSlug()**
    * returns the slug for the event
* **getStartTime()**
    * returns a date string (MM-DD-YYYY HH:mm:ss tz) for when the event is set to begin
* **getEndTime()**
    * returns a date string (MM-DD-YYYY HH:mm:ss tz) for when the event is set to end

## Phase
A phase in smash-promise is a subset of matches and brackets inside an Event. For example,
a wave in pools is a Phase. Everything in that Phase is a Group (or Phase Group).

```javascript
let smashgg = Object;

smashgg.getPhase(100046)
    .then(to12phase => {
        var info = [
            {
                key: 'Name',
                value: to12phase.getName()
            },
            {
                key: 'EventId',
                value: to12phase.getEventId()
            }
        ]
    })
    .catch(e => console.error(e))
```

### Constructor
* **Phase(id, expands, data)**
    * **id** [required] - unique identifier for the Phase
    * **expands** - an object that defines which additional data is sent back. By default all values are marked true.
        * groups - boolean -condensed data for the groups that comprise the phases
    * **data** - the parsed data obtained from the XHR to the smashgg API.

### Methods
#### Promises
* **getPhase()**
    * Returns a Promise that resolves a request to the smashgg API endpoint for that particular phase. 
    * This method sits on the Phase classes prototype and references the object's **get()** method.

* **getPhaseGroups()**
    * Returns a Promise resolving an array of `PhaseGroup` objects belonging to this Phase

* **getPhasePlayers()**
    * Returns a Promise resolving an array of `Player` objects that belong to the current Phase.

* **getPhaseSets()**
    * Returns a Promise resolving an array of `Match` objects that have been conducted in this Phase.

#### Getters
* **getName()**
    * returns the name of the Phase
* **getEventId()**
    * returns the id of the Event this Phase belongs to

## PhaseGroup
A Phase Group is the lowest unit on smash.gg. It is a bracket of some sort that belongs to a Phase.

```javascript
let smashgg = Object; 

smashgg.getPhaseGroup(301994)
    .then(to12phasegroup => {
        // Do stuff with phase group
    })
    .catch(e => console.error(e));
```

### Constructor
* **PhaseGroup(id, expands, data)**
    * **id** [required] - unique identifier for this Phase Group
    * **expands** - an object that defines which additional data is sent back. By default all values are marked true.
        * sets - boolean - data for the sets that comprises the phase group
        * entrants - boolean - data for the entrants that comprise the phase group
        * standings - boolean - data for the standings of the entrants for the phase group
        * seeds - boolean - data for the seeding of entrants for the for the phase group
    * **data** - the parsed data obtained from the XHR to the smashgg API.

### Methods
#### Promises
* **getPhaseGroup(id, expands)**
    * Returns a Promise that resolves the JSON data that has been retrieved from the smashgg API endpoint.

* **getPlayers()**
    * Returns a Promise that resolves an array of `Player` objects for the Phase Group.

* **getMatches()**
    * Return a Promise that resolves an array of `Set` objects for the Phase Group.

* **findWinnerLoserByParticipantIds(winnerId, loserId)**
    * Returns a Promise that resolves an array of `Objects` that describing the result of a `Match` that has been played between two players in the Phase Group.

* **findPlayersByParticipantId(id)** 
    * Returns a Promise that resolves an array of `Player` objects that participated in the current Phase Group by that Phase Group's particular ID.

#### Getters
* **getPhaseId()**
    * returns the Phase Id that owns this Phase Group

## Match
A Match is a data object that holds information about a tournament set that took place at a tournament.
The keyword `Match` is used in order to prevent accidental overriding of the native `Set` class.

```javascript
smashgg.getTournament('to12')
    .then(to12 => {
        to12.getAllMatches()
            .then(matches => {
                // Do stuff with matches
            })
            .catch(e => console.error(e));
    })
    .catch(e => console.error(e))
```

### Constructor
* **Match(id, eventId, round, WinnerPlayer, LoserPlayer, data)**
    * **id** [required] - unique identifier of the Set object
    * **eventId** [required] - id of the event this Set belongs to
    * **round** [required] - round name of the Set
    * **WinnerPlayer** [required] - Player object of the winner of the Set
    * **LoserPlayer** [required] - Player object of the loser of the Set
    * **data** - raw data of the Match object retrieved from the smashgg API endpoint. 

### Properties
* no additional properties for Set

### Methods
#### Getters
* **getRound()**
    * return the round name for the Set
* **getWinner()**
    * return the Winner Player object for the Set
* **getLoser()**
    * return the Loser Player object for the Set
* **getGames()**
    * return the list of Games for the Set if available
* **getBestOfCount()**
    * return the best-of count for the Set
* **getWinnerScore()**
    * return the winner's score for the Set
* **getLoserScore()**
    * return the loser's score for the Set
* **getBracketId()**
    * return the bracket id for the Set
* **getMidsizeRoundText()**
    * return the midsize round text for the Set
* **getPhaseGroupId()**
    * return the phase id for the Phase which this Set belongs to
* **getWinnersTournamentPlacement()**
    * return the Set winner's final tournament placing
* **getLosersTournamentPlacement()**
    * return the Set loser's final tournament placing

## Player
A Player is a data object that holds information about players who went to a tournament using smash.gg.
```javascript
smashgg.getTournament('to12')
    .then(to12 => {
        to12.getAllPlayers()
            .then(players => {
                // Do stuff with players
            })
            .catch(e => console.error(e))
    })
    .catch(e => console.error(e));
```

### Constructor
* **Player(id, tag, name, country, state, sponsor, participantId, data)**
    * **id** [required] - the global id for the player in smash.gg
    * **tag** - smash tag of the player
    * **name** - real name of the player
    * **country** - country the player hails from
    * **state/region** - state or region the player is from in the country
    * **sponsor/prefix** - the sponsor (or user selected prefix) of the player
    * **participantId** - the participant id the player was assigned upon registering for a tournament
    * **data** - the raw player data from smash.gg

### Properties
* no additional properties for Player

### Methods
#### Statics
* **resolve(data)**
    * **data** - the raw player data from smash.gg
    * this method takes the raw json payload of a single player in the system and returns a player object

#### Getters
* **getId()**
    * return the id of the Player
* **getTag()**
    * return the tag of the Player
* **getName()**
    * return the name of the Player
* **getCountry()**
    * return the country of the Player
* **getState()**
    * return the state of the Player
* **getSponsor()**
    * return the Sponsor of the Player
* **getParticipantId()**
    * return the participant id of the Player
* **getFinalPlacement()**
    * requires **data** property
    * return the final placement of the Player
