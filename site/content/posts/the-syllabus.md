---
author: Lucas Pierce
title: "The Syllabus"
date: 2008-11-02T22:42:11
categories: ["Software Philosophy"]
tags: ["education", "code-reading", "curriculum"]
---

I explained before why I thought "programology" should be taught, but I didn't go into detail on what I would teach.

To start, there would need to be at least a cursory mention of [Literate Programming](http://en.wikipedia.org/wiki/Literate_Programming). Just like many English Literature classes start with Beowulf, we could start with a reading of [TeX](ftp://tug.ctan.org/pub/tex-archive/systems/knuth/dist/tex/tex.web). Donald Knuth has a little sensor implanted in his brain that tells him every time someone reads his code; make the professor happy and at least try to read some of it.

I wouldn't dwell very long on Literate Programming. To do so would, sadly, lead to a place where we focus on finding the best source code and studying that. Instead the point is to find the best programs and study their source code. Now given, there should be some correlation between quality of source code and quality of program, but I want that correlation to be discovered in its true form and not the usual manifestation of neophytes arguing over number of comments or spaces vs. tabs.

So, at this point I believe we are at about day 3 of the class. The first true source code reading I would do would be of the Java JDK compared and contrasted with Apache Commons. For instance, take a gander at [java.lang.String](http://www.docjar.com/html/api/java/lang/String.java.html) vs. [org.apache.commons.lang.StringUtils](http://svn.apache.org/repos/asf/commons/proper/lang/trunk/src/java/org/apache/commons/lang/StringUtils.java). Library code like this is a good place to start because it is easy to read, self contained, and well commented. I find the java.lang classes especially to be friendly late night reading while sipping on hot cocoa next to a roaring fire.

Comparing the latest and greatest snapshots of programs is interesting in and of itself, but to truly understand a program you need to see its evolution. What were the choices the programmers made originally. What design decisions stuck around and which were abandoned. To this end I would now turn to the Ruby programming languages source code. This is a good candidate for such study because it was written mostly by one person, it is fairly small overall, and it was written over the course of many years with at least 10 years of subversion history to dig through. The reason I think it is important that it was largely the work of one person is that there will be less noise where code is rewritten simply because it is not understood which is very common in large programming teams. My inherent love of string code showing, take a look at the subversion history for [string.c](http://svn.ruby-lang.org/cgi-bin/viewvc.cgi/branches/ruby_1_9_1/string.c?view=log). Look at some of the methods in his version 2 and see how they evolve over time. In what ways does the code get more and more complex? In what ways does it actually become easier to understand?

So far, we've only had to deal with largely isolated components which is nice when trying to study source code, but eventually one has to grasp with understanding large systems. The big guns in this case would be studying the Eclipse IDE code base. It is large, modular and built by a large disjointed set of people. I wouldn't concentrate on reading code at this stage as I would on scanning it. The takeaway skill would be the ability to conceptualize the architecture of a large program and then be able to answer questions such as: if there was a bug in the string differencing, where would you go to fix it and if you were to add a feature that let you tear off subviews into their own windows where would you start.

This is of course just a taste of what the class would look like. There would have to be quizzes that prove you comprehended the code, midterms that involved reading new code on the spot as well as recalling code previously read and a major project where students would pick the source code to read and write their observations on.

Please let me know if there is publicly viewable source code that you have read in the past that you think is of particular note.