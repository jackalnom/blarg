---
author: Lucas Pierce
title: "Ninety Percent Confident"
date: 2008-08-24T21:38:25
categories: ["Career & Professional"]
tags: ["estimation", "confidence", "professional-skills"]
---

I know nothing except the fact of my ignorance.

-- Socrates

Too many good software developers are limited by their poor estimation abilities. Take the story of Bert & Ernie. Bert & Ernie are pretty much identical in terms of programming ability. Put them in a programming contest and they are neck and neck. Bert regularly underestimates the amount of time his software projects will take while Ernie always beats his estimates with a slight bit of room to spare. Management sees Bert as either slow or just unfocused. Ernie on the other hand is a speedy professional programmer that can be trusted with the mission critical projects. I can think of few technical skills a software developer could learn that would better help their career than becoming a proficient estimator. The really amazing thing is, compared to most of what we do, the estimation asked of individual software developers is mostly about knowing your own limits.

When Socrates was told that the Oracle of Delphi proclaimed him the wisest man in Athens, he made it a goal to prove of the Oracle wrong by finding someone wiser. When Socrates questions those who are known for their wisdom on their knowledge he found that they didn't have the knowledge and wisdom that they pretended to. In the end Socrates found that he was the wisest in Athens, not because he knew the secret to life but because he knew the limits of his own knowledge.

How poorly most people understand their limits is well illustrated in [Software Estimation: Demystifying the Black Art](http://www.amazon.com/Software-Estimation-Demystifying-Practices-Microsoft/dp/0735605351) by Steve McConnell. In a study, people are presented with 10 quiz questions on a variety of subjects such as the surface temperature of the sun or the worldwide box office receipts for Titanic. They are asked to provide a 90% confidence range for each question. In theory, most people should get 9 out of 10 questions right. In reality, the average number of correct answers was 2.8. It shouldn't really matter if you have a good understanding of the domain, all you have to do is widen your range enough to compensate for you lack of knowledge. And yet, pretty much everyone is naturally resistant to doing this.

For instance let's say that I know very little about the surface temperature of the Sun or about temperature in general. When asked to get to a 90% confidence range for the surface temperature of the sun, I might have to reasonably answer 0 F to 1 billion F to get to a highly confident answer. That seems like both an absurd answer and like I'm not even trying. The problem is most people will tighten up their answer beyond the limits of their knowledge. Thus you end up with 90% confidence intervals for the surface temperature of the sun that consist of answers like 1000 F to 2000 F when it is actually 9980 F.

There is some truth to our natural reaction about giving too wide of a range though. Telling your boss that your software feature will take you sometime between 1 day and 3 years will probably make your boss start to question why they hired you. This is natural considering that an estimate that wide is fairly useless when doing a cost benefit analysis on a feature or in attempting to create a schedule. You absolutely must resist the urge to provide a guess that goes beyond the limits of your knowledge though. Instead, ask for time to create a prototype or to do research and say that you can give a useful estimate once it is complete.

This doesn't mean you should ask to research every single estimate you give either. If you are 90% confident you can deliver a feature in 1 to 2 weeks, just say 2 weeks and call it done. The key is make sure that the estimate is actually something you are 90% confident in. If the last time you had a similar feature you ran into a multitude of problems, provide an estimate assuming that similar problems occur this time. Don't listen to the Optimism Angel on your shoulder that tells you that everything is going to go smooth and that you are finally going to be the super fast programmer you always dreamed of being. Always look at past features you have written and compare the feature being estimated with those.

There is a lot more to software estimation than what I have covered here. One of my favorite new estimation techniques is [Planning Poker](http://en.wikipedia.org/wiki/Planning_poker). For the individual software developer doing feature estimation though, most of what you need is just figuring out 90% confident estimates.

**Related posts on estimation:**
- [I'm back and I hate your estimates](/posts/i-hate-your-estimates/) - Introduction to the problems with software estimation
- [How feature estimates killed Bobo](/posts/feature-estimates/) - How estimates destroy productivity through misguided accountability
- [Cost benefit analysis for bear lovers](/posts/cost-benefit-analysis/) - Problems with using estimates for cost-benefit analysis