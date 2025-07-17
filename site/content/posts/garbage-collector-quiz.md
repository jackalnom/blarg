---
author: Lucas Pierce
title: "Garbage Collector Quiz"
date: 2008-05-24T16:49:31
categories: ["Programming Languages"]
tags: ["java", "garbage-collection", "quiz", "memory-management"]
---

As promised, here is a little quiz related to the Java Garbage Collector. This one is a little more difficult than my previous quizzes so I've left a fairly large hint in the code. First person to get the correct answer gets 25 points.  
```java
import java.lang.ref.*;  
import java.util.*;

class WarmupQuestion {  
    private static ArrayList list = track(new ArrayList());  
    static public void main(String[] args) throws Exception {  
        track(new WarmupQuestion());  
        System.gc();  
        Integer i = track(150);  
        track(new int[1024*1024]);  
        System.gc();  
        track("Hello");  
        i = null;  
        System.gc();  
    }  
      
    public void finalize() {  
        list.add(this);  
    }  
      
    public static<T> T track(T o) {  
        return ObjectTracker.track(o);  
    }  
  
    ...      
}
```

To complete the quiz you must fill in the ellipses with code that has this output when run. Milliseconds and ordering can be different but everything else should be exactly the same.

```shell
object of type [I lived for 12 milliseconds  
 WarmupQuestion.main(WarmupQuestion.java:10)  
object of type java.lang.Integer lived for 19 milliseconds  
 WarmupQuestion.main(WarmupQuestion.java:9)  
object of type java.util.ArrayList lived until program exit.  
 WarmupQuestion.<clinit>(WarmupQuestion.java:5)  
object of type WarmupQuestion has a finalize that raises the dead.  
 WarmupQuestion.main(WarmupQuestion.java:7)  
object of type java.lang.String lived until program exit.  
 WarmupQuestion.main(WarmupQuestion.java:12)
```
The program needs to actually track the lifetime of references, just printing out the output does not count. Whenever an object is garbage collected, the ObjecTracker should show how long the object lived and the stack trace for where it was created. If the object was attempted to be garbage collected, but the finalize method brought the object back to life than the ObjectTracker should print the message shown in the example. Other objects that live until the program finally exits should be printed to the screen on program exit with the message shown in the example.  
  
Good luck!
