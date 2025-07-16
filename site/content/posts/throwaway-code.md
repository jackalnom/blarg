---
author: Lucas Pierce
title: "Throwaway Code: A Love Story"
date: 2013-09-28
categories: ["Web/Tech"]
tags: []
---

> **Throwaway Code**  
> THrōəwā kōd  
> *noun* -  Code that is written to launch a feature early, but will later be deleted either due to a future feature or a new process.   
> The BonnyCode Dictionary of Software Terms

Not every love story is the same. There is the classic story of love at first sight. The love that feels destined and obvious from the very first moment. Source control was that way for me. I didn't always use source control (gasp!), but I never went back once I did.

I didn't always love throwaway code. I may have occasionally flirted with throwaway code's prettier cousin, the prototype, but I wouldn't be caught dead with throwaway code. Today though? Throwaway code is one of the most powerful tools for a software developer. If I was on a desert island, and I was for some reason forced to do software development on that island, and for some reason I was limited in what abstract concepts I could take with me to that desert island, I would take throwaway code. And I would take long, romantic, moonlit walks on that beautiful desert island beach with throwaway code.

How did I go from hating throwaway code to being soul mates? Throwaway code is so important because it is what makes iterative software development possible. The reason throwaway code is unappreciated, even in this age of Agile development, is because people don't understand what it means to develop iteratively. Scientists have classified 3 stages of iterative development:

**Stage 1: Pretending**

> When most teams first try scrum (aka Agile with training wheels), they take a surface level approach to the process. They pick some short iteration cycle, 1-week, 2-weeks or a month. Strangely, nobody ever picks 3-weeks. Anyways, they then run the same process they always did, they just associated the work with whatever iteration is in flight. For example, a sprint planning meeting will go something like this:
>
> “What are you working on this sprint?”
>
> “We are first working on testing the new Bear Translator functionality developed in the last sprint. We are then finishing up coding on the Bear Imagine functionality that we started two sprints ago but got delayed.”
>
> In the pretend stage of iterative development, iterations are treated more like time labels for when work occurred and a way of determining how often to have meetings to discuss what to work on. The work itself isn't driven by the iterations though.

**Stage 2: Done Done**

> Teams advance from the pretending phase of iterative development to the done done phase. This phase is characterized by the following exchange occurring several times a sprint:
>
> “Is the Bear Translator done?”  
> “Yes”  
> “Is it done done?”  
> “No”
>
> This makes up for the failings of the pretend stage by emphasizing that the goal is to finish work inside of the sprint boundaries. It enforces a good discipline on the team to finish features. There is a heavy emphasis in this stage on time-boxing. Unlike the previous stage, the time-boxed sprint becomes the main driver for how work is broken up and assigned.

**Stage 3: Customer Use**

> The final stage of iterative development moves from the frame of reference away from time-boxes towards minimizing the time before a customer gets value from the software. A typical exchange follows:
>
> “The Bear Translator feature is finished! Let's party!”  
> “That's great, how many people have used it?”  
> “Nobody, we don't have a UI for interacting with it yet. We've only deployed the backend work.”  
> “Party is over everyone, the feature isn't actually finished.”  
> <collective groan, people throwing red plastic cups at the developer for being lame>
>
> This stage emphasizes building the minimal customer-valuable feature and then iteratively building on that to provide more value. The training wheels are off at this point and the sprint time-boxes are no longer necessary. The discipline learned from progressing through Stage 2 is useful at this point though because the emphasis needs to remain on finishing features.

Most software teams are stuck somewhere between stages 1 and 2 of iterative development. Throwaway code appears as waste in these first two stages. If total value of a feature is measured as a typical manufacturing formula (Total Value = Manufacturing Rate \* Value of Good), then any code that is thrown away is a loss on the expected total value. The secret to iterative development comes down to one concept. And it has little to do with the time-value of money or economic order quantities.

The reason why iterative development is important is because s**oftware requirements aren't known until the software is used by customers.** I no longer say this phrase around experienced developers because it provokes an uncontrollable reaction to tell me war-stories about just how true it is. The period between software development and customer use is when software can go off track. The smaller you make the cycle between the two, the more likely you are developing the right thing. These constant checkpoints make sure you are pointed in the right direction.

To get an intuitive sense of just how critical this is, you can try the following experiment at home. Get in your car (a bike will also work) and drive to a part of town you've been to before.

First, to simulate non-iterative software development: while driving, close your eyes for 1 minute and open them for minute, then close them for a minute, etc. You'll find that when your eyes were closed, you probably ran into a building, ran stop lights, endangered many lives including your own.

Second, if you are still conscious, simulate iterative software development: while driving, close your eyes for 1 second, then open them for 1 second, etc. Despite your eyes being closed for the same amount of time as in the first example, you likely never ran off the road and, if you did hit someone, you probably meant to do it.

This is the difference between iterative development and non-iterative development. You know that you are on track because you are getting constant feedback. And you are getting that feedback where it matters, from the people that will use your software. Iterative development is so critical to staying on track that I will write copious amount of throwaway code to make iterations short. The ironic thing is, the people that avoid throwaway code end up writing the most in the end. They just do it unintentionally because they write large amounts of code that never gets used because their feature was off-track from the beginning.

I love writing throwaway code because it is this beautiful launch vehicle to get the code I want to last out there and used immediately. When I actively make the decision to write it, I know there is a good chance I'm on the right track.