const cheerio = require('cheerio');
const hijriCalendar = require('./hijriCalendar');

const minute = (x) => x.split(':').map(m => Number(m)).reduce((a, b) => a * 60 + b);
const rtc = (x) => x < 0 ? true : (Math.floor(x / 60) > 0 ? Math.floor(x / 60) + ' saat ' : '') + x % 60 + ' dakika kaldı.';

function IftarTime(imsak, aksam) {
    const iftarStatus = minute(Now()) > minute(imsak) ? rtc(minute(aksam) - minute(Now())) : true;
    return iftarStatus ? iftarStatus : true;
}

function SahurTime(imsak, aksam) {
    const sahurStatus = minute(Now()) > minute(aksam) || minute(Now()) < minute(imsak) ?
        minute(imsak) - minute(Now()) > 0 ? rtc(minute(imsak) - minute(Now())) :
            rtc(((24 * 60) - minute(Now())) + minute(imsak)) : false;
    return sahurStatus ? sahurStatus : false;
}

function Now() {
    const formatter = new Intl.DateTimeFormat("tr", { dateStyle: "short", timeStyle: "medium", timeZone: 'Europe/Istanbul' });
    return formatter.format(new Date()).split(' ')[1].split(':').slice(0, 2).join(':');
}


function RandomHeader() {
    const randomUserAgents = [
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3",
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.97 Safari/537.36",
        "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.138 Safari/537.36",
        "Mozilla/5.0 (iPhone; CPU iPhone OS 13_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.1 Mobile/15E148 Safari/604.1",
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Firefox/77.0",
        "Mozilla/5.0 (Windows NT 6.1; WOW64; rv:39.0) Gecko/20100101 Firefox/39.0",
        "Mozilla/5.0 (Windows NT 6.1; Trident/7.0; AS; AS-IA; rv:11.0) like Gecko",
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:93.0) Gecko/20100101 Firefox/93.0",
        "Mozilla/5.0 (Linux; Android 10; SM-A520F) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.120 Mobile Safari/537.36"
    ];

    const randomLanguages = [
        "en-US,en;q=0.5",
        "de-DE,de;q=0.9,en-US;q=0.8,en;q=0.7",
        "fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7",
        "es-ES,es;q=0.9,en-US;q=0.8,en;q=0.7",
        "it-IT,it;q=0.9,en-US;q=0.8,en;q=0.7"
    ];

    const randomReferers = [
        "https://www.google.com/",
        "https://www.bing.com/",
        "https://www.example.com/",
        "https://www.reddit.com/",
        "https://www.stackoverflow.com/"
    ];

    const randomUserAgent = randomUserAgents[Math.floor(Math.random() * randomUserAgents.length)];
    const randomLanguage = randomLanguages[Math.floor(Math.random() * randomLanguages.length)];
    const randomReferer = randomReferers[Math.floor(Math.random() * randomReferers.length)];

    const headers = {
        'User-Agent': randomUserAgent,
        'Accept-Language': randomLanguage,
        'Referer': randomReferer,
        'Connection': 'keep-alive'
    };

    return headers;
}

async function firstGettingMethod(place) {
    const headers = RandomHeader()
    const response = await fetch(`https://namazvakitleri.diyanet.gov.tr/tr-TR/${place?.code}/`, { headers }).then(data => data.text()).catch(() => null);

    if (!response) return null;

    const html = response?.replaceAll('\n', '').replaceAll('\t', '').replaceAll('\r', '');
    const $ = cheerio.load(html);

    const supportedKeys = [':', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0'];
    const cleanTime = (time) => time.split('').filter(f => supportedKeys.includes(f)).join('');

    const times = $('#today-pray-times-row');
    const fajrTime = cleanTime(times.find('[data-vakit-name="imsak"]').text());
    const sunriseTime = cleanTime(times.find('[data-vakit-name="gunes"]').text());
    const dhuhrTime = cleanTime(times.find('[data-vakit-name="ogle"]').text());
    const asrTime = cleanTime(times.find('[data-vakit-name="ikindi"]').text());
    const maghribTime = cleanTime(times.find('[data-vakit-name="aksam"]').text());
    const ishaTime = cleanTime(times.find('[data-vakit-name="yatsi"]').text());

    let prayerData = {
        place: { name: place.name, plate: place.plate },
        hijriCalendar: hijriCalendar.date,
        times: [
            { name: 'İmsak', time: fajrTime },
            { name: 'Güneş', time: sunriseTime },
            { name: 'Öğle', time: dhuhrTime },
            { name: 'İkindi', time: asrTime },
            { name: 'Akşam', time: maghribTime },
            { name: 'Yatsı', time: ishaTime },
        ],
        remainingTimes: [],
        data_source: 'namazvakitleri.diyanet.gov.tr'
    };

    if (hijriCalendar.month == 'Ramazan') {
        prayerData.remainingTimes.push({ name: 'İftar', time: IftarTime(fajrTime, maghribTime) })
        prayerData.remainingTimes.push({ name: 'Sahur', time: SahurTime(fajrTime, maghribTime) })
    }

    return prayerData;
}

async function secondGettingMethod(place) {
    const headers = RandomHeader()
    const response = await fetch(`https://vakitci.com/turkiye/${place?._name}/`, { headers }).then(data => data.text()).catch(() => null);

    if (!response) return null;

    const html = response?.replaceAll('\n', '').replaceAll('\t', '').replaceAll('\r', '');
    const $ = cheerio.load(html);

    const supportedKeys = [':', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0'];
    const cleanTime = (time) => time.split('').filter(f => supportedKeys.includes(f)).join('');

    const times = $('#vakitler');
    const fajrTime = cleanTime(times.find('#imsak').text());
    const sunriseTime = cleanTime(times.find('#gunes').text());
    const dhuhrTime = cleanTime(times.find('#ogle').text());
    const asrTime = cleanTime(times.find('#ikindi').text());
    const maghribTime = cleanTime(times.find('#aksam').text());
    const ishaTime = cleanTime(times.find('#yatsi').text());

    let prayerData = {
        place: { name: place.name, plate: place.plate },
        hijriCalendar: hijriCalendar.date,
        times: [
            { name: 'İmsak', time: fajrTime },
            { name: 'Güneş', time: sunriseTime },
            { name: 'Öğle', time: dhuhrTime },
            { name: 'İkindi', time: asrTime },
            { name: 'Akşam', time: maghribTime },
            { name: 'Yatsı', time: ishaTime },
        ],
        remainingTimes: [],
        data_source: 'vakitci.com'
    };

    if (hijriCalendar.month == 'Ramazan') {
        prayerData.remainingTimes.push({ name: 'İftar', time: IftarTime(fajrTime, maghribTime) })
        prayerData.remainingTimes.push({ name: 'Sahur', time: SahurTime(fajrTime, maghribTime) })
    }

    return prayerData;
}


module.exports = async (data) => {
    const places = require('./places');
    if (!data?.place && !data?.plate) return null;
    if (data?.place && data?.plate) return null;

    const place = places.find(f => f.plate == data?.plate) || places.find(f => String(f?.name)?.toLowerCase() == String(data?.place)?.toLowerCase());
    if (!place) return null;

    return await firstGettingMethod(place) || await secondGettingMethod(place) || null;
}