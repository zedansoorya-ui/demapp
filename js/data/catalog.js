// Built-in songs and naats.
//
// Audio plays through YouTube's embedded player. Every video id below was checked
// (September 2026) to be embeddable, and most come from the rights holders' own
// channels (Saregama, Shemaroo, Rajshri, EMI Pakistan, Heera Gold, OSA and others).
// Each song lists a second id to fall back on if the first is ever taken down.
//
// Lyrics are only included where the words are in the public domain: poetry by
// Allama Iqbal (d. 1938), Mirza Ghalib (d. 1869), Imam Ahmed Raza Khan (d. 1921),
// Imam al-Busiri (d. 1294), Sheikh Saadi (d. 1291) and traditional verses.

const T = (rom, hi, ur) => ({ rom, hi, ur });

const LATA = T('Lata Mangeshkar', 'लता मंगेशकर', 'لتا منگیشکر');
const RAFI = T('Mohammed Rafi', 'मोहम्मद रफ़ी', 'محمد رفیع');
const MUKESH = T('Mukesh', 'मुकेश', 'مکیش');
const KISHORE = T('Kishore Kumar', 'किशोर कुमार', 'کشور کمار');
const OWAIS = T('Owais Raza Qadri', 'उवैस रज़ा क़ादरी', 'اویس رضا قادری');
const SABRI = T('Sabri Brothers', 'साबरी ब्रदर्स', 'صابری برادران');
const TRADITIONAL = T('Traditional', 'पारंपरिक', 'روایتی');
const IQBAL = T('Allama Iqbal', 'अल्लामा इक़बाल', 'علامہ اقبال');

/* ---------- Public-domain words for singing along ---------- */
// Each line: orig (Urdu or Arabic script), hi (Devanagari), rom (Roman).
const L = (orig, hi, rom) => ({ orig, hi, rom });

export const LYRICS = {
  'tala-al-badru': {
    script: 'ar',
    poet: T('Traditional, Madinah (622 CE)', 'पारंपरिक, मदीना (622 ई.)', 'روایتی، مدینہ (622ء)'),
    lines: [
      L('طَلَعَ الْبَدْرُ عَلَيْنَا', 'तलअल बद्रु अलैना', 'Tala‘al badru ‘alayna'),
      L('مِنْ ثَنِيَّاتِ الْوَدَاعِ', 'मिन सनिय्यातिल वदाअ', 'Min thaniyyatil wada‘'),
      L('وَجَبَ الشُّكْرُ عَلَيْنَا', 'वजबश्शुक्रु अलैना', 'Wajabash-shukru ‘alayna'),
      L('مَا دَعَا لِلّٰهِ دَاعِ', 'मा दआ लिल्लाहि दाअ', 'Ma da‘a lillahi da‘'),
      L('أَيُّهَا الْمَبْعُوثُ فِينَا', 'अय्युहल मबऊसु फ़ीना', 'Ayyuhal mab‘uthu fina'),
      L('جِئْتَ بِالْأَمْرِ الْمُطَاعِ', 'जिअ्ता बिल अम्रिल मुताअ', 'Ji’ta bil-amril muta‘'),
      L('جِئْتَ شَرَّفْتَ الْمَدِينَةْ', 'जिअ्ता शर्रफ़्तल मदीना', 'Ji’ta sharraftal madinah'),
      L('مَرْحَبًا يَا خَيْرَ دَاعِ', 'मरहबन या ख़ैरा दाअ', 'Marhaban ya khayra da‘'),
    ],
  },
  'mustafa-jaan-e-rehmat': {
    script: 'ur',
    poet: T('Imam Ahmed Raza Khan', 'इमाम अहमद रज़ा ख़ान', 'امام احمد رضا خان'),
    lines: [
      L('مصطفیٰ جانِ رحمت پہ لاکھوں سلام', 'मुस्तफ़ा जान-ए-रहमत पे लाखों सलाम', 'Mustafa jaan-e-rehmat pe laakhon salaam'),
      L('شمعِ بزمِ ہدایت پہ لاکھوں سلام', 'शम-ए-बज़्म-ए-हिदायत पे लाखों सलाम', 'Sham‘-e-bazm-e-hidaayat pe laakhon salaam'),
      L('مہرِ چرخِ نبوت پہ روشن درود', 'मेहर-ए-चर्ख़-ए-नुबुव्वत पे रौशन दुरूद', 'Mehr-e-charkh-e-nubuwwat pe roshan durood'),
      L('گلِ باغِ رسالت پہ لاکھوں سلام', 'गुल-ए-बाग़-ए-रिसालत पे लाखों सलाम', 'Gul-e-baagh-e-risaalat pe laakhon salaam'),
      L('شہریارِ ارم تاجدارِ حرم', 'शहरयार-ए-इरम ताजदार-ए-हरम', 'Shehryaar-e-iram, taajdaar-e-haram'),
      L('نوبہارِ شفاعت پہ لاکھوں سلام', 'नौबहार-ए-शफ़ाअत पे लाखों सलाम', 'Nau-bahaar-e-shafaa‘at pe laakhon salaam'),
      L('جس سہانی گھڑی چمکا طیبہ کا چاند', 'जिस सुहानी घड़ी चमका तैबा का चाँद', 'Jis suhaani ghadi chamka Taiba ka chaand'),
      L('اس دل افروز ساعت پہ لاکھوں سلام', 'उस दिल-अफ़रोज़ साअत पे लाखों सलाम', 'Us dil-afroz saa‘at pe laakhon salaam'),
    ],
  },
  'balaghal-ula': {
    script: 'ar',
    poet: T('Sheikh Saadi Shirazi', 'शेख़ सादी शीराज़ी', 'شیخ سعدی شیرازی'),
    lines: [
      L('بَلَغَ الْعُلٰى بِكَمَالِهٖ', 'बलग़ल उला बि-कमालिही', 'Balaghal ‘ula bi-kamaalihi'),
      L('كَشَفَ الدُّجٰى بِجَمَالِهٖ', 'कशफ़द्दुजा बि-जमालिही', 'Kashafad-duja bi-jamaalihi'),
      L('حَسُنَتْ جَمِيْعُ خِصَالِهٖ', 'हसुनत जमीउ ख़िसालिही', 'Hasunat jamee‘u khisaalihi'),
      L('صَلُّوْا عَلَيْهِ وَاٰلِهٖ', 'सल्लू अलैहि व आलिही', 'Sallu ‘alayhi wa aalihi'),
    ],
  },
  'qasida-burda': {
    script: 'ar',
    poet: T('Imam al-Busiri', 'इमाम बूसीरी', 'امام بوصیری'),
    lines: [
      L('مَوْلَايَ صَلِّ وَسَلِّمْ دَائِمًا أَبَدًا', 'मौलाया सल्लि व सल्लिम दाइमन अबदन', 'Maulaya salli wa sallim daa’iman abadan'),
      L('عَلٰى حَبِيْبِكَ خَيْرِ الْخَلْقِ كُلِّهِمِ', 'अला हबीबिका ख़ैरिल ख़ल्क़ि कुल्लिहिमि', '‘Ala habeebika khayril khalqi kullihimi'),
      L('مُحَمَّدٌ سَيِّدُ الْكَوْنَيْنِ وَالثَّقَلَيْنِ', 'मुहम्मदुन सय्यिदुल कौनैनि वस्सक़लैनि', 'Muhammadun sayyidul kawnayni wath-thaqalayni'),
      L('وَالْفَرِيْقَيْنِ مِنْ عُرْبٍ وَّمِنْ عَجَمِ', 'वल फ़रीक़ैनि मिन उर्बिन व मिन अजमि', 'Wal fareeqayni min ‘urbin wa min ‘ajami'),
      L('هُوَ الْحَبِيْبُ الَّذِيْ تُرْجٰى شَفَاعَتُهٗ', 'हुवल हबीबुल्लज़ी तुर्जा शफ़ाअतुहू', 'Huwal habeebul-ladhee turja shafaa‘atuhu'),
      L('لِكُلِّ هَوْلٍ مِّنَ الْأَهْوَالِ مُقْتَحِمِ', 'लिकुल्लि हौलिम मिनल अहवालि मुक़्तहिमि', 'Li-kulli hawlin minal ahwaali muqtahimi'),
    ],
  },
  'ya-nabi-salam': {
    script: 'ar',
    poet: TRADITIONAL,
    lines: [
      L('يَا نَبِي سَلَامٌ عَلَيْكَ', 'या नबी सलाम अलैका', 'Ya Nabi salaam ‘alayka'),
      L('يَا رَسُوْل سَلَامٌ عَلَيْكَ', 'या रसूल सलाम अलैका', 'Ya Rasool salaam ‘alayka'),
      L('يَا حَبِيْب سَلَامٌ عَلَيْكَ', 'या हबीब सलाम अलैका', 'Ya Habeeb salaam ‘alayka'),
      L('صَلَوَاتُ اللّٰه عَلَيْكَ', 'सलवातुल्लाह अलैका', 'Salawaatullah ‘alayka'),
    ],
  },
  'hasbi-rabbi': {
    script: 'ar',
    poet: TRADITIONAL,
    lines: [
      L('حَسْبِيْ رَبِّيْ جَلَّ اللّٰه', 'हस्बी रब्बी जल्लल्लाह', 'Hasbi Rabbi jallallah'),
      L('مَا فِيْ قَلْبِيْ غَيْرُ اللّٰه', 'मा फ़ी क़ल्बी ग़ैरुल्लाह', 'Ma fi qalbi ghairullah'),
      L('نُوْرِ مُحَمَّدْ صَلَّى اللّٰه', 'नूर-ए-मुहम्मद सल्लल्लाह', 'Noor-e-Muhammad sallallah'),
      L('لَا إِلٰهَ إِلَّا اللّٰه', 'ला इलाहा इल्लल्लाह', 'La ilaha illallah'),
    ],
  },
  'lab-pe-aati': {
    script: 'ur',
    poet: IQBAL,
    year: 1902,
    lines: [
      L('لب پہ آتی ہے دعا بن کے تمنا میری', 'लब पे आती है दुआ बन के तमन्ना मेरी', 'Lab pe aati hai dua ban ke tamanna meri'),
      L('زندگی شمع کی صورت ہو خدایا میری', 'ज़िंदगी शमा की सूरत हो ख़ुदाया मेरी', 'Zindagi shamma ki soorat ho Khudaya meri'),
      L('دور دنیا کا مرے دم سے اندھیرا ہو جائے', 'दूर दुनिया का मिरे दम से अँधेरा हो जाए', 'Door duniya ka mere dam se andhera ho jaaye'),
      L('ہر جگہ میرے چمکنے سے اجالا ہو جائے', 'हर जगह मेरे चमकने से उजाला हो जाए', 'Har jagah mere chamakne se ujaala ho jaaye'),
      L('ہو مرے دم سے یونہی میرے وطن کی زینت', 'हो मिरे दम से यूँही मेरे वतन की ज़ीनत', 'Ho mere dam se yunhi mere watan ki zeenat'),
      L('جس طرح پھول سے ہوتی ہے چمن کی زینت', 'जिस तरह फूल से होती है चमन की ज़ीनत', 'Jis tarah phool se hoti hai chaman ki zeenat'),
      L('زندگی ہو مری پروانے کی صورت یا رب', 'ज़िंदगी हो मिरी परवाने की सूरत या रब', 'Zindagi ho meri parwaane ki soorat ya Rab'),
      L('علم کی شمع سے ہو مجھ کو محبت یا رب', 'इल्म की शमा से हो मुझ को मोहब्बत या रब', 'Ilm ki shamma se ho mujh ko mohabbat ya Rab'),
      L('ہو مرا کام غریبوں کی حمایت کرنا', 'हो मिरा काम ग़रीबों की हिमायत करना', 'Ho mera kaam gareebon ki himaayat karna'),
      L('درد مندوں سے ضعیفوں سے محبت کرنا', 'दर्दमंदों से ज़ईफ़ों से मोहब्बत करना', 'Dardmandon se za‘eefon se mohabbat karna'),
      L('مرے اللہ! برائی سے بچانا مجھ کو', 'मिरे अल्लाह! बुराई से बचाना मुझ को', 'Mere Allah! buraai se bachaana mujh ko'),
      L('نیک جو راہ ہو اس رہ پہ چلانا مجھ کو', 'नेक जो राह हो उस रह पे चलाना मुझ को', 'Nek jo raah ho us raah pe chalaana mujh ko'),
    ],
  },
  'saare-jahan': {
    script: 'ur',
    poet: IQBAL,
    year: 1904,
    lines: [
      L('سارے جہاں سے اچھا ہندوستاں ہمارا', 'सारे जहाँ से अच्छा हिन्दोस्ताँ हमारा', 'Saare jahaan se achha Hindostaan hamaara'),
      L('ہم بلبلیں ہیں اس کی یہ گلستاں ہمارا', 'हम बुलबुलें हैं इस की ये गुलसिताँ हमारा', 'Hum bulbulein hain is ki, yeh gulsitaan hamaara'),
      L('پربت وہ سب سے اونچا ہمسایہ آسماں کا', 'पर्बत वो सब से ऊँचा हम्साया आसमाँ का', 'Parbat woh sab se ooncha, hamsaaya aasmaan ka'),
      L('وہ سنتری ہمارا وہ پاسباں ہمارا', 'वो संतरी हमारा वो पासबाँ हमारा', 'Woh santari hamaara, woh paasbaan hamaara'),
      L('گودی میں کھیلتی ہیں اس کی ہزاروں ندیاں', 'गोदी में खेलती हैं इस की हज़ारों नदियाँ', 'Godi mein khelti hain is ki hazaaron nadiyaan'),
      L('گلشن ہے جن کے دم سے رشکِ جناں ہمارا', 'गुलशन है जिन के दम से रश्क-ए-जनाँ हमारा', 'Gulshan hai jin ke dam se rashk-e-janaan hamaara'),
      L('مذہب نہیں سکھاتا آپس میں بیر رکھنا', 'मज़हब नहीं सिखाता आपस में बैर रखना', 'Mazhab nahin sikhaata aapas mein bair rakhna'),
      L('ہندی ہیں ہم وطن ہے ہندوستاں ہمارا', 'हिन्दी हैं हम वतन है हिन्दोस्ताँ हमारा', 'Hindi hain hum, watan hai Hindostaan hamaara'),
    ],
  },
  'dil-e-nadaan': {
    script: 'ur',
    poet: T('Mirza Ghalib', 'मिर्ज़ा ग़ालिब', 'مرزا غالب'),
    lines: [
      L('دلِ ناداں تجھے ہوا کیا ہے', 'दिल-ए-नादाँ तुझे हुआ क्या है', 'Dil-e-naadaan tujhe hua kya hai'),
      L('آخر اس درد کی دوا کیا ہے', 'आख़िर इस दर्द की दवा क्या है', 'Aakhir is dard ki dawa kya hai'),
      L('ہم ہیں مشتاق اور وہ بیزار', 'हम हैं मुश्ताक़ और वो बेज़ार', 'Hum hain mushtaaq aur woh bezaar'),
      L('یا الٰہی یہ ماجرا کیا ہے', 'या इलाही ये माजरा क्या है', 'Ya Ilaahi yeh maajra kya hai'),
      L('میں بھی منہ میں زبان رکھتا ہوں', 'मैं भी मुँह में ज़बान रखता हूँ', 'Main bhi munh mein zabaan rakhta hoon'),
      L('کاش پوچھو کہ مدعا کیا ہے', 'काश पूछो कि मुद्दआ क्या है', 'Kaash poochho ki mudda‘a kya hai'),
      L('ہم نے مانا کہ کچھ نہیں غالبؔ', 'हम ने माना कि कुछ नहीं ‘ग़ालिब’', 'Hum ne maana ki kuchh nahin Ghalib'),
      L('مفت ہاتھ آئے تو برا کیا ہے', 'मुफ़्त हाथ आए तो बुरा क्या है', 'Muft haath aaye to bura kya hai'),
    ],
  },
};

/* ---------- Old songs ---------- */
const S = (id, title, artist, film, year, yt, hue, extra = {}) => ({ id, cat: 'songs', title, artist, film, year, yt, hue, ...extra });

export const SONGS = [
  S('lag-ja-gale', T('Lag Jaa Gale', 'लग जा गले', 'لگ جا گلے'), LATA, T('Woh Kaun Thi?', 'वो कौन थी?', 'وہ کون تھی؟'), 1964, ['br6C4U3Dyfo', '3wAnXhoCBXQ'], 350),
  S('chaudhvin-ka-chand', T('Chaudhvin Ka Chand Ho', 'चौदहवीं का चाँद हो', 'چودھویں کا چاند ہو'), RAFI, T('Chaudhvin Ka Chand', 'चौदहवीं का चाँद', 'چودھویں کا چاند'), 1960, ['3z8yyUkDO-Y', 'uAsM_D5oO9c'], 45),
  S('abhi-na-jao', T('Abhi Na Jao Chhod Kar', 'अभी न जाओ छोड़ कर', 'ابھی نہ جاؤ چھوڑ کر'), T('Mohammed Rafi, Asha Bhosle', 'मोहम्मद रफ़ी, आशा भोसले', 'محمد رفیع، آشا بھوسلے'), T('Hum Dono', 'हम दोनों', 'ہم دونوں'), 1961, ['oDfK3RfSlKk', 'fOz2MdE8Avw'], 205),
  S('pyar-kiya', T('Pyar Kiya To Darna Kya', 'प्यार किया तो डरना क्या', 'پیار کیا تو ڈرنا کیا'), LATA, T('Mughal-e-Azam', 'मुग़ल-ए-आज़म', 'مغلِ اعظم'), 1960, ['yBuz0eWC598', 'FzVG01dDTCA'], 20),
  S('ajeeb-dastan', T('Ajeeb Dastan Hai Yeh', 'अजीब दास्ताँ है ये', 'عجیب داستاں ہے یہ'), LATA, T('Dil Apna Aur Preet Parai', 'दिल अपना और प्रीत पराई', 'دل اپنا اور پریت پرائی'), 1960, ['AU-hut9lGQ4', 'D3b0UU27H4A'], 270),
  S('baharon-phool', T('Baharon Phool Barsao', 'बहारो फूल बरसाओ', 'بہارو پھول برساؤ'), RAFI, T('Suraj', 'सूरज', 'سورج'), 1966, ['yge3971TZ0k', 'McP9D114BfU'], 330),
  S('zindagi-safar', T('Zindagi Ek Safar Hai Suhana', 'ज़िंदगी एक सफ़र है सुहाना', 'زندگی ایک سفر ہے سہانا'), KISHORE, T('Andaz', 'अंदाज़', 'انداز'), 1971, ['mzxHflxI-es', 'LlvoY4v5zm0'], 160),
  S('awara-hoon', T('Awara Hoon', 'आवारा हूँ', 'آوارہ ہوں'), MUKESH, T('Awaara', 'आवारा', 'آوارہ'), 1951, ['Q3Sy8rdD_3Y', '-fiPfbomafI'], 30),
  S('mera-joota', T('Mera Joota Hai Japani', 'मेरा जूता है जापानी', 'میرا جوتا ہے جاپانی'), MUKESH, T('Shree 420', 'श्री 420', 'شری 420'), 1955, ['AdjVZ2XLPHs', 'fy7P_Uu3alA'], 190),
  S('kabhi-kabhie', T('Kabhi Kabhie Mere Dil Mein', 'कभी कभी मेरे दिल में', 'کبھی کبھی میرے دل میں'), MUKESH, T('Kabhi Kabhie', 'कभी कभी', 'کبھی کبھی'), 1976, ['BB6KvXQx090', 'g_O5lttb5ww'], 240),
  S('tere-mere-sapne', T('Tere Mere Sapne', 'तेरे मेरे सपने', 'تیرے میرے سپنے'), RAFI, T('Guide', 'गाइड', 'گائیڈ'), 1965, ['kZ3RmxDXZR8', '42zACVzxsOg'], 100),
  S('yeh-raat', T('Yeh Raat Yeh Chandni Phir Kahan', 'ये रात ये चाँदनी फिर कहाँ', 'یہ رات یہ چاندنی پھر کہاں'), T('Hemant Kumar', 'हेमंत कुमार', 'ہیمنت کمار'), T('Jaal', 'जाल', 'جال'), 1952, ['4GfUK9Urb6I', 'GIuOyJImcyM'], 220),
  S('chalte-chalte', T('Chalte Chalte', 'चलते चलते', 'چلتے چلتے'), LATA, T('Pakeezah', 'पाकीज़ा', 'پاکیزہ'), 1972, ['MH5ifXyWZ14', 'ZQuS7VQXRes'], 300),
  S('suhani-raat', T('Suhani Raat Dhal Chuki', 'सुहानी रात ढल चुकी', 'سہانی رات ڈھل چکی'), RAFI, T('Dulari', 'दुलारी', 'دلاری'), 1949, ['RPNMFQDISIY', '9aUsIsDH4L8'], 255),
  S('khoya-khoya-chand', T('Khoya Khoya Chand', 'खोया खोया चाँद', 'کھویا کھویا چاند'), RAFI, T('Kala Bazar', 'काला बाज़ार', 'کالا بازار'), 1960, ['jgINHfzMQuQ', '1ivIiS41ES0'], 55),
  S('teri-pyari-surat', T('Teri Pyari Pyari Surat Ko', 'तेरी प्यारी प्यारी सूरत को', 'تیری پیاری پیاری صورت کو'), RAFI, T('Sasural', 'ससुराल', 'سسرال'), 1961, ['-XCZ2qbMc2A', 'kMYhWVV3yeI'], 340),
  S('aap-ki-nazron', T('Aap Ki Nazron Ne Samjha', 'आपकी नज़रों ने समझा', 'آپ کی نظروں نے سمجھا'), LATA, T('Anpadh', 'अनपढ़', 'ان پڑھ'), 1962, ['LbVI1fVvf8A', 'BxG6VqAV01Y'], 12),
  S('pukarta-chala', T('Pukarta Chala Hoon Main', 'पुकारता चला हूँ मैं', 'پکارتا چلا ہوں میں'), RAFI, T('Mere Sanam', 'मेरे सनम', 'میرے صنم'), 1965, ['gLKBwutnPwA', 'pp4udOzbLRU'], 140),
  S('pal-pal', T('Pal Pal Dil Ke Paas', 'पल पल दिल के पास', 'پل پل دل کے پاس'), KISHORE, T('Blackmail', 'ब्लैकमेल', 'بلیک میل'), 1973, ['AMuRRXCuy-4', 'Vabo2KVaEwA'], 200),
  S('zohra-jabeen', T('Aye Meri Zohra Jabeen', 'ऐ मेरी ज़ोहरा जबीं', 'اے میری زہرہ جبیں'), T('Manna Dey', 'मन्ना डे', 'منا ڈے'), T('Waqt', 'वक़्त', 'وقت'), 1965, ['uS3hWJ-vhhg', 'K0sGmxlP68g'], 25),
  S('chanda-mama', T('Chanda Mama Door Ke', 'चंदा मामा दूर के', 'چندا ماما دور کے'), T('Asha Bhosle', 'आशा भोसले', 'آشا بھوسلے'), T('Vachan', 'वचन', 'وچن'), 1955, ['jqjZgCApatQ', 'U4zZbpGR778'], 48),
  S('dil-e-nadaan', T('Dil-e-Nadaan', 'दिल-ए-नादाँ', 'دلِ ناداں'), T('Talat Mahmood, Suraiya', 'तलत महमूद, सुरैया', 'طلعت محمود، ثریا'), T('Mirza Ghalib', 'मिर्ज़ा ग़ालिब', 'مرزا غالب'), 1954, ['0tLmg24rt5U', 'I8oT8_l5NfE'], 280, { lyrics: 'dil-e-nadaan' }),
  S('lab-pe-aati', T('Lab Pe Aati Hai Dua', 'लब पे आती है दुआ', 'لب پہ آتی ہے دعا'), T('Jagjit Singh, Siza Roy', 'जगजीत सिंह, सिज़ा रॉय', 'جگجیت سنگھ، سیزا رائے'), null, null, ['aSr7IM8-bMU', 'Trg706YWme8'], 150, { lyrics: 'lab-pe-aati' }),
  S('saare-jahan', T('Saare Jahan Se Achha', 'सारे जहाँ से अच्छा', 'سارے جہاں سے اچھا'), IQBAL, null, 1904, ['vHyvVIfiurw', 'QE3OonGXDXQ'], 30, { lyrics: 'saare-jahan' }),
  S('ae-mere-watan', T('Ae Mere Watan Ke Logon', 'ऐ मेरे वतन के लोगों', 'اے میرے وطن کے لوگو'), LATA, null, 1963, ['DSJ1MMGi_IQ', 'Wvr8sX5-T_8'], 210),
  S('chandni-raatein', T('Chandni Raatein', 'चाँदनी रातें', 'چاندنی راتیں'), T('Noor Jehan', 'नूरजहाँ', 'نور جہاں'), T('Dupatta', 'दुपट्टा', 'دوپٹہ'), 1952, ['tcObC5Yz4qQ', 'QIz5cMIXw1Q'], 230),
  S('ko-ko-korina', T('Ko Ko Korina', 'को को कोरीना', 'کوکو کورینا'), T('Ahmed Rushdi', 'अहमद रुश्दी', 'احمد رشدی'), T('Armaan', 'अरमान', 'ارمان'), 1966, ['oiD96jZw58k', '2egK7whteUA'], 5),
  S('gulon-mein-rang', T('Gulon Mein Rang Bhare', 'गुलों में रंग भरे', 'گلوں میں رنگ بھرے'), T('Mehdi Hassan', 'मेहदी हसन', 'مہدی حسن'), null, null, ['xFxdxFdlcBQ', 'tUWkV5fpAmw'], 120),
];

/* ---------- Naat Sharif ---------- */
const N = (id, title, artist, yt, extra = {}) => ({ id, cat: 'naats', title, artist, yt, ...extra });

export const NAATS = [
  N('tala-al-badru', T('Tala‘al Badru Alayna', 'तलअल बद्रु अलैना', 'طلع البدر علینا'), T('Muad (voice only)', 'मुआज़', 'معاذ'), ['oj9DwDn53w8', 's4PUWDOVF7A'], { lyrics: 'tala-al-badru' }),
  N('mustafa-jaan-e-rehmat', T('Mustafa Jaan-e-Rehmat', 'मुस्तफ़ा जान-ए-रहमत', 'مصطفیٰ جانِ رحمت'), OWAIS, ['QU5wEI9t0i8', 'SI4XmIozUdg'], { lyrics: 'mustafa-jaan-e-rehmat' }),
  N('ye-sab-tumhara', T('Ye Sab Tumhara Karam Hai Aaqa', 'ये सब तुम्हारा करम है आक़ा', 'یہ سب تمہارا کرم ہے آقا'), T('Alhaj Khursheed Ahmed', 'अलहाज ख़ुर्शीद अहमद', 'الحاج خورشید احمد'), ['gEuRpk-3D1k', 'U3FFWMwOtu4']),
  N('balaghal-ula', T('Balaghal Ula Bi Kamalihi', 'बलग़ल उला बि कमालिही', 'بلغ العلیٰ بکمالہ'), OWAIS, ['y4TQuYBWf6U', 'f5rzQF4DxIw'], { lyrics: 'balaghal-ula' }),
  N('qasida-burda', T('Qasida Burda Sharif', 'क़सीदा बुर्दा शरीफ़', 'قصیدہ بردہ شریف'), T('Mahmood-ul-Hassan Ashrafi', 'महमूद-उल-हसन अशरफ़ी', 'محمود الحسن اشرفی'), ['y4LerDDGoNM', 'fBQumYn4I-M'], { lyrics: 'qasida-burda' }),
  N('ya-nabi-salam', T('Ya Nabi Salam Alaika', 'या नबी सलाम अलैका', 'یا نبی سلام علیک'), OWAIS, ['9fQsV4du1y4', '5I5b8S7JM1k'], { lyrics: 'ya-nabi-salam' }),
  N('shah-e-madina', T('Shah-e-Madina', 'शाह-ए-मदीना', 'شاہِ مدینہ'), T('Salim Raza', 'सलीम रज़ा', 'سلیم رضا'), ['wG9cmsv1tWU', 'x3DE6VHY1QI'], { film: T('Noor-e-Islam', 'नूर-ए-इस्लाम', 'نورِ اسلام'), year: 1957 }),
  N('hasbi-rabbi', T('Hasbi Rabbi Jallallah', 'हस्बी रब्बी जल्लल्लाह', 'حسبی ربی جل اللہ'), T('Hafiz Bilal Qadri', 'हाफ़िज़ बिलाल क़ादरी', 'حافظ بلال قادری'), ['Rh7bUbpEJFg', '8Pbgpi0IIPU'], { lyrics: 'hasbi-rabbi' }),
  N('mera-dil-badal-de', T('Mera Dil Badal De', 'मेरा दिल बदल दे', 'میرا دل بدل دے'), T('Junaid Jamshed', 'जुनैद जमशेद', 'جنید جمشید'), ['l3hHUwc1cAk', 'p5WBM1dOCuc']),
  N('kaabe-ki-raunaq', T('Kaabe Ki Raunaq', 'काबे की रौनक़', 'کعبے کی رونق'), T('Ghulam Mustafa Qadri', 'ग़ुलाम मुस्तफ़ा क़ादरी', 'غلام مصطفیٰ قادری'), ['JLkCad_qAng', 'plgdYyApOk4']),
  N('tajdar-e-haram', T('Tajdar-e-Haram', 'ताजदार-ए-हरम', 'تاجدارِ حرم'), SABRI, ['eFMLmCs19Gk', '_m7fAatL03g']),
  N('bhar-do-jholi', T('Bhar Do Jholi Meri', 'भर दो झोली मेरी', 'بھر دو جھولی میری'), SABRI, ['EdCJZfRaq58', '7xLqmYVkFa8']),
  N('wohi-khuda-hai', T('Wohi Khuda Hai', 'वही ख़ुदा है', 'وہی خدا ہے'), T('Nusrat Fateh Ali Khan', 'नुसरत फ़तेह अली ख़ान', 'نصرت فتح علی خان'), ['gDOlh5FYHhg', 'ybBncE6wROo']),
];

export const CATALOG = [...SONGS, ...NAATS];
