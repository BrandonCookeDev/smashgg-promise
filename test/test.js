smashgg.getTournament('to12')
    .then(to12 => {
        var info = [
            {
                key: 'Id',
                value: to12.getId()
            },
            {
                key: 'Name',
                value: to12.getName()
            },
            {
                key: 'Slug',
                value: to12.getSlug()
            },
            {
                key: 'Timezone',
                value: to12.getTimezone()
            },
            {
                key: 'Start Time',
                value: to12.getStartTime()
            },
            {
                key: 'End Time',
                value: to12.getEndTime()
            },
            {
                key: 'Registration Closes',
                value: to12.getWhenRegistrationCloses()
            },
            {
                key: 'City',
                value: to12.getCity()
            },
            {
                key: 'State',
                value: to12.getState()
            },
            {
                key: 'Zip Code',
                value: to12.getZipCode()
            },
            {
                key: 'Contact Email',
                value: to12.getContactEmail()
            },
            {
                key: 'Contact Twitter',
                value: to12.getContactTwitter()
            },
            {
                key: 'Owner Id',
                value: to12.getOwnerId()
            },
            {
                key: 'Venue Fee',
                value: to12.getVenueFee()
            },
            {
                key: 'Processing Fee',
                value: to12.getProcessingFee()
            },
        ]

        to12.getAllEvents();

        to12.getAllPlayers();
            // .then(players => {
            //     var tableitems = [];
            //     $.each(players, function(i, items){
            //         var el = 
            //             '<tr>' + 
            //             '<td>' + player.getSponsor() + '</td>' +
            //             '<td>' + player.getTag() + '</td>' +
            //             '<td>' + player.getName() + '</td>' + 
            //             '<td>' + player.getState() + '</td>' +
            //             '</tr>'
            //         $('#playerTable').append( el );
            //     })
            // })
            // .catch(console.error);

        to12.getAllSets()
            .then(sets => {
                var tableitems = [];
                $.each(sets, function(i, item){
                    var el = 
                        '<tr>' +
                        '<td>' + item.getWinner().getTag() + '</td>' +
                        '<td>' + item.getWinnerScore() + '</td>' +
                        '<td>' + item.getLoserScore() + '</td>' + 
                        '<td>' + item.getLoser().getTag() + '</td>' +
                        '</tr>'
                    //tableitems.push(el);
                    $('#setsTable').append( el );
                })
                //$('#setsTable tr:last').append( tableitems.join('') );
            }).catch(console.error)
        
        var listitems = [];
        $.each(info, function(i, item){
            var el = '<li><label>' + item.key + '</label>: ' + item.value + '</li>';
            listitems.push(el);
        })
        $('#tournamentName').append( to12.getName() );
        $('#tournamentInfoList').append( listitems.join('') );
    })
    .catch(console.error);

smashgg.getEvent('to12', 'melee-singles')
    .then(to12event => {
        var info = [
            {
                key: 'Name',
                value: to12event.getName()
            },
            {
                key: 'Slug',
                value: to12event.getSlug()
            },
            {
                key: 'Start Time',
                value: to12event.getStartTime()
            },
            {
                key: 'End Time',
                value: to12event.getEndTime()
            }
        ]

        var listitems = [];
        $.each(info, function(i, item){
            var el = '<li><label>' + item.key + '</label>: ' + item.value + "</li>";
            listitems.push(el);
        })
        $('#eventName').append( to12event.getName() );
        $('#eventInfoList').append(listitems.join(''));

        to12event.getEventPhases().then(phases => {
            // console.log('Phase Events = ', phases);
        });

        to12event.getEventPhaseGroups().then(phasegroups => {
            // console.log('Phase Groups = ', phasegroups );
        });
    })
    .catch(console.error);

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

        var listitems = [];
        $.each(info, function(i, item){
            var el = '<li><label>' + item.key + '</label>: ' + item.value + "</li>";
            listitems.push(el);
        })
        $('#phaseName').append( to12phase.getName());
        $('#phaseInfoList').append(listitems.join(''));
        
        to12phase.getPhaseGroups().then(phaseGroups => {
            // console.log('Phase Groups: ', phaseGroups);
        })
    })
    .catch(console.error);

smashgg.getPhaseGroup(301994)
    .then(to12phasegroup => {
        var info = [
            {
                key: 'PhaseId',
                value: to12phasegroup.getPhaseId()
            },
        ];
        var items = [];
        $.each(info, function(i, item) {
            var el = '<li><label>' + item.key + '</label>: ' + item.value + "</li>";
            items.push(el);
        });
        // to12phasegroup.
        // $('#phaseGroupInfoList').append(to12phasegroup.getPhaseId());
        $('#phaseGroupInfoList').append(items.join(''));
        to12phasegroup.get
    })
    .catch(console.error)