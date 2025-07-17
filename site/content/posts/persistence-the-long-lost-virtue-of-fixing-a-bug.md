---
author: Lucas Pierce
title: "Persistence: The long lost virtue of fixing a bug"
date: 2008-11-23T18:12:12
categories: ["Career & Professional"]
tags: ["debugging", "persistence", "skill-development"]
---

The heights by great men reached and kept  
Were not attained by sudden flight,   
But they, while their companions slept,   
Were toiling upward in the night.  
*-- Henry Wadsworth Longfellow*

You're working on a difficult bug. A strange log message showing that your program fails every once in a while. Looking at your watch you see you've already been working on it for half an hour. You put the bug back on the router thinking to yourself maybe someone else will have better luck. And then a man from the future appears behind you... oh never mind I won't subject you to that torture [again](/posts/do-not-fix-what-you-dont-understand/).

[![Developer_bug_conversation](/bug2hard.png)

If you are like most software developers you've been in the situation above. Maybe instead you mark the bug as "Cannot Reproduce" or you instead assign it to your resident expert. Regardless of the means you use to escape from fixing the bug, you are dodging an important opportunity. This is normally when I start hearing the excuses. The bug is too hard. Someone else could fix it sooo much faster. There are too many bugs to waste time on just one. Forget the excuses, it is worth it both to you and the product you are creating. Oh let me count the ways.

1. You are actually learning something deep about the technology you work with. Sure the first time you are learning something you are slow. Really slow. But you are learning. You are dissecting the technology and learning how it really works. In the future with this deep knowledge you will be able to quickly solve problems. You are increasing your skill set as a developer which is good for the company you work for now and for your future marketability later. See Figure 1 below.
2. You are wasting the time you spent getting up to speed on the problem. You pick up the bug, spend 30 minutes and then put it back on the router. The next person picks it up, spends 30 minutes and then puts it back on the router. yadda yadda. This is a huge waste of everyone's time. The same if you mark it as cannot reproduce, but instead you are wasting the time of the customer or testers and then more developers later when they bring up the bug again in a new form.
3. Not only is the bug noise on the router, it is also noise in the logs (hopefully you do have some means of tracking errors from your system). It is a common tradition in too many software shops to have their set of ignorable errors that just seem to happen and nobody really knows why but they seem fairly harmless so nobody fixes them. Not to say people didn't try, I'm sure at least 5 people spent their 30 minutes on trying to fix it. Noise in the logs is not a good thing though. It could actually be a problem that will only manifest itself at an inopportune time. Even if it is genuinely harmless, it is still one more thing for humans to mentally parse and ignore and distracts away from seeing the real bugs.

[![Figure1](/figure1.png)
  
At this point you maybe be telling yourself "Great I'm going to fix all the bugs". Look a null pointer exception, all I need is a little if statement null check and I'm good.

**Hold On!**

Resist the urge to cut off the investigation early. Fixing the symptoms of a bug is NOT fixing the bug. Why is that variable null? Is it supposed to be nullable even? You must find the root cause even if it takes you 10 or 20 times longer. Treat the bug as if it was a memory corruption bug. You can try treating each of the various symptoms of the memory corruption and varied they will be. Or you can hit that one spot where it is actually occurring and fix it for good.

The trade off is really this, you can either spend 2 days going deep, really understanding how something works and understanding the core of the issue, or you can spend the next month making tiny one off fixes that treat just the symptoms. In the end sticking with it and finding the real problem is 95% of the time more cost effective than just treating the symptoms. And speaking from experience, it is much more gratifying as well. Figure 2 shows a comparison between fixing the root cause and just fixing the first symptom you can patch over.  
[![Figure2](/figure2.png)

Persistence does not equal stupidity. Banging your head against a problem and making no progress is not persistence anymore than running on a treadmill is a form of transportation. Well... [not normally at least](http://www.heavy.com/video/61095). I see lack of persistence as the biggest thing that holds people back, but many people don't even know how to go about fixing the hard problems. It is a skill and I could go on about divide and conquer, how to actually use google and a million other tidbits. As an honest to goodness skill though, my best advice is to pair up with the best, most knowledgeable bug fixer you know. Who is the developer that ends up actually fixing the really hard problems when they come up? Tackle a really hard problem with them. When you get stuck on a really hard bug, don't give up, but do ask for advice explaining your progress so far. Don't ask them to do the work for you, but do ask for pointers on where to look next. Often times you'll find the act of just explaining what you've discovered will lead you to the solution on your own.

Remember this. Any script kiddie can copy and paste some code, tweak some values and get a system they barely understand to kinda work. If you want to distinguish yourself as a software developer, work to truly understand the system you are building, don't shy away from the difficult problems and don't stop until you really know what is going on.

