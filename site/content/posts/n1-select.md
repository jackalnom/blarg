---
author: Lucas Pierce
title: "N+1 Select"
date: 2008-06-17T21:42:16
categories: ["Database & Performance"]
tags: ["n+1-problem", "orm", "database", "performance"]
---

You can forget about the performance of synchronized vs. unsynchronized, when you write code hitting your database that looks like this:

```java
peeps = Database.findMyPeeps  
for (each peep in peeps)  
  address = Database.findAddressForPeep(peep)
```

This is called an N+1 select, although honestly it is more like a 1 + N select. You first run a query to find what you are looking for, and then you proceed to iterate over those results to do N more queries for each row in your initial query. This is a all too common reason for slow applications because of the overhead of the frequent database queries. My example above is the obvious version of this, and if you use an [Object Relational Mapping](http://en.wikipedia.org/wiki/Object-relational_mapping) (ORM) such as [Hibernate](http://www.hibernate.org/hib_docs/v3/reference/en/html/) or [ActiveRecord](http://ar.rubyonrails.com/) there is a much more stealthy version of this anti-pattern:

```java
peeps = PeepDAO.findMyPeeps  
for (each peep in peeps)  
   address = peep.getAddress
```

If Address is a table with a foreign key relationship to Peep, and the mapping is defined as a lazy load, then it will result in the same N + 1 Select problem. How do you solve this?

If you said by changing the mapping to an eager load... WRONG!! First, run the code and see the queries that your ORM is making. Get a representative set of data and time how long the section of code takes to run. Only once you have in this in place are you in a situation where you are capable of making smart optimization choices.

The first solution is to change the mapping for Peep to eager fetch addresses. This might be the right solution, but make sure you understand everywhere that Peep is used first. Changing the mapping will change the behavior of Peep everywhere it is used. You might be creating a local optimization where you speed up your for loop in this case, but pull down unnecessary data in 80% of the rest of the program.

The second solution is to write a custom query. In Hibernate you can use either [HQL](http://www.hibernate.org/hib_docs/reference/en/html/queryhql.html) or the [Criteria API](http://www.hibernate.org/hib_docs/reference/en/html/querycriteria.html). Most of the time this is going to be the superior solution to your N+1 Select problem.

Can anyone tell me in what situations they would use HQL vs. using the Criteria API?