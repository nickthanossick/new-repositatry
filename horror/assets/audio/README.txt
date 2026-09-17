SHIMLA HORROR: IGMC — recorded audio goes here
==============================================

The game works with nothing in this folder: every cue has a synthesised
WebAudio fallback. Drop the FAL pack's MP3s in and they take over, one cue
at a time, with no code change.

Expected layout — exactly what the pack's download script produces:

  assets/audio/sfx/01_corridor_ambience.mp3
  assets/audio/sfx/08_naina_scream.mp3
  assets/audio/sfx/28_jumpscare_stinger.mp3
  assets/audio/dialogue/naina/07_jhooth_bola_tha.mp3
  assets/audio/dialogue/pandit/03_ab_le_ja.mp3
  assets/audio/dialogue/police/02_khatam.mp3
  assets/audio/dialogue/doctor/01_bachcha_nahi_raha.mp3

To fetch them:

  cd <pack folder>
  chmod +x scripts/download_all_mac_linux.sh && ./scripts/download_all_mac_linux.sh
  cp -r audio/* <repo>/horror/assets/audio/

(Windows: run scripts/download_all_windows.ps1, then copy the `audio` folder.)

Then rebuild the single-file version so the clips get inlined into it:

  node tools/build-single.js

A file that is missing simply fails once and that cue keeps using the
synthesised sound for the rest of the session. Names are matched exactly,
so do not rename anything.
