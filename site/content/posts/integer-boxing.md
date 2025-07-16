---
author: Lucas Pierce
title: "Integer Boxing Quiz"
date: 2008-05-08T19:35:45
categories: ["Programming Languages"]
tags: ["java", "autoboxing", "quiz"]
---

Here is another fun little quiz I came up with to test your elite Java Integer autoboxing skills. With what implementation of the\_black\_box will the statement on line 11 print "Jonathan Kelly is really a robot!"? The only import allowed is java.lang.reflect.Field. 15 points will be awarded for the first correct answer.

import java.lang.reflect.Field;

class IntegerBoxing {  
    static public void main(String[] args) throws Exception {  
        the\_black\_box();  
        char data[] = {'1', '3', '0'};  
        Integer radix = 10;  
        Integer x = Integer.parseInt(new String(data), radix);

        if (2 == x) {  
            System.out.println("Jonathan Kelly is really a robot!");  
        }  
    }

    public static void the\_black\_box() throws Exception {  
       ...  
    }  
}