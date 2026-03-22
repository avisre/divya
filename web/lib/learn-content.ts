import type { LearnEntry } from "./types";

function createLearnEntry(entry: LearnEntry): LearnEntry {
  return entry;
}

// NOTE: relatedPujaIds use stable puja slugs in the web layer so links can be
// resolved without relying on environment-specific database ObjectIds.
export const learnEntries: LearnEntry[] = [
  createLearnEntry({
    id: "bhadra-bhagavathi",
    slug: "bhadra-bhagavathi",
    title: "Bhadra Bhagavathi",
    subtitle: "The fierce mother who protects without being asked.",
    category: "deities",
    bodyMd: `She does not wait to be called. That is the first thing to understand
about Bhadra Bhagavathi.

In the Kerala tradition, Bhagavathi - the Goddess - is not a gentle
figure you approach with requests. She is the primal force that holds
the world together by occasionally shaking it. She is Bhadra, which
means auspicious, and she is also the one who destroys what needs
destroying. Both things are true at once.

The temple at Karunagapally is dedicated to Bhadra Bhagavathi - a
form of the Goddess associated with the southwest coast of Kerala,
where the sea has always made people understand that some forces are
beyond negotiation. Fishermen's families prayed here. Women prayed
here before long journeys. Children were brought here at birth so she
would know them.

The name Bhagavathi comes from the Sanskrit root *bhaga* - fortune,
grace, the divine quality that cannot be manufactured or purchased,
only received. She distributes it. She also withholds it when you are
not paying attention to your life.

**What makes her different from other forms of the Goddess?**

In the North Indian tradition, Durga and Kali are her fiercer faces -
worshipped separately, given their own iconography, their own festivals.
In Kerala, Bhagavathi contains all of these within herself. She can be
Saraswati in the morning - presiding over learning and music - and
Kali by evening, the one who stands at the edge of death and says:
*not yet*. The Tantric priests of Kerala understand her as a complete
force, not a partial one.

**Why families abroad feel her pull**

When NRI families describe what they miss about Kerala, they often
eventually describe something like this: the sense that a place is
looking after you. Not in an abstract, theological way - in the
concrete, particular way of a mother who notices when you have not
eaten.

Bhadra Bhagavathi is that feeling made into stone, ritual, and
presence. When your family's name is spoken aloud during the
Abhishekam, it reaches her - not as data, not as a transaction,
but as an act of remembrance. You are saying: we are still here.
We still remember who we are.

That is what the ceremony is for.`,
    connectToPractice: `The Mahishasura Mardini Stotram is the most complete hymn to
Bhagavathi in her fierce form - eighteen verses that describe her
battle, her adornments, and her grace. Read it before booking
an Abhishekam and the puja will mean something different.`,
    relatedPrayerSlugs: ["mahishasura-mardini"],
    relatedPujaIds: ["abhishekam", "sahasranama-archana", "kalasha-puja"],
    relatedEntryIds: ["durga-kali", "kerala-traditions-tantric"],
    deityImageSlug: null,
    readingTimeMinutes: 4,
    isFeatured: true,
    tier: "free"
  }),
  createLearnEntry({
    id: "ganesha",
    slug: "ganesha",
    title: "Ganesha",
    subtitle: "He goes first. There is a reason for that.",
    category: "deities",
    bodyMd: `Before any ritual in the Hindu tradition, you invoke Ganesha. Before
any journey, any business, any wedding, any prayer - Ganesha first.
This is not superstition. It is architecture.

The logic goes like this: Ganesha is the lord of beginnings and the
remover of obstacles. An obstacle, in this framework, is not just
something blocking your path. It is also the noise in your own mind
- the distraction, the doubt, the half-attention you bring to
something that deserves your whole attention. By invoking Ganesha at
the start, you are performing an act of intention. You are saying:
I am now beginning. What comes before this moment is behind me.

**The story of his head**

The story most people know is that Shiva, returning from long
meditation, did not recognise his own son and severed his head.
Parvati, his wife and Ganesha's mother, was distraught. Shiva,
realising his error, sent his attendants to bring the head of the
first living creature they found sleeping with its head pointing
north. They returned with an elephant.

The story is teaching something through its absurdity. The elephant
head was not a punishment or a mistake that got fixed - it is the
point. An elephant's memory is legendary. Its intelligence is real.
Its size means it moves through the world with authority, without
apology, clearing the path not by force but by its very presence.
That is what Ganesha does.

**His vehicle is a mouse**

The contrast is deliberate. Ganesha - enormous, ancient, the first
to be invoked - rides a mouse. The mouse represents the ego: small,
fast, always looking for something to gnaw on, capable of slipping
into places it should not be. The fact that the ego is Ganesha's
vehicle, not his enemy, is the teaching. You do not destroy the ego.
You ride it. You choose where it takes you.

**Why he matters for NRIs specifically**

Ganesha is perhaps the most universally recognised Hindu deity -
you will find him in households across every regional tradition,
every language, every caste. He is the one figure that requires
no explanation within the tradition. For families abroad who are
trying to maintain a thread back to their practice, Ganesha is
often the entry point. A small murti by the door. A pendant.
The invocation at the start of a prayer.

He asks very little of you. He just asks that you begin.`,
    connectToPractice: `Most prayers on Prarthana open with a short invocation to Ganesha
before the main text. Read the first verse slowly - that is the
moment he is being called.`,
    relatedPrayerSlugs: ["ganesh-aarti"],
    relatedPujaIds: [],
    relatedEntryIds: ["shiva", "customs-puja-explained"],
    deityImageSlug: null,
    readingTimeMinutes: 3,
    isFeatured: false,
    tier: "free"
  }),
  createLearnEntry({
    id: "vishnu-and-his-avatars",
    slug: "vishnu-and-his-avatars",
    title: "Vishnu and his avatars",
    subtitle: "The god who keeps returning because the world keeps needing him.",
    category: "deities",
    bodyMd: `In the Hindu cosmology, three forces keep the universe running:
Brahma creates, Vishnu preserves, and Shiva dissolves. Of the three,
Vishnu has the most demanding job. Creation happens once. Dissolution
happens once. But preservation - keeping things balanced, keeping
dharma from collapsing, stepping in when the scales tip too far -
that is constant work.

Vishnu's solution is the avatar system.

An *avatara* means a descent - the divine descending into a specific
form, at a specific time, to do a specific thing. Vishnu has ten
principal avatars, the Dashavatar, each one appearing at a moment
when the cosmic order was under serious threat.

**The avatars as evolutionary history**

There is a remarkable thing about the sequence of Vishnu's avatars:
they mirror the progression of life on Earth. The first avatar is
Matsya - a fish. The second is Kurma - a tortoise. Third is Varaha
- a boar. Then Narasimha - half-man, half-lion. Then Vamana - a
dwarf human. Then the full humans: Parashurama, Rama, Krishna. The
sequence goes from ocean-dwelling to amphibious to land-dwelling to
part-human to fully human - tracking, with astonishing accuracy,
what modern biology would call the emergence of species.

Whether this is coincidence, proto-science, or something else
entirely is a question each person answers for themselves. But it
is worth noticing.

**Rama and Krishna**

The seventh and eighth avatars are the most widely worshipped.
Rama is the ideal king, husband, and son - a figure of perfect
dharma who nevertheless suffers because dharma is not always
comfortable. His story is the Ramayana.

Krishna is everything Rama is not. Playful, mischievous,
philosophically profound, politically shrewd, and completely
comfortable with contradiction. He is the charioteer who stops
a battle to deliver the Bhagavad Gita. He is also the butter
thief who drove his foster mother mad. Both are true. Both matter.

**The tenth avatar**

Kalki, the tenth avatar, has not yet appeared. He will come at
the end of the current age - the Kali Yuga - riding a white horse,
sword in hand, to end this cycle so the next can begin. The
tradition does not present this as catastrophe. It is simply
how things work. The universe breathes in and out. Vishnu keeps
showing up.`,
    connectToPractice: `The Gayatri Mantra is dedicated to the solar divine, which the
tradition associates with Vishnu's radiance. Reading it with
this in mind changes its quality.`,
    relatedPrayerSlugs: ["gayatri-mantra", "vishnu-sahasranama-108", "krishna-aarti"],
    relatedPujaIds: [],
    relatedEntryIds: ["krishna", "the-ramayana", "the-bhagavad-gita"],
    deityImageSlug: null,
    readingTimeMinutes: 5,
    isFeatured: false,
    tier: "free"
  }),
  createLearnEntry({
    id: "shiva",
    slug: "shiva",
    title: "Shiva",
    subtitle: "The one who destroys things - and why that is a relief.",
    category: "deities",
    bodyMd: `Shiva is the most misunderstood deity in the Hindu tradition - and
perhaps the most necessary.

He lives on a mountain, covered in ash, with snakes around his neck,
his hair matted and wild, holding a trident. He is often depicted
simply sitting, eyes half-closed, in a state of profound stillness.
Around him the universe burns and is reborn. He does not move.

This is not indifference. It is the deepest possible engagement
with reality.

**What he destroys**

The word destroyer in English carries entirely negative weight.
In the Sanskrit framework, Shiva's destruction is not loss - it
is completion. When a thing has run its course, when a structure
has become rigid and is blocking new growth, when an age needs
to end so the next can begin - Shiva is the force that clears
the space. He destroys illusion. He destroys what you are
pretending you need. He destroys what has already died but has
not yet been released.

Ask anyone who has gone through a major loss - a relationship,
a career, a version of themselves they had to let go of - and
they will often describe something Shiva-like on the other side
of it. The rubble cleared. The sky visible again.

**The lingam**

In most Shiva temples, the central object of worship is the
Shivalingam - an upright cylindrical form, often resting in a
circular base. The most complete understanding is that the lingam
represents the axis of the universe - the unmanifest,
formless source from which everything emerges. It is Shiva
before he takes a shape. Pure potential. Pure awareness.

**The Nataraja**

The most iconic image of Shiva is the Nataraja - the Lord of
Dance, standing in a ring of fire, one foot on the back of a
dwarf demon, the other raised in movement. He holds a small drum
in one hand and fire in another. His third hand gestures:
do not be afraid.

The dwarf demon beneath his foot is named Apasmara - the demon
of forgetfulness. Shiva dances on our tendency to forget what
we are. The dance itself is the universe. The ring of fire is
the cycle of time. And the whole thing is happening right now,
all the time, whether or not you are paying attention.

**Why he matters**

There is a teaching in the Shaiva tradition that says: everything
you think you are is going to end. Your body. Your reputation.
Your relationships. The particular shape of your life. All of it.
Shiva says: and? The question invites you to find what does
not end. That is the practice.`,
    connectToPractice: `Maha Shivaratri is the one night a year when the tradition says
staying awake in vigil is itself a form of worship. Read the
Shivaratri entry in Festivals to understand what you are
participating in.`,
    relatedPrayerSlugs: ["om-namah-shivaya", "shiva-panchakshara", "maha-mrityunjaya"],
    relatedPujaIds: [],
    relatedEntryIds: ["vishnu-and-his-avatars", "festivals-shivaratri"],
    deityImageSlug: null,
    readingTimeMinutes: 4,
    isFeatured: false,
    tier: "free"
  }),
  createLearnEntry({
    id: "lakshmi",
    slug: "lakshmi",
    title: "Lakshmi",
    subtitle: "She is abundance, not money. The difference matters.",
    category: "deities",
    bodyMd: `Lakshmi is the most popularly worshipped goddess in the Hindu
tradition - and also the most frequently misunderstood.

The misunderstanding is this: people treat her as the goddess of
money. They put her image near the cash register. They pray to
her for promotions, profits, successful investments. She is
depicted standing on a lotus, coins flowing from her hands, and
this is read as a straightforward visual statement.

But the tradition is more precise than this. The Sanskrit word
Lakshmi derives from *laksha* - a target, an aim, a mark. She
is the goddess of the thing you are actually aiming at when
you think you want money. Prosperity in its fullest sense:
a good harvest, a healthy family, a home that functions,
work that means something. The coins flowing from her hands
do not represent wealth accumulation. They represent the
constant outward flow of abundance - she gives, and in giving
she is inexhaustible.

**She does not stay where she is not welcome**

The tradition teaches that Lakshmi is repelled by dirt,
by laziness, by ingratitude, by arrogance, and by the company
of people who take things for granted. She visits clean houses.
She favours the industrious and the grateful. She is associated
with the lotus, which grows in muddy water but remains
untouched by it - pointing at something about maintaining
dignity in difficult conditions.

**Her relationship with Vishnu**

Lakshmi is Vishnu's consort. He preserves the universe; she
is the grace that makes preservation possible. Where Vishnu
descends as an avatar, Lakshmi follows - she is Sita when
he is Rama, Radha when he is Krishna. She is not just his
companion. She is the abundance that his presence generates.

**Diwali**

On Diwali night, the tradition says Lakshmi travels from house
to house. The lights are lit to guide her in - and also to
show her that the household is awake, expecting her, ready to
receive what she brings. The lights are, in this reading,
an act of radical hospitality.`,
    connectToPractice: `On Diwali and on Fridays - Lakshmi's day in the weekly
cycle - a simple lamp lit at dusk with genuine gratitude
is a complete act of worship. No elaborate ritual required.`,
    relatedPrayerSlugs: ["lakshmi-aarti"],
    relatedPujaIds: [],
    relatedEntryIds: ["vishnu-and-his-avatars", "festivals-diwali"],
    deityImageSlug: null,
    readingTimeMinutes: 3,
    isFeatured: false,
    tier: "free"
  }),
  createLearnEntry({
    id: "saraswati",
    slug: "saraswati",
    title: "Saraswati",
    subtitle: "The goddess of learning wants understanding before display.",
    category: "deities",
    bodyMd: `Saraswati is depicted in white - always white - seated on a
swan or a lotus, holding a veena, a book, and a rosary.
She does not wear jewellery. She does not sit on gold.
She is the complete opposite of Lakshmi in appearance, and
the tradition presents this contrast deliberately.

Where Lakshmi is abundance, Saraswati is clarity. The
tradition teaches that the two cannot be chased simultaneously
- if you spend all your energy pursuing Lakshmi, Saraswati
tends to retreat. But if you pursue Saraswati first - true
understanding, genuine skill, real knowledge - Lakshmi often
follows on her own.

**What she governs**

Saraswati is the goddess of speech, learning, music, arts,
wisdom, and the flow of rivers. The river connection is
ancient - the Saraswati was a real river in Vedic-era India,
since disappeared underground, and its loss was a great
cultural wound. To name the goddess after it was to say:
knowledge flows. It nourishes everything it touches.
When it goes underground, civilisations suffer.

**The swan**

Her vehicle, the swan, has a special quality: it can
separate milk from water when the two are mixed. It drinks
only the milk. This is the quality Saraswati represents
in the mind - the ability to distinguish the essential
from the noise, the truth from the distraction, the
meaningful from the merely interesting.

**The Gayatri Mantra**

The Gayatri Mantra is the most sacred verse in the Vedic
tradition. It is a prayer to the solar intelligence - the
divine light that illuminates all thinking - and it asks
for exactly what Saraswati represents: may that light
inspire our minds. It is dedicated to Savitr, but
Saraswati is its presiding spirit. She is the one who
ensures that what the mantra opens reaches somewhere useful.`,
    connectToPractice: `The Gayatri Mantra on Prarthana is dedicated to Saraswati.
Read the meaning of each line before chanting - this is
what she actually wants from you. Understanding before sound.`,
    relatedPrayerSlugs: ["gayatri-mantra", "saraswati-vandana"],
    relatedPujaIds: [],
    relatedEntryIds: ["the-vedas", "customs-why-we-ring-bell"],
    deityImageSlug: null,
    readingTimeMinutes: 3,
    isFeatured: false,
    tier: "free"
  }),
  createLearnEntry({
    id: "durga-kali",
    slug: "durga-kali",
    title: "Durga and Kali",
    subtitle: "The Goddess in forms the tradition never tries to soften.",
    category: "deities",
    bodyMd: `The Goddess has many forms. Two of them have stopped people
short for thousands of years: Durga, who rides a lion and
carries weapons in her many arms, and Kali, who stands on
the chest of Shiva, her tongue extended, a garland of heads
around her neck.

These are not meant to be comfortable images. The tradition
is making an argument with them.

**Durga: the warrior who cannot be defeated**

Mahishasura was a buffalo demon who had received a boon:
he could not be killed by any man or god. He proceeded
to take over the heavens, defeat the gods, and assert that
nothing could stop him. He was right about men. He was
right about gods. He was wrong about one thing.

The gods combined their shakti - their divine energy - and
from that combined force emerged Durga. Beautiful,
terrifying, absolutely purposeful. She fought Mahishasura
for nine days and nine nights. This is Navaratri - the
nine nights. On the tenth day she destroyed him.

The teaching is not about a mythological battle. It is
about the force within reality that refuses to be defeated
by ego - because Mahishasura is ego: the certainty that you
are invulnerable, that the rules do not apply to you, that
you have earned exemption from consequence.

**Kali: the one who stands at the edge**

Kali is harder. She is time itself - the word *kali*
shares its root with *kala*, meaning time. She is what
happens to all things eventually. She is depicted with
dark skin, wild hair, weapons, and those severed heads -
which represent ego's many faces, now separated from
the body that believed them real.

Her tongue is extended for a remarkable reason. In one
story, Kali had defeated a demon so thoroughly that she
began destroying everything around her in the ecstasy
of victory. The gods, frightened, asked Shiva to
intervene. He lay down in her path. She stepped on
his chest - and then, realising what she had done,
stopped in shock. Tongue extended, eyes wide. The
image captures the precise moment when even the force
of cosmic destruction pauses for love.

Together, Durga and Kali are not separate from one
another, and not separate from Bhadra Bhagavathi,
Lakshmi, or Saraswati. Which face is shown depends
on what is needed.`,
    connectToPractice: `The Mahishasura Mardini Stotram describes Durga's
battle in vivid, almost tactile language. Read it
after this entry and the imagery becomes specific
rather than generic.`,
    relatedPrayerSlugs: ["mahishasura-mardini", "durga-chalisa"],
    relatedPujaIds: [],
    relatedEntryIds: ["bhadra-bhagavathi", "festivals-navaratri"],
    deityImageSlug: null,
    readingTimeMinutes: 4,
    isFeatured: false,
    tier: "free"
  }),
  createLearnEntry({
    id: "krishna",
    slug: "krishna",
    title: "Krishna",
    subtitle: "The god who told the whole truth in the middle of battle.",
    category: "deities",
    bodyMd: `Of all the avatars of Vishnu, Krishna is the one who refuses
to be summarised.

He is the divine child who steals butter from the neighbours
and grins when caught. He is the young cowherd playing his
flute at midnight while the gopis abandon everything to
come and listen - a metaphor for the soul abandoning its
small concerns to approach the divine. He is the warrior-prince
who declines to fight but drives the chariot for Arjuna.
He is the philosopher who delivers the most consequential
lecture in Indian literary history while everyone around him
is preparing to kill each other.

He is also, in the tradition's reading, fully God - not
a god who descended but the divine itself, wearing a
particular blue-skinned form for a particular cosmic moment.

**The flute**

There is a reason Krishna is almost always depicted with
a flute and not a weapon. The flute is hollow - it makes
music only when breath passes through it. This is the
teaching: the self that has been emptied of ego becomes
an instrument through which the divine plays.

**Arjuna's collapse**

The Bhagavad Gita begins with Arjuna, the greatest warrior
of his age, collapsing in the middle of the battlefield.
He looks at the two armies arrayed against each other
and realises he knows everyone on the other side. His
teachers. His cousins. His friends. He puts down his bow
and says he cannot do this.

Krishna does not say: be braver. He does not say: you
will be fine. He delivers eighteen chapters of
philosophical teaching - on the nature of the self,
on action without attachment to outcome, on different
paths to the divine, on duty and its relationship to
love. By the end, Arjuna picks up his bow. Not because
he stopped caring, but because he understood something
new about what caring actually means.

**What he asks of you**

The teaching that comes through Krishna most clearly
is this: do your work. Do it without clinging to
the outcome. Offer the action and release the result.
This is not passivity - it is the hardest possible
form of engagement. And it is available in the
middle of ordinary life, not only on battlefields.`,
    connectToPractice: `Janmashtami, Krishna's birthday, is celebrated at
midnight because he was born at midnight. The festival
entry explains what the celebration involves and why
the timing is the point.`,
    relatedPrayerSlugs: ["krishna-aarti", "vishnu-sahasranama-108"],
    relatedPujaIds: [],
    relatedEntryIds: ["vishnu-and-his-avatars", "the-bhagavad-gita", "festivals-janmashtami"],
    deityImageSlug: null,
    readingTimeMinutes: 5,
    isFeatured: false,
    tier: "free"
  }),
  createLearnEntry({
    id: "murugan",
    slug: "murugan",
    title: "Murugan",
    subtitle: "Shiva's son whose vel pierces illusion cleanly.",
    category: "deities",
    bodyMd: `Murugan is one of the two sons of Shiva and Parvati - the
other being Ganesha. Where Ganesha is round, rooted, and
ancient-seeming, Murugan is perpetually young, perpetually
moving, and carries a spear.

He is known by many names: Kartikeya, Skanda, and
Subramanya. In South India - in Tamil Nadu, in Kerala,
in Sri Lanka - he is simply Murugan, and his temples are
among the most beloved in the region.

**The vel**

His weapon is the vel - a divine spear given to him
by his mother Parvati. But the vel is not an ordinary
weapon. In the Shaiva tradition it represents divine
knowledge - the precise, penetrating understanding
that cuts through the layers of illusion to reveal
what is actually real. You cannot fight illusion with
force. You can only illuminate it. The vel does both:
it moves with the speed and accuracy of true insight.

**The peacock**

Murugan's vehicle is the peacock - which, in the
wild, kills and eats snakes. Snakes in the Hindu
tradition often represent the ego, desire, or the
life-force that can either poison or heal depending
on how it is directed. The peacock does not fear
the snake. It dances, shows its magnificent tail,
and then eats it. This is not recklessness - it
is a specific mastery.

**The Tamil tradition**

In Tamil culture, Murugan is not just a deity -
he is an identity. The Sangam poets associated
him with the mountainous landscape, with the
feeling of romantic longing that sharpens into
presence, with the state of being so alert and
alive that even the world's difficulty feels
like a kind of grace.

Thaipusam, his great festival, is marked by
devotees carrying kavadi - elaborate structures
often pierced through the skin - as an act of
devotion and gratitude. What looks extreme to
an outside observer is, for the devotee, an
experience of being so completely present that
the body's normal signals of pain are simply
not the loudest thing in the room.`,
    connectToPractice: `Murugan is particularly beloved in the Kerala
temple tradition. Understanding his symbolism
enriches any visit to a South Indian temple
where his form appears beside the main deity.`,
    relatedPrayerSlugs: [],
    relatedPujaIds: [],
    relatedEntryIds: ["shiva", "kerala-traditions-tantric"],
    deityImageSlug: null,
    readingTimeMinutes: 4,
    isFeatured: false,
    tier: "bhakt"
  }),
  createLearnEntry({
    id: "festivals-navaratri",
    slug: "festivals-navaratri",
    title: "Navaratri",
    subtitle: "Nine nights of the Goddess, each with its own work.",
    category: "festivals",
    bodyMd: `Navaratri means nine nights. It happens four times a year
in the Hindu calendar - once each season - but the most
widely observed is Sharada Navaratri, in autumn, when the
Goddess is worshipped in all her forms across India.

The structure of the nine nights is precise. The first
three nights worship the Goddess in her fierce form -
Durga or Kali - the destroyer of ego and illusion.
The middle three worship her as Lakshmi - the abundant,
the gracious, the one who bestows. The final three
worship her as Saraswati - the illuminated mind, the
one who gives understanding.

This is not arbitrary. The sequence describes a process:
you cannot receive abundance until you have cleared away
what is blocking it. You cannot access wisdom until you
have become a vessel for it.

**In Kerala**

In Kerala, the last three days of Navaratri are
particularly significant. Books, musical instruments,
tools, and the objects of one's profession are arranged
on a special display and blessed. This is the formal
sanctification of one's work.

The tenth day, Vijayadasami, is traditionally when
children begin formal education. Vidyarambham -
the start of learning - happens on this day, with
the child's finger guided by the teacher to write
the first letters in rice or on a palm leaf.

**Why it matters for NRI families**

Navaratri is one of the festivals that NRI families
often find themselves able to observe without a temple
nearby - because the core of it is in the home. A
lamp lit every evening. The Mahishasura Mardini
Stotram read each of the nine days. A small golu.
The festival is portable because the Goddess is not
confined to a single building.`,
    connectToPractice: `The Mahishasura Mardini Stotram is traditionally
read every day of Navaratri. On Prarthana, each
of the nine days is a complete occasion to open
this prayer. Book an Abhishekam for Vijayadasami
as a formal close to the nine nights.`,
    relatedPrayerSlugs: ["mahishasura-mardini"],
    relatedPujaIds: ["abhishekam"],
    relatedEntryIds: ["durga-kali", "bhadra-bhagavathi"],
    deityImageSlug: null,
    readingTimeMinutes: 4,
    isFeatured: false,
    tier: "free"
  }),
  createLearnEntry({
    id: "festivals-vishu",
    slug: "festivals-vishu",
    title: "Vishu",
    subtitle: "The Kerala new year begins with the right first sight.",
    category: "festivals",
    bodyMd: `Vishu falls in mid-April - the solar new year for Kerala,
the moment the sun enters the sign of Aries and the
new astronomical cycle begins.

The night before Vishu, the eldest person in the
household prepares the Vishukkani - the auspicious
sight. This is an arrangement containing a small
image of Vishnu or Krishna, a yellow konna flower,
raw rice, coins, a mirror, a lit lamp, fruits,
vegetables, and new cloth.

In the early morning, before first light, the eldest
wakes first and goes to the vessel. Then they wake
each family member in turn, leading them with eyes
covered to stand before it. The first thing each
person sees on Vishu morning is the Vishukkani.

The logic is beautiful and demanding: what you see
first on the new year's morning is what you set your
whole year's direction by. So you ensure that the
first sight is auspicious - gold, light, the divine,
abundance represented.

For NRI families, the konna flower is what you almost
certainly cannot find abroad. Everything else in the
Vishukkani can be assembled wherever you are. The
intention is the structure. The specific materials
are the vessel for it.

Vishu also involves elders giving money to younger
family members and children. This is not a commercial
gesture. It is the transmission of the year's first
abundance downward through the generations.`,
    connectToPractice: `Book a Vishu-timed Abhishekam at Bhadra Bhagavathi
Temple as the formal beginning of your family's
new year - the equivalent of ensuring the first
sacred act of the year is already arranged.`,
    relatedPrayerSlugs: [],
    relatedPujaIds: ["abhishekam"],
    relatedEntryIds: ["kerala-traditions-tantric"],
    deityImageSlug: null,
    readingTimeMinutes: 3,
    isFeatured: false,
    tier: "free"
  }),
  createLearnEntry({
    id: "festivals-onam",
    slug: "festivals-onam",
    title: "Onam",
    subtitle: "Kerala celebrates the yearly return of a demon king.",
    category: "festivals",
    bodyMd: `Onam is Kerala's biggest festival. It is a harvest
celebration, a homecoming, ten days of flower
arrangements, boat races, feasts, and the
peculiar joy of a people who are very good
at celebrating.

The myth at its centre is extraordinary:
Onam commemorates the return of King
Mahabali - a demon king.

Mahabali was an Asura king who, through
tremendous austerity and good governance,
had become so powerful and so beloved that
he ruled all three worlds. His kingdom was
described as a golden age.

The gods appealed to Vishnu. He took the
form of Vamana - a dwarf Brahmin - and
approached Mahabali during a great yajna.
Vamana asked for three paces of land.
Mahabali agreed. Vamana immediately grew
to cosmic size, covering the whole earth
in one step and all the heavens in another.
For the third step he placed his foot on
Mahabali's head, pushing him down to the
underworld.

But Mahabali asked one boon in return:
once a year, he wanted to return to Kerala
and see his people. Vishnu agreed.
Onam is that return.

Kerala celebrates Mahabali - the defeated
demon - more than it celebrates Vishnu.
It says: he was a good king. Good things end.
The people who lived in his golden age are
still here. Every year we make it gold again
for ten days, to show him that we remember.`,
    connectToPractice: `An Onam puja at Bhadra Bhagavathi Temple places
your family's intention into the festival's
deepest layer - not just the celebration,
but the continuity of presence it represents.`,
    relatedPrayerSlugs: [],
    relatedPujaIds: ["abhishekam"],
    relatedEntryIds: ["vishnu-and-his-avatars"],
    deityImageSlug: null,
    readingTimeMinutes: 4,
    isFeatured: false,
    tier: "free"
  }),
  createLearnEntry({
    id: "festivals-shivaratri",
    slug: "festivals-shivaratri",
    title: "Maha Shivaratri",
    subtitle: "The one night a year when staying awake is the practice.",
    category: "festivals",
    bodyMd: `Maha Shivaratri - the great night of Shiva - falls
in February or March, on the fourteenth night of
the dark fortnight of the month of Phalguna.
It is the darkest night of the month, and the
practice is to stay awake through it.

This is not insomnia as spiritual discipline.
The wakefulness is the point.

Several stories surround the origin of Shivaratri.
In one, it is the night of Shiva and Parvati's
wedding. In another, it is the night when Shiva
drank the poison that emerged from the churning
of the cosmic ocean. In a third, it is simply
the night when his presence is most powerfully
available.

The teaching associated with the vigil is this:
ordinarily we move through waking, dreaming, and
deep sleep without much awareness of the
transitions between them. On Shivaratri, by
staying awake through the night, you become
aware of the moment when you would normally
fall into unconsciousness - and in that
moment of awareness at the edge of sleep, you
touch something the tradition calls Shiva:
pure awareness.

For NRI families, a lamp lit at dusk, kept
burning through the night with periods of
quiet or mantra, is the practice. The scale
is not the measure of sincerity.`,
    connectToPractice: `If you have access to a Shiva temple near you,
the abhishekam performed through the night on
Shivaratri is the most traditional observance.
Book in advance - capacity is almost always limited.`,
    relatedPrayerSlugs: ["om-namah-shivaya", "shiva-panchakshara"],
    relatedPujaIds: ["abhishekam"],
    relatedEntryIds: ["shiva"],
    deityImageSlug: null,
    readingTimeMinutes: 3,
    isFeatured: false,
    tier: "free"
  }),
  createLearnEntry({
    id: "festivals-diwali",
    slug: "festivals-diwali",
    title: "Diwali",
    subtitle: "Five days of light, each keeping a different promise.",
    category: "festivals",
    bodyMd: `Diwali is five days long. Most of the world treats it
as one night - the night of fireworks and lights -
but the full festival is a five-day arc, each day
with its own purpose.

Day 1 is Dhanteras, when Lakshmi is worshipped and
new purchases are traditionally made.

Day 2 is Naraka Chaturdashi, commemorating Krishna's
defeat of the demon Narakasura.

Day 3 is the main night - Lakshmi Puja. Homes are
cleaned thoroughly, lamps are lit from dusk, and she
is formally invited into the household.

Day 4 is Padwa, the new year in the Vikram Samvat
calendar. Day 5 is Bhai Dooj, honouring the bond
between siblings.

When Diwali is observed as one night of fireworks,
what is lost is the arc - the five-day structure
that moves from welcoming abundance, to cleaning
what blocks it, to celebrating it fully, to
renewing the year, to honouring family bonds.`,
    connectToPractice: `A Lakshmi puja booked at Bhadra Bhagavathi
Temple for Dhanteras or the main Diwali night
sends your family's intention into the festival's
deepest current. Even from abroad, the offering travels.`,
    relatedPrayerSlugs: ["lakshmi-aarti", "krishna-aarti"],
    relatedPujaIds: ["abhishekam"],
    relatedEntryIds: ["lakshmi", "vishnu-and-his-avatars", "the-ramayana"],
    deityImageSlug: null,
    readingTimeMinutes: 4,
    isFeatured: false,
    tier: "free"
  }),
  createLearnEntry({
    id: "festivals-janmashtami",
    slug: "festivals-janmashtami",
    title: "Janmashtami",
    subtitle: "Krishna is born at midnight, so you stay awake to meet him.",
    category: "festivals",
    bodyMd: `Janmashtami is the celebration of Krishna's birth - and
the timing is everything.

He was born at midnight. In a prison cell, during
a storm, in darkness so complete that the guards
outside fell asleep under a spell. His father,
Vasudeva, immediately carried him across a
flooded river to the village of Gokul, where he
would be raised safely hidden from the king Kamsa.

The whole story is happening in darkness, in
secrecy, in the middle of the night. This is
intentional. The divine does not always arrive
in daylight, in ceremony, expected and announced.

Janmashtami is observed by fasting through the
day and staying awake until midnight - the
moment of birth. At midnight, the image of
the child Krishna is bathed, dressed in new
clothes, and rocked in a cradle. There is
singing, sweets are distributed, and the fast
is broken.

The act of waiting through the day and the
darkness to welcome him at midnight is the
point. It is practising the same attentiveness
that all of his teaching calls for.`,
    connectToPractice: `On Janmashtami night, opening the Prarthana
prayer library at midnight and reading a
prayer as the fast is broken is a complete
act of devotion - wherever you are.`,
    relatedPrayerSlugs: ["krishna-aarti"],
    relatedPujaIds: [],
    relatedEntryIds: ["krishna", "the-bhagavad-gita"],
    deityImageSlug: null,
    readingTimeMinutes: 3,
    isFeatured: false,
    tier: "bhakt"
  }),
  createLearnEntry({
    id: "festivals-ganesh-chaturthi",
    slug: "festivals-ganesh-chaturthi",
    title: "Ganesh Chaturthi",
    subtitle: "The beloved elephant-headed god returns to water each year.",
    category: "festivals",
    bodyMd: `Ganesh Chaturthi is Ganesha's birthday - celebrated
on the fourth day of the bright fortnight of
the month of Bhadrapada. In Maharashtra it is a
ten-day public festival of extraordinary scale;
in South India it is more often a one-day or
three-day household celebration.

The structure of the festival is this: a clay
murti of Ganesha is installed, worshipped for
one, three, five, seven, or ten days - and
then immersed in a body of water. The murti
dissolves. Ganesha returns to the formless.

The dissolution of the clay murti is not the
ending of the festival - it is the teaching of
the festival. The murti was always clay. You
worshipped Ganesha through it - the form was
a vehicle, not the destination.

Ganesh Chaturthi as a large public festival
was revived in the 1890s by the independence
activist Bal Gangadhar Tilak as a way to
bring Indians together in public during
British colonial rule. The festival as we
know it today has both deep religious roots
and a specific political history.`,
    connectToPractice: `On Ganesh Chaturthi, opening with a prayer
of invocation to Ganesha - even the brief
one at the start of any puja - is the
correct beginning for the day.`,
    relatedPrayerSlugs: ["ganesh-aarti"],
    relatedPujaIds: [],
    relatedEntryIds: ["ganesha"],
    deityImageSlug: null,
    readingTimeMinutes: 3,
    isFeatured: false,
    tier: "free"
  }),
  createLearnEntry({
    id: "customs-puja-explained",
    slug: "customs-puja-explained",
    title: "What is a puja?",
    subtitle: "Not a ritual. A conversation with the divine.",
    category: "customs",
    bodyMd: `The word *puja* comes from the Sanskrit root that
means to revere, to honour, to treat as worthy
of full attention. A puja is, at its simplest,
an act of attention offered to the divine.

The structure of a puja follows a logic that
mirrors how you would receive an honoured guest
into your home. This is not metaphor - it is
the explicit framework. The deity is a guest.
You receive them with full hospitality.

**The sixteen services**

1. *Avahana* - inviting the deity to be present
2. *Asana* - offering a seat
3. *Padya* - water to wash the feet
4. *Arghya* - water to wash the hands
5. *Achamana* - water for sipping
6. *Madhuparka* - honey, curd, and ghee mixed
7. *Snanam* - bathing, the abhishekam
8. *Vastra* - clothing
9. *Yajnopavita* - sacred thread
10. *Gandha* - sandalwood paste
11. *Pushpa* - flowers
12. *Dhupa* - incense
13. *Dipa* - lamp
14. *Naivedya* - food offering
15. *Tambula* - betel leaf
16. *Pradakshina and Namaskar* - circumambulation and bowing

By the end of this, you have clothed, fed, bathed,
welcomed, and honoured your guest. The deity has
been treated as someone who deserves the very
best you have.

The practical effect of conducting a puja with
genuine attention is a kind of reset. You have
been, for the duration, fully present. You have
not been thinking about work or worry or the
thing that happened last week. The deity received
your full hospitality. In a meaningful sense,
so did you.`,
    connectToPractice: `An Abhishekam is the bathing portion of the puja -
step seven of sixteen - extended into a full
ceremony in itself. Booking one is entering
the whole conversation at its most physically
expressive moment.`,
    relatedPrayerSlugs: [],
    relatedPujaIds: ["abhishekam", "sahasranama-archana", "kalasha-puja"],
    relatedEntryIds: ["customs-abhishekam", "customs-why-we-light-lamps", "customs-prasad"],
    deityImageSlug: null,
    readingTimeMinutes: 4,
    isFeatured: true,
    tier: "free"
  }),
  createLearnEntry({
    id: "customs-abhishekam",
    slug: "customs-abhishekam",
    title: "Abhishekam",
    subtitle: "The sacred bath of the deity, and what it washes in you.",
    category: "customs",
    bodyMd: `Abhishekam means a sacred bath. The stone or
metal image of the deity is bathed in a
sequence of substances, each with its own
meaning, while Vedic mantras are chanted.

The typical sequence in a Kerala temple abhishekam:

**Panchamrita** - the five nectars: milk, curd,
ghee, honey, and sugar.

**Rose water** - cooling, fragrant, associated
with the heart.

**Coconut water** - particularly prominent in
Kerala's coastal tradition.

**Sandalwood paste** - cooling, sacred, fragrant.

**Turmeric water** - purifying, protective.

**Tender coconut water and flowers** - the close.

The bathing of the murti is, in the Tantric
understanding, also the bathing of the
devotee's consciousness. You watch these
sacred substances flow over the form of
the deity, and something in you is also
washed. The ritual is not only happening
to the stone.

When you book an abhishekam through Prarthana,
your family's name is spoken aloud by the
Tantri at the moment of the principal offering.
The deity receives it. You are present,
even from twelve thousand miles away, in the
oldest possible sense: your name was said
in a sacred space.`,
    connectToPractice: `The Mahishasura Mardini Stotram is traditionally
recited during abhishekam at Bhagavathi temples.
Learn this prayer before booking the ceremony
and you will understand what the Tantri is singing.`,
    relatedPrayerSlugs: ["mahishasura-mardini"],
    relatedPujaIds: ["abhishekam"],
    relatedEntryIds: ["customs-puja-explained", "customs-prasad"],
    deityImageSlug: null,
    readingTimeMinutes: 3,
    isFeatured: false,
    tier: "free"
  }),
  createLearnEntry({
    id: "the-panchang-explained",
    slug: "the-panchang-explained",
    title: "The panchang",
    subtitle: "Why sacred time moves differently from the calendar on your wall.",
    category: "customs",
    bodyMd: `The word *panchang* comes from *pancha* and *anga*.
The panchang is a five-limbed system of sacred
time - five simultaneous measurements of the
same moment, each telling you something
different about its quality.

**The five limbs**

**1. Tithi** - the lunar day.
**2. Vara** - the weekday.
**3. Nakshatra** - the lunar mansion.
**4. Yoga** - the combined angular distance
of the sun and moon.
**5. Karana** - half a tithi.

One element that appears on Prarthana's
daily panchang is Rahu Kaal - the period
of Rahu each day. Rahu is a shadow planet,
associated with unexpected events and
turbulence. The tradition suggests avoiding
the start of new ventures during this window.

Why any of this matters: the panchang encodes
a kind of attention to time that the modern
world has largely abandoned. Not every moment
is equivalent. Some moments carry a
particular quality - auspiciousness for
beginning, depth for contemplation, difficulty
for action. The panchang does not determine
what happens. It describes the texture of
the moment, the way a weather forecast
describes tomorrow's sky.`,
    connectToPractice: `Prarthana displays the day's tithi and
nakshatra on the homepage every morning.
Opening the app before anything else and
reading the day's panchang - even once -
is the beginning of this kind of attention.`,
    relatedPrayerSlugs: [],
    relatedPujaIds: [],
    relatedEntryIds: ["customs-puja-explained", "bhadra-bhagavathi"],
    deityImageSlug: null,
    readingTimeMinutes: 4,
    isFeatured: false,
    tier: "free"
  }),
  createLearnEntry({
    id: "customs-why-we-light-lamps",
    slug: "customs-why-we-light-lamps",
    title: "Why we light lamps",
    subtitle: "The lamp is the oldest argument against darkness.",
    category: "customs",
    bodyMd: `In almost every Hindu ritual, a lamp is lit first.
Before the puja begins, before the mantras start,
before anything - the lamp.

This is not decoration. The lamp has a specific
role in the theology.

In the Vedic understanding, fire is the
first witness and the first medium. Agni is
the god who stands between the human and the
divine - you offer something to fire, and
fire carries it upward.

A lamp is fire contained. It is the same
principle made household-sized.

The tradition unpacks the lamp this way:
the container is the body. The oil is the
life. The wick is the individual self.
The flame is the divine. The practice of
the spiritual life is to keep the wick
trimmed, the oil replenished, the container clean.

For NRI households, a lamp lit at dusk -
with this verse or in silence - is the
simplest complete act of daily devotion
available. You do not need a temple.
You need oil, a wick, a match, and your
attention for the moment it takes to light it.`,
    connectToPractice: `Every prayer on Prarthana assumes a lamp
has been lit or imagined lit. The tradition
says you begin in light, and the reading
is itself a kind of lamp.`,
    relatedPrayerSlugs: [],
    relatedPujaIds: [],
    relatedEntryIds: ["customs-puja-explained", "bhadra-bhagavathi"],
    deityImageSlug: null,
    readingTimeMinutes: 3,
    isFeatured: false,
    tier: "free"
  }),
  createLearnEntry({
    id: "customs-prasad",
    slug: "customs-prasad",
    title: "Prasad",
    subtitle: "Food the deity receives first changes how you receive it.",
    category: "customs",
    bodyMd: `At the end of a puja, whatever food has been
offered to the deity is returned to the
devotees. This is prasad - the grace of
the deity, returned in material form.

The theological logic is simple and radical.
The food was offered to the divine. The
divine received it, touched it, accepted
it, transformed its quality. What is
returned is no longer ordinary food.
It is food that has been in contact
with the sacred.

Prasad is received in cupped hands, not
grabbed with fingers. It is eaten
immediately, not stored for later.
It is not analysed or critiqued. The
point is not the nutritional content.
The point is the act of receiving.

This is also a teaching about the
relationship between material and
sacred. In the Hindu framework, matter
and spirit are not two different things.
The material world is a manifestation
of the divine, not a corruption of it.`,
    connectToPractice: `When your sacred video arrives from the
temple ceremony, watch it in the way you
receive prasad: fully present, nothing
else competing for attention.`,
    relatedPrayerSlugs: [],
    relatedPujaIds: ["abhishekam"],
    relatedEntryIds: ["customs-puja-explained", "customs-abhishekam"],
    deityImageSlug: null,
    readingTimeMinutes: 2,
    isFeatured: false,
    tier: "free"
  }),
  createLearnEntry({
    id: "customs-pradakshina",
    slug: "customs-pradakshina",
    title: "Pradakshina - why we walk clockwise",
    subtitle: "The circumambulation is cosmology disguised as a walk.",
    category: "customs",
    bodyMd: `In every Hindu temple, worship ends with
pradakshina - walking clockwise around
the sanctum sanctorum. Three times is
standard. Seven for major occasions.

The direction is always clockwise -
keeping the deity on your right side.

The pradakshina is a circumambulation
of the centre. The centre is the divine.
By walking around it, you are saying:
this is my centre. Everything in my
life orbits this.

There is also a traditional explanation:
the universe itself moves clockwise
in its observable pattern. By walking
clockwise you are aligning yourself
with the natural movement of things.

There is a famous story in which Ganesha
and Murugan both want a fruit that their
parents Shiva and Parvati are holding.
Murugan sets off across the cosmos.
Ganesha simply walks three times around
his parents. He wins. His explanation:
my parents are my whole universe.`,
    connectToPractice: `When you watch your sacred video from
the ceremony, notice the pradakshina
that the Tantri or devotees perform
around the sanctum.`,
    relatedPrayerSlugs: [],
    relatedPujaIds: ["abhishekam"],
    relatedEntryIds: ["customs-puja-explained", "ganesha"],
    deityImageSlug: null,
    readingTimeMinutes: 2,
    isFeatured: false,
    tier: "bhakt"
  }),
  createLearnEntry({
    id: "customs-namaste",
    slug: "customs-namaste",
    title: "Namaste",
    subtitle: "The greeting still contains the whole philosophy.",
    category: "customs",
    bodyMd: `Namaste - hands pressed together, slight bow.

The word is composed of *namas* and *te*.
The full phrase is sometimes spoken as
Namo namaste - I bow to you, I bow to you again.

The theology in the gesture is more
specific than a polite bow. The pressing
together of the palms is done at the
level of the heart, not the forehead.
What is being honoured is the divine
within the other person.

The traditional explanation is: the
divine in me recognises and bows to
the divine in you. Not the social role,
not the name, not the personality.

Namaste has become a global byword
for yoga classes and wellness culture.
If you know what it means, the greeting
gets its full weight back every time
you use it.`,
    connectToPractice: `Every prayer on Prarthana begins with
an invocation that is, in essence,
a namaste to the deity.`,
    relatedPrayerSlugs: [],
    relatedPujaIds: [],
    relatedEntryIds: ["customs-puja-explained"],
    deityImageSlug: null,
    readingTimeMinutes: 2,
    isFeatured: false,
    tier: "free"
  }),
  createLearnEntry({
    id: "customs-why-we-ring-bell",
    slug: "customs-why-we-ring-bell",
    title: "Why we ring the bell in a temple",
    subtitle: "The sound is meant to wake your attention, not the deity.",
    category: "customs",
    bodyMd: `The large bell that hangs at the entrance
of every Hindu temple - and the smaller
bells rung during aarti - are not rung
to announce your presence to the deity.

The bell is rung to tell *you* that
you have arrived.

The bell is tuned to produce a tone
that reverberates for several seconds
after it is struck. The tradition
says this sound dissolves thought.
For the duration of the reverberation,
the ordinary mental chatter pauses.
You are, briefly, completely present.

During aarti, small bells are rung
continuously. The same principle applies:
the sound keeps attention from wandering.
You cannot think about something else
clearly while a bell is ringing near you.
That is the point.`,
    connectToPractice: `When you watch the aarti in your
sacred video recording, listen for
the bells before watching the flame.`,
    relatedPrayerSlugs: [],
    relatedPujaIds: ["abhishekam", "sahasranama-archana"],
    relatedEntryIds: ["customs-puja-explained"],
    deityImageSlug: null,
    readingTimeMinutes: 2,
    isFeatured: false,
    tier: "free"
  }),
  createLearnEntry({
    id: "the-vedas",
    slug: "the-vedas",
    title: "The Vedas",
    subtitle: "Four texts that preserve knowledge as something heard.",
    category: "sacred-texts",
    bodyMd: `The Vedas are the oldest texts in continuous use
anywhere in the world. They have been chanted
without interruption for at least 3,500 years,
and possibly much longer, since they were
preserved orally for centuries before
anyone wrote them down.

There are four Vedas: Rigveda, Samaveda,
Yajurveda, and Atharvaveda. Together they
are called *shruti* - that which is heard.
Not composed by humans but received.

The Vedas are not a single genre. They contain
hymns to the elements, ritual instructions,
philosophical speculations that culminate in
the Upanishads, and practical material about
medicine, astronomy, agriculture, and statecraft.

The Upanishads - the final layer of the
Vedic literature, sometimes called Vedanta -
are where the philosophical teaching becomes
explicit. Their central teaching is *Tat tvam asi* -
That thou art. The individual self and the
universal self are not separate things.

The single most important verse in the
Vedic tradition is the Gayatri Mantra -
from the Rigveda, asking that the light
of the divine illuminate the mind.`,
    connectToPractice: `The Gayatri Mantra on Prarthana is a
direct thread from this lineage into your
morning. Read it with that in mind and
it changes how it sounds.`,
    relatedPrayerSlugs: ["gayatri-mantra"],
    relatedPujaIds: [],
    relatedEntryIds: ["saraswati", "the-bhagavad-gita"],
    deityImageSlug: null,
    readingTimeMinutes: 4,
    isFeatured: false,
    tier: "free"
  }),
  createLearnEntry({
    id: "the-bhagavad-gita",
    slug: "the-bhagavad-gita",
    title: "The Bhagavad Gita",
    subtitle: "Philosophy delivered in the pause before battle begins.",
    category: "sacred-texts",
    bodyMd: `The Bhagavad Gita is 700 verses. It is a
section of the Mahabharata - specifically
the dialogue that takes place between
Arjuna and Krishna on the Kurukshetra
battlefield just before the war begins.

Arjuna collapses. He sees his teachers,
cousins, and friends on the opposing
side and refuses to fight. Krishna,
his charioteer, begins to speak.
He does not stop for eighteen chapters.

Krishna teaches several paths:

*Karma Yoga* - the yoga of action.
Do your duty. Act fully. Do not cling to
the results.

*Jnana Yoga* - the yoga of knowledge.
The self that you think you are is
not the ultimate self.

*Bhakti Yoga* - the yoga of devotion.
Love the divine. Offer everything to it.

The verse most people eventually find
their way to says: you have the right
to perform your actions, but you are
not entitled to the fruits of those
actions. Do not let the fruits of your
actions be your motive. And do not be
attached to inaction.

This teaching has accompanied people
through impossible situations for
centuries. It offers something more
durable than reassurance: a
relationship with action that cannot
be taken from you by outcomes.`,
    connectToPractice: `Bhakti Yoga - the path of devotion - is
what Prarthana primarily serves. Reading
a prayer daily is this path in its
simplest form.`,
    relatedPrayerSlugs: [],
    relatedPujaIds: [],
    relatedEntryIds: ["krishna", "the-vedas"],
    deityImageSlug: null,
    readingTimeMinutes: 5,
    isFeatured: true,
    tier: "free"
  }),
  createLearnEntry({
    id: "the-ramayana",
    slug: "the-ramayana",
    title: "The Ramayana",
    subtitle: "A story about integrity and the cost of keeping it.",
    category: "sacred-texts",
    bodyMd: `The Ramayana is one of the two great
epics of Indian literature. It tells
the story of Ram, his wife Sita, his
brother Lakshmana, and the divine
monkey Hanuman.

Rama, crown prince of Ayodhya, is about
to be crowned king when his stepmother
Kaikeyi invokes two long-forgotten boons:
Rama must be exiled for fourteen years,
and her own son Bharata must be crowned
instead.

Rama accepts. He does not argue, does
not fight the injustice, does not use
his power to circumvent the situation.
He goes into the forest with Sita and
Lakshmana.

Sita is then abducted by Ravana - the
ten-headed demon king of Lanka. Rama
builds an army of vanara, led by Hanuman,
and wages war on Lanka. After an immense
battle, Ravana is defeated. Sita is rescued.

The part that has troubled readers for
centuries comes after the rescue: Rama
questions whether Sita remained pure
during her captivity. The tradition does
not resolve this comfortably. It presents
it as the cost of rajadharma - the dharma
of a king.

The figure who emerges from the Ramayana
with the least ambiguity is Hanuman -
not the hero, but the devotee. His
service to Rama is absolute, his love
uncalculating. He is the model of bhakti.`,
    connectToPractice: `The Ramayana is the reason Diwali exists -
the lights celebrate Rama's return to
Ayodhya after fourteen years of exile.`,
    relatedPrayerSlugs: ["hanuman-chalisa"],
    relatedPujaIds: [],
    relatedEntryIds: ["vishnu-and-his-avatars", "festivals-diwali"],
    deityImageSlug: null,
    readingTimeMinutes: 5,
    isFeatured: false,
    tier: "free"
  }),
  createLearnEntry({
    id: "the-puranas",
    slug: "the-puranas",
    title: "The Puranas",
    subtitle: "Where the stories live, and why stories teach best.",
    category: "sacred-texts",
    bodyMd: `The Vedas are the foundation. The epics build
on that foundation. The Puranas are everything else.

There are eighteen principal Puranas - enormous
texts containing cosmology, genealogy, geography,
ritual instructions, philosophy, and - most
importantly - stories.

The stories in the Puranas are where everything
happens. The births, marriages, battles, loves,
jealousies, tricks, devotions, and transformations
of the gods. They are teaching vehicles:
complex, contradictory, sometimes disturbing,
and very precise about what they are teaching
if you know how to read them.

The Bhagavata Purana is the most beloved of the
Puranas, especially its tenth book, which tells
the complete story of Krishna's life from birth
to death.

For devotees of the Goddess, the Devi Bhagavata
is the central text. It narrates the Goddess's
forms, battles, and grace in exhaustive detail.

The tradition prefers stories over propositions
because a story gets under your defences.
You care about what happens to Arjuna before
you realise you are learning philosophy.
You feel Hanuman's devotion before you can
define devotion.`,
    connectToPractice: `Every deity on Prarthana has a Puranic story
behind them. The Learn section entries on
each deity are, in miniature, that tradition
of teaching through story.`,
    relatedPrayerSlugs: ["mahishasura-mardini", "krishna-aarti"],
    relatedPujaIds: [],
    relatedEntryIds: ["the-vedas", "vishnu-and-his-avatars", "shiva"],
    deityImageSlug: null,
    readingTimeMinutes: 3,
    isFeatured: false,
    tier: "bhakt"
  }),
  createLearnEntry({
    id: "kerala-traditions-tantric",
    slug: "kerala-traditions-tantric",
    title: "Tantric temple worship in Kerala",
    subtitle: "Why Kerala temples feel different, and why that is deliberate.",
    category: "kerala-traditions",
    bodyMd: `If you have visited temples in North India
and then walked into a Kerala temple, the
difference is immediate and difficult to name.
The light is different. The sound is different.
The atmosphere is more enclosed, more interior,
somehow more concentrated.

The difference is Tantric.

Tantra is a system - not a practice, not a
philosophy, but a complete framework for
understanding and relating to reality.
In the Kerala temple tradition, Tantra governs
everything: the architecture of the temple,
the design of the murti, the specific
sequence of rituals, and the training of
the priests.

A Tantric Kerala temple is designed as a
human body. The sanctum corresponds to the
head, specifically to the point of highest
concentration. The corridors and outer
areas are the body. Entering the temple
is moving inward, from the periphery to
the centre, from the scattered to the
concentrated.

When your family's name is spoken during the
ceremony, it is spoken at a specific moment
in a specific sequence that the Tantric system
identifies as the moment of maximum receptivity.`,
    connectToPractice: `Understanding the Tantric framework changes
how you watch the sacred video from your puja.
What looks like a sequence of actions is a
precisely structured conversation with the
divine in its specific local form.`,
    relatedPrayerSlugs: ["mahishasura-mardini"],
    relatedPujaIds: ["abhishekam"],
    relatedEntryIds: ["bhadra-bhagavathi", "kerala-traditions-tantri", "customs-puja-explained"],
    deityImageSlug: null,
    readingTimeMinutes: 4,
    isFeatured: false,
    tier: "bhakt"
  }),
  createLearnEntry({
    id: "kerala-traditions-tantri",
    slug: "kerala-traditions-tantri",
    title: "The Tantri",
    subtitle: "The hereditary priest shaped by one lineage and one place.",
    category: "kerala-traditions",
    bodyMd: `In Kerala's temple tradition, the most
senior priest is called the Tantri - not
a generic title for a priest, but a
specific designation that comes with
a specific lineage.

The Tantri of a particular temple comes
from a specific family that has served
that temple for generations - sometimes
centuries. The knowledge of how to conduct
that temple's rituals passes through direct
transmission.

The Tantri's knowledge is not textual in
the primary sense. He knows the texts, but
what cannot be transmitted through texts
is the quality of presence that decades of
practice produce. The specific intonation
of a mantra. The precise moment in the
ritual when the energy is at its peak.

Every Kerala temple deity has a distinct
character. The Tantri who has served that
deity for decades knows that character the
way a family member knows another family
member.

When Prarthana describes offerings as
performed by a licensed Tantri, this is
not a credential the way a professional
certification is. It is a transmission.`,
    connectToPractice: `The "Licensed Tantri" trust signal on each
puja offering refers to this lineage. When
you book an Abhishekam, you are not hiring
a service. You are entering a relationship
with a lineage.`,
    relatedPrayerSlugs: [],
    relatedPujaIds: ["abhishekam", "sahasranama-archana", "kalasha-puja"],
    relatedEntryIds: ["kerala-traditions-tantric", "bhadra-bhagavathi", "customs-puja-explained"],
    deityImageSlug: null,
    readingTimeMinutes: 3,
    isFeatured: false,
    tier: "free"
  }),
  createLearnEntry({
    id: "kerala-traditions-theyyam",
    slug: "kerala-traditions-theyyam",
    title: "Theyyam",
    subtitle: "In North Kerala, the gods do not stay in temples.",
    category: "kerala-traditions",
    bodyMd: `Theyyam is one of the most extraordinary
ritual traditions in the world - and almost
nobody outside Kerala knows it exists.

In the Malabar region of northern Kerala,
during the months of November through May,
performers undergo a transformation that
the tradition does not describe as
performance. Dressed in elaborate
costumes - some of them eight feet tall,
with towering headdresses of fire - these
men become the deity they embody.

This is not metaphor. The belief is
literal: for the duration of the ritual,
the performer is not representing the god.
He is the god. People come to ask for
blessings, to confess difficulties, to
receive healing. The god speaks through
this person's mouth.

Theyyam also temporarily inverts the
social hierarchy. For the duration
of the ritual, the highest-caste members
of the village prostrate before the
performer - before the god walking
in that body.`,
    connectToPractice: `If you are visiting Kerala, theyyam
season is when to go. Being there in
person is the only way to understand it.`,
    relatedPrayerSlugs: [],
    relatedPujaIds: [],
    relatedEntryIds: ["bhadra-bhagavathi", "kerala-traditions-tantric"],
    deityImageSlug: null,
    readingTimeMinutes: 4,
    isFeatured: false,
    tier: "bhakt"
  }),
  createLearnEntry({
    id: "kerala-traditions-sadya",
    slug: "kerala-traditions-sadya",
    title: "The Sadya - the sacred meal",
    subtitle: "A feast whose order teaches as much as its taste.",
    category: "kerala-traditions",
    bodyMd: `The Kerala Sadya is a full vegetarian
meal served on a fresh banana leaf,
eaten while seated on the floor.
At its complete form it has around
26 distinct items. At its everyday
form it is simpler, but still structured.

The placement of each item on the leaf
is specified. The order of eating is
specified. The meaning of each item is
specified. This is not a meal that
happened to become traditional - it is
a meal that was designed.

The banana leaf is placed with the
narrower end to the left. Rice is
placed in the centre. To the left:
the sweet items. To the right: the
complex savoury items. The meal moves
from sweet to savoury to the final
rasam and buttermilk.

The sadya is structured according to
Ayurvedic principles about digestion.
Sweet items are easier to digest and
prepare the system. The heavier
savouries follow. The final rasam and
buttermilk are digestive agents.

After the meal, the leaf is folded:
toward you if it was a joyful occasion.
Away from you if it was a funeral feast.`,
    connectToPractice: `On Onam, wherever you are, making even
a partial sadya - rice, sambar, one or
two curries, payasam - on a banana leaf
is the meal in its essential form.`,
    relatedPrayerSlugs: [],
    relatedPujaIds: [],
    relatedEntryIds: ["customs-prasad", "festivals-onam"],
    deityImageSlug: null,
    readingTimeMinutes: 3,
    isFeatured: false,
    tier: "free"
  }),
];
