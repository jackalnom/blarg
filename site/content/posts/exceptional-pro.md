---
author: Lucas Pierce
title: "Exceptional Programming"
date: 2008-04-13T20:14:29
categories: ["Software Engineering"]
tags: ["exception-handling", "error-handling", "best-practices"]
---

No battle plan ever survives contact with the enemy.  
-- Helmuth von Moltke the Elder

No discussion of handling exceptions in programming should begin without quoting the great Prussian [Generalfeldmarschall Helmuth Karl Bernhard Graf von Moltke](http://en.wikipedia.org/wiki/Helmuth_von_Moltke_the_Elder). In software development, your programs are the battle plans and inputs are the enemy. Even bad programmers can write a program that works when everything goes as expected. Good programmers write programs that gracefully handle all plausible situations.

I will imbue onto you the knowledge necessary to write such graceful programs. As part of a multi-part series, I will go into all the wonderful things that good developers should know when dealing with exceptional cases. I'm assuming that anyone reading this already understands the technical aspects of exceptions. If you don't and you are programming in Java, you can start out by reading [Sun's tutorial](http://java.sun.com/docs/books/tutorial/essential/exceptions/index.html).

First up, I will go into the differences between exceptions, status codes, and assertions.