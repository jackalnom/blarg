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

When I transitioned from industry to teaching, the biggest gap I sought to close was the disconnect between the problems students face in class and the actual challenges I saw in the real world.

Too often, I saw new-grads who only had exposure to toy problems that bear only a passing resemblance to what makes technical work difficult. In the wild, solving a technical problem is a cycle:

1. **Formulate:** Translate an unbounded, ambiguous real-world situation into a technical problem.
2. **Solve:** Execute the technical solution.
3. **Interpret:** Evaluate whether your solution actually solved the problem.

Even when toy problems attempt steps 1 and 3, it is often just a sort of thinly wrapped pseudo-context. There isn’t enough noise. There isn't enough mess. It is painfully obvious what technical thing needs to be done.

LLMs have significantly exacerbated this problem in the classroom. Step 2—the “doing”—is now often solvable with a copy and a paste. In the same way calculators solved the “how do I perform arithmetic on these numbers” problem, but didn’t solve the “how do I turn my problem into something I can plug into a calculator” issue. If we only teach Step 2, students aren't just working on problems that don’t match the real world; they aren’t building any fundamental skills at all.

My answer to this problem has been making the classroom look more like the real world through simulation.

## Why Simulation?

I’ve always loved simulation-style games. Ever since playing the gold-cartridge *Legend of Zelda* on the NES, I’ve been fascinated by the idea that the little characters in those worlds might have lives of their own—that they might keep moving even when the player isn’t looking.

That notion is the seed of my classroom simulations: worlds that run on their own, where students must reason about living systems rather than static puzzles.

My first classroom simulation-game came out of a databases course. Early on, I realized students weren’t really feeling what it meant to run a production system: the pressure, the messiness, the human factors. Software without customers is sterile. But software that serves a live world, with people depending on it, becomes something else entirely—unpredictable, alive, and worth thinking about. The kind of thing that breaks at 3 a.m.

* Teaching concurrency errors: Let students run into them naturally. As “customers” fire off parallel calls that collide in unpredictable ways, things break. Sorry your inventory is out of sync. You had a lost update. The week after, when we lecture on transactions, you are excited when it solves your problem.
* Teaching design principles: Let students debug the chaos of a mutable, update-in-place system, then guide them toward architectural patterns that reduce that pain—immutability, append-only logs, and systems designed for observability and debugging. That’s how many experienced developers come to care about those principles: not from theory, but from scars.

Teaching SQL is one thing. Teaching the principles behind real systems is much harder without first letting students experience the pain, then walking them through how we solve it.

This is even more critical when teaching data science. In my *Knowledge Discovery* class, students build recommendation engines, churn detectors, and user personas. Simulations are foundational here because of the counterfactual: for a recommender, how do you know if it’s any good without knowing what would have happened if the person was shown one piece of content vs another?

The reality, as I know all too well, is that offline evaluation metrics often fail to capture what only reveals itself in a live, online test. A simulation is the best way I can bring that messy complexity into the classroom.

## How I Build Simulations

My goal when designing a simulation is for it to mimic the real-world in the ways that matter. It has to feel real, even when the subject matter of the simulation is obviously fantastical. For my purposes, I build worlds full of adventurers, potions, and dragons. But the data feels real otherwise.

Fake data often looks fake to me.

If I roll a fair hundred-sided die a million times and plot the results, I will get (if I stand back a bit) a nicely flat line: a uniform distribution. But if I ask a million people to give me a random number between 1 and 100, the shape will be very different. Some numbers—like 7, 37, and 77, which feel random—will peak. So will 42 (*thank you, Hitchhiker’s Guide fans*). And, sadly, so will 67, due to brainrot.

You can tell, just by the shape in this case, that the “random” numbers weren’t truly random.

There are three ways fake data tends to give itself away:

* Correlation: Real data is a web of interesting, interconnected correlations of varying degrees. Fake data tends to be either completely independent or perfectly correlated, at best maintaining simple pairwise correlations without the complex conditional dependencies of real life.

* Shape: Real data has the right shape for its process. Fake data doesn’t.

* Time: Real data has rhythm—trends, seasonality, cycles. It’s influenced by the sun, the moon, and the messy patterns of human life.

### Correlation

Did you know that ice cream and violent crime are [correlated](https://www.sciencedirect.com/science/article/abs/pii/S0095069613001289)? I asked my students this question, and one response was, “well obviously, crime is hard work and you need to treat yourself afterwards.” Hmmm… moving on.

{{< ice-cream-murder id="icecream" >}}

Why are they correlated though? We’ve all heard the phrase *correlation does not imply causation.* When we say that, we mostly mean *direct causation*. What’s happening here is that both violent crime and ice cream consumption rise during the summer months—the confounder is the season.

If we accept that our highly correlated world results from a web of causes—“this causes this, which causes these two things, and then those in turn cause others”—we can use that fact as the foundation for natural-looking correlations.

I draw upon [Judea Pearl’s causal directed acyclic graphs (DAGs)](https://www.jstor.org/stable/2337329) to make this happen. I draw out my causal graph, giving each effect multiple causes, often layers-and-layers deep.

For example, in the interaction below, we can see a classic case of confounding illustrated using a DAG. **A** could be ice-cream consumption, **C** could be violent crime, and **B** could be season (the confounder). You can see in the scatter plots how **A** and **C** become correlated even without any direct causal link.

{{< dag-vis id="dag" structure="confounded" >}}

This is all too neat though if we actually let students see all of this. The real world is like [the blind men and an elephant](https://en.wikipedia.org/wiki/Blind_men_and_an_elephant) from the *Tittha Sutta*. One blind man feels the trunk and says “It’s a snake!” Another feels a leg and says “It’s a tree!” Yet another feels the tusk and says “No, you fools, it’s a giant spear!” Each has only a partial view of the underlying truth.
I build my “elephant” by creating a large causal DAG that naturally produces realistic correlations, but I only expose a small selection of mostly terminal nodes, and often in opaque and subtle ways.

Real data is not limited to linear correlations. This happens for various reasons, but a common one is diminishing returns. In most systems, the first few inputs change everything, and every one after that matters a little less. In a messaging app, the first friend who texts you makes the app come alive. Each additional friend adds some pull, but your 100th friend matters a lot less than your first or your tenth--you only have so much attention to give. Economists call this diminishing marginal utility: each new unit yields a smaller gain than the last. The same curve shows up in learning, social networks, and even marketing spend. It’s what gives real data its characteristic bend—rising fast, then flattening as systems run into limits.

{{< diminishing-returns id="diminishing" >}}

Real data is littered with selection biases; the data we have is not representative of the overall population but is biased in one way or another. It is important for our simulated data to have similar selection biases. For example, [a hospital in Canada](https://onlinelibrary.wiley.com/doi/pdf/10.1111/joim.12363) noticed when analyzing bicycle accidents at the ER, wearing a helmet was correlated with having a concussion and you were 52% more likely to have a serious injury compared to not wearing a helmet. That seems wrong? This is a case of a specific selection bias called a collider bias (or Berkson's paradox). The hospital isn't seeing all bike riders and all bike accidents. They don't see all the cases where a bike rider is wearing a helmet and that helmet saved them from going to the ER. As a result, the helmet effectively filtered out lower-end accidents leaving only the more serious accidents for the ER.

You find this pattern all the time when doing data analysis. You see a study on what it takes to make a successful startup, but they only look at the ones who made it, not the ones that died out. You analyze active users and forget the ones who churned. The data you have is conditioned on having survived long enough to be recorded. It’s a kind of selection echo: the world you see isn’t the world as it is, but the world that lasted.

In the simulation below, I show how food quality and location can become inversely correlated, even if they start out completely independent. This happens because survival is a filter: a restaurant can survive with bad food if it has high foot traffic (a tourist trap), and it can survive in a bad location if the food is amazing. But if it has bad food and a bad location, it goes out of business and disappears from the dataset. We only see the survivors.

{{< berkson-paradox id="berkson" >}}

The end result is wonderfully correlated and messy data that feels real and is more fun to work with.

### Shape

I've long been fascinated by the beautifully smooth shapes that data makes when generated at scale. Not just systems, but data that is based on human behavior. I had once assumed just because individual humans are so complicated, so individual, so hard to predict individually, that a bunch of humans should be exponentially more complicated to predict. But it is in fact the opposite. When you get lots of people, all the individual differences wash out, and what you are left with is the smooth underlying generative mechanisms that underlie their common behavior.

Most people are familiar with the bell curve or normal distribution. Plot human height and you’ll get something roughly normal. Human height follows this pattern because it’s the sum of many small, independent effects: genes, nutrition, environment. But it’s not perfectly normal; the curve’s a bit too flat and wide. It’s multimodal, a blend of overlapping distributions. Split by gender, and each group looks much closer to a proper bell curve.

{{< height-distribution id="height" >}}

Roll a bunch of dice, **add** them up, and you’ll get the same shape; that’s the central limit theorem at work. When I see a bell-curve I see a process that has a bunch of uncorrelated randomness that is being added together. In the simulation below, try running it and seeing how as you add more samples it gets closer and closer to a smooth normal distribution.

{{< generate-samples id="clt" type="normal" >}}

Most of the data I’ve worked with doesn’t follow a normal distribution. Systems and people rarely follow additive processes. They are more commonly multiplicative and/or full of feedback loops—both of which create long right tails.  [Housing prices](https://unece.org/fileadmin/DAM/stats/documents/ece/ces/ge.22/2010/zip.36.e.pdf)
 are generally right-skewed, largely because each property’s value grows through a chain of proportional effects: land value, size, location premiums, amenities, and market appreciation all compound on top of one another. Small percentage differences in these factors multiply rather than add. This makes the main body of the distribution log-normal; it is log simply because log turns multiplication problems into addition problems. Remember, normal is additive, log-normal is multiplicative. For that reason, it is also common to look at these right-skewed distributions in log space, which you are free to try below.

{{< home-values id="homevalues" >}}

We can get something similar using our same dice rolling example. But this time, rather than adding the dice, we will multiply them together. 

{{< generate-samples id="log" type="lognormal" >}}

Many human systems aren’t just multiplicative—they’re compounding. The rich get richer because their money earns more money; popular people attract more popularity simply because they’re already popular. Algorithms that surface trending videos, products, or songs amplify these dynamics even further. This kind of feedback loop—known as preferential attachment—naturally produces highly right-skewed, power-law distributions.

When I first started plotting data—any kind of data—on user engagement, I was struck by how often those power-law curves appeared. They looked like the chart below of [reviews per game on Steam](https://www.kaggle.com/datasets/andrewmvd/steam-reviews). In practice, you often see a mix of log-normal on the left, power-law on the right (I call it the [mullet](https://en.wikipedia.org/wiki/Mullet_(haircut)) of distributions). 

{{< steam-reviews id="steam" >}}

It’s surprisingly easy to make preferential attachment appear in a simulation: you simply make prior success increase the odds of future success. Make customers more likely to pick the company that already has a lot of customers (maybe even just because they know someone who is already a customer of the company). Allow the wealthy to reinvest their money and get a return on their investment. And let them use that wealth to get preferential deals or achieve economies of scale. In the simulation below I have an example of a distribution generated purely based on preferential attachment.

{{< generate-samples id="pa" type="preferential-attachment" >}}

The sigmoid, or S-curve, has a way of spontaneously appearing on its own. Start with exponential growth—your babies have babies, and theirs do too—and sooner or later a carrying capacity reins things in, bending the curve into a smooth logistic shape. A different route to the same S appears if your agents each have a normally distributed threshold: as the value rises, the cumulative number who cross that line climbs along a probit curve that looks much the same.

{{< generate-samples id="sig" type="sigmoid" >}}

Getting these shapes to emerge naturally is key. When I’m building simulations, I never directly sample from these distributions. Instead, I code my agents so that, taken together, they arrive at those shapes honestly. I create the feedback loops that produce power-law distributions. I make processes multiplicative where they should be, and allow for multimodality by giving categories different generative properties.

### Time

When I worked at Snapchat, I could tell when holidays were happening without ever doing something as prosaic as checking a calendar. I’d just look at time-series charts of user engagement, split by region. If people started taking pictures at six or seven in the morning, it was a work or school day. If usage didn’t spike until around 10 in the morning, it was a weekend or holiday.

Anyone who has looked at these time-series is familiar with the rhythms of real-data. Below is [hourly demand for electricity](https://www.eia.gov/electricity/gridmonitor/) in California in October 2023.

{{< electricity-demand id="elec" >}}

Real data shows this rhythm and seasonality for several reasons:

* You see it across a day because we sleep, work, and live as the earth spins and brings day and night.
* You see it across a week, however your culture defines weekends and weekdays; Friday nights out, Sunday nights in.
* And you see it across a year, driven by that same sun: the seasons, and the layers we’ve added on top—holidays, festivals, school breaks, and all the rituals that divide our time into meaning.

In the visualization below, I multiply these temporal components—daily, weekly, and yearly—to approximate the kinds of cycles that appear in real time series. Conceptually, it’s similar to seasonal–trend decomposition (like STL), where a signal is separated into trend and seasonal components for analysis or forecasting. The difference is that here I’m composing those cycles from the ground up rather than decomposing observed data.

{{< seasonality-vis >}}

I combine those cycles with holidays—which turn weekdays into weekends—and make them an integral part of the causal DAG that drives my agents. By giving the root nodes those rhythms and letting them propagate through the graph, the model naturally produces the kinds of correlated effects that trip people up—spurious patterns like, “Hey, I think ice cream causes murder!”

## Emergent Complexity

Now that we know what our data should look like, how do we achieve that without manually faking every data point? That sounds so complex!

It does. But we’re in luck; we don’t have to (and we shouldn’t) code the complexity directly. We rely on it emerging. When programming our simulations, we can focus on just the primary generative mechanisms (with some added individual-level truly random noise), and generate an overall more complex simulation with very simple individual-level rules.

The fact that complexity can arise from simple rules is well established. Boids is the classic example: three simple rules—steer away from crowds, move with the flock, and head toward its center of mass—produce beautifully realistic flocking behavior. That’s always the goal: rich, organic behavior that feels real but emerges from simple, understandable rules. Try adjusting the relative strength of those three simple rules in the simulation below; you can see the mix of effects that emerge.

{{< boids-vis id="boids" >}}

My agents are generally utility-driven. They have a utility function they’re trying to greedily maximize over time. They’re single-minded, simple, sometimes stupid, but consistently so. Stupid agents make for smart systems, as long as their stupidity is sufficiently diverse and independent. It is the same power you get from wisdom of the crowds; uncorrelated dumb guesses when aggregated together can create surprisingly accurate guesses.

I create balance in the system without hard-coded limits by putting agents in tension with one another. Think of a predator–prey simulation: the prey eat grass, predators eat the prey. When there are too many prey, the grass thins and predators thrive; when there are too many predators, they starve. The system naturally ebbs and flows as everyone does their part to keep it in rhythmic balance.

{{< ecosystem-vis id="ecosystem" >}}

I usually introduce some form of survival of the fittest to stabilize things. I’m not afraid to let agents die if they can’t achieve their utility, but I’m always spawning new ones. When new agents appear, they mutate off the strategies of the successful ones. Winning strategies get copied (with variation), and the rest die off.
Over time, the system reaches a kind of equilibrium. I never expose day zero of my simulations; things are too weird then, too obviously hand-tuned. Instead, I let the world run for a while and settle; I let the genetic algorithms do their thing. I graph everything, check the curves, adjust the balance. It feels less like engineering and more like gardening, an organic process. I tend to my simulation as much as I build it.

That’s it; mostly... I'm showing all of these inputs largely independently, the fun really happens when I combine all these fundamentals into a single simulation.

I keep the agents simple and let their interactions produce the messy, rhythmic complexity I’ve seen in the real world. When students engage with these living systems, they stop treating data as just numbers for homework and start treating it as traces of a world to be discovered. They learn to formulate problems from ambiguity, interpret messy results, and build resilience—the real, fundamental skills that no AI today can simply solve for them. Sparking that curiosity is the most real lesson I can hope to teach.