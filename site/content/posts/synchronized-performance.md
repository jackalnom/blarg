---
author: Lucas Pierce
title: "Synchronized Performance"
date: 2008-06-10T00:39:10
categories: ["Database & Performance"]
tags: ["java", "threading", "performance", "synchronization"]
---

In a recent code review meeting, the performance of synchronized vs. non-synchronized methods came up. I threw out a ridiculous (in retrospect) statement that uncontested synchronized methods can have an overhead of up to 100 times that of an unsynchronized method. Kyle Haughey almost immediately called bullshit on my statement. I made some sample programs to try to test out the performance in some trivial cases and showed the respective output.

```java
class SynchronizedTest {  
    static public void main(String[] args) {  
        long startTime = System.currentTimeMillis();  
        StringBuilder sb = new StringBuilder();  
        for (int i = 0; i < 1000000; i++) {  
            sb.append(foo());  
        }  
        System.err.println("Synchronized: " +   
                (System.currentTimeMillis() - startTime));

        startTime = System.currentTimeMillis();  
        sb = new StringBuilder();  
        for (int i = 0; i < 1000000; i++) {  
            sb.append(bar());  
        }  
        System.err.println("Unsynchronized: " +   
                (System.currentTimeMillis() - startTime));  
    }

    static synchronized String foo() {  
        return "Hi";  
    }

    static String bar() {  
        return "Hi";  
    }  
}
```

**Output:**
```
Synchronized: 106  
Unsynchronized: 46
```

I ran this test several times and it was very consistent in the numbers. Then I switched the order of the synchronized and the unsynchronized method to see if the order mattered at all.

```java
class SynchronizedTest {  
    static public void main(String[] args) {  
        long startTime = System.currentTimeMillis();  
        StringBuilder sb = new StringBuilder();  
        for (int i = 0; i < 1000000; i++) {  
            sb.append(bar());  
        }  
        System.err.println("Unsynchronized: " +   
                (System.currentTimeMillis() - startTime));

        startTime = System.currentTimeMillis();  
        sb = new StringBuilder();  
        for (int i = 0; i < 1000000; i++) {  
            sb.append(foo());  
        }  
        System.err.println("Synchronized: " +   
                (System.currentTimeMillis() - startTime));  
    }

    static synchronized String foo() {  
        return "Hi";  
    }

    static String bar() {  
        return "Hi";  
    }  
}
```

**Output:**
```
Unsynchronized: 72  
Synchronized: 82
```

Very interesting. Switching the order made them nearly identical in timing, although the synchronized is still a bit slower. Then I tried removing the whole string append business and broke both out into their own executables.

```java
class Unsynchronized {  
    static public void main(String[] args) {  
        long startTime = System.currentTimeMillis();  
        for (int i = 0; i < 1000000; i++) {  
            foo();  
        }  
        System.err.println("Unsynchronized: " +   
                (System.currentTimeMillis() - startTime));  
    }

    static String foo() {  
        return "Hi";  
    }  
}

class Synchronized {  
    static public void main(String[] args) {  
        long startTime = System.currentTimeMillis();  
        for (int i = 0; i < 1000000; i++) {  
            foo();  
        }  
        System.err.println("Synchronized: " +   
                (System.currentTimeMillis() - startTime));  
    }

    static synchronized String foo() {  
        return "Hi";  
    }  
}
```

**Output:**
```
Unsynchronized: 3  
Synchronized: 36
```

I tried running the method with synchronized or unsynchronized first and it made little difference in this case. I was amazed that the synchronized version was so much slower though, especially because Kyle had done a pretty good job of convincing me that synchronized shouldn't be slower. Just to make sure there was nothing else going on with the java compiler, I opened up the bytecode for both Synchronized and Unsynchronized using javap -c. Here is the bytecode for Unsychronized:

```
Compiled from "Unsynchronized.java"  
class Unsynchronized extends java.lang.Object{  
Unsynchronized();  
  Code:  
   0:    aload_0  
   1:    invokespecial    #1; //Method java/lang/Object."<init>":()V  
   4:    return

public static void main(java.lang.String[]);  
  Code:  
   0:    invokestatic    #2; //Method java/lang/System.currentTimeMillis:()J  
   3:    lstore_1  
   4:    iconst_0  
   5:    istore_3  
   6:    iload_3  
   7:    ldc    #3; //int 1000000  
   9:    if_icmpge    22  
   12:    invokestatic    #4; //Method foo:()Ljava/lang/String;  
   15:    pop  
   16:    iinc    3, 1  
   19:    goto    6  
   22:    getstatic    #5; //Field java/lang/System.err:Ljava/io/PrintStream;  
   25:    new    #6; //class java/lang/StringBuilder  
   28:    dup  
   29:    invokespecial    #7; //Method java/lang/StringBuilder."<init>":()V  
   32:    ldc    #8; //String Unsynchronized:   
   34:    invokevirtual    #9; //Method java/lang/StringBuilder.append:(Ljava/lang/String;)Ljava/lang/StringBuilder;  
   37:    invokestatic    #2; //Method java/lang/System.currentTimeMillis:()J  
   40:    lload_1  
   41:    lsub  
   42:    invokevirtual    #10; //Method java/lang/StringBuilder.append:(J)Ljava/lang/StringBuilder;  
   45:    invokevirtual    #11; //Method java/lang/StringBuilder.toString:()Ljava/lang/String;  
   48:    invokevirtual    #12; //Method java/io/PrintStream.println:(Ljava/lang/String;)V  
   51:    return

static java.lang.String foo();  
  Code:  
   0:    ldc    #13; //String Hi  
   2:    areturn

}
```

The bytecode for synchronized is identical, except for the comments. This at least shows that there isn't some weird optimization going on at the bytecode level that is making the unsynchronized version go faster.

At any level, it is pretty clear that on my mac book pro, in trivial examples, an uncontested synchronized does not add a 100 times overhead to a method call. It is also clear that these numbers fluctuate signicantly, so it is very important to actually profile your own code in as real an environment as possible when making any optimizations.

If you want a more clear cut optimization win, replace the StringBuilder append calls in SynchronizedTest with straight string concatention, i.e. s += foo() and try running the program.