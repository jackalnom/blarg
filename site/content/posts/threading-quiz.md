---
author: Lucas Pierce
title: "Threading Quiz"
date: 2008-06-30T21:37:40
categories: ["Programming Languages"]
tags: ["java", "threading", "concurrency", "quiz"]
---

This is a little baby quiz on threading. The program below works... kind of. Looking to award points to the first person who can come up with the following:

1. Without modifying the program on a Java 1.5 SDK, what VM argument will make the program never terminate.
2. You can add a single keyword that will make the program terminate even with the mysterious VM argument. Name the keyword and show where it should be placed.

Good luck!

```java
public class GuessTheVMArg {  
    static boolean foo = true;

    public static void main(String[] args) throws InterruptedException {  
        new Thread(new Runnable() {  
            public void run() {  
                while (foo) { }  
                System.err.println("Done!");  
            }  
        }).start();  
        Thread.sleep(1000);  
        new Thread(new Runnable() {  
            public void run() {  
                foo = false;  
            }  
        }).start();  
    }  
}
```
