---
author: Lucas Pierce
title: Teaching Real Lessons with Fake Worlds
date: 2025-11-23
description: Why toy problems fail in the age of AI, and how to build messy, realistic worlds for students.
categories: ["Career & Professional"]
_build:
  render: always
  list: never
  publishResources: true
tags: []

---

I build little worlds full of adventurers, potions, and dragons. Students run potion shops where they manage magical supply chains for demanding fighters and wizards. They run media companies providing entertainment to dragons, frog-folk, and discerning gnomes. And, in the process, they often become curious about how the worlds themselves work and come alive.

I worked in tech for a long time, most of it leading technical teams. And I kept noticing the same thing: new grads who struggled with problems that looked nothing like their coursework. They knew how to do the work, but only if it was carefully packaged up for them. In the wild, solving a technical problem looks more like a cycle:

1. **Formulate:** Translate an unbounded, ambiguous real world situation into a technical problem.
2. **Solve:** Execute the technical solution.
3. **Interpret:** Evaluate whether your solution actually solved the problem.

Even when toy problems attempt steps 1 and 3, it is often just a sort of thin pseudocontext. There isn't enough noise and it is painfully obvious what technical thing needs to be done.

LLMs have exacerbated this problem in the classroom. Step 2—the “doing”—is now often solvable with a copy and a paste. It's similar to how calculators solved the “how do I perform arithmetic on these numbers” problem, but didn't solve the “how do I turn my problem into something I can plug into a calculator” issue. If we only teach Step 2, students aren't just working on problems that don't match the real world; they often aren't building any fundamental skills at all.

My answer has been to make the classroom—specifically my upper-division computer science courses—look more like the real world through simulation. Not as a panacea, but as part of a broader teaching toolkit that builds the metacognitive and epistemic skills students often lack.

## Why Simulation?

I've always loved simulation-style games. Ever since playing the gold-cartridge *Legend of Zelda* on the NES, I've been fascinated by the idea that the little characters in those worlds might have lives of their own; that they might keep moving even when the player isn't looking.

That notion is the seed of my classroom simulations: worlds that run on their own, where students must reason about living systems rather than static puzzles.

My first classroom simulation-game came out of a databases course. Early on, I realized students weren't really feeling what it meant to run a production system: the pressure, the messiness, the human factors. Software without customers is sterile. But software that serves a live world, with people depending on it, becomes something else entirely—unpredictable, alive, and worth thinking about. The kind of thing that breaks at 3 a.m.

For example:

* Teaching concurrency errors: As “customers” fire off parallel cart checkouts, students' code now runs into fun and unpredictable race conditions. Sorry your inventory is out of sync. You had a lost update. The week after, when I lecture on transactions, you are excited when it solves your problem.
* Teaching design principles: Let students debug the chaos of a mutable, update-in-place system, then guide them toward architectural patterns that reduce that pain—immutability, append-only logs, and systems designed for observability and debugging. That's how many experienced developers come to care about those principles: not from theory, but from scars.

This is even more critical when teaching data science. In my *Knowledge Discovery* class, students build recommendation engines, churn detectors, and user personas. Simulations are foundational here because of the counterfactual: for a recommender, how do you know if it's any good without knowing what would have happened if the person was shown one piece of content vs another?

The reality is that offline evaluation metrics often fail to capture what only reveals itself in a live, online test. A simulation is the best way I can bring that messy complexity into the classroom.

## How I Build Simulations

My goal when designing a simulation is for it to mimic the real-world in the ways that matter. It has to feel real, even when the subject matter of the simulation is fantastical. Synthetic data too often looks fake.

There are three ways fake data tends to give itself away:

* Correlation: Real data is a web of interesting, interconnected correlations of varying degrees.

* Shape: Real data has the right shape for its process.

* Time: Real data both changes over time and is cyclic; it's influenced by the sun, the moon, and the social patterns of human life.

### Correlation

Did you know that ice cream consumption and violent crime rates are frequently correlated? I asked my students this question, and one response was, “well obviously! crime is hard work and you need to treat yourself afterwards.” Hmmm… moving on.

Why are they correlated though? We've all heard the phrase *correlation does not imply causation.* When we say that, we mostly mean *direct causation*. If we accept that our highly correlated world results from a web of causes—“this causes this, which causes these two things, and then those in turn cause others”—we can use that fact as the foundation for natural-looking correlations.

I draw upon [Judea Pearl's causal directed acyclic graphs (DAGs)](https://www.jstor.org/stable/2337329) to make this happen. I start by drawing out a causal graph, giving each effect multiple causes, often layers-and-layers deep.

For example, in the interaction below, we can see how the ice-cream/violent crime correlation could arise via confounding illustrated using a DAG. In this case both ice-cream consumption and violent crime are dependent on season (the confounder). You can see in the scatter plots how ice-cream and violent crime become correlated as a result even without any direct causal link.

{{< dag-vis id="dag" structure="confounded" >}}

This is unrealistically transparent, though, if we actually let students see all of this. The real world is like [the blind men and an elephant](https://en.wikipedia.org/wiki/Blind_men_and_an_elephant) from the *Tittha Sutta*. One blind man feels the trunk and says “It's a snake!” Another feels a leg and says “It's a tree!” Yet another feels the tusk and says “No, you fools, it's a giant spear!” Each has only a partial view of the underlying truth.

I build my “elephant” by creating a large causal DAG that naturally produces realistic correlations, but I only expose a small selection of mostly terminal nodes, and often in opaque and subtle ways.

It isn't just about the strength and reason for correlation, real data is also not limited to linear correlations. This happens for various reasons, but a common one is diminishing returns. In most systems, having a little bit of something is a big deal, and every one after that matters a little less. In a messaging app, the first friend who texts you makes the app come alive. Each additional friend adds some pull, but your hundredth friend matters a lot less than your first or your tenth—you only have so much attention to give. Economists call this diminishing marginal utility: each new unit yields a smaller gain than the last. The same curve shows up in studying/exam results, income/happiness, marketing spend/impact, and many more such cases. It's what gives a lot of real correlations a characteristic bend when viewed as a scatterplot.

{{< diminishing-returns id="diminishing" >}}

Lastly, and perhaps most tricky, real data is littered with selection biases; the data we have is almost never perfectly representative of the overall population but is biased in one way or another. It is important for our simulated data to have similar selection biases. For example, [a hospital in Canada](https://onlinelibrary.wiley.com/doi/pdf/10.1111/joim.12363) noticed when analyzing bicycle accidents at the ER, wearing a helmet was correlated with having a concussion and you were ~50% more likely to have a serious injury compared to not wearing a helmet. That seems wrong, doesn't it? 

This is a case of a specific selection bias called a collider bias (or Berkson's paradox). The hospital isn't seeing all bike riders and all bike accidents; they don't see all the cases where a bike rider is wearing a helmet and that helmet saved them from going to the ER. As a result, the helmet effectively filtered out lower-end accidents leaving only the more serious accidents for the ER.

You find this pattern all the time when doing data analysis. You see a study on what it takes to make a successful startup, but they only look at the ones who made it, not the ones that died out. You analyze active users and forget the ones who churned. The data you have is conditioned on having survived long enough to be recorded. It's a kind of selection echo: the world you see isn't the world as it is, but the world that lasted.

In the simulation below, I show how food quality and location can become inversely correlated, even if they start out completely independent. This happens because survival is a filter: a restaurant can survive with bad food if it has high foot traffic (a tourist trap), and it can survive in a bad location if the food is amazing. But if it has bad food and a bad location, it goes out of business and disappears from the dataset. We only see the survivors.

{{< berkson-paradox id="berkson" >}}

Combine this all together and you get data that is filled with correlations, large and small, inverse and positive, linear and not-so-linear, spurious and true. Or in other words, data that is actually worth analyzing.

### Shape

I've long been fascinated by the beautifully smooth shapes that data makes when generated at scale. Not just systems, but data that is based on human behavior. I had once assumed just because individual humans are so complicated, so individual, so hard to predict individually, that a bunch of humans should be exponentially more complicated to predict. But it is in fact the opposite. When you get lots of people, all the individual differences wash out, and what you are left with is the smooth underlying generative mechanisms that underlie their common behavior.

Most people are familiar with the bell curve or normal distribution. Plot human height and you'll get something roughly normal. Human height follows this pattern because it's the sum of many small, independent effects: genes, nutrition, environment. You can see below that adult human height is approximately normal; if you split by gender even more so.

{{< height-distribution id="height" >}}

Roll a bunch of dice, **add** them up, record that sum, repeat many times, and you'll get the same shape; that's the central limit theorem at work. When I see a bell-curve I see a process that has a bunch of uncorrelated randomness that is being added together. In the simulation below, try running it and seeing how as you add more samples it gets closer and closer to a smooth normal distribution.

{{< generate-samples id="clt" type="normal" >}}

Most of the data I've worked with doesn't follow a normal distribution, though. Systems and behaviors rarely follow additive processes. They are more commonly multiplicative and/or full of feedback loops—both of which create long right tails.  

For example, [housing prices](https://unece.org/fileadmin/DAM/stats/documents/ece/ces/ge.22/2010/zip.36.e.pdf) are generally right-skewed, largely because each property's value grows through a chain of proportional effects: land value, size, location premiums, amenities, and market appreciation all compound on top of one another. Small percentage differences in these factors multiply rather than add. This makes the main body of the distribution log-normal; it is log simply because log turns multiplication problems into addition problems. Remember, normal is additive, log-normal is multiplicative. For that reason, it is also common to look at these right-skewed distributions in log space. 
 
Below, home sales data from [England and Wales](https://www.gov.uk/government/statistical-data-sets/price-paid-data-downloads#yearly-file) is charted; try viewing in both linear and log-space.

{{< home-values id="homevalues" >}}

We can get something similar using our same dice rolling example. But this time, rather than adding the dice, we will multiply them together. 

{{< generate-samples id="log" type="lognormal" >}}

Many human systems aren't just multiplicative—they're self-reinforcing. Popular people attract more popularity simply because they're already popular. Algorithms that surface trending videos, products, or songs push content that is already successful. This kind of feedback loop—known as preferential attachment—naturally produces highly right-skewed, power-law distributions.

When I first started plotting data—any kind of data—on user engagement, I was struck by how often these extreme right-skewed curves appeared. They looked like the chart below of [reviews per game on Steam](https://www.kaggle.com/datasets/andrewmvd/steam-reviews). Technically, both the reviews per game on Steam and the housing price data above are a mix of log-normal on the left, power-law on the right (I call it the [mullet](https://web.uvic.ca/~math-statistics/emeritus/wjreed/dPlN.3.pdf) of distributions). This happens because real data is multi-causal: multiplicative effects dominate in one regime, preferential attachment in another. The Steam data is just more dominated by power-law than housing prices are, likely because of the strength of the popularity dynamics I described above.

{{< steam-reviews id="steam" >}}

You can make preferential attachment appear in a simulation by simply making prior success increase the odds of future success. Make customers more likely to pick the company that already has a lot of customers. Allow the wealthy to reinvest their money in ways that they get preferential deals. In the simulation below I have an example of a distribution generated purely based on preferential attachment.

{{< generate-samples id="pa" type="preferential-attachment" >}}

The sigmoid, or S-curve, has a way of spontaneously appearing on its own. Start with exponential growth—your babies have babies, and theirs do too—and sooner or later a carrying capacity reins things in, bending the curve into a smooth logistic shape. A different route to a sigmoid is if your agents each have a normally distributed threshold: as the value rises, the cumulative number who cross that line climbs along a probit curve that looks much the same. This probit curve is what I demonstrate through simulation below.

{{< generate-samples id="sig" type="sigmoid" >}}

Getting these shapes to emerge naturally is key. When I'm building simulations, I never directly sample from these distributions. Instead, I code my agents so that, taken together, they arrive at those shapes honestly. I create the feedback loops that produce power-law distributions. I make processes multiplicative where they should be, and allow for multimodality by giving categories different generative properties.

### Time

When I worked at Snap, I could tell when holidays were happening without ever doing something as prosaic as checking a calendar. I'd just look at time-series charts of user engagement, split by region. If people started taking pictures at six or seven in the morning, it was a work or school day. If usage didn't spike until around 10 in the morning, it was a weekend or holiday.

Anyone who has looked at these time-series is familiar with the rhythms of real-data. For example, below is [daily demand for electricity](https://www.eia.gov/electricity/gridmonitor/) in California for the past three years. You can see the weekly rhythms plus the greater demand for electricity in summer. Summer strikes again with its many correlations.

{{< electricity-demand id="elec" >}}

Real data shows this rhythm for several reasons:

* You see it across a day because we sleep, work, and live as the earth spins and brings day and night.
* You see it across a week based on however your culture defines weekends and weekdays; Friday nights out, Sunday nights in.
* And you see it across a year, driven by that same sun: the seasons, and the layers we've added on top—holidays, festivals, school breaks, and all the rituals that divide our time into meaning.

In the visualization below, I multiply these temporal components—daily, weekly, and yearly—to approximate the kinds of cycles that appear in real time series. Conceptually, it's similar to seasonal–trend decomposition, where a signal is separated into trend and seasonal components for analysis or forecasting. The difference is that here I'm composing those cycles from the ground up rather than decomposing observed data.

{{< seasonality-vis >}}

I combine those cycles with holidays—which turn weekdays into weekends—and make them an integral part of the causal DAG that drives my agents. By giving the root nodes those rhythms and letting them propagate through the graph, the model naturally produces the kinds of correlated effects that trip people up—spurious patterns like, “Hey, I think ice cream causes murder!”

## Emergent Complexity

Now that we know what our data should look like, how do we achieve that without manually faking every data point? That sounds so complex!

It does. But we're in luck; we don't have to (and we shouldn't) code the complexity directly. We rely on it emerging. When programming our simulations, we can focus on just the primary generative mechanisms (with some added individual-level truly random noise), and generate an overall more complex simulation with very simple individual-level rules.

The fact that complexity can arise from simple rules is well established. Boids is the classic example: three simple rules—steer away from crowds, move with the flock, and head toward its center of mass—produce beautifully realistic flocking behavior. That's always the goal: rich, organic behavior that feels real but emerges from simple, understandable rules. Try adjusting the relative strength of those three simple rules in the simulation below; you can see the mix of effects that emerge.

{{< boids-vis id="boids" >}}

My agents are generally utility-driven; each agent has a utility function that it tries to maximize at every step. Individually, they're single-minded and unintelligent, and if I relied on any one of them alone, the simulation would quickly collapse into some pathological or divergent behavior.

To avoid that, I build a range of intentionally simple strategies. One set of agents repeats whatever was most profitable in the past; another acts randomly; another imitates whatever has been most popular recently.

What I've discovered over years of building these systems is that when I combine many such agents—each using different but simple heuristics—the overall system becomes surprisingly robust and often appears intelligent. It's a form of the wisdom of the crowds: a collection of uncorrelated, naïve guesses can, when aggregated, produce remarkably accurate behavior.

I create balance in the system without hard-coded limits by putting agents in tension with one another. As an example, I have a simple predator-prey simulation below: the prey eat grass, predators eat the prey. When there are too many prey, the grass thins and predators thrive; when there are too many predators, they starve. The system naturally ebbs and flows as everyone does their part to keep it in rhythmic balance. You can play around with the levers to see if you can make the system stay in balance without the ecosystem collapsing.

{{< ecosystem-vis id="ecosystem" >}}

I usually introduce some form of survival of the fittest to stabilize things. I'm not afraid to let agents die if they can't achieve their utility, but I'm always spawning new ones. When new agents appear, they mutate off the strategies of the successful ones. Winning strategies get copied (with variation), and the rest die off.

Over time, the system reaches a kind of equilibrium. I never expose day zero of my simulations; things are too weird then, too obviously hand-tuned. Instead, I let the world run for a while and settle; I let the genetic algorithms do their thing. I graph everything, check the curves, adjust the balance. For many processes, I already have strong expectations on what everything should look like, because I've seen the equivalent real data many times over. When I haven't, I search through papers and what real data I can find to see the real curves so I can ensure my simulation matches the same generative spirit. It is less pure engineering than gardening. I tend to my simulation as much as I build it. 

I'm showing all of these inputs largely independently, the fun really happens when I combine all these fundamentals into a single simulation.

Is that really it though? Perhaps, there is still some ineffable element that is still necessary to make it all work in the classroom. Or maybe it isn't ineffable, we simply don't like to describe serious things using words like play, love, and wonder? I spend so much time on these simulations because it is fun. It is creative. It is a chance to build a world you can share with others to explore in.

I take the same leap of faith when building simulations that I do when teaching. All the necessary elements are put into place with great care. You can't prove ahead of time what result will happen. Observation takes priority over control, nudges over micromanaging. It is more about the system you've created for learning than it is about you. And the greatest joy is the pleasant surprise of what emerges.
