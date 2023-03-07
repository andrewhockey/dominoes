
/******************************************
'*                                        *
'*   DOMINOES   by  Jim Hockey            *
'*   --------       41 Steel Street       *
'*                  Jesmond NSW 2299      *
'*                  Australia             *
'*   25-OCT-89      Phone (049) 52 2xxx   *
'*                                        *
'******************************************
'*                                        *
'*   PORTED     by  Andrew Hockey         *
'*   ------         From AmigaBASIC       *
'*                  To Javascript         *
'*                  Because               *
'*   06-MAR-23      Why the heck not?     *
'*                                        *
'*****************************************/


"use strict";

function GotMouse() {

//    Initial screen

    if (scrn == 1) {
        SetupGameScreen(); DisplayBoneCounts();
        DisplayGameScores(); DisplayNumsPlayed();
        bonewanted = 0; sidewanted = 0;
        mess = "Select HARD or EASY and then NEW GAME.";
        DisplayMess(); TieSound();
        return GotMouse_exit;
    }

//    Game screen

    if (scrn == 2) {
        if (mx > 8 && mx < 56) {
            if (my > 180 && my < 194) { return Terminate; }
            if (my > 164 && my < 178) { Instructions(); return GotMouse_exit; }
            if (my > 140 && my < 162) { return NewGame; }
            if (my > 108 && my < 120) {
                if (level == 1) { level = 2; } else { level = 1; }
                color(0,1); locate(15,3);
                if (level == 1) { print("EASY"); } else { print("HARD"); }
                return GotMouse_exit;
            }
        }
        else if (bonewanted == 1 && mx > 65 && mx < 103) {
            if (my > 23 && my < 192) {
                hplay = Math.trunc((my - 15) / 8); if (hplay > hlim) { return GotMouse_exit; }
                return HumanSelectedBone;
            }
        }
        else if (sidewanted == 1 && my > 36 && my < 66) {
            sidewanted = 0;
            if (mx > 215 && mx < 265) { side = 1; return HumanPlays; }
            if (mx > 295 && mx < 345) { side = 2; return HumanPlays; }
            sidewanted = 1; return GotMouse_exit;
        }
    }

//    Instructions screen

    if (scrn == 3) {
        if (mx > 343 && mx < 393) { return Terminate; }
        if (mx > 215 && mx < 321) { return ResumeGame; }
    }

    return GotMouse_exit;
}

function GotMouse_exit() {
    return null;
}

//    Amys turn

function AmysTurn() {
    if (hlim < 1 || alim < 1 || acantgo + hcantgo == 2) { return GameFinished }
    pc = 0; acantgo = 0;
    for (i = 1; i <= alim; i++) {
        ppb = ahand[i]; MatchBones();
        if (match > 0) { pc = pc + 1; aplay = i; side = match; }
    }
    if (pc == 0) {
        if (yardlim > 0) {
            alim = alim + 1; ahand[alim] = yard[yardlim];
            mess = "Amy draws " + bone_s[ahand[alim]]; DisplayMess();
            yardlim = yardlim - 1; DisplayBoneCounts();
            return AmysTurn;
        }
        acantgo = 1;
        return HumansTurn;
    }

    if (pc == 1) { return AmyPlays; }
  
    if (level == 1) { return AmyPlays; }

    mess = "Amy is thinking."; DisplayMess();

//    Determine which side bones are playable on.

    lcnt = 0; rcnt = 0;
    for (i = 1; i <= alim; i++) {
        lb = bone_i[ahand[i]][0]; lr = bone_i[ahand[i]][1];
        if (lb == curbonel) { lcnt = lcnt + 1; lll[lcnt] = i; }
        if (lb == curboner) { rcnt = rcnt + 1; rrr[rcnt] = i; }
        if (lr == curbonel && lb != lr) { lcnt = lcnt + 1; lll[lcnt] = i; }
        if (lr == curboner && lb != lr) { rcnt = rcnt + 1; rrr[rcnt] = i; }
    }

//    We now evaluate Amy's hand. We determine every playable combination.
//    Variables used reflect where bone is playable.
//    l1 = Playable on left.
//    l2 = Playable on l1.
//    r1 = Playable on right.
//    r2 = Playable on r1.

    pl = 0; rsvl = 0; rsvr = 0; l1_i = 0; r1_i = 0;
    l1_s = ""; l2_s = ""; r1_s = ""; r2_s = "";
    return AmysTurnL1;
}

function AmysTurnL1() {
    if (lcnt == 0) { return AmysTurnR1; }
    l1_i = l1_i + 1; if (l1_i > lcnt) { return AmysTurnPlay; }
    z = lll[l1_i]; if (bone_i[ahand[z]][0] == curbonel) { x_i = 1; } else { x_i = 0; }
    newleft = bone_i[ahand[z]][x_i];
    l1_s = String.fromCharCode(ahand[z]); x_s = l1_s + "x"; xl = x_s.length;
    if (xl == pl) { if (x_s != play.substring(play.length - pl)) { play = play + x_s; } }
    if (xl > pl) { play = x_s; pl = x_s.length; }
    rsvl = z; r1_i = 0; l2_i = 0;
    if (rcnt == 0) { return AmysTurnL2; }
    return AmysTurnR1;
}

function AmysTurnR1() {
    rsvr = 0; r1_i = r1_i + 1;
    if (r1_i > rcnt) { if (lcnt == 0) { return AmysTurnPlay; } else { return AmysTurnL1; } }
    z = rrr[r1_i]; if (z == rsvl) { return AmysTurnR1; }
    if (bone_i[ahand[z]][0] == curboner) { x_i = 1; } else { x_i = 0; }
    newright = bone_i[ahand[z]][x_i];
    r1_s = String.fromCharCode(ahand[z]); x_s = l1_s + "x" + r1_s; xl = x_s.length;
    if (xl == pl) { if (x_s != play.substring(play.length - pl)) { play = play + x_s; } }
    if (xl > pl) { play = x_s; pl = x_s.length; }
    rsvr = z; l2_i = 0; r2_i = 0;
    if (lcnt == 0) { return AmysTurnR2; }
    return AmysTurnL2;
}

function AmysTurnL2() {
    l2_s = ""; l2_i = l2_i + 1;
    if (l2_i > alim) { if (rcnt == 0) { return AmysTurnL1; } else { return AmysTurnR1; } }
    if (!(l2_i == rsvl || l2_i == rsvr)) {
        if (bone_i[ahand[l2_i]][0] == newleft) { l2_s = String.fromCharCode(ahand[l2_i]); }
        if (bone_i[ahand[l2_i]][1] == newleft) { l2_s = String.fromCharCode(ahand[l2_i]); }
    }
    if (l2_s != "") {
        x_s = l2_s + l1_s + "x" + r1_s; xl = x_s.length;
        if (xl == pl) { if (x_s != play.substring(play.length - pl)) { play = play + x_s; } }
        if (xl > pl) { play = x_s; pl = x_s.length; }
        if (pl == 4) {
            if (double_i[l1_s.charCodeAt(0)] == 1) {
                play = play.substring(play.length - 4); return AmysTurnPlay;
            }
        }
    }
    if (rcnt == 0) { return AmysTurnL2; }
    r2_i = 0;
    return AmysTurnR2;
}

function AmysTurnR2() {
    r2_s = ""; r2_i = r2_i + 1;
    if (r2_i > alim) { if (lcnt == 0) { return AmysTurnR1; } else { return AmysTurnL2; } }
    if (!(r2_i == rsvl || r2_i == rsvr)) {
        if (bone_i[ahand[r2_i]][0] == newright) { r2_s = String.fromCharCode(ahand[r2_i]); }
        if (bone_i[ahand[r2_i]][1] == newright) { r2_s = String.fromCharCode(ahand[r2_i]); }
    }
    if (r2_s == "") { return AmysTurnR2; }
    x_s = l2_s + l1_s + "x" + r1_s + r2_s; xl = x_s.length;
    if (xl == pl) { if (x_s != play.substring(play.length - pl)) { play = play + x_s; } }
    if (xl > pl) { play = x_s; pl = x_s.length; }
    if (pl == 4) {
        if (double_i[r1_s.charCodeAt(0)] == 1) {
            play = play.substring(play.length - 4); return AmysTurnPlay;
        }
        return AmysTurnR2;
    }
    if (pl == 5) {
        if (double_i[r1_s.charCodeAt(0)] == 1) {
            play = play.substring(play.length - 5); return AmysTurnPlay;
        }
        else if (double_i[l1_s.charCodeAt(0)] == 1) {
            play = play.substring(play.length - 5); return AmysTurnPlay;
        }
    }
    return AmysTurnR2;
}

//    We now work out which bone to play. The variable play$ will contain
//    combinations in the following formats.
//
//       LLxRR   or   LLxR   or   LLx   or   Lx
//                    LxRR        LxR        xR
//                                xRR
//
//    where the innermost L's and R's represent playable bones.
 
function AmysTurnPlay() {
    last = (play.length - pl) + 1; priority = 0;
    if (pl == 3) { return AmysTurnPlay3; }
    if (pl == 4) { return AmysTurnPlay4; }
    if (pl == 5) { return AmysTurnPlay5; }
    return AmysTurnPlay2;
}

//    Handle Lx and xR combinations.
//    Play first doublet found or last combo found.

function AmysTurnPlay2() {
    for (i = 1; i <= last; i += 2) {
        pp1 = play.substring(i - 1, i).charCodeAt(0);
        pp2 = play.substring(i, i + 1).charCodeAt(0);
        if (pp1 == 120) { if (double_i[pp2] == 1) { i = last; } }
        if (pp2 == 120) { if (double_i[pp1] == 1) { i = last; } }
    }
    x_i = pp1; side = 1; if (pp1 == 120) { x_i = pp2; side = 2; }
    aplay = 1; while (ahand[aplay] != x_i) { aplay = aplay + 1; }
    aplay2++;
    return AmyPlays;
}
  
//    Handle LLx, LxR and xRR combinations.
//    Priorities = 1. LxR with no doublet.
//                 2. LLx or xRR with no doublet.
//                 3. LLx or xRR with outer doublet.
//                 4. LxR with doublet.
//                 5. LLx or xRR with inner doublet.

function AmysTurnPlay3() {
    for (i = 1; i <= last; i += 3) {
        pp1 = play.substring(i - 1, i).charCodeAt(0);
        pp2 = play.substring(i, i + 1).charCodeAt(0);
        pp3 = play.substring(i + 1, i + 2).charCodeAt(0);
        if (pp2 == 120) {
            prty = 1; if (double_i[pp1] == 1 || double_i[pp3] == 1) { prty = 4; }
        }
        else if (pp1 == 120) {
            prty = 2;
            if (double_i[pp3] == 1) { prty = 3; }
            if (double_i[pp2] == 1) { prty = 5; }
        }
        else {
            prty = 2;
            if (double_i[pp1] == 1) { prty = 3; }
            if (double_i[pp2] == 1) { prty = 5; }
        }
        if (prty > priority) { priority = prty; p1 = pp1; p2 = pp2; p3 = pp3; }
    }
    if (p2 == 120) {
        side = 1; x_i = p1; if (double_i[p3] == 1) { side = 2; x_i = p3; }
    }
    else {
        x_i = p2; side = 1; if (pp1 == 120) { side = 2; }
    }
    aplay = 1; while (ahand[aplay] != x_i) { aplay = aplay + 1; }
    aplay3++;
    return AmyPlays;
}
  
//    Handle LLxR and LxRR combinations.
//    Priorities = 1. No doublet on side with two bones.
//                 2. Outer doublet on side with two bones.
//                 3. Inner doublet on side with two bones.

function AmysTurnPlay4() {
    for (i = 1; i <= last; i += 4) {
        pp1 = play.substring(i - 1, i).charCodeAt(0);
        pp2 = play.substring(i, i + 1).charCodeAt(0);
        pp3 = play.substring(i + 1, i + 2).charCodeAt(0);
        pp4 = play.substring(i + 2, i + 3).charCodeAt(0);
        if (pp2 == 120) {
            prty = 1;
            if (double_i[pp4] == 1) { prty = 2; }
            if (double_i[pp3] == 1) { prty = 3; }
        }
        else {
            prty = 1;
            if (double_i[pp1] == 1) { prty = 2; }
            if (double_i[pp2] == 1) { prty = 3; }
            prty = 2;
        }
        if (prty > priority) { priority = prty; p2 = pp2; p3 = pp3; }
    }
    side = 1; x_i = p2; if (p2 == 120) { side = 2; x_i = p3; }
    aplay = 1; while (ahand[aplay] != x_i) { aplay = aplay + 1; }
    aplay4++;
    return AmyPlays;
}

//    Handle LLxRR combinations.
//    Priorities = 1. No doublets.
//                 2. Outer doublet.
//                 3. Inner doublet.

function AmysTurnPlay5() {
    for (i = 1; i <= last; i += 5) {
        pp1 = play.substring(i - 1, i).charCodeAt(0);
        pp2 = play.substring(i, i + 1).charCodeAt(0);
        pp4 = play.substring(i + 2, i + 3).charCodeAt(0);
        pp5 = play.substring(i + 3, i + 4).charCodeAt(0);
        prty = 1;
        if (double_i[pp1] == 1 || double_i[pp5] == 1) { prty = 2; }
        if (double_i[pp2] == 1 || double_i[pp4] == 1) { prty = 3; }
        if (prty > priority) {
            priority = prty; p1 = pp1; p2 = pp2; p4 = pp4; p5 = pp5;
        }
    }
    side = 2; x_i = p4;
    if (double_i[p1] == 1) { side = 1; x_i = p2; }
    if (double_i[p5] == 1) { side = 2; x_i = p4; }
    if (double_i[p2] == 1) { side = 1; x_i = p2; }
    if (double_i[p4] == 1) { side = 2; x_i = p4; }
    aplay = 1; while (ahand[aplay] != x_i) { aplay = aplay + 1; }
    aplay5++;
    return AmyPlays;
}

//    Humans turn

function HumansTurn() {
    if (hlim < 1 || alim < 1 || acantgo + hcantgo == 2) { return GameFinished; }
    pc = 0; hcantgo = 0;
    for (i = 1; i <= hlim; i++) {
        ppb = hhand[i]; MatchBones();
        if (match != 0) { pc = pc + 1; hplay = i; side = match; }
    }
    if (pc == 1) {
        if (side != 3) { return HumanPlays; }
        if (hlim == 1) { return HumanPlays; }
        mess = "Select side to play " + bone_s[hhand[hplay]] + " on.";
        sidewanted = 1; DisplayMess(); Beap1();
        return GotMouse_exit;
    }
    if (pc > 1) {
        bonewanted = 1; mess = "Select your bone."; DisplayMess(); Beap();
        return GotMouse_exit;
    }
    if (yardlim > 0) {
        hlim = hlim + 1; hhand[hlim] = yard[yardlim];
        mess = "You draw " + bone_s[hhand[hlim]]; DisplayMess();
        SortHumansBones(); DisplayHumansBones();
        yardlim = yardlim - 1; DisplayBoneCounts();
        return HumansTurn;
    }
    hcantgo = 1;
    return AmysTurn;
}

//    Human plays

function HumanPlays() {
    pb_i = hhand[hplay]; pb_s = bone_s[pb_i];
    mess = "YOU play " + pb_s + "."; DisplayMess();
    hplayed_i = hplayed_i + 1; hplayed_s[hplayed_i] = pb_s;
    locate(5 + hplayed_i, 61); color(2,3); print(pb_s);
    for (i = hplay; i <= hlim; i++) { hhand[i] = hhand[i + 1]; } hlim = hlim - 1;
    PlayBone(); SortHumansBones(); DisplayHumansBones();
    return AmysTurn;
}

//    Amy plays
  
function AmyPlays() {
    pb_i = ahand[aplay]; pb_s = bone_s[pb_i];
    mess = "AMY plays " + pb_s + "."; DisplayMess();
    aplayed_i = aplayed_i + 1; aplayed_s[aplayed_i] = pb_s;
    locate(5 + aplayed_i, 70); color(2,3); print(pb_s);
    for (i = aplay; i <= alim; i++) { ahand[i] = ahand[i + 1]; }
    alim = alim - 1;
    PlayBone();
    return HumansTurn;
}

//    Play a bone.

function PlayBone() {
    lp = bone_i[pb_i][0]; rp = bone_i[pb_i][1];
    if (side == 1) {
        if (lp == curbonel) { curbonel = rp; } else { curbonel = lp; }
    }
    else if (side == 2) {
        if (rp == curboner) { curboner = lp; } else { curboner = rp; }
    }
    else {
        curbonel = lp; curboner = lp;
    }
    numsplayed[lp] = numsplayed[lp] + 1;
    if (lp != rp) { numsplayed[rp] = numsplayed[rp] + 1; }
    DisplayBoneCounts(); DisplayNumsPlayed();
    DisplayCurrentBone();
}

//    Human has selected a bone

function HumanSelectedBone() {
    ppb = hhand[hplay]; MatchBones(); side = match;
    if (side == 1 || side == 2) {
        bonewanted = 0; return HumanPlays;
    }
    else if (side == 3) {
        bonewanted = 0; sidewanted = 1;
        mess = "Select side to play " + bone_s[hhand[hplay]] + " on.";
        DisplayMess(); Beap1();
    }
    else {
        mess = bone_s[hhand[hplay]] + " cannot be played. Try again.";
        DisplayMess(); WeeWah();
    }
    return GotMouse_exit;
}

//    Return from instructions screen

function ResumeGame() {
    SetupGameScreen();
    DisplayBoneCounts(); DisplayGameScores();
    DisplayHumansBones();
    DisplayCurrentBone();
    DisplayNumsPlayed();
    DisplayMess();
    if (hplayed_i > 0) {
        for (i = 1; i <= hplayed_i; i++) { locate(5 + i, 61); color(2,3); print(hplayed_s[i]); }
    }
    if (aplayed_i > 0) {
        for (i = 1; i <= aplayed_i; i++) { locate(5 + i, 70); color(2,3); print(aplayed_s[i]); }
    }
    return GotMouse_exit;
}

//    Start a new game

function NewGame() {
    SetupGameScreen(); DealHands();
    DisplayBoneCounts(); DisplayGameScores();
    SortHumansBones(); DisplayHumansBones();
    for (i = 0; i <= 6; i++) { numsplayed[i] = 0; }
    aplayed_i = 0; hplayed_i = 0; bonewanted = 0; sidewanted = 0;
    acantgo = 0; hcantgo = 0; side = 7;
    if (hplay > 0) { return HumanPlays; }
    return AmyPlays;
}

//    Display the current bone

function DisplayCurrentBone() {
    color(2,1);
    locate(6,29); print(boneg[curbonel][0]);
    locate(7,29); print(boneg[curbonel][1]);
    locate(8,29); print(boneg[curbonel][2]);
    locate(6,39); print(boneg[curboner][0]);
    locate(7,39); print(boneg[curboner][1]);
    locate(8,39); print(boneg[curboner][2]);
}

//    Display numbers of each bone played
  
function DisplayNumsPlayed() {
    color(2,3);
    for (i = 0; i <= 6; i++) { locate(15, 27 + (i * 3)); printusing(numsplayed[i].toString(), 1); }
}

//    Display empty Game Screen

function SetupGameScreen() {
    color(2,4); cls(); linebf(213,4, 355, 18, 2); linebf(218,6, 350, 16, 5);
    color(2,5); locate(2, 29); print("D O M I N O E S");
    drawbox(2,7,9,1,2,5); locate(2, 7); color(2, 5); print("YOUR HAND");
    drawbox(4,10,3,21,2,5);
    drawbox(2,61,12,1,2,3); locate(2,61); color(2,3); print("BONES PLAYED");
    drawbox(4,61,3,1,2,3); color(2,3); locate(4,61); print("YOU");
    drawbox(6,61,3,19,2,3);
    drawbox(4,70,3,1,2,3); color(2,3); locate(4,70); print("AMY");
    drawbox(6,70,3,19,2,3);
    drawbox(6,29,14,3,2,1); drawbox(6,35,2,3,2,2);
    drawbox(18,21,12,5,2,6); color(2,6);
    locate(18,24); print("BONES"); line(184,144,223,144,2);
    locate(20,21); print(" YARD =");
    locate(21,21); print("  YOU =");
    locate(22,21); print("  AMY =");
    drawbox(18,42,11,5,2,7); color(2,7);
    locate(18,45); print("GAMES"); line(352,144,391,144,2);
    locate(20,43); print("YOU =");
    locate(21,43); print("AMY =");
    locate(22,43); print("TIE =");
    drawbox(11,27,19,5,2,3); color(0,3);
    locate(11,27); print("PLAYED BONES COUNTS"); line(207,88,358,88,0);
    locate(13,27); print("0  1  2  3  4  5  6");
    color(2,3);
    for (var cc = 27; cc <= 45; cc += 3) { drawbox(15,cc,1,1,2,3); }
    drawbox(24,17,40,1,2,1);
    color(0,1); drawbox(15,3,4,1,2,1); locate(15,3);
    if (level == 1) { print("EASY"); } else { print("HARD"); }
    drawbox(19,3,4,2,2,1); locate(19,3); print("NEW"); locate(20,3); print("GAME");
    drawbox(22,3,4,1,2,1); locate(22,3); print("HELP");
    drawbox(24,3,4,1,2,1); locate(24,3); print("QUIT");
    color(2,3); drawbox(24,77,1,1,2,3); locate(24,77); print("!");
    scrn = 2;
}

//    Print message

function DisplayMess() {
    color(2,1); locate(24,17); print(" ".repeat(40));
    locate(24, 17 + Math.floor((41 - mess.length) / 2)); print(mess);
}

//    Display bone counts.

function DisplayBoneCounts() {
    color(2,6); locate(20,29);
    if (yardlim == 0) { print("MT"); } else { printusing(yardlim.toString(), 2); }
    locate(21,29); printusing(hlim.toString(), 2);
    locate(22,29); printusing(alim.toString(), 2);
}

//      Display game scores.

function DisplayGameScores() {
    color(2,7);
    locate(20,49); printusing(hgame.toString(), 3);
    locate(21,49); printusing(agame.toString(), 3);
    locate(22,49); printusing(tgame.toString(), 3);
}

//      Deal Hands.

function DealHands() {
    mess = "Dealing."; DisplayMess();
    for (i = 1; i <= 28; i++) { yard[i] = i; }
    yardlim = 14; hplay = 0; aplay = 0;
    while (hplay == 0 && aplay == 0) {
        for (i = 1; i <= 27; i++) { j = i + Math.round((28 - i) * Math.random()); var t = yard[i]; yard[i] = yard[j]; yard[j] = t; }
        alim = 0; hlim = 0; dbl = -1;
        for (i = 15; i <= 21; i++) { hlim = hlim + 1; hhand[hlim] = yard[i]; }
        for (i = 22; i <= 28; i++) {
            alim = alim + 1; ahand[alim] = yard[i];
            if (double_i[yard[i]] == 1) {
                if (ahand[alim] > dbl) { aplay = alim; dbl = ahand[alim]; }
            }
        }
        SortHumansBones();
        for (i = 1; i <= hlim; i++) {
            if (double_i[hhand[i]] == 1) {
                if (hhand[i] > dbl) { hplay = i; dbl = hhand[i]; aplay = 0; }
            }
        }
    }
}

//      Sort Human's bones.
  
function SortHumansBones() {
    if (hlim > 1) {
        swapsw = 1;
        while (swapsw == 1) {
            swapsw = 0;
            for (i = 1; i <= (hlim - 1); i++) {
                if (hhand[i] > hhand[i + 1]) {
                    var t = hhand[i]; hhand[i] = hhand[i + 1]; hhand[i + 1] = t;
                    swapsw = 1;
                }
            }
        }
    }
}

//      Display Human's bones.
  
function DisplayHumansBones() {
    drawbox(4,10,3,21,2,5); color(2,5);
    if (hlim > 0) { 
        for (i = 1; i <= hlim; i++) { locate(3 + i, 10); print(bone_s[hhand[i]]); }
    }
}

//   Determine bone relationships.

function MatchBones() {
    match = 0;
    il = bone_i[ppb][0]; ir = bone_i[ppb][1];
    jl = curbonel; jr = curboner;
    if (il == ir) {
        if ((jl == jr && il == jl) || il == jl) {
            match = 1;
        }
        else if (il == jr) {
            match = 2;
        }
    }
    else {
        if ((il == jl && ir != jr) || (ir == jl && il != jr)) {
            match = 1;
        }
        else if ((il == jr && ir != jl) || (ir == jr && il != jl)) {
            match = 2;
        }
        else if ((il == jl && ir == jr) || (ir == jl && il == jr)) {
            match = 3;
        }
    }
}

//      Game is finished.
  
function GameFinished() {
    if (alim < 1) {
        mess = "AMY wins."; winner = 1; agame = agame + 1;
    }
    else if (hlim < 1) {
        mess = "YOU win."; winner = 2; hgame = hgame + 1;
    }
    else {
        hb = 0; ab = 0;
        for (i = 1; i <= hlim; i++) { hb = hb + bone_i[hhand[i]][0] + bone_i[hhand[i]][1]; }
        for (i = 1; i <= alim; i++) { ab = ab + bone_i[ahand[i]][0] + bone_i[ahand[i]][1]; }
        if (hb > ab) {
            mess = "AMY wins.  AMY =" + ab + "  YOU =" + hb + ".";
            winner = 1; agame = agame + 1;
        }
        else if (ab > hb) {
            mess = "YOU win.  YOU =" + hb + "  AMY =" + ab + ".";
            winner = 2; hgame = hgame + 1;
        }
        else {
            mess = "TIED game.  YOU & AMY =" + ab + ".";
            winner = 3; tgame = tgame + 1;
        }
    }
    DisplayMess(); DisplayGameScores();
    if (winner == 1) { AmyWinSound(); }
    if (winner == 2) { HumanWinSound(); }
    if (winner == 3) { TieSound(); }
    return GotMouse_exit;
}

//    HouseKeeping

function HouseKeeping() {
    pal = [
        "rgb(  0,   0, 255)",     // Deep blue
        "rgb(255, 255, 255)",     // White
        "rgb(  0,   0,   0)",     // Black
        "rgb(255, 196,   0)",     // Orange
        "rgb(  0, 179,   0)",     // Green
        "rgb(255, 255,   0)",     // Yellow
        "rgb(255,   0,   0)",     // Red
        "rgb(  0, 186, 255)",     // Light Blue
    ];

    color(2,6); cls(); linebf(5, 4, 147, 18, 2); linebf(10, 6, 142, 16, 5);
    color(2,5); locate(2, 3); print("D O M I N O E S");
    locate(2,24); color(2,6); print("by");
    linebf(232, 5, 328, 17, 2); linebf(234, 6, 326, 16, 1);
    locate(2, 31); color(0, 1); print("Jim Hockey");
    linebf(100, 55, 532, 135, 2); linebf(102, 56, 530, 134, 1);
    linebf(104, 57, 528, 133, 2); linebf(106, 58, 526, 132, 5);
    linebf(108, 59, 524, 131, 2); linebf(110, 60, 522, 130, 1);
    linebf(112, 61, 520, 129, 2); linebf(114, 62, 518, 128, 4);
    color(2,4);
    locate(10, 18); print("This game is entirely controlled by the left");
    locate(11, 18); print("mouse button in conjunction with the pointer.");
    locate(13, 18); print("To select one of the options listed down the");
    locate(14, 18); print("left of the screen, simply point to it and");
    locate(15, 18); print("click the left mouse button.");
    hgame=0;agame=0;tgame=0;scrn=1;level=2;

//    Set up bones graphics.

    boneg[0] = ["    ", "    ", "    "];
    boneg[1] = ["    ", " *  ", "    "];
    boneg[2] = [" *  ", "    ", " *  "];
    boneg[3] = [" *  ", " *  ", " *  "];
    boneg[4] = ["*  *", "    ", "*  *"];
    boneg[5] = ["* * ", " *  ", "* * "];
    boneg[6] = ["*  *", "*  *", "*  *"];

//    Create bones.

    c = 28;
    for (i = 6; i >= 0; i--) {
        for (j = i; j >= 0; j--) {
            if (i == j) { double_i[c] = 1; }
            bone_s[c] = i.toString() + ":" + j.toString();
            bone_i[c][0] = i; bone_i[c][1] = j; c = c - 1;
        }
    }
  
    linebf(128, 157, 496, 169, 2); linebf(130, 158, 494, 168, 7);
    locate(21, 19); color(2, 7);
    print("Tickle Rodent's left ear to get under way.");
}

//    End of job
  
function Terminate() {
//  WINDOW CLOSE 2:SCREEN CLOSE 1:SYSTEM
}

//    Instructions

function Instructions() {
    color(2,3); cls(); linebf(5, 4, 147, 18, 2); linebf(10, 6, 142, 16, 5);
    color(2, 5); locate(2, 3); print("D O M I N O E S");
    color(2, 3); locate(4, 1);
    print(" RULES: 1. Play is commenced by the player with the largest 'doublet' playing");
    print("           it (if neither player has a 'doublet' then the deal is repeated).");
    print("        2. If a player is able to do so, then they must play (drawing from");
    print("           the boneyard to try and improve one's hand is not allowed).");
    print("        3. If unable to play, a player must draw from the boneyard until ");
    print("           they are able to play or the boneyard is empty.");
    print("");
    print(" AUTOMATIC PLAY: When it is your turn to play, if you have either a single ");
    print("                 playable bone or need to draw a bone, then the computer will");
    print("                 kindly relieve you of this onerous duty and do it for you.");
    print("");
    print(" PLAYING: 1. When asked to 'Select your bone', point to the bone you wish to");
    print("             play (in the YOUR HAND column) and tickle the Rodent's left ear.");
    print("          2. When asked to 'Select side ....' point to either the left or");
    print("             right side of the 'current bone' display and tickle Rodent.");
    print("");
    print(" HARD/EASY: This toggle type gadget changes the way AMY plays (considerably).");
    print("");
    print(" PLAYED BONES COUNTS: These are for your use (AMY doesn't bother with them).");
    linebf(216, 181, 320, 193, 2); linebf(218, 182, 318, 192, 7);
    locate(24, 29); color(2, 7); print("RESUME GAME");
    linebf(344, 181, 392, 193, 2); linebf(346, 182, 390, 192, 7);
    locate(24, 45); color(2, 7); print("QUIT");
    scrn = 3;
}

//    Sound effects
  
function Beap() {
    sound(880, 1);
}

function Beap1() {
    for (i = 800; i >= 200; i -= 50) { sound(i, 0.2); }
}

function WeeWah() {
    sound(155, 15, 99); sound(110, 20, 99);
}

function AmyWinSound() {
    j = 300; for (i = 1; i <= 16; i++) { j = 500 - j; sound(j, 1, 100); }
}

function TieSound() {
    for (i = 2; i <= 8; i++) { sound(100 * i, 2, 100); } for (j = 1; j <= 2500; j++) { }
    for (i = 7; i >= 2; i--) { sound(100 * i, 2, 100); }
}

function HumanWinSound() {
    for (i = 1; i <= 5; i++) { for (j = 800; j >= 200; j -= 50) { sound(j, 0.2); } } 
}

//    Box Drawing subroutine

function drawbox(rr, cc, ww, dd, c1, c2) {
    var x1, y1, x2, y2;
    x1 = (cc - 2) * 8; y1 = (rr * 8) - 11; x2 = (cc + ww) * 8; y2 = ((rr + dd - 1) * 8) + 1;
    linebf(x1, y1, x2, y2, c1); linebf(x1 + 2, y1 + 1, x2 - 2, y2 - 1, c2);
}

/*======================================================================

    Added Javascript glue code follows \/\/\/

======================================================================*/

// AmigaBASIC vars. All global. All the time.

var ab = 0;
var acantgo = 0;
var alim = 0;
var agame = 0;
var ahand = Array(23).fill(0);          // %(22)      ' Amys hand
var aplay = 0;
var aplay2, aplay3, aplay4, aplay5 = 0;
var aplayed_i = 0;
var aplayed_s = Array(22).fill("");     // $(21)      ' bones played by Amy
var bone_i = Array(29).fill(null).map(() => Array(2).fill(0));  // %(28,1)    ' bone values
var bone_s = Array(129).fill("");           // $(128)     ' bones in display format
var boneg = Array(7).fill(null).map(() => Array(3).fill(""));   // $(6,2)     ' bones graphics
var bonewanted = 0;
var c = 0;
var curbonel = 0;
var curboner = 0;
var dbl = 0;
var double_i = Array(29).fill(0);       // %(28)      ' identifies doubles 
var hb = 0;
var hcantgo = 0;
var hgame = 0;
var hhand = Array(23).fill(0);          // %(22)      ' Humans hand
var hlim = 0;
var hplay = 0;
var hplayed_i = 0;
var hplayed_s = Array(22).fill("");     // $(21)      ' bones played by Human
var i = 0;
var il = 0;
var ir = 0;
var j = 0;
var jl = 0;
var jr = 0;
var l1_i = 0;
var l1_s = "";
var l2_i = 0;
var l2_s = "";
var last = 0;
var lb = 0;
var lcnt = 0;
var level = 2;
var lll = [];
var lp = 0;
var lr = 0;
var match = 0;
var mess = "";
var mx = 0;
var my = 0;
var newleft = 0;
var newright = 0;
var numsplayed = Array(7).fill(0);      // %(6)       ' counts of bones played
var pc = 0;
var pb_i = 0;
var pb_s = "";
var pl = 0;
var play = "";
var p1 = 0;
var p2 = 0;
var p3 = 0;
var p4 = 0;
var p5 = 0;
var pp1 = 0;
var pp2 = 0;
var pp3 = 0;
var pp4 = 0;
var pp5 = 0;
var ppb = 0;
var priority = 0;
var prty = 0;
var r1_i = 0;
var r1_s = "";
var r2_i = 0;
var r2_s = "";
var rcnt = 0;
var rsvl = 0;
var rsvr = 0;
var rp = 0;
var rrr = [];
var scrn = 1;
var side = 0;
var sidewanted = 0;
var swapsw = 0;
var tgame = 0;
var winner = 0;
var x_i = 0;
var x_s = "";
var xl = 0;
var yard = Array(29).fill(0);           // %(28)      ' shuffled bones
var yardlim = 0;
var z = 0;

// Various Javascript glue vars

var screencanvas;
var screenctx;
var numautogames = 100;
var autogames = 0;
var autoclickdelay = 1;
var autoclickpos = [];
var pal = [];
var fgcol = 0;
var bgcol = 0;
var locx = 0;
var locy = 0;
const canvasw = 1280;
const canvash = 400;
const sx = canvasw / 640;
const sy = canvash / 200;
const textw = Math.floor(8 * sx);

// Main program entry point

function dominoes() {
    screencanvas = document.getElementById("screencanvas");
    screenctx = screencanvas.getContext("2d");
    screenctx.imageSmoothingEnabled = false;
    screenctx.font = textw + "px courier";
    screenctx.textAlign = "left";
    screenctx.textBaseline = "top";

    screencanvas.addEventListener('click', function(event) {
        mx = event.pageX - (screencanvas.offsetParent.offsetLeft + screencanvas.offsetLeft);
        my = event.pageY - (screencanvas.offsetParent.offsetTop + screencanvas.offsetTop);
        mx = Math.floor(mx * (640 / screencanvas.scrollWidth));
        my = Math.floor(my * (200 / screencanvas.scrollHeight));

        // Click on the "!" button on bottom right of Game screen for autoplay
        if (mx > 600 && mx < 624 && my > 180 && my < 194 && scrn == 2) {
            agame = hgame = tgame = 0;
            aplay2 = aplay3 = aplay4 = aplay5 = 0;
            autogames = numautogames;
            autoclickpos.push([22,147]);    // New Game
            setTimeout(autoclick, autoclickdelay);
        }
        else {
            // Normal play. Note: Tricks to emulate GOTO
            for (var f = GotMouse; f != null; ) f = f();
        }
    }, false);

    HouseKeeping();
}

// Autoclicker to quickly play many games and report some stats

function autoclick() {
    [mx, my] = autoclickpos.shift();
    for (var f = GotMouse; f != null; ) f = f();

    if (!autoclickpos.length) {
        if (mess.includes("win") || mess.includes("TIED")) {
            if (--autogames) {
                autoclickpos.push([22,147]);    // New Game
            }
            else {
                color(2,3); drawbox(5,24,26,11,2,3); locate(5,24);
                print("       STATISTICS"); print("");
                print(" LEVEL: " + (level == 1 ? "EASY" : "HARD"));
                print(" HUMAN WIN % " + hgame);
                print("   AMY WIN % " + agame);
                print("       TIE % " + tgame);
                print("  AMY PLAY 2 " + aplay2);
                print("  AMY PLAY 3 " + aplay3);
                print("  AMY PLAY 4 " + aplay4);
                print("  AMY PLAY 5 " + aplay5);
            }
        }
        else {
            autoclickpos.push([78,27 + (Math.floor((Math.random() * hlim)) * 8)]);    // Bone
            autoclickpos.push([240,50]);   // Side
        }
    }

    if (autoclickpos.length) {
        setTimeout(autoclick, autoclickdelay);
    }
}

// Funcs to emulate AmigaBASIC things

function print(message) {
    var x = locx;
    for (var i = 0; i < message.length; i++) {
        screenctx.fillStyle = pal[bgcol];
        screenctx.fillRect(x, locy, textw, textw);
        screenctx.fillStyle = pal[fgcol];
        screenctx.fillText(message[i], x, locy);
        x += textw;
    }
    locy += textw;
}

function printusing(message, digits) {
    var y = locy;
    print(" ".repeat(digits));
    locy = y;
    print(message);
}

function locate(row, col) {
    // Locate origin is at 1, 1. Correct it to 0, 0
    locx = (col - 1) * textw;
    locy = (row - 1) * textw;
}

function cls() {
    screenctx.fillStyle = pal[bgcol];
    screenctx.fillRect(0, 0, canvasw, canvash);
    document.body.style.background = pal[bgcol];
}

function color(fg, bg) {
    fgcol = fg;
    bgcol = bg;
}

function line(x1, y1, x2, y2, col) {
    x1 = Math.floor(x1 * sx);
    y1 = Math.floor(y1 * sy);
    x2 = Math.floor(x2 * sx);
    y2 = Math.floor(y2 * sy);
    screenctx.fillStyle = pal[col];
    screenctx.beginPath();
    screenctx.moveTo(x1, y1);
    screenctx.lineTo(x2, y2);
    screenctx.stroke();
}

function linebf(x1, y1, x2, y2, col) {
    x1 = Math.floor(x1 * sx);
    y1 = Math.floor(y1 * sy);
    x2 = Math.floor(x2 * sx);
    y2 = Math.floor(y2 * sy);
    screenctx.fillStyle = pal[col];
    screenctx.fillRect(x1, y1, x2 - x1, y2 - y1);
}

function sound(frequency, duration, loudness) {
    // TODO
}
