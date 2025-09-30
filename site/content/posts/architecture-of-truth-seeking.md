---
author: Lucas Pierce
title: The architecture of truth-seeking
date: 2025-09-30
description: An advocacy on the necessity of agonism to create truth-seeking organizations.
categories: ["Management & Process"]
tags: ["organizational design", "decision making", "leadership", "data science"]

---

A brilliant executive I worked with hired a team of PhDs to automate a critical process deep in his organization. After a year, they delivered plans that were as beautiful as they were unworkable.

So the manual decisions continued. At most, the team only glanced at the optimal plans. The leader would check in, demanding progress. The team kept saying "any day now, the model doesn't work perfectly yet." The leader grew more frustrated. The cycle continued, until finally, everyone just… pretended it all worked. When asked "are you using the new system?" they'd palter "yes"; technically it was true. They glanced at its output while making the decisions that made sense for the business.

For years after, this executive would roll out this automation success story when teams in the rest of the company told him something wasn't possible. And the manual team in his own organization kept quietly doing everything the old way. He never noticed. Or never asked. He had his success story, and that appears to be all he really needed.

The original leader left. Eventually nearly everyone who was originally involved left. But like the Ship of Theseus, the web of lies was somehow maintained–each new person inheriting the fiction from the last.

Until someone asked the obvious question: "Why isn't this thing actually plugged in?"

So they did what any smart person would do. They plugged it in.

Disaster. It ordered all the wrong things: shortages and chaos. Immediate management's post-mortem blamed "overly aggressive cost optimization." The truth? The automated plan was more expensive and wrong. But the superiors above weren’t close enough to know that.

The largest improvements I've seen in companies have often been mundane: fixing systems that ran on garbage data nobody knew was garbage. Truth doesn't bubble up naturally; it has to be designed in. You need different teams in productive tension with each other. Without agonism (the structured contest-of-perspectives), even good people end up maintaining elaborate fictions. 

## When processes drift apart

I saw this dynamic play out vividly at a place we'll call the widget factory (for lack of a more creative way to anonymize). The goal was simple: shorten the lead-time for new widget capacity. What mattered wasn't the average delivery time, but the P95 (95th percentile) lead-time. A reliable date they could build forecasts around. The shorter that lead-time, the less buffer capacity they required and in turn the greater their capital efficiency. That lead-time was originally around six months.

The workflow was split between two teams (it was in actuality two dozen teams, but I’m simplifying): Delivery, who bought the widget machines, and Installation, who set them up.

Management gave each team a simple mandate: get faster. Delivery was told to cut its P95 from five months to two. Installation, from two months to one week. On paper, they crushed their goals. Promotions and celebrations all around.

Except for one problem: the customer's total lead-time was growing. From six months, to seven, then eight. Even though P95 times don’t simply add (the worst 5% of cases rarely coincide), we expect the overall P95 to be lower than the sum of the sub-P95s. If the total P95 ends up much larger, that’s a sign our assumptions about independence, distribution shape, or what’s being measured are breaking down. When asked, each team pointed to their charts. "Don't look at us," they'd say. "Our numbers are going down."

The truth was hiding in the gap between them: an unmeasured no-man’s-land. By tracing the entire workflow, from the customer’s order to the machine going online, we found both teams’ clocks had drifted further and further apart. Installation wouldn’t start their timer until labor was physically ready to swarm the machine, making their part look especially fast, especially when a large batch of deliveries occurred at the same time. Delivery would stop theirs based on a projected delivery ETA, not the actual arrival. This exempted them from shipping and material delays they felt were beyond their control. Each team's clock was paused while the customer's kept ticking.

We joined the clocks. The moment Delivery marked a machine *delivered*, Installation’s timer started, no exceptions. The data improved instantly because the teams were now interlocked; if a delivery was only real on paper, the Installation team raised hell. If a large batch of deliveries occurred, Installation either needed to staff for that peak or negotiate level-loading with the delivery team. The overall cycle time finally began to drop.

A happy story, where everyone learned a valuable lesson for the future?

If only.

Nobody wanted to admit the earlier promotions and celebrations were based on illusions. So instead of owning the fix, leadership credited it to another high-profile project that was failing. On paper, this worked perfectly: the failing project suddenly looked successful, and no need for a *mea culpa*.

The language justifying this sleight of hand was meticulously drafted to achieve two goals: 1) avoid being outright false, and 2) stay vague enough that nobody would ask the obvious questions.

But as the story climbed the org chart, that deliberate phrasing was discarded. Higher-level executives, remembering only the original pitch, rewrote it into a neat success. What had started as a fuzzy misdirection hardened into a plain lie. By the time anyone noticed the mismatch, it was politically impossible to correct without admitting to the larger subterfuge. Truth wasn’t the only casualty. The chance to learn what actually works (and what doesn’t) died with it.

This wasn’t an isolated case. The dramatic wins I see in companies are rarely about brilliance; they’re about avoiding something dumb. But nobody celebrates that. It’s better for your career to say you launched a fancy AI initiative than to admit you fixed an operation built on misconceptions. This is improvement laundering: when executives construct heroic fictions because the truth is too embarrassing.

## When lies are cheap and truth is expensive

The same pattern shows up in today’s tech companies, where truth itself is supposed to be measured in data. In that world, data science has become a key arbiter of success. They interpret A/B test results and declare a product launch good-to-go. This creates a natural tension. When data scientists are centralized, product leaders complain they have to beg for resources. So, at one company I was at, a seemingly logical decision was made: embed data scientists directly into product teams.

The predictable result? Methodological correctness left the building. The new incentive for the data scientists wasn't to find the objective truth, but to deliver the messaging their management wanted to hear.

This came to a head with a major product launch. The A/B test results were terrible. But for internal political reasons, the launch had to proceed. Product leaders were afraid Engineering would complain if they shipped with bad numbers, knowing they'd get blamed for the inevitable fallout.

So, the embedded data scientists found a solution. They peeked and snapshotted the A/B test results less than a day after the experiment launched.

They exploited a novelty effect. The new, confusing UX meant users initially spent more time on the page, pushing some engagement metrics into the green. It was a perfect, fleeting illusion of success. Within a week, of course, the test would turn deep red as frustrated users churned. But so long as you took a snapshot in those initial hours after release, you could declare success.
The data scientist was careful in how they presented results; an incomplete truth that balances on a particular phrasing: "Early results show an average treatment effect on time spent as 2% higher." No mention that it's a novelty effect or statistical significance.

Then the falsehood evolved. The manager's summary to leadership: "User signals are positive." The VP's report: "Users love the new feature." Nobody exactly lied. The data scientist was misleading but never outright lied. The people who turned it into "users love this" weren't lying either. It was a natural, if incorrect, conclusion based on the report they were given.

An engineer, suspicious as to why the A/B test was suddenly green after so much time being red in earlier iterations, passed it to the central data science team. They immediately saw what was wrong. The A/B platform had guardrails against exactly these issues, but the embedded data scientists built custom notebooks that bypassed these safeguards in the name of flexibility. When the central data science team raised these issues, the conversation wasn't "this is terrible" but "we're all on the same team, anyone can make this mistake, is it even wrong? We aren't playing gotcha here."

This is how plausible deniability forms an immune system for falsehood. Nobody wants to assume malice for what can be explained by ignorance. Irrespective of intent though, when the mistakes are always in one direction, always toward what power wants to hear, the company develops antibodies against truth rather than lies.

The asymmetry is brutal. Creating these falsehoods costs nothing; you're reading the data through the right lens, being a team player. But catching them requires substantial investment: digging through data, understanding what really happened, often challenging what powerful people have already celebrated. By then, those in positions of power have staked their reputations on the success story. The correction comes with political cost, while creating the necessary fiction comes with promotion.

When the balance of incentives tilts this way, the ability for an organization to generate reliable truth doesn't only suffer. It dies. The wrong lessons are learned. Poor decisions compound. This isn’t the system failing. As perverse as it is, the system is working exactly as designed.

## Designing for truth

If systems are working exactly as designed, the real question is: how do we design them differently?

Truth follows the logic of a tragedy of the commons. The rational choice for any single person is to stay silent to protect themselves. But when everyone makes that same rational choice, the system breaks.

The solution isn't asking people to be heroes. It's building systems where truth-telling isn't an altruistic act. This requires what I called agonism earlier: structured tension between teams that makes comfortable fictions impossible to maintain.

But not all tension creates truth. The stories above reveal the necessary conditions:

* **Equal political standing.** When data scientists reported to product teams, they became an internal marketing department rather than independent peers. The asymmetry was brutal: creating falsehoods cost nothing while catching them required substantial investment.

* **Interlocked accountability.** When the widget factory joined clocks together, neither team could retreat into convenient measurements. Their friction became productive only when success required confronting a shared reality.

* **Proximity to operations.** The automation fiction survived because the executive never descended to where decisions actually lived. The desire to tell narratives of success shouldn't become a substitute for on-the-ground reality.

* **Protected truth-tellers.** If you want truth in your organization, truth-seeking should be incentivized rather than something that requires a warning label. Truth-telling should be rewarded, not punished.

Most organizations are designed for comfort, consensus, and clean narratives. And they get exactly that. The rare few that get truth do so because they’ve made fiction more exhausting to maintain than truth. In those organizations, plausible deniability can’t form an immune system for falsehood. The cost of the lie finally exceeds the embarrassment of admitting it.