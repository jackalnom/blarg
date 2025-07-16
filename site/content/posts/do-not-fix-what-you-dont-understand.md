---
author: Lucas Pierce
title: "Do not fix what you don't understand"
date: 2008-11-16T23:31:44
categories: ["Career & Professional"]
tags: ["debugging", "problem-solving", "root-cause-analysis"]
---

It's monday at 2pm and you are working on another bug report. It is a null pointer exception in a class you aren't familiar with.

class Nose  
...  
void upYourNoseWithARubberHose(RubberHose hose) {  
   if (hose.diameter() < 1 inch)  
      noseHose = hose;  
   else  
      throw HoseTooBigForNoseException();  
}  
....  
}

\*yawn\*

hose is null and a null pointer exception is thrown when accessing its diameter. At least this is an easy fix you think to yourself.

if (hose == null || hose.diameter() < 1 inch)

Awesome... bug fixed... just need to commit. "Fixed NPE in upYourNoseWithARubberHose" you type into the comment box.

Just before clicking the commit button a whooshing sound comes from behind you. Whirling around you see a huge man with a large gun.

[![Arnold-schwarzenegger-the-terminator](/terminator.jpg)]

"I've come from the future and I must stop your bug fix. You have no idea what will happen when you make this change. You didn't reproduce the problem. You didn't find the [root cause](http://en.wikipedia.org/wiki/Root_cause_analysis). You didn't talk to someone knowledgeable in this part of the code. You didn't find the person who caused the bug and ask them about the fix. You didn't even test your fix. I'm sorry but for the sake of the future I can't let you commit that change."

The man lowers the gun and fires.

Your monitor disintegrates into a thousand shards of glass and plastic. Next he shoots your keyboard, the letter q smacks you in the forehead as it flies away from the carnage. Your brand new laser mouse is next. You begin to move your hand to shield it from the oversized rounds this future man is shooting but thinking again you pull it back just before he fires. Finally, he takes aim at your computer. At this point you've resigned yourself. This man has travelled back in time to stop you from checking in this horribly stupid bug fix and he means to finish the job. He fires and the hard drives spins for its last time.

He turns and starts to walk away. Just as he exits the door though he turns and he shoots one of the wheels off your chair. Your chair slumps towards where the now missing wheel was throwing your body to one side. Future man smiles with a satisfaction that only comes from knowing one has done a thorough job. Future man wonders why you couldn't have been as thorough in your own bug fixing in finding the root cause of the problem before carelessly throwing around fixes.

As you sit in the carnage of your computer equipment, slanted to one side in your broken chair, smelling the still fresh smoke you think over what you learned today. The future man's words echo in your brain...  
"You have no idea what will happen when you make this change. You didn't reproduce the problem. You didn't find the root cause. You didn't talk to someone knowledgeable in this part of the code. You didn't find the person who caused the bug and ask them about the fix. You didn't even test your fix."

Your left to ponder what future your simple bug fix had unintentionally caused that it would induce man to invent time travel to send someone back to stop you. Truly horrible it must have been and with that you promise in the name of the future man with the big gun to never make another bug fix on a problem that you don't understand.

**Related posts on debugging:**
- [Persistence: The long lost virtue of fixing a bug](/posts/persistence-the-long-lost-virtue-of-fixing-a-bug/) - How to develop the persistence needed to truly fix difficult bugs