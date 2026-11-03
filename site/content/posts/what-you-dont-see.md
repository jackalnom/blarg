---
author: Lucas Pierce

title: "What you don't see"

date: 2026-11-03

description: A simulation-driven exploration of selection bias and how the information we don't see shapes what we think we know.

tags: ["data science", "teaching"]

---

Decades ago, I took a test in a statistics class that included a version of the classic Monty Hall problem. You might know it: a game show host presents three doors. Behind two are goats, and behind one is a car. You pick a door, the host knowingly opens one of the other doors to reveal a goat, and you're asked whether it makes sense to switch.

But as I remember it, my exam had one important difference. It said the host opened a door *randomly*, rather than deliberately choosing one with a goat. I interpreted that to mean the host might accidentally reveal the car. I thought my teacher was being tricky, intentionally giving us a variation on the classic problem. I worked through the possibilities and concluded that if the host opened a door randomly, and happened to reveal a goat, switching would give you a 1 in 2 chance of winning, rather than the traditional 2 in 3.

When I got my test back the following week, I'd received a zero on that question. My teacher had simply marked the correct answer as 2 in 3. I asked whether the addition of the word "randomly" changed how we should interpret the information revealed by the host. They said no.

The question nagged at me. I'd never been particularly focused on grades. I wanted to pass my classes, but between working and participating in speech and debate, I often didn't even turn in my homework. This was different, though. What bothered me wasn't the grade. It was that I didn't understand why I was wrong.

So I went home and tackled the problem the way I knew how. I wrote a small simulation, what I'd now call a Monte Carlo simulation. First, I coded the traditional version of the problem and confirmed that switching won 2 out of 3 times. Then I wrote a version where the host didn't know where the car was and randomly opened one of the remaining doors. I discarded the games where the host accidentally revealed the car, keeping only those where he'd revealed a goat.

To my surprise, switching now won half the time.

I double-checked my code and looked again at the wording of the question. I wasn't wrong, at least if my assumptions were correct. It felt like one of those apocryphal stories I used to hear on AM radio as a kid, where a brilliant child disagrees with their knowledgeable teacher, and that child turns out to be Albert Einstein.

I was excited to show my teacher the results. I'm not sure what I expected. I just thought they'd find what I'd discovered as interesting as I did.

That's not the reaction I got. My teacher had no interest in the simulation and simply repeated that the answer was 2 in 3.

Looking back, I still think it's entirely possible I was wrong. There may have been something else in the wording of the problem that I'd missed. It seems unlikely that a statistics teacher would misunderstand something like this. Or maybe they did. Even the best of us have bad days.

But the important part of the story, at least for me, was never whether I was right or wrong. It stuck with me because it was the day I fell in love with statistics and simulation. I loved the idea that you could reason your way to an answer from first principles, then check yourself by encoding your assumptions in a simulation and watching it all play out.

When I think of statistics, I naturally think of play. And that's what I want to share with you.

## Probability by counting

I grew up in a family of casual gamblers, and I've always loved dice games. In kindergarten, I once filled out one of those "what I like to do" assignments by drawing a picture of myself throwing dice, with "CRAPS" written in big letters above it. I remember my mom being embarrassed, not because I was playing craps, but because she worried the teacher would think I was swearing.

If you've played much craps, you probably already know the probability of rolling a seven. But if you don't, it's surprisingly easy to figure out.

We count the outcomes we want and divide by all possible outcomes. This works when the outcomes are equally likely, as they are with two fair dice.

Let's start by listing all the possible combinations:

```
1,1  1,2  1,3  1,4  1,5  1,6
2,1  2,2  2,3  2,4  2,5  2,6
3,1  3,2  3,3  3,4  3,5  3,6
4,1  4,2  4,3  4,4  4,5  4,6
5,1  5,2  5,3  5,4  5,5  5,6
6,1  6,2  6,3  6,4  6,5  6,6
```

That's 6 × 6 = 36 possibilities. Of those, six add up to 7:

```
1,6  6,1  2,5  5,2  3,4  4,3
```

That gives us 6/36, or 1/6 (about 16.7%), for the probability of rolling a seven.

{{< dice-counting >}}

That's it. You're now calculating probabilities. The arithmetic won't get much harder than this. The tricky part is figuring out what to count, and what assumptions we're making when we count it.

## Flipping coins

Let's say you flip a coin twice. If I tell you the first flip was heads, what's the chance the second flip was also heads? Some gamblers will say "the coin is hot," but as long as the flips are fair and independent, the answer is 50%. Knowing the result of one flip doesn't change the probability of the next.

But what if, instead, we look only at pairs of flips where **at least one** was heads? What's the probability that both were heads?

Now the answer is 1/3. How can that be?

Consider the four equally likely outcomes:

```
HH, HT,
TH, TT
```

By looking only at pairs where at least one flip was heads, we've eliminated TT. That leaves HH, HT, and TH.

When I told you the first flip was heads, only HH and HT were possible. But "at least one" also includes TH. Now we have three equally likely outcomes, only one of which has two heads.

{{< coin-flips >}}

This illustrates something important about statistics, and about how we understand the world. Even when two events are independent, we can create statistical relationships between them simply by changing which outcomes we choose to look at.

How we select our data, and how that data comes to us, matters.

## Tuesday Boy Problem

Now let's apply this to the Tuesday Boy Problem, starting with a familiar variation:

> Mr. Smith has two children. The older child is a boy. What is the probability that both children are boys?

We'll assume that each child has an equal chance of being a boy or a girl, and that the sex of one child is independent of the other.

As with the coin flips, knowing the older child is a boy tells us nothing about the younger child. The answer is 50%.

Now let's make a small adjustment to the problem's framing:

> Mr. Smith has two children. At least one child is a boy. What is the probability that both children are boys?

Again, there are four equally likely possibilities:

```
BB, BG,
GB, GG
```

Knowing at least one child is a boy eliminates GG. That leaves three equally likely possibilities, only one of which has two boys. So the answer is 1/3.

Now for the classic version, where we also specify that the boy was born on Tuesday:

> Mr. Smith has two children. At least one child is a boy born on Tuesday. What is the probability that both children are boys?

This tiny change alters how we count the possibilities. If we consider all families with at least one Tuesday-born boy, the probability shifts from 1/3 to 13/27, or about 48%.

What's special about Tuesday? Nothing. We could say Monday, or a boy born in December.

Let's assume birthdays are equally likely to fall on any day of the week, independently for each child and independently of their sex. We now have 7 days × 2 sexes = 14 possibilities per child. For two children, that's 14 × 14 = 196 equally likely combinations.

Let's count how many of those combinations have at least one boy born on Tuesday.

If the older child is a Tuesday-born boy, the younger child has 14 possibilities. If the younger child is a Tuesday-born boy, that's another 14. But we've counted the case where both children are Tuesday-born boys twice, so we subtract one.

That leaves 14 + 14 − 1 = 27 possibilities.

Now, how many of those have two boys? If the older child is a Tuesday-born boy, the younger could be a boy born on any of the seven days of the week. The same goes if the younger child is the Tuesday-born boy. Again, we subtract the one case counted twice.

That's 7 + 7 − 1 = 13 possibilities with two boys, out of 27 total. So the answer is 13/27, or about 48%.

{{< probability-vis kind="children" >}}

The intuition is that families with two boys have two chances to produce a Tuesday-born boy, while families with only one boy have just one. When we filter for families with at least one Tuesday-born boy, we end up including proportionally more two-boy families.

{{< tuesday-families >}}

Now, here's an exercise for you.

Suppose instead that we meet a father, randomly select one of his two children, and ask him to describe that child. He tells us it's a boy born on Tuesday.

What's the probability that both his children are boys?

Think through why before revealing the answer below.

<details>
<summary>Answer</summary>

50%, for the same reason that knowing the older child is a boy born on Tuesday gives us a 50% chance that both children are boys. We've learned something about one randomly selected child, but nothing that changes the probability for the other child.

The difference between this and the 13/27 answer isn't simply the words "at least one." It's how we obtained the information. When we select families based on whether either child meets a condition, we're selecting from a different population than when we randomly choose one child and learn something about that child.

Same observation, different selection process, different probability.

</details>

## Berkson's Paradox

Thinking about these questions as brain teasers is, to me, the least interesting way to approach them. They become tricks you memorize rather than ideas that change how you think. These aren't riddles. They're ways of thinking about the information you receive, questioning where it came from, and making better decisions as a result.

And you've probably encountered this same phenomenon throughout your life without realizing it.

The Tuesday Boy Problem is an example of a broader phenomenon called **Berkson's paradox**. The children's sexes were independent to begin with, but selecting families based on whether either child meets a condition creates a statistical relationship between them within the group we're looking at. More generally, two things can be completely unrelated, but if they both influence what makes it into a group, they can suddenly appear related.

Think about restaurants in touristy areas. Times Square, or right next to the Eiffel Tower. When you see a restaurant in one of those locations, do you think, "Wow, they probably have great food there!"?

Probably not. But why? Does the Eiffel Tower give off some weird odor that spoils the food?

There's no inherent reason that a restaurant with a great location should have worse food. But imagine that, for a restaurant to survive, it needs either a great location or great food.

If a restaurant has a bad location and bad food, why would anyone go there? It will go out of business. A restaurant in a bad location needs good food to survive. A restaurant in a great location, on the other hand, can survive even if its food is mediocre.

Now, that's not to say location and food quality have nothing to do with each other in the real world. But even if they were completely unrelated to begin with, we'd still find a negative correlation among the restaurants that survived.

The restaurants that didn't survive are missing from our data. And because we've excluded them, good locations and good food appear to be negatively related, even though neither causes the other.

What we don't see can change what we think we know about what we do see.

## Is it true?

We live in a world where we have access to more information than ever before. And we've become increasingly concerned with whether that information is true. That's a good thing. Truth matters.

But truth isn't enough.

Imagine I show you twenty completely true stories about violent crimes committed around the world in the past week. What have you learned about whether crime is increasing or decreasing?

Almost nothing. You don't know how many crimes occurred this week compared with the same period last year, or how I chose which twenty stories to show you.

Newspapers have always had editors deciding which stories were newsworthy. Those decisions were influenced by what they thought was important, what would interest their readers, and, consciously or not, their own beliefs about the world.

I had a conversation about this recently. A visitor from out of town was reading our local newspaper and remarked, "Wow, you have a lot more traffic accidents here than back home in Los Angeles."

Maybe we do. But we're a largely rural area, while Los Angeles has far more news competing for attention. An accident that makes the news here might not even warrant a mention there. We can't tell how common accidents are in either place just by counting the stories in the newspaper.

Today, we have another layer. People create content they think will get attention, and algorithms select what to show us based on what we're likely to engage with. Nobody has to lie. Nobody even has to be deliberately misleading. But the things most likely to get our attention aren't necessarily representative of the world.

You can be told nothing but the truth and still be misled.

## Monty Falls

Let's return to the Monty Hall problem. In the classic version, the host knows where the car is and deliberately opens a door with a goat. Because the host always reveals a goat, you have a 2 in 3 chance of winning the car if you switch.

But the version of the problem on my test, or at least how I interpreted it, said the host opened a door *randomly*. The host might have revealed the car, but we're only looking at the games where he didn't.

Imagine playing 300 games. In roughly 100 of them, you initially pick the car, so the host is guaranteed to reveal a goat. In the other 200, you pick a goat, and the host has a 50% chance of accidentally revealing the car. That eliminates about 100 games, leaving us with roughly 100 games where you initially picked the car and 100 where you picked a goat. Among the games where the host revealed a goat, switching and staying are now equally likely to win.

What I love about this problem is that, from the perspective of someone watching a single game, the host has simply opened a door and revealed a goat. We observe exactly the same thing in both versions. But that observation doesn't carry the same information when the process that produced it is different. It's not just what we see that matters, but how it came to be.

{{< monty-piles >}}

I enjoy Bayes' theorem as much as the next guy, but sometimes I think formulas can make relatively simple ideas seem more mysterious than they are. The difficult part isn't always calculating the answer. It's figuring out what question we're actually answering, and what assumptions we're making along the way. What are we actually looking at? How was that information generated? And perhaps most importantly, what aren't we seeing?

An observation can be perfectly accurate and still be misleading. A correlation can be perfectly real and still tell us very little about what caused it.

Long ago, a tiny change in the wording of a test question made me question something I thought I understood. And I think that's still what I love most about statistics.

We don't have to choose between believing everything and doubting everything. We can learn to ask better questions. Where did our information come from? What might we be missing? Do the conclusions we're drawing actually follow?

The goal isn't to question everything for the sake of questioning it. It's to understand the world a little better.