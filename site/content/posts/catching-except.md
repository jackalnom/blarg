---
author: Lucas Pierce
title: "Catching Exceptions"
date: 2008-05-04T22:07:32
categories: ["Software Engineering"]
tags: ["exception-handling", "error-handling", "resilience"]
---

> “It’s 3 am and your children are safe and asleep.
> But there’s a phone in the White House and it is ringing.
> Something is happening in the world.
> Your vote will decide who answers that call.
> Whether it is someone who already knows the world’s leaders,
> Knows the military,
> Someone tested and ready to lead in a dangerous world.
> It's 3 am and your children are safe and asleep.
> Who do you want answering that phone?”
> -- voiceover for Hillary Clinton campaign ad

How will you respond when things don't go accordingly to plan? We recognize true greatness not as those that do well when everything is fine, but those who respond with grace and courage when things go terribly wrong. Most historians consider our three greatest presidents to be George Washington, Abraham Lincoln, and Franklin Roosevelt. It is no coincidence that they led us through the 4 largest crises our nation has faced: the War for Independence, the Civil War, the Great Depression and World War II.

I believe the absolutely most important thing about being a great professional software developer is being prepared for when things go wrong. The naive developer will claim that nothing can go wrong and so fails to prepare. The battle hardened but cynical developer throws up their hands and says there is nothing they can do about it. I will try to walk you somewhere between these two extremes and combine the pessimism that tells us what can go wrong and the optimism that tells us how we can recover from it.

These are the error handling techniques that software developers should be aware of:

1. **The hard fail.** This is the easiest and normally the least useful way to handle an error. Just kill your program when something goes wrong. I once worked with a programmer that handled every catch statement with:
```java
   } catch(Exception) {
     System.exit(1);
   }
```

   As a user, this was a bizarre experience to say the least. You would select a menu option and it would suddenly and unexpectedly quit, losing all of your work and giving you no indication of what you actually did wrong. It is a good way to make your user base fearful, neurotic and afraid to color outside the lines though.
2. **The hard fail with a heartbeat.** This is similar to the hard fail, but with a separate process whose sole job is to detect the death of your program and to restart it when it dies. This can actually be an amazingly simple and powerful way to handle errors for always up, non-user facing programs. It spares you from writing unnecessary and potentially buggy error recovery code. For highly fault tolerant programs, this approach is used across multiple machines with automatic failover when errors occur. Erlang is built with this style of error handling and was used to write the 1.7 million line [AXD301](http://wadler.blogspot.com/2005/05/concurrency-oriented-programming-in.html) which has a measured reliability of 99.9999999% (9 nines).
3. **Keep on trying.** Sometimes persistence is all it takes. This type of error handling is useful in situations where it is reasonable to assume that you will eventually succeed. This is especially useful when building resilient applications that work across a network. Be careful to differentiate between errors that can reasonably expected to eventually work when retried. For example if you receive an HTTP 403 Forbidden error it makes no sense to continue to retry the request, an HTTP 503 Service Unavailable error on the other hand is a good candidate for a retry. As Albert Einstein warned "The definition of insanity is doing the same thing over and over again and expecting different results."

   Lastly, be a good citizen and use an [exponential back off](http://en.wikipedia.org/wiki/Exponential_backoff) when retrying. The last thing that will help an overburdened server is to have all of its clients hitting it repeatedly every half second when they encounter an error.
4. **Fix it and move on.** Some errors are just plain correctable. A good example is if a directory you are expecting doesn't exist. If the directory is just going to be used to output some files, consider just creating the directory and then moving on.
5. **Tell me about all about it.** This is the style of error handling most often encountered by non-technical users. A ominous dialog box appears to slap the user across the face saying "Error Encountered 0xDEADBEEF I/O unknown Result Code 42". There are several things commonly wrong with this style of error.

   The first is that programmers write non-understandable error messages. It is bad enough when programmers write error messages that only they understand, worse I see error messages that even the programmer who wrote the program doesn't understand because it provides no context for what the error actually is. Don't just say, "error encountered", you need to tell the user why the error occurred and what they can do to correct it if it isn't obvious.

   The second thing wrong with this type of error is that it is used in cases where the program is making the user do something manually that the program could have done automatically. If you need a temp directory created before you start, don't tell the user and make them create it when the program could more easily create the directory itself and keep on working. If you encounter a network error, try auto-retrying with a cancel button, and don't make the user sit there manually clicking retry.

   The third thing wrong with this type of error is that it can be a potential security hole. If you expose programmatic details in your error message such as a Java stack trace, this can be valuable information to those trying to hack your program. Sometimes you can be too helpful in your error message as well. If someone is prohibited from accessing a piece of information, telling them that it exists but that they can't get it can be valuable to the would be hacker in itself. In this case, you might want to make forbidden return the same error as not found.
6. **Phone home.** Too many programmers never anticipate what it will be like to debug a problem when the program is out in the wild and not sitting in debug mode on their own box. If you think it is hard reproducing problems on your machine, imagine what you will do when a user calls up and says "I hit the blue button on the right and then it told me 'unexpected error'" when there is no blue button in your program and unexpected error is the error message you use for a gazillion different possible error cases. If possible, collect and even automatically send as much information as you can gather about errors back to yourself when an error occurs. There are numerous caveats to this such as being careful to not send sensitive information (credit card numbers, classified material, yadda yadda) and letting users know before sending the debug info if it is an externally distributed software. The lesson is the same though. When handling an error that indicates a bug in the program, collect the information you will need to reproduce and fix the bug back on your own machine.
7. **Rollback.** This type of error handling is useful normally in combination with one of the methods mentioned above. Its a travesty that most programmers only encounter rollbacks when dealing with database transactions. Being able to rollback the state of your program is an extremely useful concept when writing explorable user friendly applications. Your transactional rollback mechanism can be tied into an undo mechanism that allows your user to to undo undesirable behavior. This type of program would be the opposite of the fear driven program described in the 'fail hard' error handling I first described. A word of caution though, writing rollback features is notoriously difficult. If at all humanly (computerly?) possible, it is far easier to snapshot the state and just revert back then to actually try to rewind an operation. This isn't always possible but it should always be the first option you consider.

Exception handling isn't a glamorous topic, but it is still important. Be the humble programmer that looks for ways to make their program cool and confident in the face of adversity and unexpected situations.

