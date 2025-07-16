---
author: Lucas Pierce
title: "Register Style Programming"
date: 2008-03-09T09:23:37
categories: ["Web/Tech"]
tags: []
---

Register style programming is when a coder of a high level language treats variables as if they were programming in assembly with registers.

> room = RoomDAO.findLivingRoom  
> **if** (room <> nil)  
>   house.add(room)  
> room = RoomDAO.findKitchen  
> **if** (room <> nil)  
>   house.add(room)

Reusing variables with register style programming has several problems:

1. It unnecessarily increases the lifetime of a variable thus making it harder for code readers to track the variables state.
2. It makes the code less self-documenting forcing the reader to track a variable through the program to determine which meaning the variable has at one time.

Instead, variables should have only a single semantic meaning throughout their lifetime.

> livingRoom = RoomDAO.findLivingRoom  
> **if** (livingRoom <> nil)  
>   house.add(livingRoom)  
> kitchen = RoomDAO.findKitchen  
> **if** (kitchen <> nil)  
>   house.add(kitchen)