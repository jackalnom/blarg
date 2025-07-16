---
author: Lucas Pierce
title: "Code Comprehension"
date: 2008-03-24T00:08:53
categories: ["Software Engineering"]
tags: ["code-reading", "comprehension", "maintenance"]
---

Being a good software developer has as much to do with understanding code as it does with writing new code. When writing new code be sure you understand the existing assumptions.

> System.out.println("How old are you?");  
> Integer age = Integer.getInteger(System.console().readLine());  
> System.out.println(String.format("Congratulations! You are %d years old.", age));

As cool as this program looks, it doesn't actually work. At the risk of offending a developer from Sun Microsystems, [Integer.getInteger](http://java.sun.com/j2se/1.5.0/docs/api/java/lang/Integer.html#getInteger(java.lang.String)) is both badly misplaced (low cohesion) and deceptively named. The lesson here is not to berate the poor developer who designed getInteger but to avoid programs like what is shown above. Don't make assumptions about a method's behavior or what a variable stores purely by its name and take the time to do the research.

Code comprehension is always important. Be especially cautious when dealing with third party code or your company's legacy code. The code was likely developed using different coding standards, conventions, and best practices than you would assume.
