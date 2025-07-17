---
author: Lucas Pierce
title: "Exceptions vs. Status Codes vs. Assertions"
date: 2008-04-14T19:57:57
categories: ["Software Engineering"]
tags: ["exception-handling", "error-handling", "best-practices"]
---

Step one to handling exceptional code is to be aware of the common techniques, their semantic meaning and any pitfalls. The three common error handling techniques are exceptions, status codes and assertions. If your language has exceptions, exceptions should be used in any situation where there is a normal program flow and some input outside of your control can disrupt that flow. At some point in your life, and this may have already happened to you, an antediluvian C programmer is going to tell you about all the evils of exceptions and how God intended man to use status codes for all errors. Do not be deceived by this [siren](http://www.joelonsoftware.com/items/2003/10/13.html) and her false promises.

A status code should be used when your language lacks exceptions or when the normal program flow is to deal with the error case. For example, if you are writing a method to validate an address, it should return a message saying what is wrong with the address and not just throw an exception that needs to be immediately caught if there is a problem with the address.

Lastly, an assertion should be used as a sanity check that your program is correct as written. You should expect to change your program's code when an assertion is triggered. The one thing to watch out for in using assertions is that they can be turned off. When turned off, the code that is being asserted is not actually run. This means never put logic your program depends upon inside of an assert.

Philosophically, the methodology I use with any of these error techniques is based on the beauty of a program driven by its linear proportions. I like code that looks like this:

```java
   expression1,  
   expression2,  
   expression3,  
   expression4,  
   ...
```

instead of like this:

```java
   if (conditional)  
      expression1,  
   if (conditional2)  
      if (conditional3)  
         expression2,  
      else  
         expression3,  
   else if (conditional4)  
      expression4,
```

I could consume an entire post (and I shall!) on all the reasons I prefer the linear rather than the jagged program. The way I use exceptions, status codes and assertions can be roughly guided by this preference though. Exceptions are good when they promote code that is linear. When you need to check the status code on every line, that destroys the linear nature of the program. Many programmers get around this by then defining Macros that use gotos, but at that point you are really just crafting your own exception handling. When I do end up preferring status codes to exceptions is when using a status code leads me closer to a linear program. This is true of the validate method I mentioned above, I still prefer calling code that looks like this:

```java
   expression1,  
   if (foo.isValid())  
      expression2,  
      expression3  
   else  
      expression4,  
      expression5  
   expression6
```

to this:

```java
   expression1,  
   try  
      foo.validate(),  
      expression2,  
      expression3  
   catch(...)  
      expression4,  
      expression5  
   expression6
```

The flow of the second program is more confusing in this case. It is not readily apparent that the conditional dispatch actually is based on just the first line in the try block, and that the rest of the expressions are only there for the purpose of being run when foo validates. The if blocks make this point blatantly clear.

I prefer assertions for the same linear flow reasons. When I want to sanity check for a value, it is cleaner to do this:

```java
   assert conditional1
```

rather than this:

```java
   if (conditional1)  
      throw BadException
```

This is on top of the semantic meaning of assertion which tells other programmers that "no, this really shouldn't happen, but I'm just making sure."

And now you know all you need to know when choosing whether to use an exception, a status code, or an assertion. Next in my series on exceptional code I shall dive into exceptions being part of a method's signature.

