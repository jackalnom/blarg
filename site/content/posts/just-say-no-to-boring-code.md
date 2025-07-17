---
author: Lucas Pierce
title: "Just Say 'No' To Boring Code"
date: 2009-04-12T22:51:32
categories: ["Software Engineering"]
tags: ["code-quality", "readability", "maintainability"]
---

*Thanks to [Casey](http://www.cs.uchicago.edu/people/clklein) for inspiring this entry and for fighting the good fight against boring code.*

I have extreme feelings of dissatisfaction with boring code. Boring code is monotonous and has a low signal to noise ratio. It takes a long time to communicate anything of value in boring code because most lines are dedicated to boilerplate. For example, according to a recent statistic I just made up, 95% of Java code consists of the following:

int getBlah() {  
   return blah;  
}  
  
void setBlah(int blah) {  
   this.blah = blah;  
}  
  
String getSoBored() {  
   return soBored;  
}  
  
void setSoBored(String soBored) {  
  this.soBored = soBored;  
}

In Ruby, this looks like:

attr\_accessor :blah, :soBored

If you are using Java, a certain amount of this type of verbose code is just necessary. The far more insidious problem is that it trains developers into believing this type of pattern is a good thing. The best thing about Ruby and the functional programming communities is that the first point emphasized is that code should be concise and full of meat and if it isn't you aren't thinking hard enough. For instance, the Hello World program in Ruby:

puts "Hello, World!"

Straight to the point. In Java, you are already entering the world of boilerplate thinking (from http://java.sun.com/docs/books/tutorial/getStarted/application/index.html):

/\*\*   
 \* The HelloWorldApp class implements an application that  
 \* simply displays "Hello World!" to the standard output.  
 \*/  
class HelloWorldApp {  
    public static void main(String[] args) {  
        System.out.println("Hello World!"); //Display the string.  
    }  
}

My knock here is not actually that Ruby or functional languages magically eliminate all boilerplate code, or that this extra overhead in these cases is really that painful. You can easily use a code generator for both of these situations and if this is the only boilerplate in your code you are doing pretty good. The problem is the Java community teaches its developers that all of their code should be at about this level of signal to noise.

This is not an argument about aesthetics. Boring code is bad for precisely three reasons:

1. Boring code is boring to read. Code is read far more than it is written. This means programmers coming in to modify your code are more likely to miss something and then make the wrong code change.
2. Boring code is boring to review. A critical quality insurance practice in professional software development is code reviews. But boring code is boring to review. If you write boring code, it is far more likely the reviewer will just go 'yadda yadda yadda looks good to me' and gloss over mistakes.
3. Boring code is boring. Come on, do you really want to be boring?

The only thing worse than boring code is [magic code](/posts/in-defense-of-duplicated-code/). Stick to the exciting, elegant, simple code, believe me you'll sleep better at night if you do.

