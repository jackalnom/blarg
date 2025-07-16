---
author: Lucas Pierce
title: "Winner of Garbage Collection Quiz"
date: 2008-05-31T16:19:27
categories: ["Programming Languages"]
tags: ["java", "garbage-collection", "quiz"]
---

Congratulations to Evan Rosson for his correct answer which I have reposted here for posterity. The only real difference between my answer and Evan's is that I didn't pass in the current thread to the Object Tracker thread and I only used the non-timeout version of ReferenceQueue.remove(). I also didn't use ReferenceQueue.poll in case you wanted to throw that in there somehow. How did my program still work? 5 and a half points for the first person to answer.  
  
> import java.lang.ref.\*;  
> import java.util.\*;  
>   
> class WarmupQuestion {  
>     private static ArrayList list = track(new ArrayList());  
>     static public void main(String[] args) throws Exception {  
>         track(new WarmupQuestion());  
>         System.gc();  
>         Integer i = track(150);  
>         track(new int[1024 \* 1024]);  
>         System.gc();  
>         track("Hello");  
>         i = null;  
>         System.gc();  
>     }  
>   
>     public void finalize() {  
>         list.add(this);  
>     }  
>   
>     public static <T> T track(T o) {  
>         return ObjectTracker.track(o);  
>     }  
>   
>     static class TrackedObject {  
>         private StackTraceElement[] mStack = new Exception().getStackTrace();  
>         private Reference mPhantomRef;  
>         private Reference mWeakRef;  
>         private Class<?> mCls;  
>         private Date mCreated = new Date();  
>   
>         public TrackedObject(Object obj, ReferenceQueue allrefs) {  
>             mPhantomRef = new PhantomReference(obj, allrefs);  
>             mWeakRef = new WeakReference(obj);  
>             mCls = obj.getClass();  
>         }  
>   
>         public Reference getRef() {  
>             return mPhantomRef;  
>         }  
>   
>         private void trace() {  
>             for (int i = 3; i < mStack.length; i++)  
>                 System.out.println(mStack[i].toString());  
>         }  
>   
>         public void die(Date killed) {  
>             System.out.println(String.format(  
>                     "object of type %s lived for %d ms", mCls, killed.getTime()  
>                             - mCreated.getTime()));  
>             trace();  
>         }  
>   
>         public void die() {  
>             String format = (mWeakRef.get() == null)   
>                 ? "object of type %s has a finalize that raises the dead."  
>                 : "object of type %s lived until program exit.";  
>             System.out.println(String.format(format, mCls));  
>             trace();  
>         }  
>     }  
>   
>     static class ObjectTracker extends Thread {  
>         private static ReferenceQueue mRefs = new ReferenceQueue();  
>         private static Map<Reference, TrackedObject> mTracked =   
>             new HashMap<Reference, TrackedObject>();  
>         private Thread mMain;  
>   
>         public ObjectTracker(Thread thread) {  
>             mMain = thread;  
>         }  
>   
>         public static <T> T track(T o) {  
>             TrackedObject tracked = new TrackedObject(o, mRefs);  
>             mTracked.put(tracked.getRef(), tracked);  
>             return o;  
>         }  
>   
>         public void run() {  
>             try {  
>                 Reference o = null;  
>                 while (mMain.isAlive() || null != (o = mRefs.remove(1000))) {  
>                     if (o != null) {  
>                         mTracked.remove(o).die(new Date());  
>                     }  
>                 }  
>                 for (TrackedObject tracked : mTracked.values()) {  
>                     tracked.die();  
>                 }  
>             } catch (InterruptedException e) {  
>                 throw new RuntimeException(e);  
>             }  
>         }  
>     }  
>   
>     static {  
>         new ObjectTracker(Thread.currentThread()).start();  
>     }  
> }