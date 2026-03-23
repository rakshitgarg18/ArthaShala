import json

translations = {
    "beispgccpts": {
        "nameHi": "धान उत्पादकों के लिए निवेश सब्सिडी (फसल उत्पादन)",
        "descriptionHi": "फसल उत्पादन तकनीक योजना के तहत धान उत्पादकों को निवेश सब्सिडी का लाभ।"
    },
    "ifpisbtcdb": {
        "nameHi": "नारियल विकास बोर्ड द्वारा एकीकृत कृषि योजना",
        "descriptionHi": "नारियल विकास बोर्ड द्वारा एकीकृत कृषि और उत्पादकता सुधार योजना।"
    },
    "pccengaes": {
        "nameHi": "नए बागान स्थापना (क्षेत्र विस्तार) योजना - संरक्षित खेती",
        "descriptionHi": "राष्ट्रीय बागवानी मिशन के तहत नए बागानों की स्थापना और संरक्षित खेती।"
    },
    "baepsicodouldwact": {
        "nameHi": "निर्माण मजदूर की मृत्यु पर अंत्येष्टि और अनुग्रह राशि",
        "descriptionHi": "निर्माण स्थल पर असंगठित मजदूर की मृत्यु होने पर अनुग्रह राशि योजना।"
    },
    "msasy": {
        "nameHi": "मुख्यमंत्री श्रमिक औजार सहायता योजना",
        "descriptionHi": "छत्तीसगढ़ श्रम विभाग द्वारा श्रमिकों को उपकरण और औजार खरीदने के लिए सहायता।"
    },
    "nsjbsy": {
        "nameHi": "निर्माण श्रमिक जीवन व भविष्य सुरक्षा योजना",
        "descriptionHi": "निर्माण श्रमिकों के लिए जीवन और भविष्य को सुरक्षित करने वाली बीमा योजना।"
    },
    "ismpsscis": {
        "nameHi": "पावरलूम सेक्टर में MSMEs के लिए पूंजी निवेश सब्सिडी",
        "descriptionHi": "पावरलूम सेक्टर में MSMEs के लिए राज्य पूंजी निवेश सब्सिडी योजना।"
    },
    "aipbo-faascdmf": {
        "nameHi": "नाव मालिकों के लिए वार्षिक बीमा प्रीमियम सब्सिडी",
        "descriptionHi": "समुद्री मत्स्य विकास योजना के तहत नाव मालिकों के लिए वार्षिक बीमा प्रीमियम।"
    },
    "aewc-mesifai-vi": {
        "nameHi": "ऊर्जा और जल संरक्षण के लिए सहायता (MSME)",
        "descriptionHi": "उद्योग स्थापित करने वाले उद्यमियों के लिए ऊर्जा और जल संरक्षण सहायता।"
    },
    "astpss": {
        "nameHi": "AICTE लघु अवधि प्रशिक्षण कार्यक्रम (SFURTI योजना)",
        "descriptionHi": "AICTE द्वारा संचालित लघु अवधि तकनीकी प्रशिक्षण कार्यक्रम (STTP-SFURTI)।"
    },
    "pmsfbcs": {
        "nameHi": "पिछड़ा वर्ग के छात्रों के लिए प्री-मैट्रिक छात्रवृत्ति",
        "descriptionHi": "अल्पसंख्यक और पिछड़ा वर्ग के छात्रों के लिए शिक्षा विभाग की प्री-मैट्रिक छात्रवृत्ति।"
    }
}

file_path = 'src/data/schemes.json'
with open(file_path, 'r', encoding='utf-8') as f:
    schemes = json.load(f)

for scheme in schemes:
    if scheme['id'] in translations:
        scheme['nameHi'] = translations[scheme['id']]['nameHi']
        scheme['descriptionHi'] = translations[scheme['id']]['descriptionHi']

with open(file_path, 'w', encoding='utf-8') as f:
    json.dump(schemes, f, ensure_ascii=False, indent=2)

print("Translations applied successfully!")
 
 
