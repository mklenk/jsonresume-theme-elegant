// Originally taken from https://github.com/codebox/moment-precise-range
const moment = require('moment');

(function(moment) {
    const STRINGS = {
        nodiff: '',
        year: 'Jahr',
        years: 'Jahre',
        month: 'Monate',
        months: 'Monate',
        day: 'Tag',
        days: 'Tage',
        hour: 'Stunde',
        hours: 'Stunden',
        minute: 'Minute',
        minutes: 'Minuten',
        second: 'Sekunde',
        seconds: 'Sekunden',
        delimiter: ' '
    };
    moment.fn.preciseDiff = function(d2) {
        return moment.preciseDiff(this, d2);
    };
    moment.preciseDiff = function(d1, d2) {
        let m1 = moment(d1), m2 = moment(d2);

        /*
            The difference between two dates say 01-02-2016 & 31-03-2016 comes out as 1 month 30days
            because technically it's the difference between 01-02-2016:00:00:00 & 31-03-2016:00:00:00
            But when someone enters start date & end date in resume, they mean start of the start date
            and end of the end date.

            The next two lines makes that correction, the start date is set as the start of the day, while
            end date is set as start of the day of the very next day. Basically in the above example, instead
            of making 31-03-2016:00:00:00 to 31-03-2016:23:59:59 which will get duration as 1 month 29days 23hours 59minutes 59sections
            It is changed to 01-04-2016:00:00:00 instead, to get the precise calculation
        */
        m1 = m1.startOf('day');
        m2 = m2.add(1, 'day').startOf('day');

        if (m1.isSame(m2)) {
            return STRINGS.nodiff;
        }
        if (m1.isAfter(m2)) {
            let tmp = m1;
            m1 = m2;
            m2 = tmp;
        }

        let yDiff = m2.year() - m1.year();
        let mDiff = m2.month() - m1.month();
        let dDiff = m2.date() - m1.date();
        let hourDiff = m2.hour() - m1.hour();
        let minDiff = m2.minute() - m1.minute();
        let secDiff = m2.second() - m1.second();

        if (secDiff < 0) {
            secDiff = 60 + secDiff;
            minDiff--;
        }
        if (minDiff < 0) {
            minDiff = 60 + minDiff;
            hourDiff--;
        }
        if (hourDiff < 0) {
            hourDiff = 24 + hourDiff;
            dDiff--;
        }
        if (dDiff < 0) {
            let daysInLastFullMonth = moment(m2.year() + '-' + (m2.month() + 1), "YYYY-MM").subtract(1, 'M').daysInMonth();
            if (daysInLastFullMonth < m1.date()) { // 31/01 -> 2/03
                dDiff = daysInLastFullMonth + dDiff + (m1.date() - daysInLastFullMonth);
            } else {
                dDiff = daysInLastFullMonth + dDiff;
            }
            mDiff--;
        }
        if (mDiff < 0) {
            mDiff = 12 + mDiff;
            yDiff--;
        }

        function pluralize(num, word) {
            return num + ' ' + STRINGS[word + (num === 1 ? '' : 's')];
        }

        if (!yDiff && !mDiff) {
            if (dDiff >= 1) {
                return pluralize(dDiff, 'day');
            } else {
                return 'Joined Today';
            }
        } else  {
            let result = [];

            if (yDiff) {
                result.push(pluralize(yDiff, 'year'));
            }
            if (mDiff) {
                result.push(pluralize(mDiff, 'month'));
            }

            return result.join(STRINGS.delimiter);
        }
    };
}(moment));

module.exports = moment;
