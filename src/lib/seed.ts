import type { Content, Story, TextItem } from './types';
import { slugify } from './utils';
import { CHANNEL_VIDEOS, COVERAGE, DEMANDS, EXTRA_PRESS, KHABAR_PALIKA_ROLE, LINKEDIN, PRESS_LOGO_FILES, PRESS_SITES, UNITS, YOUTUBE_CHANNEL, pressItems } from './verified';

// Initial content, taken from the original single-page site. Written to data/content.json on first run.

const story = (
  id: string,
  category: string,
  title: string,
  date: string,
  readTime: string,
  body: string[],
  sourceUrl = '',
): Story => ({
  id,
  published: true,
  slug: slugify(title),
  category,
  title,
  date,
  readTime,
  image: '',
  body: body.join('\n\n'),
  sourceUrl,
});

export const CONTENT_VERSION = 3;

export const OLD_HERO_EYEBROW = 'Journalist · Filmmaker · Haryana';
export const NEW_HERO_EYEBROW = 'Senior Journalist · Documentary Filmmaker · Haryana';
export const OLD_ABOUT_BIO_END = 'Through both, she speaks for working journalists on welfare, safety and fair treatment.';
export const NEW_ABOUT_BIO_END =
  'Through both, she speaks for working journalists on welfare, safety and fair treatment. She is also the founder and editor-in-chief of Khabar Palika, Sonipat NCR.';

export function seedContent(): Content {
  return {
    version: CONTENT_VERSION,
    settings: {
      logoFirst: 'DR. INDU',
      logoAccent: 'BANSAL',
      tagline: 'Journalist | Shramjeevi Patrakar Sangh Haryana',
      personName: 'Dr. Indu Bansal',
      seoTitle: 'Dr. Indu Bansal · Journalist, Haryana',
      seoSuffix: 'Journalist, Haryana',
      seoDescription:
        'Dr. Indu Bansal: journalist, documentary filmmaker, founder and state president of Shramjeevi Patrakar Sangh Haryana, Sonipat.',
      ogDescription: 'Stories for a Better Haryana',
      siteUrl: 'https://indubansal.vercel.app',
      seoKeywords:
        'Dr. Indu Bansal, डॉ. इंदु बंसल, Indu Bansal journalist, Shramjeevi Patrakar Sangh Haryana, श्रमजीवी पत्रकार संघ हरियाणा, Haryana journalists union, Sonipat journalist, Khabar Palika',
      googleVerification: '',
      ga4MeasurementId: '',
      ga4PropertyId: '',
      gscProperty: '',
      accentColor: '#d3141c',
      defaultFont: 'A',
      showPreloader: false,
      showFontSwitcher: true,
      showWhatsApp: true,
      storeSubmissions: true,

      heroEyebrow: NEW_HERO_EYEBROW,
      heroName: 'Dr. Indu Bansal',
      heroNameHindi: 'डॉ. इंदु बंसल',
      heroTitle: 'People.\nStories.\nA _Stronger_\nHaryana.',
      heroRedFrom: 3,
      heroText:
        'Journalist and documentary filmmaker from Sonipat. Founder of Shramjeevi Patrakar Sangh Haryana, reporting real stories and standing up for working journalists.',
      heroImage: '/hero.webp',
      heroCta1Label: 'Explore My Work →',
      heroCta1Link: '/updates',
      heroCta2Label: '◉ Watch Reel',
      heroCta2Link: '/media',

      aboutShort:
        'Journalist and documentary filmmaker from Sonipat, Haryana, with more than 23 years in news reporting, media and film production. Founder and State President of Shramjeevi Patrakar Sangh Haryana and National Spokesperson of Bharti Shramjeevi Patrakar Sangh.',
      aboutBio:
        'Dr. Indu Bansal is a journalist and documentary filmmaker from Sonipat, Haryana. In more than 23 years she has worked across journalism, media, news reporting and film production, including religious and political documentaries. She holds a Master’s degree and an M.Phil.\n\nShe is the founder and state president of Shramjeevi Patrakar Sangh Haryana and the National Spokesperson of Bharti Shramjeevi Patrakar Sangh, New Delhi. Through both, she speaks for working journalists on welfare, safety and fair treatment. She is also the founder and editor-in-chief of Khabar Palika, Sonipat NCR.',
      aboutIntro: 'Journalist, documentary filmmaker and a voice for working journalists.',
      aboutImage: '',

      servicesEyebrow: 'What I Do',
      servicesTitle: 'Journalism with a purpose',
      initiativesEyebrow: 'Leading the Sangh',
      initiativesTitle: 'Working for working journalists',
      updatesEyebrow: 'Latest Updates',
      updatesTitle: 'From the Sangh and the field',
      updatesIntro: 'News from Shramjeevi Patrakar Sangh Haryana and the national journalists’ movement.',
      honoursEyebrow: 'Honours',
      honoursTitle: 'Recognition & Achievements',
      awardsIntro: 'Honours, recognition and the roles I hold.',
      videoEyebrow: 'Video & Podcast',
      videoTitle: 'Watch the Latest',
      videoText: 'News videos and coverage of the Sangh’s work, on YouTube, Facebook and Instagram.',
      mediaIntro: 'News videos and coverage of the Sangh’s work, across YouTube, Facebook and Instagram.',
      galleryEyebrow: 'Photo Gallery',
      galleryTitle: 'Moments from the Journey',
      galleryIntro: 'Moments from events, press meets, ceremonies and the field.',
      galleryCategories: 'Events\nPress meets\nSamman Samaroh\nField',
      milestonesEyebrow: 'Milestones',
      milestonesTitle: 'A career in public interest',
      pressEyebrow: 'In the News',

      bandTitle: 'Are you a working journalist in Haryana?',
      bandText:
        'Connect with Shramjeevi Patrakar Sangh Haryana for membership, welfare support and updates from your district.',
      joinCta: 'Join the Sangh →',
      connectTitle: 'Let’s Connect',
      connectText: 'For story tips, collaborations, media enquiries or just to say hello.',

      location: 'Sonipat, Haryana, India',
      phone: '+91 87603 08030',
      whatsapp: '918760308030',
      waGreeting: 'Hello Dr. Indu Bansal, I found your website and would like to connect.',
      email: '',
      instagram: 'https://www.instagram.com/spshharyana/',
      instagramHandle: '@spshharyana',
      linkedin: LINKEDIN,
      facebook: '',
      x: '',
      youtube: YOUTUBE_CHANNEL,

      contactIntro: 'Story tips, membership, media enquiries and collaborations are all welcome.',
      contactTopics: 'Story tip\nMedia enquiry\nCollaboration\nOther',
      contactNote: 'Opens WhatsApp with your message pre-filled.',

      joinIntro:
        'Become a member of Shramjeevi Patrakar Sangh Haryana: one voice for working journalists across the state.',
      joinNote: 'This opens WhatsApp with your details pre-filled. A copy also reaches the Sangh’s website inbox.',
      benefitsNote: 'Benefits are as announced by the Sangh. Please confirm current details with your district unit.',
      districts:
        'Ambala\nBhiwani\nCharkhi Dadri\nFaridabad\nFatehabad\nGurugram\nHisar\nJhajjar\nJind\nKaithal\nKarnal\nKurukshetra\nMahendragarh\nNuh\nPalwal\nPanchkula\nPanipat\nRewari\nRohtak\nSirsa\nSonipat\nYamunanagar\nOutside Haryana',
      joinRoles:
        'Reporter\nEditor\nPhotographer / Videographer\nNews anchor\nDigital / web journalist\nFreelancer\nOther',

      sanghName: 'Shramjeevi Patrakar Sangh Haryana',
      sanghIntro:
        'A trade union of working journalists in Haryana, founded and led by Dr. Indu Bansal as state president. The Sangh works for journalists’ welfare, safety and fair treatment, with district units across the state.',
      // As stated in the Sangh's own Instagram bio and YouTube channel description.
      credentials: 'Registered under the Indian Trade Union Act, 1926\nISO certified journalists’ union\nRegistered trademark (TM)',
      foundationDay:
        'The Sangh celebrates its Foundation Day on National Press Day, 16 November. In 2025, programmes were held at district headquarters across Haryana.',
      demandsIntro: 'Pending demands the Sangh has taken to the government on behalf of working journalists.',
      unitsIntro: 'District units and recent activity, as reported in the press and on the Sangh’s YouTube channel.',
      pressIntro: 'News reports about Dr. Indu Bansal and Shramjeevi Patrakar Sangh Haryana. Each link opens the original article.',
      followTitle: 'Follow the Sangh',
      followText: 'Regular updates, event photos and videos from districts across Haryana.',

      footerText: 'Stories that inform. Journalism that empowers. Working for a better, more informed Haryana.',
      footerScript: 'Journalism\nfor People',
    },

    stories: [
      story('s1', 'Sangh Updates', 'Palwal journalists receive free ₹5 lakh insurance, press ID cards and vehicle passes', '26 Oct 2026', '3 min', [
        'As part of its free insurance policy distribution campaign, Shramjeevi Patrakar Sangh Haryana handed journalists of Palwal district a free ₹5 lakh insurance policy, along with press identity cards and vehicle passes, at a special ceremony at Haveli Resort in Palwal on 26 October.',
        'The ceremony was presided over by founder and state president Dr. Indu Bansal Jain. Haryana’s Minister of State for Sports, Gaurav Gautam, attended as chief guest and praised the initiative, speaking about journalists’ unity, safety and impartial reporting.',
        'After speaking with Dr. Bansal, Palwal district president Bhushan Ohlian and media coordinator Nitin Sharma, the minister announced ₹11 lakh for the Sangh. Dr. Bansal said the Sangh will keep working for journalists’ interests and welfare, and that hundreds of journalists across all districts of Haryana will receive free insurance policies in the same way.',
        'State general secretary Naveen Bansal, members of the Palwal district unit and senior local journalists were also present.',
      ], 'https://rajneetimanch.in/2026/10/plvl-jile-ke-ptrkaron-ko-vitrit-huee-5-lakh-kee-nihshulk-beema-p-lisee-v-pres-phchan-ptr-evan-vahn-pas/'),
      story('s2', 'Sangh Updates', 'Free ₹5 lakh insurance policy announced for journalists at Pataudi', 'Oct 2026', '3 min', [
        'At an event in Pataudi, Shramjeevi Patrakar Sangh Haryana announced a free ₹5 lakh insurance policy for journalists, in line with its stated priority of giving members social, economic and health security.',
        'Dr. Indu Bansal Jain took part in the programme, where Naresh Sharma was also named district president again.',
      ]),
      story('s3', 'Journalist Welfare', 'Gohana journalists receive ₹5 lakh insurance policy, press ID cards and vehicle passes', '29 Sep 2026', '2 min', [
        'Rajneeti Manch reported on 29 September 2026 that journalists in Gohana received a ₹5 lakh insurance policy, press identity cards and vehicle passes.',
        'Similar distribution events have since followed in other districts, including Palwal on 26 October.',
      ], 'https://rajneetimanch.in/2026/09/gohana-ke-ptrkaron-ko-milee-5-lakh-kee-beema-p-lisee-pres-phchan-ptr-aur-vahn-pas-kee-saugat/'),
      story('s4', 'Journalist Welfare', 'Haryana’s working journalists hold a first-of-its-kind dharna at Jantar Mantar', 'Mar 2026', '4 min', [
        'Led by founder and state president Dr. Indu Bansal Jain, Shramjeevi Patrakar Sangh Haryana held a large dharna at Jantar Mantar in Delhi, described in press reports as a first for Haryana, to press for the protection of journalists’ rights.',
        'A memorandum covering the Journalist Protection Act and other pending demands was submitted, addressed to the Prime Minister and the Haryana Chief Minister.',
      ]),
      story('s5', 'Sangh Updates', 'Jhajjar district unit formed; press ID cards and vehicle passes distributed', 'Jan 2026', '3 min', [
        'Shramjeevi Patrakar Sangh Haryana formed its Jhajjar district unit at a meeting of local journalists held at the PWD rest house.',
        'Press identity cards and vehicle passes of the Sangh were also distributed to members at the event.',
      ]),
      story('s6', 'Sangh Updates', 'District executives and ₹5 lakh insurance cover planned across Haryana', 'Feb 2025', '3 min', [
        'At a state executive meeting in Sonipat, chaired by founder and state president Dr. Indu Bansal, Shramjeevi Patrakar Sangh Haryana discussed journalists’ interests and the expansion of the organisation.',
        'It was decided unanimously that district executives will soon be formed across Haryana, together with a ₹5 lakh insurance policy for members. The meeting also discussed organising a Patrakar Samman Samaroh in Panipat.',
      ]),
      story('s7', 'Journalist Welfare', 'Demand-letter campaign reaches district headquarters', '2025', '3 min', [
        'Shramjeevi Patrakar Sangh Haryana has been running a state-wide campaign to submit demand letters on journalists’ pending issues to the government through district officials.',
        'District units in Palwal, Pataudi and Rewari were the first to submit letters. Ambala, Hansi and Gohana were announced as the next district headquarters.',
      ]),
      story('s8', 'Journalist Welfare', 'Free education for children of journalist families', 'Announcement', '2 min', [
        'Somani Shikshan Sansthan will provide free education to the children of journalist families associated with Shramjeevi Patrakar Sangh Haryana, as announced by Dr. Indu Bansal.',
        'For eligibility and how to apply, please get in touch with the Sangh through the contact page.',
      ]),
      story('s9', 'National · BSPS', 'Journalists rally at Jantar Mantar for a Journalist Protection Act', '2025', '4 min', [
        'Bharti Shramjeevi Patrakar Sangh staged a protest at Jantar Mantar in Delhi, with journalists from across 20 states, calling for implementation of a Journalist Protection Act and other demands concerning media professionals.',
        'Dr. Indu Bansal, National Spokesperson of the organisation from Haryana, was among the office bearers present.',
      ]),
      story('s10', 'National · BSPS', 'New state president named for BSPS Chhattisgarh unit', 'Oct 2024', '2 min', [
        'Announcing the appointment on behalf of the organisation, National Spokesperson Dr. Indu Bansal said senior journalist Gangesh Dwivedi was named state president of the Chhattisgarh unit.',
        'The official announcement was made by national president Ashok Pandey and national general secretary Shahnawaz Hasan.',
      ]),
      story('s11', 'National · BSPS', 'BSPS announces its 2025–27 national executive', '2025', '3 min', [
        'The new National Executive Committee of Bharati Shramjeevi Patrakar Sangh for 2025–27 was announced, with Ashok Pandey leading the organisation again and Dr. Naveen Anand Joshi appointed general secretary.',
        'Dr. Indu Bansal is listed among the state representatives as Haryana State President.',
      ]),
    ],

    videos: [
      ['प्रदेशाध्यक्ष डॉ. इंदु बंसल ने क्या कहा: देखिए पूरी खबर', 'YouTube', 'https://www.youtube.com/watch?v=VwTLlzrL2uQ', true],
      ['प्रदेशाध्यक्ष डॉ. इंदु बंसल ने क्या कहा: देखिए पूरी खबर', 'Facebook', 'https://www.facebook.com/share/v/1GTrjwRbQs/', false],
      ['प्रदेशाध्यक्ष डॉ. इंदु बंसल ने क्या कहा: देखिए पूरी खबर', 'Instagram Reel', 'https://www.instagram.com/reel/De6evfnRT24/', false],
      ['पलवल के पत्रकारों को वितरित हुई निःशुल्क बीमा पॉलिसी', 'YouTube', 'https://youtu.be/Egz6DO8mvxo', false],
      ['अनूठी पहल: पलवल के पत्रकारों को बांटे ₹5 लाख के निःशुल्क बीमा बांड', 'Facebook', 'https://www.facebook.com/share/v/19VNotjSzh/', false],
      ['Watch the latest Short', 'YouTube Short', 'https://www.youtube.com/shorts/cK174zjMOv4', false],
      ['Watch the latest post', 'Facebook', 'https://www.facebook.com/share/1KJrScuhSe/', false],
      ['Follow the Sangh on Instagram', '@spshharyana', 'https://www.instagram.com/spshharyana/', false],
    ].map(([title, platform, url, featured], i) => ({
      id: `v${i + 1}`,
      published: true,
      title: title as string,
      section: 'News',
      platform: platform as string,
      url: url as string,
      image: '',
      featured: featured as boolean,
    })).concat(CHANNEL_VIDEOS),

    gallery: Array.from({ length: 12 }, (_, i) => ({
      id: `g${i + 1}`,
      published: true,
      image: '',
      caption: '',
      category: ['Events', 'Press meets', 'Samman Samaroh', 'Field'][i % 4],
    })),

    awards: [
      ['Honour', 'cup', 'Best Journalist Award', 'Governor of Haryana · 2008 & 2022', 'Honoured twice by the Governor of Haryana for journalism.'],
      ['Honour', 'star', 'Best Journalist Award', 'Chief Minister of Haryana · 2010', 'Honoured by the Chief Minister of Haryana.'],
      ['Honour', 'doc', 'London Book of World Records', 'Record holder', 'Listed as a London Book of World Records holder.'],
      ['Honour', 'cap', 'Honorary Doctorate', '2024', 'Honorary doctorate conferred in 2024.'],
      ['Role', 'mic', 'National Spokesperson', 'Bharti Shramjeevi Patrakar Sangh, New Delhi', 'Speaks for working journalists at the national level.'],
      ['Role', 'shield', 'Founder & State President', 'Shramjeevi Patrakar Sangh Haryana', 'Leads the Haryana unit of the journalists’ organisation.'],
    ].map(([kind, icon, title, subtitle, description], i) => ({
      id: `a${i + 1}`,
      published: true,
      kind: kind as 'Honour' | 'Role',
      icon,
      title,
      subtitle,
      description,
    })).concat(KHABAR_PALIKA_ROLE),

    milestones: [
      ['2008', 'Best Journalist Award', 'Honoured by the Governor of Haryana.'],
      ['2010', 'Best Journalist Award', 'Honoured by the Chief Minister of Haryana.'],
      ['2022', 'Best Journalist Award, again', 'Honoured a second time by the Governor of Haryana.'],
      ['2024', 'Honorary Doctorate', 'Conferred in recognition of her work.'],
      ['2025', 'Growing the Sangh', 'District executives and a state-wide demand-letter campaign across Haryana.'],
      ['2026', 'Jantar Mantar dharna and free insurance', 'Led a first-of-its-kind dharna of Haryana’s working journalists in Delhi, and began distributing free ₹5 lakh insurance policies, press ID cards and vehicle passes district by district.'],
    ].map(([year, title, text], i) => ({ id: `m${i + 1}`, published: true, year, title, text })),

    services: [
      ['mic', 'Journalism & reporting', 'More than 23 years of news reporting and media work.'],
      ['film', 'Documentary filmmaking', 'Religious and political documentary films.'],
      ['shield', 'Journalists’ welfare', 'Insurance, education support and district units for working journalists.'],
      ['us', 'Media advocacy', 'National spokesperson of Bharti Shramjeevi Patrakar Sangh, New Delhi.'],
    ].map(([icon, title, text], i) => ({ id: `w${i + 1}`, published: true, icon, title, text })),

    initiatives: [
      ['shield', 'Free ₹5 lakh insurance', 'Free insurance policies, press ID cards and vehicle passes for journalists, being handed out district by district, most recently in Palwal.'],
      ['us', 'District executives', 'District units are being formed so journalists have local representation.'],
      ['cap', 'Free education support', 'Free education for the children of journalist families in the Sangh.'],
      ['star', 'Patrakar Samman Samaroh', 'A planned ceremony in Panipat to honour working journalists.'],
    ].map(([icon, title, text], i) => ({ id: `i${i + 1}`, published: true, icon, title, text })),

    highlights: [
      ['mic', 'News reporting', '23+ years in the field'],
      ['film', 'Documentary films', 'Religious and political'],
      ['shield', 'Journalists’ welfare', 'Insurance and education support'],
      ['us', 'National voice', 'BSPS spokesperson'],
    ].map(([icon, title, text], i) => ({ id: `h${i + 1}`, published: true, icon, title, text })),

    homeStats: [
      ['23', '+', 'Years in journalism'],
      ['3', '', 'Best Journalist awards'],
      ['State President', '', 'Shramjeevi Patrakar Sangh Haryana'],
      ['National Spokesperson', '', 'Bharti Shramjeevi Patrakar Sangh'],
    ].map(([value, suffix, label], i) => ({ id: `hs${i + 1}`, published: true, value, suffix, label })),

    aboutStats: [
      ['Sonipat', '', 'Based in Haryana'],
      ['23', '+', 'Years of experience'],
      ['Master’s & M.Phil.', '', 'Education'],
      ['Reporter & Filmmaker', '', 'Work'],
    ].map(([value, suffix, label], i) => ({ id: `as${i + 1}`, published: true, value, suffix, label })),

    benefits: [
      'Free ₹5 lakh insurance policy for journalists, announced at Pataudi',
      'Sangh press identity card and vehicle pass',
      'A district unit to represent you locally',
      'A collective voice on pending demands, including the Journalist Protection Act',
      'Free education support for children of journalist families',
    ].map((text, i) => ({ id: `b${i + 1}`, published: true, text })),

    pressLogos: ['Discovery Times', 'Paigam-E-Jagat', 'Muslim Mirror', 'BNT Live', 'Morning Kashmir']
      .map((text, i): TextItem => ({ id: `p${i + 1}`, published: true, text, image: PRESS_LOGO_FILES[text] || '', url: PRESS_SITES[text] || '' }))
      .concat(pressItems(EXTRA_PRESS)),

    units: UNITS,
    demands: DEMANDS,
    coverage: COVERAGE,
  };
}
