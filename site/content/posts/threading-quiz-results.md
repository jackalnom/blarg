---
author: Lucas Pierce
title: "Threading Quiz Results"
date: 2008-07-13T19:28:30
categories: ["Programming Languages"]
tags: ["java", "threading", "concurrency", "quiz"]
---

Congratulations to Peter and Michael for together coming up with the correct answer. They have both been awarded 5 points.

The target "-server" is an instruction to use the server JVM. The reason this can affect the behavior of the program in the quiz is that the server JVM does more aggressive optimizations than the standard client JVM. Without setting foo to volatile, the compiler optimizes out foo in the first loop because it never changes and it can never possibly change in that loop.

When you set a variable as volatile, it instructs the JVM that the variable can be modified/read from multiple threads. This prevents the server JVM from optimizing out foo because it now knows it can be modified by some other thread even though this thread doesn't touch foo.

Volatile has more implications than what I have just mentioned, but I will save that for when I start talking about the java memory model.