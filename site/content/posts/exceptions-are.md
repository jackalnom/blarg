---
author: Lucas Pierce
title: "Exceptions are part of the Method Signature"
date: 2008-04-20T17:32:03
categories: ["Software Engineering"]
tags: ["exception-handling", "error-handling", "best-practices"]
---

The exceptions thrown by your method are part of the signature of your method. This is true technically of checked exceptions in Java, but more importantly it is true semantically. One of the poorest way to handle exceptions is to do either this:

> def foo throws SomeRandomException, SomeOtherException, YetAnotherUselessException, ImNotDoneThrowingExceptions, ILetEclipseDesignMyMethodsException, TheUserWillNeverCareAboutThisException

OR this:

> def bar throws Exception

The foo method is called implementation driven exception throwing. It is most often seen when people let their IDE (such as Eclipse), design their method signatures for them by just throwing any old exception that comes along in implementation. If the implementation changes, one can assume that the exceptions will change.

The bar method is called shit happens exception throwing. It tells other programmers that the designer of this method has no idea what could possibly go wrong so you better just be prepared to catch it all.

Much preferred is to design the exceptions your method throws as part of the signature for the method. Not just what can go wrong, but what error cases do we want to differentiate from. When parsing an Integer, most users probably don't care whether it failed because the string was null vs. the string containing non-digits vs. the string containing an integer that was bigger than max int. So the designers of the method just bundled it all up in a NumberFormatException. If there were a strong use case for differentiating between all other errors and the Integer being too large, then the method would instead throw NumberFormatException and IntegerOverflowException.

I will follow up next week on how to properly catch exceptions.

**Related posts in this series:**
- [Exceptional Programming](/posts/exceptional-pro/) - Introduction to exception handling best practices
- [Exceptions vs. Status Codes vs. Assertions](/posts/exceptions-vs-s/) - Understanding the differences between error handling techniques
- [Catching Exceptions](/posts/catching-except/) - Comprehensive guide to error handling techniques