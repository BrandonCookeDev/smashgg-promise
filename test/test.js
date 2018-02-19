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
    })
    .catch(console.error);

smashgg.getPhase(100046)
    .then(to12phase => {

    })
    .catch(console.error);

smashgg.getPhaseGroup(301994)
    .then(to12phasegroup => {

    })
    .catch(console.error)