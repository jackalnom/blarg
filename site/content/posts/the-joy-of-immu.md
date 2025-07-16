---
author: Lucas Pierce
title: "The Joy of Immutability"
date: 2008-04-06T21:57:15
categories: ["Web/Tech"]
tags: []
---

No man ever steps in the same river twice, for it's not the same river and he's not the same man.  
-- Heraclitus

The relation between identity and change is a basic philosophical problem. How can one define anything when everything is always changing? For example, your tax return includes basic information about yourself such as marital status. When you get married, this doesn't make all previous years tax returns invalid. They are still true, but refer to your self at that point in time.

> **class** Person  
>   ...  
>   **def** setMaritalStatus(MaritalStatus newStatus)  
>     maritalStatus = newStatus  
>   **end**
>
> **def** MaritalStatus getMaritalStatus()  
>     **return** maritalStatus  
>   **end**  
>   ...  
> **end**
>
> **class** TaxReturn  
>   ...  
>   **def** Person getPerson()  
>     **return** person  
>   **end**  
>   ...  
> **end**

This is the code the IRS used to use to store people's tax returns. This caused innumerable problems for the IRS especially with divorce rates on the rise. At first, the IRS tried to solve the problem by pushing for the No Divorce Act of 1983 (which they intended to follow up with No New Marriage act), but when this failed to pass they were faced with a huge dilemma. How could they ever go back to audit previous year's tax returns when a person's marital status was allowed to fluctuate? Here is what I changed the code to when I was eventually called in as a consultant.

> **class** Person  
>   ...  
>   **def** Person setMaritalStatus(MaritalStatus newStatus)  
>     newPerson = this.clone  
>     newPerson.maritalStatus = newStatus  
>     **return** newPerson  
>   **end**
>
> **def** MaritalStatus getMaritalStatus()  
>     **return** maritalStatus  
>   **end**  
>   ...  
> **end**

Keep in mind this was the 80s and I was only 3 years old, so this was not my most beautiful code. This solved the IRS's problem though by making Person immutable, when one attempts to change a Person it makes a copy of the Person with the new attribute and hands that back instead. This meant that the old tax returns could still refer to the original Person and no longer needed to worry about changing marital status.