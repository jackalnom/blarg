---
author: Lucas Pierce
title: "A Depressing, All Too Common Tale of OO Programmer meets Database"
date: 2008-06-22T20:50:50
categories: ["Database & Performance"]
tags: ["orm", "database", "performance", "optimization"]
---

You've just been hired for your first job as an astronomical programmer. You have a graduate degree from CalTech in computer science and you regularly check your horoscope so you feel imminently qualified. Your first assignment is to write a method to count all the red giants in the universe. They use an object relational mapping framework so that you can put all your object oriented design skills to work and not need to worry anything about databases which is awesome because you know nothing about databases.

You feel well trained in the arts of test driven development so you start out by writing a little test:

> test\_count\_red\_giants  
>   DB.clear  
>   assert 0 == count\_red\_giants  
>   DB.add\_red\_giant  
>   assert 1 == count\_red\_giants  
>   DB.add\_white\_dwarf  
>   assert 1 == count\_red\_giants  
> end

You run the test and it fails as it should because you haven't written your method yet. Being a good citizen you then write your new method:

> int count\_red\_giants  
>   number\_of\_red\_giants = 0  
>   stars = DB.get\_all\_stars  
>   for each star in stars  
>     if (star.type == red\_giant)  
>       number\_of\_red\_giants += 1  
>     end  
>   end  return number\_of\_red\_giants;  
> end

You run your test now and EUREKA, you have just completed your first assignment. Ticker tape parades arrive, statues erected and you take a week vacation on Catalina island sipping on midori sours secure in the fact that you are one sweet modern programmer.

This is the life, except when you get an urgent call from your boss two days into your vacation. Your code is now live and it doesn't work. Everytime they try to count the red giants it times out. A helicopter arrives to take you back to the office so you can get to debugging the problem.

You run your unit test again just to make sure some foolio didn't mess with your code while you were gone but nope it still passes. You connect a debugger to your program and start stepping through your method while it is running live. You reach the line DB.get\_all\_stars and it cheerfully tells you "Returning 70 Sextillion Results". Oh crap.

You look back over the DB object and find another method called DB.find\_stars\_by\_type. Bingo. You change your method to be the new awesome:

> int count\_red\_giants  
>   number\_of\_red\_giants = 0  
>   stars = DB.find\_stars\_by\_type(red\_giant)  
>   for each star in stars  
>     number\_of\_red\_giants += 1  
>   end
>
>   return number\_of\_red\_giants  
> end

You run your unit test and it passes. You congratulate yourself on your job well done, tell your boss that you have saved the day and take the helicopter back to Catalina to resume drinking neon colored drinks from martini glasses.

**\*cue hula music\***

While laying in your hammock, drinking a fuzzy naval you get another call from the boss. Your program still runs too slowly. Back to the office we go again.

Now you are stuck. Your program is so optimized now. Why does it still run so slow? In shame you eventually instant message your cousin who runs a PHP/MySql site from his basement that allows him to track his extensive collection of Warez. When you finish explaining your problem, your cousin calls you a total "n00b" and explains that you can do the count directly in SQL. Disgruntled by the fact that you have to dirty yourself with breaking out of your object abstraction, you eventually concede and after reading some documentation arrive at the following:

> int count\_red\_giants  
>   return DB.query('select count(\*) from stars where type = red\_giant')  
> end

You run the unit test and it passes. You feel like you are an amazing ninja hax0r like those engineers that wrote the [Gemini Computer Guidance](http://www-03.ibm.com/ibm/history/exhibits/space/space_gemini.html) system in the 1960s. You tell the boss about your amazing discovery, your groundbreaking fix for the problem and it is back to Catalina for you.

Finally, vacation without have to worry about programming or databases. Just sipping on your Miami Beach Ice Tea pondering over whether Obama or Lincoln will be remembered as the better president 50 years from now. And then you get a call from the boss... it still doesn't work.

**\*sigh\***