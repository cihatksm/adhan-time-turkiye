#### Modül İndirme:

```bash
  npm install adhan-time-turkiye
```

#### Örnek Kullanım:
```js
const prayer = require('adhan-time-turkiye')
const date = () => new Date()

console.log(date(), 'System opened!')

setTimeout(async () => {
    //plate seçeneği ile plaka kodu yazarak arama yapabilirsiniz.
    //place seçeneği ile il adı yazarak arama yapabilirsiniz.
    //Uyarı place ve plate opsiyonları aynı anda kullanılırsa place verisi işlenir.
    const information = await prayer.times({ plate: 41 })
    console.log(information)
}, 2000);
```

#### Örnek Çıktı:
```json
{
    "place": { "name": "Kocaeli", "plate": "41" },
    "times": [
        { "name": "İmsak", "time": "05:13" },
        { "name": "Güneş", "time": "06:40" },
        { "name": "Öğle", "time": "13:10" },
        { "name": "İkindi", "time": "16:42" },
        { "name": "Akşam", "time": "19:30" },
        { "name": "Yatsı", "time": "20:51" }
    ],
    "remainingTimes": [
        { "name": "İftar", "time": "35 dakika kaldı." }, // İftar bilgisi sadece ramazanda mevcuttur.
        { "name": "Sahur", "time": false } // Sahur bilgisi sadece ramazanda mevcuttur.
    ]
}
```

[![ISC License](https://img.shields.io/badge/License-ISC-green.svg)](https://choosealicense.com/licenses/isc/)

#### Geri Bildirim

**E-posta:** me@cihatksm.com adresinden bana ulaşın.
<small>
Kaynaklar: "namazvakitleri.diyanet.gov.tr", "vakitci.com"
</small>

<small>
Herhangi bir sorun teşkil ediyorsa, problem oluşturuyorsa ya da oluşturduysa önce tarafıma bilgi verilmesi rica olunur.
</small>