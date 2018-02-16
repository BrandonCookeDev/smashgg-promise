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
        $.each(info, function(object){
            var el = '<li><label>' + object.key + '</label>: ' + object.value + '</li>';
            listitems.push(el);
        })
        $('#tournamentInfoList').append( listitems.join('') );
    })