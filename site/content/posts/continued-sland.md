---
author: Lucas Pierce
title: "Continued Slander against the Noble If"
date: 2008-03-16T13:26:43
categories: ["Software Engineering"]
tags: ["polymorphism", "inheritance", "design-patterns"]
---

I've often said that **if** statements are good indicators of poorly designed code. To illustrate my point, here is some code I recently stole from a major auto insurance firm[1](#disclaimer):

> **def** Money calculateAutoInsurance  
>   **if** (person **is-a** Man)  
>     Man man = (Man)person  
>     **if** (man.canGrowBeard)  
>       **return** $50  
>     **else**   
>       **return** $2000  
>     **end**  
>   **else if** (person **is-a** Woman)  
>     **return** $10  
>   **else**  
>     kaboom!  
>   **end**  
> **end**  
>  

When casting or using any **is-a** operator such as **instanceof** in Java or **kind\_of?**/**is\_a?** in Ruby, you should stop to think about whether this is really the best solution. Sometimes it is necessary such as in Java when implementing the equals method or when hacking around a poorly designed third party library. If you are able to modify the classes you are calling though, a simpler solution is to push the conditional logic into the derived classes.

The [Liskov Substitution Principle](http://en.wikipedia.org/wiki/Liskov_substitution_principle) and [substitutability](http://en.wikipedia.org/wiki/Substitutability) are helpful in understanding how to design proper polymorphic classes. When a caller is acting upon an interface, one should be able to substitute any type that implements that interface. In this case, the caller is breaking substitutability by casting to a specific derived type and basing logic on what the derived type is.

Code that follows the substitutability principle is better for several reasons:

1. ***Higher cohesion***. We can leave the polymorphic dispatch logic up to the language itself so that the calling code doesn't have to worry about the specifics of manipulating derived types.
2. ***Better encapsulation***. If canGrowBeard was only exposed for auto insurance calculations, it can be rehidden when we push the auto insurance calculation into the derived Persons.
3. ***Safer/Easier to extend***. For example, it will be easier to add a [third gender](http://en.wikipedia.org/wiki/Third_gender) for Person if we know the caller always follows the substitutability principle. I would not advocate removing simplicity to add this extensibility, but given that it is simpler, the extra extensibility is a nice bonus.

> **class** Man **extends** Person  
> ...  
>   **def** Money autoInsurance  
>     **if** (canGrowBeard)  
>       **return** $50  
>     **else**   
>       **return** $2000  
>     **end**  
>   **end**  
> ...  
> **end**
>
> **class** Woman **extends** Person  
> ...  
>   **def** Money autoInsurance  
>     **return** $10  
>   **end**  
> ...  
> **end**

**BONUS POINTS** for anyone that can tell me what is still highly suspicious about the design for the final solution.

1. Any illegal activity presented here is fictional and any resemblance to illegal activity past, present, or fictional is purely and completely coincidental.