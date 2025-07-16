---
author: Lucas Pierce
title: "In Defense of Go To"
date: 2008-12-07T13:36:48
categories: ["Web/Tech"]
tags: []
---

I continue this entry from my [defense of duplicated code](http://www.bonnycode.com/guide/2008/11/in-defense-of-duplicated-code.html). If programmers were politicians, writing an article like this would surely prevent me from ever running for Programmer President. Twenty years from now someone would dig it up and say "Lucas Pierce supports the use of go to! Heresy!".

That said, let's say we have been contracted to write a program to generate Fibonacci numbers. Believe me, Fibonacci generators are a hot commodity these days so this is a totally realistic example. In this case you run the program and then type in a number (n) and it gives the first n Fibonacci numbers and then exits.

main  
  integer n = console.getInt()  
  integer first = 0  
  integer second = 1  
  integer next

  fib\_loop:  
    print first  
    next = first + second  
    first = second  
    second = next  
    n = n - 1  
  if (n > 0) goto fib\_loop  
end

<sarcasm\_tags\_for\_the\_clueless>Egads! That program is totally obtuse! Here let me write a version without **go to** so that it makes more sense</sarcasm\_tags\_for\_the\_clueless>:

main  
  integer n = console.getInt()  
  integer first = 0  
  integer second = 1  
  integer next

  do  
    print first  
    next = first + second  
    first = second  
    second = next  
    n = n - 1  
  while (n > 0)  
end

Now it makes sense! Although we could use a for loop to make it even better:

main  
  integer first = 0  
  integer second = 1  
  integer next

  for (integer n = console.getInt(); n > 0; n = n - 1)  
    print first  
    next = first + second  
    first = second  
    second = next  
  end  
end

Why is this version so much better than the [go to](http://xkcd.com/292/) version though? We've all been taught **go to** is evil but I find all three equally readable. This is me throwing down the gauntlet, I challenge you to tell me why **go to** is wrong.