import { db } from "@/db";
import { emails } from "@/db/schema";

interface SeedEmail {
  id: string;
  subject: string;
  sender: string;
  recipients: string;
  sentAt: Date;
  bodyText: string;
}

const SEED_EMAILS: SeedEmail[] = [
  {
    id: "em-001",
    subject: "Wire Transfer Confirmation - Cayman Account",
    sender: "Gerald Whitmore <gwhitmore@pminvest.com>",
    recipients: "office@jefinc.com",
    sentAt: new Date("2005-03-14T09:22:00Z"),
    bodyText:
      "Per our discussion, the wire transfer of $2.3M has been " +
      "initiated to the Grand Cayman account ending in 4471. " +
      "Routing through the Zurich intermediary as agreed. " +
      "Expected settlement by Friday COB.\n\n" +
      "Please confirm receipt with the reference number once " +
      "funds clear. The quarterly statement will reflect this " +
      "under the usual charitable allocation line.",
  },
  {
    id: "em-002",
    subject: "Re: Guest List - Palm Beach Dinner March 22",
    sender: "Adriana Voss <avoss@socialplanning.net>",
    recipients: "residence@palmbeachoffice.com",
    sentAt: new Date("2005-03-10T14:05:00Z"),
    bodyText:
      "Updated guest list attached. Senator Hargrove confirmed " +
      "plus one. The ambassador from the UK consulate will " +
      "attend but requests a vegetarian option.\n\n" +
      "Seating chart needs revision — we cannot place the " +
      "Rothstein group next to the Davos contingent after last " +
      "month's disagreement. I suggest the terrace overflow " +
      "arrangement.\n\n" +
      "Florist confirmed white orchid centerpieces. String " +
      "quartet arrives at 6pm for sound check.",
  },
  {
    id: "em-003",
    subject: "Flight Manifest - N908JE - March 18",
    sender: "Larry Visconti <lvisconti@aviationmgmt.com>",
    recipients: "scheduling@jefinc.com",
    sentAt: new Date("2005-03-16T11:30:00Z"),
    bodyText:
      "Flight manifest for N908JE departure March 18:\n\n" +
      "Route: KTEB (Teterboro) -> MYEH (Eleuthera)\n" +
      "Departure: 0800 EST\n" +
      "Passengers: 6 confirmed, 2 TBD\n\n" +
      "Catering order placed with Sky Gourmet. Ground " +
      "transportation arranged at destination. Return flight " +
      "scheduled March 21 pending weather.\n\n" +
      "Fuel stop at Nassau if headwinds exceed 30kt.",
  },
  {
    id: "em-004",
    subject: "Legal Memo: Trust Restructuring Options",
    sender: "Patricia Kellner <pkellner@kellnerlawgroup.com>",
    recipients: "office@jefinc.com",
    sentAt: new Date("2004-11-02T16:45:00Z"),
    bodyText:
      "RE: Restructuring of the 1998 Irrevocable Trust\n\n" +
      "After reviewing the current structure, I recommend " +
      "converting the Bermuda-domiciled entity to a " +
      "purpose trust under the Virgin Islands Special " +
      "Trusts Act. This provides:\n\n" +
      "1. Enhanced asset protection from future claims\n" +
      "2. Simplified beneficiary designation\n" +
      "3. Reduced annual reporting requirements\n\n" +
      "The conversion can be executed within 60 days. " +
      "Filing fees approximately $45,000. I recommend we " +
      "proceed before the December regulatory changes.",
  },
  {
    id: "em-005",
    subject: "Foundation Grant Application - MIT Media Lab",
    sender: "Dr. Rachel Susskind <rsusskind@mitresearch.edu>",
    recipients: "grants@villafoundation.org",
    sentAt: new Date("2003-06-20T10:15:00Z"),
    bodyText:
      "Dear Grants Committee,\n\n" +
      "We are pleased to submit our proposal for a $1.5M " +
      "research grant to support the Synthetic Neurobiology " +
      "Group at MIT Media Lab.\n\n" +
      "The proposed research will explore neural interface " +
      "technologies with applications in prosthetics and " +
      "cognitive enhancement. Our team of 12 researchers " +
      "has published 47 peer-reviewed papers in this domain.\n\n" +
      "Timeline: 3-year funding cycle beginning Q1 2004. " +
      "Quarterly progress reports will be submitted to " +
      "the foundation board.",
  },
  {
    id: "em-006",
    subject: "Property Assessment - Zorro Ranch",
    sender: "Thomas Buchanan <tbuchanan@nmrealtygroup.com>",
    recipients: "property@jefinc.com",
    sentAt: new Date("2006-08-12T08:00:00Z"),
    bodyText:
      "Annual property assessment for the Stanley NM ranch " +
      "property (Zorro Ranch):\n\n" +
      "Total acreage: 7,579\n" +
      "Structures: Main residence, guest house, caretaker " +
      "cottage, barn complex, airstrip hangar\n" +
      "Assessed value: $18.2M (up 12% from 2005)\n\n" +
      "Recommended maintenance: Roof replacement on guest " +
      "house ($340K estimate), perimeter fencing repair " +
      "along south boundary, irrigation system upgrade " +
      "for the equestrian area.\n\n" +
      "Water rights remain current through 2012.",
  },
  {
    id: "em-007",
    subject: "Re: Art Acquisition - Christie's Lot 47",
    sender: "Margaux Delacroix <mdelacroix@artadvisory.ch>",
    recipients: "personal@jefinc.com",
    sentAt: new Date("2007-04-03T13:20:00Z"),
    bodyText:
      "We secured Lot 47 (Basquiat, Untitled 1982) at " +
      "hammer price $4.1M plus buyer's premium. Total " +
      "acquisition cost: $4.92M.\n\n" +
      "Shipping and insurance arranged through Cadogan Tate. " +
      "The piece will be held in the Geneva freeport until " +
      "you confirm final placement — NYC townhouse or " +
      "Palm Beach residence.\n\n" +
      "Provenance documentation is clean. I'll send the " +
      "full condition report by end of week.",
  },
  {
    id: "em-008",
    subject: "Schedule Update - Paris Trip July 8-12",
    sender: "Isabelle Moreau <imoreau@travelconcierge.fr>",
    recipients: "scheduling@jefinc.com",
    sentAt: new Date("2008-06-25T09:40:00Z"),
    bodyText:
      "Confirmed itinerary for Paris, July 8-12:\n\n" +
      "July 8: Arrive CDG 0700, car to Hotel Plaza Athenee. " +
      "Lunch with M. Bertrand at Le Cinq (1300).\n" +
      "July 9: Morning meeting at Credit Lyonnais, afternoon " +
      "free. Dinner reservation at L'Ambroisie (2030).\n" +
      "July 10: Day trip to Versailles, private tour arranged " +
      "through the Ministry of Culture contact.\n" +
      "July 11: Shopping, afternoon tea at Ritz. Evening " +
      "event at the American Ambassador's residence.\n" +
      "July 12: Depart CDG 1400 to KTEB.\n\n" +
      "Security detail confirmed for all external movements.",
  },
  {
    id: "em-009",
    subject: "Helicopter Maintenance - Sikorsky S-76B",
    sender: "Captain James Redford <jredford@execaviation.com>",
    recipients: "aviation@jefinc.com",
    sentAt: new Date("2004-09-08T07:30:00Z"),
    bodyText:
      "The S-76B (tail N-HE01) requires its 600-hour " +
      "inspection. Current Hobbs time: 587.4 hours.\n\n" +
      "Estimated downtime: 10 business days. Recommend " +
      "scheduling for the first week of October when " +
      "travel calendar shows minimal commitments.\n\n" +
      "Also noting the left engine TBO is approaching " +
      "at 3,500 hours (currently 3,220). Budget " +
      "approximately $180K for overhaul when due.\n\n" +
      "Replacement aircraft available through NetJets " +
      "if needed during maintenance window.",
  },
  {
    id: "em-010",
    subject: "Confidential: Settlement Terms - Doe v. Corp",
    sender: "Alan Dershberg <adershberg@lawfirm.com>",
    recipients: "legal@jefinc.com",
    sentAt: new Date("2009-02-14T17:00:00Z"),
    bodyText:
      "PRIVILEGED AND CONFIDENTIAL\n\n" +
      "Proposed settlement terms for the referenced matter:\n\n" +
      "1. Payment of $850,000 to claimant\n" +
      "2. Mutual NDA with liquidated damages of $500K\n" +
      "3. No admission of liability\n" +
      "4. Sealed court records\n" +
      "5. Claimant withdraws all public statements\n\n" +
      "Opposing counsel has indicated willingness to accept " +
      "these terms. Recommend executing before the March " +
      "deposition deadline to avoid discovery exposure.\n\n" +
      "Please advise on authorization to proceed.",
  },
  {
    id: "em-011",
    subject: "Annual Charity Gala - Table Assignments",
    sender: "Christina Volkov <cvolkov@eventplanners.nyc>",
    recipients: "social@jefinc.com",
    sentAt: new Date("2006-11-30T12:10:00Z"),
    bodyText:
      "Final table assignments for the December 15 gala:\n\n" +
      "Table 1 (Host): Reserved for principal + 9 guests\n" +
      "Table 2: Tech sector — includes the Thiel group and " +
      "two Stanford professors\n" +
      "Table 3: Finance — Goldman delegation plus the " +
      "Deutsche Bank contingent\n" +
      "Table 4: Media & Entertainment — includes the " +
      "magazine editors and that documentary filmmaker\n\n" +
      "Total confirmed: 187 guests. Valet capacity: 80 " +
      "vehicles. Overflow parking at the garage on 71st.\n\n" +
      "Live auction items finalized: Aspen ski week, " +
      "private island rental, courtside Knicks season.",
  },
  {
    id: "em-012",
    subject: "Staffing Update - 71st Street Residence",
    sender: "Helena Marchand <hmarchand@domesticstaff.com>",
    recipients: "household@jefinc.com",
    sentAt: new Date("2003-09-15T08:45:00Z"),
    bodyText:
      "Monthly staffing report for the NYC residence:\n\n" +
      "Current staff: 14 full-time, 6 on-call\n" +
      "New hire: Maria Santos, assistant housekeeper, " +
      "starting October 1. Background check cleared.\n\n" +
      "Resignation: Head chef Philippe is leaving end of " +
      "month. I have three candidates for replacement — " +
      "all with experience in private service for UHNW " +
      "households. Interviews scheduled next week.\n\n" +
      "Seasonal note: winter wardrobe rotation for guest " +
      "rooms to begin October 15. Linen order placed " +
      "with Frette for 24 sets.",
  },
  {
    id: "em-013",
    subject: "Re: Hedge Fund Performance - Q3 2007",
    sender: "Victor Stanton <vstanton@quantcapital.com>",
    recipients: "investments@jefinc.com",
    sentAt: new Date("2007-10-05T15:30:00Z"),
    bodyText:
      "Q3 2007 performance summary for the managed accounts:\n\n" +
      "Fund Alpha: +8.2% (benchmark: +5.1%)\n" +
      "Macro Opportunities: +3.7% (benchmark: +2.9%)\n" +
      "Credit Arb: -1.2% (benchmark: -0.8%)\n\n" +
      "Net AUM across all strategies: $412M\n\n" +
      "Outlook: We're reducing mortgage exposure given " +
      "subprime deterioration. Rotating into energy and " +
      "commodity plays. The credit arb book is being " +
      "unwound — counterparty risk too elevated.\n\n" +
      "Recommend scheduling a call to discuss the 2008 " +
      "allocation strategy before year-end rebalancing.",
  },
  {
    id: "em-014",
    subject: "Massage Therapist Scheduling - Week of April 7",
    sender: "Natasha Reid <nreid@wellnesscoord.com>",
    recipients: "personal@jefinc.com",
    sentAt: new Date("2008-04-03T10:00:00Z"),
    bodyText:
      "Confirmed appointments for next week:\n\n" +
      "Monday 4/7: Deep tissue, 90 min, 3pm\n" +
      "Wednesday 4/9: Swedish, 60 min, 10am\n" +
      "Friday 4/11: Sports recovery, 90 min, 2pm\n\n" +
      "All sessions at the residence. Therapist parking " +
      "validated at the garage. Please ensure the treatment " +
      "room is set to 72F with fresh linens.\n\n" +
      "Also following up on the referral request for a " +
      "Pilates instructor — I have two candidates with " +
      "private client experience.",
  },
  {
    id: "em-015",
    subject: "Island Property - Utilities and Maintenance",
    sender: "Robert Chamberlain <rchamber@caribproperty.vi>",
    recipients: "property@jefinc.com",
    sentAt: new Date("2010-01-20T11:15:00Z"),
    bodyText:
      "Monthly report for the USVI property:\n\n" +
      "Diesel generator: Running at 78% capacity. " +
      "Recommend adding a second unit before hurricane " +
      "season. Quote from Cat dealer: $95K installed.\n\n" +
      "Water desalination: Producing 3,000 gal/day. " +
      "Membrane replacement due in March ($12K).\n\n" +
      "Dock repairs completed — new pilings and decking " +
      "rated for Cat 4 conditions. Total cost: $267K.\n\n" +
      "Landscaping crew (6 FTE) maintaining grounds on " +
      "regular schedule. The new palm plantings along " +
      "the north beach are establishing well.\n\n" +
      "Next major project: Solar panel array for the " +
      "guest cottages. Preliminary design attached.",
  },
  {
    id: "em-016",
    subject: "FW: Research Paper Draft - Evolutionary Dynamics",
    sender: "Dr. Martin Nowak <mnowak@harvard.edu>",
    recipients: "science@jefinc.com",
    sentAt: new Date("2004-05-18T14:30:00Z"),
    bodyText:
      "Attached is the latest draft of our paper on " +
      "evolutionary dynamics of cooperation. The model " +
      "demonstrates that spatial structure fundamentally " +
      "changes the conditions for cooperation to evolve.\n\n" +
      "Key finding: In structured populations, cooperators " +
      "can survive and even dominate when the benefit-to-cost " +
      "ratio exceeds the average number of neighbors.\n\n" +
      "We'd welcome your thoughts before submission to " +
      "Nature. The foundation's support is acknowledged " +
      "in the funding section.\n\n" +
      "Publication timeline: Submit June, expect reviews " +
      "by September, target publication early 2005.",
  },
  {
    id: "em-017",
    subject: "Security Assessment - All Properties",
    sender: "Michael Brock <mbrock@privatesecurity.com>",
    recipients: "security@jefinc.com",
    sentAt: new Date("2011-03-22T09:00:00Z"),
    bodyText:
      "Annual security review findings:\n\n" +
      "NYC (71st St): Camera system upgraded to HD. " +
      "Recommend adding license plate readers at garage " +
      "entrance. Staff background re-checks current.\n\n" +
      "Palm Beach: Perimeter sensors functioning. Two " +
      "false alarms in Q1 from wildlife. Gate access " +
      "logs show 340 entries this quarter.\n\n" +
      "NM Ranch: Remote monitoring operational. Airstrip " +
      "motion detection needs calibration — too many " +
      "false triggers from coyotes.\n\n" +
      "Island: Marine approach radar installed. " +
      "Underwater camera at dock is corroded — " +
      "replacement ordered ($18K).\n\n" +
      "Overall risk level: MODERATE. No incidents " +
      "reported across properties this quarter.",
  },
  {
    id: "em-018",
    subject: "Bill Clinton Office - Speaking Engagement Follow-up",
    sender: "Douglas Travers <dtravers@publicaffairs.com>",
    recipients: "office@jefinc.com",
    sentAt: new Date("2003-07-14T16:20:00Z"),
    bodyText:
      "Following up on the conversation regarding the " +
      "former President's participation in the education " +
      "initiative event in September.\n\n" +
      "His office has confirmed availability for " +
      "September 18-19. They request:\n" +
      "- Private aviation (arranged)\n" +
      "- Suite at the Four Seasons\n" +
      "- Security coordination with Secret Service detail\n" +
      "- No press during private portions of the event\n\n" +
      "Speaking fee has been waived as a personal favor. " +
      "The foundation will cover travel expenses as an " +
      "in-kind contribution.\n\n" +
      "Draft agenda to follow by end of week.",
  },
  {
    id: "em-019",
    subject: "Automotive Fleet - Insurance Renewal",
    sender: "Sandra Chen <schen@premiuminsurance.com>",
    recipients: "admin@jefinc.com",
    sentAt: new Date("2006-01-08T10:30:00Z"),
    bodyText:
      "Annual insurance renewal for the vehicle fleet:\n\n" +
      "1. 2005 Bentley Continental GT — $8,200/yr\n" +
      "2. 2004 Range Rover (NYC) — $4,100/yr\n" +
      "3. 2006 Mercedes S600 — $6,800/yr\n" +
      "4. 2003 Chevy Suburban (NM) — $2,900/yr\n" +
      "5. 2005 Cadillac Escalade (PB) — $3,400/yr\n\n" +
      "Total premium: $25,400/yr (3% increase)\n\n" +
      "No claims filed in 2005. Clean driving records " +
      "for all authorized drivers. Umbrella policy " +
      "($10M) remains in force through separate carrier.\n\n" +
      "Please sign and return the attached forms by Jan 31.",
  },
  {
    id: "em-020",
    subject: "Re: Modeling Agency Introduction",
    sender: "Jean-Luc Marchand <jlm@elitetalent.fr>",
    recipients: "personal@jefinc.com",
    sentAt: new Date("2005-07-22T18:45:00Z"),
    bodyText:
      "As discussed, I'm sending portfolios for four models " +
      "available for the charity calendar project:\n\n" +
      "1. Katarina M. — 22, Prague, editorial experience\n" +
      "2. Svetlana K. — 20, Moscow, Vogue Italia\n" +
      "3. Ana B. — 21, Sao Paulo, runway specialist\n" +
      "4. Mei L. — 23, Shanghai, commercial + editorial\n\n" +
      "All are available for the August shoot dates in " +
      "the Caribbean. Standard day rates apply. Agency " +
      "handles travel and accommodations.\n\n" +
      "Let me know which portfolios interest you and " +
      "I'll arrange introductions.",
  },
  {
    id: "em-021",
    subject: "Tax Strategy Memo - 2006 Planning",
    sender: "Richard Kahn <rkahn@kahnaccounting.com>",
    recipients: "finance@jefinc.com",
    sentAt: new Date("2005-12-01T13:00:00Z"),
    bodyText:
      "Year-end tax planning recommendations:\n\n" +
      "1. Accelerate charitable contributions to offset " +
      "capital gains from the Goldman position liquidation " +
      "($12M in realized gains)\n\n" +
      "2. The GRAT distributions should be timed before " +
      "Dec 31 to qualify for the current exemption amount\n\n" +
      "3. Foreign account reporting: FBAR filings current " +
      "for all disclosed accounts. New reporting threshold " +
      "for 2006 under review.\n\n" +
      "4. The private foundation's minimum distribution " +
      "requirement is $3.2M for 2005. Currently $2.8M " +
      "distributed — need $400K in grants before year-end.\n\n" +
      "Please schedule a call this week to finalize.",
  },
  {
    id: "em-022",
    subject: "Private Chef Menu - Week of Feb 12",
    sender: "Chef Antoine Beaumont <abeaumont@privatechef.com>",
    recipients: "household@jefinc.com",
    sentAt: new Date("2007-02-09T09:00:00Z"),
    bodyText:
      "Proposed menus for next week:\n\n" +
      "Monday: Pan-seared Dover sole, pommes puree, " +
      "haricots verts. Dessert: creme brulee.\n" +
      "Tuesday: Wagyu beef tenderloin, truffle risotto, " +
      "roasted root vegetables.\n" +
      "Wednesday: Lobster thermidor, Caesar salad, " +
      "garlic bread. Light dessert: fruit sorbet.\n" +
      "Thursday: Dinner party (12 guests) — prix fixe " +
      "menu attached separately.\n" +
      "Friday: Sushi preparation — fish delivery " +
      "confirmed from Tsukiji supplier.\n\n" +
      "Grocery budget this week: approximately $4,200. " +
      "Wine pairings selected from the cellar inventory.",
  },
  {
    id: "em-023",
    subject: "Re: Documentary Footage Request - Denied",
    sender: "Karen Walsh <kwalsh@mediarelations.com>",
    recipients: "press@jefinc.com",
    sentAt: new Date("2009-05-30T14:50:00Z"),
    bodyText:
      "The documentary production company (Turning Point " +
      "Films) has been informed that their request for " +
      "an interview and B-roll footage is denied.\n\n" +
      "They were told that no comment will be provided " +
      "and any use of unlicensed photographs will be " +
      "met with legal action.\n\n" +
      "I've also flagged their production with our media " +
      "monitoring service. If they proceed with the film, " +
      "we'll be notified of any public screenings or " +
      "distribution deals.\n\n" +
      "Separately, the Vanity Fair piece is confirmed as " +
      "killed. The editor agreed after the conversation " +
      "with the publisher.",
  },
  {
    id: "em-024",
    subject: "Philanthropic Advisory Board - Q2 Meeting",
    sender: "Dr. Emily Harwood <eharwood@philanthropy.org>",
    recipients: "foundation@jefinc.com",
    sentAt: new Date("2006-04-10T11:00:00Z"),
    bodyText:
      "Agenda for the Q2 Advisory Board meeting, April 22:\n\n" +
      "1. Review of Q1 grant disbursements ($4.7M total)\n" +
      "2. New grant proposals:\n" +
      "   a. Harvard Program for Evolutionary Dynamics ($2M)\n" +
      "   b. Santa Fe Institute complexity research ($800K)\n" +
      "   c. NYC public schools music program ($350K)\n" +
      "3. Foundation investment performance review\n" +
      "4. Annual audit preparation timeline\n" +
      "5. Board member nominations\n\n" +
      "Meeting at the 71st Street residence, 10am-1pm. " +
      "Lunch will be served. Please RSVP by April 18.",
  },
  {
    id: "em-025",
    subject: "Passport Renewal + Visa Applications",
    sender: "Angela Torres <atorres@travelservices.com>",
    recipients: "personal@jefinc.com",
    sentAt: new Date("2004-08-05T16:00:00Z"),
    bodyText:
      "Current passport expires November 2004. Renewal " +
      "application submitted via expedited processing — " +
      "new passport expected within 2 weeks.\n\n" +
      "Visa applications in progress:\n" +
      "- UAE (Dubai): Business visa, 90-day multi-entry\n" +
      "- Japan: Tourist visa, valid 5 years\n" +
      "- Russia: Invitation letter received from the " +
      "  Moscow business contact. Visa processing 10 days.\n\n" +
      "Note: The French and UK entries do not require " +
      "separate visas for US passport holders.\n\n" +
      "All applications require your signature — courier " +
      "arriving tomorrow between 10am-12pm.",
  },
  {
    id: "em-026",
    subject: "Wine Cellar Inventory Update",
    sender: "Philippe Renard <prenard@winecollector.com>",
    recipients: "household@jefinc.com",
    sentAt: new Date("2007-09-12T10:45:00Z"),
    bodyText:
      "Updated cellar inventory for the NYC residence:\n\n" +
      "Total bottles: 2,847\n" +
      "Notable additions this quarter:\n" +
      "- 2000 Petrus (6 bottles) — $18,000\n" +
      "- 1996 Romanee-Conti (3 bottles) — $27,000\n" +
      "- 2003 Opus One (12 bottles) — $3,600\n" +
      "- 1990 Krug Collection (6 bottles) — $4,800\n\n" +
      "Cellar climate: Holding at 55F / 70% humidity. " +
      "The backup cooling unit was serviced last week.\n\n" +
      "Recommendation: The 1996 Bordeaux futures are " +
      "arriving next month. We need to clear space — " +
      "suggest moving the California collection to " +
      "Palm Beach storage.",
  },
  {
    id: "em-027",
    subject: "Re: Computer Science Program Donation",
    sender: "Dean Margaret Liu <mliu@nyu.edu>",
    recipients: "foundation@jefinc.com",
    sentAt: new Date("2005-10-28T09:20:00Z"),
    bodyText:
      "Thank you for the generous commitment of $2.5M " +
      "to the NYU Computer Science department. This will " +
      "fund:\n\n" +
      "- 5 graduate fellowships (3 years each)\n" +
      "- Equipment for the new AI research lab\n" +
      "- Annual lecture series on technology and society\n\n" +
      "The naming rights for the research lab are included " +
      "per our agreement. A dedication ceremony is planned " +
      "for January 2006.\n\n" +
      "Our development office will prepare the formal gift " +
      "agreement for signature. Tax receipt will be issued " +
      "upon execution.",
  },
  {
    id: "em-028",
    subject: "Personal Shopping - Spring/Summer 2008",
    sender: "Claudia Feretti <cferetti@luxstyling.com>",
    recipients: "personal@jefinc.com",
    sentAt: new Date("2008-02-20T11:30:00Z"),
    bodyText:
      "Spring/Summer wardrobe selections ready for review:\n\n" +
      "Suits: 4 Brioni, 2 Zegna (lightweight tropical wool)\n" +
      "Casual: Loro Piana linen shirts (8), cotton trousers\n" +
      "Footwear: Berluti loafers (2 pairs), Tod's driving shoes\n" +
      "Swimwear: Vilebrequin (6 pairs, various prints)\n" +
      "Accessories: Hermes belts, Charvet ties\n\n" +
      "Total budget: approximately $85,000\n\n" +
      "Items are on hold at Bergdorf's. Fitting appointment " +
      "available Tuesday or Thursday this week. The tailor " +
      "needs 3 weeks for alterations.\n\n" +
      "Shall I also pull options for the Aspen trip?",
  },
  {
    id: "em-029",
    subject: "Houseguest Protocols - Updated",
    sender: "Gloria Steinfeld <gsteinfeld@estatemgmt.com>",
    recipients: "household@jefinc.com",
    sentAt: new Date("2005-05-03T14:15:00Z"),
    bodyText:
      "Updated houseguest protocols effective immediately:\n\n" +
      "1. All guests must be pre-approved and listed 48hrs " +
      "in advance. No walk-ins without principal's direct " +
      "approval.\n\n" +
      "2. Guest WiFi network isolated from main network. " +
      "New password rotated weekly.\n\n" +
      "3. Staff to log all guest arrivals and departures " +
      "with timestamps in the security binder.\n\n" +
      "4. NDA packages available at front desk for any " +
      "visitor the principal designates.\n\n" +
      "5. Photography policy: No photos inside any " +
      "residence without explicit written permission.\n\n" +
      "Please distribute to all household staff and " +
      "confirm receipt signatures by May 10.",
  },
  {
    id: "em-030",
    subject: "Aircraft Acquisition - Gulfstream G550",
    sender: "Peter Van Horn <pvanhorn@bizav.com>",
    recipients: "aviation@jefinc.com",
    sentAt: new Date("2006-06-15T08:30:00Z"),
    bodyText:
      "Pre-owned Gulfstream G550 available:\n\n" +
      "Year: 2005\n" +
      "Total time: 1,200 hours\n" +
      "Engines: Rolls-Royce BR710, on program\n" +
      "Interior: 14-passenger, recently refurbished\n" +
      "Avionics: PlaneView cockpit, current database\n" +
      "Range: 6,750 nm\n\n" +
      "Asking price: $42.5M (negotiable)\n" +
      "Pre-buy inspection at Savannah recommended.\n\n" +
      "This aircraft would complement the existing 727 " +
      "for shorter routes while offering similar cabin " +
      "comfort. Tax advantages of 2006 acquisition " +
      "timeline discussed with your CPA.\n\n" +
      "Competing interest from two Middle East buyers.",
  },
  {
    id: "em-031",
    subject: "Personal Training Schedule - January",
    sender: "David Kessler <dkessler@elitefitness.com>",
    recipients: "personal@jefinc.com",
    sentAt: new Date("2007-01-03T07:00:00Z"),
    bodyText:
      "January training schedule:\n\n" +
      "Mon/Wed/Fri: 6:30am, strength and conditioning\n" +
      "Tue/Thu: 7:00am, flexibility and yoga\n" +
      "Saturday: 8:00am, outdoor cardio (weather permitting)\n\n" +
      "All sessions at the home gym. I've ordered " +
      "replacement cables for the Technogym and new " +
      "resistance bands.\n\n" +
      "Nutrition plan for the month focuses on lean " +
      "protein and Mediterranean-style meals. Chef " +
      "has been briefed on the macro targets.\n\n" +
      "Goal for Q1: Improve resting heart rate from " +
      "62 to 58 bpm. Current body composition on track.",
  },
  {
    id: "em-032",
    subject: "Re: Harvard Donation - Naming Opportunity",
    sender: "Prof. Alan Rosenberg <arosenberg@harvard.edu>",
    recipients: "foundation@jefinc.com",
    sentAt: new Date("2003-11-08T15:40:00Z"),
    bodyText:
      "The university is pleased to accept the $6.5M " +
      "contribution to the Program for Evolutionary " +
      "Dynamics. Per the gift agreement:\n\n" +
      "- The program will bear the foundation's name\n" +
      "- Annual advisory board seat guaranteed\n" +
      "- Priority access to research publications\n" +
      "- Invitation to all program events and lectures\n\n" +
      "The inaugural symposium is scheduled for February " +
      "2004. We'd be honored to have a keynote address " +
      "or welcome remarks.\n\n" +
      "Formal announcement will coordinate with your " +
      "communications team. Draft press release attached " +
      "for review.",
  },
  {
    id: "em-033",
    subject: "Swimming Pool Renovation - Palm Beach",
    sender: "Marco Alvarez <malvarez@luxpools.com>",
    recipients: "property@jefinc.com",
    sentAt: new Date("2008-11-04T10:00:00Z"),
    bodyText:
      "Renovation proposal for the Palm Beach pool:\n\n" +
      "Scope:\n" +
      "- Resurface with pebble aggregate finish\n" +
      "- Replace filtration with saltwater system\n" +
      "- Add infinity edge on south side\n" +
      "- LED lighting package (color programmable)\n" +
      "- New pool heater (gas, 400K BTU)\n" +
      "- Expand deck area by 800 sq ft\n\n" +
      "Budget: $340,000\n" +
      "Timeline: 6 weeks (weather dependent)\n\n" +
      "Best to schedule Jan-Feb when the property " +
      "usage is lighter. Permits already filed with " +
      "Palm Beach County. HOA approval not required " +
      "for this scope of work.",
  },
  {
    id: "em-034",
    subject: "FW: Ghislaine's Birthday - Party Planning",
    sender: "Sarah Mitchell <smitchell@events.com>",
    recipients: "social@jefinc.com",
    sentAt: new Date("2005-11-20T12:00:00Z"),
    bodyText:
      "Planning update for the December 25 celebration:\n\n" +
      "Venue: NYC residence, entire ground floor\n" +
      "Theme: Winter Wonderland\n" +
      "Guest count: 75 confirmed, 20 pending\n\n" +
      "Entertainment: DJ from Le Bain, string quartet " +
      "for cocktail hour, photo booth with props.\n\n" +
      "Catering: Cipriani providing passed hors d'oeuvres " +
      "and three stations. Separate dessert table.\n\n" +
      "Florals: White roses, silver accents, ice " +
      "sculptures at each entrance.\n\n" +
      "Gift bags: Customized with Diptyque candles, " +
      "chocolates, and silk scarves.\n\n" +
      "Security: Additional 4 guards for the evening. " +
      "Coat check staffed separately.",
  },
  {
    id: "em-035",
    subject: "Medical Records Transfer Request",
    sender: "Dr. Steven Pratt <spratt@conciergemedical.com>",
    recipients: "personal@jefinc.com",
    sentAt: new Date("2010-04-08T08:15:00Z"),
    bodyText:
      "Per your request, medical records are being " +
      "transferred from Dr. Hoffman's practice to our " +
      "concierge medical group.\n\n" +
      "Records received:\n" +
      "- Annual physicals 2005-2009\n" +
      "- Cardiology consult (Dr. Sherman, 2008)\n" +
      "- Dental records from Dr. Greenberg\n" +
      "- Prescription history (all current medications)\n\n" +
      "Your initial comprehensive exam is scheduled for " +
      "April 22 at our Park Avenue office. Please fast " +
      "for 12 hours prior to bloodwork.\n\n" +
      "All records maintained under HIPAA compliance " +
      "with enhanced privacy protocols per your request.",
  },
  {
    id: "em-036",
    subject: "Library Catalog - New Acquisitions",
    sender: "Eleanor Worthington <eworthington@rarebooks.com>",
    recipients: "personal@jefinc.com",
    sentAt: new Date("2006-09-25T13:30:00Z"),
    bodyText:
      "New acquisitions for the personal library:\n\n" +
      "1. First edition Newton's Principia (1687) — $380K " +
      "(auction, Sotheby's)\n" +
      "2. Signed Stephen Hawking 'Brief History' — $12K\n" +
      "3. Darwin's Origin of Species, 1st ed — $290K " +
      "(private sale, authenticated)\n" +
      "4. Collection of Einstein correspondence (14 " +
      "letters) — $450K (estate sale)\n\n" +
      "Total: $1.132M\n\n" +
      "Climate-controlled display cases installed in the " +
      "71st Street library. Insurance rider updated to " +
      "reflect new total collection value of $4.8M.\n\n" +
      "The Einstein letters require conservation work — " +
      "estimated $8K. Shall I proceed?",
  },
  {
    id: "em-037",
    subject: "Re: Prince Andrew Visit - Logistics",
    sender: "Colin Whitfield <cwhitfield@protocol.co.uk>",
    recipients: "scheduling@jefinc.com",
    sentAt: new Date("2001-12-05T17:00:00Z"),
    bodyText:
      "Logistics confirmed for the December visit:\n\n" +
      "Arrival: December 10, British Airways from LHR. " +
      "Car service arranged from JFK.\n\n" +
      "Accommodation: Guest suite at the 71st Street " +
      "residence (per preference, not hotel).\n\n" +
      "Schedule:\n" +
      "Dec 11: Breakfast meeting, afternoon golf at " +
      "Shinnecock Hills (members arranged)\n" +
      "Dec 12: Morning free, evening dinner party\n" +
      "Dec 13: Departure to Palm Beach (private aviation)\n\n" +
      "Protection detail from the Met Police will " +
      "coordinate with your security team. Advance " +
      "sweep of residence December 9.\n\n" +
      "Dietary: No specific requirements noted.",
  },
  {
    id: "em-038",
    subject: "Telecommunications Upgrade - All Properties",
    sender: "Kevin Park <kpark@techinstall.com>",
    recipients: "admin@jefinc.com",
    sentAt: new Date("2009-08-14T09:30:00Z"),
    bodyText:
      "Proposed telecommunications upgrade:\n\n" +
      "NYC: Upgrade to fiber optic, dedicated 1Gbps line. " +
      "Replace aging PBX with VoIP system. Encrypted " +
      "line for the study. Est: $45K.\n\n" +
      "Palm Beach: Similar fiber upgrade. Extend WiFi " +
      "coverage to pool house and cabana. Est: $28K.\n\n" +
      "NM Ranch: Satellite internet upgrade to 50Mbps " +
      "(limited by location). Backup cellular modem. " +
      "Est: $15K.\n\n" +
      "Island: Marine satellite system replacement. " +
      "Current unit end-of-life. New Intellian v100 " +
      "system. Est: $65K.\n\n" +
      "Total: $153K. Installation timeline: 4-6 weeks " +
      "per property, can run in parallel.",
  },
  {
    id: "em-039",
    subject: "Donation Acknowledgment - Democrats Abroad",
    sender: "Jennifer Brooks <jbrooks@demsabroad.org>",
    recipients: "personal@jefinc.com",
    sentAt: new Date("2002-10-15T14:00:00Z"),
    bodyText:
      "Thank you for your generous contribution of " +
      "$100,000 to Democrats Abroad for the 2002 " +
      "election cycle.\n\n" +
      "Your support helps fund voter registration " +
      "drives in expatriate communities across 40 " +
      "countries.\n\n" +
      "As a major donor, you are invited to the " +
      "post-election reception in Washington DC on " +
      "November 8. Black tie. RSVP requested.\n\n" +
      "Tax receipt enclosed. This contribution is " +
      "reportable under FEC guidelines. Our compliance " +
      "team has filed the appropriate disclosures.",
  },
  {
    id: "em-040",
    subject: "Yacht Charter - Mediterranean August",
    sender: "Marco DeLuca <mdeluca@yachtcharter.mc>",
    recipients: "travel@jefinc.com",
    sentAt: new Date("2007-05-30T11:00:00Z"),
    bodyText:
      "Charter confirmed: M/Y LADY GHISLAINE\n\n" +
      "Dates: August 1-15\n" +
      "Route: Monaco - Sardinia - Corsica - Amalfi - " +
      "Montenegro - Dubrovnik\n" +
      "Crew: 16 (including captain)\n" +
      "Guest capacity: 12\n\n" +
      "Charter rate: $400K/week (2 weeks = $800K)\n" +
      "APA (advance provisioning): $120K\n" +
      "Fuel estimate: $60K\n\n" +
      "Provisioning requests: Specify wine preferences " +
      "and any dietary restrictions by July 15.\n\n" +
      "Port fees and dockage pre-arranged at all " +
      "scheduled stops. Tender available for shore " +
      "excursions. Water toys: jet skis, diving gear, " +
      "kayaks included.",
  },
  {
    id: "em-041",
    subject: "Office Lease Renewal - 457 Madison Ave",
    sender: "Barbara Quinn <bquinn@commercialre.com>",
    recipients: "admin@jefinc.com",
    sentAt: new Date("2004-03-22T10:00:00Z"),
    bodyText:
      "The Madison Avenue office lease expires August 31, " +
      "2004. Current terms:\n\n" +
      "Space: 8,500 sq ft, floors 18-19\n" +
      "Current rent: $72/sq ft ($612K/year)\n" +
      "Proposed renewal: $78/sq ft ($663K/year), 5-year term\n\n" +
      "Landlord is willing to negotiate. Market comps " +
      "suggest $75-80/sq ft is fair for this submarket.\n\n" +
      "Tenant improvements: They'll contribute $25/sq ft " +
      "toward renovations if we sign a 7-year term.\n\n" +
      "Alternative: 277 Park Ave has 10,000 sq ft " +
      "available at $70/sq ft, but requires buildout.\n\n" +
      "Recommendation: Renew at current location, " +
      "negotiate to $76/sq ft with the 5-year term.",
  },
  {
    id: "em-042",
    subject: "Guest List Additions - New Year's Eve Party",
    sender: "Victoria Adams <vadams@socialsec.com>",
    recipients: "social@jefinc.com",
    sentAt: new Date("2004-12-18T15:30:00Z"),
    bodyText:
      "Late additions to the NYE party guest list:\n\n" +
      "1. Naomi C. + guest (confirmed via her agent)\n" +
      "2. The Murdoch group (4 total)\n" +
      "3. Harvey W. + wife (confirmed today)\n" +
      "4. Two couples from the London contingent " +
      "(names TBD by Dec 22)\n\n" +
      "Updated total: 214 guests\n\n" +
      "Caterer has been notified of the increase. " +
      "Additional bar staff hired. Valet service " +
      "expanded to handle 100+ vehicles.\n\n" +
      "Fireworks display confirmed — barge positioned " +
      "on the East River, coordinated with FDNY. " +
      "Viewing from the rooftop terrace.\n\n" +
      "Champagne order doubled: 200 bottles Krug.",
  },
  {
    id: "em-043",
    subject: "Private Island Dock Permits",
    sender: "Harold Jensen <hjensen@usvigovernment.gov>",
    recipients: "property@jefinc.com",
    sentAt: new Date("2011-07-19T09:45:00Z"),
    bodyText:
      "RE: Dock expansion permit application\n\n" +
      "Your application for the expanded dock facility " +
      "on Great St. James has been approved with the " +
      "following conditions:\n\n" +
      "1. Maximum dock length: 200 feet (as requested)\n" +
      "2. Environmental impact assessment must be filed " +
      "before construction begins\n" +
      "3. Sea turtle nesting survey required during " +
      "April-August construction window\n" +
      "4. Coral relocation plan for affected areas\n\n" +
      "Construction may begin after all conditions are " +
      "met. Estimated permit validity: 18 months from " +
      "date of issue.\n\n" +
      "Annual permit fee: $12,500, due upon issuance.",
  },
  {
    id: "em-044",
    subject: "Re: Science Dinner - Stephen Hawking Attendance",
    sender: "Dr. Lisa Randall <lrandall@physics.harvard.edu>",
    recipients: "science@jefinc.com",
    sentAt: new Date("2006-02-14T16:20:00Z"),
    bodyText:
      "Wonderful news — Professor Hawking has confirmed " +
      "his attendance at the March science dinner.\n\n" +
      "Accessibility requirements:\n" +
      "- Wheelchair ramp at entrance (check clearance)\n" +
      "- Power outlet near his table position for chair " +
      "battery and communication device\n" +
      "- His nurse will accompany (+1 to guest count)\n" +
      "- Diet: Soft foods only, specifics from his team\n\n" +
      "Other confirmed scientists:\n" +
      "- Murray Gell-Mann (Nobel, physics)\n" +
      "- Gerald Edelman (Nobel, medicine)\n" +
      "- Frank Wilczek (Nobel, physics)\n" +
      "- Oliver Sacks (neurology)\n\n" +
      "Suggested discussion topic: consciousness and " +
      "quantum gravity. I'll moderate the after-dinner " +
      "conversation.",
  },
  {
    id: "em-045",
    subject: "Landscaping Contract - Spring Planting",
    sender: "Eduardo Reyes <ereyes@gardendesign.com>",
    recipients: "property@jefinc.com",
    sentAt: new Date("2005-02-28T08:00:00Z"),
    bodyText:
      "Spring planting schedule for Palm Beach property:\n\n" +
      "March 1-15:\n" +
      "- Install 40 royal palms along main drive ($2,800 each)\n" +
      "- Replant hibiscus borders (200 plants)\n" +
      "- Turf replacement: Celebration bermuda, 15,000 sq ft\n\n" +
      "March 15-31:\n" +
      "- Rose garden restoration (180 bushes, David Austin varieties)\n" +
      "- Orchid greenhouse restocking (500 specimens)\n" +
      "- Install drip irrigation for new plantings\n\n" +
      "Budget: $185,000 for materials and labor\n" +
      "Crew size: 8-12 workers daily\n\n" +
      "Ongoing maintenance contract: $8,500/month " +
      "(includes weekly mowing, pruning, pest management).",
  },
  {
    id: "em-046",
    subject: "Re: Legal Strategy - Federal Investigation",
    sender: "Kenneth Starwood <kstarwood@crimdefense.com>",
    recipients: "legal@jefinc.com",
    sentAt: new Date("2007-11-28T18:00:00Z"),
    bodyText:
      "ATTORNEY-CLIENT PRIVILEGED\n\n" +
      "Status update on the federal matter:\n\n" +
      "1. Grand jury proceedings ongoing in Southern " +
      "District of Florida. No indictment at this time.\n\n" +
      "2. Our investigators have identified three " +
      "potential witnesses. Preparation sessions " +
      "scheduled for next week.\n\n" +
      "3. The non-prosecution agreement framework " +
      "has been discussed with the US Attorney's office. " +
      "Key terms under negotiation.\n\n" +
      "4. All staff have been instructed to preserve " +
      "all documents and electronic communications. " +
      "No deletions or alterations.\n\n" +
      "Next steps: Meeting with federal prosecutors " +
      "December 5. I'll prepare talking points and " +
      "distribute to the defense team by December 2.",
  },
  {
    id: "em-047",
    subject: "Piano Tuning and Art Installation",
    sender: "James Blackwell <jblackwell@fineartservices.com>",
    recipients: "household@jefinc.com",
    sentAt: new Date("2003-04-10T09:30:00Z"),
    bodyText:
      "Scheduled services for the NYC residence:\n\n" +
      "Piano tuning: April 15, 10am\n" +
      "The Steinway Model D in the music room and " +
      "the Bosendorfer in the study both due for " +
      "quarterly tuning.\n\n" +
      "Art installation: April 16-17\n" +
      "- Hang the newly acquired Picasso sketch in " +
      "the second-floor hallway\n" +
      "- Relocate the Renoir pastel to the guest suite\n" +
      "- Install museum-grade lighting for the Warhol " +
      "triptych in the dining room\n\n" +
      "Insurance appraiser will visit April 18 to " +
      "update the fine art rider. Current insured " +
      "value: $22M across all properties.\n\n" +
      "Please ensure the alarm system is adjusted " +
      "for the installation crew access.",
  },
  {
    id: "em-048",
    subject: "Caretaker Report - NM Ranch - October",
    sender: "Bill Hawkins <bhawkins@ranchoperations.com>",
    recipients: "property@jefinc.com",
    sentAt: new Date("2009-11-01T08:00:00Z"),
    bodyText:
      "Monthly caretaker report, October 2009:\n\n" +
      "Livestock: 14 horses, all healthy. Farrier visit " +
      "completed. Two mares due for dental check.\n\n" +
      "Airstrip: Surface in good condition. Windsock " +
      "replaced. Runway lights tested — 2 fixtures " +
      "need bulb replacement.\n\n" +
      "Water well #3 producing reduced flow — pump " +
      "inspection scheduled. Well #1 and #2 nominal.\n\n" +
      "Hunting season note: Neighboring ranchers " +
      "report increased elk activity. Boundary fencing " +
      "checked — one section needs repair on the " +
      "northwest corner.\n\n" +
      "Fuel reserve: 2,400 gallons diesel, 800 gallons " +
      "gasoline. Order placed for winter resupply.\n\n" +
      "No trespass incidents this month.",
  },
  {
    id: "em-049",
    subject: "Annual Insurance Review - All Policies",
    sender: "Diana Walsh <dwalsh@premierinsurance.com>",
    recipients: "admin@jefinc.com",
    sentAt: new Date("2008-01-15T14:00:00Z"),
    bodyText:
      "Annual insurance portfolio review:\n\n" +
      "Property:\n" +
      "- NYC residence: $28M coverage, $42K premium\n" +
      "- Palm Beach: $18M coverage, $31K premium\n" +
      "- NM Ranch: $22M coverage, $18K premium\n" +
      "- Island properties: $15M coverage, $38K premium\n\n" +
      "Aviation:\n" +
      "- 727-200: Hull $8M, liability $100M, $195K premium\n" +
      "- S-76B: Hull $3M, liability $50M, $67K premium\n\n" +
      "Umbrella: $100M excess liability, $88K premium\n\n" +
      "Fine Art: $22M blanket, $28K premium\n" +
      "Jewelry: $4.5M scheduled, $12K premium\n\n" +
      "Total annual premium: $519K\n\n" +
      "Recommendation: Increase umbrella to $200M given " +
      "expanded asset base. Additional cost: ~$45K/year.",
  },
  {
    id: "em-050",
    subject: "Re: Dinner with Elon - Confirmed",
    sender: "Timothy Barrow <tbarrow@techconnect.com>",
    recipients: "social@jefinc.com",
    sentAt: new Date("2012-09-05T17:30:00Z"),
    bodyText:
      "Dinner confirmed with Elon for September 15 at " +
      "the NYC residence. 7:30pm.\n\n" +
      "He's bringing his chief engineer from SpaceX to " +
      "discuss the solar energy initiative. They're " +
      "particularly interested in the foundation's " +
      "involvement in renewable energy research.\n\n" +
      "Menu suggestion: Keep it simple — Elon mentioned " +
      "he prefers straightforward American cuisine. " +
      "No wine pairing needed (he doesn't drink much).\n\n" +
      "Other guests that evening:\n" +
      "- Peter Thiel (confirmed)\n" +
      "- Reid Hoffman (tentative)\n" +
      "- Larry Summers (confirmed)\n\n" +
      "Topics to prepare: Mars colonization timeline, " +
      "AI safety, and the hyperloop concept he's been " +
      "developing.",
  },
];

async function seed(): Promise<void> {
  console.log("Seeding database with 50 emails...");

  const rows = SEED_EMAILS.map((e) => ({
    id: e.id,
    subject: e.subject,
    sender: e.sender,
    recipients: e.recipients,
    sentAt: e.sentAt,
    bodyText: e.bodyText,
    bodyHtml: null,
    sourceUrl: null,
  }));

  await db.insert(emails).values(rows).onConflictDoNothing();

  console.log(`Seed complete: ${rows.length} emails inserted.`);
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
