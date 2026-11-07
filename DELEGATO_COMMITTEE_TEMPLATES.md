# Delegato committee templates

Sample preset data for the "Start from a template" option in Delegato. Each template gives a committee name, a short code, a suggested seat count, and a long list of common portfolios. The organizer picks a template, then removes, adds, or renames portfolios to match their own conference.

## How to use this file

1. Seed these templates into the database as read only presets, owned by the platform, not by any organizer.
2. When an organizer picks a template, COPY it into their conference. Their edits must never change the preset or another organizer's copy.
3. Agendas are never preset. Every template uses the placeholder [YOUR AGENDA] so the organizer writes their own.
4. Seat counts are suggestions. Real bodies have fixed sizes, but MUNs often allot more or fewer portfolios, so let the organizer set any number.
5. Portfolio lists are pools, usually longer than the seat count. The organizer chooses which to open. Where a committee has a real fixed size, the pool is marked.
6. Country monogram codes (IN, BR, JP) should be generated automatically from the country name. Keep a separate lookup for them.
7. Membership of real bodies changes every year. Treat all lists as samples, not as official current membership.
8. Spellings use plain letters with no accents or hyphens, so search and sorting stay simple.

## Suggested data format

```json
{
  "code": "UNSC",
  "name": "United Nations Security Council",
  "type": "un_body",
  "suggestedSeats": 15,
  "agenda": "[YOUR AGENDA]",
  "portfolioKind": "country",
  "portfolios": ["China", "France", "Russian Federation", "United Kingdom", "United States of America"]
}
```

Allowed values for type: un_body, un_agency, regional_body, indian_body, press, crisis.
Allowed values for portfolioKind: country, party, media, character.

---

# Part 1. Master lists

These lists are reused by the committees in Part 2.

## MASTER_UN_MEMBERS

Afghanistan, Albania, Algeria, Andorra, Angola, Antigua and Barbuda, Argentina, Armenia, Australia, Austria, Azerbaijan, Bahamas, Bahrain, Bangladesh, Barbados, Belarus, Belgium, Belize, Benin, Bhutan, Bolivia, Bosnia and Herzegovina, Botswana, Brazil, Brunei Darussalam, Bulgaria, Burkina Faso, Burundi, Cabo Verde, Cambodia, Cameroon, Canada, Central African Republic, Chad, Chile, China, Colombia, Comoros, Costa Rica, Cote d'Ivoire, Croatia, Cuba, Cyprus, Czech Republic, Democratic People's Republic of Korea, Democratic Republic of the Congo, Denmark, Djibouti, Dominica, Dominican Republic, Ecuador, Egypt, El Salvador, Equatorial Guinea, Eritrea, Estonia, Eswatini, Ethiopia, Fiji, Finland, France, Gabon, Gambia, Georgia, Germany, Ghana, Greece, Grenada, Guatemala, Guinea, Guinea Bissau, Guyana, Haiti, Honduras, Hungary, Iceland, India, Indonesia, Iran, Iraq, Ireland, Israel, Italy, Jamaica, Japan, Jordan, Kazakhstan, Kenya, Kiribati, Kuwait, Kyrgyzstan, Laos, Latvia, Lebanon, Lesotho, Liberia, Libya, Liechtenstein, Lithuania, Luxembourg, Madagascar, Malawi, Malaysia, Maldives, Mali, Malta, Marshall Islands, Mauritania, Mauritius, Mexico, Micronesia, Moldova, Monaco, Mongolia, Montenegro, Morocco, Mozambique, Myanmar, Namibia, Nauru, Nepal, Netherlands, New Zealand, Nicaragua, Niger, Nigeria, North Macedonia, Norway, Oman, Pakistan, Palau, Panama, Papua New Guinea, Paraguay, Peru, Philippines, Poland, Portugal, Qatar, Republic of Korea, Republic of the Congo, Romania, Russian Federation, Rwanda, Saint Kitts and Nevis, Saint Lucia, Saint Vincent and the Grenadines, Samoa, San Marino, Sao Tome and Principe, Saudi Arabia, Senegal, Serbia, Seychelles, Sierra Leone, Singapore, Slovakia, Slovenia, Solomon Islands, Somalia, South Africa, South Sudan, Spain, Sri Lanka, Sudan, Suriname, Sweden, Switzerland, Syria, Tajikistan, Tanzania, Thailand, Timor Leste, Togo, Tonga, Trinidad and Tobago, Tunisia, Turkiye, Turkmenistan, Tuvalu, Uganda, Ukraine, United Arab Emirates, United Kingdom, United States of America, Uruguay, Uzbekistan, Vanuatu, Venezuela, Vietnam, Yemen, Zambia, Zimbabwe.

## MASTER_OBSERVERS

Holy See, State of Palestine. Some conferences also allot the European Union and the African Union as special portfolios.

## MASTER_STANDARD_POOL

About 90 countries that conferences allot most often. Used by committees that do not use the full UN membership.

Algeria, Argentina, Armenia, Australia, Austria, Azerbaijan, Bangladesh, Belarus, Belgium, Bolivia, Brazil, Bulgaria, Canada, Chile, China, Colombia, Cuba, Czech Republic, Democratic Republic of the Congo, Denmark, Egypt, Ethiopia, Finland, France, Germany, Ghana, Greece, Hungary, Iceland, India, Indonesia, Iran, Iraq, Ireland, Israel, Italy, Japan, Jordan, Kazakhstan, Kenya, Kuwait, Lebanon, Libya, Malaysia, Mexico, Morocco, Mozambique, Myanmar, Nepal, Netherlands, New Zealand, Nigeria, Democratic People's Republic of Korea, Norway, Pakistan, Peru, Philippines, Poland, Portugal, Qatar, Republic of Korea, Romania, Russian Federation, Rwanda, Saudi Arabia, Senegal, Serbia, Singapore, South Africa, Spain, Sri Lanka, Sudan, Sweden, Switzerland, Syria, Thailand, Tunisia, Turkiye, Uganda, Ukraine, United Arab Emirates, United Kingdom, United States of America, Uruguay, Venezuela, Vietnam, Yemen, Zimbabwe.

## MASTER_INDIAN_PARTIES

Used by AIPPM, Lok Sabha, and Rajya Sabha. Party names only. Conferences sometimes allot named leaders instead, so let the organizer rename a portfolio freely. Check the list against the conference's own rules before opening registrations.

National and large parties: Bharatiya Janata Party, Indian National Congress, Aam Aadmi Party, Bahujan Samaj Party, Communist Party of India, Communist Party of India Marxist, Nationalist Congress Party, National People's Party.

Large regional parties: All India Trinamool Congress, Samajwadi Party, Dravida Munnetra Kazhagam, All India Anna Dravida Munnetra Kazhagam, Shiv Sena, Shiv Sena Uddhav Balasaheb Thackeray, Nationalist Congress Party Sharadchandra Pawar, Janata Dal United, Rashtriya Janata Dal, Telugu Desam Party, YSR Congress Party, Biju Janata Dal, Bharat Rashtra Samithi, Jharkhand Mukti Morcha, Shiromani Akali Dal, Jammu and Kashmir National Conference, Peoples Democratic Party, Lok Janshakti Party Ram Vilas, Rashtriya Lok Dal, Janata Dal Secular, Jana Sena Party, Tamilaga Vettri Kazhagam.

Other regional and smaller parties: All India Majlis E Ittehadul Muslimeen, Indian Union Muslim League, Asom Gana Parishad, All India United Democratic Front, Mizo National Front, Zoram People's Movement, Naga People's Front, Sikkim Krantikari Morcha, Sikkim Democratic Front, Apna Dal Sonelal, Hindustani Awam Morcha, Rashtriya Lok Morcha, Viduthalai Chiruthaigal Katchi, Pattali Makkal Katchi, Desiya Murpokku Dravida Kazhagam, Kerala Congress Mani, Revolutionary Socialist Party, All India Forward Bloc, Maharashtra Navnirman Sena, Vanchit Bahujan Aghadi, Azad Samaj Party Kanshi Ram, Rashtriya Loktantrik Party, Bharat Adivasi Party, Voice of the People Party.

Special portfolios: Independent Members, Nominated Members.

## MASTER_MEDIA

Used by the International Press Corps and similar press committees.

Indian media: The Hindu, Times of India, Hindustan Times, Indian Express, NDTV, India Today, The Print, Scroll, The Wire, Dainik Bhaskar, Press Trust of India, Asian News International, Doordarshan, All India Radio, The Tribune, The Telegraph India, Deccan Herald, Mint, Economic Times, Business Standard.

International media: BBC, CNN, Al Jazeera, Reuters, Associated Press, Agence France Presse, Bloomberg, The Guardian, The New York Times, The Washington Post, The Economist, Deutsche Welle, NHK, Xinhua, TASS, South China Morning Post, Le Monde, The Times of London, Sky News, France 24, CGTN, Anadolu Agency, Dawn, The Daily Star, Kyodo News, Yonhap, ABC Australia, CBC, The Straits Times, Financial Times, Wall Street Journal, Der Spiegel, El Pais, Haaretz, Arab News, Gulf News, Nikkei Asia, The Japan Times, Channel News Asia.

---

# Part 2. Committee templates

## Indian committees

### AIPPM

Code: AIPPM
Full name: All India Political Parties Meet
Type: indian_body
Portfolio kind: party
Suggested seats: 60
Portfolios: all of MASTER_INDIAN_PARTIES.
Notes: Often runs with a Lok Sabha style procedure. Many conferences allot sitting party leaders or well known spokespeople, so allow free text portfolio names. Add [YOUR AGENDA].

### LS

Code: LS
Full name: Lok Sabha
Type: indian_body
Portfolio kind: party
Suggested seats: 50
Portfolios: all of MASTER_INDIAN_PARTIES.
Notes: Some conferences allot individual Members of Parliament. Allow free text.

### RS

Code: RS
Full name: Rajya Sabha
Type: indian_body
Portfolio kind: party
Suggested seats: 40
Portfolios: all of MASTER_INDIAN_PARTIES.
Notes: Treat as the upper house with a smaller pool. Organizers usually open fewer seats than Lok Sabha.

### IPC

Code: IPC
Full name: International Press Corps
Type: press
Portfolio kind: media
Suggested seats: 25
Portfolios: all of MASTER_MEDIA.
Notes: Delegates report on other committees. Consider a separate scoring rubric later.

## General Assembly committees

For all of these, use MASTER_UN_MEMBERS plus MASTER_OBSERVERS as the pool.

### DISEC

Code: DISEC
Full name: United Nations General Assembly First Committee, Disarmament and International Security Committee
Type: un_body
Portfolio kind: country
Suggested seats: 80
Portfolios: MASTER_UN_MEMBERS and MASTER_OBSERVERS.

### SOCHUM

Code: SOCHUM
Full name: United Nations General Assembly Third Committee, Social, Humanitarian and Cultural Committee
Type: un_body
Portfolio kind: country
Suggested seats: 80
Portfolios: MASTER_UN_MEMBERS and MASTER_OBSERVERS.

### SPECPOL

Code: SPECPOL
Full name: United Nations General Assembly Fourth Committee, Special Political and Decolonization Committee
Type: un_body
Portfolio kind: country
Suggested seats: 80
Portfolios: MASTER_UN_MEMBERS and MASTER_OBSERVERS.

### ECOFIN

Code: ECOFIN
Full name: United Nations General Assembly Second Committee, Economic and Financial Committee
Type: un_body
Portfolio kind: country
Suggested seats: 80
Portfolios: MASTER_UN_MEMBERS and MASTER_OBSERVERS.

### LEGAL

Code: LEGAL
Full name: United Nations General Assembly Sixth Committee, Legal Committee
Type: un_body
Portfolio kind: country
Suggested seats: 80
Portfolios: MASTER_UN_MEMBERS and MASTER_OBSERVERS.

### UNGA

Code: UNGA
Full name: United Nations General Assembly
Type: un_body
Portfolio kind: country
Suggested seats: 120
Portfolios: MASTER_UN_MEMBERS and MASTER_OBSERVERS.

### WHO

Code: WHO
Full name: World Health Organization, World Health Assembly
Type: un_agency
Portfolio kind: country
Suggested seats: 80
Portfolios: MASTER_UN_MEMBERS and Holy See.

## Security and human rights

### UNSC

Code: UNSC
Full name: United Nations Security Council
Type: un_body
Portfolio kind: country
Suggested seats: 15 (fixed size in the real body)
Permanent members: China, France, Russian Federation, United Kingdom, United States of America.
Pool for the ten elected seats: Albania, Algeria, Argentina, Australia, Bahrain, Bangladesh, Brazil, Canada, Colombia, Denmark, Egypt, Ethiopia, Gabon, Germany, Ghana, Greece, Guyana, India, Indonesia, Iran, Ireland, Israel, Italy, Japan, Kenya, Kuwait, Malta, Mexico, Morocco, Netherlands, Nigeria, Norway, Pakistan, Panama, Peru, Poland, Qatar, Republic of Korea, Saudi Arabia, Sierra Leone, Singapore, Slovenia, Somalia, South Africa, Spain, Sweden, Switzerland, Turkiye, Ukraine, United Arab Emirates.
Notes: Organizers often add observer countries or allow veto rules. Offer a switch for "permanent members have veto".

### UNHRC

Code: UNHRC
Full name: United Nations Human Rights Council
Type: un_body
Portfolio kind: country
Suggested seats: 47 (fixed size in the real body)
Pool: Algeria, Argentina, Armenia, Bangladesh, Belgium, Benin, Bolivia, Brazil, Bulgaria, Burundi, Chile, China, Colombia, Costa Rica, Cote d'Ivoire, Cuba, Czech Republic, Democratic Republic of the Congo, Dominican Republic, Egypt, Eritrea, Ethiopia, Finland, France, Gambia, Georgia, Germany, Ghana, India, Indonesia, Iraq, Japan, Kazakhstan, Kenya, Kuwait, Lithuania, Luxembourg, Malawi, Malaysia, Maldives, Mali, Marshall Islands, Mexico, Montenegro, Morocco, Netherlands, Pakistan, Paraguay, Peru, Philippines, Qatar, Republic of Korea, Romania, Saudi Arabia, Senegal, Somalia, South Africa, Spain, Sudan, Switzerland, Thailand, Togo, Tunisia, Turkiye, Ukraine, United Arab Emirates, United Kingdom, United States of America, Venezuela, Vietnam, Zambia.

### UNHCR

Code: UNHCR
Full name: United Nations High Commissioner for Refugees, Executive Committee
Type: un_agency
Portfolio kind: country
Suggested seats: 60
Pool: MASTER_STANDARD_POOL plus Afghanistan, Bhutan, Cameroon, Chad, Jordan, Lebanon, Niger, Somalia, South Sudan, Tanzania, Turkiye, Uganda, Yemen, Zambia.
Notes: Host and source countries of refugees make the debate richer, so include them.

### IAEA

Code: IAEA
Full name: International Atomic Energy Agency, Board of Governors
Type: un_agency
Portfolio kind: country
Suggested seats: 35 (fixed size in the real body)
Pool: Argentina, Australia, Belgium, Brazil, Canada, China, Egypt, France, Germany, India, Indonesia, Iran, Israel, Italy, Japan, Jordan, Kazakhstan, Kenya, Malaysia, Mexico, Netherlands, Nigeria, Pakistan, Poland, Republic of Korea, Russian Federation, Saudi Arabia, South Africa, Spain, Sweden, Switzerland, Turkiye, Ukraine, United Arab Emirates, United Kingdom, United States of America, Vietnam.

### UNODC

Code: UNODC
Full name: United Nations Office on Drugs and Crime, Commission on Narcotic Drugs
Type: un_agency
Portfolio kind: country
Suggested seats: 53
Pool: MASTER_STANDARD_POOL plus Afghanistan, Bolivia, Colombia, Mexico, Myanmar, Peru, Thailand.

### UNCSW

Code: UNCSW
Full name: United Nations Commission on the Status of Women
Type: un_body
Portfolio kind: country
Suggested seats: 45
Pool: MASTER_STANDARD_POOL.

### UNWOMEN

Code: UNWOMEN
Full name: UN Women, Executive Board
Type: un_agency
Portfolio kind: country
Suggested seats: 40
Pool: MASTER_STANDARD_POOL.

## Economic, social, and environmental

### ECOSOC

Code: ECOSOC
Full name: United Nations Economic and Social Council
Type: un_body
Portfolio kind: country
Suggested seats: 54 (fixed size in the real body)
Pool: MASTER_STANDARD_POOL.

### UNEP

Code: UNEP
Full name: United Nations Environment Programme, Environment Assembly
Type: un_agency
Portfolio kind: country
Suggested seats: 60
Pool: MASTER_STANDARD_POOL plus Bhutan, Fiji, Maldives, Marshall Islands, Papua New Guinea, Seychelles, Tuvalu, Vanuatu.
Notes: Small island states add useful climate perspectives.

### UNDP

Code: UNDP
Full name: United Nations Development Programme, Executive Board
Type: un_agency
Portfolio kind: country
Suggested seats: 36 (fixed size in the real body)
Pool: MASTER_STANDARD_POOL.

### UNCTAD

Code: UNCTAD
Full name: United Nations Conference on Trade and Development
Type: un_agency
Portfolio kind: country
Suggested seats: 70
Pool: MASTER_STANDARD_POOL.

### UNICEF

Code: UNICEF
Full name: United Nations Children's Fund, Executive Board
Type: un_agency
Portfolio kind: country
Suggested seats: 36 (fixed size in the real body)
Pool: MASTER_STANDARD_POOL.

### UNESCO

Code: UNESCO
Full name: United Nations Educational, Scientific and Cultural Organization, Executive Board
Type: un_agency
Portfolio kind: country
Suggested seats: 58 (fixed size in the real body)
Pool: MASTER_STANDARD_POOL.

### WTO

Code: WTO
Full name: World Trade Organization, General Council
Type: un_agency
Portfolio kind: country
Suggested seats: 50
Pool: MASTER_STANDARD_POOL plus European Union.

## Groups and regional bodies

### G20

Code: G20
Full name: Group of Twenty
Type: regional_body
Portfolio kind: country
Suggested seats: 21
Portfolios: Argentina, Australia, Brazil, Canada, China, France, Germany, India, Indonesia, Italy, Japan, Mexico, Republic of Korea, Russian Federation, Saudi Arabia, South Africa, Turkiye, United Kingdom, United States of America, European Union, African Union.

### BRICS

Code: BRICS
Full name: BRICS
Type: regional_body
Portfolio kind: country
Suggested seats: 10
Portfolios: Brazil, Russian Federation, India, China, South Africa, Egypt, Ethiopia, Iran, United Arab Emirates, Indonesia.
Notes: Some conferences add Saudi Arabia as an invited participant.

### SAARC

Code: SAARC
Full name: South Asian Association for Regional Cooperation
Type: regional_body
Portfolio kind: country
Suggested seats: 8
Portfolios: Afghanistan, Bangladesh, Bhutan, India, Maldives, Nepal, Pakistan, Sri Lanka.
Notes: Often paired with observer countries such as China, Japan, Republic of Korea, European Union, Iran, Mauritius, Myanmar, and United States of America.

### ASEAN

Code: ASEAN
Full name: Association of Southeast Asian Nations
Type: regional_body
Portfolio kind: country
Suggested seats: 11
Portfolios: Brunei Darussalam, Cambodia, Indonesia, Laos, Malaysia, Myanmar, Philippines, Singapore, Thailand, Vietnam, Timor Leste.
Notes: Timor Leste is included in newer lists. The organizer can remove it.

### NATO

Code: NATO
Full name: North Atlantic Treaty Organization, North Atlantic Council
Type: regional_body
Portfolio kind: country
Suggested seats: 32
Portfolios: Albania, Belgium, Bulgaria, Canada, Croatia, Czech Republic, Denmark, Estonia, Finland, France, Germany, Greece, Hungary, Iceland, Italy, Latvia, Lithuania, Luxembourg, Montenegro, Netherlands, North Macedonia, Norway, Poland, Portugal, Romania, Slovakia, Slovenia, Spain, Sweden, Turkiye, United Kingdom, United States of America.

### AU

Code: AU
Full name: African Union, Assembly
Type: regional_body
Portfolio kind: country
Suggested seats: 55
Portfolios: Algeria, Angola, Benin, Botswana, Burkina Faso, Burundi, Cabo Verde, Cameroon, Central African Republic, Chad, Comoros, Republic of the Congo, Democratic Republic of the Congo, Cote d'Ivoire, Djibouti, Egypt, Equatorial Guinea, Eritrea, Eswatini, Ethiopia, Gabon, Gambia, Ghana, Guinea, Guinea Bissau, Kenya, Lesotho, Liberia, Libya, Madagascar, Malawi, Mali, Mauritania, Mauritius, Morocco, Mozambique, Namibia, Niger, Nigeria, Rwanda, Sahrawi Republic, Sao Tome and Principe, Senegal, Seychelles, Sierra Leone, Somalia, South Africa, South Sudan, Sudan, Tanzania, Togo, Tunisia, Uganda, Zambia, Zimbabwe.

### ARABLEAGUE

Code: ARABLEAGUE
Full name: League of Arab States
Type: regional_body
Portfolio kind: country
Suggested seats: 22
Portfolios: Algeria, Bahrain, Comoros, Djibouti, Egypt, Iraq, Jordan, Kuwait, Lebanon, Libya, Mauritania, Morocco, Oman, State of Palestine, Qatar, Saudi Arabia, Somalia, Sudan, Syria, Tunisia, United Arab Emirates, Yemen.

### OIC

Code: OIC
Full name: Organisation of Islamic Cooperation
Type: regional_body
Portfolio kind: country
Suggested seats: 50
Pool: Afghanistan, Albania, Algeria, Azerbaijan, Bahrain, Bangladesh, Benin, Brunei Darussalam, Burkina Faso, Cameroon, Chad, Comoros, Cote d'Ivoire, Djibouti, Egypt, Gabon, Gambia, Guinea, Guyana, Indonesia, Iran, Iraq, Jordan, Kazakhstan, Kuwait, Kyrgyzstan, Lebanon, Libya, Malaysia, Maldives, Mali, Mauritania, Morocco, Mozambique, Niger, Nigeria, Oman, Pakistan, State of Palestine, Qatar, Saudi Arabia, Senegal, Sierra Leone, Somalia, Sudan, Suriname, Syria, Tajikistan, Togo, Tunisia, Turkiye, Turkmenistan, Uganda, United Arab Emirates, Uzbekistan, Yemen.

### EU

Code: EU
Full name: European Council
Type: regional_body
Portfolio kind: country
Suggested seats: 27
Portfolios: Austria, Belgium, Bulgaria, Croatia, Cyprus, Czech Republic, Denmark, Estonia, Finland, France, Germany, Greece, Hungary, Ireland, Italy, Latvia, Lithuania, Luxembourg, Malta, Netherlands, Poland, Portugal, Romania, Slovakia, Slovenia, Spain, Sweden.

---

# Part 3. Starter presets for a whole conference

Offer these as one click bundles on the setup screen. Each bundle creates several committees at once with their seat counts.

1. School conference starter: DISEC, UNHRC, UNEP, AIPPM.
2. Standard UN conference: UNSC, DISEC, SOCHUM, UNHRC, WHO, UNEP.
3. Indian politics focus: AIPPM, Lok Sabha, Rajya Sabha, International Press Corps.
4. Economics and trade focus: ECOSOC, ECOFIN, UNCTAD, WTO, G20.
5. Regional focus: SAARC, ASEAN, African Union, League of Arab States.

# Part 4. Notes for the developer

1. Store presets in a presets table with a version number, so lists can be updated without touching conferences already created from them.
2. Let organizers add custom portfolios of any kind, including leaders, ministries, characters, and companies, since many conferences use unusual committees.
3. Flag a portfolio as "taken" only when allotted, as agreed in the product rules. Preferences never block anyone.
4. Allow free text portfolio names in AIPPM and Lok Sabha, because many conferences allot named leaders.
5. A future crisis committee preset can use portfolioKind "character", with a character name and a short role description for each seat. This file does not include crisis characters, since they depend on the scenario the organizer writes.
6. Review all lists every year before the main conference season.
