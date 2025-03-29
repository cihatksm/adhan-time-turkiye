const package = require('./package.json');
const places = require('./places');
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

async function localGettingMethod(place) {
    const headers = RandomHeader()
    const response = await fetch(`https://raw.githubusercontent.com/${package.author}/${package.name}/refs/heads/main/data/${place._name}.json`, {
        "credentials": "include",
        "headers": {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:136.0) Gecko/20100101 Firefox/136.0",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
            "Accept-Language": "en-US,tr;q=0.7,en;q=0.3",
            "Upgrade-Insecure-Requests": "1",
            "Sec-Fetch-Dest": "document",
            "Sec-Fetch-Mode": "navigate",
            "Sec-Fetch-Site": "cross-site",
            "Priority": "u=0, i",
            "Pragma": "no-cache",
            "Cache-Control": "no-cache",
            ...headers
        },
        "method": "GET",
        "mode": "cors"
    }).then(data => data.json()).catch(() => null);

    const nowDate = new Date().toLocaleDateString('tr-TR', { timeZone: 'Europe/Istanbul' }).replaceAll('.', '/');
    const dateData = response?.find(f => f.dateMiladiShort == nowDate);
    if (!dateData) return null;

    let prayerData = {
        place: { name: place.name, plate: place.plate },
        hijriCalendar: hijriCalendar().date,
        times: [
            { name: 'İmsak', time: dateData.fajr },
            { name: 'Güneş', time: dateData.sunrise },
            { name: 'Öğle', time: dateData.dhuhr },
            { name: 'İkindi', time: dateData.asr },
            { name: 'Akşam', time: dateData.maghrib },
            { name: 'Yatsı', time: dateData.isha },
        ],
        remainingTimes: [],
        data_source: 'project_database'
    };

    if (hijriCalendar().month == 'Ramazan') {
        prayerData.remainingTimes.push({ name: 'İftar', time: IftarTime(dateData.fajr, dateData.maghrib) })
        prayerData.remainingTimes.push({ name: 'Sahur', time: SahurTime(dateData.fajr, dateData.maghrib) })
    }

    return prayerData;
}

async function firstGettingMethod(place) {
    const headers = RandomHeader()
    const protocols = ["http", "https"];
    const randomProtocol = protocols[Math.floor(Math.random() * protocols.length)];
    const langs = ["tr-TR", "ar-SA", "en-US", "de-DE", "fr-FR", "ru-RU", "es-ES"];
    const randomLang = langs[Math.floor(Math.random() * langs.length)];

    const response = await fetch(`${randomProtocol}://namazvakitleri.diyanet.gov.tr/${randomLang}/${place?.code}`, {
        "credentials": "include",
        "headers": {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:136.0) Gecko/20100101 Firefox/136.0",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
            "Accept-Language": "en-US,tr;q=0.7,en;q=0.3",
            "Upgrade-Insecure-Requests": "1",
            "Sec-Fetch-Dest": "document",
            "Sec-Fetch-Mode": "navigate",
            "Sec-Fetch-Site": "cross-site",
            "Priority": "u=0, i",
            "Pragma": "no-cache",
            "Cache-Control": "no-cache",
            ...headers
        },
        "method": "GET",
        "mode": "cors"
    }).then(data => data.text()).catch(() => null);

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
        hijriCalendar: hijriCalendar().date,
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

    if (hijriCalendar().month == 'Ramazan') {
        prayerData.remainingTimes.push({ name: 'İftar', time: IftarTime(fajrTime, maghribTime) })
        prayerData.remainingTimes.push({ name: 'Sahur', time: SahurTime(fajrTime, maghribTime) })
    }

    return prayerData;
}

async function secondGettingMethod(place) {
    const headers = RandomHeader()
    const response = await fetch(`https://vakitci.com/turkiye/${place?._name}/`, {
        "credentials": "include",
        "headers": {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:136.0) Gecko/20100101 Firefox/136.0",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
            "Accept-Language": "en-US,tr;q=0.7,en;q=0.3",
            "Upgrade-Insecure-Requests": "1",
            "Sec-Fetch-Dest": "document",
            "Sec-Fetch-Mode": "navigate",
            "Sec-Fetch-Site": "cross-site",
            "Priority": "u=0, i",
            "Pragma": "no-cache",
            "Cache-Control": "no-cache",
            ...headers
        },
        "method": "GET",
        "mode": "cors"
    }).then(data => data.text()).catch(() => null);

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
        hijriCalendar: hijriCalendar().date,
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

    if (hijriCalendar().month == 'Ramazan') {
        prayerData.remainingTimes.push({ name: 'İftar', time: IftarTime(fajrTime, maghribTime) })
        prayerData.remainingTimes.push({ name: 'Sahur', time: SahurTime(fajrTime, maghribTime) })
    }

    return prayerData;
}

module.exports = async (data) => {
    if (!data?.place && !data?.plate) return null;
    if (data?.place && data?.plate) return null;

    const place = places.find(f => f.plate == data?.plate) || places.find(f => String(f?.name)?.toLowerCase() == String(data?.place)?.toLowerCase());
    if (!place) return null;

    const local = async () => await localGettingMethod(place);
    const first = async () => await firstGettingMethod(place);
    const second = async () => await secondGettingMethod(place);

    const local_data = await local();
    const is_there_name = local_data?.place?.name?.length > 0;
    const is_there_times = local_data?.times?.filter(f => f.time.length > 0).length == local_data?.times?.length;
    if (local_data && is_there_name && is_there_times) return local_data;

    const first_data = await first();
    const is_first_there_name = first_data?.place?.name?.length > 0;
    const is_first_there_times = first_data?.times?.filter(f => f.time.length > 0).length == first_data?.times?.length;
    if (first_data && is_first_there_name && is_first_there_times) return first_data;

    const second_data = await second();
    const is_second_there_name = second_data?.place?.name?.length > 0;
    const is_second_there_times = second_data?.times?.filter(f => f.time.length > 0).length == second_data?.times?.length;
    if (second_data && is_second_there_name && is_second_there_times) return second_data;
}