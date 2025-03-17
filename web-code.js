// for "https://namazvakitleri.diyanet.gov.tr"

{
    let buttons1 = document.getElementsByClassName('dt-buttons')[0];
    let button1 = buttons1.getElementsByTagName('button')[0];
    button1.click();

    let buttons2 = buttons1.getElementsByClassName('dt-button-collection')[0];
    let button2 = buttons2.getElementsByTagName('button')[3];
    button2.click();

    let table = document.getElementById('tab-2');
    table.style.display = 'none';

    let tbody = table.getElementsByTagName('tbody')[0];
    let trdata = tbody.getElementsByTagName('tr');

    let keys = ["dateMiladiLong", "dateHijri", "fajr", "sunrise", "dhuhr", "asr", "maghrib", "isha"];
    let data = [];

    function formatDate(longDate) {
        let parts = longDate.split(" ");
        let day = parts[0].padStart(2, "0");
        let monthMap = {
            "Ocak": "01", "Şubat": "02", "Mart": "03", "Nisan": "04", "Mayıs": "05", "Haziran": "06",
            "Temmuz": "07", "Ağustos": "08", "Eylül": "09", "Ekim": "10", "Kasım": "11", "Aralık": "12"
        };
        let month = monthMap[parts[1]];
        let year = parts[2];
        return `${day}/${month}/${year}`;
    }

    [...trdata].forEach(tr => {
        let rowData = [...tr.getElementsByTagName('td')].map(td => td.textContent.trim());
        let dateMiladiShort = formatDate(rowData[0]);
        let rowObject = Object.fromEntries(keys.map((key, i) => [key, rowData[i]]));
        rowObject.dateMiladiShort = dateMiladiShort;
        data.push(rowObject);
    });

    function downloadJSON(data) {
        let filename = document.getElementsByClassName('select2-selection__rendered')[1]?.attributes?.getNamedItem('title')?.value || 'data';

        const replaces = [
            ['ğ', 'g'], ['ç', 'c'], ['ş', 's'], ['ı', 'i'], ['ö', 'o'], ['ü', 'u'],
            ['Ğ', 'G'], ['Ç', 'C'], ['Ş', 'S'], ['İ', 'I'], ['Ö', 'O'], ['Ü', 'U'],
        ];
        for (let value of replaces) filename = filename.replaceAll(value[0], value[1]);
        filename = filename.toLowerCase();

        let jsonStr = JSON.stringify(data);
        let blob = new Blob([jsonStr], { type: "application/json" });
        let link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    downloadJSON(data);
}