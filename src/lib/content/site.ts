/**
 * Every word on this site comes from the Kilimanjaro Pazuri Brand & Copy Deck.
 * Copy may be trimmed to fit a layout, but its tone — calm, personal,
 * unhurried — should survive every edit. Keep this file as the single
 * source of truth so the voice stays consistent across every page.
 */

export const site = {
	name: 'Kilimanjaro Pazuri',
	descriptor: 'Boutique African villa, Moshi, Tanzania',
	tagline: 'Stay close to Kilimanjaro. Feel at home in Moshi.',
	email: 'Kilimanjaropazurivillas@gmail.com',
	phone: '+255 679 500 600',
	phoneHref: '+255679500600',
	whatsapp: '255679500600',
	location: 'Moshi, Tanzania',
	/**
	 * Production note, not guest copy: the exact street address and the Maps
	 * pin are item 1 on the pre-launch checklist. Shown in the admin area only.
	 */
	internalAddressNote: 'Exact street address and Google Maps pin still to be confirmed.',
	year: 2026,
	defaultDescription:
		'Stay at Kilimanjaro Pazuri, a peaceful boutique African villa in Moshi with comfortable rooms, breakfast, WiFi, garden spaces and direct booking.'
};

/** The site in seven words. */
export const nav = [
	{ href: '/', label: 'Home' },
	{ href: '/rooms', label: 'Rooms and Rates' },
	{ href: '/about', label: 'About' },
	{ href: '/amenities', label: 'Amenities' },
	{ href: '/gallery', label: 'Gallery' },
	{ href: '/location', label: 'Location' },
	{ href: '/contact', label: 'Contact' }
];

/** Two actions, in this order, on every page. */
export const actions = {
	whatsapp: {
		label: 'Book on WhatsApp',
		href: `https://wa.me/${site.whatsapp}?text=${encodeURIComponent(
			'Hello Kilimanjaro Pazuri, I would like to enquire about a room.'
		)}`
	},
	call: { label: 'Call us', href: `tel:${site.phoneHref}` },
	rooms: { label: 'View rooms and rates', href: '/rooms' }
};

export const home = {
	heroTitle: 'Your peaceful stay in the heart of Moshi',
	heroText:
		'Discover the warmth of Kilimanjaro Pazuri, a boutique African villa offering comfortable rooms, a peaceful garden and thoughtful hospitality in Moshi, Tanzania.',
	welcomeTagline: 'Welcome',
	welcomeTitle: 'Welcome to Kilimanjaro Pazuri',
	welcomeOne:
		'A peaceful place to rest, recharge and experience Moshi at your own pace. Kilimanjaro Pazuri combines the comfort of a private villa with warm local hospitality — a welcoming base for leisure travellers, safari guests, Kilimanjaro climbers and visitors exploring northern Tanzania.',
	welcomeTwo:
		'Relax in the garden, enjoy the outdoor seating or settle into your room after a day of travel. Complimentary WiFi and thoughtful guest amenities make every stay comfortable and easy.',
	whyTitle: 'Why stay with us',
	/** Six short reasons, set as two quiet columns — not cards. */
	why: [
		{
			icon: 'icon-house',
			title: 'A peaceful villa setting',
			text: 'A calm garden away from the rush of the day.'
		},
		{
			icon: 'icon-restaurant',
			title: 'Breakfast included',
			text: 'Every morning, in your room rate.'
		},
		{
			icon: 'icon-check-star',
			title: 'A warm welcome',
			text: 'A juice and a bottle of water for every guest on arrival.'
		},
		{
			icon: 'icon-pin',
			title: 'A convenient Moshi base',
			text: 'Within easy reach of northern Tanzania.'
		},
		{
			icon: 'icon-wifi-router',
			title: 'Complimentary WiFi',
			text: 'Connected throughout your visit.'
		},
		{
			icon: 'icon-support',
			title: 'A multilingual reception',
			text: 'Assistance in six international languages.'
		}
	],
	roomsTitle: 'Rooms made for rest',
	roomsText:
		'Choose from six individually named rooms, each designed for a comfortable and relaxing stay. Every rate includes breakfast, a welcome juice and a complimentary bottle of water.',
	roomsCta: 'Explore our rooms'
};

export const rooms = {
	title: 'Six rooms, each with a name',
	heroLead:
		'Choose a welcoming private room, settle into the calm of the villa and make Moshi your base for the journey ahead.',
	intro:
		'The rooms are named for the places guests come to Tanzania to see. Rates are in US dollars, per room per night, and every one includes breakfast, a welcome juice and a bottle of water.',
	ratesTitle: 'Simple rates, thoughtful inclusions',
	ratesIntro:
		'Compare every room in one place. The price shown is the nightly room rate in US dollars, with the essentials for an easy arrival already included.',
	/** Shared sentence, identical across all six room pages. */
	pageIntro:
		'Settle into a comfortable private room at Kilimanjaro Pazuri and enjoy a peaceful villa atmosphere in Moshi. Your stay includes breakfast, a refreshing welcome juice and a complimentary bottle of water.',
	included: ['Breakfast', 'A welcome juice', 'A complimentary bottle of water'],
	/**
	 * Guests and bed type are still to be confirmed per room, so the site says
	 * nothing about them rather than publishing a placeholder as a fact.
	 */
	unconfirmed: 'To be confirmed',
	cta: 'Book this room'
};

export const amenities = {
	title: 'Everything you need for a comfortable stay',
	heroLead:
		'Thoughtful essentials, welcoming shared spaces and the everyday comforts that make it easy to settle in.',
	introTitle: 'Comfort, without complication',
	intro:
		'Kilimanjaro Pazuri balances the privacy of your room with relaxed places to eat, unwind and enjoy the pace of Moshi. Each detail is here to make arriving, resting and setting out again feel easy.',
	/** A working assumption — confirm which are in every room and which are shared. */
	/** Said plainly, rather than implying every comfort is in every room. */
	note: 'Some of these are shared villa facilities. Tell us what you need when you enquire and we will confirm it for your room.',
	noteTitle: 'Know before you arrive',
	groups: [
		{
			kicker: 'Shared spaces',
			title: 'Around the villa',
			description:
				'Step beyond your room into welcoming spaces for slow mornings, easy meals, movement and time in the open air.',
			image: '/assets/images/villa/dining.jpg',
			imageAlt: 'The shared dining room at Kilimanjaro Pazuri',
			items: [
				{ icon: 'icon-real-estate', label: 'Serene garden' },
				{ icon: 'icon-house', label: 'Outdoor seating' },
				{ icon: 'icon-restaurant', label: 'Dining area' },
				{ icon: 'icon-kitchen', label: 'Barbecue facilities' },
				{ icon: 'icon-dumbbell', label: 'Fitness room' }
			]
		},
		{
			kicker: 'Room comforts',
			title: 'In and near the rooms',
			description:
				'Useful everyday facilities bring the comforts of home close at hand. Availability varies by room, so let us know what matters most to your stay.',
			image: '/assets/images/villa/shower.jpg',
			imageAlt: 'A modern guest shower at Kilimanjaro Pazuri',
			items: [
				{ icon: 'icon-bath', label: 'Private bathroom' },
				{ icon: 'icon-buildings', label: 'Balcony' },
				{ icon: 'icon-kitchen', label: 'Kitchenette' },
				{ icon: 'icon-restaurant', label: 'Tea and coffee maker' },
				{ icon: 'icon-support', label: 'Hairdryer' },
				{ icon: 'icon-laptop-menu', label: 'Television' }
			]
		},
		{
			kicker: 'Part of every stay',
			title: 'Always included',
			description:
				'These simple essentials are included in every published room rate, from your welcome on arrival to breakfast the next morning.',
			image: '/assets/images/villa/kitchen.jpg',
			imageAlt: 'The kitchen at Kilimanjaro Pazuri',
			items: [
				{ icon: 'icon-wifi-router', label: 'Complimentary WiFi' },
				{ icon: 'icon-restaurant', label: 'Breakfast' },
				{ icon: 'icon-check-star', label: 'Welcome juice' },
				{ icon: 'icon-checked', label: 'Bottled water' }
			]
		}
	]
};

export const about = {
	title: 'A relaxed African villa in Moshi',
	heroLead:
		'A private, welcoming place to slow down between the mountain, safari and everything else northern Tanzania has in store.',
	storyTitle: 'A quiet base for the journey ahead',
	storyNote:
		'Come back from a day of travel to calm rooms, generous shared spaces and hospitality that feels personal.',
	welcomeTitle: 'A welcome in six languages',
	paragraphs: [
		'Kilimanjaro Pazuri was created for travellers who appreciate comfort, calm surroundings and personal hospitality. Located in Moshi, the villa is a convenient place to unwind before or after exploring Kilimanjaro and the wider northern region.',
		'Guests can enjoy the garden, the outdoor seating and the fitness room while staying connected with complimentary WiFi. The intimate setting suits independent travellers, couples, friends and visitors passing through Moshi on longer Tanzanian journeys.',
		'Our reception team can welcome you in German, English, Spanish, French, Italian and Vietnamese.'
	],
	languages: ['German', 'English', 'Spanish', 'French', 'Italian', 'Vietnamese']
};

export const location = {
	title: 'In Moshi, close to the mountain',
	heroLead:
		'A peaceful place to return to in Moshi, with useful connections for the airport, town and the wider Kilimanjaro region.',
	intro:
		"Kilimanjaro Pazuri sits in Moshi, with easy access to transport and the region's attractions — and a peaceful place to return to at the end of the day.",
	mapTitle: 'Plan your arrival',
	mapNote:
		'This map shows the Moshi area. Contact the villa before travel for the precise arrival pin and local directions.',
	mapCta: 'Open Moshi map',
	/** What the embedded map points at. Replace with the exact address once confirmed. */
	mapQuery: 'Moshi, Kilimanjaro Region, Tanzania',
	distancesTitle: 'Useful reference points',
	distancesIntro:
		'Use these approximate road distances as a starting point when planning your arrival or a day beyond the villa.',
	/** Distances are approximate. Add the exact street address and Maps pin before launch. */
	distances: [
		{
			name: 'Moshi Railway Station',
			distance: 'about 7 km',
			context: 'A useful connection for rail travel in and out of Moshi.',
			icon: 'icon-pin'
		},
		{
			name: 'Kilimanjaro International Airport',
			distance: 'about 44 km',
			context: 'The main international arrival point for the Kilimanjaro region.',
			icon: 'icon-support'
		},
		{
			name: 'Lake Chala',
			distance: 'about 44 km',
			context: 'A scenic reference point for guests exploring beyond Moshi.',
			icon: 'icon-real-estate'
		}
	]
};

export const gallery = {
	title: 'Experience Kilimanjaro Pazuri',
	heroLead:
		'Look through the rooms, shared spaces and thoughtful details that shape a stay at our villa in Moshi.',
	intro:
		'Explore our rooms, peaceful garden and welcoming villa spaces before your stay.',
	hint: 'Select any photograph to open a larger view and move through its collection.'
};

export const booking = {
	title: 'Ready for your stay in Moshi?',
	text: 'Choose your room and contact Kilimanjaro Pazuri directly to arrange your stay.'
};

export const contact = {
	title: 'We would love to welcome you',
	heroLead:
		'Tell us when you hope to stay and what you need. Contact the villa directly for room availability, rates and a more personal arrival in Moshi.',
	intro:
		'Planning a stay in Moshi? Contact us for room enquiries, availability and direct booking.',
	guidance:
		'Share your preferred dates and room if you know them, or simply tell us about your trip. We will help you take the next step.',
	directTitle: 'Talk to the villa',
	directIntro:
		'Reach Kilimanjaro Pazuri without a booking platform. Use WhatsApp, email or telephone to speak with the villa directly.',
	formTitle: 'Send a stay enquiry',
	formIntro:
		'Share the details you know now. We can work through the rest together.',
	responseTitle: 'Your path to Pazuri',
	responseIntro:
		'One direct conversation takes you from choosing a room to finding the villa.',
	responseSteps: [
		{
			icon: 'icon-laptop-menu',
			title: 'Enquire',
			text: 'Send your dates, guest count and room preference.'
		},
		{
			icon: 'icon-check-star',
			title: 'Arrange',
			text: 'Confirm availability and the details of your stay directly with us.'
		},
		{
			icon: 'icon-pin',
			title: 'Arrive',
			text: 'Receive the precise pin and make your way to the villa in Moshi.'
		}
	]
};

export const footer = {
	line: 'Kilimanjaro Pazuri — Boutique African Villa in Moshi, Tanzania.',
	text: 'A peaceful place to rest, recharge and experience northern Tanzania.',
	copyright: `© ${site.year} Kilimanjaro Pazuri. All rights reserved.`
};

/** How the villa appears in search. */
export const seo = {
	home: {
		title: 'Kilimanjaro Pazuri | Boutique Villa in Moshi, Tanzania',
		description: site.defaultDescription
	},
	rooms: {
		title: 'Rooms & Rates | Kilimanjaro Pazuri Moshi',
		description: rooms.intro
	},
	location: {
		title: 'Kilimanjaro Pazuri Location | Villa in Moshi, Tanzania',
		description: location.intro
	}
};

/**
 * Fourteen details the property owner must confirm before the site goes live.
 * Surfaced on the admin dashboard so nothing is published unverified.
 */
export const preLaunchChecklist = [
	'Exact street address and the Google Maps pin',
	'Check-in and check-out times',
	'Maximum occupancy for every room',
	'Bed type and bed count for every room',
	'That published prices are per room, per night',
	'Children and extra-bed policy',
	'Cancellation and refund policy',
	'Accepted payment methods',
	'Airport transfer availability and pricing',
	'Safari, Kilimanjaro or tour arrangement services',
	'Which amenities are in-room and which are shared',
	'Social media links',
	'Official logo files',
	'The exact spelling of the Seluhi room name'
];

/**
 * Every photograph the pages place themselves, gathered here so each one is
 * editable — and replaceable by upload — from the admin area.
 */
export const images = {
	homeHeroOne: '/assets/images/villa/hero-garden-suite.jpg',
	homeHeroTwo: '/assets/images/villa/room-5.jpg',
	homeHeroThree: '/assets/images/villa/dining.jpg',
	homeHeroFour: '/assets/images/villa/gallery-6.jpg',
	homeWelcome: '/assets/images/villa/room-3.jpg',
	roomsHeader: '/assets/images/villa/hero-garden-suite.jpg',
	aboutHeader: '/assets/images/villa/dining.jpg',
	aboutOne: '/assets/images/villa/hero-garden-suite.jpg',
	aboutTwo: '/assets/images/villa/kitchen.jpg',
	amenitiesHeader: '/assets/images/villa/dining.jpg',
	galleryHeader: '/assets/images/villa/room-5.jpg',
	locationHeader: '/assets/images/villa/gallery-7.jpg',
	contactHeader: '/assets/images/villa/gallery-1.jpg',
	contactAside: '/assets/images/villa/hero-garden-suite.jpg',
	shareCard: '/assets/images/villa/hero-garden-suite.jpg'
};
