---
author: Lucas Pierce
title: "Strictly Need to Know"
date: 2008-05-18T17:05:29
categories: ["Software Engineering"]
tags: ["information-hiding", "encapsulation", "security"]
---

One of the bedrock principles in software engineering is information hiding. The traditional idea behind information hiding is imagined in the context of a group of software developers. Each of these software developers is working on their module that will use and be used by the modules made by other software developers. Given that software development is messy, we want to be able to make changes/fixes/upgrades to our module even after our module is in use by other modules. A module developer thus applies the principle of information hiding to separate the more stable interface of their module from the less stable implementation details. Other modules can only see the interface and not the implementation details, which gives the module developer the freedom to change the implementation details after it has begun to be used by other module developers.

If this was still 1972 then the discussion could end here and we could all go back to writing that  payroll program on the company's UNIVAC 1108 like these two developers.

![Univac1108](http://www.bonnycode.com/photos/uncategorized/2008/05/18/univac1108_2.jpg "Univac1108")

archive.computerhistory.org

Today, in the year 2008, state of the art software development looks more like these two developers who are pair programming a new facebook app.

![Pair programming](http://www.bonnycode.com/photos/uncategorized/2008/05/18/pairprog.jpg "Pair programming")

WarGames, MGM

One of the first things you should notice is that today's developers smile a lot more than developers from the 70s. This is because programming in the 70s was boring and lonely. Everybody (not just software developers) was all secretive and into hoarding information. Government agencies had strict need to know policies which prevented information from being shared and real intelligence from being synthesized. It is no surprise that this environment spawned a software methodology like waterfall based on the premise of cleanly separated departments with well established hand off points and restricted communication.

The failings of this approach are evident across the board. The 9/11 Report offers a clear description of the problem.

> In each of our examples, no one was firmly in charge of managing the case and able to draw relevant intelligence from anywhere in the government,assign responsibilities across the agencies (foreign or domestic), track progress, and quickly bring obstacles up to the level where they could be resolved. Responsibility and accountability were diffuse.   
> The agencies cooperated, some of the time. But even such cooperation as there was is not the same thing as joint action. **When agencies cooperate, one defines the problem and seeks help with it. When they act jointly, the problem and options for action are defined differently from the start. Individuals from different backgrounds come together in analyzing a case and planning how to manage it.**  
> ...  
> In the 9/11 story, for example, we sometimes see examples of information that could be accessed—like the undistributed NSA information that would have helped identify Nawaf al Hazmi in January 2000.But someone had to ask for it. In that case, no one did. Or, as in the episodes we describe in chapter 8, the information is distributed, but in a compartmented channel. Or the information is available, and someone does ask, but it cannot be shared. **What all these stories have in common is a system that requires a demonstrated “need to know” before sharing. This approach assumes it is possible to know,in advance,who will need to use the information.** Such a system implicitly assumes that the risk of inadvertent disclosure outweighs the benefits of wider sharing. Those ColdWar assumptions are no longer appropriate. The culture of agencies feeling they own the information they gathered at taxpayer expense must be replaced by a culture in which the agencies instead feel they have a duty to the information—to repay the taxpayers’ investment by making that information available.   
> Each intelligence agency has its own security practices, outgrowths of the Cold War. We certainly understand the reason for these practices. Counterintelligence concerns are still real,even if the old Soviet enemy has been replaced by other spies.   
> But the security concerns need to be weighed against the costs. Current security requirements nurture overclassification and excessive compartmentation of information among agencies. Each agency’s incentive structure opposes sharing,with risks (criminal,civil,and internal administrative sanctions) but few rewards for sharing information. No one has to pay the long-term costs of overclassifying information, though these costs—even in literal financial terms— are substantial. There are no punishments for not sharing information. **Agencies uphold a “need-to-know” culture of information protection rather than promoting a “need-to-share” culture of integration.**
>
> -- The 9/11 Commission Report

Modern agile programming techniques no longer have us living in a world of solitary software developers building their solely owned modules. Instead code is collectively owned by the team and there is no longer an "other" on the team to hide information from. Change is not feared because anyone on the team can make changes anywhere in the code. Changes are made safe through constant communication, a strict adherence to simplicity and a profound emphasis on readability.

In this way the principle of information hiding is replaced by the principle of readability, changing the software team from a "need-to-know" culture to a "need-to-share" culture. Encapsulation and separation of concerns are no longer important because of information hiding but only when they make programs more readable. If the US government is willing to acknowledge the failures of information hiding despite the very real threat of espionage from foreign governments, what reasoning do you still have for promoting information hiding to protect yourself from your coworker at the next desk?