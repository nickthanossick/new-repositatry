/* ═════════════ English text layer ═════════════
   Every line the player reads is shown in English. The game's own strings
   stay exactly as written, because the voice-over is looked up by them — the
   translation happens on the way into the DOM: innerHTML and textContent
   writes pass through riEN(), which tries the exact line, then a pattern for
   the lines that are built at run time, then each text run between tags.   */
const RI_EN_PAIRS=[
  /* Naina */
  ['“Pandit, tera khoon pee jaungi.”','“Pandit, I will drink your blood.”'],
  ['“Pandit, chala ja.”','“Pandit, go away.”'],
  ['“Mujhe mere bache se koi nahi cheen sakti.”','“No one can take my child from me.”'],
  ['“Sab marenge.”','“Everyone will die.”'],
  ['“Sabko mar dungi.”','“I will kill you all.”'],
  ['“Chala Jaa werna tera khoon pee jaungi”','“Leave, or I will drink your blood.”'],
  ['“Mera bachcha kahan hai?”','“Where is my baby?”'],
  ['Mera bachcha kahan hai?','Where is my baby?'],
  ['mera bachcha kahan hai?','where is my baby?'],
  ['“Mera… bachcha…”','“My… baby…”'],
  ['“Mera bachcha mujhe de do!”','“Give me my baby!”'],
  ['“Chala ja!”','“Get out!”'],
  ['“Mere bachche ko mujhse koi nahi cheen sakta!”','“No one can take my baby from me!”'],
  ['“TERA GALA KAAT DUNGI!”','“I WILL SLIT YOUR THROAT!”'],
  ['“Doctor saab…”','“Doctor…”'],
  ['“Ek baar dekh lo…”','“Just look at him once…”'],
  ['“Mera bachcha saans le raha hai…”','“My baby is breathing…”'],
  ['“DEKH LO!”','“LOOK AT HIM!”'],
  ['“Mera bachcha… roya tha?”','“My baby… cried?”'],
  ['“To usne… mujhe mehsoos kiya tha?”','“So he… felt me?”'],
  ['“Mujhe yahan se jaane nahi dete the.”','“They wouldn’t let me leave.”'],
  ['Sab bolte rahe... mar gaya.','They all kept saying... he’s dead.'],
  ['Mere... das minute.','My... ten minutes.'],
  ['Maine kaha tha na...','I told you...'],
  ['JHOOTH BOLA THA!','YOU LIED!'],
  ['Bas ek baar... dikha dete...','Just once... you could have shown me...'],
  /* Dev */
  ['“Haan.”','“Yes.”'],
  ['“Tumhara bachcha zinda paida hua tha.”','“Your baby was born alive.”'],
  ['Tumhara bachcha zinda paida hua tha.','Your baby was born alive.'],
  ['“Usse sach bata dena.”','“Tell her the truth.”'],
  ['Naina... main tumhe maarne nahi aaya.','Naina... I didn’t come here to kill you.'],
  ['Ye jagah... ise yaad hai.','This place... it remembers.'],
  ['Ye bhoot jagah jagah nahi bhatak raha.','This ghost isn’t wandering at random.'],
  ['Ye us raat ko dobara jee raha hai. Mujhe wo raat chahiye.','It’s living that night again. I need that night.'],
  ['Ye bachcha khud nahi mara.','This baby didn’t just die.'],
  ['Ek second… bachcha roya tha.','Wait… the baby cried.'],
  ['Emergency line… chal.','Emergency line… come on.'],
  ['Tu hospital me nahi mari…','You didn’t just die in this hospital…'],
  ['Tujhe marne diya gaya.','You were left to die.'],
  ['Isse maarna nahi hai.','I’m not here to kill her.'],
  ['Isse sirf sabooot chahiye ki uska bachcha tha.','She only needs proof that her baby existed.'],
  ['Ab koi nahi rokega.','No one will stop you now.'],
  ['Theek hai. Andar se hi raasta dhoondhna padega.','Fine. I’ll have to find a way through from inside.'],
  ['Lift phir band. Paidal hi utarna hoga.','The lift died again. I’ll have to walk down.'],
  ['IGMC. Raat ke do bajkar chalis minute. Torch on rakhna.','IGMC. Two-forty in the morning. Keep the torch on.'],
  ['Kaun bol raha hai?','Who is this?'],
  ['Kyun?','Why?'],
  ['To?','So?'],
  ['Khatam?','Is it over?'],
  ['Aur... hospital?','And... the hospital?'],
  ['Tune bhi suna?','Did you hear that too?'],
  /* nurse, doctor, radio, pandit, police */
  ['“Sir, patient ko bleeding ho rahi hai.”','“Sir, the patient is bleeding.”'],
  ['“File me kuch nahi jayega. Samjhi?”','“Nothing goes in the file. Understood?”'],
  ['“Emergency C-section karna padega!”','“We need an emergency C-section!”'],
  ['“Consultant ko call mat karo. Main handle kar lunga.”','“Don’t call the consultant. I’ll handle it.”'],
  ['Pandit ji, chudail ko control karne ka ek hi tarika hai. Second floor pe havan kund laga hai. Wahin pahunch ke ye chudail control hogi.',
   'Pandit ji, there is only one way to bind the witch. There is a havan kund on the second floor. Only there can she be bound.'],
  ['…kkkhhh… Pandit ji, nikal jao. Abhi.','…kkkhhh… Pandit ji, get out. Now.'],
  ['Purani file mil gayi hai.','We found the old file.'],
  ['Doctor jisne operation kiya tha… usne suicide nahi kiya tha.','The doctor who operated… didn’t kill himself.'],
  ['Uski body hospital ke andar mili thi.','His body was found inside the hospital.'],
  ['Ab le ja.','Take it now.'],
  ['Bachcha... nahi raha.','The baby... didn’t make it.'],
  /* intro */
  ['Raat 2:00 baje... ek aurat ko IGMC laya gaya.','2:00 AM... a woman was brought to IGMC.'],
  ['Uski delivery hone wali thi.','She was about to give birth.'],
  ['Ek galti... aur bachcha paida hote hi mar gaya.','One mistake... and the baby died the moment it was born.'],
  ['Doctor ne kaha — “Bachcha nahi raha.”','The doctor said — “The baby didn’t make it.”'],
  ['Woh sach bardasht nahi kar paayi.','She could not bear the truth.'],
  ['Das minute baad... uski saansein bhi ruk gayin.','Ten minutes later... she stopped breathing too.'],
  ['Us raat ke baad... IGMC mein kuch badal gaya.','After that night... something changed in IGMC.'],
  ['Hospital khaali kar diya gaya. Ek Pandit ko bulaya gaya.','The hospital was emptied. A Pandit was called in.'],
  ['Hospital ko shuddh karo... warna woh kisi ko zinda bahar nahi jaane degi.','Cleanse the hospital... or she will let no one leave alive.'],
  /* torch */
  ['CELL READY — R se badlo','CELL READY — PRESS R'],
  ['CELL ABHI CHAL RAHA HAI','CELL STILL HAS CHARGE'],
  ['Koi spare cell nahi','No spare cells'],
  ['NAYA CELL LAGA','NEW CELL FITTED'],
  ['TORCH BUJH GAYI — 45s TAK NAYA CELL NAHI LAGEGA','TORCH DEAD — NO NEW CELL FOR 45s'],
  ['EK TORCH CELL GAYAB HAI','A TORCH CELL IS MISSING'],
  /* prompts */
  ['ANDAR JAAO PEHLE','GO INSIDE FIRST'],
  ['TEST: CHUDAIL HATAYI','TEST: NAINA DISMISSED'],
  ['Test mode — usne tujhe pakad liya.','Test mode — she caught you.'],
  ['TEST: CHUDAIL AA GAYI · J = wapas bhejo','TEST: NAINA SUMMONED · J TO SEND BACK'],
  ['<b>E</b> — IGMC KE ANDAR JAAO','<b>E</b> — ENTER IGMC'],
  ['<b>E</b> — JAM HAI','<b>E</b> — JAMMED'],
  ['<b>E</b> — BAND KARO','<b>E</b> — CLOSE'],
  ['<b>E</b> — KHOLO','<b>E</b> — OPEN'],
  ['<b>E</b> — CHHAT KA DARWAZA','<b>E</b> — ROOF DOOR'],
  ['<b>E</b> — LIFT KA BUTTON','<b>E</b> — LIFT BUTTON'],
  ['<b>E</b> — LIFT BULAAO','<b>E</b> — CALL THE LIFT'],
  ['<b>E</b> — CASSETTE CHALAO','<b>E</b> — PLAY THE TAPE'],
  ['<b>E</b> — DIYA JALAO','<b>E</b> — LIGHT THE LAMP'],
  ['<b>E</b> — GHANTI BAJAO','<b>E</b> — RING THE BELL'],
  ['CHAABI LAGI','KEY USED'],
  ['BAND HAI — chaabi chahiye','LOCKED — NEEDS A KEY'],
  ['JAM HAI','JAMMED'],
  ['[ E / CLICK — BAND KARO ]','[ E / CLICK — CLOSE ]'],
  /* deaths */
  ['Naina ne Dev ko pakad liya.','Naina caught Dev.'],
  ['Usne tujhe chhoo liya.','She touched you.'],
  ['Usne tujhe chhoo liya','She touched you'],
  ['Naina ne tujhe corridor me pakad liya.','Naina caught you in the corridor.'],
  ['Corridor me usne tujhe pakad liya.','She caught you in the corridor.'],
  ['Floor 4 ke corridor me usne tujhe pakda.','She caught you in the Floor 4 corridor.'],
  ['Floor 5 ke andhere me wo tujh tak pahunch gayi.','She reached you in the dark on Floor 5.'],
  ['Andhere me wo tere paas aa gayi thi.','In the dark, she got right up to you.'],
  ['Upar ke floors pe wo ruk nahi rahi thi.','On the upper floors she would not stop.'],
  ['Floor 7 aur 8 pe wo seedha shikaar kar rahi thi.','On Floors 7 and 8 she was hunting you.'],
  ['Floor 9 se upar jaate waqt wo bilkul peeche aa gayi.','Climbing from Floor 9, she came right up behind you.'],
  ['Floor 10 pe wo aakhir tak peeche thi.','On Floor 10 she was behind you to the very end.'],
  ['Night Shift me Naina ne corridor band kar diya.','During the night shift Naina sealed the corridor.'],
  ['Naina ke phenke hue samaan ne Dev ko gira diya.','The things Naina threw knocked Dev down.'],
  ['Naina ne Dev ko havan kund tak pahunchne nahi diya.','Naina kept Dev from reaching the havan kund.'],
  ['Neeche utarte waqt Naina ne Dev ko pakad liya.','Naina caught Dev on the way down.'],
  ['Naina ne tujhe pehli baar dekhte hi maar diya.<br/><br/>Ab asli <em>Mission 1</em> shuru hoga.',
   'Naina killed you the moment she saw you.<br/><br/>Now the real <em>Mission 1</em> begins.'],
  ['Is scripted death me koi life consume nahi hui.','This scripted death did not cost a life.'],
  ['PEHLI MULAKAAT','FIRST ENCOUNTER'],
  ['NAINA TERA GALA DABA RAHI HAI','NAINA IS CHOKING YOU'],
  ['Mauke khatam. Ab <em>mission shuru</em> se.','No lives left. Back to the <em>start of the mission</em>.'],
  ['Wahin se phir','Retry'],
  ['Mission shuru se','Restart mission'],
  ['AAKHRI MAUKA','LAST LIFE'],
  /* rules and documents */
  ['RULE YAAD: seedhi torch me wo dheemi padti hai.','RULE LEARNED: a torch held on her slows her down.'],
  ['RULE YAAD: bachche ki rone ki awaaz uska dhyaan todti hai.','RULE LEARNED: a baby’s cry pulls her attention away.'],
  ['RULE YAAD: ghanti usse ek pal ke liye rok sakti hai.','RULE LEARNED: a bell can stop her for a moment.'],
  ['02:10 — Ward 2 se phir bachche ke rone ki complaint.<br/>02:16 — security ne corridor check kiya. <b>Koi bachcha admit nahi.</b>',
   '02:10 — Ward 2 reports a baby crying again.<br/>02:16 — security checked the corridor. <b>No baby is admitted.</b>'],
  ['PENCIL NOTE — WALL KE PAAS','PENCIL NOTE — BY THE WALL'],
  ['“Agar wo saamne aa jaye to bhaagna mat. <b>Torch seedhi uske chehre pe rakho.</b> Roshni me uske pair rukte hain.”',
   '“If she comes at you, don’t run. <b>Keep the torch right on her face.</b> In the light, her feet stop.”'],
  ['— naam mita hua hai','— name rubbed out'],
  ['Nursery ka speaker phir se bachche ki recording chala raha tha. Ajeeb baat: corridor wali aurat <b>awaaz sunte hi nursery ki taraf mud gayi.</b>',
   'The nursery speaker was playing the baby recording again. Strange thing: the woman in the corridor <b>turned towards the nursery the moment she heard it.</b>'],
  ['Prayer room ki ghanti raat me khud baji. Camera me safed kapdon wali aurat <b>do kadam peeche hati</b>. Recording damaged.',
   'The prayer room bell rang by itself at night. On camera, the woman in white <b>stepped back twice</b>. Recording damaged.'],
  ['12 March — Maternity<br/><b>Asha Verma</b> — 20:00 to 08:00<br/>Consultant on call — entry black ink se kaat di gayi hai.',
   '12 March — Maternity<br/><b>Asha Verma</b> — 20:00 to 08:00<br/>Consultant on call — entry struck out in black ink.'],
  ['Oxytocin — issued 23:18<br/>Blood requested — 23:31<br/>Blood received — <b>00:06</b><br/><br/>Neeche likha hai: “too late.”',
   'Oxytocin — issued 23:18<br/>Blood requested — 23:31<br/>Blood received — <b>00:06</b><br/><br/>Written underneath: “too late.”'],
  ['CHAANDI KI PAAYAL','SILVER ANKLET'],
  /* mission 1 */
  ['FINAL RITUAL — AB KOI BREAK NAHI.','FINAL RITUAL — NO MORE BREAKS.'],
  ['Ground floor explore karo','Explore the ground floor'],
  ['Abhi sirf hospital ko dekho.','For now, just look around.'],
  ['Rone ki aawaz ka source dhundo','Find where the crying comes from'],
  ['Ground floor — teen jagah','Ground floor — three rooms'],
  ['Ground floor pe <b>teen</b> kamre check karne hain. Teer sabse paas wale pe hai — andar jaake dekho, phir agla. Torch <b>F</b> se on/off hota hai.',
   'Check <b>three</b> rooms on the ground floor. The arrow points to the nearest — look inside, then the next. <b>F</b> switches the torch.'],
  ['Rona ab doosri taraf se aa raha hai.','The crying comes from the other side now.'],
  ['Maternity register dhundo','Find the maternity register'],
  ['Duty room me ek <b>register</b> pada hai. Teer ke peeche jao, uske paas khade hoke <b>E</b> dabao.',
   'There is a <b>register</b> in the duty room. Follow the arrow, stand next to it and press <b>E</b>.'],
  ['Dono… ek hi raat.','Both… on the same night.'],
  ['Register duty room me hoga.','The register should be in the duty room.'],
  ['Lift band hai. Seedhi lo.','The lift is dead. Take the stairs.'],
  ['Lift band hai. Seedhi ka darwaza dhundo (teer wahin hai), <b>E</b> se kholo aur <b>Floor 2</b> tak chadho.',
   'The lift is dead. Find the stairwell door (the arrow points there), open it with <b>E</b> and climb to <b>Floor 2</b>.'],
  ['LIFT MURDA HAI','THE LIFT IS DEAD'],
  ['Lift me bijli hi nahi hai.','There is no power to the lift.'],
  ['Corridor ke aakhir tak jao','Go to the end of the corridor'],
  ['Corridor ke doosre sirey pe koi khadi hai.','Someone is standing at the far end of the corridor.'],
  ['Corridor ka doosra sira','Far end of the corridor'],
  ['Floor 2 ke corridor me seedha aage chalo. Doosre sirey pe koi khadi hai — uske <b>10 m</b> ke andar pahunchna hai. Torch on rakho.',
   'Walk straight down the Floor 2 corridor. Someone stands at the far end — get within <b>10 m</b> of her. Keep the torch on.'],
  ['Woh dheere se sar uthaati hai.','She slowly raises her head.'],
  ['Bhaag. BHAAG!','Run. RUN!'],
  ['Maternity ward tak bhaago','Run to the maternity ward'],
  ['Darwaza band karo','Shut the door'],
  ['<b>BHAAGO.</b> Shift dabaye rakho aur teer ke peeche maternity ward me ghus jao — andar pahunchte hi darwaza apne aap band ho jayega.',
   '<b>RUN.</b> Hold Shift and follow the arrow into the maternity ward — the door shuts by itself once you are inside.'],
  ['Darwaza band. Bahar sab chup ho gaya.','Door shut. Everything outside went quiet.'],
  ['Cradle ke paas dekho','Look near the cradle'],
  ['Ward ke beech me cradle hai. Uske paas jaake <b>E</b> dabao.','There is a cradle in the middle of the ward. Go to it and press <b>E</b>.'],
  /* mission 2 */
  ['Naina se judi teen yaadein dhundo','Find three memories of Naina'],
  ['Teen alag floors — <b>3</b>, <b>4</b> aur <b>5</b> — pe ek-ek cheez hai. Teer hamesha agli cheez pe hi hoga; doosre floor pe jaana ho to teer pehle seedhi dikhayega.',
   'One item each on floors <b>3</b>, <b>4</b> and <b>5</b>. The arrow always points to the next one — if it is on another floor, it shows you the stairs first.'],
  ['Nurse ka ID card — Floor 3','Nurse’s ID card — Floor 3'],
  ['Floor 3 ke office room me nurse ka ID card hai. Teer ke peeche chalo, <b>E</b> dabao.','The nurse’s ID card is in the Floor 3 office. Follow the arrow and press <b>E</b>.'],
  ['Khoon lage surgical cloth — Floor 4','Bloodied surgical cloth — Floor 4'],
  ['Floor 4 ka operation theatre. Andar khoon lage kapde ke paas <b>E</b> dabao.','The Floor 4 operation theatre. Press <b>E</b> at the bloodied cloth inside.'],
  ['Floor 4 pe darwaze khud band ho rahe hain.','On Floor 4 the doors are closing by themselves.'],
  ['Teesri yaad — Floor 5','Third memory — Floor 5'],
  ['Floor 5 — bijli wapas lao','Floor 5 — restore the power'],
  ['Fuse box + do fuse','Fuse box + two fuses'],
  ['Do <b>fuse</b> uthao (teer ek-ek karke dono pe le jayega), phir <b>fuse box</b> pe <b>E</b> dabao. Andhere me wo tez chalti hai — torch on rakho.',
   'Pick up two <b>fuses</b> (the arrow leads to each), then press <b>E</b> at the <b>fuse box</b>. She moves faster in the dark — keep the torch on.'],
  ['Fuse box me dono fuse lagao','Fit both fuses in the fuse box'],
  ['Floor 5 — fuse mil gaye','Floor 5 — fuses found'],
  ['DONO FUSE MIL GAYE — ORANGE FUSE BOX LIGHT FOLLOW KARO','BOTH FUSES FOUND — FOLLOW THE ORANGE LIGHT TO THE FUSE BOX'],
  ['DONO FUSE CHAHIYE','NEED BOTH FUSES'],
  ['Floor 5 pe ghup andhera hai.','Floor 5 is pitch dark.'],
  ['Fuse box — dono fuse lagao','Fuse box — fit both fuses'],
  ['FUSE BOX PE E DABAO','PRESS E AT THE FUSE BOX'],
  ['Records room tak bhaago','Run to the records room'],
  ['Floor 5 — darwaza band karo','Floor 5 — shut the door'],
  ['Records room! Jaldi!','Records room! Hurry!'],
  ['<b>BHAAGO.</b> Records room ka darwaza khula hai — teer ke peeche bhaago aur andar ghus jao.',
   '<b>RUN.</b> The records room door is open — follow the arrow and get inside.'],
  ['Bahar se koi darwaza khuracha raha hai.','Something is scratching at the door outside.'],
  ['Death certificate uthao','Take the death certificate'],
  ['Records room ke andar hi file stack hai. <b>E</b> dabao.','The file stack is inside the records room. Press <b>E</b>.'],
  /* mission 3 */
  ['Basement — generator chalu karo','Basement — start the generator'],
  ['Seedhi se neeche utro','Take the stairs down'],
  ['Seedhi se sabse neeche (<b>BASEMENT</b>) utro. Neeche generator hai — uske paas <b>E</b> dabao.',
   'Take the stairs all the way down to the <b>BASEMENT</b>. Press <b>E</b> at the generator there.'],
  ['Poori building ki bijli chali gayi.','The whole building has lost power.'],
  ['Ye announcement khud chal rahi hai.','This announcement is playing by itself.'],
  ['Basement. Paani tapak raha hai.','Basement. Water is dripping.'],
  ['Torch on rakhi to wo ruk jaati hai.','Keep the torch on and she stops.'],
  ['Torch bujhi… to wo daudti hai.','Torch off… and she runs.'],
  ['GENERATOR — E DABAO','GENERATOR — PRESS E'],
  ['Sab parts mil gaye. Generator ke paas jao aur <b>E</b> dabao.','All parts found. Go to the generator and press <b>E</b>.'],
  ['GENERATOR KEY — GENERATOR KE PAAS CHAMAK RAHI HAI','GENERATOR KEY — GLINTING NEAR THE GENERATOR'],
  ['Generator ki chaabi yahin paas honi chahiye.','The generator key must be close by.'],
  ['SAB MIL GAYA — GENERATOR PE E DABAO','GOT EVERYTHING — PRESS E AT THE GENERATOR'],
  ['Poora hospital jal utha.','The whole hospital lit up.'],
  ['Lift bhi chal padi hogi.','The lift should be working too.'],
  ['Floor 7 pe jao','Go to Floor 7'],
  ['Lift ab chal rahi hai','The lift works now'],
  ['Ab lift chalti hai. Lift ke button pe <b>E</b> dabao... lekin mission ka naam yaad rakhna.',
   'The lift works now. Press <b>E</b> at the lift button... but remember the name of this mission.'],
  ['Lift lobby core me hai. EXIT sign ke paas.','The lift lobby is in the core, next to the EXIT sign.'],
  /* mission 4 */
  ['Radio sun','Listen to the radio'],
  ['Radio ke paas khade raho aur sunte raho — apne aap aage badhega.','Stay by the radio and keep listening — it moves on by itself.'],
  ['Radio mar gaya.','The radio died.'],
  ['Teen clue dhundo — Floor 7 aur 8','Find three clues — Floors 7 and 8'],
  ['Teen clue, do floors pe bate hue. Teer agle clue pe hai; doosre floor ka clue ho to pehle seedhi dikhayega.',
   'Three clues across two floors. The arrow points to the next — if it is on the other floor, it shows you the stairs first.'],
  ['Floor 8. Har bed darwaze ki taraf ghuma hua hai.','Floor 8. Every bed is turned towards the door.'],
  ['Nurse ne shikayat likhi thi. Kisi ne bheji hi nahi.','The nurse wrote a complaint. Nobody ever sent it.'],
  ['Bachcha kuch minute zinda tha. Maa bhi.','The baby was alive for a few minutes. So was the mother.'],
  ['Dus minute. Wahi dus minute wo baar baar jee rahi hai.','Ten minutes. She lives those same ten minutes over and over.'],
  ['Doctor ka office — Floor 9','Doctor’s office — Floor 9'],
  ['Floor 9 ke office me <b>cassette recorder</b> hai. <b>E</b> dabao aur tape poori suno.',
   'There is a <b>cassette recorder</b> in the Floor 9 office. Press <b>E</b> and listen to the whole tape.'],
  ['Wo peeche khadi hai. Attack nahi kar rahi.','She is standing behind you. Not attacking.'],
  ['Wo upar ki taraf ishaara kar rahi hai.','She is pointing upwards.'],
  ['Sabse upar','Top floor'],
  ['Yahan ki batti laal hai. Rona saaf sunai de raha hai.','The lights here are red. The crying is clear now.'],
  ['Corridor ke aakhir wale cradle tak jao','Go to the cradle at the end of the corridor'],
  ['Floor 10 — corridor ka sira','Floor 10 — end of the corridor'],
  ['Seedhi se <b>Floor 10</b> tak chadho. Upar batti laal ho jayegi — corridor ke aakhir wale <b>cradle</b> tak jao.',
   'Take the stairs up to <b>Floor 10</b>. The lights turn red up there — go to the <b>cradle</b> at the end of the corridor.'],
  ['Cradle khaali hai.','The cradle is empty.'],
  ['Prayer room me chhupo','Hide in the prayer room'],
  ['Wo peeche hai. <b>Prayer room</b> me ghus jao — teer wahin ja raha hai. Andar jaate hi darwaza band ho jayega.',
   'She is behind you. Get into the <b>prayer room</b> — the arrow leads there. The door shuts once you are inside.'],
  ['Bachche ka ID band uthao','Take the baby’s ID band'],
  ['Prayer room ke andar hi ID band pada hai. <b>E</b> dabao.','The ID band is inside the prayer room. Press <b>E</b>.'],
  ['Maternity ward. Floor 2. Neeche.','Maternity ward. Floor 2. Downstairs.'],
  /* mission 5 */
  ['Emergency power isolate karo','Isolate the emergency power'],
  ['Floor 9 ke duty/office side me purana <b>emergency breaker</b> hai. E dabao. Light band hote hi peeche mat rukna.',
   'There is an old <b>emergency breaker</b> on the duty/office side of Floor 9. Press E. When the lights die, keep moving.'],
  ['POWER ISOLATED — NURSE CALL SYSTEM AB MANUAL HAI','POWER ISOLATED — NURSE CALL IS NOW MANUAL'],
  ['Dead nurse-call panel test karo','Test the dead nurse-call panel'],
  ['Floor 7 ke nurse station ke paas teen dead call buttons hain. Order <b>2 → 1 → 3</b>. Galat press pe Naina corridor me aa sakti hai.',
   'Three dead call buttons by the Floor 7 nurse station. Order <b>2 → 1 → 3</b>. A wrong press can bring Naina into the corridor.'],
  ['Teen call active hue. Chautha call bina button ke baj raha hai.','Three calls went live. A fourth is ringing with no button.'],
  ['Radiology interlock reset karo','Reset the radiology interlocks'],
  ['Floor 5 OT/Radiology me teen interlock points hain. Har reset ke baad corridor zyada dangerous hoga.',
   'Three interlock points in the Floor 5 OT/Radiology wing. Each reset makes the corridor more dangerous.'],
  ['Maternity seal retrieve karo','Retrieve the maternity seal'],
  ['Floor 3 records room me sealed ward register pada hai. Use uthao; uske baad seedha Floor 2 jao.',
   'The sealed ward register is in the Floor 3 records room. Take it, then go straight to Floor 2.'],
  ['Seal mil gaya. Ab Floor 2. Ritual room.','Got the seal. Now Floor 2. The ritual room.'],
  ['Floor 2 tak utro','Go down to Floor 2'],
  ['Seedhi se <b>Floor 2</b> tak utro. Ab Naina full hunt mode me hai. Sprint ko seedhi line me waste mat karo.',
   'Take the stairs down to <b>Floor 2</b>. Naina is hunting at full strength now. Don’t waste your sprint on straight lines.'],
  ['Maternity corridor. Is darwaze ke baad koi safe checkpoint nahi.','Maternity corridor. No safe checkpoint past this door.'],
  ['NAINA NE BED KO DHAKKA MARA — RASTA KHUL RAHA HAI!','NAINA SHOVED THE BED — THE WAY IS OPENING!'],
  ['ROOM ABHI LOCK HAI — BED HATNE KE BAAD HI ENTRY MILEGI','ROOM LOCKED — YOU CAN ONLY GET IN ONCE THE BED MOVES'],
  ['BED DOOR KO BLOCK KAR RAHA HAI — NAINA KE CHARGE KA INTEZAAR KARO','A BED BLOCKS THE DOOR — WAIT FOR NAINA TO CHARGE IT'],
  ['CHHAT PAR KUCH HIL RAHA HAI...','SOMETHING IS MOVING ON THE CEILING...'],
  ['MANTRA SHURU — NAINA AB DEHLEEZ KE ANDAR NAHI AA SAKTI','MANTRA BEGUN — NAINA CANNOT CROSS THE THRESHOLD'],
  ['Floor 9. Corridor ke aakhir pe ek parchhai latki hui hai.','Floor 9. A shadow hangs at the end of the corridor.'],
  ['Floor 8. Saare bed darwaze ki taraf ghume hue hain.','Floor 8. All the beds are turned towards the door.'],
  ['Floor 7. Peeche ki battiyan ek ek karke bujh rahi hain.','Floor 7. The lights behind you are going out one by one.'],
  ['Floor 6. Chhat me kuch rengne ki aawaz hai.','Floor 6. Something is crawling inside the ceiling.'],
  ['Floor 4. Wo khidkiyon ke peeche se dekh rahi hai.','Floor 4. She is watching from behind the windows.'],
  ['Floor 3. Guzarte hi darwaze band ho rahe hain.','Floor 3. Doors slam shut as you pass.'],
  ['Floor 2. Bilkul chup.','Floor 2. Dead silent.'],
  /* mission 6 */
  ['Maternity Ward ke havan kund tak pahucho','Reach the havan kund in the Maternity Ward'],
  ['Floor 2 — Naina ritual rokegi','Floor 2 — Naina will try to stop the ritual'],
  ['Tum <b>Floor 2</b> par ho. Maternity Ward ka darwaza khula hai, lekin Naina last corridor ko aggressively defend karegi. Uske rush ko dodge karke havan room ke andar ghuso.',
   'You are on <b>Floor 2</b>. The Maternity Ward door is open, but Naina will guard the last corridor hard. Dodge her rush and get into the havan room.'],
  ['FLOOR 2 — DARWAZA KHULA HAI. NAINA KO DODGE KARKE HAVAN ROOM ME GHUSO.','FLOOR 2 — THE DOOR IS OPEN. DODGE NAINA AND GET INTO THE HAVAN ROOM.'],
  ['HAVAN ROOM — NAINA DEHLEEZ KE ANDAR NAHI AA SAKTI','HAVAN ROOM — NAINA CANNOT CROSS THE THRESHOLD'],
  ['Cradle ke chaaro taraf paanch cheezein rakho','Place five items around the cradle'],
  ['Paanchon saaman tumhare paas hain. Cradle ke paas khade hoke <b>E</b> dabao — ek-ek karke rakhte jao (0/5).',
   'You have all five items. Stand by the cradle and press <b>E</b> to place them one by one (0/5).'],
  ['Paanchon cheezein cradle ke chaaro taraf.','All five items around the cradle.'],
  ['Ritual shuru. Ab mantra nahi rukna chahiye.','The ritual has begun. The mantra must not stop.'],
  ['Ritual beech me hi toot gaya.','The ritual broke halfway.'],
  ['Wo aa gayi.','She is here.'],
  ['Stage 1 — teeno diye phir se jalao','Stage 1 — relight all three lamps'],
  ['Teen <b>diye</b> bujh gaye. Har diye ke paas jaake <b>E</b> dabao. Wo ring me ghoom rahi hai — uske paas mat jao.',
   'Three <b>lamps</b> went out. Go to each and press <b>E</b>. She is circling the ring — keep away from her.'],
  ['Diye bujh gaye. Teeno phir jalao.','The lamps went out. Relight all three.'],
  ['Ek diya phir bujh gaya — jaldi se phir jalao!','A lamp went out again — relight it, quick!'],
  ['Stage 2 — do cheezein gayab ho gayin','Stage 2 — two items have vanished'],
  ['Do cheezein hat gayi hain. Teer unhe dhoondh ke la dega — uthao aur wapas cradle pe <b>E</b>.',
   'Two items have been moved. The arrow will find them — pick them up and press <b>E</b> back at the cradle.'],
  ['Do cheezein aas paas ke kamron me hain. Laao.','Two items are in the nearby rooms. Bring them back.'],
  ['Stage 3 — teen jagah ghanti bajao','Stage 3 — ring the bell in three places'],
  ['Teen alag jagah <b>ghanti</b> bajani hai. Teer ke peeche jao aur har jagah <b>E</b> dabao.',
   'Ring the <b>bell</b> in three different places. Follow the arrow and press <b>E</b> at each.'],
  ['Teen nishaan. Har ek pe ghanti bajao.','Three marks. Ring the bell at each one.'],
  ['Usse jawab do','Answer her'],
  ['Ab sirf jawab dena hai. Screen pe jo option aaye, <b>soch ke</b> chuno — ending isi pe tiki hai.',
   'Now you only have to answer. Choose <b>carefully</b> — the ending depends on it.'],
  ['Sab ruk gaya. Wo phir se insaan lag rahi hai.','Everything stopped. She looks human again.'],
  ['Woh zinda paida hua tha.','He was born alive.'],
  ['Wo pehli baar muskurai — bina darawni lage.','For the first time she smiled — and it wasn’t frightening.'],
  /* epilogue */
  ['Baarish ruk gayi hai','The rain has stopped'],
  ['Baarish ruk gayi hai. Pehli baar koi awaaz nahi aa rahi.','The rain has stopped. For the first time, there is no sound.'],
  ['Uska bhoot khatam nahi hua.','Her ghost is not gone.'],
  ['Dev usse saare kaagaz de deta hai.','Dev hands him all the papers.'],
  ['Uska intezaar khatam hua.','Her wait is over.'],
  ['Dev ki jeb se bachche ka ID band zameen pe gir jaata hai.','The baby’s ID band falls from Dev’s pocket.'],
  ['Par wo band to ritual me chhod aaya tha.','But he had left that band at the ritual.'],
  ['Officer use uthata hai. Padhta hai. Hospital ki taraf dekhta hai.','The officer picks it up. Reads it. Looks up at the hospital.'],
  ['Upar ek khidki jal uthi hai. Wahan koi khadi hai — Naina nahi.','A window lights up high above. Someone stands there — not Naina.'],
  ['Phir bachche ke rone ki ek halki si awaaz aati hai.','Then comes the faint sound of a baby crying.'],
  ['Jo bhatak rahi thi... woh chali gayi.','The one who wandered... is gone.'],
  /* ambience */
  ['Kisi ward me call-bell baj rahi hai.','A call bell is ringing in one of the wards.'],
  ['Lift khul gayi. Andar kuch nahi hai.','The lift opened. There is nothing inside.'],
  ['Koi corridor paar kar gaya.','Someone crossed the corridor.'],
  ['Aage ki battiyan ek ek karke bujh rahi hain.','The lights ahead are going out one by one.'],
  ['Kahin koi darwaza zor se band hua.','Somewhere, a door slammed.'],
  ['Kahin trolley ke pahiye apne aap ghoom rahe hain.','Somewhere, a trolley’s wheels are turning by themselves.'],
  ['Wheelchair apne aap daud padi.','A wheelchair rolled away by itself.'],
  ['Gate peeche band ho gaya.','The gate shut behind you.'],
  /* HUD, menus, guide */
  ['DHEEMA','SLOW'],['TEZ','FAST'],
  ['BHAAG RAHE HO','RUNNING'],['CHAL RAHE HO','WALKING'],
  ['UPAR','UP'],['NEECHE','DOWN'],['upar chadho','go up'],['neeche utro','go down'],
  ['YAHI HAI','HERE'],
  ['Hospital ke darwaze tak chalo aur <b>E</b> dabao.','Walk to the hospital doors and press <b>E</b>.'],
  ['IGMC ko bahar explore karo — E se enter','Explore the grounds — E to enter IGMC'],
  ['Main entrance · E dabao','Main entrance · press E'],
  ['Baayen <b>joystick</b> chalne ke liye · daayen ungli se <b>dekho</b> · <b>E</b> kaam · <b>🔦</b> torch · <b>RUN</b> bhaagne ke liye · <b>?</b> hint',
   'Left <b>stick</b> to move · right thumb to <b>look</b> · <b>E</b> use · <b>🔦</b> torch · <b>RUN</b> sprint · <b>?</b> hint'],
  ['<b>WASD</b> chalo · <b>SHIFT</b> bhaago · <b>F</b> torch · <b>E</b> kaam karo · <b>H</b> hint',
   '<b>WASD</b> move · <b>SHIFT</b> run · <b>F</b> torch · <b>E</b> use · <b>H</b> hint'],
  ['KOI SAVE NAHI MILA','NO SAVE FOUND'],['SAVE HO GAYA','GAME SAVED'],['SAVE NAHI HO PAYA','SAVE FAILED'],
  ['SAAMAAN','ITEMS'],['SAANS LE','BREATHE'],['MAUT','YOU DIED'],['SUBAH','MORNING'],['Phir se khelo','Play again'],
  ['Mission chuno','Select mission'],['Headphones lagao.','Play with headphones.']
];
const RI_EN_RULES=[
  [/^CELL DEAD — NAYA CELL (\d+)s BAAD$/i, m=>'CELL DEAD — NEW CELL IN '+m[1]+'s'],
  [/^NAYA CELL (\d+)s BAAD LAGEGA$/i, m=>'NEW CELL IN '+m[1]+'s'],
  [/^MILA — ([\s\S]+)$/, m=>'FOUND — '+riEN(m[1])],
  [/^Rone ki aawaz \((\d+)\/3\)$/i, m=>'The crying ('+m[1]+'/3)'],
  [/^<b>([\s\S]+?)<\/b> dhundo — teer seedha usi item pe ja raha hai\. Basement me hi hai\.$/,
    m=>'Find the <b>'+riEN(m[1])+'</b> — the arrow points straight to it. It is here in the basement.'],
  [/^CHAHIYE: ([\s\S]*)$/, m=>'NEED: '+m[1].split(' · ').map(riEN).join(' · ')],
  [/^SAMAN LAGA — (\d+) HIT AUR$/, m=>'HIT — '+m[1]+' MORE AND YOU FALL'],
  [/^NAINA RITUAL ROOM DEFEND KAR RAHI HAI — ATTEMPT (\d+)$/, m=>'NAINA IS GUARDING THE RITUAL ROOM — ATTEMPT '+m[1]],
  [/^<b>E<\/b> — ([\s\S]+) RAKHO$/, m=>'<b>E</b> — PLACE THE '+riEN(m[1])],
  [/^CHECKPOINT SE SHURU — MISSION (\d+)$/, m=>'CHECKPOINT — MISSION '+m[1]],
  [/^([\s\S]*?)<br\/><br\/>Mission <em>(\d+)<\/em> — ([\s\S]*)$/, m=>riEN(m[1])+'<br/><br/>Mission <em>'+m[2]+'</em> — '+m[3]],
  [/^Wahin se phir — <em>(\d+)<\/em> mauke bache hain$/, m=>'Retry — <em>'+m[1]+'</em> lives left'],
  [/^(\d+) MAUKE BACHE HAIN$/, m=>m[1]+' LIVES LEFT'],
  [/^([\s\S]+) — seedhi (chadho|utro)$/i, m=>m[1]+' — take the stairs '+(/chadho/i.test(m[2])?'up':'down')],
  [/^Seedhi ka darwaza — ([\s\S]+) (UPAR|NEECHE)$/i, m=>'Stairwell — '+m[1]+' '+(/upar/i.test(m[2])?'UP':'DOWN')],
  [/^Objective: <b>([\s\S]*)<\/b>\. Aage badho, agla step apne aap khulega\.$/, m=>'Objective: <b>'+riEN(m[1])+'</b>. Keep moving — the next step unlocks by itself.'],
  [/^Is floor pe aur kuch nahi\.[\s\S]*<b>(upar chadho|neeche utro)<\/b>\.$/,
    m=>'Nothing else on this floor. The arrow points to the <b>stairs</b> — open the door with <b>E</b> and go <b>'+(m[1]==='upar chadho'?'up':'down')+'</b>.'],
  [/^<b>([\s\S]+?)<\/b> saamne hi hai — crosshair uspe le jao aur <b>E<\/b> dabao\.$/, m=>'<b>'+riEN(m[1])+'</b> is right in front of you — aim at it and press <b>E</b>.'],
  [/^Teer ke peeche chalo — <b>([\s\S]+?)<\/b>, (\d+) m\. Paas jaake <b>E<\/b> dabao\.$/, m=>'Follow the arrow — <b>'+riEN(m[1])+'</b>, '+m[2]+' m. Get close and press <b>E</b>.'],
  [/^([\s\S]*?)<span>(YAHI HAI|[\d+]+ m)<\/span>$/, m=>riEN(m[1]).toUpperCase()+'<span>'+(m[2]==='YAHI HAI'?'HERE':m[2])+'</span>'],
  [/^LOAD FAILED — ([\s\S]*)<br\/><br\/>Browser WebGL support karta hai ya nahi, check karo\.$/, m=>'LOAD FAILED — '+m[1]+'<br/><br/>Check that your browser supports WebGL.'],
  [/^<span class="who">([\s\S]*?)<\/span>([\s\S]*)$/, m=>'<span class="who">'+riEN(m[1])+'</span>'+riEN(m[2])]
];
const riENn=s=>s.replace(/[\s ]+/g,' ').trim();
const RI_EN=new Map(), RI_ENU=new Map(), RI_ENC=new Map();
for(const [a,b] of RI_EN_PAIRS){ const k=riENn(a); RI_EN.set(k,b); RI_ENU.set(k.toUpperCase(),b.toUpperCase());
  const m=/^<b>E<\/b> — (.+)$/.exec(k), n=/^<b>E<\/b> — (.+)$/.exec(b); if(m&&n) RI_ENU.set(m[1].toUpperCase(),n[1].toUpperCase()); }
function riENx(s){
  const k=riENn(s); if(!k) return s;
  let r=RI_EN.get(k); if(r!==undefined) return r;
  r=RI_ENU.get(k); if(r!==undefined) return r;
  for(const [re,f] of RI_EN_RULES){ const m=re.exec(k); if(m) return f(m); }
  if(k.indexOf('<')<0) return s;
  /* built from several strings: translate each run of text between tags */
  return s.replace(/>([^<]+)</g,(all,t)=>{ const n=riENn(t); if(!n) return all;
    const e=RI_EN.get(n)||RI_ENU.get(n); if(e===undefined) return all;
    const lead=/^\s*/.exec(t)[0], trail=/\s*$/.exec(t)[0]; return '>'+lead+e+trail+'<'; })
    .replace(/^([^<]+)</,(all,t)=>{ const n=riENn(t), e=RI_EN.get(n)||RI_ENU.get(n); return e===undefined?all:e+(/\s$/.test(t)?' ':'')+'<'; })
    .replace(/>([^<>]+)$/,(all,t)=>{ const n=riENn(t), e=RI_EN.get(n)||RI_ENU.get(n); return e===undefined?all:'>'+(/^\s/.test(t)?' ':'')+e; });
}
function riEN(s){
  if(typeof s!=='string'||s.length<2||s.length>4000||!/[A-Za-z]{2}/.test(s)) return s;
  let r=RI_ENC.get(s); if(r!==undefined) return r;
  r=riENx(s); if(RI_ENC.size>4000) RI_ENC.clear(); RI_ENC.set(s,r); return r;
}
{ /* every text write into the page goes through the translator */
  const skip=el=>{ const n=el&&el.nodeName; return n==='STYLE'||n==='SCRIPT'; };
  const ih=Object.getOwnPropertyDescriptor(Element.prototype,'innerHTML');
  if(ih&&ih.set) Object.defineProperty(Element.prototype,'innerHTML',{configurable:true,enumerable:ih.enumerable,
    get(){ return ih.get.call(this); }, set(v){ ih.set.call(this,skip(this)?v:riEN(v)); }});
  const tc=Object.getOwnPropertyDescriptor(Node.prototype,'textContent');
  if(tc&&tc.set) Object.defineProperty(Node.prototype,'textContent',{configurable:true,enumerable:tc.enumerable,
    get(){ return tc.get.call(this); }, set(v){ tc.set.call(this,skip(this)?v:riEN(v)); }});
}

/* ═════════════ quieter HUD ═════════════
   The screen used to carry the mission label, a running clock, two meters
   with numbers, the objective and its sub-line and the inventory all at
   once. Now the objective shows when it changes and fades, the inventory
   shows when something is picked up, TAB brings both back for a moment,
   and the torch charge is one thin bar that only speaks up when it is low. */
function riHudPeek(ms){
  const h=document.getElementById('hud'); if(!h) return;
  h.classList.add('peek'); clearTimeout(riHudPeek._t);
  riHudPeek._t=setTimeout(()=>h.classList.remove('peek'),ms||6500);
}
function riHudInit(){
  const watch=(id,ms)=>{ const el=document.getElementById(id); if(!el) return;
    new MutationObserver(()=>riHudPeek(ms)).observe(el,{childList:true,characterData:true,subtree:true}); };
  watch('objective',7000); watch('invlist',4500);
  addEventListener('keydown',e=>{ if(e.code==='Tab') riHudPeek(4500); },true);
  const bat=document.getElementById('batfill'), bl=document.getElementById('botleft');
  const cells=document.getElementById('cells'); let lastCells=null;
  if(bat&&bl) setInterval(()=>{ const w=parseFloat(bat.style.width)||100; bl.classList.toggle('low',w<30);
    const c=cells?cells.firstChild&&cells.firstChild.nodeValue:null, n=c?c.split(' ')[0]:null;
    if(lastCells!==null&&n!==lastCells) riHudPeek(4500); lastCells=n; },400);
  const tb=document.getElementById('tbH'); if(tb) tb.addEventListener('pointerdown',()=>riHudPeek(4500));
}
const RI_HUD_CSS=`
#topleft{letter-spacing:.12em;line-height:1.75}
#misslab,#mtime,#mhint,#subobj{display:none!important}
#floorlab{font-size:11px;letter-spacing:.3em;opacity:.8}
#objective{font-size:12.5px;letter-spacing:.06em;transition:opacity 1.2s ease;opacity:0}
#hud.peek #objective{opacity:1;transition:opacity .25s ease}
#botleft{gap:0}
#botleft .meter:nth-child(2){display:none}
#botleft .meter span:first-child,#batnum{display:none}
#botleft .meterbar{width:86px;height:3px;border:0;padding:0;background:rgba(232,227,216,.12)}
#botleft{opacity:.38;transition:opacity .6s}
#botleft.low{opacity:1}
#inv{opacity:0;transition:opacity .8s ease;letter-spacing:.14em}
#hud.peek #inv{opacity:1;transition:opacity .25s ease}
#inv .h{letter-spacing:.2em}
#prompt{letter-spacing:.14em}
#subs{letter-spacing:.03em;font-size:15px;line-height:1.5}
#subs .who{letter-spacing:.2em;font-size:10px;opacity:.85}
#toast{letter-spacing:.14em}
#hintbtn span{display:none}
#hintbtn{padding:6px 8px!important;opacity:.55}
#hintbox{letter-spacing:.03em;font-size:12px;line-height:1.55}
#gdist{letter-spacing:.14em}
body.finalstretch #objective{opacity:.48!important}
`;

/* the pack's 30 wall notices, redrawn in English in the same atlas layout */
function riSignAtlas(){
  const W=2560, H=1536, CW=512, CH=256, c=document.createElement('canvas'); c.width=W; c.height=H;
  const g=c.getContext('2d');
  const P={teal:['#1d5068','#e8e4d6','#173e52'], green:['#1f6a4f','#dfe7dc','#184f3b'], red:['#8f2b2b','#ecdcd2','#6e1f1f'],
           orange:['#b2522c','#efe3d3','#7c3a20'], blue:['#23496b','#dde3ea','#1b3550']};
  const B=[['teal','PLEASE MAINTAIN SILENCE'],['green','WELCOME TO IGMC'],['red','NO BIDI OR TOBACCO ON THE PREMISES'],['green','PREVENT HIV — STAY SAFE'],
    ['orange','SAVE THE GIRL CHILD, EDUCATE HER'],['red','NO SMOKING'],['green','CLEAN HOSPITAL, HEALTHY SOCIETY'],['green','WASH YOUR HANDS, STOP INFECTION'],
    ['green','WEAR A MASK, STAY SAFE'],['orange','DONATE BLOOD, SAVE A LIFE'],['red','EMERGENCY DEPARTMENT'],['blue','O.P.D.'],['blue','X-RAY DEPARTMENT'],
    ['blue','M.R.I. ROOM'],['blue','CT SCAN'],['blue','PATHOLOGY LAB'],['blue','BLOOD BANK'],['blue','MEDICINE DISPENSARY'],['blue','TOILETS'],
    ['blue','FEMALE WARD'],['blue','MALE WARD'],['red','I.C.U.'],['red','OPERATION THEATRE'],['teal','PLEASE WAIT FOR YOUR TURN'],
    ['teal','NO MEDICINE WITHOUT A DOCTOR’S ADVICE'],['teal','DO NOT LITTER THE HOSPITAL'],['green','USE THE DUSTBIN'],['teal','VISITING HOURS  4 PM – 6 PM'],
    ['red','IN CASE OF FIRE USE THE STAIRS'],['red','AUTHORISED STAFF ONLY']];
  let seed=7; const rnd=()=>{ seed=(seed*16807)%2147483647; return seed/2147483647; };
  const wrap=(t,max,font)=>{ g.font=font; const w=t.split(' '), L=[]; let cur='';
    for(const x of w){ const n=cur?cur+' '+x:x; if(g.measureText(n).width>max&&cur){ L.push(cur); cur=x; } else cur=n; } if(cur) L.push(cur); return L; };
  B.forEach(([pal,txt],i)=>{
    const [hd,bg,ink]=P[pal], x0=(i%5)*CW, y0=((i/5)|0)*CH;
    g.fillStyle='#e3ddcf'; g.fillRect(x0,y0,CW,CH);
    const x=x0+10, y=y0+10, w=CW-20, h=CH-20;
    g.fillStyle=bg; g.fillRect(x,y,w,h);
    g.strokeStyle=ink; g.lineWidth=5; g.strokeRect(x+2.5,y+2.5,w-5,h-5);
    g.fillStyle=hd; g.fillRect(x,y,w,34);
    g.fillStyle='#f3efe4'; g.font='600 17px Arial,Helvetica,sans-serif'; g.textAlign='left'; g.textBaseline='middle';
    g.fillText('IGMC · SHIMLA',x+14,y+18);
    g.fillStyle=hd; g.beginPath(); g.roundRect?g.roundRect(x+14,y+62,78,106,9):g.rect(x+14,y+62,78,106); g.fill();
    g.fillStyle='#f6f2e8'; g.fillRect(x+44,y+81,18,68); g.fillRect(x+19+10,y+106,48,18);
    let fs=46, L; do{ L=wrap(txt,w-128,'700 '+fs+'px Arial,Helvetica,sans-serif'); fs-=2; }while((L.length>2||L.length*fs*1.16>118)&&fs>24);
    fs+=2; g.font='700 '+fs+'px Arial,Helvetica,sans-serif'; g.fillStyle=ink; g.textBaseline='alphabetic';
    const top=y+46+(118-L.length*fs*1.16)/2+fs*.92; L.forEach((l,k)=>g.fillText(l,x+110,top+k*fs*1.16));
    g.strokeStyle=hd; g.lineWidth=2; g.beginPath(); g.moveTo(x+110,y+h-44); g.lineTo(x+w-16,y+h-44); g.stroke();
    g.fillStyle=ink; g.font='600 14px Arial,Helvetica,sans-serif'; g.fillText('PATIENT SAFETY & PUBLIC AWARENESS',x+110,y+h-22);
    for(let k=0;k<120;k++){ g.fillStyle='rgba(70,55,35,'+(rnd()*.1).toFixed(3)+')'; g.fillRect(x+rnd()*w,y+rnd()*h,1+rnd()*3,1+rnd()*2); }
    for(let k=0;k<6;k++){ g.strokeStyle='rgba(60,45,30,'+(rnd()*.14).toFixed(3)+')'; g.lineWidth=1; g.beginPath();
      const sx=x+rnd()*w, sy=y+rnd()*h; g.moveTo(sx,sy); g.lineTo(sx+(rnd()-.5)*60,sy+(rnd()-.5)*18); g.stroke(); }
  });
  const t=new THREE.CanvasTexture(c); t.colorSpace=THREE.SRGBColorSpace; return t;
}
