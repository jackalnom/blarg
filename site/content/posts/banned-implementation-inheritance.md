---
author: Lucas Pierce
title: "Banned: Implementation Inheritance"
date: 2008-09-07T13:21:40
categories: ["Software Engineering"]
tags: ["inheritance", "composition", "oop", "best-practices", "technical-debt"]
---

Most software developers are aware of the principle "favor object composition over class inheritance". I've written before about [tactical polymorphism](/posts/tactical-polymo/), and if you reread the example all I was really doing was following this principle. I substituted an implementation that used implementation inheritance for one that used composition plus interface inheritance.

I still see people that are aware of all the above and yet they still persist in creating designs centered around implementation inheritance. Horribly complicated designs that are a pain in the ass to code review. In the wall paper example I gave things aren't yet so bad. Because implementation inheritance destroys modularity and tightly couples a whole swath of code, they organically grow into 5,000 line monstrosities, derived from another 8,000 line monstrosity. And because the classes are so complicated and so fragile, newcomers don't dare refactor when making a small change or even always understand the correct place to put their change and thus the monstrosity continues to grow in odd and nonuniform ways. This sad disease is known as code rot although the scientific name for it is [technical debt](http://en.wikipedia.org/wiki/Technical_debt). And while it has done wonders for certain aging C++ programmers job security, unless you wish to be maintaining the same lousy code 5 years from now because no one else can possibly understand it you should avoid it whenever possible.

So what does this mean for you? Next time you try to do any implementation inheritance in your design, stop and say to yourself:  
1. Am I possessed by some evil demon lord of bad design?  
2. Do I love this code so much that I want it to work on for the rest of my life and want no one else to ever understand it?  
3. Do I have a really really good reason why this limited use of implementation inheritance won't end the universe as we know it?

If you can't answer yes to one of the above, please please "favor object composition over class inheritance".