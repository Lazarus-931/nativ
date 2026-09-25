# Recordings & Privacy

Audio has two different capture flows. **Record** creates a persistent file in your local Audio Library. **Dictation** captures only enough audio to insert text into another app; its raw audio is deleted after five minutes or when Nativ quits. Dictation transcripts and activity history remain on your Mac until you delete them.

When you complete a saved recording, Nativ keeps its audio and attempts to transcribe it with your selected speech-to-text model. A language model can then turn the transcript into summarized notes. The Nativ server must be running for transcription and summarization. If processing fails, the saved audio can still be available in **Library** for another attempt.

The permissions depend on what you do:

| Permission | Needed for |
| --- | --- |
| **Microphone** | Recording your voice. |
| **Screen & System Audio Recording** | Including audio playing in other apps. |
| **Accessibility** | Detecting the global dictation shortcut and inserting text into other apps. |

Deleting a saved recording also permanently deletes its transcript and summary. Export or copy anything you need first. To open the storage folder, select **Audio Library** at the top of Audio.
