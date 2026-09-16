**Midas M32 / Behringer X32**

This Module controls the Midas M32 series and Behringer X32 series of consoles
go over to [Midas](http://www.musictri.be/Categories/Midas/Mixers/Digital/M32/p/P0B3I) or [Behringer](http://www.musictri.be/Categories/Behringer/Mixers/Digital/X32/p/P0ASF)
to get additional information about the consoles and their capabilities.

We support the following actions:

| Console Function                                               | What it does                                                                                                       |
| -------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| Channel, AuxIn, FxReturn, Bus, Matrix, Main Stereo, Mono mute  | Mutes or Unmutes the selected Channel, AuxIn, FxReturn, Bus, Matrix, Main Stereo, Mono                             |
| Channel, AuxIn, FxReturn, Bus, Matrix. Main Stereo, Mono fader | Sets the level of the selected Channel, AuxIn, FxReturn, Bus, Matrix, Main Stereo, Mono fader                      |
| Channel, AuxIn, FxReturn, Bus, Matrix, Main Stereo, Mono label | Sets the text label in the scribble strip of the selected Channel, AuxIn, FxReturn, Bus, Matrix, Main Stereo, Mono |
| Channel, AuxIn, FxReturn, Bus, Matrix, Main Stereo, Mono       | Sets the color of the scribble strip of the selected Channel, AuxIn, FxReturn, Bus, Matrix, Main Stereo, Mono      |
| Channel, AuxIn, FxReturn Send mute                             | Mutes or Unmutes the selected Channel, AuxIn, FxReturn to Bus or Main send                                         |
| Channel, AuxIn, FxReturn Send level                            | Sets the level of the selected Channel, AuxIn, FxReturn to Bus or Main send                                        |
| Bus, Main Send Stereo, Mono mute                               | Mutes or Unmutes the selected Bus or Main to Matrix send                                                           |
| Bus, Main Stereo, Mono Send level                              | Sets the level of the selected Bus or Main to Matrix send                                                          |
| Mute Group                                                     | Turns the selected mute group on or off                                                                            |
| Channel set trim                                               | Sets the trim of the selected channel                                                                              |
| Channel adjust trim                                            | Raises or lowers the trim of the selected channel by a configurable dB amount                                      |
| Headamp set gain                                               | Sets the gain of the selected headamp                                                                              |
| Headamp adjust gain                                            | Raises or lowers the selected headamp gain by a configurable dB amount                                             |
| Load Console Cue                                               | Loads the given cue from the consoles internal cue list 0-99                                                       |
| Load Console Scene                                             | Loads the given scene from the consoles internal scene list 0-99                                                   |
| Load Console Snippet                                           | Loads the given snippet from the consoles internal snippet list 0-99                                               |
| Tape Operation                                                 | Stop,Play,PlayPause,Record,RecordPause,Fast Forward,Rewind of the tape Deck                                        |
| Talkback Talk                                                  | Talkback talk on/off                                                                                               |

for additional actions please raise a feature request at [github](https://github.com/bitfocus/companion-module-behringer-x32)

If setting a fade duration, running another action for that value will cancel the first, and run the new one from the current level. If you wish to cancel a fade, run an 'Adjust fader level' with an offset of 0.

The **Channel clipping (peak hold)** feedback evaluates only the input channels selected in configured feedbacks. It
uses one low-bandwidth subscription limited to the 32 input-meter values, and only while at least one clipping
feedback is active. The default clipping threshold is 0 dBFS and the default peak hold is 1000 ms; both values are
configurable per feedback.

Live physical headamp gain is available in dB through Companion variables for Local inputs 1-8. Variable names
run from `headamp_local_01_gain` through `headamp_local_08_gain`. These variables represent physical preamps and
do not automatically follow channel input routing. Mixer-side changes normally update immediately through OSC change
notifications; the module also refreshes all eight values every three seconds and after reconnecting.
