---
author: Lucas Pierce
title: "Tactical Polymorphism"
date: 2008-03-02T00:46:46
categories: ["Software Engineering"]
tags: ["polymorphism", "design-patterns", "oop"]
---

```java
class Room  
  String roomType()  
    return roomType  
  end

  boolean isCarpetted()  
    return isCarpetted  
  end

  boolean isPainted()  
    return isPainted  
  end

  Color paintColor()  
    return paintColor  
  end

  boolean isWallpapered()  
    return isWallpapered  
  end

  String wallpaperDesign()  
    return wallpaperDesign  
  end

  boolean isVenetianPlastered()  
    return isVenetianPlastered  
  end

  describeWall()  
    if (isWallpapered)  
      print "Room is wall papered %s.", wallpaperDesign  
    else if (isPainted)  
      print "Room is painted %s.", paintColor  
    else if (isVenetianPlastered)  
      print "Room is venetian plastered"  
    end  
  end  
end
```

Object oriented designers seeing this class will see an opportunity to refactor this class to take advantage of polymorphism.

```java
abstract class Room  
  String roomType()  
    return roomType  
  end

  boolean isCarpetted()  
    return isCarpetted  
  end

  abstract describeWall()  
end

class WallpaperedRoom  
  describeWall()  
    print "Room is wall papered %s.", wallpaperDesign  
  end  
end

class PaintedRoom  
  describeWall()  
    print "Room is painted %s.", paintColor  
  end  
end

class VenetianPlasteredRoom  
  describeWall()  
    print "Room is venetian plastered"  
  end  
end
```

There are several problems with this refactor:

1. It isn't modular. To add a new type of wall, one must understand the whole room class. This isn't difficult in this case, but as the class gets larger this is intellectual overhead that is unnecessary.
2. It isn't flexible. It artificially favors one axis of variance. For example, there could be multiple types of floors in the future (carpet, hardwood, and tile) each with their own sets of data. We need a room that allows us to mix and match every combination of wall and floor.

A better design is to apply what I refer to as tactical polymorphism to distinguish it from all the abusive usages of polymorphism. Tactical polymorphism is limiting polymorphism to only what is logically varying and nothing else. Instead of making the entire room polymorphic, we make just the part of the room that is varying polymorphic and have the room contain this polymorphic object.

```java
class Room  
  String roomType()  
    return roomType  
  end

  boolean isCarpetted()  
    return isCarpetted  
  end

  Wall wall()  
    return wall  
  end  
end

interface Wall  
  describe()  
end

class WallpaperedWall  
  describe()  
    print "Room is wall papered %s.", wallpaperDesign  
  end  
end

class PaintedWall  
  describe()  
    print "Room is painted %s.", paintColor  
  end  
end

class VenetianPlasteredWall  
  describe()  
    print "Room is venetian plastered"  
  end  
end
```
