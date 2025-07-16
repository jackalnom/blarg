---
author: Lucas Pierce
title: "The Ambiguous Null"
date: 2008-02-24T22:50:54
categories: ["Web/Tech"]
tags: []
---

> if (paintColor == null)  
>   print "Room is wall papered."  
> else  
>   print "Room is painted %s.", paintColor

null represents a void reference, but programmers often want to overload it to have other meanings. In the above example, a null paintColor means that the room is wall papered. Overloading null like this has two problems:

1. The caller becomes responsible for the special null case, rather than encapsulating this logic in one place.
2. The code is not self documenting and thus should require comments. In the above example, outside of the immediate context, another programmer might assume that a null paintColor means a wall with no paint or wall paper on it at all.

A better solution is to rename the object paintColor to something more representative such as wallDecoration and then encapsulate the logic inside the object being called:

> print wallDecoration.description