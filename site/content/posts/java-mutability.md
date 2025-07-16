---
author: Lucas Pierce
title: "Java Mutability Pop Quiz"
date: 2008-04-12T19:57:26
categories: ["Programming Languages"]
tags: ["java", "mutability", "quiz"]
---

Can Java [strings](http://java.sun.com/j2se/1.5.0/docs/api/java/lang/String.html) actually be mutable? I will award 10 points for the first person to give me an implementation of robotocize that makes the println on line 2 of the main method print "Jonathan Kelly is a robot!" instead of "Jonathan Kelly is a human.".

> class WantToBet {  
>     static public void main(String[] args) throws Exception {  
>         robotocize();  
>         System.out.println("Jonathan Kelly is a human.");  
>     }
>
>     public static void robotocize() throws Exception {  
>         ...  
>     }  
> }

**Related Java quiz posts:**
- [Quiz Results](/posts/quiz-results/) - Results and solutions for this mutability quiz
- [Integer Boxing Quiz](/posts/integer-boxing/) - Test your knowledge of Java autoboxing
- [Threading Quiz](/posts/threading-quiz/) - Challenge about threading and volatile keywords
- [Garbage Collector Quiz](/posts/garbage-collector-quiz/) - Advanced quiz on garbage collection